import React, { useState } from 'react';
import './RSVPForm.css';

interface RSVPData {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  dietaryRestrictions: string;
  costume: string;
}

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
    costume: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('RSVP Data:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="rsvp-form submitted">
        <div className="success-message">
          <h3>✨ Thank You! ✨</h3>
          <p>Your RSVP has been received! We can't wait to see you at the party!</p>
          <p>Expect your owl-delivered confirmation soon! 🦉</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rsvp-form">
      <button className="close-button" onClick={onClose}>
        ✕
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
              <label htmlFor="costume">What's your costume?</label>
              <input
                type="text"
                id="costume"
                name="costume"
                value={formData.costume}
                onChange={handleInputChange}
                placeholder="e.g., Harry Potter, Hermione, Dumbledore..."
              />
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
          </>
        )}

        <button type="submit" className="submit-button">
          Send RSVP
        </button>
      </form>
    </div>
  );
};

export default RSVPForm;
