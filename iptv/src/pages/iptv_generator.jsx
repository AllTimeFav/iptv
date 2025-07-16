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
  const [copyAllState, setCopyAllState] = useState(false);
  const [checkServerLoading, setCheckServerLoading] = useState(false);
  const [checkServerResult, setCheckServerResult] = useState(null);

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

  // Copy all fields to clipboard with feedback
  const copyAllFields = () => {
    const text = [
      `URL: ${credentials.server || ''}`,
      `Username: ${credentials.username || ''}`,
      `Password: ${credentials.password || ''}`,
      `Expiration: ${credentials.expiry || ''}`,
      `Region: ${credentials.region || ''}`
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopyAllState(true);
    setTimeout(() => setCopyAllState(false), 2000);
  };

  // Simulate check server functionality with feedback
  const handleCheckServer = () => {
    setCheckServerLoading(true);
    setCheckServerResult(null);
    setTimeout(() => {
      // Simulate random result
      const success = Math.random() > 0.3;
      setCheckServerResult(success ? { success: true, message: 'Server is working!' } : { success: false, message: 'Server is not reachable.' });
      setCheckServerLoading(false);
    }, 1500);
  };

  // Reset form
  const resetForm = () => {
    setStep(0);
    setCredentials({});
    setShowUrlAd(false);
    setShowUsernameAd(false);
    setShowExpiryAd(false);
    setCopyAllState(false);
    setCheckServerResult(null);
  };

  // Field definitions for step-based rendering
  const fieldSteps = [
    { key: 'server', label: 'URL:' },
    { key: 'username', label: 'Username:' },
    { key: 'password', label: 'Password:' },
    { key: 'expiry', label: 'Expiration:' },
    { key: 'region', label: 'Region:' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
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
          {/* Show previous fields as read-only, only current field as editable */}
          {step > 0 && step < 6 && (
            <>
              {fieldSteps.slice(0, step - 1).map((field) => (
                <div className="field-row" key={field.key}>
                  <label>{field.label}</label>
                  <input type="text" value={credentials[field.key] || ''} readOnly />
                  <button 
                    onClick={(e) => handleCopy(field.key, e)}
                    className={`copy-btn ${copied === field.key ? 'copied' : ''}`}
                  >
                    {copied === field.key ? '✓' : '⎘'}
                  </button>
                </div>
              ))}
              {/* Only show the current field as editable */}
              <div className="field-row">
                <label>{fieldSteps[step - 1].label}</label>
                <input type="text" value={credentials[fieldSteps[step - 1].key] || ''} readOnly />
                <button 
                  onClick={(e) => handleCopy(fieldSteps[step - 1].key, e)}
                  className={`copy-btn ${copied === fieldSteps[step - 1].key ? 'copied' : ''}`}
                >
                  {copied === fieldSteps[step - 1].key ? '✓' : '⎘'}
                </button>
                {/* Show ad only for the current field if needed */}
                {fieldSteps[step - 1].key === 'server' && showUrlAd && !showAdModal && <InContentAd slot="7640162739" />}
                {fieldSteps[step - 1].key === 'username' && showUsernameAd && !showAdModal && <InContentAd slot="7640162739" />}
                {fieldSteps[step - 1].key === 'expiry' && showExpiryAd && !showAdModal && <InContentAd slot="7640162739" />}
              </div>
            </>
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
            </div>
          )}
        </div>
        <div className="button-container">
          {step > 0 && step < 6 && (
            <button onClick={handleNextStep} className="next-btn">
              NEXT STEP
            </button>
          )}
          {step === 6 && (
            <>
              <button onClick={copyAllFields} className={`copy-all-btn${copyAllState ? ' copied' : ''}`}>{copyAllState ? 'COPIED!' : 'COPY ALL'}</button>
              <button onClick={resetForm} className="done-btn">DONE</button>
              <button onClick={handleCheckServer} className="check-btn" disabled={checkServerLoading}>{checkServerLoading ? 'CHECKING...' : 'CHECK SERVER'}</button>
            </>
          )}
        </div>
        {step === 6 && checkServerResult && (
          <div style={{ textAlign: 'center', marginTop: 12, color: checkServerResult.success ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>
            {checkServerResult.message}
          </div>
        )}
        <div className="branding">Xtream-Generator.Com</div>
      </div>
    </div>
  );
};

export default IPTVGenerator;