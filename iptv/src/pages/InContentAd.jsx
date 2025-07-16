import React, { useEffect, useRef } from "react";

const InContentAd = ({ slot }) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, []);

  return (
    <div className="in-content-ad" style={{ margin: "25px 0", textAlign: "center" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9700554883020818"
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-full-width-responsive="true"
        data-adtest="on"
        ref={adRef}
      ></ins>
    </div>
  );
};

export default InContentAd; 