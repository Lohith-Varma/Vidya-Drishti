const prisma = require('../prismaClient')
const codingStatsService = require('../services/codingStatsService')
const { updateStats, recalcLeaderboardRanks } = require('../models/User')

// ── GET /api/tests ─────────────────────────────────────────
const getAllTests = async (req, res) => {
  try {
    const where = {}
    if (req.user.role === 'STUDENT') {
      where.status = { in: ['PUBLISHED', 'ENDED'] }
    }

    const tests = await prisma.assessment.findMany({
      where,
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { submissions: true, questions: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const enriched = tests.map(t => ({
      ...t,
      questionCount:   t._count.questions,
      submissionCount: t._count.submissions
    }))

    res.json(enriched)
  } catch (err) {
    console.error('getAllTests error:', err)
    res.status(500).json({ message: 'Failed to fetch tests.' })
  }
}

// ── GET /api/tests/:id ─────────────────────────────────────
const getTestById = async (req, res) => {
  try {
    const isAdmin   = req.user.role === 'ADMIN'
    const tcFilter  = isAdmin ? {} : { hidden: false }

    const test = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, name: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: { testCases: { where: tcFilter } }
        },
        _count: { select: { submissions: true } }
      }
    })

    if (!test) return res.status(404).json({ message: 'Assessment not found.' })
    res.json(test)
  } catch (err) {
    console.error('getTestById error:', err)
    res.status(500).json({ message: 'Failed to fetch test.' })
  }
}

// ── POST /api/tests ────────────────────────────────────────
const createTest = async (req, res) => {
  try {
    const {
      title, subject, description, duration,
      startDate, endDate, language = 'multiple',
      proctored = false, questions = []
    } = req.body

    if (!title || !duration || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, duration, start and end dates are required.' })
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        subject:     subject     || null,
        description: description || null,
        duration:    Number(duration),
        startDate:   new Date(startDate),
        endDate:     new Date(endDate),
        language,
        proctored: Boolean(proctored),
        status: 'PUBLISHED',
        createdById: req.user.id,
        questions: {
          create: questions.map((q, idx) => ({
            title:       q.title,
            description: q.description || '',
            difficulty:  (q.difficulty || 'medium').toUpperCase(),
            marks:       Number(q.marks)       || 10,
            timeLimit:   Number(q.timeLimit)   || 1000,
            memoryLimit: Number(q.memoryLimit) || 256,
            constraints: q.constraints || null,
            order: idx,
            testCases: {
              create: (q.testCases || []).map(tc => ({
                input:  tc.input  || '',
                output: tc.output || '',
                hidden: Boolean(tc.hidden)
              }))
            }
          }))
        }
      },
      include: { questions: { include: { testCases: true } } }
    })

    // Recalculate maxScore from all question marks
    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 10), 0)
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { maxScore: totalMarks }
    })

    const final = await prisma.assessment.findUnique({
      where: { id: assessment.id },
      include: { questions: { include: { testCases: true } } }
    })
    res.status(201).json(final)
  } catch (err) {
    console.error('createTest error:', err)
    res.status(500).json({ message: 'Failed to create assessment.' })
  }
}

// ── PUT /api/tests/:id ─────────────────────────────────────
const updateTest = async (req, res) => {
  try {
    const { title, subject, description, duration, startDate, endDate, status } = req.body
    const updated = await prisma.assessment.update({
      where: { id: req.params.id },
      data: {
        ...(title       && { title }),
        ...(subject     !== undefined && { subject }),
        ...(description !== undefined && { description }),
        ...(duration    && { duration: Number(duration) }),
        ...(startDate   && { startDate: new Date(startDate) }),
        ...(endDate     && { endDate:   new Date(endDate) }),
        ...(status      && { status })
      }
    })
    res.json(updated)
  } catch (err) {
    console.error('updateTest error:', err)
    res.status(500).json({ message: 'Failed to update assessment.' })
  }
}

// ── DELETE /api/tests/:id ──────────────────────────────────
const deleteTest = async (req, res) => {
  try {
    await prisma.assessment.delete({ where: { id: req.params.id } })
    res.json({ message: 'Assessment deleted successfully.' })
  } catch (err) {
    console.error('deleteTest error:', err)
    res.status(500).json({ message: 'Failed to delete assessment.' })
  }
}

// ── POST /api/tests/run ────────────────────────────────────
const runCode = async (req, res) => {
  try {
    const { code, language, questionId, testCases, input } = req.body
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required.' })
    }

    let tcToRun = []
    if (input) {
      tcToRun = [{ input, output: null, hidden: false }]
    } else if (testCases && Array.isArray(testCases)) {
      tcToRun = testCases
    } else if (questionId) {
      const q = await prisma.question.findUnique({
        where: { id: questionId },
        include: { testCases: { where: { hidden: false } } }
      })
      tcToRun = q?.testCases || []
    }

    const result = await codingStatsService.executeCode({ code, language, testCases: tcToRun })
    res.json(result)
  } catch (err) {
    console.error('runCode error:', err)
    res.status(500).json({ message: 'Code execution failed.', error: err.message })
  }
}

