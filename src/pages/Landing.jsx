import { useNavigate } from 'react-router-dom'

const features = [
  {
    title: 'Today & Tomorrow',
    description: 'Build daily accountability by reflecting on your day and planning ahead.',
    icon: '📅',
    color: 'border-amber-700/50 bg-amber-900/20',
    textColor: 'text-amber-400',
  },
  {
    title: 'Self-Evaluation',
    description: 'Understand your patterns and habits through guided reflection.',
    icon: '🔍',
    color: 'border-teal-700/50 bg-teal-900/20',
    textColor: 'text-teal-400',
  },
  {
    title: 'Goal Journal',
    description: 'Turn your dreams into concrete plans with milestone tracking.',
    icon: '🎯',
    color: 'border-purple-700/50 bg-purple-900/20',
    textColor: 'text-purple-400',
  },
  {
    title: 'Stream of Consciousness',
    description: 'Clear your mind with free-form writing — no prompts, no rules.',
    icon: '🌊',
    color: 'border-rose-700/50 bg-rose-900/20',
    textColor: 'text-rose-400',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">

      {/* Nav */}
      <nav className="w-full px-8 py-5 flex justify-between items-center border-b border-stone-800/50">
        <span className="text-amber-500 font-semibold tracking-wide text-sm">MY JOURNAL</span>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate('/login')}
            className="text-stone-400 hover:text-stone-200 text-sm transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm transition-colors"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <p className="text-amber-500 text-xs font-medium uppercase tracking-widest mb-6">
          Your personal productivity space
        </p>
        <h1 className="text-5xl font-semibold text-stone-100 leading-tight mb-6">
          Journal your way to<br />
          <span className="text-amber-400">clarity and focus</span>
        </h1>
        <p className="text-stone-400 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Four powerful journaling methods in one beautiful app. Track your productivity,
          reflect on your growth, and achieve your goals — one entry at a time.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            Start journaling free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 rounded-xl border border-stone-700 hover:border-stone-500 text-stone-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </div>
      </section>

      {/* Book visual */}
 {/* Book visual */}
 <section className="max-w-4xl mx-auto px-8 pb-24">
        <div className="flex justify-center items-end gap-8 mt-4">
          {[
            { color: 'bg-amber-800', spine: 'bg-amber-900', name: 'Today & Tomorrow', h: 'h-52' },
            { color: 'bg-teal-800', spine: 'bg-teal-900', name: 'Self-Evaluation', h: 'h-48' },
            { color: 'bg-purple-800', spine: 'bg-purple-900', name: 'Goal Journal', h: 'h-56' },
            { color: 'bg-rose-800', spine: 'bg-rose-900', name: 'Stream', h: 'h-44' },
          ].map((book, i) => (
            <div
              key={i}
              className={`flex ${book.h} w-32 hover:scale-105 hover:-translate-y-2 transition-transform duration-300 cursor-pointer shadow-2xl`}
            >
              <div className={`w-5 h-full rounded-l-sm ${book.spine} border-r border-black/20`} />
              <div className={`flex-1 h-full ${book.color} rounded-r-sm flex items-end p-3`}>
                <p className="text-white/70 text-xs font-medium leading-tight">{book.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-8 pb-24">
        <h2 className="text-2xl font-semibold text-stone-100 text-center mb-12">
          Four journals, one purpose
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl border ${f.color} transition-all hover:scale-[1.02]`}
            >
              <span className="text-2xl mb-4 block">{f.icon}</span>
              <h3 className={`font-semibold mb-2 ${f.textColor}`}>{f.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-8 pb-24">
        <h2 className="text-2xl font-semibold text-stone-100 text-center mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Take the survey', desc: 'Answer a few questions and get a personalized journal recommendation.' },
            { step: '02', title: 'Write your entry', desc: 'Use guided prompts or free write — whatever works for you.' },
            { step: '03', title: 'Track your growth', desc: 'Read back through your journal like a real book and watch your progress.' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-amber-500/40 text-4xl font-bold mb-4">{s.step}</p>
              <h3 className="text-stone-200 font-medium mb-2">{s.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-8 pb-24 text-center">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12">
          <h2 className="text-3xl font-semibold text-stone-100 mb-4">
            Ready to start writing?
          </h2>
          <p className="text-stone-400 mb-8">
            Free to use. No credit card required.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-10 py-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            Create your journal
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800 px-8 py-6 text-center">
        <p className="text-stone-600 text-sm">My Journal — your personal productivity space</p>
      </footer>

    </div>
  )
}