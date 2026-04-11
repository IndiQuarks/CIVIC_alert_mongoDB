import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Sidebar from '../../components/Sidebar'

const ADMIN_LINKS = [
  { to: '/admin/dashboard', end: true, icon: '📊', label: 'Dashboard' },
  { to: '/admin/complaints',            icon: '📋', label: 'All Complaints' },
  { to: '/admin/officers',              icon: '👮', label: 'Manage Officers' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentComplaints, setRecentComplaints] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/complaints?limit=5'),
    ]).then(([s, c]) => { setStats(s.data); setRecentComplaints(c.data.complaints) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex min-h-screen">
      <Sidebar links={ADMIN_LINKS} portalLabel="Admin Portal" accentColor="bg-terra" />
      <main className="flex-1 flex items-center justify-center"><div className="text-gray-400">Loading…</div></main>
    </div>
  )

  const statCards = [
    { label: 'Total Complaints', value: stats.total,      color: 'text-charcoal',  bg: 'bg-cream' },
    { label: 'Pending',          value: stats.pending,    color: 'text-yellow-700', bg: 'bg-yellow-50' },
    { label: 'In Progress',      value: stats.inProgress, color: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'Resolved',         value: stats.resolved,   color: 'text-green-700',  bg: 'bg-green-50' },
    { label: 'Assigned',         value: stats.assigned,   color: 'text-blue-700',   bg: 'bg-blue-50' },
    { label: 'Rejected',         value: stats.rejected,   color: 'text-red-700',    bg: 'bg-red-50' },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar links={ADMIN_LINKS} portalLabel="Admin Portal" accentColor="bg-terra" />
      <main className="flex-1 p-8 bg-cream">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mb-8">Guntur Civic Grievance Management System</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map(s => (
              <div key={s.label} className={`rounded-xl p-4 text-center ${s.bg} border border-black/5`}>
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* By Category */}
            <div className="card">
              <h3 className="font-semibold mb-4">Issues by Category</h3>
              <div className="space-y-2.5">
                {stats.byCategory.sort((a,b)=>b.count-a.count).slice(0,6).map(cat => {
                  const pct = stats.total ? Math.round((cat.count/stats.total)*100) : 0
                  return (
                    <div key={cat._id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate text-gray-600">{cat._id || 'Uncategorized'}</span>
                        <span className="font-medium ml-2 flex-shrink-0">{cat.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-tan rounded-full" style={{width:`${pct}%`}} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* By Department */}
            <div className="card">
              <h3 className="font-semibold mb-4">Issues by Department</h3>
              {stats.byDept.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No assignments yet</p>
              ) : (
                <div className="space-y-2.5">
                  {stats.byDept.sort((a,b)=>b.count-a.count).map(d => {
                    const pct = stats.total ? Math.round((d.count/stats.total)*100) : 0
                    return (
                      <div key={d._id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{d.name}</span>
                          <span className="font-medium">{d.count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-terra rounded-full" style={{width:`${pct}%`}} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent complaints */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Complaints</h3>
              <Link to="/admin/complaints" className="text-terra text-sm hover:underline">View all →</Link>
            </div>
            <div className="space-y-2">
              {recentComplaints.map(c => (
                <Link key={c._id} to={`/admin/complaints/${c._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.title}</div>
                    <div className="text-xs text-gray-400 flex gap-3 mt-0.5">
                      <span>{c.trackingId}</span>
                      <span>{c.citizen?.name}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    c.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    c.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    c.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>{c.status.replace('_',' ')}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