// ── POST /api/tests/:id/questions/:questionId/submit ───────
const submitSolution = async (req, res) => {
  try {
    const { id: assessmentId, questionId } = req.params
    const { code, language } = req.body
    const studentId = req.user.id

    const [assessment, question] = await Promise.all([
      prisma.assessment.findUnique({ where: { id: assessmentId } }),
      prisma.question.findUnique({
        where: { id: questionId },
        include: { testCases: true }
      })
    ])

    if (!assessment) return res.status(404).json({ message: 'Assessment not found.' })
    if (!question)   return res.status(404).json({ message: 'Question not found.' })

    if (new Date() > new Date(assessment.endDate)) {
      return res.status(400).json({ message: 'Submission deadline has passed.' })
    }

    const execResult = await codingStatsService.executeCode({
      code, language,
      testCases: question.testCases
    })

    const { results = [], stdout = '' } = execResult
    const passed   = results.filter(r => r.passed).length
    const total    = results.length
    const allPass  = passed === total && total > 0
    const score    = total > 0 ? Math.round((passed / total) * question.marks) : 0

    const verdict =
      results.some(r => r.verdict === 'CE')  ? 'CE'  :
      results.some(r => r.verdict === 'TLE') ? 'TLE' :
      results.some(r => r.verdict === 'RE')  ? 'RE'  :
      allPass                                ? 'AC'  : 'WA'

    const submission = await prisma.submission.create({
      data: {
        code, language, verdict, score,
        executionTime: results[0]?.time || null,
        studentId, assessmentId, questionId,
        results: {
          create: results.map(r => ({
            passed:   r.passed,
            input:    r.input    || null,
            expected: r.expected || null,
            actual:   r.actual   || null,
            time:     r.time     || null,
            hidden:   r.hidden   || false
          }))
        }
      },
      include: { results: true }
    })

    // Async stats update (don't block response)
    updateStats(studentId)
      .then(() => recalcLeaderboardRanks())
      .catch(e => console.error('Stats update failed:', e))

    res.json({
      submissionId: submission.id,
      verdict, score,
      maxScore: question.marks,
      passed, total,
      results: submission.results,
      stdout
    })
  } catch (err) {
    console.error('submitSolution error:', err)
    res.status(500).json({ message: 'Submission failed.', error: err.message })
  }
}

// ── GET /api/tests/:id/submissions ────────────────────────
const getTestSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { assessmentId: req.params.id },
      include: {
        student:  { select: { id: true, name: true, rollNumber: true, department: true } },
        question: { select: { id: true, title: true, marks: true } },
        results:  { select: { passed: true, hidden: true } }
      },
      orderBy: { score: 'desc' }
    })

    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      select: { maxScore: true }
    })

    const studentMap = {}
    submissions.forEach(s => {
      if (!studentMap[s.studentId]) {
        studentMap[s.studentId] = {
          studentId:    s.studentId,
          studentName:  s.student.name,
          rollNumber:   s.student.rollNumber,
          department:   s.student.department,
          score:        0,
          maxScore:     assessment?.maxScore || 0,
          submittedAt:  s.submittedAt,
          submissions:  []
        }
      }
      studentMap[s.studentId].score = Math.max(studentMap[s.studentId].score, s.score)
      studentMap[s.studentId].submissions.push(s)
    })

    res.json(Object.values(studentMap))
  } catch (err) {
    console.error('getTestSubmissions error:', err)
    res.status(500).json({ message: 'Failed to fetch submissions.' })
  }
}

// ── GET /api/tests/:id/leaderboard ────────────────────────
const getTestLeaderboard = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { assessmentId: req.params.id },
      include: { student: { select: { name: true, rollNumber: true, avatar: true } } },
      orderBy: [{ score: 'desc' }, { submittedAt: 'asc' }]
    })

    const best = {}
    submissions.forEach(s => {
      if (!best[s.studentId] || s.score > best[s.studentId].score) {
        best[s.studentId] = s
      }
    })

    const ranked = Object.values(best)
      .sort((a, b) => b.score - a.score)
      .map((s, i) => ({ rank: i + 1, ...s }))

    res.json(ranked)
  } catch (err) {
    console.error('getTestLeaderboard error:', err)
    res.status(500).json({ message: 'Failed to fetch leaderboard.' })
  }
}

// ── GET /api/tests/student/:studentId/results ─────────────
const getStudentTestResults = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where:   { studentId: req.params.studentId },
      include: { assessment: { select: { id: true, title: true, subject: true, maxScore: true, duration: true } } },
      orderBy: { submittedAt: 'desc' }
    })

    // Best score per assessment
    const best = {}
    submissions.forEach(s => {
      if (!best[s.assessmentId] || s.score > best[s.assessmentId].score) {
        best[s.assessmentId] = s
      }
    })

    const results = Object.values(best).map(s => ({
      id:          s.id,
      testId:      s.assessmentId,
      title:       s.assessment.title,
      subject:     s.assessment.subject,
      score:       s.score,
      maxScore:    s.assessment.maxScore,
      duration:    s.assessment.duration,
      submittedAt: s.submittedAt,
      verdict:     s.verdict
    }))

    res.json(results)
  } catch (err) {
    console.error('getStudentTestResults error:', err)
    res.status(500).json({ message: 'Failed to fetch student results.' })
  }
}

module.exports = {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  runCode,
  submitSolution,
  getTestSubmissions,
  getTestLeaderboard,
  getStudentTestResults
}
