const bcrypt = require('bcryptjs')
const prisma = require('../src/prismaClient')

async function seed() {
  console.log('🌱 Seeding database...')
  const pwd = await bcrypt.hash('password123', 12)

  // ── Colleges ──────────────────────────────────────────────
  const colleges = await Promise.all([
    prisma.college.upsert({
      where: { code: 'IITM' },
      update: {},
      create: { name: 'IIT Madras', code: 'IITM', city: 'Chennai', state: 'Tamil Nadu', website: 'https://iitm.ac.in' }
    }),
    prisma.college.upsert({
      where: { code: 'IIITH' },
      update: {},
      create: { name: 'IIIT Hyderabad', code: 'IIITH', city: 'Hyderabad', state: 'Telangana', website: 'https://iiit.ac.in' }
    }),
    prisma.college.upsert({
      where: { code: 'NITW' },
      update: {},
      create: { name: 'NIT Warangal', code: 'NITW', city: 'Warangal', state: 'Telangana', website: 'https://nitw.ac.in' }
    }),
    prisma.college.upsert({
      where: { code: 'AU' },
      update: {},
      create: { name: 'Andhra University', code: 'AU', city: 'Visakhapatnam', state: 'Andhra Pradesh', website: 'https://andhrauniversity.edu.in' }
    }),
    prisma.college.upsert({
      where: { code: 'VIT' },
      update: {},
      create: { name: 'VIT Vellore', code: 'VIT', city: 'Vellore', state: 'Tamil Nadu', website: 'https://vit.ac.in' }
    }),
    prisma.college.upsert({
      where: { code: 'BITS' },
      update: {},
      create: { name: 'BITS Pilani', code: 'BITS', city: 'Pilani', state: 'Rajasthan', website: 'https://bits-pilani.ac.in' }
    }),
  ])

  const [iitm, iiith, nitw, au, vit, bits] = colleges
  console.log(`✅ ${colleges.length} colleges seeded`)

  // ── Platform Admin ────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'platform@vidyadrishti.in' },
    update: {},
    create: {
      email: 'platform@vidyadrishti.in',
      password: pwd,
      name: 'Platform Administrator',
      role: 'PLATFORM_ADMIN',
      bio: 'Super administrator of Vidya-Drishti platform',
      totalScore: 0,
    }
  })

  // ── College Admins ────────────────────────────────────────
  const admins = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin.iitm@college.edu' },
      update: {},
      create: {
        email: 'admin.iitm@college.edu', password: pwd,
        name: 'Dr. Rajesh Kumar', role: 'COLLEGE_ADMIN',
        employeeId: 'IITM-FAC001', department: 'Computer Science',
        bio: 'Head of CSE Department', collegeId: iitm.id, totalScore: 0,
      }
    }),
    prisma.user.upsert({
      where: { email: 'admin.iiith@college.edu' },
      update: {},
      create: {
        email: 'admin.iiith@college.edu', password: pwd,
        name: 'Prof. Anita Sharma', role: 'COLLEGE_ADMIN',
        employeeId: 'IIITH-FAC001', department: 'Computer Science',
        bio: 'Associate Professor', collegeId: iiith.id, totalScore: 0,
      }
    }),
    prisma.user.upsert({
      where: { email: 'admin.nitw@college.edu' },
      update: {},
      create: {
        email: 'admin.nitw@college.edu', password: pwd,
        name: 'Dr. Suresh Reddy', role: 'COLLEGE_ADMIN',
        employeeId: 'NITW-FAC001', department: 'Information Technology',
        bio: 'Professor, IT Department', collegeId: nitw.id, totalScore: 0,
      }
    }),
    prisma.user.upsert({
      where: { email: 'admin.au@college.edu' },
      update: {},
      create: {
        email: 'admin.au@college.edu', password: pwd,
        name: 'Dr. Padma Rao', role: 'COLLEGE_ADMIN',
        employeeId: 'AU-FAC001', department: 'Computer Science',
        bio: 'Head of CSE Department', collegeId: au.id, totalScore: 0,
      }
    }),
  ])
  console.log(`✅ ${admins.length} college admins seeded`)

  // ── Students ──────────────────────────────────────────────
  const studentData = [
    // IIT Madras
    { email: 'student1@iitm.ac.in', name: 'Priya Sharma',     roll: 'IITM21CS001', dept: 'Computer Science',    year: '3rd Year', college: iitm.id,  lc: 'priya_sharma21',    solved: 245, score: 856  },
    { email: 'student2@iitm.ac.in', name: 'Arjun Menon',      roll: 'IITM21CS002', dept: 'Computer Science',    year: '3rd Year', college: iitm.id,  lc: 'arjun_menon',       solved: 312, score: 920  },
    { email: 'student3@iitm.ac.in', name: 'Deepa Krishnan',   roll: 'IITM22EE001', dept: 'Electrical Engg',     year: '2nd Year', college: iitm.id,  lc: 'deepa_k',           solved: 156, score: 640  },
    // IIIT Hyderabad
    { email: 'student1@iiith.ac.in', name: 'Rahul Gupta',     roll: 'IIITH21CS001', dept: 'Computer Science',   year: '3rd Year', college: iiith.id, lc: 'rahul_gupta',       solved: 289, score: 780  },
    { email: 'student2@iiith.ac.in', name: 'Sneha Rao',       roll: 'IIITH21CS002', dept: 'Computer Science',   year: '3rd Year', college: iiith.id, lc: 'sneha_rao21',        solved: 401, score: 1100 },
    { email: 'student3@iiith.ac.in', name: 'Vikram Singh',    roll: 'IIITH22AI001', dept: 'Artificial Intelligence', year: '2nd Year', college: iiith.id, lc: null,            solved: 134, score: 520  },
    // NIT Warangal
    { email: 'student1@nitw.ac.in', name: 'Kavitha Nair',     roll: 'NITW21CS001', dept: 'Computer Science',    year: '3rd Year', college: nitw.id,  lc: 'kavitha_nair',      solved: 178, score: 690  },
    { email: 'student2@nitw.ac.in', name: 'Sai Krishna',      roll: 'NITW21IT001', dept: 'Information Technology', year: '3rd Year', college: nitw.id, lc: 'sai_k',           solved: 223, score: 750  },
    // Andhra University
    { email: 'student1@andhrauniversity.edu.in', name: 'Mounika Devi', roll: 'AU21CS001', dept: 'Computer Science', year: '3rd Year', college: au.id, lc: null,                solved: 89,  score: 410  },
    { email: 'student2@andhrauniversity.edu.in', name: 'Ravi Teja',    roll: 'AU21CS002', dept: 'Computer Science', year: '3rd Year', college: au.id, lc: 'ravi_teja_codes',   solved: 167, score: 590  },
    // VIT
    { email: 'student1@vit.ac.in', name: 'Ananya Iyer',       roll: 'VIT21CS001',  dept: 'Computer Science',    year: '3rd Year', college: vit.id,  lc: 'ananya_iyer',       solved: 198, score: 720  },
    { email: 'student2@vit.ac.in', name: 'Karthik Raj',       roll: 'VIT21IT001',  dept: 'Information Technology', year: '3rd Year', college: vit.id, lc: null,               solved: 145, score: 560  },
  ]

  for (const s of studentData) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email, password: pwd,
        name: s.name, role: 'STUDENT',
        rollNumber: s.roll, department: s.dept, year: s.year,
        collegeId: s.college,
        leetcodeHandle: s.lc,
        totalSolved: s.solved, totalScore: s.score, avgScore: Math.floor(Math.random() * 30 + 60),
      }
    })
  }
  console.log(`✅ ${studentData.length} students seeded`)

  console.log('\n🎉 Seeding complete!')
  console.log('─'.repeat(50))
  console.log('PLATFORM ADMIN:')
  console.log('  Email:    platform@vidyadrishti.in')
  console.log('  Password: password123')
  console.log('\nCOLLEGE ADMINS (password: password123):')
  console.log('  admin.iitm@college.edu    → IIT Madras')
  console.log('  admin.iiith@college.edu   → IIIT Hyderabad')
  console.log('  admin.nitw@college.edu    → NIT Warangal')
  console.log('  admin.au@college.edu      → Andhra University')
  console.log('\nSTUDENTS (password: password123):')
  console.log('  student1@iitm.ac.in       → Priya Sharma (IITM)')
  console.log('  student1@iiith.ac.in      → Rahul Gupta (IIITH)')
  console.log('  student2@iiith.ac.in      → Sneha Rao (IIITH)')
  console.log('─'.repeat(50))
}

seed().catch(e => {
  console.error('Seed failed:', e)
}).finally(async () => {
  await prisma.$disconnect()
  process.exit(0)
})
