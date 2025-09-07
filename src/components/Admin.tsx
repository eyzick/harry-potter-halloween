import React, { useState, useEffect } from 'react';
import './Admin.css';
import { Cross2Icon, DownloadIcon, PersonIcon, CalendarIcon, StarIcon, TrashIcon } from '@radix-ui/react-icons';

interface StoredRSVP {
  id: string;
  timestamp: number;
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

interface CategorySummary {
  drinks: string[];
  snacks: string[];
  other: string[];
}

interface AdminProps {
  onClose: () => void;
}

const STORAGE_KEY = 'halloween-party-rsvps';

const getStoredRSVPs = (): StoredRSVP[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
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

const deleteRSVP = (rsvpId: string): void => {
  try {
    const storedRSVPs = getStoredRSVPs();
    const updatedRSVPs = storedRSVPs.filter(rsvp => rsvp.id !== rsvpId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRSVPs));
  } catch (error) {
    console.error('Error deleting RSVP:', error);
  }
};

const Admin: React.FC<AdminProps> = ({ onClose }) => {
  const [rsvps, setRsvps] = useState<StoredRSVP[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary>({
    drinks: [],
    snacks: [],
    other: []
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'summary'>('overview');

  useEffect(() => {
    const storedRsvps = getStoredRSVPs();
    const summary = getCategorySummary();
    setRsvps(storedRsvps);
    setCategorySummary(summary);
  }, []);

  const exportData = () => {
    const data = {
      rsvps: rsvps,
      summary: categorySummary,
      exportDate: new Date().toISOString(),
      totalRSVPs: rsvps.length,
      attendingCount: rsvps.filter(r => r.attending).length,
      totalGuests: rsvps.reduce((sum, r) => sum + (r.attending ? Number(r.guestCount) : 0), 0)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halloween-party-rsvps-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleDeleteRSVP = (rsvpId: string) => {
    if (window.confirm('Are you sure you want to delete this RSVP? This action cannot be undone.')) {
      deleteRSVP(rsvpId);
      // Refresh the data
      const storedRsvps = getStoredRSVPs();
      const summary = getCategorySummary();
      setRsvps(storedRsvps);
      setCategorySummary(summary);
    }
  };

  const attendingRsvps = rsvps.filter(r => r.attending);
  const totalGuests = attendingRsvps.reduce((sum, r) => sum + Number(r.guestCount), 0);

  return (
    <div className="admin-overlay">
      <div className="admin-content">
        <div className="admin-header">
          <h2>
            <StarIcon className="icon" />
            Admin Dashboard
          </h2>
          <div className="admin-actions">
            <button className="export-button" onClick={exportData}>
              <DownloadIcon className="icon" />
              Export Data
            </button>
            <button className="admin-close-button" onClick={onClose}>
              <Cross2Icon className="icon" />
            </button>
          </div>
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <PersonIcon className="icon" />
            Overview
          </button>
          <button 
            className={`admin-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <CalendarIcon className="icon" />
            All RSVPs
          </button>
          <button 
            className={`admin-tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <StarIcon className="icon" />
            Summary
          </button>
        </div>

        <div className="admin-body">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total RSVPs</h3>
                  <div className="stat-number">{rsvps.length}</div>
                </div>
                <div className="stat-card">
                  <h3>Attending</h3>
                  <div className="stat-number">{attendingRsvps.length}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Guests</h3>
                  <div className="stat-number">{totalGuests}</div>
                </div>
                <div className="stat-card">
                  <h3>Not Attending</h3>
                  <div className="stat-number">{rsvps.length - attendingRsvps.length}</div>
                </div>
              </div>

              <div className="quick-summary">
                <h3>What's Being Brought</h3>
                <div className="summary-categories">
                  <div className="summary-category">
                    <h4>Drinks ({categorySummary.drinks.length})</h4>
                    {categorySummary.drinks.length > 0 ? (
                      <ul>
                        {categorySummary.drinks.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-items">No drinks planned yet</p>
                    )}
                  </div>
                  
                  <div className="summary-category">
                    <h4>Snacks ({categorySummary.snacks.length})</h4>
                    {categorySummary.snacks.length > 0 ? (
                      <ul>
                        {categorySummary.snacks.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-items">No snacks planned yet</p>
                    )}
                  </div>
                  
                  <div className="summary-category">
                    <h4>Other ({categorySummary.other.length})</h4>
                    {categorySummary.other.length > 0 ? (
                      <ul>
                        {categorySummary.other.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-items">No other items planned yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="details-section">
              <h3>All RSVP Details</h3>
              <div className="rsvp-list">
                {rsvps.map((rsvp) => (
                  <div key={rsvp.id} className="rsvp-card">
                    <div className="rsvp-header">
                      <h4>{rsvp.name}</h4>
                      <div className="rsvp-header-actions">
                        <span className={`rsvp-status ${rsvp.attending ? 'attending' : 'not-attending'}`}>
                          {rsvp.attending ? 'Attending' : 'Not Attending'}
                        </span>
                        <button 
                          className="delete-rsvp-button"
                          onClick={() => handleDeleteRSVP(rsvp.id)}
                          title="Delete this RSVP"
                        >
                          <TrashIcon className="icon" />
                        </button>
                      </div>
                    </div>
                    <div className="rsvp-details">
                      <p><strong>Email:</strong> {rsvp.email}</p>
                      <p><strong>Guests:</strong> {rsvp.guestCount}</p>
                      <p><strong>Submitted:</strong> {formatDate(rsvp.timestamp)}</p>
                      {rsvp.dietaryRestrictions && <p><strong>Dietary:</strong> {rsvp.dietaryRestrictions}</p>}
                      {rsvp.bringingItems.length > 0 && (
                        <div className="bringing-items">
                          <strong>Bringing:</strong>
                          <ul>
                            {rsvp.bringingItems.map((item, index) => {
                              let displayText = item;
                              if (item === 'Drinks' && rsvp.drinksDetails) {
                                displayText = `${item}: ${rsvp.drinksDetails}`;
                              } else if (item === 'Snacks' && rsvp.snacksDetails) {
                                displayText = `${item}: ${rsvp.snacksDetails}`;
                              } else if (item === 'Other' && rsvp.otherDetails) {
                                displayText = `${item}: ${rsvp.otherDetails}`;
                              }
                              return <li key={index}>{displayText}</li>;
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {rsvps.length === 0 && (
                  <p className="no-rsvps">No RSVPs submitted yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="summary-section">
              <h3>Complete Summary</h3>
              <div className="summary-grid">
                <div className="summary-category-full">
                  <h4>🍷 Drinks ({categorySummary.drinks.length})</h4>
                  {categorySummary.drinks.length > 0 ? (
                    <ul>
                      {categorySummary.drinks.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-items">No drinks planned yet</p>
                  )}
                </div>
                
                <div className="summary-category-full">
                  <h4>🍪 Snacks ({categorySummary.snacks.length})</h4>
                  {categorySummary.snacks.length > 0 ? (
                    <ul>
                      {categorySummary.snacks.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-items">No snacks planned yet</p>
                  )}
                </div>
                
                <div className="summary-category-full">
                  <h4>⭐ Other ({categorySummary.other.length})</h4>
                  {categorySummary.other.length > 0 ? (
                    <ul>
                      {categorySummary.other.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-items">No other items planned yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
