import { useEffect, useState } from "react";

export function useAdBlocker() {
  const [adBlocked, setAdBlocked] = useState(false);

  useEffect(() => {
    // Create a bait element
    const bait = document.createElement("div");
    bait.className = "adsbox";
    bait.style.position = "absolute";
    bait.style.height = "10px";
    bait.style.width = "10px";
    bait.style.top = "-1000px";
    bait.innerHTML = "&nbsp;";
    document.body.appendChild(bait);

    setTimeout(() => {
      if (
        !bait ||
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0
      ) {
        setAdBlocked(true);
      }
      document.body.removeChild(bait);
    }, 100);

    // Network-based detection
    const img = document.createElement("img");
    img.src = "https://pagead2.googlesyndication.com/pagead/imgad?id=CICAgKDL09e1bBABGAEyCjII6w";
    img.style.display = "none";
    img.onload = () => {};
    img.onerror = () => setAdBlocked(true);
    document.body.appendChild(img);

    // Also check if adsbygoogle is defined after a delay
    setTimeout(() => {
      if (typeof window.adsbygoogle === "undefined") {
        setAdBlocked(true);
      }
      document.body.removeChild(img);
    }, 1000);
  }, []);

  return adBlocked;
} 