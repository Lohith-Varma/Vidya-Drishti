const bcrypt = require('bcryptjs')
const prisma = require('../prismaClient')

// Resolve college ID — platform admin can pass ?collegeId, college admin uses their own
const resolveCollegeId = (req) =>
  req.user.role === 'PLATFORM_ADMIN'
    ? (req.query.collegeId || req.body.collegeId || null)
    : req.user.collegeId

// ── GET my college info ───────────────────────────────────
const getMyCollege = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({
      where: { id: req.user.collegeId },
      include: {
        _count: { select: { users: true, assessments: true } }
      }
    })
    if (!college) return res.status(404).json({ message: 'College not found.' })
    res.json(college)
  } catch { res.status(500).json({ message: 'Failed to fetch college info.' }) }
}

// ── GET college students (scoped) ────────────────────────
const getCollegeStudents = async (req, res) => {
  try {
    const collegeId = resolveCollegeId(req)
    const { department, search } = req.query

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        ...(collegeId  && { collegeId }),
        ...(department && { department }),
        ...(search && {
          OR: [
            { name:       { contains: search, mode: 'insensitive' } },
            { rollNumber: { contains: search, mode: 'insensitive' } },
            { email:      { contains: search, mode: 'insensitive' } },
          ]
        })
      },
      select: {
        id: true, name: true, email: true, rollNumber: true,
        department: true, year: true, avatar: true, phone: true,
        totalSolved: true, totalScore: true, avgScore: true, streak: true,
        leetcodeHandle: true, hackerrankHandle: true, isActive: true,
        createdAt: true,
        college: { select: { id: true, name: true, code: true } }
      },
      orderBy: { totalScore: 'desc' }
    })
    res.json(students)
  } catch { res.status(500).json({ message: 'Failed to fetch students.' }) }
}

// ── ONBOARD single student ────────────────────────────────
const onboardStudent = async (req, res) => {
  try {
    const collegeId = req.user.role === 'PLATFORM_ADMIN'
      ? req.body.collegeId
      : req.user.collegeId

    const {
      email, password, name, rollNumber,
      department, year, phone, leetcodeHandle, hackerrankHandle
    } = req.body

    if (!email || !name || !rollNumber) {
      return res.status(400).json({ message: 'Email, name and roll number are required.' })
    }

    const tempPassword = password || `${rollNumber}@${new Date().getFullYear()}`

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ message: 'Email already registered.' })

    const hashed = await bcrypt.hash(tempPassword, 12)
    const student = await prisma.user.create({
      data: {
        email, name, password: hashed,
        role: 'STUDENT',
        rollNumber, department, year, phone,
        leetcodeHandle:   leetcodeHandle   || null,
        hackerrankHandle: hackerrankHandle || null,
        collegeId,
        onboardedById: req.user.id,
      },
      select: {
        id: true, name: true, email: true, rollNumber: true,
        department: true, year: true, collegeId: true, createdAt: true
      }
    })

    res.status(201).json({
      message: `Student onboarded successfully.`,
      student,
      tempPassword,  // return so admin can share it
    })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Roll number or email already exists.' })
    res.status(500).json({ message: 'Failed to onboard student.' })
  }
}

// ── BULK onboard students ─────────────────────────────────
const bulkOnboardStudents = async (req, res) => {
  try {
    const collegeId = req.user.role === 'PLATFORM_ADMIN'
      ? req.body.collegeId
      : req.user.collegeId

    const { students } = req.body  // array of { email, name, rollNumber, department, year }
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Students array is required.' })
    }
    if (students.length > 200) {
      return res.status(400).json({ message: 'Maximum 200 students per bulk import.' })
    }

    const results = { success: [], failed: [] }
    for (const s of students) {
      try {
        if (!s.email || !s.name || !s.rollNumber) {
          results.failed.push({ ...s, reason: 'Missing email, name or roll number' })
          continue
        }
        const tempPassword = `${s.rollNumber}@${new Date().getFullYear()}`
        const hashed = await bcrypt.hash(tempPassword, 10)
        await prisma.user.create({
          data: {
            email: s.email, name: s.name, password: hashed,
            role: 'STUDENT', rollNumber: s.rollNumber,
            department: s.department || null, year: s.year || null,
            collegeId, onboardedById: req.user.id,
          }
        })
        results.success.push({ name: s.name, email: s.email, tempPassword })
      } catch (err) {
        results.failed.push({ ...s, reason: err.code === 'P2002' ? 'Already exists' : err.message })
      }
    }

    res.json({
      message: `Bulk onboard complete. ${results.success.length} added, ${results.failed.length} failed.`,
      results
    })
  } catch { res.status(500).json({ message: 'Bulk onboard failed.' }) }
}

// ── DELETE / deactivate student (within college) ──────────
const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body
    const student = await prisma.user.findUnique({ where: { id } })
    if (!student) return res.status(404).json({ message: 'Student not found.' })

    // College admin can only affect their own college's students
    if (req.user.role === 'COLLEGE_ADMIN' && student.collegeId !== req.user.collegeId) {
      return res.status(403).json({ message: 'Access denied. Student is not in your college.' })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: typeof isActive === 'boolean' ? isActive : !student.isActive }
    })
    res.json({ message: `Student ${updated.isActive ? 'activated' : 'deactivated'}.`, isActive: updated.isActive })
  } catch { res.status(500).json({ message: 'Failed to update student.' }) }
}

// ── College analytics (scoped) ────────────────────────────
const getCollegeAnalytics = async (req, res) => {
  try {
    const collegeId = resolveCollegeId(req)
    const [students, assessments, submissions] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'STUDENT', collegeId },
        select: { avgScore: true, totalSolved: true, department: true }
      }),
      prisma.assessment.count({ where: { collegeId } }),
      prisma.submission.count({
        where: { student: { collegeId } }
      })
    ])

    const deptMap = {}
    students.forEach(s => {
      const d = s.department || 'Unknown'
      if (!deptMap[d]) deptMap[d] = { count: 0, totalScore: 0, totalSolved: 0 }
      deptMap[d].count++
      deptMap[d].totalScore  += s.avgScore
      deptMap[d].totalSolved += s.totalSolved
    })

    const departmentBreakdown = Object.entries(deptMap).map(([dept, v]) => ({
      department: dept,
      students:   v.count,
      avgScore:   Math.round(v.totalScore  / v.count),
      avgSolved:  Math.round(v.totalSolved / v.count),
    }))

    res.json({
      totalStudents: students.length,
      totalAssessments: assessments,
      totalSubmissions: submissions,
      avgScore: students.length
        ? Math.round(students.reduce((s, u) => s + u.avgScore, 0) / students.length)
        : 0,
      departmentBreakdown,
    })
  } catch { res.status(500).json({ message: 'Failed to fetch analytics.' }) }
}

module.exports = {
  getMyCollege, getCollegeStudents,
  onboardStudent, bulkOnboardStudents, updateStudentStatus,
  getCollegeAnalytics,
}
