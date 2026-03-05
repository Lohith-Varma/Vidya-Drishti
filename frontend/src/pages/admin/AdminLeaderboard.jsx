import { useState, useEffect } from 'react'
import { getLeaderboard } from '../../api/student.api'
import Table from '../../components/Table'
import SectionCard from '../../components/SectionCard'
import './AdminLeaderboard.css'

export default function AdminLeaderboard() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('overall')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getLeaderboard({ type: filter })
      .then(res => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [filter])

  const filtered = data.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'rank', label: '#', width: '60px',
      render: (_, row) => {
        const r = filtered.findIndex(d => d.id === row.id) + 1
        const cls = r === 1 ? 'rank-1' : r === 2 ? 'rank-2' : r === 3 ? 'rank-3' : 'rank-other'
        return <div className={`table-rank ${cls}`}>{r <= 3 ? ['🥇', '🥈', '🥉'][r - 1] : r}</div>
      }
    },
    {
      key: 'name', label: 'Student',
      render: (name, row) => (
        <div className="table-user">
          <div className="table-avatar">{name?.slice(0,2).toUpperCase()}</div>
          <div>
            <div className="table-user-name">{name}</div>
            <div className="table-user-sub">{row.rollNumber} · {row.department}</div>
          </div>
        </div>
      )
    },
    { key: 'leetcodeHandle', label: 'LeetCode', render: v => v ? <a href={`https://leetcode.com/${v}`} target="_blank" rel="noreferrer" style={{ color: '#FFA116', fontFamily: 'monospace', fontSize: 12 }}>@{v}</a> : <span style={{ color: 'var(--text-3)' }}>—</span> },
    { key: 'totalSolved', label: 'Solved', render: v => <strong style={{ color: 'var(--text-1)' }}>{v || 0}</strong> },
    { key: 'testsCompleted', label: 'Tests', render: v => v || 0 },
    { key: 'avgScore', label: 'Avg Score', render: v => <span className={v >= 70 ? 'text-success' : v >= 40 ? 'text-warning' : 'text-error'}>{v || 0}%</span> },
    { key: 'totalScore', label: 'Total Score', render: v => <strong style={{ color: 'var(--primary-light)', fontSize: 15 }}>{v || 0}</strong> },
    {
      key: 'status', label: 'Readiness',
      render: (_, row) => {
        const ready = (row.avgScore >= 70) && (row.totalSolved >= 100)
        return <span className={`badge ${ready ? 'badge-success' : 'badge-warning'}`}>{ready ? '✓ Ready' : '⚠ In Progress'}</span>
      }
    }
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Student Leaderboard</div>
          <div className="page-subtitle">Full ranking with detailed performance metrics</div>
        </div>
        <button className="btn btn-secondary" onClick={() => {
          const csv = [Object.keys(data[0] || {}).join(','), ...data.map(r => Object.values(r).join(','))].join('\n')
          const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
          a.download = 'leaderboard.csv'; a.click()
        }}>⬇ Export CSV</button>
      </div>

      <div className="admin-lb-filters">
        <div className="filter-tabs">
          {[{ key: 'overall', label: '🌟 Overall' }, { key: 'leetcode', label: '🟡 LeetCode' }, { key: 'tests', label: '📋 Tests' }, { key: 'hackerrank', label: '🟢 HackerRank' }].map(f => (
            <button key={f.key} className={`filter-tab${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <div className="lb-search">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search by name or roll number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <SectionCard title={`Rankings — ${filtered.length} students`} icon={<span>📊</span>} noPadding>
        <Table columns={columns} data={filtered} loading={loading} pageSize={20} />
      </SectionCard>
    </div>
  )
}
