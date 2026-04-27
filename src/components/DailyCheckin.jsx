import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../pages/journal.css";

const activityTags = [
  { id: "study", label: "Study" },
  { id: "work", label: "Work" },
  { id: "exercise", label: "Exercise" },
  { id: "social", label: "Social" },
  { id: "rest", label: "Rest" },
  { id: "creative", label: "Creative" },
  { id: "other", label: "Other" },
];

function getSentimentLabel(score) {
  const labels = {
    1: "Awful",
    2: "Terrible",
    3: "Bad",
    4: "Meh",
    5: "Neutral",
    6: "Okay",
    7: "Good",
    8: "Great",
    9: "Excellent",
    10: "Amazing",
  };
  return labels[score] || "";
}

export default function DailyCheckin({ onClose }) {
  const [step, setStep] = useState("mood"); // mood | activity | done
  const [moodScore, setMoodScore] = useState(null);
  const [activityTag, setActivityTag] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!moodScore || !activityTag) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("daily_checkins").upsert(
      {
        user_id: user.id,
        mood_score: moodScore,
        activity_tag: activityTag,
        date: new Date().toISOString().split("T")[0],
      },
      { onConflict: "user_id,date" },
    );
    setSaving(false);
    setStep("done");
    setTimeout(onClose, 1200);
  }

  return (
    <div className="survey-backdrop">
      <div className="survey-card" style={{ maxWidth: 520 }}>
        {step === "done" ? (
          <div
            style={{
              position: "relative",
              zIndex: 1,
              height: 96,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: 20,
                color: "#1a1208",
                lineHeight: "32px",
              }}
            >
              Check-in saved ✓
            </p>
            <p
              style={{
                fontFamily: "Caveat, cursive",
                fontSize: 16,
                color: "#a09070",
              }}
            >
              Have a great day.
            </p>
          </div>
        ) : step === "mood" ? (
          <>
            <div
              style={{
                position: "relative",
                zIndex: 1,
                height: 64,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#a09070",
                }}
              >
                Daily check-in ·{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: 22,
                  color: "#1a1208",
                  lineHeight: "32px",
                }}
              >
                How are you feeling today?
              </p>
            </div>

            {/* Mood dots */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                height: 64,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setMoodScore(n)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border:
                      moodScore && n <= moodScore
                        ? "none"
                        : "0.5px solid rgba(160,140,100,0.4)",
                    background:
                      moodScore && n <= moodScore
                        ? n <= 3
                          ? "#a09070"
                          : n <= 6
                            ? "#8b7a58"
                            : "#5a4a30"
                        : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    padding: 0,
                    flexShrink: 0,
                  }}
                />
              ))}
              {moodScore && (
                <span
                  style={{
                    fontFamily: "Caveat, cursive",
                    fontSize: 18,
                    color: "#7a6a48",
                    marginLeft: 4,
                  }}
                >
                  {moodScore}/10 {getSentimentLabel(moodScore)}
                </span>
              )}
            </div>

            <button
              className="survey-confirm-btn"
              onClick={() => moodScore && setStep("activity")}
              style={{
                opacity: moodScore ? 1 : 0.4,
                cursor: moodScore ? "pointer" : "default",
              }}
            >
              Next →
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                position: "relative",
                zIndex: 1,
                height: 64,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#a09070",
                }}
              >
                Daily check-in · mood: {moodScore}/10
              </p>
              <p
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: 22,
                  color: "#1a1208",
                  lineHeight: "32px",
                }}
              >
                What consumed your day?
              </p>
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                paddingBottom: 16,
              }}
            >
              {activityTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setActivityTag(tag.id)}
                  style={{
                    padding: "0 16px",
                    height: 32,
                    fontFamily: "Caveat, cursive",
                    fontSize: 17,
                    color: activityTag === tag.id ? "#f5f0e4" : "#3a3020",
                    background:
                      activityTag === tag.id ? "#3a3020" : "transparent",
                    border:
                      activityTag === tag.id
                        ? "none"
                        : "0.5px solid rgba(160,140,100,0.4)",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <button
              className="survey-confirm-btn"
              onClick={handleSave}
              disabled={!activityTag || saving}
              style={{
                opacity: activityTag ? 1 : 0.4,
                cursor: activityTag ? "pointer" : "default",
              }}
            >
              {saving ? "Saving..." : "Save check-in →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
