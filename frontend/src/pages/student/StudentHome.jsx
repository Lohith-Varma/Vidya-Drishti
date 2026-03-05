import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../App'
import { getStudentStats } from '../../api/student.api'
import { getStudentTestResults } from '../../api/test.api'
import StatCard from '../../components/StatCard'
import SectionCard from '../../components/SectionCard'
import LeetCodeStatsCard from '../../components/LeetCodeStatsCard'
import HackerRankStatsCard from '../../components/HackerRankStatsCard'
import './StudentHome.css'

export default function StudentHome() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentTests, setRecentTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getStudentStats(user.id).catch(() => null),
      getStudentTestResults(user.id).catch(() => ({ data: [] }))
    ]).then(([statsRes, testsRes]) => {
      setStats(statsRes?.data)
      setRecentTests(testsRes?.data?.slice(0, 5) || [])
    }).finally(() => setLoading(false))
  }, [user.id])

  // Generate activity heatmap data (mock)
  const heatmapData = Array.from({ length: 70 }, () => Math.floor(Math.random() * 5))

  const getTimeGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>{getTimeGreeting()}, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's your performance overview for today. Keep coding!</p>
        </div>
        <div className="welcome-emoji">🚀</div>
      </div>

      <div className="grid-4">
        <StatCard
          label="Problems Solved"
          value={loading ? '...' : stats?.totalSolved || 0}
          trend={12}
          accentColor="#6366f1"
          iconBg="rgba(99,102,241,0.1)" iconColor="#818cf8"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
          sub="Across all platforms"
        />
        <StatCard
          label="Tests Completed"
          value={loading ? '...' : stats?.testsCompleted || 0}
          trend={5}
          accentColor="#0ea5e9"
          iconBg="rgba(14,165,233,0.1)" iconColor="#0ea5e9"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>}
          sub={`Avg score: ${stats?.avgScore || 0}%`}
        />
        <StatCard
          label="Current Rank"
          value={loading ? '...' : stats?.rank ? `#${stats.rank}` : '—'}
          trend={-2}
          accentColor="#f59e0b"
          iconBg="rgba(245,158,11,0.1)" iconColor="#f59e0b"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="8 21 12 17 16 21"/><path d="M6 3h12v4a6 6 0 0 1-12 0V3z"/></svg>}
          sub={`Out of ${stats?.totalStudents || 0} students`}
        />
        <StatCard
          label="Active Streak"
          value={loading ? '...' : `${stats?.streak || 0}d`}
          accentColor="#22c55e"
          iconBg="rgba(34,197,94,0.1)" iconColor="#22c55e"
          icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
          sub="Keep it going!"
        />
      </div>

      <div className="student-home-grid">
        <SectionCard title="Recent Assessments" icon={<span>📋</span>}
          actions={<Link to="/student/assessments" className="btn btn-secondary btn-sm">View All</Link>}>
          {recentTests.length === 0 && !loading ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📭</div>
              <h3>No tests yet</h3>
              <p>Your completed assessments will appear here.</p>
            </div>
          ) : (
            <div className="recent-tests-list">
              {recentTests.map(test => (
                <div key={test.id} className="recent-test-item">
                  <div className="recent-test-info">
                    <h4>{test.title}</h4>
                    <p>{new Date(test.submittedAt).toLocaleDateString()} · {test.duration}min</p>
                  </div>
                  <div>
                    <div className="recent-test-score">
                      {test.score}<span>/{test.maxScore}</span>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: 2 }}>
                      <span className={`badge ${test.score / test.maxScore >= 0.7 ? 'badge-success' : test.score / test.maxScore >= 0.4 ? 'badge-warning' : 'badge-error'}`}>
                        {Math.round((test.score / test.maxScore) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Coding Activity" icon={<span>🔥</span>}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Last 70 days of activity</div>
            <div className="activity-heatmap">
              {heatmapData.map((level, i) => (
                <div key={i} className={`heat-cell heat-${level}`} title={`${level} submissions`} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
              <span>Less</span>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {[0,1,2,3,4].map(l => <div key={l} className={`heat-cell heat-${l}`} style={{ margin: 0 }} />)}
              </div>
              <span>More</span>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="coding-platforms-grid">
        <LeetCodeStatsCard username={user?.leetcodeHandle} />
        <HackerRankStatsCard username={user?.hackerrankHandle} />
      </div>
    </div>
  )
}
