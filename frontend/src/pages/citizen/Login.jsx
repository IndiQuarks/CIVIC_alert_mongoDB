import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function CitizenLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [otpFlow, setOtpFlow] = useState(null)
  const [otp, setOtp] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      const d = err.response?.data
      if (d?.requiresVerification) {
        setOtpFlow(d.userId)
        toast.info('Please verify your email first. OTP resent.')
      } else {
        toast.error(d?.message || 'Login failed')
      }
    } finally { setLoading(false) }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { userId: otpFlow, otp })
      login(data.token, data.user)
      toast.success('Verified! Welcome.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-tan text-sm hover:underline inline-flex items-center gap-1 mb-8">← Back to Home</Link>
        <div className="card shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-terra rounded-xl flex items-center justify-center text-white font-bold text-sm">GC</div>
            <div>
              <div className="font-bold">Citizen Login</div>
              <div className="text-xs text-gray-400">Guntur Civic Portal</div>
            </div>
          </div>

          {!otpFlow ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Your password" value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-sm text-gray-600">Enter the OTP sent to your email to complete verification.</p>
              <input className="input text-center text-xl tracking-widest font-bold" maxLength={6} placeholder="——————"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} required />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100 text-center text-sm text-gray-500 space-y-2">
            <p>Don't have an account? <Link to="/register" className="text-terra font-medium hover:underline">Register</Link></p>
            <div className="text-xs text-gray-400 pt-1">
              Admin? <Link to="/admin/login" className="text-tan hover:underline">Admin Portal</Link>
              {' · '}
              Officer? <Link to="/officer/login" className="text-tan hover:underline">Officer Portal</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
