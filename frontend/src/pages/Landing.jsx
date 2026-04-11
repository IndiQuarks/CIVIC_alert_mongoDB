import { Link } from 'react-router-dom'

const ISSUES = [
  { icon: '💡', label: 'Broken Street Lights' },
  { icon: '🕳️', label: 'Potholes & Road Damage' },
  { icon: '🗑️', label: 'Garbage Accumulation' },
  { icon: '🐕', label: 'Stray Animals' },
  { icon: '💧', label: 'Water Supply Issues' },
  { icon: '🚰', label: 'Sewage Overflow' },
  { icon: '🚧', label: 'Open Manholes' },
  { icon: '🌳', label: 'Fallen Trees' },
  { icon: '🚦', label: 'Traffic Signal Faults' },
  { icon: '⚡', label: 'Electrical Hazards' },
]

const DEPTS = [
  { name: 'APSPDCL',       color: '#F59E0B', desc: 'Power & Street Lights' },
  { name: 'GMC Roads',     color: '#6B7280', desc: 'Roads & Footpaths' },
  { name: 'GMC Sanitation',color: '#10B981', desc: 'Garbage & Cleanliness' },
  { name: 'GWSSB',         color: '#3B82F6', desc: 'Water & Drainage' },
  { name: 'Animal Husbandry', color: '#8B5CF6', desc: 'Stray Animals' },
  { name: 'R&B Dept.',     color: '#EF4444', desc: 'State Roads & Bridges' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="bg-charcoal text-cream px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-terra rounded-lg flex items-center justify-center font-bold text-sm">GC</div>
          <div>
            <div className="font-semibold text-sm leading-none">Guntur Civic Portal</div>
            <div className="text-cream/50 text-xs mt-0.5">Jan Seva — Public Grievance System</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login"          className="text-cream/70 hover:text-cream text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Citizen Login</Link>
          <Link to="/admin/login"    className="text-cream/70 hover:text-cream text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Admin</Link>
          <Link to="/officer/login"  className="text-cream/70 hover:text-cream text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">Officer</Link>
          <Link to="/register"       className="btn-primary text-sm !px-4 !py-2">Register</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-charcoal text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #A24A3D 0%, transparent 50%), radial-gradient(circle at 75% 50%, #A78966 0%, transparent 50%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-terra/20 border border-terra/30 rounded-full px-4 py-1.5 text-terra text-sm font-medium mb-6">
            🏙️ Serving Guntur, Andhra Pradesh
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            Your City. Your Voice.<br />
            <span className="text-tan">Your Complaint, Resolved.</span>
          </h1>
          <p className="text-cream/60 text-lg max-w-2xl mx-auto mb-10">
            Report civic issues in your neighbourhood directly to the concerned government department. Track resolution in real time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base !px-8 !py-3 shadow-lg shadow-terra/30">
              Report an Issue →
            </Link>
            <Link to="/login" className="border border-cream/30 text-cream px-8 py-3 rounded-lg text-base hover:bg-white/10 transition-colors">
              Track My Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', icon: '📝', title: 'Register', desc: 'Create your account with email and phone number' },
            { step: '02', icon: '📸', title: 'Report', desc: 'Submit your grievance with photos and location' },
            { step: '03', icon: '🏛️', title: 'Assigned', desc: 'Admin routes the issue to the right department & officer' },
            { step: '04', icon: '✅', title: 'Resolved', desc: 'Officer resolves and sends proof back to you' },
          ].map((s) => (
            <div key={s.step} className="card text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terra text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{s.step}</div>
              <div className="text-3xl mb-3 mt-2">{s.icon}</div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Issues grid */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-3">Common Issues We Handle</h2>
          <p className="text-center text-gray-500 text-sm mb-10">And many more — just select "Other" if your issue isn't listed</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {ISSUES.map((i) => (
              <div key={i.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cream hover:bg-tan/10 transition-colors cursor-default">
                <span className="text-2xl">{i.icon}</span>
                <span className="text-xs font-medium text-center text-charcoal">{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-3">Departments in Guntur</h2>
        <p className="text-center text-gray-500 text-sm mb-10">Your complaint is automatically routed to the right department</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DEPTS.map((d) => (
            <div key={d.name} className="card flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: d.color }}>
                {d.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm">{d.name}</div>
                <div className="text-xs text-gray-500">{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-cream/50 text-center py-8 text-xs">
        <div className="font-medium text-cream/70 mb-1">Guntur Civic Portal — Jan Seva</div>
        Guntur Municipal Corporation · Government of Andhra Pradesh
        <div className="mt-3 flex items-center justify-center gap-6">
          <Link to="/admin/login"   className="hover:text-cream transition-colors">Admin Portal</Link>
          <Link to="/officer/login" className="hover:text-cream transition-colors">Officer Portal</Link>
        </div>
      </footer>
    </div>
  )
}
