import React, { useState, useCallback, useEffect } from 'react';
import './Letter.css';
import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons';

interface LetterProps {
  onOpen: () => void;
  onLetterClick?: () => void;
}

const Letter: React.FC<LetterProps> = ({ onOpen, onLetterClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [showOwl, setShowOwl] = useState(false);
  const [owlDelivered, setOwlDelivered] = useState(false);
  const [letterAppeared, setLetterAppeared] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOwl(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showOwl) {
      const timer = setTimeout(() => {
        setOwlDelivered(true);
        setShowOwl(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [showOwl]);

  useEffect(() => {
    if (owlDelivered) {
      const timer = setTimeout(() => {
        setLetterAppeared(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [owlDelivered]);

  const handleLetterClick = useCallback(() => {
    if (!owlDelivered) return;
    
    if (onLetterClick) {
      onLetterClick();
    }
    
    setTimeout(() => {
      setIsOpening(true);
    }, 100);
    
    setTimeout(() => {
      onOpen();
    }, 1500);
  }, [onOpen, onLetterClick, owlDelivered]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div className="letter-container">
      {owlDelivered && (
        <div 
          className={`letter ${isHovered ? 'hovered' : ''} ${isOpening ? 'opening' : ''} ${letterAppeared ? 'appeared' : ''}`}
          onClick={handleLetterClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
        <div className="letter-front">
          <div className="letter-content">
            <div className="recipient-address">
              <div className="address-line">Esteemed Witch or Wizard</div>
              <div className="address-line">The Muggle World</div>
              <div className="address-line">Earth</div>
            </div>
            
            <div className="sender-address">
              <div className="address-line">Hogwarts School</div>
              <div className="address-line">of Witchcraft and Wizardry</div>
              <div className="address-line">Scotland, UK</div>
            </div>
          </div>
          
          <div className="wax-seal">
            <div className="seal-circle">
              <div className="seal-design">
                <div className="hogwarts-letter">H</div>
                <div className="seal-details">
                  <div className="seal-line"></div>
                  <div className="seal-line"></div>
                  <div className="seal-line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="letter-back">
          <div className="envelope-pattern"></div>
        </div>
        </div>
      )}
      
      <div className="letter-instructions">
        <p>{owlDelivered ? "Click the letter to open your invitation" : "Waiting for owl delivery..."}</p>
        <div className="magical-sparkles">
          <StarFilledIcon className="icon" />
        </div>
      </div>
      
      {showOwl && (
        <div className="owl-delivery">
          <img 
            src={`${process.env.PUBLIC_URL}/hedwig.gif`} 
            alt="Hedwig delivering letter" 
            className="owl-gif"
          />
        </div>
      )}
      
      {isOpening && (
        <div className="opening-effects">
          <div className="sparkle sparkle-1">
            <StarFilledIcon className="icon" />
          </div>
          <div className="sparkle sparkle-2">
            <StarIcon className="icon" />
          </div>
          <div className="sparkle sparkle-3">
            <StarFilledIcon className="icon" />
          </div>
          <div className="sparkle sparkle-4">
            <StarIcon className="icon" />
          </div>
          <div className="sparkle sparkle-5">
            <StarFilledIcon className="icon" />
          </div>
          <div className="magical-dust"></div>
        </div>
      )}
    </div>
  );
};

export default Letter;
