import { useState, useEffect } from 'react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function ManageAdmins() {
  const [admins, setAdmins]     = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({ name:'', email:'', password:'', employeeId:'', department:'', phone:'', collegeId:'' })
  const [resetModal, setResetModal] = useState(null)
  const [newPwd, setNewPwd] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/platform/admins'), api.get('/platform/colleges')])
      .then(([a, c]) => { setAdmins(a.data); setColleges(c.data) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/platform/admins', form)
      toast.success(`Admin account created for ${form.name}.`)
      setShowForm(false)
      setForm({ name:'', email:'', password:'', employeeId:'', department:'', phone:'', collegeId:'' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (admin) => {
    if (!window.confirm(`Remove ${admin.name} as college admin?`)) return
    try {
      await api.delete(`/platform/admins/${admin.id}`)
      toast.success('Admin removed.')
      load()
    } catch { toast.error('Failed to remove.') }
  }

  const handleReset = async () => {
    if (!newPwd || newPwd.length < 6) return toast.error('Min 6 characters.')
    try {
      await api.post(`/platform/admins/${resetModal.id}/reset-password`, { newPassword: newPwd })
      toast.success('Password reset successfully.')
      setResetModal(null); setNewPwd('')
    } catch { toast.error('Reset failed.') }
  }

  const toggleStatus = async (admin) => {
    try {
      await api.put(`/platform/admins/${admin.id}`, { isActive: !admin.isActive })
      toast.success(`Admin ${!admin.isActive ? 'activated' : 'deactivated'}.`)
      load()
    } catch { toast.error('Failed.') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👨‍💼 College Admins</h1>
          <p className="page-subtitle">{admins.length} admins across all colleges</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Admin</button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}>
          <div className="card" style={{ width:'100%', maxWidth:520 }}>
            <h3 style={{ marginBottom:20, color:'var(--text-1)' }}>👨‍💼 Create College Admin</h3>
            <form onSubmit={handleCreate}>
              <div className="profile-form-grid">
                <div className="form-group form-full">
                  <label className="form-label">Assign to College *</label>
                  <select className="form-select" value={form.collegeId} required
                    onChange={e => setForm(p => ({ ...p, collegeId: e.target.value }))}>
                    <option value="">— Select College —</option>
                    {colleges.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                {[
                  { key:'name',       label:'Full Name *',     type:'text',     required:true },
                  { key:'email',      label:'Email *',         type:'email',    required:true },
                  { key:'password',   label:'Password *',      type:'password', required:true },
                  { key:'employeeId', label:'Employee ID',     type:'text',     required:false },
                  { key:'department', label:'Department',      type:'text',     required:false },
                  { key:'phone',      label:'Phone',           type:'text',     required:false },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type={f.type} required={f.required}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div className="card" style={{ width:360 }}>
            <h3 style={{ marginBottom:16 }}>🔑 Reset Password</h3>
            <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:16 }}>Reset password for <strong>{resetModal.name}</strong></p>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={newPwd}
                onChange={e => setNewPwd(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16, justifyContent:'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setResetModal(null); setNewPwd('') }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReset}>Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin list */}
      {loading
        ? <div className="page-loader"><div className="loading-spinner" /></div> 
        : 
        (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
            {admins.map(a => (
              <div key={a.id} className="card" style={{ opacity: a.isActive ? 1 : 0.6 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#0ea5e9)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, color:'#fff' }}>
                    {a.name.charAt(0)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, color:'var(--text-1)' }}>{a.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.email}</div>
                  </div>
                  <span className={`badge ${a.isActive ? 'badge-success' : 'badge-error'}`}>{a.isActive ? 'Active':'Inactive'}</span>
                </div>

                <div style={{ padding:'10px 0', borderTop:'1px solid var(--border)', marginBottom:12, display:'flex', flexDirection:'column', gap:5 }}>
                  {a.college && <div style={{ fontSize:12, color:'var(--text-2)' }}>🏛️ <strong>{a.college.name}</strong> ({a.college.code})</div>}
                  {a.department && <div style={{ fontSize:12, color:'var(--text-3)' }}>📚 {a.department}</div>}
                  {a.employeeId && <div style={{ fontSize:12, color:'var(--text-3)' }}>🪪 {a.employeeId}</div>}
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>📅 Joined {new Date(a.createdAt).toLocaleDateString()}</div>
                </div>

                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setResetModal(a); setNewPwd('') }}>🔑 Reset Pwd</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleStatus(a)}>
                    {a.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a)}>🗑️ Remove</button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
