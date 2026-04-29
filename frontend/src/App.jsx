import { useState } from "react";

const API = "http://127.0.0.1:8000/api";

const RISK_COLORS = {
  HIGH: "#ff4444",
  MEDIUM: "#ffaa00",
  LOW: "#00cc66",
};

export default function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("rag");

  async function analyze() {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: "Server se connect nahi ho paya!" });
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050d1a",
      color: "#c0d8f0",
      fontFamily: "monospace",
      padding: "24px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>⚛️</div>
        <h1 style={{
          fontSize: 28, fontWeight: 900,
          background: "linear-gradient(90deg, #00d4ff, #a855f7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: 0,
        }}>NuclearMind AI</h1>
        <p style={{ color: "#3a6080", fontSize: 12, letterSpacing: 2 }}>
          NUCLEAR & RENEWABLE ENERGY INTELLIGENCE PLATFORM
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {["rag", "analyze"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            background: mode === m ? "#00d4ff22" : "none",
            border: `1px solid ${mode === m ? "#00d4ff" : "#1a3055"}`,
            color: mode === m ? "#00d4ff" : "#3a6080",
            borderRadius: 6, padding: "6px 18px",
            fontSize: 11, letterSpacing: 2,
            cursor: "pointer", textTransform: "uppercase",
          }}>
            {m === "rag" ? "📄 IAEA Documents" : "🧠 AI Analysis"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto 24px" }}>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter your nuclear or renewable energy question..."
          rows={3}
          style={{
            width: "100%", background: "#0a1428",
            border: "1px solid #1a3055", borderRadius: 8,
            padding: 14, color: "#00ff88", fontSize: 13,
            fontFamily: "monospace", resize: "none",
            outline: "none", boxSizing: "border-box",
          }}
        />
        <button
          onClick={analyze}
          disabled={loading}
          style={{
            width: "100%", marginTop: 8,
            background: loading ? "#0a1428" : "linear-gradient(135deg, #003322, #006644)",
            border: `1px solid ${loading ? "#1a3055" : "#00aa55"}`,
            color: loading ? "#3a5070" : "#00ff88",
            borderRadius: 8, padding: "12px",
            fontSize: 13, letterSpacing: 2,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "⟳ ANALYZING..." : "▶ ANALYZE"}
        </button>
      </div>

      {result && (
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          {result.error ? (
            <div style={{ color: "#ff4444", padding: 16, border: "1px solid #ff444433", borderRadius: 8 }}>
              ❌ {result.error}
            </div>
          ) : (
            <div style={{ background: "#0a1428", border: "1px solid #1a3055", borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18, color: "#e0eaff" }}>{result.title}</h2>
                <span style={{
                  background: RISK_COLORS[result.risk_level] + "22",
                  border: `1px solid ${RISK_COLORS[result.risk_level]}`,
                  color: RISK_COLORS[result.risk_level],
                  borderRadius: 4, padding: "2px 10px", fontSize: 11,
                  letterSpacing: 2, whiteSpace: "nowrap", marginLeft: 8,
                }}>
                  {result.risk_level}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "#3a6080", letterSpacing: 2, marginBottom: 12 }}>
                ◆ {result.category}
              </div>
              <div style={{ fontSize: 13, color: "#8899bb", lineHeight: 1.7, marginBottom: 16 }}>
                {result.summary}
              </div>
              {result.key_findings && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#00d4ff", letterSpacing: 2, marginBottom: 8 }}>
                    KEY FINDINGS
                  </div>
                  {result.key_findings.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "#00d4ff" }}>→</span>
                      <span style={{ fontSize: 12, color: "#7799bb", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
              {result.recommendation && (
                <div style={{
                  background: "#00ff8811", border: "1px solid #00ff8833",
                  borderRadius: 8, padding: 12, marginBottom: 16,
                }}>
                  <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 2, marginBottom: 6 }}>
                    ▶ RECOMMENDATION
                  </div>
                  <div style={{ fontSize: 12, color: "#b0c4de", lineHeight: 1.6 }}>
                    {result.recommendation}
                  </div>
                </div>
              )}
              {result.sources && result.sources.length > 0 && (
                <div style={{ fontSize: 10, color: "#3a5070" }}>
                  📄 Sources: {result.sources.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}