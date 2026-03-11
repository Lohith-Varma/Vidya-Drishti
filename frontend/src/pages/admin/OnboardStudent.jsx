import { useState } from 'react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const singleEmpty = {
  name: '', email: '', rollNumber: '', department: '',
  year: '', phone: '', leetcodeHandle: '', hackerrankHandle: '', password: ''
}

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Artificial Intelligence', 'Data Science']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export default function OnboardStudent() {
  const [tab, setTab]         = useState('single')
  const [form, setForm]       = useState(singleEmpty)
  const [saving, setSaving]   = useState(false)
  const [result, setResult]   = useState(null)

  // Bulk state
  const [bulkText, setBulkText]   = useState('')
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkSaving, setBulkSaving] = useState(false)

  // ── Single onboard ──────────────────────────────────────
  const handleSingle = async (e) => {
    e.preventDefault()
    setSaving(true)
    setResult(null)
    try {
      const res = await api.post('/college/students/onboard', form)
      setResult({ type: 'success', student: res.data.student, tempPassword: res.data.tempPassword })
      toast.success(`✅ ${res.data.student.name} onboarded!`)
      setForm(singleEmpty)
    } catch (err) {
      setResult({ type: 'error', message: err.response?.data?.message || 'Onboarding failed.' })
      toast.error(err.response?.data?.message || 'Onboarding failed.')
    } finally { setSaving(false) }
  }

  // ── Bulk onboard ────────────────────────────────────────
  // Expects CSV format: name,email,rollNumber,department,year
  const parseBulkCSV = (text) => {
    const lines = text.trim().split('\n').filter(Boolean)
    const students = []
    const errors   = []
    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes('name')) return // skip header
      const parts = line.split(',').map(p => p.trim())
      if (parts.length < 3) {
        errors.push(`Line ${idx + 1}: needs at least name, email, rollNumber`)
        return
      }
      students.push({
        name: parts[0], email: parts[1], rollNumber: parts[2],
        department: parts[3] || '', year: parts[4] || ''
      })
    })
    return { students, errors }
  }

  const handleBulk = async () => {
    const { students, errors } = parseBulkCSV(bulkText)
    if (errors.length > 0) {
      toast.error(`CSV errors:\n${errors.slice(0,3).join('\n')}`)
      return
    }
    if (students.length === 0) { toast.error('No valid students found in CSV.'); return }
    setBulkSaving(true)
    setBulkResult(null)
    try {
      const res = await api.post('/college/students/bulk', { students })
      setBulkResult(res.data)
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk onboard failed.')
    } finally { setBulkSaving(false) }
  }

  const downloadTemplate = () => {
    const csv = 'name,email,rollNumber,department,year\nPriya Sharma,priya@college.edu,21CS001,Computer Science,3rd Year\nRahul Gupta,rahul@college.edu,21CS002,Computer Science,3rd Year'
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'student_template.csv'
    a.click()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎓 Onboard Students</h1>
          <p className="page-subtitle">Add students to your college — they'll login with their generated credentials</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {[{ key: 'single', label: '👤 Single Student' }, { key: 'bulk', label: '📋 Bulk CSV Import' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={tab === t.key ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SINGLE FORM ────────────────────────────────── */}
      {tab === 'single' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--text-1)' }}>Student Details</h3>
            <form onSubmit={handleSingle}>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} required
                    placeholder="e.g. Priya Sharma"
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" value={form.email} required
                    placeholder="student@college.edu"
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input className="form-input" value={form.rollNumber} required
                    placeholder="e.g. 21CS001"
                    onChange={e => setForm(p => ({ ...p, rollNumber: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" value={form.phone}
                    placeholder="+91 98765 43210"
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-select" value={form.department}
                    onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                    <option value="">— Select Department —</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={form.year}
                    onChange={e => setForm(p => ({ ...p, year: e.target.value }))}>
                    <option value="">— Select Year —</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">LeetCode Handle</label>
                  <input className="form-input" value={form.leetcodeHandle}
                    placeholder="leetcode_username"
                    onChange={e => setForm(p => ({ ...p, leetcodeHandle: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">HackerRank Handle</label>
                  <input className="form-input" value={form.hackerrankHandle}
                    placeholder="hackerrank_username"
                    onChange={e => setForm(p => ({ ...p, hackerrankHandle: e.target.value }))} />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Custom Password <span style={{ color: 'var(--text-3)', textTransform: 'none', fontWeight: 400 }}>(leave blank to auto-generate from roll number)</span></label>
                  <input className="form-input" type="text" value={form.password}
                    placeholder={`Auto: ${form.rollNumber || 'ROLLNO'}@${new Date().getFullYear()}`}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}
                  style={{ width: '100%', padding: '12px' }}>
                  {saving ? '⏳ Onboarding...' : '🎓 Onboard Student'}
                </button>
              </div>
            </form>
          </div>

          {/* Result / info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {result && (
              <div className="card" style={{
                borderColor: result.type === 'success' ? 'var(--success)' : 'var(--error)',
                background: result.type === 'success' ? 'rgba(34,197,94,0.06)' : 'var(--error-bg)'
              }}>
                {result.type === 'success' ? (
                  <>
                    <div style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 12 }}>✅ Student Onboarded!</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { label: 'Name',     val: result.student.name },
                        { label: 'Email',    val: result.student.email },
                        { label: 'Roll No',  val: result.student.rollNumber },
                        { label: 'Password', val: result.tempPassword },
                      ].map(({ label, val }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: 'var(--text-3)' }}>{label}</span>
                          <span style={{ fontWeight: 600, color: label === 'Password' ? 'var(--warning)' : 'var(--text-1)', fontFamily: label === 'Password' ? 'monospace' : 'inherit' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12 }}>
                      ⚠️ Share these credentials with the student. They can change their password after login.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ color: 'var(--error)', fontWeight: 700, marginBottom: 8 }}>❌ Onboarding Failed</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{result.message}</div>
                  </>
                )}
              </div>
            )}

            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text-1)' }}>ℹ️ How it works</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '1️⃣', text: 'Fill the student details and submit' },
                  { icon: '2️⃣', text: 'A student account is created in your college' },
                  { icon: '3️⃣', text: 'Share the email + password with the student' },
                  { icon: '4️⃣', text: 'Student logs in and can change their password' },
                  { icon: '🔒', text: 'Student only sees your college\'s assessments' },
                ].map(({ icon, text }, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BULK CSV IMPORT ─────────────────────────────── */}
      {tab === 'bulk' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-1)' }}>📋 Paste CSV Data</h3>
              <button className="btn btn-secondary btn-sm" onClick={downloadTemplate}>⬇️ Download Template</button>
            </div>

            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', marginBottom: 12, fontSize: 12, fontFamily: 'monospace', color: 'var(--text-3)' }}>
              Format: name, email, rollNumber, department, year<br />
              e.g.  Priya Sharma, priya@iitm.ac.in, 21CS001, Computer Science, 3rd Year
            </div>

            <textarea
              className="form-textarea"
              style={{ minHeight: 280, fontFamily: 'monospace', fontSize: 12 }}
              placeholder={'name,email,rollNumber,department,year\nPriya Sharma,priya@college.edu,21CS001,Computer Science,3rd Year\nRahul Gupta,rahul@college.edu,21CS002,Computer Science,3rd Year'}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {bulkText.trim() ? `≈ ${bulkText.trim().split('\n').filter(Boolean).length} rows detected` : 'Paste CSV data above'}
              </span>
              <button className="btn btn-primary" onClick={handleBulk} disabled={bulkSaving || !bulkText.trim()}>
                {bulkSaving ? '⏳ Importing...' : '📤 Bulk Import'}
              </button>
            </div>
          </div>

          {/* Bulk result */}
          <div>
            {bulkResult ? (
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--text-1)' }}>📊 Import Results</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{bulkResult.results.success.length}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Onboarded</div>
                  </div>
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--error)' }}>{bulkResult.results.failed.length}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Failed</div>
                  </div>
                </div>

                {bulkResult.results.success.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>✅ Successfully Onboarded</div>
                    <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {bulkResult.results.success.map((s, i) => (
                        <div key={i} style={{ fontSize: 12, background: 'var(--bg-main)', padding: '6px 10px', borderRadius: 6 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{s.name}</div>
                          <div style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>{s.email} · 🔑 {s.tempPassword}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bulkResult.results.failed.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--error)', marginBottom: 8 }}>❌ Failed</div>
                    {bulkResult.results.failed.map((s, i) => (
                      <div key={i} style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>
                        {s.name || s.email} — <span style={{ color: 'var(--error)' }}>{s.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text-1)' }}>📌 Bulk Import Guide</div>
                {[
                  { icon: '📄', text: 'Download the CSV template first' },
                  { icon: '✏️', text: 'Fill in student details (one per row)' },
                  { icon: '📋', text: 'Copy all rows and paste into the editor' },
                  { icon: '⚡', text: 'Up to 200 students per batch' },
                  { icon: '🔑', text: 'Auto-password: rollNumber@year (e.g. 21CS001@2026)' },
                  { icon: '⚠️', text: 'Duplicate emails/roll numbers will be skipped' },
                ].map(({ icon, text }, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
