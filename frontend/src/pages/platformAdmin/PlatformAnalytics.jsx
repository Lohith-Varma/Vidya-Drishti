import { useState, useEffect } from 'react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function PlatformAnalytics() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/platform/analytics')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="loading-spinner" /></div>
  if (!data) return null

  const maxScore = Math.max(...data.collegeStats.map(c => c.avgScore), 1)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Platform Analytics</h1>
          <p className="page-subtitle">Performance comparison across all colleges</p>
        </div>
      </div>

      {/* College performance bars */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--text-1)' }}>🏛️ College Performance Comparison</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.collegeStats
            .sort((a, b) => b.avgScore - a.avgScore)
            .map((c, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? '#f59e0b' : 'var(--text-3)', width: 24 }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{c.name}</span>
                      <span className="badge badge-default" style={{ marginLeft: 8 }}>{c.code}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-2)' }}>
                    <span>👥 {c.students} students</span>
                    <span style={{ fontWeight: 700, color: c.avgScore >= 70 ? 'var(--success)' : c.avgScore >= 50 ? 'var(--warning)' : 'var(--error)' }}>
                      {c.avgScore}%
                    </span>
                  </div>
                </div>
                <div style={{ height: 8, background: 'var(--bg-main)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${(c.avgScore / maxScore) * 100}%`,
                    background: i === 0 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' :
                                i === 1 ? 'linear-gradient(90deg,#6366f1,#0ea5e9)' :
                                          'linear-gradient(90deg,#22c55e,#0ea5e9)',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 11, color: 'var(--text-3)' }}>
                  <span>📝 {c.assessments} assessments</span>
                  <span>🟡 Avg LeetCode: {c.avgSolved}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Score distribution */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--text-1)' }}>📈 Platform-wide Score Distribution</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160 }}>
          {data.scoreDistribution.map((d, i) => {
            const maxCount = Math.max(...data.scoreDistribution.map(x => x.count), 1)
            const colors = ['#ef4444', '#f59e0b', '#6366f1', '#0ea5e9', '#22c55e']
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{d.count}</div>
                <div style={{
                  width: '100%', background: `${colors[i]}30`,
                  border: `1px solid ${colors[i]}50`, borderRadius: '4px 4px 0 0',
                  height: `${Math.max((d.count / maxCount) * 120, 4)}px`,
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  transition: 'height 0.4s ease',
                  position: 'relative',
                }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(d.count / maxCount) * 120}px`, background: colors[i], opacity: 0.7, borderRadius: '4px 4px 0 0' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>{d.range}</div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
          Score distribution across all {data.scoreDistribution.reduce((s, d) => s + d.count, 0)} students
        </div>
      </div>
    </div>
  )
}
