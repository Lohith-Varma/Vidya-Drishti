import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllTests, getStudentTestResults } from '../../api/test.api'
import { useAuth } from '../../App'
import './StudentAssessments.css'

const STATUS_CONFIG = {
  completed:  { label: 'Completed',  badge: 'badge-success' },
  upcoming:   { label: 'Upcoming',   badge: 'badge-warning' },
  ongoing:    { label: 'Live Now',   badge: 'badge-error'   },
  missed:     { label: 'Missed',     badge: 'badge-error'   },
}

function getTimeLeft(deadline) {
  const diff = new Date(deadline) - new Date()
  if (diff <= 0) return null
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function StudentAssessments() {
  const { user } = useAuth()
  const [tests, setTests] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      getAllTests({ studentId: user.id }),
      getStudentTestResults(user.id)
    ]).then(([testsRes, resultsRes]) => {
      setTests(testsRes.data || [])
      const map = {}
      resultsRes.data?.forEach(r => { map[r.testId] = r })
      setResults(map)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user.id])

  const determineStatus = (test) => {
    const now = new Date()
    if (results[test.id]) return 'completed'
    if (new Date(test.endDate) < now) return 'missed'
    if (new Date(test.startDate) <= now) return 'ongoing'
    return 'upcoming'
  }

  const filtered = tests.filter(t => {
    const status = determineStatus(t)
    const matchFilter = filter === 'all' || status === filter
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = { all: tests.length, completed: 0, upcoming: 0, ongoing: 0, missed: 0 }
  tests.forEach(t => { counts[determineStatus(t)]++ })

  if (loading) return <div className="center-loader"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Assessments</div>
          <div className="page-subtitle">All institute coding tests and evaluations</div>
        </div>
      </div>

      <div className="assessments-filters">
        <div className="filter-tabs">
          {['all', 'ongoing', 'upcoming', 'completed', 'missed'].map(f => (
            <button key={f} className={`filter-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {counts[f] > 0 && `(${counts[f]})`}
            </button>
          ))}
        </div>
        <div className="header-search" style={{ marginLeft: 'auto' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search assessments..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: 13 }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📭</div><h3>No assessments found</h3><p>Try changing your filter.</p></div>
      ) : (
        <div className="assessments-grid">
          {filtered.map(test => {
            const status = determineStatus(test)
            const result = results[test.id]
            const cfg = STATUS_CONFIG[status]
            const scorePct = result ? Math.round((result.score / test.maxScore) * 100) : null
            const timeLeft = getTimeLeft(test.startDate)

            return (
              <div key={test.id} className="assessment-card">
                <div className="assessment-card-header">
                  <div>
                    <div className="assessment-card-title">{test.title}</div>
                    <div className="assessment-card-subject">{test.subject}</div>
                  </div>
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                </div>

                <div className="assessment-card-meta">
                  <span className="assessment-meta-item">📅 {new Date(test.startDate).toLocaleDateString()}</span>
                  <span className="assessment-meta-item">⏱ {test.duration} min</span>
                  <span className="assessment-meta-item">❓ {test.questionCount} Q's</span>
                  <span className="assessment-meta-item">🏅 {test.maxScore} pts</span>
                </div>

                {scorePct !== null && (
                  <div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${scorePct}%`, background: scorePct >= 70 ? 'var(--success)' : scorePct >= 40 ? 'var(--warning)' : 'var(--error)' }} />
                    </div>
                  </div>
                )}

                <div className="assessment-card-footer">
                  {status === 'completed' && result ? (
                    <div className="score-display">
                      <div className="score-main">{result.score}<span>/{test.maxScore}</span></div>
                      <div className="score-label">Your Score — {scorePct}%</div>
                    </div>
                  ) : status === 'upcoming' && timeLeft ? (
                    <div className="upcoming-timer">⏳ Starts in {timeLeft}</div>
                  ) : status === 'ongoing' ? (
                    <div className="upcoming-timer" style={{ color: 'var(--error)' }}>🔴 Live Now</div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Not attempted</span>
                  )}

                  <Link
                    to={`/student/assessment/${test.id}`}
                    className={`btn btn-sm ${status === 'ongoing' ? 'btn-primary' : 'btn-secondary'}`}>
                    {status === 'ongoing' ? '▶ Start' : status === 'completed' ? '👁 Review' : 'View Details'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
