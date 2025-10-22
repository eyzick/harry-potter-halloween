import emailjs from '@emailjs/browser';
import { StoredRSVP } from './dataService';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_ekdqhnd';
const EMAILJS_REMINDER_TEMPLATE_ID = 'template_l0xqkzl';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

if (!EMAILJS_PUBLIC_KEY) {
  console.error('REACT_APP_EMAILJS_PUBLIC_KEY environment variable is not set. Please configure it in your GitHub Pages secrets.');
}

export interface ReminderEmailData {
  guest_name: string;
  guest_email: string;
  attending_status: string;
  guest_count: number;
  dietary_restrictions: string;
  bringing_items: string;
  party_date: string;
  party_time: string;
  party_address: string;
  street_parking: string;
  submission_time: string;
}

export interface ReminderPreview {
  recipient: string;
  subject: string;
  content: string;
  htmlContent: string;
}

export interface ReminderResult {
  success: boolean;
  recipient: string;
  error?: string;
}

// Party details - centralized for easy updates
export const PARTY_DETAILS = {
  date: 'October 31st, 2025',
  time: '8:00 PM',
  address: '1212 Summerfield Dr, Herndon VA 20170',
  streetParking: 'Yes, there is street parking available',
  contactEmail: 'your-email@example.com' // Update this with your actual contact email
};

/**
 * Formats bringing items into a readable string
 */
const formatBringingItems = (rsvp: StoredRSVP): string => {
  const items = [];
  
  if (rsvp.bringingItems.drinks.length > 0) {
    items.push('Drinks:');
    rsvp.bringingItems.drinks.forEach(item => items.push(`  • ${item}`));
  }
  
  if (rsvp.bringingItems.snacks.length > 0) {
    items.push('Snacks:');
    rsvp.bringingItems.snacks.forEach(item => items.push(`  • ${item}`));
  }
  
  if (rsvp.bringingItems.other.length > 0) {
    items.push('Other:');
    rsvp.bringingItems.other.forEach(item => items.push(`  • ${item}`));
  }
  
  return items.length > 0 ? items.join('\n') : 'None';
};

/**
 * Generates HTML content for reminder email preview using the actual template
 */
