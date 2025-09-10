export interface RSVPData {
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

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.jsonbin.io/v3/b';
const API_KEY = process.env.REACT_APP_JSONBIN_API_KEY;
const BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID || 'your-bin-id';

const saveRSVPToAPI = async (rsvpData: RSVPData): Promise<boolean> => {
  try {
    if (!API_KEY || !BIN_ID) {
      throw new Error('API credentials not configured');
    }

    const newRSVP: StoredRSVP = {
      ...rsvpData,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    const existingRSVPs = await getRSVPsFromAPI();
    const updatedRSVPs = [...existingRSVPs, newRSVP];

    let dataToSave: StoredRSVP[] | { rsvps: StoredRSVP[] } | { data: StoredRSVP[] } = updatedRSVPs;
    
    try {
      const response = await fetch(`${API_BASE_URL}/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      if (response.ok) {
        const currentData = await response.json();
        const currentRecord = currentData.record;
        
        if (currentRecord && typeof currentRecord === 'object' && !Array.isArray(currentRecord)) {
          if (currentRecord.rsvps !== undefined) {
            dataToSave = { rsvps: updatedRSVPs };
          } else if (currentRecord.data !== undefined) {
            dataToSave = { data: updatedRSVPs };
          }
        }
      }
    } catch (e) {
      // Use default array format
    }

    const response = await fetch(`${API_BASE_URL}/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(dataToSave)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to save RSVP to API:', error);
    throw error;
  }
};

const getRSVPsFromAPI = async (): Promise<StoredRSVP[]> => {
  try {
    if (!API_KEY || !BIN_ID) {
      throw new Error('API credentials not configured');
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
    
    return rsvps.map((rsvp: any) => ({
      ...rsvp,
      guestCount: Number(rsvp.guestCount) || 1
    }));
  } catch (error) {
    console.error('Failed to fetch RSVPs from API:', error);
    throw error;
  }
};

const deleteRSVPFromAPI = async (rsvpId: string): Promise<boolean> => {
  try {
    if (!API_KEY || !BIN_ID) {
      throw new Error('API credentials not configured');
    }

    const existingRSVPs = await getRSVPsFromAPI();
    const updatedRSVPs = existingRSVPs.filter(rsvp => rsvp.id !== rsvpId);

    const response = await fetch(`${API_BASE_URL}/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(updatedRSVPs)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete RSVP from API:', error);
    throw error;
  }
};

export const saveRSVP = async (rsvpData: RSVPData): Promise<boolean> => {
  return await saveRSVPToAPI(rsvpData);
};

export const getRSVPs = async (): Promise<StoredRSVP[]> => {
  return await getRSVPsFromAPI();
};

export const deleteRSVP = async (rsvpId: string): Promise<boolean> => {
  return await deleteRSVPFromAPI(rsvpId);
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
      // Handle drinks
      rsvp.bringingItems.drinks.forEach(item => {
        summary.drinks.push(`${rsvp.name}: ${item}`);
      });
      
      // Handle snacks
      rsvp.bringingItems.snacks.forEach(item => {
        summary.snacks.push(`${rsvp.name}: ${item}`);
      });
      
      // Handle other items
      rsvp.bringingItems.other.forEach(item => {
        summary.other.push(`${rsvp.name}: ${item}`);
      });
    }
  });

  return summary;
};

export const isAPIConfigured = (): boolean => {
  return !!(API_KEY && BIN_ID);
};

export const getStorageMethod = (): 'api' | 'localStorage' => {
  return isAPIConfigured() ? 'api' : 'localStorage';
};