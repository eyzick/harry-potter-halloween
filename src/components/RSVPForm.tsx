import React, { useState, useEffect } from 'react';
import './RSVPForm.css';
import { Cross2Icon, StarFilledIcon, StarIcon, CircleIcon, CookieIcon } from '@radix-ui/react-icons';
import { sendRSVPConfirmation, RSVPEmailData } from '../services/emailService';
import { saveRSVP, getCategorySummary, RSVPData, CategorySummary } from '../services/dataService';


interface RSVPFormProps {
  onClose: () => void;
}


const RSVPForm: React.FC<RSVPFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<RSVPData>({
    name: '',
    email: '',
    attending: true,
    guestCount: 1,
    dietaryRestrictions: '',
    bringingItems: {
      drinks: [],
      snacks: [],
      other: []
    }
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBringModalOpen, setIsBringModalOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'drinks' | 'snacks' | 'other'>('drinks');
  const [categorySummary, setCategorySummary] = useState<CategorySummary>({
    drinks: [],
    snacks: [],
    other: []
  });

  useEffect(() => {
    const loadCategorySummary = async () => {
      try {
        const summary = await getCategorySummary();
        setCategorySummary(summary);
      } catch (error) {
        console.error('Failed to load category summary:', error);
        // Set empty summary as fallback
        setCategorySummary({
          drinks: [],
          snacks: [],
          other: []
        });
      }
    };

    loadCategorySummary();
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
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    console.log('RSVP Data:', formData);
    
    try {
      // Save RSVP data
      const saveSuccess = await saveRSVP(formData);
      
      if (saveSuccess) {
        console.log('RSVP saved successfully to API');
      } else {
        console.warn('RSVP saved to localStorage (API not available)');
      }
      
      // Send confirmation email to the guest
      const emailData: RSVPEmailData = {
        ...formData,
        timestamp: Date.now()
      };
      
      const confirmationSent = await sendRSVPConfirmation(emailData);
      if (confirmationSent) {
        console.log('Confirmation email sent successfully');
      } else {
        console.warn('Failed to send confirmation email, but RSVP was saved');
      }

      // Refresh category summary
      const updatedSummary = await getCategorySummary();
      setCategorySummary(updatedSummary);
      
    } catch (error) {
      console.error('Error processing RSVP:', error);
      // Still show success message even if there were issues
    } finally {
      setIsSubmitting(false);
    }
    
    setIsSubmitted(true);
  };

  const handleAddItem = () => {
    if (newItem.trim() && !formData.bringingItems[selectedCategory].includes(newItem.trim())) {
      setFormData(prev => ({
        ...prev,
        bringingItems: {
          ...prev.bringingItems,
          [selectedCategory]: [...prev.bringingItems[selectedCategory], newItem.trim()]
        }
      }));
      setNewItem('');
    }
  };

  const handleRemoveItem = (category: 'drinks' | 'snacks' | 'other', itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      bringingItems: {
        ...prev.bringingItems,
        [category]: prev.bringingItems[category].filter(item => item !== itemToRemove)
      }
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
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
              {(formData.bringingItems.drinks.length > 0 || formData.bringingItems.snacks.length > 0 || formData.bringingItems.other.length > 0) && (
                <div className="selected-items">
                  <span className="selected-label">Items you're bringing:</span>
                  <div className="selected-items-list">
                    {formData.bringingItems.drinks.length > 0 && (
                      <div className="category-section">
                        <div className="category-header">
                          <CircleIcon className="category-icon" />
                          <span className="category-name">Drinks</span>
                        </div>
                        <div className="category-items">
                          {formData.bringingItems.drinks.map((item, index) => (
                            <div key={index} className="selected-item">
                              <span className="item-text">{item}</span>
                              <button 
                                type="button"
                                className="remove-item-button"
                                onClick={() => handleRemoveItem('drinks', item)}
                                title="Remove item"
                              >
                                <Cross2Icon className="remove-icon" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {formData.bringingItems.snacks.length > 0 && (
                      <div className="category-section">
                        <div className="category-header">
                          <CookieIcon className="category-icon" />
                          <span className="category-name">Snacks</span>
                        </div>
                        <div className="category-items">
                          {formData.bringingItems.snacks.map((item, index) => (
                            <div key={index} className="selected-item">
                              <span className="item-text">{item}</span>
                              <button 
                                type="button"
                                className="remove-item-button"
                                onClick={() => handleRemoveItem('snacks', item)}
                                title="Remove item"
                              >
                                <Cross2Icon className="remove-icon" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {formData.bringingItems.other.length > 0 && (
                      <div className="category-section">
                        <div className="category-header">
                          <StarIcon className="category-icon" />
                          <span className="category-name">Other</span>
                        </div>
                        <div className="category-items">
                          {formData.bringingItems.other.map((item, index) => (
                        <div key={index} className="selected-item">
                              <span className="item-text">{item}</span>
                              <button 
                                type="button"
                                className="remove-item-button"
                                onClick={() => handleRemoveItem('other', item)}
                                title="Remove item"
                              >
                                <Cross2Icon className="remove-icon" />
                              </button>
                            </div>
                          ))}
                        </div>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Sending RSVP...' : 'Send RSVP'}
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
                Help us make this party magical! Add specific items you'd like to bring (optional):
              </p>
              
              <div className="category-selection">
                <h4 className="category-selection-title">Select Category:</h4>
                <div className="category-buttons">
                  <button 
                    type="button"
                    className={`category-button ${selectedCategory === 'drinks' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('drinks')}
                  >
                    <CircleIcon className="icon" />
                    Drinks
                  </button>
                  <button 
                    type="button"
                    className={`category-button ${selectedCategory === 'snacks' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('snacks')}
                  >
                    <CookieIcon className="icon" />
                    Snacks
                  </button>
                  <button 
                    type="button"
                    className={`category-button ${selectedCategory === 'other' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('other')}
                  >
                    <StarIcon className="icon" />
                    Other
                  </button>
                </div>
              </div>
              
              <div className="add-item-section">
                <div className="add-item-input-container">
                  <input
                    type="text"
                    placeholder={`What ${selectedCategory} would you like to bring? (e.g., wine, beer, cookies...)`}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="add-item-input"
                  />
                  <button 
                    type="button"
                    className="add-item-button"
                    onClick={handleAddItem}
                    disabled={!newItem.trim()}
                  >
                    <StarIcon className="icon" />
                    Add
                  </button>
                </div>
              </div>

              {(formData.bringingItems.drinks.length > 0 || formData.bringingItems.snacks.length > 0 || formData.bringingItems.other.length > 0) && (
                <div className="current-items-section">
                  <h4 className="current-items-title">
                    <StarIcon className="icon" />
                    Items you're bringing:
                  </h4>
                  <div className="current-items-list">
                    {formData.bringingItems.drinks.length > 0 && (
                      <div className="current-category-section">
                        <div className="current-category-header">
                          <CircleIcon className="category-icon" />
                          <span className="category-name">Drinks</span>
                        </div>
                        <div className="current-category-items">
                          {formData.bringingItems.drinks.map((item, index) => (
                            <div key={index} className="current-item">
                              <span className="item-text">{item}</span>
                              <button 
                                type="button"
                                className="remove-item-button"
                                onClick={() => handleRemoveItem('drinks', item)}
                                title="Remove item"
                              >
                                <Cross2Icon className="remove-icon" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {formData.bringingItems.snacks.length > 0 && (
                      <div className="current-category-section">
                        <div className="current-category-header">
                          <CookieIcon className="category-icon" />
                          <span className="category-name">Snacks</span>
                        </div>
                        <div className="current-category-items">
                          {formData.bringingItems.snacks.map((item, index) => (
                            <div key={index} className="current-item">
                              <span className="item-text">{item}</span>
                              <button 
                                type="button"
                                className="remove-item-button"
                                onClick={() => handleRemoveItem('snacks', item)}
                                title="Remove item"
                              >
                                <Cross2Icon className="remove-icon" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {formData.bringingItems.other.length > 0 && (
                      <div className="current-category-section">
                        <div className="current-category-header">
                          <StarIcon className="category-icon" />
                          <span className="category-name">Other</span>
                        </div>
                        <div className="current-category-items">
                          {formData.bringingItems.other.map((item, index) => (
                            <div key={index} className="current-item">
                              <span className="item-text">{item}</span>
                              <button 
                                type="button"
                                className="remove-item-button"
                                onClick={() => handleRemoveItem('other', item)}
                                title="Remove item"
                              >
                                <Cross2Icon className="remove-icon" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
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
