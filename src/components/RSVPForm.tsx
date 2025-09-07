import React, { useState, useEffect } from 'react';
import './RSVPForm.css';
import { Cross2Icon, StarFilledIcon, StarIcon, CircleIcon, CookieIcon } from '@radix-ui/react-icons';
import { sendRSVPNotification, sendRSVPConfirmation, RSVPEmailData } from '../services/emailService';

interface RSVPData {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  dietaryRestrictions: string;
  bringingItems: string[];
  drinksDetails: string;
  snacksDetails: string;
  otherDetails: string;
}

interface StoredRSVP extends RSVPData {
  id: string;
  timestamp: number;
}

interface CategorySummary {
  drinks: string[];
  snacks: string[];
  other: string[];
}

interface RSVPFormProps {
  onClose: () => void;
}

// Utility functions for localStorage
const STORAGE_KEY = 'halloween-party-rsvps';

const saveRSVP = (rsvpData: RSVPData): void => {
  const storedRSVPs = getStoredRSVPs();
  const newRSVP: StoredRSVP = {
    ...rsvpData,
    id: Date.now().toString(),
    timestamp: Date.now()
  };
  storedRSVPs.push(newRSVP);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storedRSVPs));
};

const getStoredRSVPs = (): StoredRSVP[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Ensure guestCount is always a number
    return parsed.map((rsvp: any) => ({
      ...rsvp,
      guestCount: Number(rsvp.guestCount) || 1
    }));
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const getCategorySummary = (): CategorySummary => {
  const rsvps = getStoredRSVPs();
  const summary: CategorySummary = {
    drinks: [],
    snacks: [],
    other: []
  };

  rsvps.forEach(rsvp => {
    if (rsvp.attending) {
      rsvp.bringingItems.forEach(item => {
        switch (item) {
          case 'Drinks':
            if (rsvp.drinksDetails) {
              summary.drinks.push(`${rsvp.name}: ${rsvp.drinksDetails}`);
            }
            break;
          case 'Snacks':
            if (rsvp.snacksDetails) {
              summary.snacks.push(`${rsvp.name}: ${rsvp.snacksDetails}`);
            }
            break;
          case 'Other':
            if (rsvp.otherDetails) {
              summary.other.push(`${rsvp.name}: ${rsvp.otherDetails}`);
            }
            break;
        }
      });
    }
  });

  return summary;
};

const RSVPForm: React.FC<RSVPFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<RSVPData>({
    name: '',
    email: '',
    attending: true,
    guestCount: 1,
    dietaryRestrictions: '',
    bringingItems: [],
    drinksDetails: '',
    snacksDetails: '',
    otherDetails: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBringModalOpen, setIsBringModalOpen] = useState(false);
  const [categorySummary, setCategorySummary] = useState<CategorySummary>({
    drinks: [],
    snacks: [],
    other: []
  });

  useEffect(() => {
    setCategorySummary(getCategorySummary());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('RSVP Data:', formData);
    
    saveRSVP(formData);
    
    const emailData: RSVPEmailData = {
      ...formData,
      timestamp: Date.now()
    };
    
    try {
      // Send notification to organizers
      const notificationSent = await sendRSVPNotification(emailData);
      if (notificationSent) {
        console.log('Email notification sent successfully');
      } else {
        console.warn('Failed to send email notification, but RSVP was saved');
      }

      // Send confirmation to the guest
      const confirmationSent = await sendRSVPConfirmation(emailData);
      if (confirmationSent) {
        console.log('Confirmation email sent successfully');
      } else {
        console.warn('Failed to send confirmation email, but RSVP was saved');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      // Don't prevent form submission if email fails
    }
    
    setCategorySummary(getCategorySummary());
    
    setIsSubmitted(true);
  };

  const handleBringItemToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      bringingItems: prev.bringingItems.includes(item)
        ? prev.bringingItems.filter(i => i !== item)
        : [...prev.bringingItems, item]
    }));
  };

  const openBringModal = () => {
    setIsBringModalOpen(true);
    setTimeout(() => {
      window.scrollTo({
        top: window.innerHeight * 0.33,
        behavior: 'smooth'
      });
    }, 100);
  };

  const closeBringModal = () => {
    setIsBringModalOpen(false);
  };

  if (isSubmitted) {
    return (
      <div className="rsvp-form submitted">
        <div className="success-message">
          <h3><StarFilledIcon className="icon" /> Thank You! <StarFilledIcon className="icon" /></h3>
          <p>Your RSVP has been received! We can't wait to see you at the party!</p>
          <p>Expect your owl-delivered confirmation soon! <StarIcon className="icon" /></p>
        </div>
      </div>
    );
  }

  return (
    <div className="rsvp-form">
      <button className="close-button" onClick={onClose}>
        <Cross2Icon className="icon" />
      </button>
      <h3>RSVP to the Party</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter your magical name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="your.email@owlmail.com"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="attending"
              checked={formData.attending}
              onChange={handleInputChange}
            />
            I will attend the Harry Potter Halloween Party
          </label>
        </div>

        {formData.attending && (
          <>
            <div className="form-group">
              <label htmlFor="guestCount">Number of Guests</label>
              <select
                id="guestCount"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleInputChange}
              >
                <option value={1}>Just me</option>
                <option value={2}>Me + 1 guest</option>
                <option value={3}>Me + 2 guests</option>
                <option value={4}>Me + 3 guests</option>
                <option value={5}>Me + 4 guests</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dietaryRestrictions">Dietary Restrictions</label>
              <textarea
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={handleInputChange}
                placeholder="Any allergies or dietary needs we should know about?"
                rows={3}
              />
            </div>

            <div className="form-group">
              <button type="button" className="bring-items-button" onClick={openBringModal}>
                <StarIcon className="icon" />
                What should I bring?
              </button>
              {formData.bringingItems.length > 0 && (
                <div className="selected-items">
                  <span className="selected-label">Selected:</span>
                  <div className="selected-items-list">
                    {formData.bringingItems.map((item, index) => {
                      let displayText = item;
                      
                      if (item === 'Drinks' && formData.drinksDetails) {
                        displayText = `${item}: ${formData.drinksDetails}`;
                      } else if (item === 'Snacks' && formData.snacksDetails) {
                        displayText = `${item}: ${formData.snacksDetails}`;
                      } else if (item === 'Other' && formData.otherDetails) {
                        displayText = `${item}: ${formData.otherDetails}`;
                      }
                      
                      return (
                        <div key={index} className="selected-item">
                          {displayText}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <button type="submit" className="submit-button">
          Send RSVP
        </button>
      </form>

      {isBringModalOpen && (
        <div className="modal-overlay" onClick={closeBringModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>What should I bring?</h3>
              <button className="modal-close-button" onClick={closeBringModal}>
                <Cross2Icon className="icon" />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Help us make this party magical! Choose what you'd like to contribute (optional):
              </p>
              
              {(categorySummary.drinks.length > 0 || categorySummary.snacks.length > 0 || 
                categorySummary.other.length > 0) && (
                <div className="summary-section">
                  <h4 className="summary-title">
                    <StarIcon className="icon" />
                    What's Already Being Brought:
                  </h4>
                  
                  {categorySummary.drinks.length > 0 && (
                    <div className="summary-category">
                      <div className="summary-category-header">
                        <CircleIcon className="summary-icon" />
                        <span>Drinks</span>
                      </div>
                      <div className="summary-items">
                        {categorySummary.drinks.map((item, index) => (
                          <div key={index} className="summary-item">{item}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {categorySummary.snacks.length > 0 && (
                    <div className="summary-category">
                      <div className="summary-category-header">
                        <CookieIcon className="summary-icon" />
                        <span>Snacks</span>
                      </div>
                      <div className="summary-items">
                        {categorySummary.snacks.map((item, index) => (
                          <div key={index} className="summary-item">{item}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {categorySummary.other.length > 0 && (
                    <div className="summary-category">
                      <div className="summary-category-header">
                        <StarIcon className="summary-icon" />
                        <span>Other</span>
                      </div>
                      <div className="summary-items">
                        {categorySummary.other.map((item, index) => (
                          <div key={index} className="summary-item">{item}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bring-options">
                <div className="bring-option-container">
                  <label className="bring-option" data-tooltip={categorySummary.drinks.length > 0 ? categorySummary.drinks.join('\n') : 'No drinks planned yet'}>
                    <input
                      type="checkbox"
                      checked={formData.bringingItems.includes('Drinks')}
                      onChange={() => handleBringItemToggle('Drinks')}
                    />
                    <CircleIcon className="option-icon" />
                    <span>Drinks</span>
                    {categorySummary.drinks.length > 0 && (
                      <span className="tooltip-indicator">({categorySummary.drinks.length})</span>
                    )}
                  </label>
                  {formData.bringingItems.includes('Drinks') && (
                    <div className="option-details">
                      <input
                        type="text"
                        placeholder="What drinks will you bring? (e.g., Butterbeer, Pumpkin Juice, etc.)"
                        value={formData.drinksDetails}
                        onChange={(e) => setFormData(prev => ({ ...prev, drinksDetails: e.target.value }))}
                        className="details-input"
                      />
                    </div>
                  )}
                </div>

                <div className="bring-option-container">
                  <label className="bring-option" data-tooltip={categorySummary.snacks.length > 0 ? categorySummary.snacks.join('\n') : 'No snacks planned yet'}>
                    <input
                      type="checkbox"
                      checked={formData.bringingItems.includes('Snacks')}
                      onChange={() => handleBringItemToggle('Snacks')}
                    />
                    <CookieIcon className="option-icon" />
                    <span>Snacks</span>
                    {categorySummary.snacks.length > 0 && (
                      <span className="tooltip-indicator">({categorySummary.snacks.length})</span>
                    )}
                  </label>
                  {formData.bringingItems.includes('Snacks') && (
                    <div className="option-details">
                      <input
                        type="text"
                        placeholder="What snacks will you bring? (e.g., Chocolate Frogs, Bertie Bott's Beans, etc.)"
                        value={formData.snacksDetails}
                        onChange={(e) => setFormData(prev => ({ ...prev, snacksDetails: e.target.value }))}
                        className="details-input"
                      />
                    </div>
                  )}
                </div>

                <div className="bring-option-container">
                  <label className="bring-option" data-tooltip={categorySummary.other.length > 0 ? categorySummary.other.join('\n') : 'No other items planned yet'}>
                    <input
                      type="checkbox"
                      checked={formData.bringingItems.includes('Other')}
                      onChange={() => handleBringItemToggle('Other')}
                    />
                    <StarIcon className="option-icon" />
                    <span>Other</span>
                    {categorySummary.other.length > 0 && (
                      <span className="tooltip-indicator">({categorySummary.other.length})</span>
                    )}
                  </label>
                  {formData.bringingItems.includes('Other') && (
                    <div className="option-details">
                      <input
                        type="text"
                        placeholder="What else would you like to bring?"
                        value={formData.otherDetails}
                        onChange={(e) => setFormData(prev => ({ ...prev, otherDetails: e.target.value }))}
                        className="details-input"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-confirm-button" onClick={closeBringModal}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RSVPForm;
