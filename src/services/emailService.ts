import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_ekdqhnd';
const EMAILJS_TEMPLATE_ID = 'template_l0xqkzl';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

// Recipient emails
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
    // Initialize EmailJS with your public key
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Format the bringing items for email
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

    // Format the email content
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
