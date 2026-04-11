import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/admin/login', form)
      login(data.token, data.user)
      toast.success('Welcome, Admin!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-terra rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">🏛️</div>
          <h1 className="text-white text-2xl font-bold">Admin Portal</h1>
          <p className="text-cream/50 text-sm mt-1">Guntur Municipal Corporation</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Admin Email</label>
              <input className="input" type="email" placeholder="admin@gunturcorporation.in" value={form.email}
                onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Admin password" value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign In as Admin'}
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-gray-400">
            Default: admin@gunturcorporation.in / Admin@123
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-cream/40">
          <Link to="/" className="hover:text-cream transition-colors">← Back to Home</Link>
          {' · '}
          <Link to="/officer/login" className="hover:text-cream transition-colors">Officer Login</Link>
        </div>
      </div>
    </div>
  )
}
