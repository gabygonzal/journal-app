import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'
import './journal.css'

const journalOptions = [
  { type: 'today_tomorrow', name: 'Today & Tomorrow' },
  { type: 'self_eval', name: 'Self-Evaluation' },
  { type: 'goal', name: 'Goal Journal' },
  { type: 'stream', name: 'Stream of Consciousness' },
]

const prompts = {
  today_tomorrow: [
    "What did I work on today?",
    "What affected my productivity today?",
    "What would I do differently?",
    "What's my plan for tomorrow?",
    "One thing I'm proud of today:",
  ],
  self_eval: [
    "What patterns have I noticed in myself lately?",
    "What's working well in my routine?",
    "What's not working and why?",
    "What would I tell a friend in my situation?",
    "One thing I want to improve:",
  ],
  goal: [
    "What is my current main goal?",
    "What progress did I make today?",
    "What obstacles am I facing?",
    "What's my next concrete step?",
    "How does this goal make me feel?",
  ],
  stream: [],
}

export default function WritingPanel() {
  const [selectedType, setSelectedType] = useState('today_tomorrow')
  const [currentEntry, setCurrentEntry] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.recommended) setSelectedType(location.state.recommended)
  }, [])

  const isStream = selectedType === 'stream'
  const journalPrompts = prompts[selectedType]

  function handleTypeChange(type) {
    setSelectedType(type)
    setCurrentEntry({})
  }

  async function handleSave() {
    if (Object.keys(currentEntry).length === 0) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('entries').insert({
      user_id: user.id,
      journal_type: selectedType,
      content: currentEntry,
    })
    if (!error) {
      setSaved(true)
      setCurrentEntry({})
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="journal-page">
      <div className="journal-content">

        {/* spacer — 32px so title doesn't hug top */}
        <div style={{ height: 32, flexShrink: 0 }} />

        {/* Header — 64px */}
        <div className="journal-page-header">
          <h1 className="journal-page-title">Writing Panel</h1>
          <span className="journal-page-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* spacer — 32px */}
        <div style={{ height: 32, flexShrink: 0 }} />

        {/* Journal selector — 32px */}
        <div className="journal-selector">
          {journalOptions.map(j => (
            <button
              key={j.type}
              onClick={() => handleTypeChange(j.type)}
              className={`journal-tab ${selectedType === j.type ? 'active' : ''}`}
            >
              {j.name}
            </button>
          ))}
        </div>

        {/* Writing area */}
        <div className="journal-writing-area">
          {isStream ? (
            <textarea
              className="journal-stream-textarea"
              value={currentEntry.thoughts || ''}
              onChange={e => setCurrentEntry({ thoughts: e.target.value })}
              placeholder="Let your thoughts flow freely..."
            />
          ) : (
            journalPrompts.map((prompt, i) => (
              <div key={i} style={{ flexShrink: 0 }}>
                <div className="journal-prompt-label">{prompt}</div>
                <textarea
                  className="journal-textarea"
                  value={currentEntry[prompt] || ''}
                  onChange={e => {
                    const value = e.target.value
                    setCurrentEntry(prev => ({ ...prev, [prompt]: value }))
                  }}
                  placeholder="Write here..."
                  rows={2}
                />
              </div>
            ))
          )}
        </div>

        {/* Save row */}
        <div className="journal-save-row">
          <button className="journal-save-link" onClick={() => navigate('/app/journals')}>
            View my journals →
          </button>
          <button
            className="journal-save-btn"
            onClick={handleSave}
            disabled={saving || Object.keys(currentEntry).length === 0}
          >
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save entry'}
          </button>
        </div>

      </div>
    </div>
  )
}
