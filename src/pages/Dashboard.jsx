import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './journal.css'

const journalColors = {
  today_tomorrow: '#8b6a30',
  self_eval: '#5a7a50',
  goal: '#6a5a7a',
  stream: '#7a5a5a',
}

const journalNames = {
  today_tomorrow: 'Today & Tomorrow',
  self_eval: 'Self-Evaluation',
  goal: 'Goal Journal',
  stream: 'Stream of Consciousness',
}

function calculateStreak(entries) {
  if (!entries.length) return 0
  let streak = 0
  const dates = [...new Set(entries.map(e => e.created_at.split('T')[0]))].sort().reverse()
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date()
    expected.setDate(expected.getDate() - i)
    if (dates[i] === expected.toISOString().split('T')[0]) streak++
    else break
  }
  return streak
}

export default function Dashboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { loadEntries() }, [])

  async function loadEntries() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('entries').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  const countsByType = Object.keys(journalNames).map(type => ({
    name: journalNames[type].split(' ')[0],
    entries: entries.filter(e => e.journal_type === type).length,
    color: journalColors[type],
  }))

  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      entries: entries.filter(e => e.created_at.startsWith(d.toISOString().split('T')[0])).length,
    }
  })

  const totalEntries = entries.length
  const streak = calculateStreak(entries)
  const mostUsed = [...countsByType].sort((a, b) => b.entries - a.entries)[0]

  const tooltipStyle = {
    contentStyle: { background: '#f5f0e4', border: '0.5px solid rgba(160,140,100,0.4)', borderRadius: 2, fontFamily: 'Inter', fontSize: 11 },
    labelStyle: { color: '#3a3020', fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' },
    itemStyle: { color: '#7a6a48' },
    cursor: { fill: 'rgba(160,140,100,0.06)' },
  }

  if (loading) return (
    <div className="journal-page">
      <div className="journal-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Caveat', fontSize: 22, color: '#a09070' }}>Opening your journal...</p>
      </div>
    </div>
  )

  return (
    <div className="journal-page">
      <div className="journal-content">

        <div className="journal-page-header">
          <h1 className="journal-page-title">Dashboard</h1>
          <span className="journal-page-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="journal-section-label">At a glance</div>

        {/* Stats — 128px total, each column left-aligned */}
        <div className="journal-stats-grid">
          <div className="journal-stat">
            <div className="journal-stat-label">Total entries</div>
            <div className="journal-stat-value">{totalEntries}</div>
          </div>
          <div className="journal-stat">
            <div className="journal-stat-label">Day streak</div>
            <div className="journal-stat-value">{streak}</div>
            <div className="journal-stat-sub">days in a row</div>
          </div>
          <div className="journal-stat">
            <div className="journal-stat-label">Most used</div>
            {totalEntries > 0
              ? <div className="journal-stat-value-sm">{mostUsed.name}</div>
              : <div className="journal-stat-value">—</div>
            }
          </div>
        </div>

        {/* Chart labels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, flexShrink: 0 }}>
          <div className="journal-chart-label">Entries this week</div>
          <div className="journal-chart-label">Entries by journal</div>
        </div>

        {/* Charts */}
        <div className="journal-charts-row">
          <div className="journal-chart-card">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7} barSize={14}>
                <XAxis dataKey="name" tick={{ fontFamily: 'Inter', fontSize: 9, fill: '#a09070' }} axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="entries" fill="#8b6a30" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="journal-chart-card">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countsByType} barSize={14}>
                <XAxis dataKey="name" tick={{ fontFamily: 'Inter', fontSize: 9, fill: '#a09070' }} axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="entries" radius={[2, 2, 0, 0]}>
                  {countsByType.map((entry, i) => (
                    <rect key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {totalEntries > 0 ? (
          <>
            <div className="journal-section-label">Recent entries</div>
            {entries.slice(0, 4).map(entry => (
              <div key={entry.id} className="journal-entry-row">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="journal-entry-dot" style={{ background: journalColors[entry.journal_type] }} />
                  <span className="journal-entry-name">{journalNames[entry.journal_type]}</span>
                </div>
                <span className="journal-entry-date">
                  {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </>
        ) : (
          <div className="journal-empty">
            <p className="journal-empty-text">No entries yet — your story begins here.</p>
            <button className="journal-empty-btn" onClick={() => navigate('/app/writing')}>
              Write your first entry
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
