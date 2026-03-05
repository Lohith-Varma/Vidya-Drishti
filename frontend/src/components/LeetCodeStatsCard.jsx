import { useState, useEffect } from 'react'
import { getLeetCodeStats } from '../api/leetcode.api'
import SectionCard from './SectionCard'

const DIFFICULTY_CONFIG = {
  easy:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  hard:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
}

export default function LeetCodeStatsCard({ username }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username) { setLoading(false); return }
    getLeetCodeStats(username)
      .then(res => setStats(res.data))
      .catch(() => setError('Could not load LeetCode stats'))
      .finally(() => setLoading(false))
  }, [username])

  const LeetIcon = () => (
    <svg width="18" height="18" viewBox="0 0 50 50" fill="none">
      <path d="M25 0L50 43.3H0L25 0Z" fill="#FFA116" />
    </svg>
  )

  if (!username) return (
    <SectionCard title="LeetCode" icon={<LeetIcon />}>
      <div className="empty-state" style={{ padding: '30px 0' }}>
        <div className="empty-icon">🔗</div>
        <p>No LeetCode handle linked</p>
      </div>
    </SectionCard>
  )

  return (
    <SectionCard title="LeetCode Stats" icon={<LeetIcon />}
      actions={
        <a href={`https://leetcode.com/${username}`} target="_blank" rel="noreferrer"
          style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
          @{username} ↗
        </a>
      }>
      {loading ? <div className="loading-spinner" /> : error ? (
        <div className="empty-state" style={{ padding: '20px 0' }}><p style={{ color: 'var(--error)' }}>{error}</p></div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-1)' }}>{stats?.totalSolved || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solved</div>
            </div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFA116' }}>{stats?.ranking?.toLocaleString() || '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rank</div>
            </div>
          </div>

          {['easy', 'medium', 'hard'].map(diff => {
            const solved = stats?.[`${diff}Solved`] || 0
            const total = stats?.[`${diff}Total`] || 1
            const pct = Math.round((solved / total) * 100)
            const { color, bg } = DIFFICULTY_CONFIG[diff]
            return (
              <div key={diff} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color, fontWeight: 600, textTransform: 'capitalize' }}>{diff}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{solved} / {total}</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )
          })}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 16 }}>
            {[
              { label: 'Acceptance', value: `${stats?.acceptanceRate || 0}%` },
              { label: 'Streak', value: `${stats?.streak || 0}d` },
              { label: 'Contest Rating', value: stats?.contestRating || '—' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{item.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  )
}
