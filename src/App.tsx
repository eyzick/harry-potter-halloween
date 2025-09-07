import React, { useState } from 'react';
import './App.css';
import Letter from './components/Letter';
import InvitationCard from './components/InvitationCard';
import AudioManager from './components/AudioManager';

function App() {
  const [isLetterOpened, setIsLetterOpened] = useState(false);

  const handleLetterOpen = () => {
    setIsLetterOpened(true);
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
            <Letter onOpen={handleLetterOpen} />
          </div>
        ) : (
          <div className="invitation-reveal">
            <InvitationCard />
          </div>
        )}
      </div>
      
      <AudioManager isLetterOpened={isLetterOpened} />
    </div>
  );
}

export default App;
