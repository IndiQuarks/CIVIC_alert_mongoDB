import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function OfficerLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/officer/login', form)
      login(data.token, data.user)
      toast.success(`Welcome, ${data.user.name}!`)
      navigate('/officer/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #414048 0%, #2e2d34 100%)' }}>
      {/* Left Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="text-cream max-w-sm">
          <div className="w-16 h-16 bg-olive rounded-2xl flex items-center justify-center text-3xl mb-8">👮</div>
          <h2 className="text-3xl font-bold mb-4">Officer<br />Portal</h2>
          <p className="text-cream/60 leading-relaxed mb-8">
            Field officer access for Guntur Municipal Corporation departments. View and resolve assigned civic complaints.
          </p>
          <div className="space-y-3 text-sm">
            {[
              { dept: 'APSPDCL', desc: 'Power & Street Lights', color: '#F59E0B' },
              { dept: 'GMC Roads', desc: 'Roads & Footpaths', color: '#6B7280' },
              { dept: 'GMC Sanitation', desc: 'Garbage & Cleanliness', color: '#10B981' },
              { dept: 'GWSSB', desc: 'Water & Drainage', color: '#3B82F6' },
              { dept: 'Animal Husbandry', desc: 'Stray Animals', color: '#8B5CF6' },
              { dept: 'R&B Dept.', desc: 'State Roads & Bridges', color: '#EF4444' },
            ].map(d => (
              <div key={d.dept} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="font-medium text-cream/80">{d.dept}</span>
                <span className="text-cream/40">—</span>
                <span className="text-cream/50 text-xs">{d.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-olive rounded-xl flex items-center justify-center text-white font-bold text-sm">GC</div>
              <div>
                <div className="font-bold">Officer Login</div>
                <div className="text-xs text-gray-400">Guntur Civic Portal — Field Staff</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Official Email ID</label>
                <input className="input" type="email" placeholder="officer@guntur.in" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Your password" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-olive hover:bg-olive-dark text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center space-y-1">
              <p>Sample: officer.apspdcl1@guntur.in / Officer@123</p>
              <p>Contact admin if you forgot your password</p>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-cream/40">
            <Link to="/" className="hover:text-cream transition-colors">← Home</Link>
            {' · '}
            <Link to="/admin/login" className="hover:text-cream transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
