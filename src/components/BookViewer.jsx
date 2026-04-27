import {
  useState, useRef, useEffect, useLayoutEffect, forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../pages/journal.css";

const prompts = {
  today_tomorrow: ["What did I work on today?","What affected my productivity today?","What would I do differently?","What's my plan for tomorrow?","One thing I'm proud of today:"],
  self_eval: ["What patterns have I noticed in myself lately?","What's working well in my routine?","What's not working and why?","What would I tell a friend in my situation?","One thing I want to improve:"],
  goal: ["What is my current main goal?","What progress did I make today?","What obstacles am I facing?","What's my next concrete step?","How does this goal make me feel?"],
  stream: [],
};

const PAGE_WIDTH = 400;
const PAGE_HEIGHT = 560;
const FLIP_MS = 1000;
// how many lines fit per page (32px each, with 40px top padding = 520px usable / 32 = ~16 lines)
const LINES_PER_PAGE = 16;

const Page = forwardRef(({ children }, ref) => (
  <div ref={ref} style={{
    background: "linear-gradient(160deg, #ede8d8 0%, #f5f0e4 100%)",
    height: "100%", position: "relative", overflow: "hidden",
    backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
  }}>
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(160,140,100,0.2) 31px, rgba(160,140,100,0.2) 32px)",
      pointerEvents: "none", zIndex: 0,
    }} />
    <div style={{ position: "relative", zIndex: 1, height: "100%", overflow: "hidden" }}>
      {children}
    </div>
  </div>
));

function entrySpreadStartIndex(i) { return 2 + i * 2; }

// Split entry content into chunks that fit on a page
function paginateEntry(content) {
  const items = Object.entries(content || {});
  const pages = [];
  let current = [];
  let lineCount = 0;

  for (const [key, val] of items) {
    // label = 1 line, text = estimate lines based on char count
    const textLines = Math.max(1, Math.ceil(val.length / 55));
    const needed = 1 + textLines; // label + text

    if (lineCount + needed > LINES_PER_PAGE && current.length > 0) {
      pages.push(current);
      current = [];
      lineCount = 0;
    }
    current.push({ key, val });
    lineCount += needed;
  }
  if (current.length > 0) pages.push(current);
  return pages.length > 0 ? pages : [[]];
}

