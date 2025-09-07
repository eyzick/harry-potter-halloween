import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Letter from './components/Letter';
import InvitationCard from './components/InvitationCard';
import AudioManager from './components/AudioManager';
import Admin from './components/Admin';
import PasswordPrompt from './components/PasswordPrompt';

function App() {
  const [isLetterOpened, setIsLetterOpened] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const audioManagerRef = useRef<{ playLetterClickSound: () => void }>(null);

  useEffect(() => {
    const checkAdminAccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') {
        setShowPasswordPrompt(true);
      }
    };

    checkAdminAccess();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowPasswordPrompt(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLetterOpen = () => {
    setIsLetterOpened(true);
  };

  const handleLetterClick = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.playLetterClickSound();
    }
  };

  const handlePasswordSuccess = () => {
    setShowPasswordPrompt(false);
    setIsAdminOpen(true);
  };

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  };

  const handleAdminClose = () => {
    setIsAdminOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="App">
      <div className="magical-background">
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>
      
      <div className="container">
        {!isLetterOpened ? (
          <div className="letter-opening">
            <Letter onOpen={handleLetterOpen} onLetterClick={handleLetterClick} />
          </div>
        ) : (
          <div className="invitation-reveal">
            <InvitationCard />
          </div>
        )}
      </div>
      
      <AudioManager ref={audioManagerRef} isLetterOpened={isLetterOpened} />
      
      {showPasswordPrompt && (
        <PasswordPrompt 
          onSuccess={handlePasswordSuccess} 
          onCancel={handlePasswordCancel} 
        />
      )}
      
      {isAdminOpen && <Admin onClose={handleAdminClose} />}
    </div>
  );
}

export default App;
