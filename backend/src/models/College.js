const prisma = require('../prismaClient')

const findAll = () => prisma.college.findMany({
  include: { _count: { select: { users: true } } }
})

const findById = (id) => prisma.college.findUnique({
  where: { id },
  include: { users: { where: { role: 'STUDENT' }, select: { id: true, name: true, department: true } } }
})

module.exports = { findAll, findById }
