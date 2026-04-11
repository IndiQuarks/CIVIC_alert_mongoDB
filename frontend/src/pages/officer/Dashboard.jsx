import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import Sidebar from '../../components/Sidebar'

const OFFICER_LINKS = [
  { to: '/officer/dashboard', end: true, icon: '🏠', label: 'My Complaints' },
]

export default function OfficerDashboard() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')

  useEffect(() => {
    Promise.all([
      api.get('/officer/complaints'),
      api.get('/officer/stats'),
    ]).then(([c, s]) => { setComplaints(c.data); setStats(s.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter)

  const deptInfo = user?.department

  return (
    <div className="flex min-h-screen">
      <Sidebar links={OFFICER_LINKS} portalLabel={deptInfo?.shortName || 'Officer Portal'} accentColor="bg-olive" />
      <main className="flex-1 p-8 bg-cream">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">My Assigned Complaints</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {user?.name} · {deptInfo?.name || 'Field Officer'}
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Assigned', value: stats.total,      color: 'text-charcoal' },
                { label: 'New / Pending',  value: stats.assigned,   color: 'text-blue-600' },
                { label: 'In Progress',    value: stats.inProgress, color: 'text-orange-600' },
                { label: 'Resolved',       value: stats.resolved,   color: 'text-green-600' },
              ].map(s => (
                <div key={s.label} className="card text-center">
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Today's priority — show assigned and in_progress */}
          {complaints.filter(c => ['assigned','in_progress'].includes(c.status)).length > 0 && (
            <div className="mb-6 bg-orange-50 border border-orange-100 rounded-xl p-4">
              <div className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                <span>🔔</span> Needs Attention
              </div>
              <p className="text-xs text-orange-600">
                You have {complaints.filter(c => ['assigned','in_progress'].includes(c.status)).length} open complaints requiring action.
              </p>
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {['all','assigned','in_progress','resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter===f ? 'bg-olive text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                {f==='all' ? 'All' : f==='in_progress' ? 'In Progress' : f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center text-gray-400 py-16">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-500 font-medium">
                {filter === 'all' ? 'No complaints assigned yet' : `No ${filter.replace('_',' ')} complaints`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(c => (
                <Link key={c._id} to={`/officer/complaints/${c._id}`}
                  className="card flex items-start gap-4 hover:shadow-md transition-shadow block">
                  <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                    c.status==='assigned' ? 'bg-blue-500' : c.status==='in_progress' ? 'bg-orange-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-sm">{c.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{c.trackingId} · {c.category}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                      <span>📍 {c.address.slice(0,50)}{c.address.length>50?'…':''}</span>
                      {c.citizen && <span>👤 {c.citizen.name}{c.citizen.ward ? ` · ${c.citizen.ward}` : ''}</span>}
                      <span>🕐 {new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
