import { useState }           from 'react'
import { useNavigate }        from 'react-router-dom'
import { useAuth }            from '../../App'
import api                    from '../../api/axiosConfig'
import toast                  from 'react-hot-toast'
import './LoginPage.css'

export default function LoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [tab, setTab] = useState('student')   // 'student' | 'admin'
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const switchTab = (t) => {
    setTab(t)
    setForm({ email: '', password: '' })
  }

  const fillDemo = (role) => {
    switchTab(role)
    setForm({
      email:    role === 'admin' ? 'admin@college.edu' : 'student@college.edu',
      password: 'password123',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        role:     tab,
      })

      // ── FIX: normalize role to lowercase before storing ─
      const userData = {
        ...res.data.user,
        role: (res.data.user.role || tab).toLowerCase(),
      }

      login(userData, res.data.token)
      toast.success(`Welcome, ${userData.name?.split(' ')[0]}! 👋`)
      navigate(userData.role === 'admin' ? '/admin' : '/student', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Decorative background orbs */}
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

        {/* Card */}
        <div className="login-card">
          <div className="login-card-top">
            <h2>Welcome back</h2>
            <p>Sign in to access your dashboard</p>
          </div>

          {/* Role Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab${tab === 'student' ? ' active' : ''}`}
              onClick={() => switchTab('student')}
            >
              🎒 Student
            </button>
            <button
              type="button"
              className={`login-tab${tab === 'admin' ? ' active' : ''}`}
              onClick={() => switchTab('admin')}
            >
              👨‍💼 Admin / Faculty
            </button>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="15" height="15" fill="none"
                  stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                  placeholder={tab === 'admin' ? 'admin@college.edu' : 'student@college.edu'}
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="15" height="15" fill="none"
                  stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-pwd-toggle"
                  onClick={() => setShowPwd(v => !v)}
                  tabIndex={-1}
                >
                  {showPwd
                    ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 14, marginTop: 8 }}
              disabled={loading}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Signing in...
                  </span>
                : `Sign in as ${tab === 'admin' ? 'Admin' : 'Student'} →`
              }
            </button>
          </form>

          {/* Demo credentials */}
          <div className="login-demo">
            <div className="login-demo-label">⚡ Quick fill demo credentials</div>
            <div className="login-demo-row">
              <button type="button" className="login-demo-btn" onClick={() => fillDemo('student')}>
                <span>🎒 Student</span>
                <span>student@college.edu</span>
              </button>
              <button type="button" className="login-demo-btn" onClick={() => fillDemo('admin')}>
                <span>👨‍💼 Admin</span>
                <span>admin@college.edu</span>
              </button>
            </div>
          </div>
        </div>

        <p className="login-footer">© 2025 Vidya-Drishti · All rights reserved</p>
      </div>
    </div>
  )
}
