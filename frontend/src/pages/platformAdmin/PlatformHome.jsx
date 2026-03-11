import { useState, useEffect } from 'react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function PlatformHome() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/platform/overview')
      .then(r => setOverview(r.data))
      .catch(() => toast.error('Failed to load overview'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>
  if (!overview) return null

  const statCards = [
    { label: 'Total Colleges',   value: overview.totalColleges,    icon: '🏛️', color: '#f59e0b' },
    { label: 'College Admins',   value: overview.totalAdmins,      icon: '👨‍💼', color: '#6366f1' },
    { label: 'Total Students',   value: overview.totalStudents,    icon: '🎓', color: '#22c55e' },
    { label: 'Assessments',      value: overview.totalAssessments, icon: '📝', color: '#0ea5e9' },
    { label: 'Active Tests',     value: overview.activeAssessments,icon: '⚡', color: '#ef4444' },
    { label: 'Total Submissions',value: overview.totalSubmissions, icon: '📤', color: '#a855f7' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🛡️ Platform Dashboard</h1>
          <p className="page-subtitle">Full control over all colleges and students on Vidya-Drishti</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              background: `${s.color}20`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* College Breakdown Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-1)' }}>📊 College Breakdown</h3>
          <a href="/platform/colleges" style={{ fontSize: 13, color: 'var(--primary-light)' }}>Manage Colleges →</a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['College', 'Code', 'City', 'Students', 'Assessments', 'Avg Score', 'Avg LeetCode', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overview.collegeBreakdown.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-1)', fontSize: 13 }}>{c.name}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge badge-default">{c.code}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-3)', fontSize: 13 }}>{c.city || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-1)', fontWeight: 600 }}>{c.studentCount}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-2)' }}>{c.assessmentCount}</td>
                  <td style={{ padding: '10px 12px', color: c.avgScore >= 70 ? 'var(--success)' : c.avgScore >= 50 ? 'var(--warning)' : 'var(--error)', fontWeight: 600 }}>
                    {c.avgScore}%
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--accent)' }}>{c.avgSolved}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${c.isActive ? 'badge-success' : 'badge-error'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
