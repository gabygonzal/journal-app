import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import BookViewer from '../components/BookViewer'

const journals = [
  {
    type: 'today_tomorrow',
    name: 'Today & Tomorrow',
    subtitle: 'Daily accountability',
    color: 'bg-amber-800',
    borderColor: 'border-amber-700',
    textColor: 'text-amber-100',
    spineColor: 'bg-amber-900',
  },
  {
    type: 'self_eval',
    name: 'Self-Evaluation',
    subtitle: 'Know yourself better',
    color: 'bg-teal-800',
    borderColor: 'border-teal-700',
    textColor: 'text-teal-100',
    spineColor: 'bg-teal-900',
  },
  {
    type: 'goal',
    name: 'Goal Journal',
    subtitle: 'Track your progress',
    color: 'bg-purple-800',
    borderColor: 'border-purple-700',
    textColor: 'text-purple-100',
    spineColor: 'bg-purple-900',
  },
  {
    type: 'stream',
    name: 'Stream of Consciousness',
    subtitle: 'Free your mind',
    color: 'bg-rose-800',
    borderColor: 'border-rose-700',
    textColor: 'text-rose-100',
    spineColor: 'bg-rose-900',
  },
]

export default function Journals() {
  const [openJournal, setOpenJournal] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  if (openJournal) {
    return (
      <BookViewer
        journal={journals.find(j => j.type === openJournal)}
        onClose={() => setOpenJournal(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-semibold text-stone-100">My Journals</h1>
            <p className="text-stone-400 mt-1">Choose a journal to open</p>
          </div>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors text-sm"
          >
            Dashboard →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          {journals.map((journal) => (
            <button
              key={journal.type}
              onClick={() => setOpenJournal(journal.type)}
              className="group flex flex-col items-center gap-3"
            >
              {/* Book */}
              <div className="relative flex h-64 w-44 group-hover:scale-105 transition-transform duration-300">
                {/* Spine */}
                <div className={`w-5 h-full rounded-l-sm ${journal.spineColor} border-r border-black/20 flex-shrink-0`} />
                {/* Cover */}
                <div className={`flex-1 h-full ${journal.color} ${journal.borderColor} border rounded-r-sm flex flex-col justify-between p-4 shadow-xl`}>
                  {/* Decorative lines */}
                  <div className="space-y-1.5">
                    <div className={`h-0.5 w-full ${journal.textColor} opacity-20 bg-current`} />
                    <div className={`h-0.5 w-3/4 ${journal.textColor} opacity-20 bg-current`} />
                  </div>
                  {/* Title */}
                  <div>
                    <p className={`text-xs font-medium ${journal.textColor} opacity-60 mb-1`}>{journal.subtitle}</p>
                    <p className={`text-sm font-semibold ${journal.textColor} leading-tight`}>{journal.name}</p>
                  </div>
                </div>
              </div>
              <span className="text-stone-400 text-xs group-hover:text-stone-200 transition-colors">
                Click to open
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}