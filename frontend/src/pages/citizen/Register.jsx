import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const WARDS = ['Ward 1','Ward 2','Ward 3','Ward 4','Ward 5','Ward 6','Ward 7','Ward 8','Ward 9','Ward 10',
  'Ward 11','Ward 12','Ward 13','Ward 14','Ward 15','Ward 16','Ward 17','Ward 18','Ward 19','Ward 20',
  'Ward 21','Ward 22','Ward 23','Ward 24','Ward 25']

export default function CitizenRegister() {
  const [step, setStep]   = useState('register') // register | otp
  const [userId, setUserId] = useState(null)
  const [otp, setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'', ward:'', pincode:'522001' })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setUserId(data.userId)
      setStep('otp')
      toast.info('OTP sent to your email!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp })
      login(data.token, data.user)
      toast.success('Email verified! Welcome to Guntur Civic Portal.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    try { await api.post('/auth/resend-otp', { userId }); toast.info('OTP resent!') }
    catch { toast.error('Failed to resend OTP') }
  }

  const f = (k) => ({ value: form[k], onChange: (e) => setForm(p => ({...p, [k]: e.target.value})) })

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal items-center justify-center p-12">
        <div className="text-cream max-w-sm">
          <div className="w-14 h-14 bg-terra rounded-2xl flex items-center justify-center text-2xl mb-8">🏙️</div>
          <h2 className="text-3xl font-bold mb-4">Join the<br />change in Guntur.</h2>
          <p className="text-cream/60 leading-relaxed">Register to report civic issues directly to the concerned government departments and track their resolution.</p>
          <div className="mt-8 space-y-3">
            {['Real-time status tracking', 'Photo & geo-location support', 'Direct dept. assignment', 'Officer accountability'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-cream/70"><span className="text-tan">✓</span> {f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="text-tan text-sm hover:underline inline-flex items-center gap-1 mb-6">← Back to Home</Link>

          {step === 'register' ? (
            <>
              <h1 className="text-2xl font-bold mb-1">Create your account</h1>
              <p className="text-gray-500 text-sm mb-6">Citizen Portal — Guntur Civic Services</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" placeholder="e.g. Ravi Kumar" required {...f('name')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email Address</label>
                    <input className="input" type="email" placeholder="you@example.com" required {...f('email')} />
                  </div>
                  <div>
                    <label className="label">Mobile Number</label>
                    <input className="input" placeholder="10-digit number" maxLength={10} required {...f('phone')} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Ward</label>
                    <select className="input" {...f('ward')}>
                      <option value="">Select Ward</option>
                      {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input className="input" placeholder="522001" maxLength={6} {...f('pincode')} />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <input className="input" type="password" placeholder="Min. 6 characters" required {...f('password')} />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input className="input" type="password" placeholder="Re-enter password" required {...f('confirm')} />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? 'Creating account…' : 'Create Account & Get OTP'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account? <Link to="/login" className="text-terra font-medium hover:underline">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">📧</div>
              <h1 className="text-2xl font-bold mb-1">Verify your email</h1>
              <p className="text-gray-500 text-sm mb-6">We sent a 6-digit OTP to <strong>{form.email}</strong></p>
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="label">Enter OTP</label>
                  <input
                    className="input text-center text-2xl tracking-widest font-bold"
                    maxLength={6}
                    placeholder="——————"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Verifying…' : 'Verify & Continue'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                Didn't receive it?{' '}
                <button onClick={handleResend} className="text-terra font-medium hover:underline">Resend OTP</button>
              </p>
              <p className="text-center text-xs text-gray-400 mt-2">
                (Check console if email not configured)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
