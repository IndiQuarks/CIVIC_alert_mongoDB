import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) {
    if (role === 'admin')   return <Navigate to="/admin/login" />
    if (role === 'officer') return <Navigate to="/officer/login" />
    return <Navigate to="/login" />
  }
  if (user.role !== role) return <Navigate to="/" />
  return children
}
