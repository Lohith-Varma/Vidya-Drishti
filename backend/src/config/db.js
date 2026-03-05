const prisma = require('../prismaClient')

async function connectDB() {
  try {
    await prisma.$connect()
    console.log('✅ PostgreSQL connected via Prisma')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

async function disconnectDB() {
  await prisma.$disconnect()
  console.log('🔌 Database disconnected')
}

module.exports = { connectDB, disconnectDB }
