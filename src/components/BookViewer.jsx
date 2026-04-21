import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

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

const PAGE_WIDTH = 420;
const PAGE_HEIGHT = 600;
const FLIP_MS = 1000;

const Page = forwardRef(({ children, className }, ref) => (
  <div ref={ref} className={`bg-amber-50 ${className ?? ""}`}>
    {children}
  </div>
));

function entrySpreadStartIndex(entryIndex) {
  return 2 + entryIndex * 2;
}

export default function BookViewer({ journal, onClose }) {
  const [entries, setEntries] = useState([]);
  const [disableFlipByClick, setDisableFlipByClick] = useState(true);
  const pendingPrevFlipRef = useRef(false);
  const bookRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    loadEntries();
  }, []);

  useLayoutEffect(() => {
    if (!disableFlipByClick && pendingPrevFlipRef.current) {
      pendingPrevFlipRef.current = false;
      queueMicrotask(() => {
        bookRef.current?.pageFlip()?.flipPrev("top");
      });
    }
  }, [disableFlipByClick]);

  useEffect(() => {
    if (!disableFlipByClick) {
      const t = setTimeout(() => setDisableFlipByClick(true), FLIP_MS + 120);
      return () => clearTimeout(t);
    }
  }, [disableFlipByClick]);

  async function loadEntries() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("journal_type", journal.type)
      .order("created_at", { ascending: false });
    if (data) setEntries(data);
  }

  function flipToEntry(entryIndex) {
    const page = entrySpreadStartIndex(entryIndex);
    bookRef.current?.pageFlip()?.flip(page, "top");
  }

  function handleAnimatedPrev() {
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    if (api.getCurrentPageIndex() <= 0) return;
    pendingPrevFlipRef.current = true;
    setDisableFlipByClick(false);
  }

  const journalPrompts = prompts[journal.type];
  const isStream = journal.type === "stream";
  const bookOuterMax = PAGE_WIDTH * 2 + 80;

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 pb-10">
      {/* Header */}
      <div
        className="flex justify-between items-center w-full mb-6 px-1"
        style={{ maxWidth: bookOuterMax }}
      >
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-200 transition-colors text-sm"
        >
          ← Back to journals
        </button>
        <h2 className="text-stone-200 font-medium">{journal.name}</h2>
        <button
          onClick={() => navigate('/app/writing')}
          className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm transition-colors"
        >
          Write new entry →
        </button>
      </div>

      {/* Book */}
      <div
        className="relative flex w-full max-w-full items-center justify-center gap-2 overflow-x-auto sm:gap-4"
        style={{ maxWidth: bookOuterMax }}
      >

        <HTMLFlipBook
           ref={bookRef}
           width={PAGE_WIDTH}
           height={PAGE_HEIGHT}
           size="fixed"
           drawShadow={true}
           maxShadowOpacity={0.62}
           flippingTime={FLIP_MS}
           className="shadow-2xl rounded-sm"
           showCover={false}
           mobileScrollSupport={true}
           disableFlipByClick={false}
           useMouseEvents={true}
           usePortrait={false}
           clickEventForward={true}
           renderOnlyPageLengthChange={true}
        >
          {/* Left — index of all past entries */}
          <Page>
            <div className="h-full p-6 sm:p-8 flex flex-col min-h-0">
              <div className="border-b border-amber-200 pb-3 mb-4 shrink-0">
                <p className="text-amber-900 text-xs font-medium uppercase tracking-widest">
                  Past entries
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  Tap a date to open it in the book
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3">
                {entries.length > 0 ? (
                  <ul className="flex flex-col gap-2 pr-1">
                    {entries.map((entry, i) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() => flipToEntry(i)}
                          className="w-full text-left rounded-lg border border-amber-300/50 bg-amber-100/40 hover:bg-amber-200/50 px-3 py-2.5 transition-colors"
                        >
                          <span className="text-amber-950 text-sm font-medium block">
                            {new Date(entry.created_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-amber-800/80 text-xs">
                            Entry {entries.length - i} — read in book
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-stone-500 text-sm leading-relaxed">
                    No saved entries yet. Write your first entry to see it here.
                  </p>
                )}

                {entries.length === 0 && (
                  <div className="mt-4 pt-4 border-t border-amber-200/80">
                    <p className="text-amber-900 text-xs font-medium uppercase tracking-widest mb-3">
                      {isStream ? "About this journal" : "Prompts"}
                    </p>
                    {isStream ? (
                      <p className="text-stone-600 text-sm italic leading-relaxed">
                        This is your space to write freely. No prompts, no
                        structure.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {journalPrompts.map((prompt, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-amber-400 text-xs mt-0.5">✦</span>
                            <p className="text-stone-600 text-sm leading-relaxed">
                              {prompt}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Page>

          {/* Right — today page */}
          <Page>
            <div className="h-full p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="border-b border-amber-200 pb-3 mb-6">
                  <p className="text-amber-900 text-xs font-medium uppercase tracking-widest">
                    Today
                  </p>
                  <p className="text-amber-950 text-base font-serif mt-1">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Ready to write? Head to the{" "}
                  <span className="text-amber-900 font-medium">writing panel</span>{" "}
                  to add a new entry to this journal.
                </p>
              </div>
              <div className="mt-auto space-y-3 opacity-70">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-px bg-amber-200 w-full" />
                ))}
              </div>
            </div>
          </Page>

          {/* Each saved entry — read only */}
          {entries.flatMap((entry) => [
            <Page key={`${entry.id}-a`}>
              <div className="h-full p-6 sm:p-8 flex flex-col min-h-0">
                <div className="border-b border-amber-200 pb-3 mb-4 shrink-0">
                  <p className="text-amber-900 text-xs font-medium uppercase tracking-widest">
                    Saved entry
                  </p>
                  <p className="text-amber-800 text-sm mt-1">
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 pr-1">
                  {Object.entries(entry.content || {}).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-amber-800 text-xs font-medium mb-1">{key}</p>
                      <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Page>,
            <Page key={`${entry.id}-b`}>
              <div className="h-full p-6 sm:p-8 flex flex-col text-stone-500">
                <p className="text-xs uppercase tracking-widest text-amber-800/70 mb-6">
                  End of spread
                </p>
                <p className="text-sm leading-relaxed italic flex-1">
                  Use the arrows or the index to keep reading your journal.
                </p>
                <div className="mt-auto space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-px bg-amber-200 w-full" />
                  ))}
                </div>
              </div>
            </Page>,
          ])}
        </HTMLFlipBook>

      </div>
      <div className="flex gap-6 mt-6">
  <button
    onClick={handleAnimatedPrev}
    className="px-5 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors text-sm"
  >
    ← Previous
  </button>
  <button
    onClick={() => bookRef.current?.pageFlip()?.flipNext("top")}
    className="px-5 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors text-sm"
  >
    Next →
  </button>
</div>
    </div>
  );
}