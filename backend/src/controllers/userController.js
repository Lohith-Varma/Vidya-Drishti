const prisma = require('../prismaClient')
const { userSelectPublic } = require('../models/User')

const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userSelectPublic
    })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (err) {
    console.error('getUserProfile error:', err)
    res.status(500).json({ message: 'Failed to fetch profile.' })
  }
}

const updateUserProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'phone', 'bio', 'department', 'year',
      'employeeId', 'rollNumber',
      'leetcodeHandle', 'hackerrankHandle', 'githubHandle', 'codeforcesHandle',
      'linkedinUrl', 'resumeUrl', 'portfolioUrl'
    ]
    const data = {}
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) data[f] = req.body[f]
    })

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: userSelectPublic
    })
    res.json(updated)
  } catch (err) {
    console.error('updateUserProfile error:', err)
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Roll number or Employee ID already in use.' })
    }
    res.status(500).json({ message: 'Failed to update profile.' })
  }
}

module.exports = { getUserProfile, updateUserProfile }
