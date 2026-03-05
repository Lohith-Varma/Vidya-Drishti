const bcrypt = require('bcryptjs')
const prisma = require('../src/prismaClient')

async function seed() {
  try {
    const hashed = await bcrypt.hash('password123', 12)

    // Student user
    await prisma.user.upsert({
      where: { email: 'student@college.edu' },
      update: {},
      create: {
        email: 'student@college.edu',
        password: hashed,
        name: 'Priya Sharma',
        role: 'STUDENT',
        rollNumber: '21CS001',
        department: 'Computer Science',
        year: '3rd Year',
        phone: '+919876543210',
        bio: 'Competitive programmer | DSA enthusiast',
        leetcodeHandle: 'priya_sharma21',
        hackerrankHandle: 'priya21',
        totalSolved: 245,
        totalScore: 856,
        avgScore: 78.5
      }
    })

    // Admin user
    await prisma.user.upsert({
      where: { email: 'admin@college.edu' },
      update: {},
      create: {
        email: 'admin@college.edu',
        password: hashed,
        name: 'Dr. Rajesh Kumar',
        role: 'ADMIN',
        employeeId: 'FAC001',
        department: 'Computer Science',
        bio: 'Head of Department | Professor',
        totalScore: 0
      }
    })

    console.log('✅ Seeded users:')
    console.log(' - student@college.edu')
    console.log(' - admin@college.edu')
    console.log('Password for both: password123')
  } catch (e) {
    console.error('Seeding failed:', e)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

seed()
