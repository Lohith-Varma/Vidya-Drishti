import { Navigate } from 'react-router-dom'
import { useAuth }  from '../App'

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth()

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />

  // Wrong role → go to login
  // FIX: case-insensitive comparison
  if (role && user.role.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/login" replace />
  }

  return children
}
