import { useState, useEffect } from 'react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function PlatformStudents() {
  const [students, setStudents] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filters, setFilters]   = useState({ collegeId: '', department: '', search: '' })

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.collegeId)  params.set('collegeId',  filters.collegeId)
    if (filters.department) params.set('department', filters.department)
    if (filters.search)     params.set('search',     filters.search)

    Promise.all([
      api.get(`/platform/students?${params}`),
      api.get('/platform/colleges')
    ])
      .then(([s, c]) => { setStudents(s.data); setColleges(c.data) })
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [filters.collegeId, filters.department])

  const handleSearch = (e) => {
    if (e.key === 'Enter') load()
  }

  const toggleStatus = async (student) => {
    try {
      const res = await api.patch(`/platform/students/${student.id}/toggle`)
      toast.success(res.data.message)
      load()
    } catch { toast.error('Failed.') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎓 All Students</h1>
          <p className="page-subtitle">{students.length} students across all colleges</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="form-input" style={{ flex: 1, minWidth: 200 }}
          placeholder="🔍 Search by name, roll no, email..."
          value={filters.search}
          onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
          onKeyDown={handleSearch}
        />
        <select className="form-select" style={{ width: 200 }}
          value={filters.collegeId}
          onChange={e => setFilters(p => ({ ...p, collegeId: e.target.value }))}>
          <option value="">All Colleges</option>
          {colleges.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
        </select>
        <button className="btn btn-primary" onClick={load}>Search</button>
      </div>

      {loading
        ? <div className="page-loader"><div className="loading-spinner" /></div>
        : (
          <div className="card" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
                    {['Student', 'College', 'Roll No', 'Dept / Year', 'LeetCode', 'Avg Score', 'Total Score', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0
                    ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No students found</td></tr>
                    : students.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', opacity: s.isActive ? 1 : 0.5 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{s.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {s.college
                            ? <span className="badge badge-info">{s.college.code}</span>
                            : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2)' }}>{s.rollNumber || '—'}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.department || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.year || ''}</div>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: s.totalSolved > 0 ? 'var(--accent)' : 'var(--text-3)' }}>
                          {s.totalSolved > 0 ? `🟡 ${s.totalSolved}` : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: s.avgScore >= 70 ? 'var(--success)' : s.avgScore >= 50 ? 'var(--warning)' : 'var(--error)' }}>
                          {s.avgScore > 0 ? `${s.avgScore}%` : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--primary-light)' }}>{s.totalScore}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className={`badge ${s.isActive ? 'badge-success' : 'badge-error'}`}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <button className={`btn btn-sm ${s.isActive ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => toggleStatus(s)}>
                            {s.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  )
}
