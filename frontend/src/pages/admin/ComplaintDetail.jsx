import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import Sidebar from '../../components/Sidebar'

const ADMIN_LINKS = [
  { to: '/admin/dashboard',  end: true, icon: '📊', label: 'Dashboard' },
  { to: '/admin/complaints',            icon: '📋', label: 'All Complaints' },
  { to: '/admin/officers',              icon: '👮', label: 'Manage Officers' },
]

const IMG = (f) => `/uploads/${f}`

export default function AdminComplaintDetail() {
  const { id } = useParams()
  const [c, setC]             = useState(null)
  const [departments, setDepts] = useState([])
  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  const [assign, setAssign] = useState({ deptId: '', officerId: '', adminRemarks: '' })
  const [statusForm, setStatusForm] = useState({ status: '', adminRemarks: '' })

  useEffect(() => {
    Promise.all([
      api.get(`/admin/complaints/${id}`),
      api.get('/departments'),
    ]).then(([cRes, dRes]) => {
      setC(cRes.data)
      setDepts(dRes.data)
      const c = cRes.data
      setAssign({
        deptId: c.assignedDept?._id || '',
        officerId: c.assignedOfficer?._id || '',
        adminRemarks: c.adminRemarks || '',
      })
      setStatusForm({ status: c.status, adminRemarks: c.adminRemarks || '' })
      if (c.assignedDept?._id) fetchOfficers(c.assignedDept._id)
    }).finally(() => setLoading(false))
  }, [id])

  const fetchOfficers = async (deptId) => {
    if (!deptId) { setOfficers([]); return }
    const { data } = await api.get(`/departments/${deptId}/officers`)
    setOfficers(data)
  }

  const handleDeptChange = (deptId) => {
    setAssign(p => ({ ...p, deptId, officerId: '' }))
    fetchOfficers(deptId)
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!assign.deptId || !assign.officerId) return toast.error('Select both department and officer')
    setSaving(true)
    try {
      const { data } = await api.put(`/admin/complaints/${id}/assign`, assign)
      setC(data)
      toast.success('Complaint assigned successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed')
    } finally { setSaving(false) }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    if (!statusForm.status) return
    setSaving(true)
    try {
      const { data } = await api.put(`/admin/complaints/${id}/status`, statusForm)
      setC(prev => ({ ...prev, status: data.status, statusHistory: data.statusHistory }))
      toast.success('Status updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar links={ADMIN_LINKS} portalLabel="Admin Portal" accentColor="bg-terra" />
      <main className="flex-1 flex items-center justify-center"><div className="text-gray-400">Loading…</div></main>
    </div>
  )

  if (!c) return (
    <div className="flex min-h-screen">
      <Sidebar links={ADMIN_LINKS} portalLabel="Admin Portal" accentColor="bg-terra" />
      <main className="flex-1 flex items-center justify-center"><div className="text-gray-400">Complaint not found.</div></main>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar links={ADMIN_LINKS} portalLabel="Admin Portal" accentColor="bg-terra" />
      <main className="flex-1 p-8 bg-cream overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Link to="/admin/complaints" className="text-tan text-sm hover:underline inline-flex items-center gap-1 mb-6">← All Complaints</Link>

          {/* Header */}
          <div className="card mb-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-xs bg-charcoal/10 px-2 py-0.5 rounded">{c.trackingId}</span>
                  <StatusBadge status={c.status} size="md" />
                </div>
                <h1 className="text-xl font-bold">{c.title}</h1>
                <p className="text-gray-500 text-sm mt-1">{c.category}</p>
              </div>
              <div className="text-right text-xs text-gray-400">
                <div>Submitted: {new Date(c.createdAt).toLocaleString('en-IN')}</div>
                {c.resolvedAt && <div className="text-green-600">Resolved: {new Date(c.resolvedAt).toLocaleString('en-IN')}</div>}
              </div>
            </div>

            {/* Citizen info */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-gray-400 text-xs block">Citizen</span><span className="font-medium">{c.citizen?.name}</span></div>
              <div><span className="text-gray-400 text-xs block">Phone</span><span className="font-medium">{c.citizen?.phone}</span></div>
              <div><span className="text-gray-400 text-xs block">Ward / Pincode</span><span className="font-medium">{c.citizen?.ward || '—'} / {c.citizen?.pincode}</span></div>
              <div><span className="text-gray-400 text-xs block">Email</span><span className="font-medium text-xs">{c.citizen?.email}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Location & Description */}
            <div className="card">
              <h3 className="font-semibold mb-3">Issue Details</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{c.description}</p>
              <div className="space-y-1.5 text-sm">
                <div><span className="text-gray-400">Address: </span><span>{c.address}</span></div>
                <div><span className="text-gray-400">Ward: </span><span>{c.ward || '—'}</span></div>
                <div><span className="text-gray-400">Pincode: </span><span>{c.pincode}</span></div>
                {c.latitude && (
                  <div>
                    <span className="text-gray-400">GPS: </span>
                    <a href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`} target="_blank" rel="noopener noreferrer"
                      className="text-terra text-xs hover:underline">
                      {c.latitude.toFixed(5)}, {c.longitude.toFixed(5)} ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Assign Department & Officer */}
            <div className="card">
              <h3 className="font-semibold mb-3">Assign Department & Officer</h3>
              <form onSubmit={handleAssign} className="space-y-3">
                <div>
                  <label className="label text-xs">Department</label>
                  <select className="input text-sm" value={assign.deptId} onChange={e => handleDeptChange(e.target.value)}>
                    <option value="">— Select Department —</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.shortName} — {d.name.slice(0,35)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Officer</label>
                  <select className="input text-sm" value={assign.officerId} onChange={e => setAssign(p => ({...p, officerId: e.target.value}))} disabled={!assign.deptId}>
                    <option value="">— Select Officer —</option>
                    {officers.map(o => (
                      <option key={o._id} value={o._id}>{o.name} ({o.designation})</option>
                    ))}
                  </select>
                  {assign.deptId && officers.length === 0 && <p className="text-xs text-orange-500 mt-1">No active officers in this department. Add one first.</p>}
                </div>
                <div>
                  <label className="label text-xs">Remarks for Officer (optional)</label>
                  <textarea className="input text-sm resize-none h-16" placeholder="Any special instructions…"
                    value={assign.adminRemarks} onChange={e => setAssign(p => ({...p, adminRemarks: e.target.value}))} />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full text-sm">
                  {saving ? 'Saving…' : c.assignedOfficer ? '↻ Reassign' : 'Assign Complaint'}
                </button>
              </form>
            </div>
          </div>

          {/* Update Status */}
          <div className="card mb-5">
            <h3 className="font-semibold mb-3">Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="label text-xs">New Status</label>
                <select className="input text-sm w-44" value={statusForm.status} onChange={e => setStatusForm(p => ({...p, status: e.target.value}))}>
                  {['pending','assigned','in_progress','resolved','rejected','disputed'].map(s => (
                    <option key={s} value={s}>{s.replace('_',' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-48">
                <label className="label text-xs">Admin Remarks</label>
                <input className="input text-sm" placeholder="Reason or note…"
                  value={statusForm.adminRemarks} onChange={e => setStatusForm(p => ({...p, adminRemarks: e.target.value}))} />
              </div>
              <button type="submit" disabled={saving} className="btn-secondary text-sm">
                {saving ? 'Saving…' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Photos */}
          {c.images?.length > 0 && (
            <div className="card mb-5">
              <h3 className="font-semibold mb-3">Submitted Photos</h3>
              <div className="flex gap-3 flex-wrap">
                {c.images.map((img, i) => (
                  <a key={i} href={IMG(img.filename)} target="_blank" rel="noopener noreferrer">
                    <img src={IMG(img.filename)} alt="" className="w-36 h-36 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Resolution proof */}
          {c.resolvedImages?.length > 0 && (
            <div className="card mb-5 bg-green-50 border-green-200">
              <h3 className="font-semibold mb-1 text-green-800">✅ Resolution Proof (from Officer)</h3>
              {c.officerRemarks && <p className="text-sm text-green-700 italic mb-3">"{c.officerRemarks}"</p>}
              <div className="flex gap-3 flex-wrap">
                {c.resolvedImages.map((img, i) => (
                  <a key={i} href={IMG(img.filename)} target="_blank" rel="noopener noreferrer">
                    <img src={IMG(img.filename)} alt="" className="w-36 h-36 object-cover rounded-xl border border-green-300 hover:opacity-90" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h3 className="font-semibold mb-4">Status Timeline</h3>
            <div className="relative space-y-4 pl-4">
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-200" />
              {[...c.statusHistory].reverse().map((s, i) => (
                <div key={i} className="relative flex gap-3">
                  <div className="absolute -left-4 w-2.5 h-2.5 rounded-full bg-tan mt-1 -translate-x-px border-2 border-white" />
                  <div>
                    <div className="text-sm font-medium capitalize">{s.status.replace('_', ' ')}</div>
                    {s.note && <div className="text-xs text-gray-500 mt-0.5">{s.note}</div>}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {s.changedBy} · {new Date(s.changedAt).toLocaleString('en-IN')}
                    </div>
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
