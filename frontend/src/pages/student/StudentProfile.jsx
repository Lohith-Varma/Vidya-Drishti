import { useState, useEffect } from 'react'
import { useAuth } from '../../App'
import { getUserProfile, updateUserProfile } from '../../api/user.api'
import toast from 'react-hot-toast'
import './StudentProfile.css'

export default function StudentProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', rollNumber: '', department: '', year: '', phone: '',
    leetcodeHandle: '', hackerrankHandle: '', githubHandle: '', bio: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUserProfile()
      .then(res => setForm(f => ({ ...f, ...res.data })))
      .catch(() => setForm(f => ({ ...f, ...user })))
      .finally(() => setLoading(false))
  }, [user])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateUserProfile(form)
      updateUser(res.data)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = form.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  if (loading) return <div className="center-loader"><div className="loading-spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-subtitle">Manage your account information and coding handles</div>
        </div>
      </div>

      <div className="profile-layout">
        <div className="profile-card-left">
          <div className="profile-avatar-section">
            <div className="profile-avatar-big">
              {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
              <div className="avatar-overlay">📷</div>
            </div>
            <div className="profile-name">{form.name || 'Student'}</div>
            <div className="profile-roll">{form.rollNumber || 'Roll No. N/A'}</div>
            {form.department && <div className="profile-dept">{form.department}</div>}
          </div>

          <div className="profile-stats-mini">
            {[
              { label: 'Solved', value: user?.totalSolved || 0 },
              { label: 'Tests', value: user?.testsCompleted || 0 },
              { label: 'Rank', value: user?.rank ? `#${user.rank}` : '—' },
            ].map(s => (
              <div key={s.label} className="profile-stat-mini">
                <div className="profile-stat-mini-value">{s.value}</div>
                <div className="profile-stat-mini-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="profile-handles">
            <h3>Coding Handles</h3>
            {[
              { platform: 'LeetCode', key: 'leetcodeHandle', url: 'https://leetcode.com/' },
              { platform: 'HackerRank', key: 'hackerrankHandle', url: 'https://hackerrank.com/' },
              { platform: 'GitHub', key: 'githubHandle', url: 'https://github.com/' },
            ].map(h => (
              <div key={h.key} className="handle-item">
                <span className="handle-platform">{h.platform}</span>
                              // ...continuing from handle-item map inside profile-handles div
                <span className="handle-value">{form[h.key] || 'Not linked'}</span>
                {form[h.key] && (
                  <a href={`${h.url}${form[h.key]}`} target="_blank" rel="noreferrer" className="handle-link">↗</a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            <div className="profile-form-section" style={{ marginBottom: 20 }}>
              <h3>Personal Information</h3>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} placeholder="you@college.edu" />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input name="rollNumber" className="form-input" value={form.rollNumber} onChange={handleChange} placeholder="e.g. 21CS001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select name="department" className="form-select" value={form.department} onChange={handleChange}>
                    <option value="">Select Department</option>
                    {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Study</label>
                  <select name="year" className="form-select" value={form.year} onChange={handleChange}>
                    <option value="">Select Year</option>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Bio</label>
                  <textarea name="bio" className="form-textarea" value={form.bio} onChange={handleChange} placeholder="Write a short bio about yourself..." rows={3} />
                </div>
              </div>
            </div>

            <div className="profile-form-section" style={{ marginBottom: 20 }}>
              <h3>Coding Platform Handles</h3>
              <div className="profile-form-grid">
                {[
                  { name: 'leetcodeHandle', label: 'LeetCode Username', placeholder: 'your_leetcode_id', emoji: '🟡' },
                  { name: 'hackerrankHandle', label: 'HackerRank Username', placeholder: 'your_hackerrank_id', emoji: '🟢' },
                  { name: 'githubHandle', label: 'GitHub Username', placeholder: 'your_github_id', emoji: '⚫' },
                  { name: 'codeforcesHandle', label: 'Codeforces Handle', placeholder: 'your_cf_handle', emoji: '🔵' },
                ].map(h => (
                  <div className="form-group" key={h.name}>
                    <label className="form-label">{h.emoji} {h.label}</label>
                    <input name={h.name} className="form-input" value={form[h.name] || ''} onChange={handleChange} placeholder={h.placeholder} style={{ fontFamily: 'monospace' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-form-section">
              <h3>Resume & Links</h3>
              <div className="profile-form-grid">
                <div className="form-group">
                  <label className="form-label">LinkedIn Profile URL</label>
                  <input name="linkedinUrl" className="form-input" value={form.linkedinUrl || ''} onChange={handleChange} placeholder="https://linkedin.com/in/yourname" />
                </div>
                <div className="form-group">
                  <label className="form-label">Resume URL</label>
                  <input name="resumeUrl" className="form-input" value={form.resumeUrl || ''} onChange={handleChange} placeholder="https://drive.google.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Portfolio / Website</label>
                  <input name="portfolioUrl" className="form-input" value={form.portfolioUrl || ''} onChange={handleChange} placeholder="https://yoursite.dev" />
                </div>
              </div>
              <div className="profile-actions">
                <button type="button" className="btn btn-secondary" onClick={() => toast('Changes discarded')}>Discard</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

