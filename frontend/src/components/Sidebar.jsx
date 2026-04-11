import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar({ links, portalLabel, accentColor = 'bg-terra' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-64 min-h-screen bg-charcoal flex flex-col flex-shrink-0">
      {/* Logo / Header */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-8 h-8 rounded-lg ${accentColor} flex items-center justify-center text-white font-bold text-sm`}>
            GC
          </div>
          <span className="text-white font-semibold text-sm leading-tight">
            Guntur Civic<br />
            <span className="text-cream/50 font-normal text-xs">{portalLabel}</span>
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-cream/60 text-xs mb-2">Signed in as</div>
        <div className="text-cream text-sm font-medium truncate">{user?.name}</div>
        <div className="text-cream/40 text-xs truncate">{user?.email}</div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full text-left text-cream/60 hover:text-cream text-xs flex items-center gap-2 transition-colors"
        >
          <span>→</span> Sign out
        </button>
      </div>
    </aside>
  )
}
