import { useState, useEffect } from 'react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const empty = { name: '', code: '', city: '', state: '', address: '', website: '' }

export default function ManageColleges() {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(empty)
  const [saving, setSaving]     = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/platform/colleges')
      .then(r => setColleges(r.data))
      .catch(() => toast.error('Failed to load colleges'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }
  const openEdit   = (c) => {
    setEditing(c)
    setForm({ name: c.name, code: c.code, city: c.city||'', state: c.state||'', address: c.address||'', website: c.website||'' })
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/platform/colleges/${editing.id}`, form)
        toast.success('College updated.')
      } else {
        await api.post('/platform/colleges', form)
        toast.success('College created.')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  const handleToggle = async (c) => {
    try {
      await api.put(`/platform/colleges/${c.id}`, { isActive: !c.isActive })
      toast.success(`College ${!c.isActive ? 'activated' : 'deactivated'}.`)
      load()
    } catch { toast.error('Failed.') }
  }

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/platform/colleges/${c.id}`)
      toast.success('College deleted.')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed.') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏛️ Manage Colleges</h1>
          <p className="page-subtitle">{colleges.length} colleges on the platform</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add College</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 520 }}>
            <h3 style={{ marginBottom: 20, color: 'var(--text-1)' }}>
              {editing ? '✏️ Edit College' : '🏛️ Add New College'}
            </h3>
            <form onSubmit={handleSave}>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label className="form-label">College Name *</label>
                  <input className="form-input" value={form.name} required
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Code * (e.g. IITM)</label>
                  <input className="form-input" value={form.code} required
                    style={{ textTransform: 'uppercase' }}
                    onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={form.state}
                    onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Website URL</label>
                  <input className="form-input" type="url" value={form.website} placeholder="https://"
                    onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update College' : 'Create College'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* College cards */}
      {loading
        ? <div className="page-loader"><div className="loading-spinner" /></div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
            {colleges.map(c => (
              <div key={c.id} className="card" style={{ opacity: c.isActive ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{c.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <span className="badge badge-default">{c.code}</span>
                      {c.city && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>📍 {c.city}, {c.state}</span>}
                    </div>
                  </div>
                  <span className={`badge ${c.isActive ? 'badge-success' : 'badge-error'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                  {[
                    { label: 'Students',    val: c.studentCount },
                    { label: 'Assessments', val: c.assessmentCount },
                    { label: 'Admins',      val: c.admins?.length || 0 },
                    { label: 'Website',     val: c.website ? '🔗 Visit' : '—', link: c.website },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                      {item.link
                        ? <a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent)' }}>{item.val}</a>
                        : <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{item.val}</div>
                      }
                    </div>
                  ))}
                </div>

                {c.admins?.length > 0 && (
                  <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--text-3)' }}>
                    👨‍💼 {c.admins.map(a => a.name).join(', ')}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(c)}>✏️ Edit</button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleToggle(c)}>
                    {c.isActive ? '🔴 Deactivate' : '🟢 Activate'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
