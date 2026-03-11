import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../App'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import './LoginPage.css'

const TABS = [
  { key: 'student',        label: '🎓 Student',         color: '#22c55e' },
  { key: 'college_admin',  label: '👨‍💼 College Admin',   color: '#6366f1' },
  { key: 'platform_admin', label: '🛡️ Platform Admin',  color: '#f59e0b' },
]

const DEMO_CREDS = {
  student:        { email: 'student1@iitm.ac.in',       password: 'password123' },
  college_admin:  { email: 'admin.iitm@college.edu',    password: 'password123' },
  platform_admin: { email: 'platform@vidyadrishti.in',  password: 'password123' },
}

const ROLE_REDIRECT = {
  platform_admin: '/platform',
  college_admin:  '/admin',
  student:        '/student',
}

export default function LoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [tab, setTab] = useState('student')
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const activeTab = TABS.find(t => t.key === tab)

  const fillDemo = (roleKey) => {
    setTab(roleKey)
    setForm(DEMO_CREDS[roleKey])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill in all fields.')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: tab.toUpperCase(),
      })

      const userData = {
        ...res.data.user,
        role: (res.data.user.role || tab).toLowerCase(),
      }

      login(userData, res.data.token)
      toast.success(`Welcome, ${userData.name?.split(' ')[0]}! 👋`)
      navigate(ROLE_REDIRECT[userData.role] || '/login', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand-icon">🎓</span>
          <div>
            <h1>Vidya-Drishti</h1>
            <p>Academic Performance Dashboard</p>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-top">
            <h2>Welcome back</h2>
            <p>Select your role and sign in</p>
          </div>

          {/* Role Tabs — 3 roles */}
          <div className="login-tabs" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {TABS.map(t => (
              <button key={t.key} type="button"
                className={`login-tab${tab === t.key ? ' active' : ''}`}
                style={tab === t.key ? { background: t.color, borderColor: t.color } : {}}
                onClick={() => { setTab(t.key); setForm({ email: '', password: '' }) }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder={DEMO_CREDS[tab]?.email}
                  value={form.email} autoFocus autoComplete="email"
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type={showPwd ? 'text' : 'password'} className="form-input"
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  placeholder="Enter your password"
                  value={form.password} autoComplete="current-password"
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" className="login-pwd-toggle" tabIndex={-1}
                  onClick={() => setShowPwd(v => !v)}>
                  {showPwd
                    ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 8, background: activeTab.color, borderColor: activeTab.color }}
              disabled={loading}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Signing in...
                  </span>
                : `Sign in as ${activeTab.label} →`
              }
            </button>
          </form>

          {/* Demo credentials */}
          <div className="login-demo">
            <div className="login-demo-label">⚡ Quick fill demo credentials</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {TABS.map(t => (
                <button key={t.key} type="button" className="login-demo-btn"
                  style={tab === t.key ? { borderColor: t.color } : {}}
                  onClick={() => fillDemo(t.key)}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{t.label}</span>
                  <span style={{ fontSize: 10, color: t.color, fontFamily: 'monospace' }}>
                    {DEMO_CREDS[t.key].email.split('@')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="login-footer">© 2026 Vidya-Drishti · All rights reserved</p>
      </div>
    </div>
  )
}
