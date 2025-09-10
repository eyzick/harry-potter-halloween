import React, { useState, useEffect } from 'react';
import './Admin.css';
import { Cross2Icon, DownloadIcon, PersonIcon, CalendarIcon, StarIcon, TrashIcon } from '@radix-ui/react-icons';
import { getRSVPs, deleteRSVP, getCategorySummary, StoredRSVP, CategorySummary, getStorageMethod } from '../services/dataService';


interface AdminProps {
  onClose: () => void;
}


const Admin: React.FC<AdminProps> = ({ onClose }) => {
  const [rsvps, setRsvps] = useState<StoredRSVP[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary>({
    drinks: [],
    snacks: [],
    other: []
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'summary'>('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedRsvps, summary] = await Promise.all([
          getRSVPs(),
          getCategorySummary()
        ]);
        setRsvps(storedRsvps);
        setCategorySummary(summary);
      } catch (error) {
        console.error('Failed to load admin data:', error);
        // Set empty data as fallback
        setRsvps([]);
        setCategorySummary({
          drinks: [],
          snacks: [],
          other: []
        });
      }
    };

    loadData();
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

  const handleDeleteRSVP = async (rsvpId: string) => {
    if (window.confirm('Are you sure you want to delete this RSVP? This action cannot be undone.')) {
      try {
        const deleteSuccess = await deleteRSVP(rsvpId);
        
        if (deleteSuccess) {
          console.log('RSVP deleted successfully from API');
        } else {
          console.warn('RSVP deleted from localStorage (API not available)');
        }

        // Refresh the data
        const [storedRsvps, summary] = await Promise.all([
          getRSVPs(),
          getCategorySummary()
        ]);
        setRsvps(storedRsvps);
        setCategorySummary(summary);
      } catch (error) {
        console.error('Failed to delete RSVP:', error);
      }
    }
  };

  const attendingRsvps = rsvps.filter(r => r.attending);
  const totalGuests = attendingRsvps.reduce((sum, r) => sum + Number(r.guestCount), 0);
  const storageMethod = getStorageMethod();

  return (
    <div className="admin-overlay">
      <div className="admin-content">
        <div className="admin-header">
          <h2>
            <StarIcon className="icon" />
            Admin Dashboard
          </h2>
          <div className="admin-actions">
            <div className="storage-indicator">
              <span className={`storage-badge ${storageMethod}`}>
                {storageMethod === 'api' ? '🌐 API Storage' : '💾 Local Storage'}
              </span>
            </div>
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
                      {rsvp.bringingItems && 
                       (rsvp.bringingItems.drinks?.length > 0 || rsvp.bringingItems.snacks?.length > 0 || rsvp.bringingItems.other?.length > 0) && (
                        <div className="bringing-items">
                          <strong>Bringing:</strong>
                          <ul>
                            {rsvp.bringingItems.drinks?.length > 0 && (
                              <li>
                                <strong>Drinks:</strong>
                                <ul>
                                  {rsvp.bringingItems.drinks.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </li>
                            )}
                            {rsvp.bringingItems.snacks?.length > 0 && (
                              <li>
                                <strong>Snacks:</strong>
                                <ul>
                                  {rsvp.bringingItems.snacks.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </li>
                            )}
                            {rsvp.bringingItems.other?.length > 0 && (
                              <li>
                                <strong>Other:</strong>
                                <ul>
                                  {rsvp.bringingItems.other.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </li>
                            )}
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
