import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Navbar from './Navbar'

export default function ProtectedRoute() {
  const [session, setSession] = useState(undefined)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const { data } = await supabase
          .from('user_journals')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1)

        if (data && data.length > 0) {
          navigate('/app/dashboard')
        } else {
          navigate('/app/survey')
        }
      }
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined || checking) return null
  if (!session) return <Navigate to="/" />

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}