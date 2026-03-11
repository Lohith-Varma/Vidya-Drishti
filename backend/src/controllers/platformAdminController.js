const bcrypt = require('bcryptjs')
const prisma = require('../prismaClient')

// ── PLATFORM OVERVIEW ─────────────────────────────────────
const getOverview = async (req, res) => {
  try {
    const [
      totalColleges, totalStudents, totalAdmins,
      totalAssessments, totalSubmissions, activeAssessments
    ] = await Promise.all([
      prisma.college.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'COLLEGE_ADMIN' } }),
      prisma.assessment.count(),
      prisma.submission.count(),
      prisma.assessment.count({
        where: {
          status: 'PUBLISHED',
          startDate: { lte: new Date() },
          endDate:   { gte: new Date() }
        }
      })
    ])

    // Per-college breakdown
    const colleges = await prisma.college.findMany({
      include: {
        _count: {
          select: {
            users: true,
            assessments: true
          }
        },
        users: {
          where: { role: 'STUDENT' },
          select: { avgScore: true, totalSolved: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const collegeBreakdown = colleges.map(c => ({
      id: c.id, name: c.name, code: c.code, city: c.city, isActive: c.isActive,
      studentCount:    c.users.length,
      assessmentCount: c._count.assessments,
      avgScore:        c.users.length
        ? Math.round(c.users.reduce((s, u) => s + u.avgScore, 0) / c.users.length)
        : 0,
      avgSolved:       c.users.length
        ? Math.round(c.users.reduce((s, u) => s + u.totalSolved, 0) / c.users.length)
        : 0,
    }))

    res.json({
      totalColleges, totalStudents, totalAdmins,
      totalAssessments, totalSubmissions, activeAssessments,
      collegeBreakdown
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch platform overview.' })
  }
}

// ── COLLEGE CRUD ──────────────────────────────────────────

const getColleges = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        _count: { select: { users: true, assessments: true } }
      },
      orderBy: { name: 'asc' }
    })

    const result = await Promise.all(colleges.map(async c => {
      const admins = await prisma.user.findMany({
        where: { collegeId: c.id, role: 'COLLEGE_ADMIN' },
        select: { id: true, name: true, email: true, employeeId: true }
      })
      return {
        ...c,
        studentCount: c._count.users,
        assessmentCount: c._count.assessments,
        admins
      }
    }))
    res.json(result)
  } catch { res.status(500).json({ message: 'Failed to fetch colleges.' }) }
}

const createCollege = async (req, res) => {
  try {
    const { name, code, address, city, state, website, logoUrl } = req.body
    if (!name || !code) return res.status(400).json({ message: 'Name and code are required.' })
    const college = await prisma.college.create({
      data: { name, code: code.toUpperCase(), address, city, state, website, logoUrl }
    })
    res.status(201).json(college)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'College code already exists.' })
    res.status(500).json({ message: 'Failed to create college.' })
  }
}

const updateCollege = async (req, res) => {
  try {
    const { name, address, city, state, website, logoUrl, isActive } = req.body
    const updated = await prisma.college.update({
      where: { id: req.params.id },
      data: {
        ...(name     && { name }),
        ...(address  !== undefined && { address }),
        ...(city     !== undefined && { city }),
        ...(state    !== undefined && { state }),
        ...(website  !== undefined && { website }),
        ...(logoUrl  !== undefined && { logoUrl }),
        ...(isActive !== undefined && { isActive }),
      }
    })
    res.json(updated)
  } catch { res.status(500).json({ message: 'Failed to update college.' }) }
}

const deleteCollege = async (req, res) => {
  try {
    const hasUsers = await prisma.user.count({ where: { collegeId: req.params.id } })
    if (hasUsers > 0) {
      return res.status(400).json({
        message: `Cannot delete college with ${hasUsers} associated users. Deactivate it instead.`
      })
    }
    await prisma.college.delete({ where: { id: req.params.id } })
    res.json({ message: 'College deleted.' })
  } catch { res.status(500).json({ message: 'Failed to delete college.' }) }
}

// ── COLLEGE ADMIN CRUD ────────────────────────────────────

