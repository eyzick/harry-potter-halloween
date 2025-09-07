import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_ekdqhnd';
const EMAILJS_TEMPLATE_ID = 'template_l0xqkzl';
const EMAILJS_CONFIRMATION_TEMPLATE_ID = 'template_ya1y8zy';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

if (!EMAILJS_PUBLIC_KEY) {
  console.error('REACT_APP_EMAILJS_PUBLIC_KEY environment variable is not set. Please configure it in your GitHub Pages secrets.');
}

const RECIPIENT_EMAILS = ['meganannben@gmail.com'];

export interface RSVPEmailData {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  dietaryRestrictions: string;
  bringingItems: string[];
  drinksDetails: string;
  snacksDetails: string;
  otherDetails: string;
  timestamp: number;
}

export const sendRSVPNotification = async (rsvpData: RSVPEmailData): Promise<boolean> => {
  try {
    if (!EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS public key not configured. Cannot send notification email.');
      return false;
    }

    emailjs.init(EMAILJS_PUBLIC_KEY);

    const bringingItemsText = rsvpData.bringingItems.length > 0 
      ? rsvpData.bringingItems.map(item => {
          switch (item) {
            case 'Drinks':
              return `• Drinks: ${rsvpData.drinksDetails || 'No details provided'}`;
            case 'Snacks':
              return `• Snacks: ${rsvpData.snacksDetails || 'No details provided'}`;
            case 'Other':
              return `• Other: ${rsvpData.otherDetails || 'No details provided'}`;
            default:
              return `• ${item}`;
          }
        }).join('\n')
      : 'None';

    const emailContent = `
New RSVP Submission for Harry Potter Halloween Party

Guest Information:
• Name: ${rsvpData.name}
• Email: ${rsvpData.email}
• Attending: ${rsvpData.attending ? 'Yes' : 'No'}
• Number of Guests: ${rsvpData.guestCount}
• Dietary Restrictions: ${rsvpData.dietaryRestrictions || 'None'}

Items Being Brought:
${bringingItemsText}

Submission Details:
• Submitted: ${new Date(rsvpData.timestamp).toLocaleString()}
• RSVP ID: ${rsvpData.timestamp}

---
This email was automatically generated from the Harry Potter Halloween Party RSVP system.
    `.trim();

    // Send email to each recipient
    const emailPromises = RECIPIENT_EMAILS.map(recipientEmail => 
      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: recipientEmail,
          from_name: 'Harry Potter Halloween Party',
          subject: `New RSVP: ${rsvpData.name} - ${rsvpData.attending ? 'Attending' : 'Not Attending'}`,
          message: emailContent,
          guest_name: rsvpData.name,
          guest_email: rsvpData.email,
          attending_status: rsvpData.attending ? 'Yes' : 'No',
          guest_count: rsvpData.guestCount,
          dietary_restrictions: rsvpData.dietaryRestrictions || 'None',
          bringing_items: bringingItemsText,
          submission_time: new Date(rsvpData.timestamp).toLocaleString()
        }
      )
    );

    // Wait for all emails to be sent
    await Promise.all(emailPromises);
    
    console.log('RSVP notification emails sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send RSVP notification email:', error);
    return false;
  }
};

// Alternative method using a simple fetch to a backend service
export const sendRSVPNotificationBackend = async (rsvpData: RSVPEmailData): Promise<boolean> => {
  try {
    const response = await fetch('/api/send-rsvp-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...rsvpData,
        recipients: RECIPIENT_EMAILS
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('RSVP notification email sent successfully via backend');
    return true;
  } catch (error) {
    console.error('Failed to send RSVP notification email via backend:', error);
    return false;
  }
};

export const sendRSVPConfirmation = async (rsvpData: RSVPEmailData): Promise<boolean> => {
  try {
    console.log('Starting RSVP confirmation email process...');
    
    // Check if EmailJS public key is available
    if (!EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS public key not configured. Cannot send confirmation email.');
      return false;
    }

    console.log('EmailJS public key found, initializing...');
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const bringingItemsText = rsvpData.bringingItems.length > 0 
      ? rsvpData.bringingItems.map(item => {
          switch (item) {
            case 'Drinks':
              return `• Drinks: ${rsvpData.drinksDetails || 'No details provided'}`;
            case 'Snacks':
              return `• Snacks: ${rsvpData.snacksDetails || 'No details provided'}`;
            case 'Other':
              return `• Other: ${rsvpData.otherDetails || 'No details provided'}`;
            default:
              return `• ${item}`;
          }
        }).join('\n')
      : 'None';

    const partyDate = 'October 31st, 2025'; 
    const partyTime = '8:00 PM'; 
    const partyAddress = '1212 Summerfield Dr, Herndon VA 20170';

    console.log('Sending confirmation email to:', rsvpData.email);
    console.log('Using template ID:', EMAILJS_CONFIRMATION_TEMPLATE_ID);

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CONFIRMATION_TEMPLATE_ID,
      {
        to_email: rsvpData.email,
        from_name: 'Harry Potter Halloween Party',
        subject: `RSVP Confirmation - Harry Potter Halloween Party`,
        guest_name: rsvpData.name,
        attending_status: rsvpData.attending ? 'Yes' : 'No',
        guest_count: rsvpData.guestCount,
        dietary_restrictions: rsvpData.dietaryRestrictions || 'None',
        bringing_items: bringingItemsText,
        party_date: partyDate,
        party_time: partyTime,
        party_address: partyAddress,
        submission_time: new Date(rsvpData.timestamp).toLocaleString()
      }
    );
    
    console.log('RSVP confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send RSVP confirmation email:', error);
    return false;
  }
};
