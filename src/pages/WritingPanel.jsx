import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'

const journalOptions = [
  { type: 'today_tomorrow', name: 'Today & Tomorrow', subtitle: 'Daily accountability' },
  { type: 'self_eval', name: 'Self-Evaluation', subtitle: 'Know yourself better' },
  { type: 'goal', name: 'Goal Journal', subtitle: 'Track your progress' },
  { type: 'stream', name: 'Stream of Consciousness', subtitle: 'Free your mind' },
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
    if (location.state?.recommended) {
      setSelectedType(location.state.recommended)
    }
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
    <div className="min-h-screen bg-stone-950 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-stone-100 mb-2">Writing Panel</h1>
        <p className="text-stone-400 mb-8">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Journal selector */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {journalOptions.map((j) => (
            <button
              key={j.type}
              onClick={() => handleTypeChange(j.type)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedType === j.type
                  ? 'border-amber-500 bg-stone-800'
                  : 'border-stone-700 bg-stone-900 hover:border-stone-500'
              }`}
            >
              <p className="text-stone-100 text-xs font-medium leading-tight">{j.name}</p>
              <p className="text-stone-500 text-xs mt-0.5">{j.subtitle}</p>
            </button>
          ))}
        </div>

        {/* Writing area */}
        <div className="bg-amber-50 rounded-2xl p-8 shadow-xl">
          <div className="border-b border-amber-200 pb-4 mb-6">
            <p className="text-amber-900 text-xs font-medium uppercase tracking-widest">
              {journalOptions.find(j => j.type === selectedType)?.name}
            </p>
          </div>

          {isStream ? (
            <textarea
              value={currentEntry.thoughts || ''}
              onChange={(e) => setCurrentEntry({ thoughts: e.target.value })}
              placeholder="Let your thoughts flow freely..."
              className="w-full bg-transparent text-stone-700 text-sm leading-relaxed resize-none focus:outline-none placeholder-amber-300 min-h-96"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e9d5a1 27px, #e9d5a1 28px)',
                lineHeight: '28px',
                paddingTop: '4px',
              }}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {journalPrompts.map((prompt, i) => (
                <div key={i}>
                  <p className="text-amber-800 text-xs font-medium mb-2">{prompt}</p>
                  <textarea
                    value={currentEntry[prompt] || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setCurrentEntry(prev => ({ ...prev, [prompt]: value }))
                    }}
                    placeholder="Write here..."
                    rows={3}
                    className="w-full bg-transparent text-stone-700 text-sm leading-relaxed resize-none focus:outline-none pb-2 placeholder-amber-300"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e9d5a1 27px, #e9d5a1 28px)',
                      lineHeight: '28px',
                      paddingTop: '4px',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => navigate('/app/journals')}
            className="text-stone-500 text-sm hover:text-stone-300 transition-colors"
          >
            View my journals →
          </button>
          <button
            onClick={handleSave}
            disabled={saving || Object.keys(currentEntry).length === 0}
            className="px-8 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-medium transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving...' : saved ? 'Saved! ✓' : 'Save entry'}
          </button>
        </div>
      </div>
    </div>
  )
}