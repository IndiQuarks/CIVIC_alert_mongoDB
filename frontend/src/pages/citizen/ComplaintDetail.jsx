import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import Sidebar from '../../components/Sidebar'

const SIDEBAR_LINKS = [
  { to: '/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { to: '/submit',    icon: '📝', label: 'Submit Complaint' },
]

const IMG = (filename) => `/uploads/${filename}`

export default function CitizenComplaintDetail() {
  const { id } = useParams()
  const [c, setC] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/complaints/${id}`).then(r => setC(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex min-h-screen"><Sidebar links={SIDEBAR_LINKS} portalLabel="Citizen Portal" /><main className="flex-1 flex items-center justify-center"><div className="text-gray-400">Loading…</div></main></div>
  if (!c) return <div className="flex min-h-screen"><Sidebar links={SIDEBAR_LINKS} portalLabel="Citizen Portal" /><main className="flex-1 flex items-center justify-center"><div className="text-gray-400">Complaint not found.</div></main></div>

  return (
    <div className="flex min-h-screen">
      <Sidebar links={SIDEBAR_LINKS} portalLabel="Citizen Portal" />
      <main className="flex-1 p-8 bg-cream">
        <div className="max-w-3xl mx-auto">
          <Link to="/dashboard" className="text-tan text-sm hover:underline inline-flex items-center gap-1 mb-6">← Back to Dashboard</Link>

          {/* Header */}
          <div className="card mb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-charcoal/10 px-2 py-0.5 rounded">{c.trackingId}</span>
                  <StatusBadge status={c.status} size="md" />
                </div>
                <h1 className="text-xl font-bold mt-2">{c.title}</h1>
                <p className="text-gray-500 text-sm mt-1">{c.category}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-100 text-sm">
              <div><span className="text-gray-400">Address:</span> <span className="font-medium ml-1">{c.address}</span></div>
              <div><span className="text-gray-400">Ward/Pincode:</span> <span className="font-medium ml-1">{c.ward || '—'} / {c.pincode}</span></div>
              {c.latitude && <div><span className="text-gray-400">GPS:</span> <span className="font-medium ml-1 text-xs">{c.latitude.toFixed(5)}, {c.longitude.toFixed(5)}</span></div>}
              <div><span className="text-gray-400">Submitted:</span> <span className="font-medium ml-1">{new Date(c.createdAt).toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Description */}
            <div className="card">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{c.description}</p>
            </div>

            {/* Assignment */}
            <div className="card">
              <h3 className="font-semibold mb-3">Assignment</h3>
              {c.assignedDept ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{backgroundColor: c.assignedDept.colorHex}}>
                      {c.assignedDept.shortName.slice(0,2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{c.assignedDept.name}</div>
                      <div className="text-xs text-gray-400">{c.assignedDept.headName}</div>
                    </div>
                  </div>
                  {c.assignedOfficer && (
                    <div className="text-sm bg-blue-50 rounded-lg px-3 py-2">
                      <span className="text-gray-500">Officer:</span>{' '}
                      <span className="font-medium">{c.assignedOfficer.name}</span>
                      <span className="text-gray-400 ml-2 text-xs">({c.assignedOfficer.designation})</span>
                    </div>
                  )}
                  {c.adminRemarks && <div className="text-xs text-gray-500 italic">"{c.adminRemarks}"</div>}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">Awaiting assignment by admin…</div>
              )}
            </div>
          </div>

          {/* Photos */}
          {c.images?.length > 0 && (
            <div className="card mb-5">
              <h3 className="font-semibold mb-3">Submitted Photos</h3>
              <div className="flex gap-3 flex-wrap">
                {c.images.map((img,i) => (
                  <a key={i} href={IMG(img.filename)} target="_blank" rel="noopener noreferrer">
                    <img src={IMG(img.filename)} alt="" className="w-32 h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Resolution proof */}
          {c.status === 'resolved' && c.resolvedImages?.length > 0 && (
            <div className="card mb-5 border-green-200 bg-green-50">
              <h3 className="font-semibold mb-1 text-green-800">✅ Issue Resolved</h3>
              {c.officerRemarks && <p className="text-sm text-green-700 mb-3 italic">"{c.officerRemarks}"</p>}
              <div className="flex gap-3 flex-wrap">
                {c.resolvedImages.map((img,i) => (
                  <a key={i} href={IMG(img.filename)} target="_blank" rel="noopener noreferrer">
                    <img src={IMG(img.filename)} alt="" className="w-32 h-32 object-cover rounded-lg border border-green-300 hover:opacity-90" />
                  </a>
                ))}
              </div>
              {c.resolvedAt && <p className="text-xs text-green-600 mt-2">Resolved on {new Date(c.resolvedAt).toLocaleString('en-IN')}</p>}
            </div>
          )}

          {/* Status Timeline */}
          <div className="card">
            <h3 className="font-semibold mb-4">Status Timeline</h3>
            <div className="relative space-y-4 pl-4">
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-200" />
              {[...c.statusHistory].reverse().map((s,i) => (
                <div key={i} className="relative flex gap-3">
                  <div className="absolute -left-4 w-2 h-2 rounded-full bg-tan mt-1.5 -translate-x-px" />
                  <div>
                    <div className="text-sm font-medium capitalize">{s.status.replace('_',' ')}</div>
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
