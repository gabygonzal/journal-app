import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

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
  today_tomorrow: {
    name: "Today & Tomorrow",
    description: "Review your day and plan ahead. Best for accountability and daily productivity.",
    color: "bg-amber-700"
  },
  self_eval: {
    name: "Self-Evaluation",
    description: "Reflect on your habits and patterns. Best for personal growth and self-awareness.",
    color: "bg-teal-700"
  },
  goal: {
    name: "Goal Journal",
    description: "Track goals and milestones. Best for when you have something specific to achieve.",
    color: "bg-purple-700"
  },
  stream: {
    name: "Stream of Consciousness",
    description: "Free write with no structure. Best for stress relief and creative thinking.",
    color: "bg-rose-700"
  }
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
      user_id: user.id,
      journal_type: type
    }, { onConflict: 'user_id,journal_type' })

    if (error) {
      console.error('upsert error:', error)
      return
    }
  }

  navigate('/app/writing', { state: { recommended: selected } })
}

  if (recommendation) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <h2 className="text-2xl font-semibold text-stone-100 text-center mb-2">Your recommendation</h2>
          <p className="text-stone-400 text-center mb-8">Based on your answers — but you can pick any you like.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {Object.entries(journalInfo).map(([type, info]) => (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selected === type
                    ? 'border-amber-500 bg-stone-800'
                    : 'border-stone-700 bg-stone-900 hover:border-stone-500'
                }`}
              >
                {recommendation === type && (
                  <span className="text-xs text-amber-400 font-medium mb-1 block">Recommended</span>
                )}
                <p className="text-stone-100 font-medium text-sm">{info.name}</p>
                <p className="text-stone-400 text-xs mt-1">{info.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            Let's go →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex gap-2 mb-8">
          {questions.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-amber-500' : 'bg-stone-700'}`} />
          ))}
        </div>

        <h2 className="text-xl font-semibold text-stone-100 mb-6">{questions[step].question}</h2>

        <div className="flex flex-col gap-3">
          {questions[step].answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(answer.type)}
              className="p-4 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 text-left hover:border-amber-500 hover:bg-stone-800 transition-all"
            >
              {answer.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}