import React, { useState, useCallback } from 'react';
import './InvitationCard.css';
import RSVPForm from './RSVPForm';

const InvitationCard: React.FC = () => {
  const [showRSVP, setShowRSVP] = useState(false);

  const handleRSVPClick = useCallback(() => {
    const newShowRSVP = !showRSVP;
    setShowRSVP(newShowRSVP);
    
    if (newShowRSVP) {
      setTimeout(() => {
        const scrollPosition = window.innerHeight * 0.25;
        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }, 250);
    }
  }, [showRSVP]);

  return (
    <div className="invitation-card">
      <div className="card-border">
        <div className="card-content">
          <div className="hogwarts-crest">
            <img 
              src="/house-crest.png" 
              alt="Hogwarts School Crest" 
              className="crest-image"
            />
          </div>
          
          <h1 className="invitation-title">You're Invited!</h1>
          <h2 className="party-title">Harry Potter Halloween Party</h2>
          
          <div className="invitation-details">
            <div className="detail-item">
              <span className="detail-label">📅 Date:</span>
              <span className="detail-value">October 31st, 2024</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🕰️ Time:</span>
              <span className="detail-value">7:00 PM - Midnight</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🏰 Location:</span>
              <span className="detail-value">123 Diagon Alley, Hogsmeade</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">👻 Dress Code:</span>
              <span className="detail-value">Wizarding World Costumes Encouraged!</span>
            </div>
          </div>

          <div className="party-description">
            <p>Join us for a magical evening filled with:</p>
            <ul>
              <li>✨ Potion-making station</li>
              <li>🎃 Pumpkin carving contest</li>
              <li>🍺 Butterbeer tasting</li>
              <li>🎭 Costume contest with prizes</li>
              <li>🎵 Magical music and dancing</li>
              <li>🍰 Enchanted treats and cauldron cakes</li>
            </ul>
          </div>

          <div className="rsvp-section">
            <button 
              className="rsvp-button"
              onClick={handleRSVPClick}
            >
              {showRSVP ? 'Hide RSVP Form' : 'RSVP Now'}
            </button>
          </div>
        </div>
      </div>
      
      {showRSVP && (
        <div className="rsvp-overlay">
          <RSVPForm onClose={() => setShowRSVP(false)} />
        </div>
      )}
    </div>
  );
};

export default InvitationCard;
