import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

interface AudioManagerProps {
  isLetterOpened: boolean;
  onMuteToggle?: (isMuted: boolean) => void;
}

interface AudioManagerRef {
  playLetterClickSound: () => void;
}

const AudioManager = forwardRef<AudioManagerRef, AudioManagerProps>(({ isLetterOpened, onMuteToggle }, ref) => {
  const voicyAudioRef = useRef<HTMLAudioElement>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const [hasPlayedVoicy, setHasPlayedVoicy] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const playHedwigsTheme = useCallback(() => {
    if (isMuted) return;
    
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
  }, [isMuted]);

  useEffect(() => {
    if (isLetterOpened && !hasPlayedVoicy) {
      setHasPlayedVoicy(true);
      setTimeout(() => {
        playHedwigsTheme();
      }, 500);
    }
  }, [isLetterOpened, hasPlayedVoicy, playHedwigsTheme]);

  const handleVoicyEnded = () => {
    setTimeout(() => {
      playHedwigsTheme();
    }, 500);
  };

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState && musicAudioRef.current) {
      musicAudioRef.current.pause();
    } else if (!newMutedState && musicAudioRef.current && musicAudioRef.current.src) {
      musicAudioRef.current.play().catch((error) => {
        console.warn('Failed to resume music:', error);
      });
    }
    
    if (onMuteToggle) {
      onMuteToggle(newMutedState);
    }
  }, [isMuted, onMuteToggle]);

  const playLetterClickSound = useCallback(() => {
    if (isMuted) return;
    
    if (voicyAudioRef.current) {
      const voicyFiles = [
        'troll.mp3',
        'yer_a_wizard.mp3',
        'welcome.mp3',
        'mail.mp3',
        'gryffindor.mp3',
      ];
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
  }, [isMuted, playHedwigsTheme]);

  useImperativeHandle(ref, () => ({
    playLetterClickSound
  }), [playLetterClickSound]);

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
      
      <button
        className="mute-button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        title={isMuted ? "Unmute Hedwig's Theme" : "Mute Hedwig's Theme"}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </>
  );
});

export default AudioManager;
