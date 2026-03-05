const prisma = require('../prismaClient')

const findByStudentAndAssessment = (studentId, assessmentId) =>
  prisma.submission.findMany({
    where: { studentId, assessmentId },
    include: { results: true, question: { select: { id: true, title: true, marks: true } } },
    orderBy: { submittedAt: 'desc' }
  })

const getBestScorePerQuestion = async (studentId, assessmentId) => {
  const subs = await prisma.submission.findMany({
    where: { studentId, assessmentId },
    orderBy: { score: 'desc' }
  })
  const best = {}
  subs.forEach(s => {
    if (!best[s.questionId]) best[s.questionId] = s
  })
  return Object.values(best)
}

module.exports = { findByStudentAndAssessment, getBestScorePerQuestion }
