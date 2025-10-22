import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_ekdqhnd';
const EMAILJS_CONFIRMATION_TEMPLATE_ID = 'template_ya1y8zy';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

if (!EMAILJS_PUBLIC_KEY) {
  console.error('REACT_APP_EMAILJS_PUBLIC_KEY environment variable is not set. Please configure it in your GitHub Pages secrets.');
}

export interface RSVPEmailData {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  dietaryRestrictions: string;
  bringingItems: {
    drinks: string[];
    snacks: string[];
    other: string[];
  };
  timestamp: number;
}

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

    const bringingItemsText = (() => {
      const items = [];
      if (rsvpData.bringingItems.drinks.length > 0) {
        items.push('Drinks:');
        rsvpData.bringingItems.drinks.forEach(item => items.push(`  • ${item}`));
      }
      if (rsvpData.bringingItems.snacks.length > 0) {
        items.push('Snacks:');
        rsvpData.bringingItems.snacks.forEach(item => items.push(`  • ${item}`));
      }
      if (rsvpData.bringingItems.other.length > 0) {
        items.push('Other:');
        rsvpData.bringingItems.other.forEach(item => items.push(`  • ${item}`));
      }
      return items.length > 0 ? items.join('\n') : 'None';
    })();

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