import { useState, useEffect } from 'react'
import { getHackerRankStats } from '../api/hackerrank.api'
import SectionCard from './SectionCard'

const BADGE_COLORS = { gold: '#ffd700', silver: '#c0c0c0', bronze: '#cd7f32' }

export default function HackerRankStatsCard({ username }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username) { setLoading(false); return }
    getHackerRankStats(username)
      .then(res => setStats(res.data))
      .catch(() => setError('Could not load HackerRank stats'))
      .finally(() => setLoading(false))
  }, [username])

  const HRIcon = () => (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="#00EA64"><path d="M16 0L0 8v16l16 8 16-8V8L16 0z"/></svg>
  )

  if (!username) return (
    <SectionCard title="HackerRank" icon={<HRIcon />}>
      <div className="empty-state" style={{ padding: '30px 0' }}>
        <div className="empty-icon">🔗</div>
        <p>No HackerRank handle linked</p>
      </div>
    </SectionCard>
  )

  return (
    <SectionCard title="HackerRank Stats" icon={<HRIcon />}
      actions={
        <a href={`https://hackerrank.com/${username}`} target="_blank" rel="noreferrer"
          style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
          @{username} ↗
        </a>
      }>
      {loading ? <div className="loading-spinner" /> : error ? (
        <div className="empty-state" style={{ padding: '20px 0' }}><p style={{ color: 'var(--error)' }}>{error}</p></div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Rank', value: `#${stats?.rank?.toLocaleString() || '—'}` },
              { label: 'Score', value: stats?.score || 0 },
              { label: 'Problems Solved', value: stats?.solved || 0 },
              { label: 'Certifications', value: stats?.certifications || 0 },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)' }}>{item.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {stats?.badges?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>Badges</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stats.badges.map((badge, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, border: `1px solid ${BADGE_COLORS[badge.type] || '#444'}`, background: 'var(--bg-main)' }}>
                    <span style={{ color: BADGE_COLORS[badge.type] || '#888', fontSize: 14 }}>★</span>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}
