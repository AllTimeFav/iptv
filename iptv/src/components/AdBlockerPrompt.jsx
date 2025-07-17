import React from "react";

const AdBlockerPrompt = ({ onClose }) => (
  <div className="adblocker-modal-box">
    {/* Warning Icon */}
    <div className="warning-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L1 21H23L12 2Z" fill="#f39c12" stroke="#e67e22" strokeWidth="2"/>
        <path d="M12 9V13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="17" r="1" fill="white"/>
      </svg>
    </div>
    
    {/* Title */}
    <div className="modal-title">
      Ad Blocker Detected
    </div>
    
    {/* Message */}
    <div className="modal-message">
      We've detected that you're using an ad blocker. Our service is free to use and ads help us keep it that way.
    </div>
    
    {/* Close Button */}
    <button className="close-btn" onClick={onClose} aria-label="Close ad blocker warning">
      ×
    </button>
  </div>
);

export default AdBlockerPrompt; 