import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'
import Sidebar from '../../components/Sidebar'

const SIDEBAR_LINKS = [
  { to: '/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { to: '/submit',    icon: '📝', label: 'Submit Complaint' },
]

const CATEGORIES = [
  'Broken / Non-functioning Street Light',
  'Pothole / Road Damage',
  'Garbage Accumulation on Road',
  'Stray Dogs / Animals Menace',
  'Water Supply Disruption',
  'Sewage / Drainage Overflow',
  'Open Manhole Cover',
  'Fallen Tree Blocking Road',
  'Damaged Footpath / Sidewalk',
  'Traffic Signal Malfunction',
  'Illegal Encroachment on Public Property',
  'Electrical Hazard / Exposed Wiring',
  'Other (describe below)',
]

const WARDS = Array.from({length:25},(_,i)=>`Ward ${i+1}`)

export default function SubmitComplaint() {
  const [form, setForm] = useState({ title:'', description:'', category:'', address:'', ward:'', pincode:'522001' })
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [geoInfo, setGeoInfo] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const f = (k) => ({ value: form[k], onChange: e => setForm(p => ({...p,[k]:e.target.value})) })

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0,3)
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported')
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setGeoInfo({ lat: pos.coords.latitude, lng: pos.coords.longitude }); toast.success('Location captured!'); setGeoLoading(false) },
      () => { toast.error('Could not get location. Please enter manually.'); setGeoLoading(false) }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) return toast.error('Please select an issue category')
    if (!form.address) return toast.error('Please provide the address/location')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => fd.append(k, v))
      if (geoInfo) { fd.append('latitude', geoInfo.lat); fd.append('longitude', geoInfo.lng) }
      files.forEach(f => fd.append('images', f))
      const { data } = await api.post('/complaints', fd, { headers: {'Content-Type':'multipart/form-data'} })
      toast.success(`Complaint submitted! Tracking ID: ${data.trackingId}`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar links={SIDEBAR_LINKS} portalLabel="Citizen Portal" />
      <main className="flex-1 p-8 bg-cream">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/dashboard" className="text-tan text-sm hover:underline">← Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">Submit Complaint</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Report an Issue</h1>
          <p className="text-gray-500 text-sm mb-8">Fill in the details below. Your complaint will be forwarded to the concerned department.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Category */}
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><span>📋</span> Issue Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Issue Category *</label>
                  <select className="input" required {...f('category')}>
                    <option value="">— Select the type of issue —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Complaint Title *</label>
                  <input className="input" placeholder="Brief title (e.g. Large pothole on MG Road)" required {...f('title')} />
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea className="input min-h-[100px] resize-none" placeholder="Describe the issue in detail — size, severity, how long it has been there…" required {...f('description')} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><span>📍</span> Location Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Street Address / Landmark *</label>
                  <input className="input" placeholder="e.g. Near Arundelpet Bus Stop, MG Road" required {...f('address')} />
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
                {/* GPS capture */}
                <div>
                  <button type="button" onClick={getLocation} disabled={geoLoading}
                    className="flex items-center gap-2 text-sm text-tan border border-tan/40 px-4 py-2 rounded-lg hover:bg-tan/10 transition-colors">
                    {geoLoading ? '⏳ Getting location…' : '📡 Capture GPS Location'}
                  </button>
                  {geoInfo && (
                    <div className="mt-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                      ✅ GPS captured: {geoInfo.lat.toFixed(5)}, {geoInfo.lng.toFixed(5)}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">Or upload a photo with geotag — we'll extract it automatically</p>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><span>📸</span> Photos (Optional, max 3)</h3>
              <div onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-tan/40 rounded-xl p-8 text-center cursor-pointer hover:border-tan hover:bg-tan/5 transition-colors">
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm font-medium text-gray-600">Click to upload photos</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB each · Up to 3 photos</p>
                <p className="text-xs text-tan mt-1">Photos with GPS geotag will have location auto-extracted</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
              {previews.length > 0 && (
                <div className="flex gap-3 mt-4">
                  {previews.map((p,i) => (
                    <img key={i} src={p} alt="" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3 shadow-md">
              {loading ? '⏳ Submitting complaint…' : '✅ Submit Complaint'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
