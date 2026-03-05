// Prisma model helpers for User
const prisma = require('../prismaClient')

const userSelectPublic = {
  id: true, name: true, email: true, role: true,
  rollNumber: true, department: true, year: true,
  avatar: true, bio: true, phone: true,
  leetcodeHandle: true, hackerrankHandle: true,
  githubHandle: true, codeforcesHandle: true,
  linkedinUrl: true, resumeUrl: true, portfolioUrl: true,
  totalSolved: true, easySolved: true, mediumSolved: true,
  hardSolved: true, leetcodeRank: true, contestRating: true,
  streak: true, testsCompleted: true, avgScore: true,
  totalScore: true, rank: true, employeeId: true,
  collegeId: true, createdAt: true,
}

const findById = (id) =>
  prisma.user.findUnique({ where: { id }, select: userSelectPublic })

const findByEmail = (email) =>
  prisma.user.findUnique({ where: { email } })

const findAllStudents = (filters = {}) =>
  prisma.user.findMany({
    where: { role: 'STUDENT', ...filters },
    select: userSelectPublic,
    orderBy: { totalScore: 'desc' }
  })

const updateStats = async (userId) => {
  // Recalculate avgScore from all submissions
  const submissions = await prisma.submission.findMany({
    where: { studentId: userId, verdict: 'AC' },
    include: { assessment: { select: { maxScore: true } } }
  })

  // Group by assessmentId — best score per test
  const bestScores = {}
  const maxScores = {}
  submissions.forEach(s => {
    if (!bestScores[s.assessmentId] || s.score > bestScores[s.assessmentId]) {
      bestScores[s.assessmentId] = s.score
      maxScores[s.assessmentId] = s.assessment.maxScore
    }
  })

  const testsCompleted = Object.keys(bestScores).length
  const percentages = Object.keys(bestScores).map(k =>
    maxScores[k] > 0 ? (bestScores[k] / maxScores[k]) * 100 : 0
  )
  const avgScore = percentages.length > 0
    ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
    : 0
  const totalScore = Object.values(bestScores).reduce((a, b) => a + b, 0)

  return prisma.user.update({
    where: { id: userId },
    data: { testsCompleted, avgScore, totalScore }
  })
}

const recalcLeaderboardRanks = async () => {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { totalScore: 'desc' },
    select: { id: true }
  })
  const updates = students.map((s, idx) =>
    prisma.user.update({ where: { id: s.id }, data: { rank: idx + 1 } })
  )
  return Promise.all(updates)
}

module.exports = {
  userSelectPublic, findById, findByEmail,
  findAllStudents, updateStats, recalcLeaderboardRanks
}
