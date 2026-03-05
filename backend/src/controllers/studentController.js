const prisma = require('../prismaClient')
const { userSelectPublic, updateStats, recalcLeaderboardRanks } = require('../models/User')

// GET /api/students
const getAllStudents = async (req, res) => {
  try {
    const { department, year, search } = req.query
    const where = {
      role: 'STUDENT',
      ...(department && { department }),
      ...(year && { year }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { rollNumber: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const students = await prisma.user.findMany({
      where, select: userSelectPublic,
      orderBy: { totalScore: 'desc' }
    })
    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students.' })
  }
}

// GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: req.params.id, role: 'STUDENT' },
      select: userSelectPublic
    })
    if (!student) return res.status(404).json({ message: 'Student not found.' })
    res.json(student)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student.' })
  }
}

// GET /api/students/:id/stats
const getStudentStats = async (req, res) => {
  try {
    const { id } = req.params

    const [user, submissions, allStudents] = await Promise.all([
      prisma.user.findUnique({ where: { id }, select: userSelectPublic }),
      prisma.submission.findMany({
        where: { studentId: id },
        include: { assessment: { select: { title: true, maxScore: true } }, question: { select: { title: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 10
      }),
      prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, totalScore: true }, orderBy: { totalScore: 'desc' } })
    ])

    if (!user) return res.status(404).json({ message: 'Student not found.' })

    const rank = allStudents.findIndex(s => s.id === id) + 1
    const totalStudents = allStudents.length

    res.json({
      ...user,
      rank,
      totalStudents,
      recentSubmissions: submissions
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats.' })
  }
}

// PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params
    // Students can only update their own profile; admins can update anyone
    if (req.user.role === 'STUDENT' && req.user.id !== id) {
      return res.status(403).json({ message: 'Cannot update another student\'s profile.' })
    }

    const {
      name, phone, department, year, bio,
      leetcodeHandle, hackerrankHandle, githubHandle, codeforcesHandle,
      linkedinUrl, resumeUrl, portfolioUrl
    } = req.body

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(department !== undefined && { department }),
        ...(year !== undefined && { year }),
        ...(bio !== undefined && { bio }),
        ...(leetcodeHandle !== undefined && { leetcodeHandle }),
        ...(hackerrankHandle !== undefined && { hackerrankHandle }),
        ...(githubHandle !== undefined && { githubHandle }),
        ...(codeforcesHandle !== undefined && { codeforcesHandle }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(resumeUrl !== undefined && { resumeUrl }),
        ...(portfolioUrl !== undefined && { portfolioUrl }),
      },
      select: userSelectPublic
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student.' })
  }
}

// GET /api/students/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { type = 'overall', limit = 100 } = req.query

    let orderBy = {}
    if (type === 'leetcode')  orderBy = { totalSolved: 'desc' }
    else if (type === 'tests') orderBy = { avgScore: 'desc' }
    else                       orderBy = { totalScore: 'desc' }

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        ...userSelectPublic,
        leetcodeRank: true, contestRating: true,
        easySolved: true, mediumSolved: true, hardSolved: true,
      },
      orderBy,
      take: Number(limit)
    })

    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard.' })
  }
}

// GET /api/students/:id/submissions
const getStudentSubmissions = async (req, res) => {
  try {
    const subs = await prisma.submission.findMany({
      where: { studentId: req.params.id },
      include: {
        assessment: { select: { id: true, title: true, subject: true, maxScore: true } },
        question: { select: { id: true, title: true, marks: true } },
        results: true
      },
      orderBy: { submittedAt: 'desc' }
    })
    res.json(subs)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch submissions.' })
  }
}

// GET /api/students/search
const searchStudents = async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json([])

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { rollNumber: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: userSelectPublic,
      take: 20
    })
    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Failed to search.' })
  }
}

module.exports = {
  getAllStudents, getStudentById, getStudentStats,
  updateStudent, getLeaderboard, getStudentSubmissions, searchStudents
}
