import React, { useEffect, useRef, useState } from "react";

const InContentAd = ({ slot }) => {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Only load ad once and when container is ready
    if (!adLoaded && window.adsbygoogle && adRef.current) {
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
            setTimeout(loadAd, 100);
          }
        } catch (e) {
          console.log('AdSense error:', e);
        }
      };

      // Initial delay to ensure DOM is ready
      const timer = setTimeout(loadAd, 100);
      return () => clearTimeout(timer);
    }
  }, [adLoaded]);

  return (
    <div className="in-content-ad" style={{ margin: "25px 0", textAlign: "center" }}>
      <ins
        className="adsbygoogle"
        style={{ 
          display: "block", 
          width: "100%", 
          minHeight: "120px",
          maxWidth: "728px",
          margin: "0 auto"
        }}
        data-ad-client="ca-pub-9700554883020818"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest="on"
        ref={adRef}
      ></ins>
    </div>
  );
};

export default InContentAd; 