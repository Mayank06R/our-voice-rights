import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// 🌐 Base API URL (from environment or fallback to Render URL)
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://our-voice-rights-1.onrender.com";

// 🌍 Auto-detect user's district using geolocation + OpenStreetMap
async function detectUserDistrict(setSelectedDistrict) {
  if (!navigator.geolocation) {
    alert("❌ आपका ब्राउज़र लोकेशन को सपोर्ट नहीं करता।");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      console.log("📍 Coordinates:", latitude, longitude);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const district =
          data.address?.county ||
          data.address?.state_district ||
          data.address?.city_district ||
          data.address?.city;

        if (district) {
          alert(`📍 आपका जिला: ${district}`);
          setSelectedDistrict(district.toUpperCase());
        } else {
          alert("⚠️ जिला की पहचान नहीं हो सकी।");
        }
      } catch (error) {
        console.error("Geolocation error:", error);
        alert("⚠️ लोकेशन से जिला जानकारी प्राप्त नहीं हो सकी।");
      }
    },
    (err) => {
      console.error("Location permission denied:", err);
      alert("⚠️ कृपया लोकेशन की अनुमति दें।");
    }
  );
}

export default function App() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch district list
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/districts`)
      .then((r) => r.json())
      .then((data) => {
        setDistricts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ District fetch error:", err);
        setError("डेटा लोड करने में समस्या आ रही है।");
        setLoading(false);
      });
  }, []);

  // ✅ Fetch district data + history when selected
  useEffect(() => {
    if (!selectedDistrict) return;

    const state = "MAHARASHTRA";
    const district = selectedDistrict;

    setSummary(null);
    setHistory([]);
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE}/api/v1/performance?state=${state}&district=${district}`).then((r) =>
        r.json()
      ),
      fetch(`${API_BASE}/api/v1/history?state=${state}&district=${district}`).then((r) =>
        r.json()
      ),
    ])
      .then(([perf, hist]) => {
        setSummary(perf);
        setHistory(hist.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Data fetch error:", err);
        setError("जिला डेटा प्राप्त करने में समस्या हुई।");
        setLoading(false);
      });
  }, [selectedDistrict]);

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: "#f5f6fa",
        minHeight: "100vh",
        padding: 20,
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, color: "#2e7d32", margin: 0 }}>
          🌾 हमारी आवाज़, हमारे हक
        </h1>
        <p style={{ color: "#555", fontSize: 15 }}>
          MGNREGA जिला प्रदर्शन (Maharashtra)
        </p>
        <button
          onClick={() => detectUserDistrict(setSelectedDistrict)}
          style={{
            marginTop: 10,
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            background: "#2e7d32",
            color: "#fff",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          📍 मेरा जिला पहचानें
        </button>
      </header>

      {/* District Selector */}
      <section>
        <label style={{ fontSize: 18, fontWeight: "600" }}>जिला चुनें:</label>
        {loading ? (
          <p style={{ textAlign: "center", color: "#777", marginTop: 10 }}>
            ⏳ जिलों की सूची लोड हो रही है...
          </p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "red" }}>{error}</p>
        ) : (
          <div style={{ width: "100%", overflow: "hidden" }}>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                marginTop: 8,
                fontSize: 16,
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                appearance: "none",
              }}
            >
              <option value="">— Select District —</option>
              {districts.map((d) => (
                <option key={d.district} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Summary cards */}
      {summary && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ color: "#2e7d32", marginBottom: 12 }}>
            📊 {summary.district}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            <InfoCard title="👷‍♂️ सक्रिय मज़दूर" value={summary.total_active_workers} />
            <InfoCard
              title="📅 औसत कार्य दिवस"
              value={summary.average_days_employment}
            />
            <InfoCard title="💰 वेतन (₹)" value={summary.wages_paid} />
          </div>
        </section>
      )}

      {/* Line and Bar Charts */}
      {history.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h3 style={{ textAlign: "center", color: "#333" }}>
            📈 पिछले 12 महीने का प्रदर्शन
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="average_wage_rate"
                stroke="#2e7d32"
                name="औसत वेतन दर"
              />
              <Line
                type="monotone"
                dataKey="average_days_employment"
                stroke="#8884d8"
                name="औसत कार्य दिवस"
              />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="total_expenditure"
                fill="#ffc658"
                name="कुल व्यय (लाख ₹)"
              />
              <Bar
                dataKey="women_persondays"
                fill="#82ca9d"
                name="महिला कार्य दिवस"
              />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          marginTop: 40,
          paddingTop: 10,
          borderTop: "1px solid #ddd",
          fontSize: 14,
          color: "#777",
        }}
      >
        🌐 Developed by <b>Mayank Rose Xalxo</b> | © 2025
      </footer>
    </div>
  );
}

// 📦 Reusable Card Component
function InfoCard({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 12,
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <h4 style={{ marginBottom: 6 }}>{title}</h4>
      <p style={{ fontSize: 20, fontWeight: "bold", color: "#2e7d32" }}>
        {value !== "N/A" ? value : "—"}
      </p>
    </div>
  );
}
