import { useState, useRef, useEffect, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { supabase } from "../supabaseClient";

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
};

const Page = forwardRef(({ children, className }, ref) => (
  <div ref={ref} className={`bg-amber-50 ${className}`}>
    {children}
  </div>
));

export default function BookViewer({ journal, onClose }) {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const bookRef = useRef();

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("journal_type", journal.type)
      .order("created_at", { ascending: false });
    if (data) setEntries(data);
  }

  async function handleSave() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("entries").insert({
      user_id: user.id,
      journal_type: journal.type,
      content: currentEntry,
    });
    if (!error) {
      setSaved(true);
      setCurrentEntry({});
      loadEntries();
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  const journalPrompts = prompts[journal.type];
  const isStream = journal.type === "stream";

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-5xl mb-6">
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-200 transition-colors text-sm"
        >
          ← Back to journals
        </button>
        <h2 className="text-stone-200 font-medium">{journal.name}</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save entry"}
        </button>
      </div>

      {/* Book */}
      <HTMLFlipBook
        ref={bookRef}
        width={450}
        height={580}
        size="fixed"
        minWidth={300}
        maxWidth={500}
        minHeight={400}
        maxHeight={650}
        drawShadow={true}
        flippingTime={700}
        className="shadow-2xl"
        showCover={false}
        mobileScrollSupport={true}
        disableFlipByClick={true}
      >
        {/* Left page — prompts or last entry */}
        <Page>
          <div className="h-full p-8 flex flex-col">
            <div className="border-b border-amber-200 pb-3 mb-6">
              <p className="text-amber-900 text-xs font-medium uppercase tracking-widest">
                {entries.length > 0 ? "Last entry" : "Prompts"}
              </p>
              {entries.length > 0 && (
                <p className="text-amber-700 text-xs mt-1">
                  {new Date(entries[0].created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {entries.length > 0 ? (
              <div className="flex flex-col gap-4 overflow-hidden">
                {Object.entries(entries[0].content).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-amber-800 text-xs font-medium mb-1">
                      {key}
                    </p>
                    <p className="text-stone-700 text-sm leading-relaxed">
                      {val}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {isStream ? (
                  <p className="text-stone-500 text-sm italic leading-relaxed">
                    This is your space to write freely. No prompts, no structure
                    — just let your thoughts flow onto the page.
                  </p>
                ) : (
                  journalPrompts.map((prompt, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-amber-400 text-xs mt-0.5">✦</span>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        {prompt}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Page lines decoration */}
            <div className="mt-auto space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-px bg-amber-200 w-full" />
              ))}
            </div>
          </div>
        </Page>

        {/* Right page — write here */}
        <Page>
          <div className="h-full p-8 flex flex-col">
            <div className="border-b border-amber-200 pb-3 mb-6">
              <p className="text-amber-900 text-xs font-medium uppercase tracking-widest">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {isStream ? (
              <textarea
              value={currentEntry.thoughts || ""}
              onChange={(e) => setCurrentEntry({ thoughts: e.target.value })}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Start writing..."
              className="flex-1 w-full bg-transparent text-stone-700 text-sm leading-relaxed resize-none focus:outline-none placeholder-amber-300"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(transparent, transparent 27px, #e9d5a1 27px, #e9d5a1 28px)",
                lineHeight: "28px",
                paddingTop: "4px",
              }}
            />
            ) : (
              <div className="flex flex-col gap-5 overflow-y-auto flex-1">
                {journalPrompts.map((prompt, i) => (
                  <div key={i}>
                    <p className="text-amber-800 text-xs font-medium mb-1">
                      {prompt}
                    </p>
                    <textarea
  value={currentEntry[prompt] || ""}
  onChange={(e) =>
    setCurrentEntry({
      ...currentEntry,
      [prompt]: e.target.value,
    })
  }
  onPointerDown={(e) => e.stopPropagation()}
  placeholder="Write here..."
  rows={2}
  className="w-full bg-transparent text-stone-700 text-sm leading-relaxed resize-none focus:outline-none border-b border-amber-200 pb-1 placeholder-amber-300"
/>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Page>

        {/* Past entries — one spread per entry */}
        {entries.map((entry, index) => (
          <Page key={entry.id}>
            <div className="h-full p-8 flex flex-col">
              <div className="border-b border-amber-200 pb-3 mb-6">
                <p className="text-amber-900 text-xs font-medium uppercase tracking-widest">
                  Entry {entries.length - index}
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  {new Date(entry.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-4 overflow-hidden">
                {Object.entries(entry.content).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-amber-800 text-xs font-medium mb-1">
                      {key}
                    </p>
                    <p className="text-stone-700 text-sm leading-relaxed">
                      {val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Page>
        ))}
      </HTMLFlipBook>

      <p className="text-stone-600 text-xs mt-4">
        Drag the page corner to flip
      </p>
    </div>
  );
}
