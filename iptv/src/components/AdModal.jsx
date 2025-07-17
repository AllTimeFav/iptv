import React, { useEffect, useRef, useState } from "react";

const AdModal = ({ open, onClose }) => {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Reset ad loaded state when modal opens
    if (open) {
      setAdLoaded(false);
    }
  }, [open]);

  useEffect(() => {
    // Only load ad once when modal is open and container is ready
    if (open && !adLoaded && window.adsbygoogle && adRef.current) {
      const loadAd = () => {
        try {
          // Check if the container has proper dimensions
          const rect = adRef.current.getBoundingClientRect();
          const container = adRef.current.parentElement;
          const containerRect = container.getBoundingClientRect();
          
          // Ensure both the ins element and its container have dimensions
          if (rect.width > 0 && rect.height > 0 && containerRect.width > 0) {
            // Check if ad is already loaded
            if (!adRef.current.hasAttribute('data-ad-loaded')) {
              adRef.current.setAttribute('data-ad-loaded', 'true');
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              setAdLoaded(true);
            }
          } else {
            // Retry after a short delay if container has no dimensions
            setTimeout(loadAd, 200);
          }
        } catch (e) {
          console.log('AdSense error:', e);
        }
      };

      // Wait for modal to be fully rendered and visible
      const timer = setTimeout(loadAd, 200);
      return () => clearTimeout(timer);
    }
  }, [open, adLoaded]);

  if (!open) return null;

  return (
    <div className="admodal-box">
      {/* Ad Icon */}
      <div className="ad-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#3498db" stroke="#2980b9" strokeWidth="2"/>
          <path d="M7 7H17V9H7V7Z" fill="white"/>
          <path d="M7 11H17V13H7V11Z" fill="white"/>
          <path d="M7 15H13V17H7V15Z" fill="white"/>
        </svg>
      </div>
      
      {/* Title */}
      <div className="modal-title">
        Quick Break!
      </div>
      
      {/* Message */}
      <div className="modal-message">
        If you find this helpful, feel free to support us by exploring our sponsors.
      </div>
      
      {/* Ad Container */}
      <div className="ad-container">
        <ins
          className="adsbygoogle"
          style={{ 
            display: "block", 
            width: "100%", 
            minHeight: "120px",
            maxWidth: "100%"
          }}
          data-ad-client="ca-pub-9700554883020818"
          data-ad-slot="7640162739"
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-adtest="on"
          ref={adRef}
        ></ins>
      </div>
      
      {/* Close Button */}
      <button className="close-btn" onClick={onClose}>
        Close Ad
      </button>
      
      {/* Close Icon */}
      <button className="close-icon" onClick={onClose} aria-label="Close ad modal">
        ×
      </button>
    </div>
  );
};

export default AdModal; 