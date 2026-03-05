import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import toast from 'react-hot-toast'
import './Header.css'

const routeNames = {
  '/student': 'Dashboard', '/student/profile': 'My Profile',
  '/student/assessments': 'Assessments', '/student/leaderboard': 'Leaderboard',
  '/admin': 'Dashboard', '/admin/profile': 'My Profile',
  '/admin/analytics': 'Analytics', '/admin/leaderboard': 'Leaderboard',
  '/admin/coding-profiles': 'Coding Profiles', '/admin/create-assessment': 'Create Assessment',
}

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const pageName = routeNames[location.pathname] || 'Page'
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const profilePath = user?.role === 'admin' ? '/admin/profile' : '/student/profile'

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-breadcrumb">
          Vidya-Drishti <span style={{ color: 'var(--text-3)' }}>/</span>
          <span>{pageName}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search students, tests..." />
        </div>

        <button className="notif-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="notif-dot" />
        </button>

        <div className="header-user" onClick={() => setDropdownOpen(!dropdownOpen)} ref={dropdownRef}>
          <div className="header-avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : initials}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">{user?.name?.split(' ')[0] || 'User'}</span>
            <span className="header-user-role">{user?.role}</span>
          </div>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9" />
          </svg>

          {dropdownOpen && (
            <div className="user-dropdown" onClick={e => e.stopPropagation()}>
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{user?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{user?.email}</div>
              </div>
              <Link to={profilePath} onClick={() => setDropdownOpen(false)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </Link>
              <div className="dropdown-divider" />
              <button className="logout-btn" onClick={handleLogout}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
