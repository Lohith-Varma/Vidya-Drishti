import { useState, useEffect } from 'react'
import { getAllStudents } from '../../api/student.api'
import './CodingProfiles.css'

export default function CodingProfiles() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLinked, setFilterLinked] = useState('all')

  useEffect(() => {
    getAllStudents()
      .then(res => setStudents(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.rollNumber?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filterLinked === 'all' ? true :
      filterLinked === 'leetcode' ? !!s.leetcodeHandle :
      filterLinked === 'hackerrank' ? !!s.hackerrankHandle :
      filterLinked === 'none' ? (!s.leetcodeHandle && !s.hackerrankHandle) : true
    return matchSearch && matchFilter
  })

  if (loading) return <div className="center-loader"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Student Coding Profiles</div>
          <div className="page-subtitle">View linked LeetCode, HackerRank & GitHub accounts</div>
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-2)', alignItems: 'center' }}>
          <span>🟡 LeetCode: {students.filter(s => s.leetcodeHandle).length}</span>
          <span>🟢 HackerRank: {students.filter(s => s.hackerrankHandle).length}</span>
          <span>⚫ GitHub: {students.filter(s => s.githubHandle).length}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="lb-search" style={{ flex: 1, minWidth: 220 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: 13, width: '100%' }} />
        </div>
        <div className="filter-tabs">
          {[{ k: 'all', l: 'All' }, { k: 'leetcode', l: '🟡 LeetCode' }, { k: 'hackerrank', l: '🟢 HackerRank' }, { k: 'none', l: '❌ Not Linked' }].map(f => (
            <button key={f.k} className={`filter-tab${filterLinked === f.k ? ' active' : ''}`} onClick={() => setFilterLinked(f.k)}>{f.l}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔍</div><h3>No students found</h3></div>
      ) : (
        <div className="profiles-grid">
          {filtered.map(student => {
            const initials = student.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            return (
              <div key={student.id} className="profile-student-card">
                <div className="profile-card-top">
                  <div className="table-avatar" style={{ width: 44, height: 44, fontSize: 15, flexShrink: 0 }}>{initials}</div>
                  <div className="profile-card-info">
                    <div className="profile-card-name">{student.name}</div>
                    <div className="profile-card-roll">{student.rollNumber} · {student.department}</div>
                  </div>
                  <span className={`badge ${student.avgScore >= 70 ? 'badge-success' : 'badge-warning'}`}>
                    {student.avgScore >= 70 ? 'Ready' : 'In Prog.'}
                  </span>
                </div>

                <div className="profile-card-handles">
                  {[
                    { key: 'leetcodeHandle', label: '🟡 LeetCode', base: 'https://leetcode.com/' },
                    { key: 'hackerrankHandle', label: '🟢 HackerRank', base: 'https://hackerrank.com/' },
                    { key: 'githubHandle', label: '⚫ GitHub', base: 'https://github.com/' },
                  ].map(h => (
                    <div key={h.key} className="profile-handle-row">
                      <span className="profile-handle-platform">{h.label}</span>
                      {student[h.key]
                        ? <a href={`${h.base}${student[h.key]}`} target="_blank" rel="noreferrer" className="profile-handle-link">@{student[h.key]}</a>
                        : <span className="profile-handle-missing">not linked</span>}
                    </div>
                  ))}
                </div>

                <div className="profile-card-scores">
                  {[
                    { lbl: 'Solved', val: student.totalSolved || 0 },
                    { lbl: 'Avg Score', val: `${student.avgScore || 0}%` },
                    { lbl: 'Tests', val: student.testsCompleted || 0 },
                  ].map(s => (
                    <div key={s.lbl} className="profile-score-box">
                      <div className="profile-score-val">{s.val}</div>
                      <div className="profile-score-lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
