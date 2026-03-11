const prisma = require('../prismaClient')

// GET /api/colleges — accessible by all authenticated users
const getColleges = async (req, res) => {
  try {
    const role = req.user?.role?.toUpperCase()

    // Platform admin sees all colleges
    // College admin + student see only their own college
    if (role === 'PLATFORM_ADMIN') {
      const colleges = await prisma.college.findMany({
        include: { _count: { select: { users: true, assessments: true } } },
        orderBy: { name: 'asc' }
      })
      return res.json(colleges)
    }

    // College admin / student — return only their college
    if (req.user.collegeId) {
      const college = await prisma.college.findUnique({
        where: { id: req.user.collegeId },
        include: { _count: { select: { users: true, assessments: true } } }
      })
      return res.json(college ? [college] : [])
    }

    return res.json([])
  } catch (err) {
    console.error('getColleges error:', err)
    res.status(500).json({ message: 'Failed to fetch colleges.' })
  }
}

// GET /api/colleges/:id
const getCollegeById = async (req, res) => {
  try {
    const role = req.user?.role?.toUpperCase()

    // College admin can only view their own college
    if (role === 'COLLEGE_ADMIN' && req.user.collegeId !== req.params.id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own college.' })
    }

    const college = await prisma.college.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { users: true, assessments: true } },
        users: {
          where: { role: 'COLLEGE_ADMIN' },
          select: { id: true, name: true, email: true, employeeId: true }
        }
      }
    })

    if (!college) return res.status(404).json({ message: 'College not found.' })
    res.json(college)
  } catch (err) {
    console.error('getCollegeById error:', err)
    res.status(500).json({ message: 'Failed to fetch college.' })
  }
}

// POST /api/colleges — platform admin only (via requireMinRole in route)
const createCollege = async (req, res) => {
  try {
    const { name, code, address, city, state, website, logoUrl } = req.body
    if (!name || !code) return res.status(400).json({ message: 'Name and code are required.' })

    const college = await prisma.college.create({
      data: {
        name,
        code:    code.toUpperCase(),
        address: address || null,
        city:    city    || null,
        state:   state   || null,
        website: website || null,
        logoUrl: logoUrl || null,
      }
    })
    res.status(201).json(college)
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'College code already exists.' })
    console.error('createCollege error:', err)
    res.status(500).json({ message: 'Failed to create college.' })
  }
}

// PUT /api/colleges/:id — platform admin only
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
  } catch (err) {
    console.error('updateCollege error:', err)
    res.status(500).json({ message: 'Failed to update college.' })
  }
}

module.exports = { getColleges, getCollegeById, createCollege, updateCollege }
