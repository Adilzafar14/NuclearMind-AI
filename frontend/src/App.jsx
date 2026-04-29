import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts";

const API = "http://127.0.0.1:8000/api";

const RISK_COLORS = { HIGH: "#ff4444", MEDIUM: "#ffaa00", LOW: "#00cc66" };
const CAT_COLORS = ["#00d4ff", "#a855f7", "#ff6b35", "#22c55e"];

export default function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("rag");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("search");

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
      setHistory(prev => [...prev, {
        query, result: data,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (e) {
      setResult({ error: "Server se connect nahi ho paya!" });
    }
    setLoading(false);
  }

  // Dashboard stats
  const riskData = ["HIGH", "MEDIUM", "LOW"].map(r => ({
    name: r,
    value: history.filter(h => h.result?.risk_level === r).length
  })).filter(d => d.value > 0);

  const catData = [...new Set(history.map(h => h.result?.category).filter(Boolean))]
    .map(cat => ({
      name: cat,
      queries: history.filter(h => h.result?.category === cat).length
    }));

  return (
    <div style={{
      minHeight: "100vh", background: "#050d1a",
      color: "#c0d8f0", fontFamily: "monospace",
    }}>
      {/* Header */}
      <div style={{
        background: "#0a1428", borderBottom: "1px solid #1a2a44",
        padding: "16px 24px", display: "flex",
        justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>⚛️</span>
          <div>
            <div style={{
              fontSize: 20, fontWeight: 900,
              background: "linear-gradient(90deg, #00d4ff, #a855f7)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>NuclearMind AI</div>
            <div style={{ fontSize: 9, color: "#3a6080", letterSpacing: 2 }}>
              NUCLEAR & RENEWABLE ENERGY INTELLIGENCE
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["search", "dashboard"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? "#00d4ff22" : "none",
              border: `1px solid ${activeTab === tab ? "#00d4ff" : "#1a3055"}`,
              color: activeTab === tab ? "#00d4ff" : "#3a6080",
              borderRadius: 6, padding: "6px 16px",
              fontSize: 11, letterSpacing: 1, cursor: "pointer",
              textTransform: "uppercase"
            }}>
              {tab === "search" ? "🔍 Search" : "📊 Dashboard"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: "flex", gap: 16, padding: "12px 24px",
        background: "#070e1c", borderBottom: "1px solid #1a2a44",
        flexWrap: "wrap"
      }}>
        {[
          { label: "TOTAL QUERIES", val: history.length, color: "#00d4ff" },
          { label: "HIGH RISK", val: history.filter(h => h.result?.risk_level === "HIGH").length, color: "#ff4444" },
          { label: "MEDIUM RISK", val: history.filter(h => h.result?.risk_level === "MEDIUM").length, color: "#ffaa00" },
          { label: "LOW RISK", val: history.filter(h => h.result?.risk_level === "LOW").length, color: "#00cc66" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#0a1428", border: `1px solid ${s.color}33`,
            borderRadius: 8, padding: "8px 16px", minWidth: 100
          }}>
            <div style={{ fontSize: 9, color: "#3a5070", letterSpacing: 2 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: 24 }}>

        {/* SEARCH TAB */}
        {activeTab === "search" && (
          <div style={{ maxWidth: 750, margin: "0 auto" }}>
            {/* Mode Toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {["rag", "analyze"].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  background: mode === m ? "#00d4ff22" : "none",
                  border: `1px solid ${mode === m ? "#00d4ff" : "#1a3055"}`,
                  color: mode === m ? "#00d4ff" : "#3a6080",
                  borderRadius: 6, padding: "6px 18px",
                  fontSize: 11, letterSpacing: 2, cursor: "pointer",
                }}>
                  {m === "rag" ? "📄 IAEA Documents" : "🧠 AI Analysis"}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter nuclear or renewable energy question..."
              rows={3}
              style={{
                width: "100%", background: "#0a1428",
                border: "1px solid #1a3055", borderRadius: 8,
                padding: 14, color: "#00ff88", fontSize: 13,
                fontFamily: "monospace", resize: "none",
                outline: "none", boxSizing: "border-box",
              }}
            />
            <button onClick={analyze} disabled={loading} style={{
              width: "100%", marginTop: 8,
              background: loading ? "#0a1428" : "linear-gradient(135deg, #003322, #006644)",
              border: `1px solid ${loading ? "#1a3055" : "#00aa55"}`,
              color: loading ? "#3a5070" : "#00ff88",
              borderRadius: 8, padding: "12px",
              fontSize: 13, letterSpacing: 2,
              cursor: loading ? "not-allowed" : "pointer", fontWeight: 700,
            }}>
              {loading ? "⟳ ANALYZING..." : "▶ ANALYZE"}
            </button>

            {/* Result */}
            {result && !result.error && (
              <div style={{
                marginTop: 20, background: "#0a1428",
                border: "1px solid #1a2a44", borderRadius: 12, padding: 24
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 18, color: "#e0eaff" }}>{result.title}</h2>
                  <span style={{
                    background: RISK_COLORS[result.risk_level] + "22",
                    border: `1px solid ${RISK_COLORS[result.risk_level]}`,
                    color: RISK_COLORS[result.risk_level],
                    borderRadius: 4, padding: "2px 10px",
                    fontSize: 11, letterSpacing: 2,
                  }}>{result.risk_level}</span>
                </div>
                <div style={{ fontSize: 10, color: "#3a6080", letterSpacing: 2, marginBottom: 12 }}>
                  ◆ {result.category}
                </div>
                <div style={{ fontSize: 13, color: "#8899bb", lineHeight: 1.7, marginBottom: 16 }}>
                  {result.summary}
                </div>
                {result.key_findings && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: "#00d4ff", letterSpacing: 2, marginBottom: 8 }}>KEY FINDINGS</div>
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
                    borderRadius: 8, padding: 12,
                  }}>
                    <div style={{ fontSize: 10, color: "#00ff88", letterSpacing: 2, marginBottom: 6 }}>▶ RECOMMENDATION</div>
                    <div style={{ fontSize: 12, color: "#b0c4de", lineHeight: 1.6 }}>{result.recommendation}</div>
                  </div>
                )}
                {result.sources?.length > 0 && (
                  <div style={{ fontSize: 10, color: "#3a5070", marginTop: 12 }}>
                    📄 Sources: {result.sources.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#2a4060" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
                <div>Pehle kuch queries karo — dashboard populate hoga!</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>

                {/* Risk Pie Chart */}
                <div style={{ background: "#0a1428", border: "1px solid #1a2a44", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, color: "#3a6080", letterSpacing: 2, marginBottom: 16 }}>RISK LEVEL DISTRIBUTION</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={riskData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {riskData.map((entry, i) => (
                          <Cell key={i} fill={RISK_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0a1428", border: "1px solid #1a3055", color: "#c0d8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Bar Chart */}
                <div style={{ background: "#0a1428", border: "1px solid #1a2a44", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, color: "#3a6080", letterSpacing: 2, marginBottom: 16 }}>QUERIES BY CATEGORY</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={catData}>
                      <XAxis dataKey="name" tick={{ fill: "#5577aa", fontSize: 10 }} />
                      <YAxis tick={{ fill: "#5577aa", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "#0a1428", border: "1px solid #1a3055", color: "#c0d8f0" }} />
                      <Bar dataKey="queries" radius={[4, 4, 0, 0]}>
                        {catData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Query History */}
                <div style={{ background: "#0a1428", border: "1px solid #1a2a44", borderRadius: 12, padding: 20, gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 11, color: "#3a6080", letterSpacing: 2, marginBottom: 16 }}>QUERY HISTORY</div>
                  {history.map((h, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "10px 0", borderBottom: "1px solid #1a2a44",
                      alignItems: "center", flexWrap: "wrap", gap: 8
                    }}>
                      <div style={{ fontSize: 12, color: "#7799bb", flex: 1 }}>{h.query}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "#3a5070" }}>{h.timestamp}</span>
                        <span style={{
                          background: RISK_COLORS[h.result?.risk_level] + "22",
                          border: `1px solid ${RISK_COLORS[h.result?.risk_level]}`,
                          color: RISK_COLORS[h.result?.risk_level],
                          borderRadius: 4, padding: "2px 8px", fontSize: 10,
                        }}>{h.result?.risk_level}</span>
                        <span style={{
                          background: "#00d4ff11", border: "1px solid #00d4ff33",
                          color: "#00d4ff", borderRadius: 4, padding: "2px 8px", fontSize: 10,
                        }}>{h.result?.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}