import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import Sidebar from '../../components/Sidebar'

const SIDEBAR_LINKS = [
  { to: '/dashboard', end: true, icon: '🏠', label: 'Dashboard' },
  { to: '/submit',    icon: '📝', label: 'Submit Complaint' },
]

const STATUS_COLORS = { pending:'#F59E0B', assigned:'#3B82F6', in_progress:'#F97316', resolved:'#10B981', rejected:'#EF4444' }

export default function CitizenDashboard() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/complaints').then(r => setComplaints(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter)
  const counts = { total: complaints.length, pending: complaints.filter(c=>c.status==='pending').length,
    resolved: complaints.filter(c=>c.status==='resolved').length, active: complaints.filter(c=>['assigned','in_progress'].includes(c.status)).length }

  return (
    <div className="flex min-h-screen">
      <Sidebar links={SIDEBAR_LINKS} portalLabel="Citizen Portal" />
      <main className="flex-1 p-8 bg-cream">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
              <p className="text-gray-500 text-sm mt-0.5">Track and manage your grievances</p>
            </div>
            <Link to="/submit" className="btn-primary flex items-center gap-2 shadow-sm">
              <span>+</span> New Complaint
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: counts.total, color: 'text-charcoal' },
              { label: 'Pending', value: counts.pending, color: 'text-yellow-600' },
              { label: 'Active', value: counts.active, color: 'text-blue-600' },
              { label: 'Resolved', value: counts.resolved, color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {['all','pending','assigned','in_progress','resolved','rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter===f ? 'bg-terra text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>

          {/* Complaints list */}
          {loading ? (
            <div className="text-center text-gray-400 py-16">Loading complaints…</div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 font-medium">No complaints found</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'all' ? 'Submit your first grievance to get started' : `No ${filter} complaints`}
              </p>
              {filter === 'all' && <Link to="/submit" className="btn-primary mt-4 inline-block">Submit Complaint</Link>}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(c => (
                <Link key={c._id} to={`/complaint/${c._id}`}
                  className="card flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer block">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[c.status] || '#ccc' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-sm truncate">{c.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{c.trackingId} · {c.category}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>📍 {c.address.slice(0,40)}{c.address.length>40?'…':''}</span>
                      <span>🕐 {new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                      {c.assignedDept && <span style={{color: c.assignedDept.colorHex}}>🏛️ {c.assignedDept.shortName}</span>}
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
