import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./landing.css";

const RULED_LINES = Array.from({ length: 23 });

export default function Landing() {
  const [phase, setPhase] = useState("closed");
  const [page, setPage] = useState("info");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const deskRef = useRef();
  const heroRef = useRef();
  const hintRef = useRef();
  const moverRef = useRef();
  const coverRef = useRef();
  const navigate = useNavigate();

  function openBook() {
    if (phase !== "closed") return;
    setPhase("animating");

    if (heroRef.current) {
      heroRef.current.style.opacity = "0";
      heroRef.current.style.transform = "translateY(-10px)";
    }
    if (hintRef.current) hintRef.current.style.opacity = "0";

    const m = moverRef.current;
    if (!m) return;
    m.style.display = "block";
    m.style.transition = "none";
    m.style.transform =
      "translate(-50%, -50%) perspective(1200px) rotateX(22deg) scale(0.72)";

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (coverRef.current)
          coverRef.current.style.transform = "rotateY(-180deg)";

        setTimeout(() => {
          const vw = window.innerWidth;
          const scaleNeeded = (vw / 420) * 1.1;
          m.style.transition = "transform 1.4s cubic-bezier(0.4,0,0.2,1)";
          m.style.transform = `translate(-50%,-50%) perspective(1200px) rotateX(0deg) scale(${scaleNeeded})`;
          if (deskRef.current) deskRef.current.style.opacity = "0";
        }, 750);

        setTimeout(() => {
          setPhase("open");
        }, 2000);
      }),
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setSaving(false);
        return;
      }
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setSaving(false);
        return;
      }
      const { data: journals } = await supabase
        .from("user_journals")
        .select("id")
        .eq("user_id", data.session.user.id)
        .limit(1);
      journals && journals.length > 0
        ? navigate("/app/dashboard")
        : navigate("/app/survey");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      const { data: journals } = await supabase
        .from("user_journals")
        .select("id")
        .eq("user_id", data.session.user.id)
        .limit(1);
      journals && journals.length > 0
        ? navigate("/app/dashboard")
        : navigate("/app/survey");
    }

    setSaving(false);
  }

  return (
    <div className="landing-root">
      <div ref={deskRef} className="landing-desk" />
      <div className="landing-lamp" />
      <div className="landing-vig" />

      <div ref={heroRef} className="landing-hero">
        <h1>
          Your thoughts,
          <br />
          <em>beautifully kept.</em>
        </h1>
        <p>A productivity journal</p>
      </div>

      {/* CLOSED BOOK — always rendered until animating */}
      <div
        className="book-closed"
        onClick={openBook}
        style={{ display: phase === "closed" ? "flex" : "none" }}
      >
        <div className="bc-bookmark" />
        <div className="bc-spine" />
        <div className="bc-cover">
          <div className="bc-lines">
            <div />
            <div />
          </div>
          <div>
            <div className="bc-title">
              My Journal
              <br />
              2026
            </div>
            <div className="bc-sub">Personal · Private</div>
          </div>
        </div>
      </div>

      <div ref={hintRef} className="landing-hint">
        Click the book to open
      </div>

      {/* BOOK MOVER — always in DOM, hidden until needed */}
      <div ref={moverRef} className="book-mover" style={{ display: "none" }}>
        <div className="book-inner">
          <div className="book-back" />
          <div className="bm-spine" />
          <div className="bm-bookmark" />
          <div ref={coverRef} className="cover-wrap">
            <div className="cover-front">
              <div className="bc-lines">
                <div />
                <div />
              </div>
              <div>
                <div className="bc-title">
                  My Journal
                  <br />
                  2026
                </div>
                <div className="bc-sub">Personal · Private</div>
              </div>
            </div>
            <div className="cover-back" />
          </div>
        </div>
      </div>

      {/* OPEN BOOK */}
      <div className={`open-book ${phase === "open" ? "visible" : ""}`}>
        {/* INFO PAGE */}
        <div className={`book-page ${page === "login" ? "slide-left" : ""}`}>
          <div className="ruled-bg">
            {RULED_LINES.map((_, i) => (
              <div key={i} className="ruled-line" />
            ))}
          </div>
          <div className="page-head">
            <span>My Journal</span>
            <span>2026</span>
          </div>
          <div className="info-content">
            <div className="info-tag">Your personal space</div>
            <div className="info-title">
              Journal your way
              <br />
              to <em>clarity &amp; focus.</em>
            </div>
            <div className="info-body">
              Four journaling methods in one beautiful space.
              <br />
              Built for people who think on paper.
            </div>
            <div className="info-feats">
              {[
                "Today & Tomorrow",
                "Self-Evaluation",
                "Goal Journal",
                "Stream of Consciousness",
              ].map((f) => (
                <div key={f} className="info-feat">
                  <div className="info-dot" />
                  <div className="info-fname">{f}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="auth-line">
            <div className="auth-bar" />
            <button className="auth-link" onClick={() => setPage("login")}>
              Sign in · Create account
            </button>
            <div className="auth-bar" />
          </div>
          <div className="pg-num">i</div>
        </div>

        {/* LOGIN PAGE */}
        <div className={`book-page ${page === "info" ? "slide-right" : ""}`}>
          <div className="ruled-bg">
            {RULED_LINES.map((_, i) => (
              <div key={i} className="ruled-line" />
            ))}
          </div>
          <div className="page-head">
            <span>Welcome</span>
            <span>Begin here</span>
          </div>
          <div className="login-content">
            <div className="login-title">
              {isSignUp ? "Create account" : "Open your journal"}
            </div>
            <form
              onSubmit={handleSubmit}
              style={{
                width: "100%",
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div className="f-label">Email</div>
              <input
                className="f-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="f-label">Password</div>
              <input
                className="f-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <p
                  style={{
                    color: "#a84444",
                    fontSize: 11,
                    alignSelf: "flex-start",
                    marginTop: 4,
                  }}
                >
                  {error}
                </p>
              )}
              <div className="f-sp" />
              <button type="submit" className="f-btn" disabled={saving}>
                {saving
                  ? "Please wait..."
                  : isSignUp
                    ? "Create account →"
                    : "Sign in →"}
              </button>
            </form>
            <div className="f-or">
              <div className="f-line" />
              <div className="f-ort">or</div>
              <div className="f-line" />
            </div>
            <button
              className="f-btn out"
              style={{ width: "100%", maxWidth: 400 }}
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
            >
              {isSignUp ? "Sign in instead" : "Create account"}
            </button>
            <div className="f-tog">
              New here?{" "}
              <span onClick={() => navigate("/app/survey")}>
                Take the survey first
              </span>
            </div>
          </div>
          <button className="back-btn" onClick={() => setPage("info")}>
            ← Back
          </button>
          <div className="pg-num">ii</div>
        </div>
      </div>
    </div>
  );
}
