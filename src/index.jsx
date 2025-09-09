import React, { useEffect, useRef, useState } from "react";

// Audio playlist URLs
const tracks = [
  "https://files.catbox.moe/lgnhno.mp3",
  "https://files.catbox.moe/i80aez.mp3",
  "https://files.catbox.moe/ijjr0m.mp3",
  "https://files.catbox.moe/l5zxrv.mp3",
];

// API endpoint categories
const apiCategories = [
  {
    title: "Pickup Lines",
    endpoints: [
      { name: "Romantic", url: "/api/random/romantic" },
      { name: "Funny", url: "/api/random/fun" },
      { name: "Flirty", url: "/api/random/flirt" },
      { name: "Heartbreak", url: "/api/random/heartbreak" }
    ]
  },
  {
    title: "Messages",
    endpoints: [
      { name: "Congratulations", url: "/api/random/congrats" },
      { name: "Condolence", url: "/api/random/condolence" }
    ]
  },
  {
    title: "AI Chat & Images",
    endpoints: [
      { name: "Casper AI Chatbot", url: "/api/ai/casper" },
      { name: "Ephoto Image Effects", url: "/api/ephoto/image" }
    ]
  }
];

export default function Home() {
  // Audio controls
  const audioRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, [trackIndex]);

  // Autoplay first track on page load
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.25;
      audioRef.current.play();
    }
  }, []);

  // Advance to next audio track when one ends
  const handleEnded = () => {
    setTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  // Animated code rain background
  function CodeRain() {
    // Generate random code symbols
    const symbols = "01{}();<>[]+=-*$%#@";
    const columns = 30;
    const rows = 15;
    const items = [];
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        const char = symbols[Math.floor(Math.random() * symbols.length)];
        const delay = Math.random() * 3;
        items.push(
          <text
            key={`code-${c}-${r}`}
            x={c * 30 + 10}
            y={r * 32 + 20}
            fill="#8fd4ff"
            fontSize="26"
            opacity={Math.random() * 0.7 + 0.3}
            style={{
              animation: `rain 2.5s linear ${delay}s infinite`,
            }}
          >
            {char}
          </text>
        );
      }
    }
    return (
      <svg
        width="100vw"
        height="100vh"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fd4ff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#1e3c72" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {items}
      </svg>
    );
  }

  // Floating animated objects ("code bubbles")
  function FloatingObjects() {
    const objects = Array.from({ length: 15 }).map((_, i) => {
      const size = Math.random() * 42 + 20;
      const left = Math.random() * 100;
      const delay = Math.random() * 4;
      const duration = Math.random() * 4 + 6;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "-60px",
            left: `${left}%`,
            width: size,
            height: size,
            borderRadius: "50%",
            background: "rgba(140,212,255,0.13)",
            boxShadow: `0 0 20px 8px #8fd4ff88`,
            animation: `floatDown ${duration}s linear ${delay}s infinite`,
            zIndex: 1,
          }}
        />
      );
    });
    return <>{objects}</>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background: "linear-gradient(135deg,#1e3c72,#2a5298 70%)",
        color: "#fff",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Animated code rain background */}
      <CodeRain />
      {/* Floating blue objects */}
      <FloatingObjects />

      {/* Autoplaying audio */}
      <audio
        ref={audioRef}
        src={tracks[trackIndex]}
        autoPlay
        onEnded={handleEnded}
        style={{ display: "none" }}
      />

      <div
        style={{
          zIndex: 3,
          position: "relative",
          maxWidth: "760px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          background: "rgba(0,0,50,0.65)",
          borderRadius: "2.4rem",
          boxShadow: "0 12px 40px 0 #0008",
          textAlign: "center",
        }}
      >
        <h1 style={{
          fontSize: "3.0rem",
          fontWeight: "bold",
          letterSpacing: "0.02em",
          marginBottom: "1.5rem",
          color: "#8fd4ff",
        }}>
          Casper Tech API Documentation
        </h1>
        <p style={{
          fontSize: "1.35rem",
          marginBottom: "2.2rem",
          color: "#e0f7ff",
          textShadow: "0 2px 12px #3388cc55"
        }}>
          Welcome to Casper Tech's API suite! <br />
          Build creative apps with smart pickup lines, chatbots, image effects, and more.<br />
          <span style={{color: "#fff", fontWeight:"bold", fontSize:"1.15rem", textShadow: "0 2px 6px #8fd4ff"}}>
            Everything runs with a touch of blue magic.
          </span>
        </p>

        {/* API Categories */}
        <div style={{margin: "2.5rem 0"}}>
          {apiCategories.map(cat => (
            <div key={cat.title} style={{
              marginBottom: "2.0rem",
              padding: "1.2rem 1rem",
              background: "rgba(140,212,255,0.10)",
              borderRadius: "1rem",
              borderLeft: "7px solid #8fd4ff",
              boxShadow: "0 2px 8px #1e3c7244"
            }}>
              <h2 style={{color: "#8fd4ff", fontSize: "1.45rem", marginBottom: "0.7rem"}}>{cat.title}</h2>
              <ul style={{ listStyle: "none", padding: 0, margin:0 }}>
                {cat.endpoints.map(ep => (
                  <li key={ep.url} style={{marginBottom: "0.7rem"}}>
                    <code style={{
                      background: "#222a",
                      color: "#8fd4ff",
                      padding: "0.22rem 0.55rem",
                      borderRadius: "6px",
                      fontSize: "1.00rem",
                      fontWeight: "bold",
                      letterSpacing: "0.03em"
                    }}>
                      {ep.url}
                    </code>
                    <span style={{marginLeft: "12px", color: "#e0f7ff"}}>{ep.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Example usage */}
        <div style={{margin: "2rem 0", textAlign: "left"}}>
          <h2 style={{color:"#8fd4ff", fontSize:"1.10rem", marginBottom:"0.6rem"}}>Sample Usage</h2>
          <pre style={{
            background: "#222a",
            color: "#8fd4ff",
            padding: "1.1rem",
            borderRadius: "0.7rem",
            fontSize: "1.06rem",
            fontFamily: "Fira Mono, Menlo, Monaco, monospace",
            marginBottom: "0"
          }}>
{`fetch("/api/random/romantic")
  .then(res => res.json())
  .then(data => console.log(data));`}
          </pre>
        </div>

        {/* Thanks & Report a Glitch */}
        <div style={{marginTop:"2.5rem", textAlign:"center"}}>
          <h2 style={{color:"#e0f7ff", fontSize:"1.22rem", marginBottom:"1rem"}}>Thanks 💙</h2>
          <p style={{color:"#b3e6ff", marginBottom:"1.4rem"}}>
            Thank you for using Casper Tech APIs. <br />
            We hope these tools help you build something extraordinary and blue!
          </p>
          <button
            style={{
              background: "linear-gradient(90deg,#8fd4ff,#1e3c72)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1.05rem",
              padding: "0.80rem 1.9rem",
              boxShadow: "0 2px 8px #1e3c7255",
              cursor: "pointer",
              marginBottom: "1.3rem",
              transition: "transform 0.18s",
            }}
            onClick={() =>
              window.open(
                "https://github.com/Casper-Tech-ke/ap2/issues/new?title=API+Glitch+Report",
                "_blank"
              )
            }
          >
            Report a Glitch 🐞
          </button>
        </div>
        <div style={{marginTop:"1rem", textAlign:"center", fontSize:"1.03rem", color:"#8fd4ff"}}>
          <span>🎶 Now Playing: Blue Magic Coding Soundtrack</span>
        </div>
        <footer style={{marginTop:"2.7rem", textAlign:"center", color:"#b3b3b3", fontSize:"1.00rem"}}>
          <p>
            &copy; {new Date().getFullYear()} Casper Tech. Made with <span style={{color:"#8fd4ff"}}>💙</span> by <a href="https://github.com/Casper-Tech-ke" style={{color:"#8fd4ff"}}>Casper-Tech-ke</a>
          </p>
        </footer>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes rain {
          0% { opacity: 0.2; transform: translateY(-30px);}
          80% { opacity: 0.85; transform: translateY(0);}
          100% { opacity: 0.25; transform: translateY(35px);}
        }
        @keyframes floatDown {
          0% { top: -60px; opacity: 0.4;}
          85% { opacity: 0.8;}
          100% { top: 108vh; opacity: 0.15;}
        }
      `}</style>
    </div>
  );
}
