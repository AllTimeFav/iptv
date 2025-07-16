// Ad configuration
const adConfig = {
  adsense: {
    clientId: "ca-pub-9700554883020818",
    stickyBannerUnit: "7485309558",
    inContentUnit: "7640162739"
  }
};

let adScriptLoaded = false;
let adsInitialized = false;

// Load AdSense script
export function loadAdScript() {
  if (typeof window.adsbygoogle === 'undefined' && !adScriptLoaded) {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adsense.clientId}`;
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => {
      adScriptLoaded = true;
      initializeAds();
    };
    document.head.appendChild(script);
  } else if (typeof window.adsbygoogle !== 'undefined') {
    initializeAds();
  }
}

function initializeAds() {
  if (!adsInitialized) {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    adsInitialized = true;
  }
}

// Show sticky banner
export function showStickyBanner() {
  // Remove existing banner if present
  const existing = document.getElementById('sticky-ad-container');
  if (existing) existing.remove();

  // Create new banner
  const banner = document.createElement('div');
  banner.id = 'sticky-ad-container';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 9999;
    background: #fff;
    padding: 10px 0;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  `;
  
  banner.innerHTML = `
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="${adConfig.adsense.clientId}"
         data-ad-slot="${adConfig.adsense.stickyBannerUnit}"
         data-ad-format="auto"
         data-full-width-responsive="true"
         data-adtest="on"></ins>
  `;
  
  document.body.appendChild(banner);
  refreshAds();
}

// Show in-content ad
export function showInContentAd(element) {
  if (!element) return;

  // Remove existing in-content ads
  document.querySelectorAll('.in-content-ad').forEach(ad => ad.remove());

  const adContainer = document.createElement('div');
  adContainer.className = 'in-content-ad';
  adContainer.style.cssText = 'margin:25px 0; text-align:center;';
  
  adContainer.innerHTML = `
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="${adConfig.adsense.clientId}"
         data-ad-slot="${adConfig.adsense.inContentUnit}"
         data-ad-format="fluid"
         data-full-width-responsive="true"
         data-adtest="on"></ins>
  `;
  
  element.parentNode.insertBefore(adContainer, element.nextSibling);
  refreshAds();
}

function refreshAds() {
  if (window.adsbygoogle) {
    setTimeout(() => {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }, 300);
  }
}

// Generate dummy data
export function generateDummyData() {
  return {
    server: `http://xtream-${Math.random().toString(36).substring(2, 6)}.com:8080`,
    username: `user_${Math.random().toString(36).substring(2, 8)}`,
    password: `pass_${Math.random().toString(36).substring(2, 10)}`,
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    region: ["Europe", "North America", "Asia"][Math.floor(Math.random() * 3)]
  };
}

// Copy to clipboard
export function copyToClipboard(text, button) {
  if (!text) {
    alert('No content to copy!');
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      button.classList.add('copied');
      button.textContent = '✓';
      setTimeout(() => {
        button.textContent = '⎘';
        button.classList.remove('copied');
      }, 2000);
    })
    .catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      button.classList.add('copied');
      button.textContent = '✓';
      setTimeout(() => {
        button.textContent = '⎘';
        button.classList.remove('copied');
      }, 2000);
    });
}