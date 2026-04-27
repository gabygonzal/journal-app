import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import DailyCheckin from "../components/DailyCheckin";
import "./journal.css";

const journalColors = {
  today_tomorrow: "#8b6a30",
  self_eval: "#5a7a50",
  goal: "#6a5a7a",
  stream: "#7a5a5a",
};

const journalNames = {
  today_tomorrow: "Today & Tomorrow",
  self_eval: "Self-Evaluation",
  goal: "Goal Journal",
  stream: "Stream of Consciousness",
};

const activityColors = {
  study: "#6a5a7a",
  work: "#8b6a30",
  exercise: "#5a7a50",
  social: "#7a6a58",
  rest: "#7a8a6a",
  creative: "#6a7a8a",
  other: "#a09070",
};

function calculateStreak(entries) {
  if (!entries.length) return 0;
  let streak = 0;
  const dates = [...new Set(entries.map((e) => e.created_at.split("T")[0]))]
    .sort()
    .reverse();
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    if (dates[i] === expected.toISOString().split("T")[0]) streak++;
    else break;
  }
  return streak;
}

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

const TABS = ["Overview", "Mood Trends", "Activity Analysis"];

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckin, setShowCheckin] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: entriesData }, { data: checkinsData }] = await Promise.all([
      supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

    if (entriesData) setEntries(entriesData);
    if (checkinsData) {
      setCheckins(checkinsData);
      // show checkin if not done today
      const today = new Date().toISOString().split("T")[0];
      const checkedInToday = checkinsData.some((c) => c.date === today);
      if (!checkedInToday) setShowCheckin(true);
    } else {
      setShowCheckin(true);
    }

    setLoading(false);
  }

  function handleCheckinClose() {
    setShowCheckin(false);
    loadData();
  }

  const totalEntries = entries.length;
  const streak = calculateStreak([...entries].reverse());
  const avgMood = checkins.length
    ? (
        checkins.reduce((s, c) => s + c.mood_score, 0) / checkins.length
      ).toFixed(1)
    : null;

  // Mood trend — last 14 days from checkins
  const moodTrend = [...Array(14)]
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split("T")[0];
      const checkin = checkins.find((c) => c.date === dateStr);
      return {
        name: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        mood: checkin ? checkin.mood_score : null,
      };
    })
    .filter((d) => d.mood !== null);

  // Activity vs avg mood correlation
  const activityMood = {};
  checkins
    .filter((c) => c.activity_tag && c.mood_score)
    .forEach((c) => {
      if (!activityMood[c.activity_tag]) activityMood[c.activity_tag] = [];
      activityMood[c.activity_tag].push(c.mood_score);
    });
  const correlationData = Object.entries(activityMood)
    .map(([tag, scores]) => ({
      activity: tag.charAt(0).toUpperCase() + tag.slice(1),
      avgMood: parseFloat(
        (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      ),
      count: scores.length,
      color: activityColors[tag] || "#a09070",
    }))
    .sort((a, b) => b.avgMood - a.avgMood);

  // Activity distribution
  const activityDist = {};
  checkins
    .filter((c) => c.activity_tag)
    .forEach((c) => {
      activityDist[c.activity_tag] = (activityDist[c.activity_tag] || 0) + 1;
    });
  const activityDistData = Object.entries(activityDist).map(([tag, count]) => ({
    name: tag.charAt(0).toUpperCase() + tag.slice(1),
    count,
    color: activityColors[tag] || "#a09070",
  }));

  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      name: d.toLocaleDateString("en-US", { weekday: "short" }),
      entries: entries.filter((e) =>
        e.created_at.startsWith(d.toISOString().split("T")[0]),
      ).length,
    };
  });

  const countsByType = Object.keys(journalNames).map((type) => ({
    name: journalNames[type].split(" ")[0],
    entries: entries.filter((e) => e.journal_type === type).length,
    color: journalColors[type],
  }));

  const tooltipStyle = {
    contentStyle: {
      background: "#f5f0e4",
      border: "0.5px solid rgba(160,140,100,0.4)",
      borderRadius: 2,
      fontFamily: "Inter",
      fontSize: 11,
    },
    labelStyle: {
      color: "#3a3020",
      fontFamily: "Inter",
      fontSize: 9,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    },
    itemStyle: { color: "#7a6a48" },
    cursor: { fill: "rgba(160,140,100,0.06)" },
  };

  if (loading)
    return (
      <div className="journal-page">
        <div
          className="journal-content"
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <p style={{ fontFamily: "Caveat", fontSize: 22, color: "#a09070" }}>
            Opening your journal...
          </p>
        </div>
      </div>
    );

  return (
    <div className="journal-page">
      {showCheckin && <DailyCheckin onClose={handleCheckinClose} />}

      <div className="journal-content">
        <div className="journal-page-header">
          <h1 className="journal-page-title">Dashboard</h1>
          <span className="journal-page-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            height: 32,
            alignItems: "center",
            flexShrink: 0,
            borderBottom: "0.5px solid rgba(160,140,100,0.2)",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                height: 32,
                padding: "0 20px",
                fontFamily: "Inter, sans-serif",
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: activeTab === tab ? "#1a1208" : "#a09070",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === tab
                    ? "1px solid #1a1208"
                    : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "Overview" && (
          <>
            <div className="journal-section-label">At a glance</div>
            <div className="journal-stats-grid" style={{ height: 128 }}>
              <div className="journal-stat">
                <div className="journal-stat-label">Total entries</div>
                <div className="journal-stat-value">{totalEntries}</div>
              </div>
              <div className="journal-stat">
                <div className="journal-stat-label">Day streak</div>
                <div className="journal-stat-value">{streak}</div>
                <div className="journal-stat-sub">days in a row</div>
              </div>
              <div className="journal-stat">
                <div className="journal-stat-label">Avg mood</div>
                <div
                  className="journal-stat-value"
                  style={{ fontSize: avgMood ? 52 : 32, lineHeight: "64px" }}
                >
                  {avgMood || "—"}
                </div>
                {avgMood && (
                  <div className="journal-stat-sub">
                    {getSentimentLabel(parseFloat(avgMood))}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 48,
                flexShrink: 0,
              }}
            >
              <div className="journal-chart-label">Entries this week</div>
              <div className="journal-chart-label">Entries by journal</div>
            </div>

            <div className="journal-charts-row">
              <div className="journal-chart-card">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7} barSize={14}>
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontFamily: "Inter",
                        fontSize: 9,
                        fill: "#a09070",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar
                      dataKey="entries"
                      fill="#8b6a30"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="journal-chart-card">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countsByType} barSize={14}>
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontFamily: "Inter",
                        fontSize: 9,
                        fill: "#a09070",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="entries" radius={[2, 2, 0, 0]}>
                      {countsByType.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {totalEntries === 0 && (
              <div className="journal-empty">
                <p className="journal-empty-text">
                  No entries yet — your story begins here.
                </p>
                <button
                  className="journal-empty-btn"
                  onClick={() => navigate("/app/writing")}
                >
                  Write your first entry
                </button>
              </div>
            )}
          </>
        )}

        {/* ── MOOD TRENDS ── */}
        {activeTab === "Mood Trends" && (
          <>
            <div className="journal-section-label">
              Mood over the last 14 days
            </div>
            {moodTrend.length > 0 ? (
              <>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="55%">
                    <LineChart data={moodTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(160,140,100,0.15)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontFamily: "Inter",
                          fontSize: 9,
                          fill: "#a09070",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 10]}
                        ticks={[0, 2, 4, 6, 8, 10]}
                        tick={{
                          fontFamily: "Inter",
                          fontSize: 9,
                          fill: "#a09070",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(v) => [
                          `${v}/10 — ${getSentimentLabel(v)}`,
                          "Mood",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#5a4a30"
                        strokeWidth={1.5}
                        dot={{ fill: "#5a4a30", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="journal-section-label">Recent check-ins</div>
                {[...checkins]
                  .reverse()
                  .slice(0, 5)
                  .map((c) => (
                    <div key={c.id} className="journal-entry-row">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "Caveat, cursive",
                            fontSize: 18,
                            color: "#3a3020",
                            width: 40,
                          }}
                        >
                          {c.mood_score}/10
                        </span>
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: 8,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#a09070",
                          }}
                        >
                          {getSentimentLabel(c.mood_score)}
                        </span>
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: 8,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#c8b890",
                            padding: "1px 6px",
                            border: "0.5px solid rgba(160,140,100,0.3)",
                            borderRadius: 2,
                          }}
                        >
                          {c.activity_tag}
                        </span>
                      </div>
                      <span className="journal-entry-date">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
              </>
            ) : (
              <div className="journal-empty">
                <p className="journal-empty-text">No mood data yet.</p>
                <p
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    color: "#c8b890",
                    letterSpacing: "0.1em",
                  }}
                >
                  Complete your daily check-in to see trends here.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── ACTIVITY ANALYSIS ── */}
        {activeTab === "Activity Analysis" && (
          <>
            {correlationData.length > 0 ? (
              <>
                <div className="journal-section-label">
                  Average mood by activity
                </div>
                <div style={{ height: 160, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={correlationData} barSize={28}>
                      <XAxis
                        dataKey="activity"
                        tick={{
                          fontFamily: "Inter",
                          fontSize: 9,
                          fill: "#a09070",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 10]}
                        ticks={[0, 5, 10]}
                        tick={{
                          fontFamily: "Inter",
                          fontSize: 9,
                          fill: "#a09070",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(v, n, p) => [
                          `${v}/10 (${p.payload.count} days)`,
                          "Avg mood",
                        ]}
                      />
                      <Bar dataKey="avgMood" radius={[2, 2, 0, 0]}>
                        {correlationData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="journal-section-label">
                  Activity distribution
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="55%">
                    <BarChart
                      data={activityDistData}
                      layout="vertical"
                      barSize={16}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{
                          fontFamily: "Inter",
                          fontSize: 9,
                          fill: "#a09070",
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="count" radius={[0, 2, 2, 0]}>
                        {activityDistData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {correlationData.length >= 2 && (
                  <div
                    style={{
                      flexShrink: 0,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 8,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#a09070",
                      }}
                    >
                      Insight
                    </span>
                    <span
                      style={{
                        fontFamily: "Caveat, cursive",
                        fontSize: 16,
                        color: "#3a3020",
                      }}
                    >
                      {correlationData[0].activity} correlates with your highest
                      mood ({correlationData[0].avgMood}/10)
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="journal-empty">
                <p className="journal-empty-text">No activity data yet.</p>
                <p
                  style={{
                    fontFamily: "Inter",
                    fontSize: 10,
                    color: "#c8b890",
                    letterSpacing: "0.1em",
                  }}
                >
                  Complete your daily check-in to see correlations here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
