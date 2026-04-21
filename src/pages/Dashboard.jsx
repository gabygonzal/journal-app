import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const journalColors = {
  today_tomorrow: '#b45309',
  self_eval: '#0f766e',
  goal: '#7c3aed',
  stream: '#be123c',
}

const journalNames = {
  today_tomorrow: 'Today & Tomorrow',
  self_eval: 'Self-Evaluation',
  goal: 'Goal Journal',
  stream: 'Stream of Consciousness',
}

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  // entries per journal type
  const countsByType = Object.keys(journalNames).map(type => ({
    name: journalNames[type].split(' ')[0],
    entries: entries.filter(e => e.journal_type === type).length,
    fill: journalColors[type]
  }))

  // entries per day for last 7 days
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dateStr = d.toISOString().split('T')[0]
    return {
      name: label,
      entries: entries.filter(e => e.created_at.startsWith(dateStr)).length
    }
  })

  const totalEntries = entries.length
  const streak = calculateStreak(entries)
  const mostUsed = countsByType.sort((a, b) => b.entries - a.entries)[0]

  function calculateStreak(entries) {
    if (!entries.length) return 0
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    const dates = [...new Set(entries.map(e => e.created_at.split('T')[0]))].sort().reverse()
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date()
      expected.setDate(expected.getDate() - i)
      const expectedStr = expected.toISOString().split('T')[0]
      if (dates[i] === expectedStr) streak++
      else break
    }
    return streak
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <p className="text-stone-500">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-950 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-stone-100 mb-2">Dashboard</h1>
        <p className="text-stone-400 mb-10">Your journaling overview</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800">
            <p className="text-stone-500 text-sm mb-1">Total entries</p>
            <p className="text-4xl font-semibold text-stone-100">{totalEntries}</p>
          </div>
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800">
            <p className="text-stone-500 text-sm mb-1">Day streak</p>
            <p className="text-4xl font-semibold text-amber-400">{streak} 🔥</p>
          </div>
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800">
            <p className="text-stone-500 text-sm mb-1">Most used journal</p>
            <p className="text-xl font-semibold text-stone-100">
              {totalEntries > 0 ? mostUsed.name : '—'}
            </p>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800">
            <p className="text-stone-300 font-medium mb-6">Entries this week</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                <XAxis dataKey="name" stroke="#78716c" tick={{ fontSize: 12 }} />
                <YAxis stroke="#78716c" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1c1917', border: '1px solid #292524', borderRadius: 8 }}
                  labelStyle={{ color: '#e7e5e4' }}
                  itemStyle={{ color: '#d97706' }}
                />
                <Bar dataKey="entries" fill="#b45309" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800">
            <p className="text-stone-300 font-medium mb-6">Entries by journal</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={countsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                <XAxis dataKey="name" stroke="#78716c" tick={{ fontSize: 12 }} />
                <YAxis stroke="#78716c" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1c1917', border: '1px solid #292524', borderRadius: 8 }}
                  labelStyle={{ color: '#e7e5e4' }}
                  itemStyle={{ color: '#d97706' }}
                />
                <Bar dataKey="entries" radius={[4, 4, 0, 0]}>
                  {countsByType.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent entries */}
        {entries.length > 0 && (
          <div className="mt-6 bg-stone-900 rounded-2xl p-6 border border-stone-800">
            <p className="text-stone-300 font-medium mb-4">Recent entries</p>
            <div className="flex flex-col gap-3">
              {entries.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex justify-between items-center py-2 border-b border-stone-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: journalColors[entry.journal_type] }}
                    />
                    <span className="text-stone-300 text-sm">{journalNames[entry.journal_type]}</span>
                  </div>
                  <span className="text-stone-500 text-xs">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalEntries === 0 && (
          <div className="mt-6 bg-stone-900 rounded-2xl p-8 border border-stone-800 text-center">
            <p className="text-stone-400 mb-4">No entries yet — start writing to see your stats here.</p>
            <button
              onClick={() => window.location.href = '/app/writing'}
              className="px-6 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm transition-colors"
            >
              Write your first entry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}