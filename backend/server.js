require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')
const { connectDB } = require('./src/config/db')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security ──────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Rate limiting ─────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Too many requests. Please try again later.' }
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
})

const codeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 15,
  message: { error: 'Code execution rate limit exceeded.' }
})

app.use('/api/', globalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/tests/run', codeLimiter)

// ── Body parsing ──────────────────────────────
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// ── Logging ───────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ── Routes ────────────────────────────────────
const apiRoutes = require('./routes/api')
app.use('/api', apiRoutes)

// ── Health check ──────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'OK',
  service: 'Vidya-Drishti API',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV
}))

// ── 404 ───────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` }))

// ── Global error handler ──────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// ── Start ─────────────────────────────────────
const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`\n🚀 Vidya-Drishti API running on http://localhost:${PORT}`)
    console.log(`📖 API docs at http://localhost:${PORT}/api`)
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}\n`)
  })
}

start()
module.exports = app
