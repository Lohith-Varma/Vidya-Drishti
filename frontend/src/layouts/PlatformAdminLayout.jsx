import { Outlet } from 'react-router-dom'
import { useAuth } from '../App'
import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/platform',          label: 'Dashboard',        icon: '🏠', end: true },
  { to: '/platform/colleges', label: 'Manage Colleges',  icon: '🏛️' },
  { to: '/platform/admins',   label: 'College Admins',   icon: '👨‍💼' },
  { to: '/platform/students', label: 'All Students',     icon: '🎓' },
  { to: '/platform/analytics',label: 'Analytics',        icon: '📊' },
]

export default function PlatformAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="app-layout">
      {/* ── Platform Admin Left Nav ────────────────────── */}
      <aside className="left-nav">
        <div className="nav-brand">
          <div className="nav-brand-logo" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>🛡️</div>
          <div>
            <div className="nav-brand-name">Vidya-Drishti</div>
            <div className="nav-brand-tagline">Platform Admin</div>
          </div>
        </div>

        <nav className="nav-body">
          <div className="nav-section">
            <div className="nav-section-title">Platform Control</div>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="nav-footer">
          <div className="nav-user" onClick={handleLogout}>
            <div className="nav-user-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className="nav-user-name">{user?.name}</div>
              <div className="nav-user-role">Platform Admin · Sign out</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────── */}
      <div className="main-area">
        <header className="app-header">
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Vidya-Drishti</span>
          <span style={{ color: 'var(--text-3)' }}>/</span>
          <span style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13 }}>Platform Control</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="badge badge-warning">🛡️ Platform Admin</div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
