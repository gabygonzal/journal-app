import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const links = [
    { path: '/app/dashboard', label: 'Dashboard' },
    { path: '/app/writing', label: 'Writing Panel' },
    { path: '/app/journals', label: 'My Journals' },
  ]

  return (
    <nav className="w-full bg-stone-900 border-b border-stone-800 px-8 py-4 flex justify-between items-center">
      <span className="text-amber-500 font-semibold tracking-wide text-sm">
        MY JOURNAL
      </span>
      <div className="flex items-center gap-8">
        {links.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`text-sm transition-colors ${
              location.pathname === link.path
                ? 'text-amber-400 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {link.label}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="text-sm text-stone-600 hover:text-stone-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}