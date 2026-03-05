const prisma = require('../prismaClient')
const { findAll, findById } = require('../models/College')

const getColleges = async (req, res) => {
  try {
    const colleges = await findAll()
    res.json(colleges)
  } catch { res.status(500).json({ message: 'Failed to fetch colleges.' }) }
}

const getCollegeById = async (req, res) => {
  try {
    const college = await findById(req.params.id)
    if (!college) return res.status(404).json({ message: 'College not found.' })
    res.json(college)
  } catch { res.status(500).json({ message: 'Failed to fetch college.' }) }
}

const createCollege = async (req, res) => {
  try {
    const { name, code, address } = req.body
    if (!name || !code) return res.status(400).json({ message: 'Name and code required.' })
    const college = await prisma.college.create({ data: { name, code, address } })
    res.status(201).json(college)
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'College code already exists.' })
    res.status(500).json({ message: 'Failed to create college.' })
  }
}

const updateCollege = async (req, res) => {
  try {
    const { name, address } = req.body
    const college = await prisma.college.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(address !== undefined && { address }) }
    })
    res.json(college)
  } catch { res.status(500).json({ message: 'Failed to update college.' }) }
}

module.exports = { getColleges, getCollegeById, createCollege, updateCollege }
