import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import Sidebar from '../../components/Sidebar'

const ADMIN_LINKS = [
  { to: '/admin/dashboard', end: true, icon: '📊', label: 'Dashboard' },
  { to: '/admin/complaints',            icon: '📋', label: 'All Complaints' },
  { to: '/admin/officers',              icon: '👮', label: 'Manage Officers' },
]

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', category: '', page: 1 })
  const [departments, setDepartments] = useState([])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.category) params.append('category', filters.category)
      params.append('page', filters.page)
      params.append('limit', 15)
      const { data } = await api.get(`/admin/complaints?${params}`)
      setComplaints(data.complaints)
      setTotal(data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchComplaints() }, [filters])
  useEffect(() => { api.get('/departments').then(r => setDepartments(r.data)) }, [])

  const setFilter = (k, v) => setFilters(p => ({...p, [k]: v, page: 1}))

  return (
    <div className="flex min-h-screen">
      <Sidebar links={ADMIN_LINKS} portalLabel="Admin Portal" accentColor="bg-terra" />
      <main className="flex-1 p-8 bg-cream">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">All Complaints</h1>
              <p className="text-gray-500 text-sm">{total} total complaints</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-5 flex flex-wrap gap-3">
            <div>
              <label className="label text-xs">Status</label>
              <select className="input text-sm py-1.5 w-40" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                <option value="">All Statuses</option>
                {['pending','assigned','in_progress','resolved','rejected'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Search by category</label>
              <input className="input text-sm py-1.5 w-56" placeholder="e.g. Pothole" value={filters.category}
                onChange={e => setFilter('category', e.target.value)} />
            </div>
            {(filters.status || filters.category) && (
              <button onClick={() => setFilters({status:'',category:'',page:1})} className="self-end text-sm text-terra hover:underline mb-0.5">
                Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-charcoal text-cream/70 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Complaint</th>
                  <th className="px-4 py-3 text-left font-medium">Citizen</th>
                  <th className="px-4 py-3 text-left font-medium">Department</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">Loading…</td></tr>
                ) : complaints.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">No complaints found</td></tr>
                ) : complaints.map((c, i) => (
                  <tr key={c._id} className={`border-t border-gray-100 hover:bg-cream transition-colors ${i%2===0?'bg-white':'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.trackingId}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium truncate max-w-[200px]">{c.title}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{c.category}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{c.citizen?.name}</div>
                      <div className="text-xs text-gray-400">{c.citizen?.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {c.assignedDept ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{backgroundColor: c.assignedDept.colorHex}}>
                          {c.assignedDept.shortName}
                        </span>
                      ) : <span className="text-gray-400 text-xs italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/complaints/${c._id}`} className="text-terra text-xs font-medium hover:underline">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > 15 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
                <span className="text-gray-500">Page {filters.page} of {Math.ceil(total/15)}</span>
                <div className="flex gap-2">
                  <button disabled={filters.page<=1} onClick={() => setFilters(p=>({...p,page:p.page-1}))} className="btn-ghost text-xs disabled:opacity-40">← Prev</button>
                  <button disabled={filters.page>=Math.ceil(total/15)} onClick={() => setFilters(p=>({...p,page:p.page+1}))} className="btn-ghost text-xs disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
