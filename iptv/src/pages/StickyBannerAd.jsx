import React, { useEffect, useRef } from "react";

const StickyBannerAd = () => {
  const adRef = useRef(null);

  useEffect(() => {
    if (window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, []);

  return (
    <div
      id="sticky-ad-container"
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        zIndex: 9999,
        background: "#fff",
        padding: "10px 0",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9700554883020818"
        data-ad-slot="7485309558"
        data-ad-format="auto"
        data-full-width-responsive="true"
        ref={adRef}
      ></ins>
    </div>
  );
};

export default StickyBannerAd; 