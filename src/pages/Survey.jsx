import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './journal.css'

const questions = [
  {
    question: "What's your main goal right now?",
    answers: [
      { text: "Stay on top of my daily tasks", type: "today_tomorrow" },
      { text: "Understand myself better", type: "self_eval" },
      { text: "Achieve a specific goal", type: "goal" },
      { text: "Clear my head and reduce stress", type: "stream" },
    ]
  },
  {
    question: "How do you prefer to journal?",
    answers: [
      { text: "Structured with clear prompts", type: "today_tomorrow" },
      { text: "Reflective questions about my habits", type: "self_eval" },
      { text: "Tracking progress toward something", type: "goal" },
      { text: "Free writing, no rules", type: "stream" },
    ]
  },
  {
    question: "When do you usually journal?",
    answers: [
      { text: "End of day to review and plan tomorrow", type: "today_tomorrow" },
      { text: "Whenever I need to reflect", type: "self_eval" },
      { text: "Regularly to check my progress", type: "goal" },
      { text: "When I feel overwhelmed or inspired", type: "stream" },
    ]
  }
]

const journalInfo = {
  today_tomorrow: { name: "Today & Tomorrow", description: "Review your day and plan ahead. Best for accountability and daily productivity." },
  self_eval: { name: "Self-Evaluation", description: "Reflect on your habits and patterns. Best for personal growth and self-awareness." },
  goal: { name: "Goal Journal", description: "Track goals and milestones. Best for when you have something specific to achieve." },
  stream: { name: "Stream of Consciousness", description: "Free write with no structure. Best for stress relief and creative thinking." },
}

function getRecommendation(answers) {
  const counts = {}
  answers.forEach(a => counts[a] = (counts[a] || 0) + 1)
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

export default function Survey() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [recommendation, setRecommendation] = useState(null)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  function handleAnswer(type) {
    const newAnswers = [...answers, type]
    if (step < questions.length - 1) {
      setAnswers(newAnswers)
      setStep(step + 1)
    } else {
      const rec = getRecommendation(newAnswers)
      setRecommendation(rec)
      setSelected(rec)
      setAnswers(newAnswers)
    }
  }

  async function handleConfirm() {
    const { data: { user } } = await supabase.auth.getUser()
    for (const type of Object.keys(journalInfo)) {
      const { error } = await supabase.from('user_journals').upsert({
        user_id: user.id, journal_type: type
      }, { onConflict: 'user_id,journal_type' })
      if (error) { console.error('upsert error:', error); return }
    }
    navigate('/app/writing', { state: { recommended: selected } })
  }

  return (
    <div className="journal-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="survey-backdrop">
        <div className="survey-card">

          {recommendation ? (
            <>
              <div style={{ position: 'relative', zIndex: 1, marginBottom: 8 }}>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#1a1208', marginBottom: 4 }}>
                  Your recommendation
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a09070' }}>
                  Based on your answers — pick any you like
                </p>
              </div>

              <div className="survey-rec-grid">
                {Object.entries(journalInfo).map(([type, info]) => (
                  <button
                    key={type}
                    className={`survey-rec-item ${selected === type ? 'selected' : ''}`}
                    onClick={() => setSelected(type)}
                  >
                    {recommendation === type && (
                      <span className="survey-rec-recommended">✦ Recommended</span>
                    )}
                    <span className="survey-rec-name">{info.name}</span>
                    <span className="survey-rec-desc">{info.description}</span>
                  </button>
                ))}
              </div>

              <button className="survey-confirm-btn" onClick={handleConfirm}>
                Begin journaling →
              </button>
            </>
          ) : (
            <>
              <div className="survey-progress">
                {questions.map((_, i) => (
                  <div key={i} className={`survey-progress-bar ${i <= step ? 'filled' : ''}`} />
                ))}
              </div>

              <p className="survey-question">{questions[step].question}</p>

              <div className="survey-answers">
                {questions[step].answers.map((answer, i) => (
                  <button
                    key={i}
                    className="survey-answer-btn"
                    onClick={() => handleAnswer(answer.type)}
                  >
                    <span className="survey-answer-arrow">→</span>
                    {answer.text}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