const getCollegeAdmins = async (req, res) => {
  try {
    const { collegeId } = req.query
    const admins = await prisma.user.findMany({
      where: {
        role: 'COLLEGE_ADMIN',
        ...(collegeId && { collegeId })
      },
      select: {
        id: true, name: true, email: true, employeeId: true,
        department: true, phone: true, bio: true, isActive: true,
        createdAt: true,
        college: { select: { id: true, name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(admins)
  } catch { res.status(500).json({ message: 'Failed to fetch admins.' }) }
}

const createCollegeAdmin = async (req, res) => {
  try {
    const { email, password, name, collegeId, employeeId, department, phone } = req.body
    if (!email || !password || !name || !collegeId) {
      return res.status(400).json({ message: 'Email, password, name and college are required.' })
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ message: 'Email already registered.' })

    const hashed = await bcrypt.hash(password, 12)
    const admin = await prisma.user.create({
      data: {
        email, name, password: hashed,
        role: 'COLLEGE_ADMIN',
        collegeId, employeeId, department, phone,
        totalScore: 0,
      },
      select: {
        id: true, name: true, email: true, role: true,
        employeeId: true, department: true, collegeId: true,
        college: { select: { name: true, code: true } },
        createdAt: true
      }
    })
    res.status(201).json(admin)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Email or Employee ID already exists.' })
    res.status(500).json({ message: 'Failed to create admin.' })
  }
}

const updateCollegeAdmin = async (req, res) => {
  try {
    const { name, collegeId, employeeId, department, phone, bio, isActive } = req.body
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name       && { name }),
        ...(collegeId  && { collegeId }),
        ...(employeeId !== undefined && { employeeId }),
        ...(department !== undefined && { department }),
        ...(phone      !== undefined && { phone }),
        ...(bio        !== undefined && { bio }),
        ...(isActive   !== undefined && { isActive }),
      },
      select: { id: true, name: true, email: true, collegeId: true, isActive: true }
    })
    res.json(updated)
  } catch { res.status(500).json({ message: 'Failed to update admin.' }) }
}

const deleteCollegeAdmin = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ message: 'College admin removed.' })
  } catch { res.status(500).json({ message: 'Failed to delete admin.' }) }
}

const resetAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }
    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hashed } })
    res.json({ message: 'Password reset successfully.' })
  } catch { res.status(500).json({ message: 'Failed to reset password.' }) }
}

// ── ALL STUDENTS ──────────────────────────────────────────

const getAllStudents = async (req, res) => {
  try {
    const { collegeId, department, search } = req.query
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
        department: true, year: true, avatar: true,
        totalSolved: true, totalScore: true, avgScore: true,
        isActive: true, createdAt: true,
        college: { select: { id: true, name: true, code: true } }
      },
      orderBy: { totalScore: 'desc' }
    })
    res.json(students)
  } catch { res.status(500).json({ message: 'Failed to fetch students.' }) }
}

const toggleStudentStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) return res.status(404).json({ message: 'Student not found.' })
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive }
    })
    res.json({ message: `Student ${updated.isActive ? 'activated' : 'deactivated'}.`, isActive: updated.isActive })
  } catch { res.status(500).json({ message: 'Failed to update student status.' }) }
}

// ── PLATFORM ANALYTICS ────────────────────────────────────

const getPlatformAnalytics = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        users: {
          where: { role: 'STUDENT' },
          select: { avgScore: true, totalSolved: true, testsCompleted: true }
        },
        _count: { select: { assessments: true } }
      }
    })

    const collegeStats = colleges.map(c => ({
      name:            c.name,
      code:            c.code,
      students:        c.users.length,
      avgScore:        c.users.length ? Math.round(c.users.reduce((s, u) => s + u.avgScore, 0) / c.users.length) : 0,
      avgSolved:       c.users.length ? Math.round(c.users.reduce((s, u) => s + u.totalSolved, 0) / c.users.length) : 0,
      assessments:     c._count.assessments,
    }))

    const allStudents = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { avgScore: true, totalSolved: true }
    })

    const scoreDistribution = [
      { range: '0–20',   count: allStudents.filter(s => s.avgScore < 20).length },
      { range: '20–40',  count: allStudents.filter(s => s.avgScore >= 20 && s.avgScore < 40).length },
      { range: '40–60',  count: allStudents.filter(s => s.avgScore >= 40 && s.avgScore < 60).length },
      { range: '60–80',  count: allStudents.filter(s => s.avgScore >= 60 && s.avgScore < 80).length },
      { range: '80–100', count: allStudents.filter(s => s.avgScore >= 80).length },
    ]

    res.json({ collegeStats, scoreDistribution })
  } catch { res.status(500).json({ message: 'Failed to fetch analytics.' }) }
}

module.exports = {
  getOverview, getColleges, createCollege, updateCollege, deleteCollege,
  getCollegeAdmins, createCollegeAdmin, updateCollegeAdmin, deleteCollegeAdmin,
  resetAdminPassword, getAllStudents, toggleStudentStatus, getPlatformAnalytics,
}
