import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import '../pages/journal.css'

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
    <nav className="journal-nav">
      <span className="journal-nav-brand">My Journal</span>
      <div className="journal-nav-links">
        {links.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`journal-nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.label}
          </button>
        ))}
        <button onClick={handleLogout} className="journal-nav-signout">
          Sign out
        </button>
      </div>
    </nav>
  )
}
