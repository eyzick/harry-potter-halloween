export interface RSVPData {
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

export interface StoredRSVP extends RSVPData {
  id: string;
  timestamp: number;
}

export interface CategorySummary {
  drinks: string[];
  snacks: string[];
  other: string[];
}

// Configuration for backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.jsonbin.io/v3/b';
const API_KEY = process.env.REACT_APP_JSONBIN_API_KEY;
const BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID || 'your-bin-id';

// Fallback to localStorage if API is not configured
const STORAGE_KEY = 'halloween-party-rsvps';

// Backend API functions
const saveRSVPToAPI = async (rsvpData: RSVPData): Promise<boolean> => {
  try {
    if (!API_KEY || !BIN_ID) {
      console.warn('API credentials not configured, falling back to localStorage');
      return false;
    }

    const newRSVP: StoredRSVP = {
      ...rsvpData,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    // Get existing RSVPs
    const existingRSVPs = await getRSVPsFromAPI();
    const updatedRSVPs = [...existingRSVPs, newRSVP];

    // Try to maintain the original format, but default to array if we can't determine it
    let dataToSave: StoredRSVP[] | { rsvps: StoredRSVP[] } | { data: StoredRSVP[] } = updatedRSVPs;
    
    // If we have existing data, try to preserve the format
    try {
      const response = await fetch(`${API_BASE_URL}/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      if (response.ok) {
        const currentData = await response.json();
        const currentRecord = currentData.record;
        
        if (currentRecord && typeof currentRecord === 'object' && !Array.isArray(currentRecord)) {
          // Preserve object format
          if (currentRecord.rsvps !== undefined) {
            dataToSave = { rsvps: updatedRSVPs };
          } else if (currentRecord.data !== undefined) {
            dataToSave = { data: updatedRSVPs };
          }
        }
      }
    } catch (e) {
      // If we can't determine format, just use array
    }

    const response = await fetch(`${API_BASE_URL}/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Name': 'Halloween Party RSVPs'
      },
      body: JSON.stringify(dataToSave)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    console.log('RSVP saved to API successfully');
    return true;
  } catch (error) {
    console.error('Failed to save RSVP to API:', error);
    return false;
  }
};

const getRSVPsFromAPI = async (): Promise<StoredRSVP[]> => {
  try {
    if (!API_KEY || !BIN_ID) {
      console.warn('API credentials not configured, falling back to localStorage');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/${BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    let rsvps = data.record || [];
    
    // Handle different data formats
    if (Array.isArray(rsvps)) {
      // Direct array format: []
    } else if (rsvps && Array.isArray(rsvps.rsvps)) {
      // Object with rsvps property: {"rsvps": []}
      rsvps = rsvps.rsvps;
    } else if (rsvps && Array.isArray(rsvps.data)) {
      // Object with data property: {"data": []}
      rsvps = rsvps.data;
    } else {
      // Fallback to empty array
      rsvps = [];
    }
    
    // Ensure guestCount is always a number
    return rsvps.map((rsvp: any) => ({
      ...rsvp,
      guestCount: Number(rsvp.guestCount) || 1
    }));
  } catch (error) {
    console.error('Failed to fetch RSVPs from API:', error);
    return [];
  }
};

const deleteRSVPFromAPI = async (rsvpId: string): Promise<boolean> => {
  try {
    if (!API_KEY || !BIN_ID) {
      console.warn('API credentials not configured, falling back to localStorage');
      return false;
    }

    const existingRSVPs = await getRSVPsFromAPI();
    const updatedRSVPs = existingRSVPs.filter(rsvp => rsvp.id !== rsvpId);

    const response = await fetch(`${API_BASE_URL}/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Name': 'Halloween Party RSVPs'
      },
      body: JSON.stringify(updatedRSVPs)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    console.log('RSVP deleted from API successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete RSVP from API:', error);
    return false;
  }
};

// localStorage fallback functions
const saveRSVPToLocalStorage = (rsvpData: RSVPData): void => {
  const storedRSVPs = getRSVPsFromLocalStorage();
  const newRSVP: StoredRSVP = {
    ...rsvpData,
    id: Date.now().toString(),
    timestamp: Date.now()
  };
  storedRSVPs.push(newRSVP);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storedRSVPs));
};

const getRSVPsFromLocalStorage = (): StoredRSVP[] => {
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

const deleteRSVPFromLocalStorage = (rsvpId: string): void => {
  try {
    const storedRSVPs = getRSVPsFromLocalStorage();
    const updatedRSVPs = storedRSVPs.filter(rsvp => rsvp.id !== rsvpId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRSVPs));
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
  }
};

// Main service functions with fallback logic
export const saveRSVP = async (rsvpData: RSVPData): Promise<boolean> => {
  // Try API first
  const apiSuccess = await saveRSVPToAPI(rsvpData);
  
  if (apiSuccess) {
    return true;
  }
  
  // Fallback to localStorage
  console.warn('API failed, saving to localStorage as fallback');
  saveRSVPToLocalStorage(rsvpData);
  return false; // Return false to indicate fallback was used
};

export const getRSVPs = async (): Promise<StoredRSVP[]> => {
  // Try API first
  const apiRSVPs = await getRSVPsFromAPI();
  
  if (apiRSVPs.length > 0 || (API_KEY && BIN_ID)) {
    return apiRSVPs;
  }
  
  // Fallback to localStorage
  console.warn('API failed or not configured, using localStorage');
  return getRSVPsFromLocalStorage();
};

export const deleteRSVP = async (rsvpId: string): Promise<boolean> => {
  // Try API first
  const apiSuccess = await deleteRSVPFromAPI(rsvpId);
  
  if (apiSuccess) {
    return true;
  }
  
  // Fallback to localStorage
  console.warn('API failed, deleting from localStorage as fallback');
  deleteRSVPFromLocalStorage(rsvpId);
  return false; // Return false to indicate fallback was used
};

export const getCategorySummary = async (): Promise<CategorySummary> => {
  const rsvps = await getRSVPs();
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

// Utility function to check if API is properly configured
export const isAPIConfigured = (): boolean => {
  return !!(API_KEY && BIN_ID);
};

// Utility function to get storage method being used
export const getStorageMethod = (): 'api' | 'localStorage' => {
  return isAPIConfigured() ? 'api' : 'localStorage';
};
