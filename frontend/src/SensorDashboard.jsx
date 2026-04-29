import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

// Mock sensor data generator
function generateReading(base, variance) {
  return +(base + (Math.random() - 0.5) * variance).toFixed(2);
}

const SENSORS = [
  { id: "R1", name: "Reactor Core Temp", unit: "°C", base: 320, variance: 10, max: 340, color: "#ff4444" },
  { id: "R2", name: "Coolant Flow Rate", unit: "L/min", base: 850, variance: 30, max: 900, color: "#00d4ff" },
  { id: "R3", name: "Radiation Level", unit: "mSv/h", base: 2.4, variance: 0.5, max: 5.0, color: "#a855f7" },
  { id: "R4", name: "Pressure", unit: "bar", base: 155, variance: 5, max: 165, color: "#ff6b35" },
  { id: "R5", name: "Solar Irradiance", unit: "W/m²", base: 750, variance: 50, max: 1000, color: "#ffcc00" },
  { id: "R6", name: "Wind Speed", unit: "m/s", base: 12, variance: 3, max: 25, color: "#22c55e" },
];

function StatusBadge({ value, max }) {
  const pct = (value / max) * 100;
  if (pct > 90) return <span style={{ color: "#ff4444", fontSize: 10, letterSpacing: 1 }}>⚠ CRITICAL</span>;
  if (pct > 75) return <span style={{ color: "#ffaa00", fontSize: 10, letterSpacing: 1 }}>⚡ WARNING</span>;
  return <span style={{ color: "#00cc66", fontSize: 10, letterSpacing: 1 }}>✓ NORMAL</span>;
}

export default function SensorDashboard() {
  const [data, setData] = useState(() =>
    SENSORS.reduce((acc, s) => ({
      ...acc,
      [s.id]: Array.from({ length: 20 }, (_, i) => ({
        time: `${i}s`,
        value: generateReading(s.base, s.variance)
      }))
    }), {})
  );

  const [current, setCurrent] = useState(() =>
    SENSORS.reduce((acc, s) => ({
      ...acc,
      [s.id]: generateReading(s.base, s.variance)
    }), {})
  );

  const [alerts, setAlerts] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newCurrent = {};
      const newAlerts = [];

      SENSORS.forEach(s => {
        const val = generateReading(s.base, s.variance);
        newCurrent[s.id] = val;
        if (val > s.max * 0.9) {
          newAlerts.push({
            sensor: s.name,
            value: val,
            unit: s.unit,
            time: new Date().toLocaleTimeString()
          });
        }
      });

      setCurrent(newCurrent);
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 5));
      setData(prev => {
        const updated = {};
        SENSORS.forEach(s => {
          const arr = [...prev[s.id], {
            time: `${tick}s`,
            value: newCurrent[s.id]
          }];
          updated[s.id] = arr.slice(-20);
        });
        return updated;
      });
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div style={{ background: "#050d1a", minHeight: "100vh", color: "#c0d8f0", fontFamily: "monospace", padding: 20 }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#00d4ff", letterSpacing: 2 }}>
            ⚛️ LIVE SENSOR MONITOR
          </div>
          <div style={{ fontSize: 9, color: "#3a6080", letterSpacing: 3 }}>
            NUCLEAR & RENEWABLE ENERGY — REAL-TIME DATA
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", animation: "pulse 1s infinite" }} />
          <span style={{ fontSize: 10, color: "#00ff88", letterSpacing: 2 }}>LIVE</span>
          <span style={{ fontSize: 10, color: "#3a6080" }}>Updates every 2s</span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {alerts.slice(0, 2).map((a, i) => (
            <div key={i} style={{
              background: "#ff444411", border: "1px solid #ff444433",
              borderRadius: 6, padding: "6px 12px", marginBottom: 4,
              fontSize: 11, color: "#ff4444",
            }}>
              ⚠ {a.time} — {a.sensor}: {a.value} {a.unit} (HIGH)
            </div>
          ))}
        </div>
      )}

      {/* Sensor Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {SENSORS.map(s => (
          <div key={s.id} style={{
            background: "#0a1428", border: `1px solid ${s.color}33`,
            borderRadius: 12, padding: 16,
          }}>
            {/* Sensor Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: s.color, letterSpacing: 1 }}>{s.name}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#e0eaff" }}>
                  {current[s.id]} <span style={{ fontSize: 12, color: "#5577aa" }}>{s.unit}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusBadge value={current[s.id]} max={s.max} />
                <div style={{ fontSize: 9, color: "#3a5070", marginTop: 4 }}>MAX: {s.max} {s.unit}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ background: "#1a2a44", borderRadius: 4, height: 4, marginBottom: 12 }}>
              <div style={{
                background: s.color,
                height: "100%", borderRadius: 4,
                width: `${Math.min((current[s.id] / s.max) * 100, 100)}%`,
                transition: "width 0.5s ease",
              }} />
            </div>

            {/* Line Chart */}
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={data[s.id]}>
                <Line type="monotone" dataKey="value" stroke={s.color} dot={false} strokeWidth={2} />
                <ReferenceLine y={s.max * 0.9} stroke="#ff444466" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ background: "#0a1428", border: `1px solid ${s.color}44`, fontSize: 10, color: "#c0d8f0" }}
                  formatter={(v) => [`${v} ${s.unit}`, s.name]}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}