import React from "react";

const AdBlockerPrompt = ({ onClose }) => (
  <div style={{
    position: "fixed", top: 0, left: 0, width: "100vw", background: "#ffdddd",
    color: "#900", padding: "16px", textAlign: "center", zIndex: 20000
  }}>
    <strong>Ad Blocker Detected!</strong> Please disable your ad blocker to support this site.
    <button
      onClick={onClose}
      style={{ marginLeft: 16, background: "#fff", border: "1px solid #900", color: "#900", borderRadius: 4, padding: "4px 12px", cursor: "pointer" }}
    >
      Close
    </button>
  </div>
);

export default AdBlockerPrompt; 