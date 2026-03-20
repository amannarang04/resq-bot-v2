"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
import VoiceInput from "./components/VoiceInput";
import IncidentForm from "./components/IncidentForm";
import ImageUpload from "./components/ImageUpload";

const MapView = dynamic(() => import("./components/MapView"), { ssr: false });

const EMERGENCY_NUMBERS = [
  { icon: "🚔", label: "Police", number: "100", color: "#3b82f6" },
  { icon: "🚑", label: "Ambulance", number: "108", color: "#22c55e" },
  { icon: "🚒", label: "Fire", number: "101", color: "#f97316" },
  { icon: "🆘", label: "Disaster", number: "1078", color: "#a855f7" },
  { icon: "👩", label: "Women", number: "1091", color: "#ec4899" },
];

const CRISIS_CARDS = [
  { icon: "🔥", label: "Fire", prompt: "Mere ghar mein aag lagi hai" },
  { icon: "🌊", label: "Flood", prompt: "Flood aa gaya hai help karo" },
  {
    icon: "🏥",
    label: "Medical",
    prompt: "Medical emergency hai turant help chahiye",
  },
  { icon: "🚗", label: "Accident", prompt: "Road accident hua hai" },
  { icon: "⚡", label: "Electric", prompt: "Bijli ka shock laga hai" },
  { icon: "🌪️", label: "Storm", prompt: "Toofan aa raha hai kya karun" },
];

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "🚨 Namaste! Main **ResQ Bot** hoon — aapka AI-powered emergency assistant.\n\nKisi bhi crisis mein mujhse madad lo. Main Hindi aur English dono mein respond karta hoon.\n\nNeeche diye crisis cards ya SOS button use karein!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [lang, setLang] = useState("hi");
  const [muted, setMuted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const saved = localStorage.getItem("resq-chat-history");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("resq-chat-history", JSON.stringify(messages));
  }, [messages]);

  const speak = (text) => {
    if (muted || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const cleaned = text.replace(/[*#`_]/g, "").substring(0, 200);
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleMute = () => {
    window.speechSynthesis.cancel();
    setMuted((m) => !m);
  };

  const playAlert = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.3, 0.6].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      o.type = "sine";
      g.gain.setValueAtTime(0.3, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.25);
    });
  };

  const getLocation = async () => {
    if (!navigator.geolocation) return "";
    const pos = await new Promise((resolve) =>
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
        timeout: 5000,
      }),
    );
    if (pos) {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      return `User location: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}.`;
    }
    return "";
  };

  const sendMessage = async (customMsg) => {
    const userMessage = customMsg || input;
    if (!userMessage.trim()) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const locationText = await getLocation();
      const langInstruction =
        lang === "en" ? "\n\n[Please respond in English only]" : "";
      const fullMessage = `${userMessage}${langInstruction}${locationText ? `\n\n[${locationText}]` : ""}`;
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: fullMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      speak(data.reply);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Server se connection nahi ho pa raha." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = async () => {
    setSosActive(true);
    playAlert();
    const locationText = await getLocation();
    await sendMessage(
      `🆘 SOS EMERGENCY! Mujhe turant madad chahiye!${locationText ? ` Mera location: ${locationText}` : ""}`,
    );
    setTimeout(() => setSosActive(false), 3000);
  };

  const clearHistory = () => {
    setMessages([
      {
        role: "bot",
        text: "🚨 Chat history clear ho gayi. Main ResQ Bot hoon, kaise madad kar sakta hoon?",
      },
    ]);
    localStorage.removeItem("resq-chat-history");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {showSidebar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowSidebar(false)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1a1a2e, #16213e)",
              borderRadius: "24px",
              padding: "32px",
              width: "320px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                color: "#fff",
                fontSize: "20px",
                fontWeight: 800,
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              📞 Emergency Numbers
            </h2>
            {EMERGENCY_NUMBERS.map((n, i) => (
              <a
                key={i}
                href={`tel:${n.number}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  borderRadius: "16px",
                  marginBottom: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${n.color}40`,
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: `${n.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    border: `2px solid ${n.color}60`,
                  }}
                >
                  {n.icon}
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700 }}>
                    {n.label}
                  </div>
                  <div
                    style={{
                      color: n.color,
                      fontWeight: 800,
                      fontSize: "22px",
                    }}
                  >
                    {n.number}
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    color: n.color,
                    fontSize: "20px",
                  }}
                >
                  📲
                </div>
              </a>
            ))}
            <button
              onClick={() => setShowSidebar(false)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <IncidentForm
          onSubmit={sendMessage}
          onClose={() => setShowForm(false)}
        />
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "760px",
          height: "95vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, #e63946, #c1121f)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 20px rgba(230,57,70,0.4)",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🚨
          </div>
          <div>
            <h1
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: "17px",
                margin: 0,
              }}
            >
              ResQ Bot
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "11px",
                margin: 0,
              }}
            >
              AI Emergency First Responder
            </p>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "6px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setLang((l) => (l === "hi" ? "en" : "hi"))}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "5px 10px",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {lang === "hi" ? "🇮🇳 HI" : "🇬🇧 EN"}
            </button>
            <button
              onClick={handleMute}
              style={{
                background: muted
                  ? "rgba(239,68,68,0.3)"
                  : "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "5px 10px",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <button
              onClick={() => setShowMap((m) => !m)}
              style={{
                background: showMap
                  ? "rgba(59,130,246,0.4)"
                  : "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "5px 10px",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setShowSidebar(true)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "5px 10px",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📞
            </button>
            <button
              onClick={clearHistory}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                padding: "5px 10px",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🗑️
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 8px #4ade80",
                }}
              ></div>
              <span
                style={{ color: "#4ade80", fontSize: "11px", fontWeight: 600 }}
              >
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <div style={{ padding: "12px 16px 0" }}>
            <MapView userLocation={userLocation} />
          </div>
        )}

        {/* Crisis Cards */}
        <div
          style={{
            padding: "12px 16px 8px",
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "8px",
          }}
        >
          {CRISIS_CARDS.map((c, i) => (
            <button
              key={i}
              onClick={() => sendMessage(c.prompt)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "10px 4px",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(230,57,70,0.25)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
              }
            >
              <span style={{ fontSize: "18px" }}>{c.icon}</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {c.label}
              </span>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "bot" && (
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e63946, #c1121f)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    marginRight: "8px",
                    flexShrink: 0,
                    marginTop: "4px",
                  }}
                >
                  🤖
                </div>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "12px 16px",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #e63946, #c1121f)"
                      : "rgba(255,255,255,0.07)",
                  border:
                    msg.role === "bot"
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "none",
                  color: "#fff",
                  fontSize: "13.5px",
                  lineHeight: "1.7",
                  boxShadow:
                    msg.role === "user"
                      ? "0 4px 15px rgba(230,57,70,0.3)"
                      : "none",
                }}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e63946, #c1121f)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                }}
              >
                🤖
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "18px",
                  padding: "14px 18px",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#e63946",
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Bottom */}
        <div
          style={{
            padding: "12px 16px 16px",
            background: "rgba(255,255,255,0.04)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={handleSOS}
            disabled={sosActive}
            style={{
              width: "100%",
              padding: "13px",
              background: sosActive
                ? "#7f1d1d"
                : "linear-gradient(135deg, #dc2626, #991b1b)",
              border: sosActive ? "2px solid #ef4444" : "2px solid transparent",
              borderRadius: "16px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 800,
              cursor: sosActive ? "not-allowed" : "pointer",
              marginBottom: "10px",
              boxShadow: sosActive
                ? "0 0 30px rgba(239,68,68,0.8)"
                : "0 4px 20px rgba(220,38,38,0.5)",
              animation: sosActive ? "pulse 0.5s ease-in-out infinite" : "none",
            }}
          >
            {sosActive
              ? "🆘 SOS SENT! Help is on the way..."
              : "🆘 SOS — EMERGENCY HELP"}
          </button>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <VoiceInput onResult={(text) => setInput(text)} />
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "14px",
                padding: "13px 14px",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              📋
            </button>
            <ImageUpload
              onResult={(reply) =>
                setMessages((prev) => [...prev, { role: "bot", text: reply }])
              }
              onLoading={(val) => setLoading(val)}
            />
            <input
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "14px",
                padding: "13px 16px",
                color: "#fff",
                fontSize: "13.5px",
                outline: "none",
              }}
              placeholder={
                lang === "hi"
                  ? "Emergency batao... (Hindi ya English)"
                  : "Describe your emergency..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              style={{
                background: loading
                  ? "rgba(230,57,70,0.4)"
                  : "linear-gradient(135deg, #e63946, #c1121f)",
                border: "none",
                borderRadius: "14px",
                padding: "13px 18px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 15px rgba(230,57,70,0.4)",
              }}
            >
              {loading ? "..." : "🚀"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </main>
  );
}
