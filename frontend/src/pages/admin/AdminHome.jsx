import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../App'
import { getAllStudents } from '../../api/student.api'
import { getAllTests } from '../../api/test.api'
import StatCard from '../../components/StatCard'
import SectionCard from '../../components/SectionCard'
import Table from '../../components/Table'
import './AdminHome.css'

export default function AdminHome() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllStudents(), getAllTests()])
      .then(([s, t]) => { setStudents(s.data || []); setTests(t.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeTests = tests.filter(t => new Date(t.endDate) > new Date() && new Date(t.startDate) <= new Date())
  const avgScore = students.length ? Math.round(students.reduce((a, s) => a + (s.avgScore || 0), 0) / students.length) : 0
  const topStudents = [...students].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)).slice(0, 5)

  const recentActivities = [
    { dot: 'var(--success)', text: <><strong>Priya Sharma</strong> submitted <strong>Data Structures Test</strong></>, time: '2 minutes ago' },
    { dot: 'var(--accent)', text: <><strong>Rahul Gupta</strong> linked LeetCode profile</>, time: '15 minutes ago' },
    { dot: 'var(--warning)', text: <><strong>Array Assessment</strong> started — 42 students online</>, time: '1 hour ago' },
    { dot: 'var(--primary-light)', text: <><strong>Sneha Rao</strong> reached rank #1 in leaderboard</>, time: '3 hours ago' },
    { dot: 'var(--error)', text: <><strong>5 students</strong> missed the OOP test deadline</>, time: '5 hours ago' },
  ]

  const topStudentCols = [
    { key: 'rank', label: '#', width: '48px', render: (_, __, idx) => <span style={{ color: 'var(--text-3)', fontWeight: 700 }}>{idx + 1}</span> },
    {
      key: 'name', label: 'Student',
      render: (name, row) => (
        <div className="table-user">
          <div className="table-avatar">{name?.slice(0,2).toUpperCase()}</div>
          <div><div className="table-user-name">{name}</div><div className="table-user-sub">{row.rollNumber}</div></div>
        </div>
      )
    },
    { key: 'totalSolved', label: 'Solved', render: v => <strong style={{ color: 'var(--text-1)' }}>{v}</strong> },
    { key: 'avgScore', label: 'Avg Score', render: v => <span className={v >= 70 ? 'text-success' : 'text-warning'}>{v}%</span> },
    { key: 'totalScore', label: 'Points', render: v => <strong style={{ color: 'var(--primary-light)' }}>{v}</strong> },
  ]

  return (
    <div>
      <div className="admin-welcome">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👨‍💼</h2>
          <p>Here's what's happening in your department today</p>
        </div>
        <div className="admin-quick-actions">
          <Link to="/admin/create-assessment" className="btn btn-primary">+ Create Assessment</Link>
          <Link to="/admin/analytics" className="btn btn-secondary">📊 View Analytics</Link>
        </div>
      </div>

      <div className="grid-4">
        <StatCard label="Total Students" value={loading ? '...' : students.length} trend={8}
          accentColor="#6366f1" iconBg="rgba(99,102,241,0.1)" iconColor="#818cf8"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard label="Tests Created" value={loading ? '...' : tests.length} trend={3}
          accentColor="#0ea5e9" iconBg="rgba(14,165,233,0.1)" iconColor="#0ea5e9"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>}
        />
        <StatCard label="Active Tests" value={loading ? '...' : activeTests.length}
          accentColor="#ef4444" iconBg="rgba(239,68,68,0.1)" iconColor="#ef4444"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          sub="Ongoing right now"
        />
        <StatCard label="Dept Avg Score" value={loading ? '...' : `${avgScore}%`} trend={-2}
          accentColor="#22c55e" iconBg="rgba(34,197,94,0.1)" iconColor="#22c55e"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
      </div>

      <div className="admin-grid">
        <SectionCard title="Top Performers" icon={<span>🏆</span>}
          actions={<Link to="/admin/leaderboard" className="btn btn-secondary btn-sm">Full Leaderboard</Link>}
          noPadding>
          <Table columns={topStudentCols} data={topStudents} loading={loading} pageSize={5} />
        </SectionCard>

        <SectionCard title="Recent Activity" icon={<span>🔔</span>}>
          <div className="recent-activity-list">
            {recentActivities.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot" style={{ background: a.dot }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
