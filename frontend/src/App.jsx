import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Pages — Student
import StudentHome        from './pages/student/StudentHome'
import StudentProfile     from './pages/student/StudentProfile'
import StudentAssessments from './pages/student/StudentAssessments'
import StudentLeaderboard from './pages/student/StudentLeaderboard'

// Pages — Admin
import AdminHome        from './pages/admin/AdminHome'
import AdminProfile     from './pages/admin/AdminProfile'
import AdminAnalytics   from './pages/admin/AdminAnalytics'
import AdminLeaderboard from './pages/admin/AdminLeaderboard'
import CodingProfiles   from './pages/admin/CodingProfiles'
import CreateAssessment from './pages/admin/CreateAssessment'

// Pages — Shared
import AssessmentDetail  from './pages/shared/AssessmentDetail'
import CodeEditorSandbox from './pages/shared/CodeEditorSandbox'
import LoginPage         from './pages/auth/LoginPage'

// Layouts & Guards
import StudentLayout from './layouts/StudentLayout'
import AdminLayout   from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'

// ── Auth Context ───────────────────────────────────────────
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('vd_user')
    const token      = localStorage.getItem('vd_token')
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser)
        // ── FIX 1: always normalize role to lowercase ──────
        parsed.role = (parsed.role || '').toLowerCase()
        setUser(parsed)
      } catch {
        localStorage.removeItem('vd_user')
        localStorage.removeItem('vd_token')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    // ── FIX 1: normalize role on login ─────────────────────
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

  if (loading) {
    return (
      <div className="center-loader">
        <div className="loading-spinner" />
      </div>
    )
  }

  const defaultRedirect = user
    ? (user.role === 'admin' ? '/admin' : '/student')
    : '/login'

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style:   { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />

        <Routes>
          {/* ── Public ─────────────────────────────────────── */}
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to={defaultRedirect} replace />}
          />

          {/* ── Student (nested under layout) ──────────────── */}
          {/* FIX 2: StudentLayout wraps all student pages,    */}
          {/*        providing Header + LeftNav via <Outlet /> */}
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index                    element={<StudentHome />} />
            <Route path="profile"           element={<StudentProfile />} />
            <Route path="assessments"       element={<StudentAssessments />} />
            <Route path="leaderboard"       element={<StudentLeaderboard />} />
            <Route path="assessment/:id"    element={<AssessmentDetail />} />
            <Route path="assessment/:id/solve" element={<CodeEditorSandbox />} />
          </Route>

          {/* ── Admin (nested under layout) ────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index                        element={<AdminHome />} />
            <Route path="profile"               element={<AdminProfile />} />
            <Route path="analytics"             element={<AdminAnalytics />} />
            <Route path="leaderboard"           element={<AdminLeaderboard />} />
            <Route path="coding-profiles"       element={<CodingProfiles />} />
            <Route path="create-assessment"     element={<CreateAssessment />} />
            <Route path="assessment/:id"        element={<AssessmentDetail />} />
          </Route>

          {/* ── Fallbacks ──────────────────────────────────── */}
          <Route path="/"  element={<Navigate to={defaultRedirect} replace />} />
          <Route path="*"  element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
