import { useState, useEffect } from 'react'
import { useAuth } from '../../App'
import { getLeaderboard } from '../../api/student.api'
import Table from '../../components/Table'
import SectionCard from '../../components/SectionCard'
import './StudentLeaderboard.css'

export default function StudentLeaderboard() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('overall')

  useEffect(() => {
    getLeaderboard({ type: filter })
      .then(res => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [filter])

  const myEntry = data.find(s => s.id === user.id)
  const top3 = data.slice(0, 3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)
  const podiumClass = [2, 1, 3]

  const columns = [
    {
      key: 'rank', label: '#', width: '60px',
      render: (_, row) => {
        const r = data.findIndex(d => d.id === row.id) + 1
        const cls = r === 1 ? 'rank-1' : r === 2 ? 'rank-2' : r === 3 ? 'rank-3' : 'rank-other'
        return <div className={`table-rank ${cls}`}>{r <= 3 ? ['🥇','🥈','🥉'][r-1] : r}</div>
      }
    },
    {
      key: 'name', label: 'Student',
      render: (name, row) => {
        const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
        return (
          <div className="table-user">
            <div className="table-avatar">{row.avatar ? <img src={row.avatar} alt="" /> : initials}</div>
            <div>
              <div className="table-user-name">{name} {row.id === user.id && <span style={{ fontSize: 10, background: 'var(--primary-glow)', color: 'var(--primary-light)', padding: '1px 6px', borderRadius: 10, marginLeft: 4 }}>You</span>}</div>
              <div className="table-user-sub">{row.rollNumber} · {row.department}</div>
            </div>
          </div>
        )
      }
    },
    { key: 'totalSolved', label: 'Problems', render: v => <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{v}</span> },
    { key: 'testsScore', label: 'Test Avg', render: v => <span className={v >= 70 ? 'text-success' : v >= 40 ? 'text-warning' : 'text-error'}>{v}%</span> },
    { key: 'leetcodeRank', label: 'LC Rank', render: v => v ? `#${v.toLocaleString()}` : '—' },
    { key: 'totalScore', label: 'Score', render: v => <span style={{ fontWeight: 800, color: 'var(--primary-light)', fontSize: 15 }}>{v}</span> },
  ]

  return (
    <div>
      <div className="leaderboard-header-banner">
        <div>
          <h2>🏆 Department Leaderboard</h2>
          <p>Rankings based on problems solved, test scores & coding platform performance</p>
        </div>
        <div style={{ fontSize: 48 }}>🎯</div>
      </div>

      {myEntry && (
        <div className="my-rank-highlight">
          <div>🙋 Your Rank: <strong>#{data.findIndex(d => d.id === user.id) + 1}</strong></div>
          <div className="divider" style={{ width: 1, height: 30, margin: 0 }} />
          <div>Score: <strong style={{ color: 'var(--text-1)' }}>{myEntry.totalScore}</strong></div>
          <div>Problems: <strong style={{ color: 'var(--text-1)' }}>{myEntry.totalSolved}</strong></div>
          <div>Test Avg: <strong style={{ color: myEntry.testsScore >= 70 ? 'var(--success)' : 'var(--warning)' }}>{myEntry.testsScore}%</strong></div>
        </div>
      )}

      {top3.length >= 3 && (
        <SectionCard title="Top 3 Performers" icon={<span>🏅</span>} style={{ marginBottom: 20 }}>
          <div className="top3-podium">
            {podiumOrder.map((student, i) => {
              if (!student) return null
              const pClass = `podium-${podiumClass[i]}`
              const initials = student.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              return (
                <div key={student.id} className={`podium-card ${pClass}`}>
                  <div className="podium-avatar">
                    {podiumClass[i] === 1 && <span className="podium-crown">👑</span>}
                    {student.avatar ? <img src={student.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
                  </div>
                  <div className="podium-name">{student.name}</div>
                  <div className="podium-score">{student.totalScore} pts</div>
                  <div className="podium-block">{podiumClass[i]}</div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Full Rankings" icon={<span>📊</span>}
        actions={
          <div className="filter-tabs">
            {[
              { key: 'overall', label: '🌟 Overall' },
              { key: 'leetcode', label: '🟡 LeetCode' },
              { key: 'tests', label: '📋 Tests' },
            ].map(f => (
              <button key={f.key} className={`filter-tab${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
        }
        noPadding>
        <Table columns={columns} data={data} loading={loading} pageSize={15} />
      </SectionCard>
    </div>
  )
}
