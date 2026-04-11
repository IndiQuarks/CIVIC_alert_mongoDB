import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../contexts/AuthContext'

const OFFICER_LINKS = [
  { to: '/officer/dashboard', end: true, icon: '🏠', label: 'My Complaints' },
]

const IMG = (f) => `/uploads/${f}`

export default function OfficerComplaintDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [c, setC]             = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [resolveFiles, setResolveFiles] = useState([])
  const [resolvePreviews, setResolvePreviews] = useState([])
  const [officerRemarks, setOfficerRemarks] = useState('')

  useEffect(() => {
    api.get(`/officer/complaints/${id}`).then(r => setC(r.data)).finally(() => setLoading(false))
  }, [id])

  const handleStart = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`/officer/complaints/${id}/start`)
      setC(prev => ({ ...prev, status: data.status, statusHistory: data.statusHistory }))
      toast.success('Status updated to In Progress!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const handleResolveFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 3)
    setResolveFiles(selected)
    setResolvePreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const handleResolve = async (e) => {
    e.preventDefault()
    if (resolveFiles.length === 0) return toast.error('Please upload at least 1 proof photo')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('officerRemarks', officerRemarks)
      resolveFiles.forEach(f => fd.append('resolvedImages', f))
      const { data } = await api.put(`/officer/complaints/${id}/resolve`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setC(prev => ({ ...prev, status: data.status, resolvedImages: data.resolvedImages, officerRemarks: data.officerRemarks, statusHistory: data.statusHistory }))
      toast.success('✅ Complaint marked as resolved!')
      setResolveFiles([])
      setResolvePreviews([])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar links={OFFICER_LINKS} portalLabel={user?.department?.shortName || 'Officer Portal'} accentColor="bg-olive" />
      <main className="flex-1 flex items-center justify-center"><div className="text-gray-400">Loading…</div></main>
    </div>
  )

  if (!c) return (
    <div className="flex min-h-screen">
      <Sidebar links={OFFICER_LINKS} portalLabel="Officer Portal" accentColor="bg-olive" />
      <main className="flex-1 flex items-center justify-center"><div className="text-gray-400">Complaint not found or not assigned to you.</div></main>
    </div>
  )

  const canStart    = c.status === 'assigned'
  const canResolve  = ['assigned', 'in_progress'].includes(c.status)
  const isResolved  = c.status === 'resolved'

  return (
    <div className="flex min-h-screen">
      <Sidebar links={OFFICER_LINKS} portalLabel={user?.department?.shortName || 'Officer Portal'} accentColor="bg-olive" />
      <main className="flex-1 p-8 bg-cream overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <Link to="/officer/dashboard" className="text-tan text-sm hover:underline inline-flex items-center gap-1 mb-6">← Back to Dashboard</Link>

          {/* Header */}
          <div className="card mb-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-xs bg-charcoal/10 px-2 py-0.5 rounded">{c.trackingId}</span>
                  <StatusBadge status={c.status} size="md" />
                </div>
                <h1 className="text-xl font-bold">{c.title}</h1>
                <p className="text-sm text-gray-500 mt-1">{c.category}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 text-sm">
              <div><span className="text-gray-400">Citizen: </span><span className="font-medium">{c.citizen?.name}</span></div>
              <div><span className="text-gray-400">Phone: </span><span className="font-medium">{c.citizen?.phone}</span></div>
              <div className="col-span-2"><span className="text-gray-400">Address: </span><span>{c.address}</span></div>
              {c.ward && <div><span className="text-gray-400">Ward: </span><span>{c.ward}</span></div>}
              {c.latitude && (
                <div>
                  <span className="text-gray-400">GPS: </span>
                  <a href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`} target="_blank" rel="noopener noreferrer"
                    className="text-terra text-xs hover:underline">View on Maps ↗</a>
                </div>
              )}
              {c.adminRemarks && (
                <div className="col-span-2 mt-1 bg-tan/10 rounded-lg px-3 py-2">
                  <span className="text-xs text-tan font-medium">Admin note: </span>
                  <span className="text-sm">{c.adminRemarks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card mb-5">
            <h3 className="font-semibold mb-2">Issue Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{c.description}</p>
          </div>

          {/* Complaint photos */}
          {c.images?.length > 0 && (
            <div className="card mb-5">
              <h3 className="font-semibold mb-3">Issue Photos (Submitted by Citizen)</h3>
              <div className="flex gap-3 flex-wrap">
                {c.images.map((img, i) => (
                  <a key={i} href={IMG(img.filename)} target="_blank" rel="noopener noreferrer">
                    <img src={IMG(img.filename)} alt="" className="w-32 h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isResolved && (
            <div className="card mb-5 border-l-4 border-olive">
              <h3 className="font-semibold mb-4">Take Action</h3>

              {canStart && (
                <div className="mb-5">
                  <p className="text-sm text-gray-500 mb-3">
                    Click below to confirm you have started working on this complaint.
                  </p>
                  <button onClick={handleStart} disabled={saving}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
                    {saving ? 'Updating…' : '▶ Mark as In Progress'}
                  </button>
                </div>
              )}

              {canResolve && (
                <form onSubmit={handleResolve}>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Mark as Resolved (upload proof photos)</h4>
                  <div className="mb-3">
                    <label className="label text-xs">Resolution Notes</label>
                    <textarea className="input text-sm resize-none h-20"
                      placeholder="Describe what was done to fix the issue…"
                      value={officerRemarks}
                      onChange={e => setOfficerRemarks(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="label text-xs">Proof Photos * (min 1, max 3)</label>
                    <div onClick={() => fileRef.current.click()}
                      className="border-2 border-dashed border-olive/40 rounded-xl p-6 text-center cursor-pointer hover:border-olive hover:bg-olive/5 transition-colors">
                      <div className="text-2xl mb-1">📷</div>
                      <p className="text-xs text-gray-500">Click to upload resolution photos</p>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleResolveFiles} />
                    {resolvePreviews.length > 0 && (
                      <div className="flex gap-3 mt-3">
                        {resolvePreviews.map((p, i) => (
                          <img key={i} src={p} alt="" className="w-24 h-24 object-cover rounded-lg border" />
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={saving || resolveFiles.length === 0}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 text-sm w-full mt-2">
                    {saving ? 'Submitting…' : '✅ Submit Resolved with Proof'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Resolution proof (already submitted) */}
          {isResolved && c.resolvedImages?.length > 0 && (
            <div className="card mb-5 bg-green-50 border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Resolved — Proof Submitted</h3>
              {c.officerRemarks && <p className="text-sm text-green-700 italic mb-3">"{c.officerRemarks}"</p>}
              <div className="flex gap-3 flex-wrap">
                {c.resolvedImages.map((img, i) => (
                  <a key={i} href={IMG(img.filename)} target="_blank" rel="noopener noreferrer">
                    <img src={IMG(img.filename)} alt="" className="w-28 h-28 object-cover rounded-lg border border-green-300" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h3 className="font-semibold mb-4">Status History</h3>
            <div className="relative space-y-4 pl-4">
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-200" />
              {[...c.statusHistory].reverse().map((s, i) => (
                <div key={i} className="relative flex gap-3">
                  <div className="absolute -left-4 w-2.5 h-2.5 rounded-full bg-olive mt-1 -translate-x-px border-2 border-white" />
                  <div>
                    <div className="text-sm font-medium capitalize">{s.status.replace('_', ' ')}</div>
                    {s.note && <div className="text-xs text-gray-500">{s.note}</div>}
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(s.changedAt).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
