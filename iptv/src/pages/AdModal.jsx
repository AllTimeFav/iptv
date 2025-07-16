import React, { useEffect, useRef } from "react";

const AdModal = ({ open, onClose }) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (open && window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: 24, minWidth: 350, maxWidth: 400, boxShadow: "0 2px 24px rgba(0,0,0,0.2)", position: "relative"
      }}>
        <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 8, color: "#1abc9c" }}>✨ Quick Break!</div>
        <div style={{ marginBottom: 16 }}>
          If you find this helpful, feel free to support us by exploring our sponsors.
        </div>
        <div style={{ marginBottom: 16 }}>
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", minHeight: 120 }}
            data-ad-client="ca-pub-9700554883020818"
            data-ad-slot="7640162739"
            data-ad-format="auto"
            data-full-width-responsive="true"
            ref={adRef}
          ></ins>
        </div>
        <button onClick={onClose} style={{
          background: "#eee", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer"
        }}>Close Ad</button>
        <button onClick={onClose} style={{
          position: "absolute", top: 8, right: 12, background: "none", border: "none", fontSize: 22, cursor: "pointer"
        }}>×</button>
      </div>
    </div>
  );
};

export default AdModal; 