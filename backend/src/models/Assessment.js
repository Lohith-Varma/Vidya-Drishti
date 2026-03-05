const prisma = require('../prismaClient')

const assessmentWithDetails = {
  id: true, title: true, subject: true, description: true,
  duration: true, maxScore: true, startDate: true, endDate: true,
  language: true, proctored: true, status: true, createdAt: true,
  createdBy: { select: { id: true, name: true, email: true } },
  questions: {
    orderBy: { order: 'asc' },
    include: {
      testCases: { select: { id: true, input: true, output: true, hidden: true } }
    }
  },
  _count: { select: { submissions: true } }
}

const findById = (id) =>
  prisma.assessment.findUnique({ where: { id }, include: assessmentWithDetails })

const findAll = (filters = {}) =>
  prisma.assessment.findMany({
    where: filters,
    include: {
      _count: { select: { submissions: true, questions: true } },
      createdBy: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

const calculateMaxScore = async (assessmentId) => {
  const questions = await prisma.question.findMany({
    where: { assessmentId },
    select: { marks: true }
  })
  const total = questions.reduce((sum, q) => sum + q.marks, 0)
  return prisma.assessment.update({ where: { id: assessmentId }, data: { maxScore: total } })
}

module.exports = { assessmentWithDetails, findById, findAll, calculateMaxScore }
