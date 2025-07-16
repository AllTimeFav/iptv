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
      <div className="xtream-container">
        <h1>XTREAM IPTV Code Generator</h1>
        <div className="progress-steps">
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
        <div className="content-area">
          {step === 0 && (
            <div className="connect-section">
              <h2>Connect</h2>
              <p>Connect to database</p>
              <button 
                onClick={handleConnect}
                disabled={loading}
                className="connect-btn"
              >
                {loading ? 'CONNECTING...' : 'CONNECT'}
              </button>
            </div>
          )}
          {step === 1 && (
            <div className="field-row">
              <label>URL:</label>
              <input type="text" value={credentials.server || ''} readOnly />
              <button 
                onClick={(e) => handleCopy('server', e)}
                className={`copy-btn ${copied === 'server' ? 'copied' : ''}`}
              >
                {copied === 'server' ? '✓' : '⎘'}
              </button>
              {showUrlAd && !showAdModal && <InContentAd slot="7640162739" />}
            </div>
          )}
          {step === 2 && (
            <div className="field-row">
              <label>Username:</label>
              <input type="text" value={credentials.username || ''} readOnly />
              <button 
                onClick={(e) => handleCopy('username', e)}
                className={`copy-btn ${copied === 'username' ? 'copied' : ''}`}
              >
                {copied === 'username' ? '✓' : '⎘'}
              </button>
              {showUsernameAd && !showAdModal && <InContentAd slot="7640162739" />}
            </div>
          )}
          {step === 3 && (
            <div className="field-row">
              <label>Password:</label>
              <input type="text" value={credentials.password || ''} readOnly />
              <button 
                onClick={(e) => handleCopy('password', e)}
                className={`copy-btn ${copied === 'password' ? 'copied' : ''}`}
              >
                {copied === 'password' ? '✓' : '⎘'}
              </button>
            </div>
          )}
          {step === 4 && (
            <div className="field-row">
              <label>Expiration:</label>
              <input type="text" value={credentials.expiry || ''} readOnly />
              <button 
                onClick={(e) => handleCopy('expiry', e)}
                className={`copy-btn ${copied === 'expiry' ? 'copied' : ''}`}
              >
                {copied === 'expiry' ? '✓' : '⎘'}
              </button>
              {showExpiryAd && !showAdModal && <InContentAd slot="7640162739" />}
            </div>
          )}
          {step === 5 && (
            <div className="field-row">
              <label>Region:</label>
              <input type="text" value={credentials.region || ''} readOnly />
              <button 
                onClick={(e) => handleCopy('region', e)}
                className={`copy-btn ${copied === 'region' ? 'copied' : ''}`}
              >
                {copied === 'region' ? '✓' : '⎘'}
              </button>
            </div>
          )}
          {step === 6 && (
            <div className="complete-section">
              <div className="credentials-summary" style={{ background: '#f4f6fa', borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', maxWidth: 400, margin: '0 auto 24px auto', textAlign: 'left' }}>
                <div style={{ marginBottom: 10 }}><strong>URL:</strong> <span style={{ wordBreak: 'break-all' }}>{credentials.server}</span></div>
                <div style={{ marginBottom: 10 }}><strong>Username:</strong> <span>{credentials.username}</span></div>
                <div style={{ marginBottom: 10 }}><strong>Password:</strong> <span>{credentials.password}</span></div>
                <div style={{ marginBottom: 10 }}><strong>Expiration:</strong> <span>{credentials.expiry}</span></div>
                <div style={{ marginBottom: 0 }}><strong>Region:</strong> <span>{credentials.region}</span></div>
              </div>
              <h3>Your IPTV credentials are ready!</h3>
              <button className="done-btn" onClick={resetForm}>
                GENERATE NEW CREDENTIALS
              </button>
            </div>
          )}
        </div>
        <div className="action-buttons">
          {step > 0 && step < 6 && (
            <button onClick={handleNextStep} className="next-btn">
              NEXT STEP
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default IPTVGenerator;