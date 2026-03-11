import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Student pages
import StudentHome        from './pages/student/StudentHome'
import StudentProfile     from './pages/student/StudentProfile'
import StudentAssessments from './pages/student/StudentAssessments'
import StudentLeaderboard from './pages/student/StudentLeaderboard'

// College Admin pages
import AdminHome        from './pages/admin/AdminHome'
import AdminProfile     from './pages/admin/AdminProfile'
import AdminAnalytics   from './pages/admin/AdminAnalytics'
import AdminLeaderboard from './pages/admin/AdminLeaderboard'
import CodingProfiles   from './pages/admin/CodingProfiles'
import CreateAssessment from './pages/admin/CreateAssessment'
import OnboardStudent   from './pages/admin/OnboardStudent'

// Platform Admin pages
import PlatformHome     from './pages/platformAdmin/PlatformHome'
import ManageColleges   from './pages/platformAdmin/ManageColleges'
import ManageAdmins     from './pages/platformAdmin/ManageAdmins'
import PlatformStudents from './pages/platformAdmin/PlatformStudents'
import PlatformAnalytics from './pages/platformAdmin/PlatformAnalytics'

// Shared
import AssessmentDetail  from './pages/shared/AssessmentDetail'
import CodeEditorSandbox from './pages/shared/CodeEditorSandbox'
import LoginPage         from './pages/auth/LoginPage'

// Layouts
import StudentLayout       from './layouts/StudentLayout'
import AdminLayout         from './layouts/AdminLayout'
import PlatformAdminLayout from './layouts/PlatformAdminLayout'

// ── Auth Context ───────────────────────────────────────────
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// ── Route guard ────────────────────────────────────────────
function ProtectedRoute({ roles, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vd_user')
      const token  = localStorage.getItem('vd_token')
      if (stored && token) {
        const parsed = JSON.parse(stored)
        // Normalize role to lowercase for route matching
        parsed.role = (parsed.role || '').toLowerCase()
        setUser(parsed)
      }
    } catch {
      localStorage.removeItem('vd_user')
      localStorage.removeItem('vd_token')
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    const normalized = { ...userData, role: (userData.role || '').toLowerCase() }
    localStorage.setItem('vd_user',  JSON.stringify(normalized))
    localStorage.setItem('vd_token', token)
    setUser(normalized)
  }

  const logout = () => {
    localStorage.removeItem('vd_user')
    localStorage.removeItem('vd_token')
    setUser(null)
  }

  const updateUser = (data) => {
    const merged = { ...user, ...data }
    localStorage.setItem('vd_user', JSON.stringify(merged))
    setUser(merged)
  }

  if (loading) return <div className="center-loader"><div className="loading-spinner" /></div>

  const defaultPath =
    !user                            ? '/login'          :
    user.role === 'platform_admin'   ? '/platform'       :
    user.role === 'college_admin'    ? '/admin'          :
                                       '/student'

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style:   { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }} />

        <Routes>
          {/* ── Public ───────────────────────────────────── */}
          <Route path="/login"
            element={!user ? <LoginPage /> : <Navigate to={defaultPath} replace />}
          />

          {/* ── Platform Admin ───────────────────────────── */}
          <Route path="/platform"
            element={
              <ProtectedRoute roles={['platform_admin']}>
                <PlatformAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index                  element={<PlatformHome />} />
            <Route path="colleges"        element={<ManageColleges />} />
            <Route path="admins"          element={<ManageAdmins />} />
            <Route path="students"        element={<PlatformStudents />} />
            <Route path="analytics"       element={<PlatformAnalytics />} />
          </Route>

          {/* ── College Admin ─────────────────────────────── */}
          <Route path="/admin"
            element={
              <ProtectedRoute roles={['college_admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index                      element={<AdminHome />} />
            <Route path="profile"             element={<AdminProfile />} />
            <Route path="analytics"           element={<AdminAnalytics />} />
            <Route path="leaderboard"         element={<AdminLeaderboard />} />
            <Route path="coding-profiles"     element={<CodingProfiles />} />
            <Route path="create-assessment"   element={<CreateAssessment />} />
            <Route path="onboard-students"    element={<OnboardStudent />} />
            <Route path="assessment/:id"      element={<AssessmentDetail />} />
          </Route>

          {/* ── Student ───────────────────────────────────── */}
          <Route path="/student"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index                      element={<StudentHome />} />
            <Route path="profile"             element={<StudentProfile />} />
            <Route path="assessments"         element={<StudentAssessments />} />
            <Route path="leaderboard"         element={<StudentLeaderboard />} />
            <Route path="assessment/:id"      element={<AssessmentDetail />} />
            <Route path="assessment/:id/solve" element={<CodeEditorSandbox />} />
          </Route>

          {/* ── Fallbacks ─────────────────────────────────── */}
          <Route path="/"  element={<Navigate to={defaultPath} replace />} />
          <Route path="*"  element={<Navigate to={defaultPath} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