export default function BookViewer({ journal, onClose }) {
  const [entries, setEntries] = useState([]);
  const [entriesLoaded, setEntriesLoaded] = useState(false);
  const [disableFlipByClick, setDisableFlipByClick] = useState(true);
  const pendingPrevFlipRef = useRef(false);
  const bookRef = useRef();
  const navigate = useNavigate();

  useEffect(() => { loadEntries(); }, []);

  useLayoutEffect(() => {
    if (!disableFlipByClick && pendingPrevFlipRef.current) {
      pendingPrevFlipRef.current = false;
      queueMicrotask(() => { bookRef.current?.pageFlip()?.flipPrev("top"); });
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
    const { data } = await supabase.from("entries").select("*")
      .eq("user_id", user.id).eq("journal_type", journal.type)
      .order("created_at", { ascending: false });
    if (data) setEntries(data);
    setEntriesLoaded(true);
  }

  function flipToEntry(entryIndex) {
    bookRef.current?.pageFlip()?.flip(entrySpreadStartIndex(entryIndex), "top");
  }

  function handleAnimatedPrev() {
    const api = bookRef.current?.pageFlip();
    if (!api || api.getCurrentPageIndex() <= 0) return;
    pendingPrevFlipRef.current = true;
    setDisableFlipByClick(false);
  }

  const journalPrompts = prompts[journal.type];
  const isStream = journal.type === "stream";

  const labelStyle = { fontFamily: "Inter, sans-serif", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a09070", lineHeight: "32px" };
  const headStyle = { height: 32, display: "flex", justifyContent: "space-between", alignItems: "center" };

  // Build paginated pages for all entries
  const entryPages = entries.flatMap((entry, ei) => {
    const chunks = paginateEntry(entry.content);
    return chunks.map((chunk, ci) => ({ entry, chunkIndex: ci, totalChunks: chunks.length, chunk, entryIndex: ei }));
  });

  return (
    <div className="survey-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "linear-gradient(160deg, #ede8d8 0%, #f5f0e4 100%)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        position: "relative",
        maxWidth: PAGE_WIDTH * 2 + 48,
        width: "100%",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: 32, borderBottom: "0.5px solid rgba(160,140,100,0.35)" }}>
          <button onClick={onClose} style={{ fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#a09070", background: "none", border: "none", cursor: "pointer", padding: 0 }}>← Back</button>
          <span style={{ fontFamily: "Playfair Display, serif", fontSize: 13, color: "#1a1208" }}>{journal.name}</span>
          <button onClick={() => navigate("/app/writing")} style={{ fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#1a1208", background: "none", border: "none", borderBottom: "0.5px solid #1a1208", cursor: "pointer", padding: "0 0 2px" }}>Write new entry →</button>
        </div>

        {!entriesLoaded ? (
          <div style={{ width: PAGE_WIDTH * 2, height: PAGE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #ede8d8 0%, #f5f0e4 100%)' }}>
            <p style={{ fontFamily: 'Caveat, cursive', fontSize: 18, color: '#a09070' }}>Opening...</p>
          </div>
        ) : <HTMLFlipBook ref={bookRef} width={PAGE_WIDTH} height={PAGE_HEIGHT} size="fixed"
          drawShadow={true} maxShadowOpacity={0.3} flippingTime={FLIP_MS}
          showCover={false} mobileScrollSupport={true}
          disableFlipByClick={false} useMouseEvents={true}
          usePortrait={false} clickEventForward={true}
          style={{ boxShadow: "none" }}
        >
          {/* Left — index */}
          <Page>
            <div style={{ height: "100%", padding: "0 24px", display: "flex", flexDirection: "column" }}>
              <div style={headStyle}>
                <span style={labelStyle}>Past entries</span>
                <span style={{ ...labelStyle, fontSize: 7 }}>tap date to jump</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {entries.length > 0 ? entries.map((entry, i) => (
                  <button key={entry.id} onClick={() => flipToEntry(i)} style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid rgba(160,140,100,0.2)", background: "none", border: "none", borderBottom: "0.5px solid rgba(160,140,100,0.2)", cursor: "pointer", padding: "0 2px", width: "100%" }}>
                    <span style={{ fontFamily: "Caveat, cursive", fontSize: 16, color: "#3a3020" }}>
                      {new Date(entry.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 8, color: "#a09070", letterSpacing: "0.1em" }}>Entry {entries.length - i}</span>
                  </button>
                )) : (
                  <div>
                    <p style={{ fontFamily: "Caveat, cursive", fontSize: 16, color: "#a09070", lineHeight: "32px" }}>No entries yet.</p>
                    {!isStream && journalPrompts.map((prompt, i) => (
                      <div key={i} style={{ height: 32, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#c8b890", fontSize: 8 }}>✦</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#7a6a48" }}>{prompt}</span>
                      </div>
                    ))}
                    {isStream && <p style={{ fontFamily: "Caveat, cursive", fontSize: 15, color: "#a09070", fontStyle: "italic", lineHeight: "32px" }}>Free writing, no structure.</p>}
                  </div>
                )}
              </div>
            </div>
          </Page>

          {/* Right — today */}
          <Page>
            <div style={{ height: "100%", padding: "0 24px", display: "flex", flexDirection: "column" }}>
              <div style={headStyle}>
                <span style={labelStyle}>Today</span>
                <span style={{ fontFamily: "Playfair Display, serif", fontSize: 11, color: "#5a4a30", fontStyle: "italic", lineHeight: "32px" }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </div>
              <p style={{ fontFamily: "Caveat, cursive", fontSize: 17, color: "#7a6a48", lineHeight: "32px" }}>
                Ready to write? Head to the writing panel to add a new entry.
              </p>
            </div>
          </Page>

          {/* Paginated entry pages */}
          {entryPages.map(({ entry, chunkIndex, totalChunks, chunk }, pi) => (
            <Page key={`${entry.id}-${chunkIndex}`}>
              <div style={{ height: "100%", padding: "0 24px", display: "flex", flexDirection: "column" }}>
                <div style={headStyle}>
                  <span style={labelStyle}>
                    {chunkIndex === 0 ? "Saved entry" : `Continued (${chunkIndex + 1}/${totalChunks})`}
                  </span>
                  <span style={{ fontFamily: "Caveat, cursive", fontSize: 14, color: "#7a6a48", lineHeight: "32px" }}>
                    {new Date(entry.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {chunk.map(({ key, val }) => (
                    <div key={key}>
                      <div style={{ ...labelStyle, display: "block" }}>{key}</div>
                      <p style={{ fontFamily: "Caveat, cursive", fontSize: 17, color: "#2a1f0e", lineHeight: "32px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{val}</p>
                    </div>
                  ))}
                  {chunkIndex === totalChunks - 1 && pi < entryPages.length - 1 && (
                    <p style={{ fontFamily: "Caveat, cursive", fontSize: 14, color: "#c8b890", fontStyle: "italic", lineHeight: "32px", marginTop: "auto" }}>
                      → continued
                    </p>
                  )}
                </div>
              </div>
            </Page>
          ))}
        </HTMLFlipBook>}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, height: 32, borderTop: "0.5px solid rgba(160,140,100,0.35)", alignItems: "center" }}>
          <button onClick={handleAnimatedPrev} style={{ fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#a09070", background: "none", border: "none", cursor: "pointer", padding: 0 }}>← Previous</button>
          <button onClick={() => bookRef.current?.pageFlip()?.flipNext("top")} style={{ fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#a09070", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Next →</button>
        </div>
      </div>
    </div>
  );
}
