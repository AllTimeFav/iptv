import React, { useState, useEffect } from 'react';
import { 
  generateDummyData,
  copyToClipboard
} from './iptv-functions';
import StickyBannerAd from './StickyBannerAd';
import InContentAd from './InContentAd';
import AdModal from './AdModal';
import './IPTVGenerator.css';

const IPTVGenerator = () => {
  const [step, setStep] = useState(0);
  const [credentials, setCredentials] = useState({});
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showUrlAd, setShowUrlAd] = useState(false);
  const [showUsernameAd, setShowUsernameAd] = useState(false);
  const [showExpiryAd, setShowExpiryAd] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  // Load AdSense script once
  useEffect(() => {
    if (!document.querySelector("#adsbygoogle-js")) {
      const script = document.createElement("script");
      script.id = "adsbygoogle-js";
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9700554883020818";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
  }, []);

  // Handle connect/generate
  const handleConnect = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generateDummyData();
      setCredentials(data);
      setStep(1);
      setShowUrlAd(true);
      setShowAdModal(true); // Show ad modal after Connect
    } finally {
      setLoading(false);
    }
  };

  // Modified handleNextStep to only show AdModal, and advance step after modal closes
  const [pendingStep, setPendingStep] = useState(null);

  const handleNextStep = () => {
    setShowAdModal(true);
    setPendingStep(step + 1);
  };

  // When AdModal closes, advance to pending step
  const handleAdModalClose = () => {
    setShowAdModal(false);
    if (pendingStep !== null) {
      setStep(pendingStep);
      setPendingStep(null);
      if (pendingStep === 2) setShowUsernameAd(true);
      if (pendingStep === 4) setShowExpiryAd(true);
    }
  };

  // Copy field
  const handleCopy = (field, e) => {
    copyToClipboard(credentials[field], e.target);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // Reset form
  const resetForm = () => {
    setStep(0);
    setCredentials({});
    setShowUrlAd(false);
    setShowUsernameAd(false);
    setShowExpiryAd(false);
  };

  return (
    <>
      {/* Blur and overlay when AdModal is open */}
      {showAdModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(20, 20, 20, 0.35)', zIndex: 20000,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          pointerEvents: 'auto',
        }} />
      )}
      {/* AdModal should be above the overlay and not blurred */}
      <div style={showAdModal ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 20001, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' } : {}}>
        <AdModal open={showAdModal} onClose={handleAdModalClose} />
      </div>
      {/* Sticky ads on left and right edges */}
      {/* <div style={{ position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 9999, display: 'flex', alignItems: 'center', pointerEvents: showAdModal ? 'none' : 'auto' }}>
        <StickyBannerAd />
      </div>
      <div style={{ position: 'fixed', right: 0, top: 0, height: '100vh', zIndex: 9999, display: 'flex', alignItems: 'center', pointerEvents: showAdModal ? 'none' : 'auto' }}>
        <StickyBannerAd />
      </div> */}
      <div className="xtream-container" style={showAdModal ? { position: 'relative', zIndex: 1, filter: 'blur(4px)', pointerEvents: 'none' } : { position: 'relative', zIndex: 1, background: '#fff', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', padding: 40, borderRadius: 16, marginTop: 32, marginBottom: 32 }}>
        <h1 style={{ textAlign: 'center', color: '#22334d', fontWeight: 800, fontSize: 36, marginBottom: 36, letterSpacing: 0.5 }}>XTREAM IPTV Code Generator</h1>
        <div className="progress-steps" style={{ marginBottom: 36 }}>
          {['Connect', 'URL', 'Username', 'Password', 'Expiration', 'Region', 'Complete'].map((label, index) => (
            <div 
              key={index}
              className={`step ${index <= step ? 'active' : ''} ${index === step ? 'current' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>
        <div className="content-area" style={{ background: '#f9fafd', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: 36, minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {step === 0 && (
            <div className="connect-section" style={{ width: '100%', textAlign: 'center' }}>
              <h2 style={{ color: '#2471a3', fontWeight: 700, fontSize: 26, marginBottom: 10 }}>Connect</h2>
              <p style={{ color: '#22334d', fontSize: 17, marginBottom: 24 }}>Connect to database</p>
              <button 
                onClick={handleConnect}
                disabled={loading}
                className="connect-btn"
                style={{ fontSize: 18, padding: '14px 36px', borderRadius: 8, fontWeight: 700 }}
              >
                {loading ? 'CONNECTING...' : 'CONNECT'}
              </button>
            </div>
          )}
          {step === 1 && (
            <div className="field-row" style={{ width: '100%', maxWidth: 520, margin: '0 auto', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
              <label style={{ fontWeight: 700, color: '#22334d', fontSize: 16, marginBottom: 6 }}>URL:</label>
              <div style={{ display: 'flex', width: '100%', gap: 10 }}>
                <input type="text" value={credentials.server || ''} readOnly style={{ flex: 1, fontSize: 17, padding: '12px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f4f6fa' }} />
                <button 
                  onClick={(e) => handleCopy('server', e)}
                  className={`copy-btn ${copied === 'server' ? 'copied' : ''}`}
                  style={{ fontSize: 18, borderRadius: 6 }}
                >
                  {copied === 'server' ? '✓' : '⎘'}
                </button>
              </div>
              {showUrlAd && !showAdModal && <InContentAd slot="7640162739" />}
            </div>
          )}
          {step === 2 && (
            <div className="field-row" style={{ width: '100%', maxWidth: 520, margin: '0 auto', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
              <label style={{ fontWeight: 700, color: '#22334d', fontSize: 16, marginBottom: 6 }}>Username:</label>
              <div style={{ display: 'flex', width: '100%', gap: 10 }}>
                <input type="text" value={credentials.username || ''} readOnly style={{ flex: 1, fontSize: 17, padding: '12px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f4f6fa' }} />
                <button 
                  onClick={(e) => handleCopy('username', e)}
                  className={`copy-btn ${copied === 'username' ? 'copied' : ''}`}
                  style={{ fontSize: 18, borderRadius: 6 }}
                >
                  {copied === 'username' ? '✓' : '⎘'}
                </button>
              </div>
              {showUsernameAd && !showAdModal && <InContentAd slot="7640162739" />}
            </div>
          )}
          {step === 3 && (
            <div className="field-row" style={{ width: '100%', maxWidth: 520, margin: '0 auto', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
              <label style={{ fontWeight: 700, color: '#22334d', fontSize: 16, marginBottom: 6 }}>Password:</label>
              <div style={{ display: 'flex', width: '100%', gap: 10 }}>
                <input type="text" value={credentials.password || ''} readOnly style={{ flex: 1, fontSize: 17, padding: '12px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f4f6fa' }} />
                <button 
                  onClick={(e) => handleCopy('password', e)}
                  className={`copy-btn ${copied === 'password' ? 'copied' : ''}`}
                  style={{ fontSize: 18, borderRadius: 6 }}
                >
                  {copied === 'password' ? '✓' : '⎘'}
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="field-row" style={{ width: '100%', maxWidth: 520, margin: '0 auto', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
              <label style={{ fontWeight: 700, color: '#22334d', fontSize: 16, marginBottom: 6 }}>Expiration:</label>
              <div style={{ display: 'flex', width: '100%', gap: 10 }}>
                <input type="text" value={credentials.expiry || ''} readOnly style={{ flex: 1, fontSize: 17, padding: '12px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f4f6fa' }} />
                <button 
                  onClick={(e) => handleCopy('expiry', e)}
                  className={`copy-btn ${copied === 'expiry' ? 'copied' : ''}`}
                  style={{ fontSize: 18, borderRadius: 6 }}
                >
                  {copied === 'expiry' ? '✓' : '⎘'}
                </button>
              </div>
              {showExpiryAd && !showAdModal && <InContentAd slot="7640162739" />}
            </div>
          )}
          {step === 5 && (
            <div className="field-row" style={{ width: '100%', maxWidth: 520, margin: '0 auto', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
              <label style={{ fontWeight: 700, color: '#22334d', fontSize: 16, marginBottom: 6 }}>Region:</label>
              <div style={{ display: 'flex', width: '100%', gap: 10 }}>
                <input type="text" value={credentials.region || ''} readOnly style={{ flex: 1, fontSize: 17, padding: '12px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f4f6fa' }} />
                <button 
                  onClick={(e) => handleCopy('region', e)}
                  className={`copy-btn ${copied === 'region' ? 'copied' : ''}`}
                  style={{ fontSize: 18, borderRadius: 6 }}
                >
                  {copied === 'region' ? '✓' : '⎘'}
                </button>
              </div>
            </div>
          )}
          {step === 6 && (
            <div className="complete-section" style={{ width: '100%', textAlign: 'center', marginTop: 24 }}>
              <h3 style={{ color: '#2ecc71', fontWeight: 800, fontSize: 24, marginBottom: 20 }}>Your IPTV credentials are ready!</h3>
              <button className="done-btn" onClick={resetForm} style={{ fontSize: 18, padding: '14px 36px', borderRadius: 8, fontWeight: 700 }}>
                GENERATE NEW CREDENTIALS
              </button>
            </div>
          )}
        </div>
        {/* NEXT button always visible for steps 1-5 */}
        <div className="action-buttons" style={{ marginTop: 32, textAlign: 'right', width: '100%' }}>
          {step > 0 && step < 6 && (
            <button onClick={handleNextStep} className="next-btn" style={{ fontSize: 18, padding: '12px 36px', borderRadius: 8, fontWeight: 700 }}>
              NEXT STEP
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default IPTVGenerator;