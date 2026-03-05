import { NavLink } from 'react-router-dom'
import { useAuth } from '../App'
import logo from '../assets/vidya-drishti-logo.png'
import './LeftNav.css'

const StudentNav = [
  { label: 'Main', links: [
    { to: '/student', label: 'Dashboard', icon: <GridIcon /> },
    { to: '/student/assessments', label: 'Assessments', icon: <ClipboardIcon /> },
    { to: '/student/leaderboard', label: 'Leaderboard', icon: <TrophyIcon /> },
  ]},
  { label: 'Account', links: [
    { to: '/student/profile', label: 'My Profile', icon: <UserIcon /> },
  ]}
]

const AdminNav = [
  { label: 'Overview', links: [
    { to: '/admin', label: 'Dashboard', icon: <GridIcon /> },
    { to: '/admin/analytics', label: 'Analytics', icon: <ChartIcon /> },
    { to: '/admin/leaderboard', label: 'Leaderboard', icon: <TrophyIcon /> },
  ]},
  { label: 'Management', links: [
    { to: '/admin/create-assessment', label: 'Create Assessment', icon: <PlusCircleIcon /> },
    { to: '/admin/coding-profiles', label: 'Coding Profiles', icon: <CodeIcon /> },
  ]},
  { label: 'Account', links: [
    { to: '/admin/profile', label: 'My Profile', icon: <UserIcon /> },
  ]}
]

export default function LeftNav() {
  const { user } = useAuth()
  const navItems = user?.role === 'admin' ? AdminNav : StudentNav
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <nav className="left-nav">
      <div className="nav-logo">
        <img src={logo} alt="Vidya-Drishti" onError={e => { e.target.style.display = 'none' }} />
        <div className="nav-logo-text">
          <span className="nav-logo-title">Vidya-Drishti</span>
          <span className="nav-logo-sub">Academic Portal</span>
        </div>
      </div>

      <div className="nav-section">
        {navItems.map(section => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.links.map(link => (
              <NavLink key={link.to} to={link.to} end={link.to === '/student' || link.to === '/admin'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                {link.icon}
                {link.label}
                {link.badge && <span className="nav-link-badge">{link.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="nav-bottom">
        <div className="nav-user-card">
          <div className="nav-avatar">
            {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
          </div>
          <div className="nav-user-info">
            <div className="nav-user-name">{user?.name || 'User'}</div>
            <div className="nav-user-id">{user?.rollNumber || user?.employeeId || user?.email?.split('@')[0]}</div>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Icon components
function GridIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function ClipboardIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg> }
function TrophyIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="8 21 12 17 16 21"/><path d="M6 3H18M17 3v4a5 5 0 0 1-10 0V3"/><path d="M4 3h2M18 3h2M4 3v6a2 2 0 0 0 2 2h.5M20 3v6a2 2 0 0 1-2 2h-.5"/></svg> }
function UserIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function ChartIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function PlusCircleIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> }
function CodeIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> }
