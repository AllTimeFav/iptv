import React from "react";

const AdBlockerPrompt = ({ onClose }) => (
  <div style={{
    background: "#fff",
    borderRadius: 16,
    padding: "40px 36px 32px 36px",
    minWidth: 340,
    maxWidth: 420,
    boxShadow: "0 4px 32px rgba(0,0,0,0.25)",
    textAlign: "center",
    zIndex: 20001,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  }}>
    {/* Close (X) button */}
    <button
      onClick={onClose}
      style={{
        position: 'absolute',
        top: 14,
        right: 18,
        background: 'none',
        border: 'none',
        fontSize: 26,
        color: '#b71c1c',
        cursor: 'pointer',
        fontWeight: 700,
        lineHeight: 1,
      }}
      aria-label="Close ad blocker warning"
    >
      ×
    </button>
    <div style={{ fontWeight: 700, fontSize: 26, color: "#b71c1c", marginBottom: 18, letterSpacing: 0.5 }}>
      Ad Blocker Detected!
    </div>
    <div style={{ color: "#b71c1c", fontSize: 17, marginBottom: 28, lineHeight: 1.5 }}>
      Please disable your ad blocker to support this site.<br />
      You won't be able to use the website while an ad blocker is enabled.
    </div>
  </div>
);

export default AdBlockerPrompt; 