import React, { useRef, useEffect, useState, useCallback } from 'react';

interface AudioManagerProps {
  isLetterOpened: boolean;
}

const AudioManager: React.FC<AudioManagerProps> = ({ isLetterOpened }) => {
  const voicyAudioRef = useRef<HTMLAudioElement>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const [voicyFiles] = useState([
    'troll.mp3',
    'yer_a_wizard.mp3',
    'welcome.mp3',
    'mail.mp3',
    'gryffindor.mp3',
  ]);
  const [hasPlayedVoicy, setHasPlayedVoicy] = useState(false);

  const playHedwigsTheme = useCallback(() => {
    console.log('Attempting to play Hedwig\'s Theme...');
    if (musicAudioRef.current) {
      musicAudioRef.current.src = '/audio/music/Hedwig\'s Theme.mp3';
      musicAudioRef.current.loop = true;
      
      musicAudioRef.current.onerror = () => {
        console.warn('Could not load Hedwig\'s Theme');
      };
      
      musicAudioRef.current.play().catch((error) => {
        console.warn('Background music playback failed:', error);
      });
    } else {
      console.warn('Music audio ref is null');
    }
  }, []);

  const playRandomVoicyClip = useCallback(() => {
    if (voicyAudioRef.current) {
      const randomFile = voicyFiles[Math.floor(Math.random() * voicyFiles.length)];
      voicyAudioRef.current.src = `/audio/voicy/${randomFile}`;
      voicyAudioRef.current.volume = 0.7;
      
      voicyAudioRef.current.onerror = () => {
        console.warn(`Could not load audio file: ${randomFile}`);
        setTimeout(() => {
          playHedwigsTheme();
        }, 1000);
      };
      
      voicyAudioRef.current.play().catch((error) => {
        console.warn('Audio playback failed:', error);
        setTimeout(() => {
          playHedwigsTheme();
        }, 1000);
      });
    }
  }, [voicyFiles, playHedwigsTheme]);

  useEffect(() => {
    if (isLetterOpened && !hasPlayedVoicy) {
      playRandomVoicyClip();
      setHasPlayedVoicy(true);
    }
  }, [isLetterOpened, hasPlayedVoicy, playRandomVoicyClip]);

  const handleVoicyEnded = () => {
    setTimeout(() => {
      playHedwigsTheme();
    }, 500);
  };

  return (
    <>
      <audio
        ref={voicyAudioRef}
        onEnded={handleVoicyEnded}
        preload="metadata"
      />
      
      <audio
        ref={musicAudioRef}
        preload="metadata"
      />
    </>
  );
};

export default AudioManager;
