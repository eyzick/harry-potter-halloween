import React, { useState, useCallback } from 'react';
import './InvitationCard.css';
import RSVPForm from './RSVPForm';
import { 
  CalendarIcon, 
  ClockIcon, 
  HomeIcon, 
  StarIcon,
  MixerHorizontalIcon,
  CameraIcon,
  SpeakerLoudIcon,
  CookieIcon
} from '@radix-ui/react-icons';

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
              src="./house-crest.png" 
              alt="Hogwarts School Crest" 
              className="crest-image"
            />
          </div>
          
          <h1 className="invitation-title">You're Invited!</h1>
          <h2 className="party-title">Harry Potter Halloween Party</h2>
          
          <div className="invitation-details">
            <div className="detail-item">
              <span className="detail-label">
                <CalendarIcon className="icon" /> Date:
              </span>
              <span className="detail-value">October 31st, 2025</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <ClockIcon className="icon" /> Time:
              </span>
              <span className="detail-value">8:00 PM</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <HomeIcon className="icon" /> Location:
              </span>
              <span className="detail-value">1212 Summerfield Dr, Herndon VA 20170</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <StarIcon className="icon" /> Dress Code:
              </span>
              <span className="detail-value">In costume! Magical dressware optional.</span>
            </div>
          </div>

          <div className="party-description">
            <p>Join us for a magical evening filled with:</p>
            <ul>
              <li><MixerHorizontalIcon className="icon" /> Potion station</li>
              <li><CookieIcon className="icon" /> Butterbeer pong</li>
              <li><CameraIcon className="icon" /> House Cup Competition</li>
              <li><SpeakerLoudIcon className="icon" /> Magical music and dancing</li>
              <li><CookieIcon className="icon" /> Enchanted treats and cauldron cakes</li>
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
