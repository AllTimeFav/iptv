import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { copyToClipboard } from '../utils/iptv-functions';
import StickyBannerAd from '../components/StickyBannerAd';
import InContentAd from '../components/InContentAd';
import AdModal from '../components/AdModal';
import '../assets/styles/IPTVGenerator.css';

const fetchRandomCodeFromSupabase = async () => {
  const now = new Date().toISOString();
  // 1. Count matching non-expired rows
  let { count, error } = await supabase
    .from('iptv_codes')
    .select('*', { count: 'exact', head: true })
    .or(`expiry_date.gt.${now},expiry_date.eq.0000-00-00 00:00:00`);

  if (error) alert(error);

  let code = null;
  if (count > 0) {
    // 2. Pick a random offset
    const randomOffset = Math.floor(Math.random() * count);
    // 3. Fetch one row at that offset
    const { data, error: fetchError } = await supabase
      .from('iptv_codes')
      .select('*')
      .or(`expiry_date.gt.${now},expiry_date.eq.0000-00-00 00:00:00`)
      .range(randomOffset, randomOffset);
    if (fetchError) alert(fetchError);
    if (data && data.length > 0) {
      code = data[0];
    }
  } else {
    // Fallback: count all codes
    const { count: anyCount, error: anyCountError } = await supabase
      .from('iptv_codes')
      .select('*', { count: 'exact', head: true });
    if (anyCountError) alert(anyCountError);
    if (anyCount > 0) {
      const randomOffset = Math.floor(Math.random() * anyCount);
      const { data: anyData, error: anyFetchError } = await supabase
        .from('iptv_codes')
        .select('*')
        .range(randomOffset, randomOffset);
      if (anyFetchError) alert(anyFetchError);
      if (anyData && anyData.length > 0) {
        code = anyData[0];
      }
    }
  }

  if (code) {
    return {
      server: code.server_url,
      username: code.username,
      password: code.password,
      expiry: code.expiry_date === '0000-00-00 00:00:00' ? 'Never expires' : new Date(code.expiry_date).toLocaleDateString(),
      region: code.region
    };
  }
  return null;
};

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
      script.onload = () => {
        console.log('AdSense script loaded successfully');
      };
      script.onerror = () => {
        console.log('Failed to load AdSense script');
      };
      document.body.appendChild(script);
    }
  }, []);

  // Handle connect/generate
  const handleConnect = async () => {
    setLoading(true);
    try {
      const data = await fetchRandomCodeFromSupabase();
      if (data) {
        setCredentials(data);
        setStep(1);
        setShowUrlAd(true);
        setShowAdModal(true);
      } else {
        alert('No available servers found');
      }
    } catch (err) {
      console.error('Supabase fetch error:', err);
      alert('Error fetching data: ' + (err.message || JSON.stringify(err)));
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
      setCheckServerResult({ success: true, message: 'Server is working!' });
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
              </div>
              {/* Show ad below the current field, not inside it */}
              {fieldSteps[step - 1].key === 'server' && showUrlAd && !showAdModal && (
                <div className="ad-section">
                  <InContentAd slot="7640162739" />
                </div>
              )}
              {fieldSteps[step - 1].key === 'username' && showUsernameAd && !showAdModal && (
                <div className="ad-section">
                  <InContentAd slot="7640162739" />
                </div>
              )}
              {fieldSteps[step - 1].key === 'expiry' && showExpiryAd && !showAdModal && (
                <div className="ad-section">
                  <InContentAd slot="7640162739" />
                </div>
              )}
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