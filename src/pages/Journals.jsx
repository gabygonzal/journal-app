import { useState } from 'react'
import BookViewer from '../components/BookViewer'
import './journal.css'

const journals = [
  { type: 'today_tomorrow', name: 'Today & Tomorrow', subtitle: 'Daily accountability', coverColor: '#8b6a30', spineColor: '#6b5020', pageColor: '#f5f0e4', accentColor: '#c8a870' },
  { type: 'self_eval', name: 'Self-Evaluation', subtitle: 'Know yourself better', coverColor: '#5a7a50', spineColor: '#3a5a30', pageColor: '#f0f5ec', accentColor: '#90b888' },
  { type: 'goal', name: 'Goal Journal', subtitle: 'Track your progress', coverColor: '#5a6a8a', spineColor: '#3a4a6a', pageColor: '#eef0f5', accentColor: '#8898b8' },
  { type: 'stream', name: 'Stream of Consciousness', subtitle: 'Free your mind', coverColor: '#7a5a6a', spineColor: '#5a3a4a', pageColor: '#f5eef2', accentColor: '#b888a0' },
]

function BookDrawing({ journal }) {
  const { coverColor, spineColor, pageColor, accentColor } = journal
  return (
    <svg className="journal-book-drawing" viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="52" cy="136" rx="30" ry="4" fill="rgba(0,0,0,0.08)" />
      <rect x="18" y="8" width="72" height="124" rx="2" fill={pageColor} />
      <rect x="18" y="8" width="72" height="124" rx="2" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
      {[0,1,2,3,4].map(i => <line key={i} x1="88" y1={12+i*2} x2="88" y2={128-i*2} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />)}
      <rect x="10" y="6" width="72" height="128" rx="2" fill={coverColor} />
      <rect x="10" y="6" width="72" height="128" rx="2" fill="url(#sh)" />
      <rect x="15" y="11" width="62" height="118" rx="1" stroke={accentColor} strokeWidth="0.75" fill="none" opacity="0.45" />
      <rect x="10" y="6" width="14" height="128" rx="2" fill={spineColor} />
      <rect x="10" y="6" width="14" height="128" rx="2" fill="url(#sph)" />
      <line x1="24" y1="6" x2="24" y2="134" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <line x1="28" y1="22" x2="74" y2="22" stroke={accentColor} strokeWidth="0.75" opacity="0.5" />
      <line x1="28" y1="26" x2="60" y2="26" stroke={accentColor} strokeWidth="0.75" opacity="0.3" />
      <rect x="68" y="0" width="6" height="18" fill={accentColor} opacity="0.7" />
      <polygon points="68,18 71,14 74,18" fill={coverColor} />
      {[0,1,2,3,4,5].map(i => <line key={i} x1="28" y1={90+i*7} x2="74" y2={90+i*7} stroke={accentColor} strokeWidth="0.5" opacity="0.25" />)}
      <defs>
        <linearGradient id="sh" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.1" />
          <stop offset="40%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="sph" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="black" stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Journals() {
  const [openJournal, setOpenJournal] = useState(null)

  return (
    <div className="journal-page">
      {openJournal && (
        <BookViewer
          journal={journals.find(j => j.type === openJournal)}
          onClose={() => setOpenJournal(null)}
        />
      )}
      <div className="journal-content">

        <div style={{ height: 32, flexShrink: 0 }} />

        <div className="journal-page-header">
          <h1 className="journal-page-title">My Journals</h1>
          <span className="journal-page-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="journal-section-label">Choose a journal to open</div>

        <div className="journal-books-grid">
          {journals.map(journal => (
            <button key={journal.type} className="journal-book-btn" onClick={() => setOpenJournal(journal.type)}>
              <BookDrawing journal={journal} />
              <div>
                <div className="journal-book-name">{journal.name}</div>
                <div className="journal-book-sub">{journal.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