export const generateReminderHTML = (rsvp: StoredRSVP): string => {
  const bringingItemsText = formatBringingItems(rsvp);
  
  // Use the actual reminder template HTML structure
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Party Reminder</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #8B4513, #A0522D);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 25px;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #8B4513;
            border-radius: 5px;
        }
        .section h2 {
            color: #8B4513;
            margin-top: 0;
            font-size: 20px;
        }
        .info-item {
            margin: 10px 0;
            font-size: 16px;
        }
        .info-label {
            font-weight: bold;
            color: #333;
        }
        .party-details {
            background-color: #e8f4f8;
            border-left-color: #4a90e2;
        }
        .party-details h2 {
            color: #4a90e2;
        }
        .activities {
            background-color: #f0e6ff;
            border-left-color: #9b59b6;
        }
        .activities h2 {
            color: #9b59b6;
        }
        .footer {
            background-color: #333;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
        .magical-border {
            border: 2px solid #8B4513;
            border-radius: 10px;
            position: relative;
        }
        .magical-border::before {
            content: "✨";
            position: absolute;
            top: -10px;
            left: 20px;
            background-color: white;
            padding: 0 10px;
            font-size: 20px;
        }
        .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
        }
        .prize-info {
            background-color: #d4edda;
            border-left-color: #28a745;
        }
        .prize-info h2 {
            color: #28a745;
        }
        .bringing-items {
            white-space: pre-line;
            font-family: 'Georgia', serif;
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            border-left: 3px solid #8B4513;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="container magical-border">
        <div class="header">
            <h1>🪄 Party Reminder 🪄</h1>
            <p>Harry Potter Halloween Party</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Dear ${rsvp.name},</h2>
                <p>The magical evening is almost upon us! We're so excited to celebrate with you at our Harry Potter Halloween party. Here's everything you need to know:</p>
            </div>

            <div class="section party-details">
                <h2>🎃 Party Details 🎃</h2>
                <div class="info-item">
                    <span class="info-label">Date:</span> ${PARTY_DETAILS.date}
                </div>
                <div class="info-item">
                    <span class="info-label">Time:</span> ${PARTY_DETAILS.time}
                </div>
                <div class="info-item">
                    <span class="info-label">Location:</span><br>
                    ${PARTY_DETAILS.address}
                </div>
                <div class="info-item">
                    <span class="info-label">Parking:</span> Street parking is available around the venue
                </div>
            </div>

            <div class="section activities">
                <h2>🏆 Magical Activities & Contests 🏆</h2>
                <div class="highlight">
                    <strong>Costume Contest:</strong> Show off your magical attire! Top three costumes will receive prizes.
                </div>
                <div class="highlight">
                    <strong>House Cup Tournament:</strong> Compete in magical games and challenges to earn points for your house. Will Gryffindor, Hufflepuff, Ravenclaw, or Slytherin claim victory?
                </div>
            </div>

            <div class="section prize-info">
                <h2>🎁 Prizes Await! 🎁</h2>
                <p>Winners of both the costume contest and House Cup tournament will receive magical prizes! We've prepared some enchanting rewards for our champions.</p>
            </div>

            <div class="section">
                <h2>What to Bring</h2>
                <ul>
                    <li>Your magical costume (required for the contest!)</li>
                    <li>Your house pride and competitive spirit</li>
                    <li>An appetite for magical treats and beverages</li>
                    <li>Any items you mentioned in your RSVP</li>
                </ul>
            </div>

            <div class="section">
                <h2>Your RSVP Details</h2>
                <div class="info-item">
                    <span class="info-label">Attending:</span> ${rsvp.attending ? 'Yes' : 'No'}
                </div>
                <div class="info-item">
                    <span class="info-label">Number of Guests:</span> ${rsvp.guestCount}
                </div>
                <div class="info-item">
                    <span class="info-label">Dietary Restrictions:</span> ${rsvp.dietaryRestrictions || 'None'}
                </div>
                <div class="info-item">
                    <span class="info-label">Items You're Bringing:</span><br>
                    <div class="bringing-items">${bringingItemsText}</div>
                </div>
                <div class="info-item">
                    <span class="info-label">Original RSVP:</span> ${new Date(rsvp.timestamp).toLocaleString()}
                </div>
            </div>

            <div class="section">
                <h2>Important Reminders</h2>
                <ul>
                    <li>Costumes are required for the costume contest participation</li>
                    <li>Street parking is available - please arrive a few minutes early to find a spot</li>
                    <li>We'll have magical treats, beverages, and activities throughout the evening</li>
                    <li>Don't forget to bring your competitive spirit for the House Cup tournament!</li>
                </ul>
            </div>

            <div class="section">
                <p style="text-align: center; font-size: 18px; color: #8B4513;">
                    <strong>See you soon for a magical evening!</strong><br>
                    <em>May the best house win! ✨</em>
                </p>
            </div>
        </div>

        <div class="footer">
            <p>Harry Potter Halloween Party 2025</p>
            <p>Questions? Contact us at ${PARTY_DETAILS.contactEmail}</p>
        </div>
    </div>
</body>
</html>`;
};

/**
 * Creates a preview of the reminder email for dry run testing
 */
export const createReminderPreview = (rsvp: StoredRSVP): ReminderPreview => {
  const bringingItemsText = formatBringingItems(rsvp);
  
  const subject = `Party Reminder - Harry Potter Halloween Party`;
  
  const content = `Dear ${rsvp.name},

This is a friendly reminder about our magical Harry Potter Halloween celebration! We're excited to see you there.

Your RSVP Details:
• Attending: ${rsvp.attending ? 'Yes' : 'No'}
• Number of Guests: ${rsvp.guestCount}
• Dietary Restrictions: ${rsvp.dietaryRestrictions || 'None'}
• Items You're Bringing:
${bringingItemsText}
• Original RSVP: ${new Date(rsvp.timestamp).toLocaleString()}

Party Information:
• Date: ${PARTY_DETAILS.date}
• Time: ${PARTY_DETAILS.time}
• Location: ${PARTY_DETAILS.address}
• Parking: ${PARTY_DETAILS.streetParking}

Important Reminders:
• Please arrive in costume! Magical theme optional 🧙‍♀️
• We'll have plenty of magical treats and beverages
• Street parking is available - no need to worry about finding a spot!
• If you need to make any changes to your RSVP, please contact us as soon as possible

We can't wait to celebrate with you!
Mischief Managed! ✨

Harry Potter Halloween Party 2025
Questions? Contact us at ${PARTY_DETAILS.contactEmail}`;

  return {
    recipient: rsvp.email,
    subject,
    content,
    htmlContent: generateReminderHTML(rsvp)
  };
};

/**
 * Sends reminder email to a single recipient
 */
export const sendReminderEmail = async (rsvp: StoredRSVP): Promise<ReminderResult> => {
  try {
    if (!EMAILJS_PUBLIC_KEY) {
      return {
        success: false,
        recipient: rsvp.email,
        error: 'EmailJS public key not configured'
      };
    }

    emailjs.init(EMAILJS_PUBLIC_KEY);

    const bringingItemsText = formatBringingItems(rsvp);

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_REMINDER_TEMPLATE_ID,
      {
        to_email: rsvp.email,
        from_name: 'Harry Potter Halloween Party',
        subject: `Party Reminder - Harry Potter Halloween Party`,
        guest_name: rsvp.name,
        attending_status: rsvp.attending ? 'Yes' : 'No',
        guest_count: rsvp.guestCount,
        dietary_restrictions: rsvp.dietaryRestrictions || 'None',
        bringing_items: bringingItemsText,
        party_date: PARTY_DETAILS.date,
        party_time: PARTY_DETAILS.time,
        party_address: PARTY_DETAILS.address,
        street_parking: PARTY_DETAILS.streetParking,
        contact_email: PARTY_DETAILS.contactEmail,
        submission_time: new Date(rsvp.timestamp).toLocaleString()
      }
    );

    return {
      success: true,
      recipient: rsvp.email
    };
  } catch (error) {
    console.error(`Failed to send reminder email to ${rsvp.email}:`, error);
    return {
      success: false,
      recipient: rsvp.email,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Sends reminder emails to all attending guests
 */
export const sendReminderEmails = async (rsvps: StoredRSVP[]): Promise<ReminderResult[]> => {
  const attendingRsvps = rsvps.filter(rsvp => rsvp.attending);
  
  console.log(`Sending reminder emails to ${attendingRsvps.length} attending guests...`);
  
  const results: ReminderResult[] = [];
  
  // Send emails sequentially to avoid rate limiting
  for (const rsvp of attendingRsvps) {
    const result = await sendReminderEmail(rsvp);
    results.push(result);
    
    // Add a small delay between emails to be respectful to the email service
    if (attendingRsvps.indexOf(rsvp) < attendingRsvps.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  console.log(`Reminder emails completed: ${successCount} successful, ${failureCount} failed`);
  
  return results;
};

/**
 * Creates previews for all attending guests (for dry run)
 */
export const createReminderPreviews = (rsvps: StoredRSVP[]): ReminderPreview[] => {
  const attendingRsvps = rsvps.filter(rsvp => rsvp.attending);
  return attendingRsvps.map(rsvp => createReminderPreview(rsvp));
};
