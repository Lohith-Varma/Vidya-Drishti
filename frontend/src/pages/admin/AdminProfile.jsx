import { useState, useEffect } from 'react'
import { useAuth } from '../../App'
import { getUserProfile, updateUserProfile } from '../../api/user.api'
import { changePassword } from '../../api/auth.api'
import toast from 'react-hot-toast'
import SectionCard from '../../components/SectionCard'
import './AdminProfile.css'

export default function AdminProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', department: '', employeeId: '', phone: '', bio: '' })
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUserProfile()
      .then(res => setForm(f => ({ ...f, ...res.data })))
      .catch(() => setForm(f => ({ ...f, ...user })))
      .finally(() => setLoading(false))
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try { const res = await updateUserProfile(form); updateUser(res.data); toast.success('Profile updated!') }
    catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwdForm.newPwd !== pwdForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwdForm.newPwd.length < 6) { toast.error('Password too short'); return }
    try {
      await changePassword({ currentPassword: pwdForm.current, newPassword: pwdForm.newPwd })
      toast.success('Password changed successfully!'); setPwdForm({ current: '', newPwd: '', confirm: '' })
    } catch { toast.error('Failed to change password') }
  }

  const initials = form.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'
  if (loading) return <div className="center-loader"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Admin Profile</div><div className="page-subtitle">Manage your faculty account and preferences</div></div>
      </div>

      <div className="admin-profile-layout">
        <div className="admin-profile-card">
          <div className="profile-avatar-big" style={{ width: 80, height: 80, fontSize: 28, background: 'rgba(14,165,233,0.1)', border: '3px solid var(--accent)', color: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            {initials}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)' }}>{form.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{form.email}</div>
          <div className="admin-role-badge">👨‍💼 Faculty / Admin</div>
          {form.department && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{form.department}</div>}
          {form.employeeId && <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'monospace' }}>ID: {form.employeeId}</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SectionCard title="Personal Information" icon={<span>👤</span>}>
            <form onSubmit={handleSave}>
              <div className="profile-form-grid">
                {[
                  { name: 'name', label: 'Full Name', placeholder: 'Dr. First Last' },
                  { name: 'email', label: 'Email', placeholder: 'faculty@college.edu', type: 'email' },
                  { name: 'employeeId', label: 'Employee ID', placeholder: 'FAC001' },
                  { name: 'department', label: 'Department', placeholder: 'Computer Science' },
                  { name: 'phone', label: 'Phone', placeholder: '+91 XXXXX XXXXX' },
                ].map(f => (
                  <div className="form-group" key={f.name}>
                    <label className="form-label">{f.label}</label>
                    <input name={f.name} type={f.type || 'text'} className="form-input" value={form[f.name] || ''} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} placeholder={f.placeholder} />
                  </div>
                ))}
                <div className="form-group form-full">
                  <label className="form-label">Bio</label>
                  <textarea name="bio" className="form-textarea" value={form.bio || ''} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Short faculty bio..." rows={3} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Changes'}</button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Change Password" icon={<span>🔐</span>}>
            <form onSubmit={handlePasswordChange}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { name: 'current', label: 'Current Password' },
                  { name: 'newPwd', label: 'New Password' },
                  { name: 'confirm', label: 'Confirm New Password' },
                ].map(f => (
                  <div className="form-group" key={f.name}>
                    <label className="form-label">{f.label}</label>
                    <input type="password" className="form-input" value={pwdForm[f.name]} onChange={e => setPwdForm(p => ({ ...p, [f.name]: e.target.value }))} placeholder="••••••••" />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary">🔒 Update Password</button>
              </div>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
