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
import "../pages/journal.css";

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

const PAGE_WIDTH = 400;
const PAGE_HEIGHT = 560;
const FLIP_MS = 1000;

const Page = forwardRef(({ children }, ref) => (
  <div
    ref={ref}
    style={{
      background: "linear-gradient(160deg, #ede8d8 0%, #f5f0e4 100%)",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "repeating-linear-gradient(transparent, transparent 31px, rgba(160,140,100,0.2) 31px, rgba(160,140,100,0.2) 32px)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
    <div
      style={{
        position: "relative",
        zIndex: 1,
        height: "100%",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
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

  const labelStyle = {
    fontFamily: "Inter, sans-serif",
    fontSize: 8,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#a09070",
    lineHeight: "32px",
  };

  const headStyle = {
    height: 32,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  return (
    <div
      className="survey-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "linear-gradient(160deg, #ede8d8 0%, #f5f0e4 100%)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
          position: "relative",
          maxWidth: PAGE_WIDTH * 2 + 48,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            height: 32,
            borderBottom: "0.5px solid rgba(160,140,100,0.35)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 9,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#a09070",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            ← Back
          </button>
          <span
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 13,
              color: "#1a1208",
            }}
          >
            {journal.name}
          </span>
          <button
            onClick={() => navigate("/app/writing")}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 9,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#1a1208",
              background: "none",
              border: "none",
              borderBottom: "0.5px solid #1a1208",
              cursor: "pointer",
              padding: "0 0 2px",
            }}
          >
            Write new entry →
          </button>
        </div>

        {/* Book */}
        <HTMLFlipBook
          ref={bookRef}
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          size="fixed"
          drawShadow={true}
          maxShadowOpacity={0.3}
          flippingTime={FLIP_MS}
          showCover={false}
          mobileScrollSupport={true}
          disableFlipByClick={false}
          useMouseEvents={true}
          usePortrait={false}
          clickEventForward={true}
          renderOnlyPageLengthChange={true}
          style={{ boxShadow: "none" }}
        >
          {/* Left — index */}
          <Page>
            <div
              style={{
                height: "100%",
                padding: "0 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={headStyle}>
                <span style={labelStyle}>Past entries</span>
                <span style={{ ...labelStyle, fontSize: 7 }}>
                  tap date to jump
                </span>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {entries.length > 0 ? (
                  entries.map((entry, i) => (
                    <button
                      key={entry.id}
                      onClick={() => flipToEntry(i)}
                      style={{
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "0.5px solid rgba(160,140,100,0.2)",
                        background: "none",
                        border: "none",
                        borderBottom: "0.5px solid rgba(160,140,100,0.2)",
                        cursor: "pointer",
                        padding: "0 2px",
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Caveat, cursive",
                          fontSize: 16,
                          color: "#3a3020",
                        }}
                      >
                        {new Date(entry.created_at).toLocaleDateString(
                          "en-US",
                          { weekday: "short", month: "short", day: "numeric" },
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 8,
                          color: "#a09070",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Entry {entries.length - i}
                      </span>
                    </button>
                  ))
                ) : (
                  <div>
                    <p
                      style={{
                        fontFamily: "Caveat, cursive",
                        fontSize: 16,
                        color: "#a09070",
                        lineHeight: "32px",
                      }}
                    >
                      No entries yet.
                    </p>
                    {!isStream &&
                      journalPrompts.map((prompt, i) => (
                        <div
                          key={i}
                          style={{
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span style={{ color: "#c8b890", fontSize: 8 }}>
                            ✦
                          </span>
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: 10,
                              color: "#7a6a48",
                            }}
                          >
                            {prompt}
                          </span>
                        </div>
                      ))}
                    {isStream && (
                      <p
                        style={{
                          fontFamily: "Caveat, cursive",
                          fontSize: 15,
                          color: "#a09070",
                          fontStyle: "italic",
                          lineHeight: "32px",
                        }}
                      >
                        Free writing, no structure.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Page>

          {/* Right — today */}
          <Page>
            <div
              style={{
                height: "100%",
                padding: "0 24px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={headStyle}>
                <span style={labelStyle}>Today</span>
                <span
                  style={{
                    fontFamily: "Playfair Display, serif",
                    fontSize: 11,
                    color: "#5a4a30",
                    fontStyle: "italic",
                    lineHeight: "32px",
                  }}
                >
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "Caveat, cursive",
                  fontSize: 17,
                  color: "#7a6a48",
                  lineHeight: "32px",
                }}
              >
                Ready to write? Head to the writing panel to add a new entry.
              </p>
            </div>
          </Page>

          {/* Past entries */}
          {entries.flatMap((entry) => [
            <Page key={`${entry.id}-a`}>
              <div
                style={{
                  height: "100%",
                  padding: "0 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={headStyle}>
                  <span style={labelStyle}>Saved entry</span>
                  <span
                    style={{
                      fontFamily: "Caveat, cursive",
                      fontSize: 14,
                      color: "#7a6a48",
                      lineHeight: "32px",
                    }}
                  >
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {Object.entries(entry.content || {}).map(([key, val]) => (
                    <div key={key}>
                      <div style={{ ...labelStyle, display: "block" }}>
                        {key}
                      </div>
                      <p
                        style={{
                          fontFamily: "Caveat, cursive",
                          fontSize: 17,
                          color: "#2a1f0e",
                          lineHeight: "32px",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Page>,
            <Page key={`${entry.id}-b`}>
              <div
                style={{
                  height: "100%",
                  padding: "0 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <p
                  style={{
                    fontFamily: "Caveat, cursive",
                    fontSize: 15,
                    color: "#a09070",
                    fontStyle: "italic",
                    lineHeight: "32px",
                  }}
                >
                  Drag the corner or use arrows to keep reading.
                </p>
              </div>
            </Page>,
          ])}
        </HTMLFlipBook>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            height: 32,
            borderTop: "0.5px solid rgba(160,140,100,0.35)",
            alignItems: "center",
          }}
        >
          <button
            onClick={handleAnimatedPrev}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 9,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#a09070",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            ← Previous
          </button>
          <button
            onClick={() => bookRef.current?.pageFlip()?.flipNext("top")}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 9,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#a09070",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
