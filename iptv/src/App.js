import './App.css';
import IPTVGenerator from './pages/iptv_generator';
import { useAdBlocker } from './pages/useAdBlocker';
import AdBlockerPrompt from './pages/AdBlockerPrompt';
import React, { useState } from 'react';

function App() {
  const adBlocked = useAdBlocker();
  const [showPrompt, setShowPrompt] = useState(true);

  const handleClosePrompt = () => {
    setShowPrompt(false);
    window.location.reload();
  };

  return (
    <div className="App">
      {adBlocked && showPrompt && <AdBlockerPrompt onClose={handleClosePrompt} />}
      <IPTVGenerator />
    </div>
  );
}

export default App;
