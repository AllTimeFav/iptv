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
      position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'auto',
      width: '100%', height: '100%',
    }}>
      <div className="admodal-box" style={{
        background: "#fff", borderRadius: 12, padding: 24, minWidth: 0, maxWidth: 420, width: '100%', boxSizing: 'border-box', boxShadow: "0 2px 24px rgba(0,0,0,0.2)", position: "relative", display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ fontWeight: "bold", fontSize: 20, marginBottom: 8, color: "#1abc9c", textAlign: 'center' }}>Quick Break!</div>
        <div style={{ marginBottom: 16, textAlign: 'center', fontSize: 16 }}>
          If you find this helpful, feel free to support us by exploring our sponsors.
        </div>
        <div style={{ marginBottom: 16, width: '100%' }}>
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
          background: "#eee", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontSize: 16, width: '100%', maxWidth: 180, margin: '0 auto',
        }}>Close Ad</button>
        <button onClick={onClose} style={{
          position: "absolute", top: 8, right: 12, background: "none", border: "none", fontSize: 22, cursor: "pointer"
        }}>×</button>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .admodal-box {
            padding: 12px 6px !important;
            font-size: 15px !important;
            min-width: 0 !important;
            max-width: 95vw !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdModal; 