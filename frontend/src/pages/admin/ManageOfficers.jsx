import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../services/api'
import Sidebar from '../../components/Sidebar'

const ADMIN_LINKS = [
  { to: '/admin/dashboard',  end: true, icon: '📊', label: 'Dashboard' },
  { to: '/admin/complaints',            icon: '📋', label: 'All Complaints' },
  { to: '/admin/officers',              icon: '👮', label: 'Manage Officers' },
]

const EMPTY = { name: '', email: '', phone: '', password: '', designation: '', department: '' }

export default function ManageOfficers() {
  const [officers, setOfficers]     = useState([])
  const [departments, setDepts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [filterDept, setFilterDept] = useState('')

  const fetchOfficers = () =>
    api.get('/admin/officers').then(r => setOfficers(r.data)).finally(() => setLoading(false))

  useEffect(() => {
    fetchOfficers()
    api.get('/departments').then(r => setDepts(r.data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.department) return toast.error('Select a department')
    setSaving(true)
    try {
      const { data } = await api.post('/admin/officers', form)
      setOfficers(p => [data, ...p])
      setForm(EMPTY)
      setShowForm(false)
      toast.success(`Officer ${data.name} added!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add officer')
    } finally { setSaving(false) }
  }

  const toggleActive = async (officer) => {
    try {
      const { data } = await api.put(`/admin/officers/${officer._id}`, { isActive: !officer.isActive })
      setOfficers(p => p.map(o => o._id === data._id ? data : o))
      toast.success(`Officer ${data.isActive ? 'activated' : 'deactivated'}`)
    } catch { toast.error('Update failed') }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove officer ${name}?`)) return
    try {
      await api.delete(`/admin/officers/${id}`)
      setOfficers(p => p.filter(o => o._id !== id))
      toast.success('Officer removed')
    } catch { toast.error('Delete failed') }
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm(p => ({...p, [k]: e.target.value})) })

  const filtered = filterDept ? officers.filter(o => o.department?._id === filterDept) : officers

  return (
    <div className="flex min-h-screen">
      <Sidebar links={ADMIN_LINKS} portalLabel="Admin Portal" accentColor="bg-terra" />
      <main className="flex-1 p-8 bg-cream">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Manage Officers</h1>
              <p className="text-gray-500 text-sm">{officers.length} officers across {departments.length} departments</p>
            </div>
            <button onClick={() => setShowForm(p => !p)} className="btn-primary">
              {showForm ? 'Cancel' : '+ Add Officer'}
            </button>
          </div>

          {/* Add Officer Form */}
          {showForm && (
            <div className="card mb-6 border-l-4 border-terra">
              <h3 className="font-semibold mb-4">New Officer</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Full Name *</label>
                  <input className="input text-sm" placeholder="e.g. P. Venkata Rao" required {...f('name')} />
                </div>
                <div>
                  <label className="label text-xs">Official Email *</label>
                  <input className="input text-sm" type="email" placeholder="officer@guntur.in" required {...f('email')} />
                </div>
                <div>
                  <label className="label text-xs">Phone Number</label>
                  <input className="input text-sm" placeholder="10-digit mobile" maxLength={10} {...f('phone')} />
                </div>
                <div>
                  <label className="label text-xs">Designation *</label>
                  <input className="input text-sm" placeholder="e.g. Junior Engineer – Roads" required {...f('designation')} />
                </div>
                <div>
                  <label className="label text-xs">Department *</label>
                  <select className="input text-sm" required {...f('department')}>
                    <option value="">— Select Department —</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.shortName} — {d.name.slice(0,40)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Temporary Password *</label>
                  <input className="input text-sm" type="password" placeholder="Min. 6 characters" required {...f('password')} />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'Adding…' : 'Add Officer'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY) }} className="btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter by department */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <button onClick={() => setFilterDept('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filterDept ? 'bg-terra text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              All Departments
            </button>
            {departments.map(d => (
              <button key={d._id} onClick={() => setFilterDept(d._id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterDept===d._id ? 'text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                style={filterDept===d._id ? { backgroundColor: d.colorHex } : {}}>
                {d.shortName}
              </button>
            ))}
          </div>

          {/* Officers Table */}
          <div className="card overflow-hidden p-0">
            {loading ? (
              <div className="text-center py-16 text-gray-400">Loading officers…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">👮</div>
                <p className="text-gray-500 font-medium">No officers found</p>
                <p className="text-gray-400 text-sm mt-1">Add an officer to get started</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-charcoal text-cream/70 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Officer</th>
                    <th className="px-4 py-3 text-left font-medium">Department</th>
                    <th className="px-4 py-3 text-left font-medium">Designation</th>
                    <th className="px-4 py-3 text-left font-medium">Contact</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => (
                    <tr key={o._id} className={`border-t border-gray-100 hover:bg-cream transition-colors ${i%2===0?'bg-white':'bg-gray-50/50'}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.name}</div>
                        <div className="text-xs text-gray-400">{o.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: departments.find(d => d._id === o.department?._id)?.colorHex || '#888' }}>
                          {o.department?.shortName || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{o.designation}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{o.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                          {o.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleActive(o)}
                            className="text-xs text-tan hover:underline">
                            {o.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <span className="text-gray-200">|</span>
                          <button onClick={() => handleDelete(o._id, o.name)}
                            className="text-xs text-red-500 hover:underline">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
