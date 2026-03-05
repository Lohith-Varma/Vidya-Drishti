const prisma = require('../prismaClient')

// GET /api/analytics/overview  (Admin)
const getAnalyticsOverview = async (req, res) => {
  try {
    const [
      totalStudents, totalTests, totalSubmissions,
      activeTests, students
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.assessment.count(),
      prisma.submission.count(),
      prisma.assessment.count({
        where: {
          startDate: { lte: new Date() },
          endDate:   { gte: new Date() },
          status: 'PUBLISHED'
        }
      }),
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { avgScore: true, totalSolved: true, leetcodeHandle: true, hackerrankHandle: true }
      })
    ])

    const avgDeptScore = students.length
      ? Math.round(students.reduce((a, s) => a + s.avgScore, 0) / students.length)
      : 0

    const platformCoverage = students.length
      ? Math.round((students.filter(s => s.leetcodeHandle || s.hackerrankHandle).length / students.length) * 100)
      : 0

    const placementReady = students.filter(s => s.avgScore >= 70 && s.totalSolved >= 100).length

    res.json({
      totalStudents, totalTests, totalSubmissions, activeTests,
      avgDeptScore, platformCoverage, placementReady,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics.' })
  }
}

// GET /api/analytics/students  (Admin)
const getStudentAnalytics = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true, name: true, department: true, avgScore: true,
        totalSolved: true, totalScore: true, leetcodeHandle: true,
        hackerrankHandle: true, easySolved: true, mediumSolved: true, hardSolved: true,
      }
    })

    // Score distribution
    const scoreDistribution = [
      { range: '0–20',  count: students.filter(s => s.avgScore < 20).length },
      { range: '20–40', count: students.filter(s => s.avgScore >= 20 && s.avgScore < 40).length },
      { range: '40–60', count: students.filter(s => s.avgScore >= 40 && s.avgScore < 60).length },
      { range: '60–80', count: students.filter(s => s.avgScore >= 60 && s.avgScore < 80).length },
      { range: '80–100',count: students.filter(s => s.avgScore >= 80).length },
    ]

    // Department breakdown
    const deptMap = {}
    students.forEach(s => {
      const d = s.department || 'Unknown'
      if (!deptMap[d]) deptMap[d] = { students: 0, totalScore: 0, totalSolved: 0 }
      deptMap[d].students++
      deptMap[d].totalScore += s.avgScore
      deptMap[d].totalSolved += s.totalSolved
    })
    const departmentData = Object.entries(deptMap).map(([name, v]) => ({
      name,
      students: v.students,
      avgScore: Math.round(v.totalScore / v.students),
      avgSolved: Math.round(v.totalSolved / v.students),
    }))

    res.json({ scoreDistribution, departmentData, students })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student analytics.' })
  }
}

module.exports = { getAnalyticsOverview, getStudentAnalytics }
