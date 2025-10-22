import React, { useState, useEffect } from 'react';
import './ReminderManager.css';
import { StoredRSVP } from '../services/dataService';
import { 
  createReminderPreviews, 
  sendReminderEmails, 
  ReminderPreview, 
  ReminderResult,
  PARTY_DETAILS 
} from '../services/reminderService';
import { 
  EnvelopeClosedIcon, 
  EyeOpenIcon, 
  CheckIcon, 
  Cross2Icon,
  ExclamationTriangleIcon
} from '@radix-ui/react-icons';

interface ReminderManagerProps {
  rsvps: StoredRSVP[];
}

const ReminderManager: React.FC<ReminderManagerProps> = ({ rsvps }) => {
  const [previews, setPreviews] = useState<ReminderPreview[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<ReminderPreview | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<ReminderResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const attendingRsvps = rsvps.filter(rsvp => rsvp.attending);

  useEffect(() => {
    if (attendingRsvps.length > 0) {
      const newPreviews = createReminderPreviews(rsvps);
      setPreviews(newPreviews);
    }
  }, [rsvps, attendingRsvps.length]);

  const handlePreviewClick = (preview: ReminderPreview) => {
    setSelectedPreview(preview);
  };

  const handleClosePreview = () => {
    setSelectedPreview(null);
  };

  const handleSendReminders = async () => {
    if (attendingRsvps.length === 0) {
      alert('No attending guests to send reminders to.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send reminder emails to ${attendingRsvps.length} attending guests? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsSending(true);
    setShowResults(false);

    try {
      const results = await sendReminderEmails(rsvps);
      setSendResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to send reminder emails:', error);
      alert('Failed to send reminder emails. Please check the console for details.');
    } finally {
      setIsSending(false);
    }
  };

  const successfulSends = sendResults.filter(r => r.success).length;
  const failedSends = sendResults.filter(r => !r.success).length;

  return (
    <div className="reminder-manager">
      <div className="reminder-header">
        <h3>
          <EnvelopeClosedIcon className="icon" />
          Send Party Reminders
        </h3>
        <div className="reminder-stats">
          <span className="stat-item">
            <strong>{attendingRsvps.length}</strong> attending guests
          </span>
          <span className="stat-item">
            <strong>{rsvps.length - attendingRsvps.length}</strong> not attending
          </span>
        </div>
      </div>

        <div className="reminder-content">
          <div className="party-info-section">
          <h4>Party Details</h4>
          <div className="party-info-grid">
            <div className="info-item">
              <span className="label">Date:</span>
              <span className="value">{PARTY_DETAILS.date}</span>
            </div>
            <div className="info-item">
              <span className="label">Time:</span>
              <span className="value">{PARTY_DETAILS.time}</span>
            </div>
            <div className="info-item">
              <span className="label">Location:</span>
              <span className="value">{PARTY_DETAILS.address}</span>
            </div>
            <div className="info-item">
              <span className="label">Parking:</span>
              <span className="value">{PARTY_DETAILS.streetParking}</span>
            </div>
          </div>
        </div>

        <div className="reminder-actions">
          <div className="action-buttons">
            <button 
              className="preview-button"
              onClick={() => setSelectedPreview(previews[0] || null)}
              disabled={previews.length === 0}
            >
              <EyeOpenIcon className="icon" />
              Preview Email
            </button>
            <button 
              className="send-button"
              onClick={handleSendReminders}
              disabled={isSending || attendingRsvps.length === 0}
            >
              {isSending ? (
                <>
                  <div className="spinner"></div>
                  Sending...
                </>
              ) : (
                <>
                  <EnvelopeClosedIcon className="icon" />
                  Send Reminders ({attendingRsvps.length})
                </>
              )}
            </button>
          </div>

          {attendingRsvps.length === 0 && (
            <div className="no-attendees-warning">
              <ExclamationTriangleIcon className="icon" />
              No attending guests found. Reminders can only be sent to guests who RSVP'd as attending.
            </div>
          )}
        </div>

        {showResults && (
          <div className="send-results">
            <h4>Send Results</h4>
            <div className="results-summary">
              <div className={`result-stat success`}>
                <CheckIcon className="icon" />
                <span>{successfulSends} successful</span>
              </div>
              <div className={`result-stat ${failedSends > 0 ? 'error' : ''}`}>
                <Cross2Icon className="icon" />
                <span>{failedSends} failed</span>
              </div>
            </div>
            
            {failedSends > 0 && (
              <div className="failed-emails">
                <h5>Failed Emails:</h5>
                <ul>
                  {sendResults
                    .filter(r => !r.success)
                    .map((result, index) => (
                      <li key={index}>
                        <strong>{result.recipient}</strong>: {result.error}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {previews.length > 0 && (
          <div className="preview-list">
            <h4>Email Previews ({previews.length})</h4>
            <div className="preview-items">
              {previews.map((preview, index) => (
                <div 
                  key={index}
                  className="preview-item"
                  onClick={() => handlePreviewClick(preview)}
                >
                  <div className="preview-header">
                    <span className="recipient">{preview.recipient}</span>
                    <EyeOpenIcon className="icon" />
                  </div>
                  <div className="preview-subject">{preview.subject}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedPreview && (
        <div className="preview-modal">
          <div className="preview-modal-content">
            <div className="preview-modal-header">
              <h3>Email Preview</h3>
              <button className="close-button" onClick={handleClosePreview}>
                <Cross2Icon className="icon" />
              </button>
            </div>
            
            <div className="preview-modal-body">
              <div className="preview-info">
                <div className="info-item">
                  <span className="label">To:</span>
                  <span className="value">{selectedPreview.recipient}</span>
                </div>
                <div className="info-item">
                  <span className="label">Subject:</span>
                  <span className="value">{selectedPreview.subject}</span>
                </div>
              </div>
              
              <div className="preview-content">
                <div className="preview-tabs">
                  <button className="preview-tab active">HTML Preview</button>
                </div>
                <div className="preview-iframe-container">
                  <iframe
                    srcDoc={selectedPreview.htmlContent}
                    className="preview-iframe"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderManager;
