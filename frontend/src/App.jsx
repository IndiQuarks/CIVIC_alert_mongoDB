import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Public
import Landing from './pages/Landing'

// Citizen
import CitizenLogin    from './pages/citizen/Login'
import CitizenRegister from './pages/citizen/Register'
import CitizenDashboard from './pages/citizen/Dashboard'
import SubmitComplaint  from './pages/citizen/SubmitComplaint'
import CitizenComplaintDetail from './pages/citizen/ComplaintDetail'

// Admin
import AdminLogin    from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminComplaints from './pages/admin/ComplaintsList'
import AdminComplaintDetail from './pages/admin/ComplaintDetail'
import ManageOfficers from './pages/admin/ManageOfficers'

// Officer
import OfficerLogin   from './pages/officer/Login'
import OfficerDashboard from './pages/officer/Dashboard'
import OfficerComplaintDetail from './pages/officer/ComplaintDetail'

import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Citizen */}
      <Route path="/login"    element={user?.role === 'citizen' ? <Navigate to="/dashboard" /> : <CitizenLogin />} />
      <Route path="/register" element={user?.role === 'citizen' ? <Navigate to="/dashboard" /> : <CitizenRegister />} />
      <Route path="/dashboard" element={<ProtectedRoute role="citizen"><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/submit"    element={<ProtectedRoute role="citizen"><SubmitComplaint /></ProtectedRoute>} />
      <Route path="/complaint/:id" element={<ProtectedRoute role="citizen"><CitizenComplaintDetail /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/login"   element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/complaints" element={<ProtectedRoute role="admin"><AdminComplaints /></ProtectedRoute>} />
      <Route path="/admin/complaints/:id" element={<ProtectedRoute role="admin"><AdminComplaintDetail /></ProtectedRoute>} />
      <Route path="/admin/officers" element={<ProtectedRoute role="admin"><ManageOfficers /></ProtectedRoute>} />

      {/* Officer */}
      <Route path="/officer/login"   element={user?.role === 'officer' ? <Navigate to="/officer/dashboard" /> : <OfficerLogin />} />
      <Route path="/officer/dashboard" element={<ProtectedRoute role="officer"><OfficerDashboard /></ProtectedRoute>} />
      <Route path="/officer/complaints/:id" element={<ProtectedRoute role="officer"><OfficerComplaintDetail /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
