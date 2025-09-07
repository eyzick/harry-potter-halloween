import React, { useState, useCallback } from 'react';
import './Letter.css';
import { StarFilledIcon, StarIcon } from '@radix-ui/react-icons';

interface LetterProps {
  onOpen: () => void;
  onLetterClick?: () => void;
}

const Letter: React.FC<LetterProps> = ({ onOpen, onLetterClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleLetterClick = useCallback(() => {
    if (onLetterClick) {
      onLetterClick();
    }
    
    setTimeout(() => {
      setIsOpening(true);
    }, 100);
    
    setTimeout(() => {
      onOpen();
    }, 1500);
  }, [onOpen, onLetterClick]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div className="letter-container">
      <div 
        className={`letter ${isHovered ? 'hovered' : ''} ${isOpening ? 'opening' : ''}`}
        onClick={handleLetterClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="letter-front">
          <div className="letter-content">
            <div className="recipient-address">
              <div className="address-line">Mr. or Ms. Guest</div>
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
      
      <div className="letter-instructions">
        <p>Click the letter to open your invitation</p>
        <div className="magical-sparkles">
          <StarFilledIcon className="icon" />
        </div>
      </div>
      
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
