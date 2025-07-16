import './App.css';
import IPTVGenerator from './pages/iptv_generator';
import { useAdBlocker } from './pages/useAdBlocker';
import AdBlockerPrompt from './pages/AdBlockerPrompt';
import React, { useEffect } from 'react';

function App() {
  const adBlocked = useAdBlocker();

  // Lock scroll when adBlocked
  useEffect(() => {
    if (adBlocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [adBlocked]);

  return (
    <div className="App">
      {adBlocked && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(20, 20, 20, 0.85)', zIndex: 30000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AdBlockerPrompt onClose={() => window.location.reload()} />
        </div>
      )}
      {/* Main app UI, blurred and unclickable if adBlocked */}
      <div style={adBlocked ? { pointerEvents: 'none', userSelect: 'none', filter: 'blur(2px)' } : {}}>
        <IPTVGenerator />
      </div>
    </div>
  );
}

export default App;
