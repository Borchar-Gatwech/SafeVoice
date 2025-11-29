/**
 * API Service - Backend Integration
 * Centralized API calls for the platform
 */

const API_BASE = '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Storage helpers
export const storage = {
  getCircleData: () => ({
    circleId: localStorage.getItem('circleId'),
    anonymousId: localStorage.getItem('anonymousId'),
    displayName: localStorage.getItem('displayName'),
  }),
  saveCircleData: (circleId, anonymousId, displayName) => {
    localStorage.setItem('circleId', circleId);
    localStorage.setItem('anonymousId', anonymousId);
    localStorage.setItem('displayName', displayName);
  },
  clearCircleData: () => {
    localStorage.removeItem('circleId');
    localStorage.removeItem('anonymousId');
    localStorage.removeItem('displayName');
  },
};

// Reports API
export const reportsApi = {
  submit: async (reportData) => {
    return apiCall('/reports', {
      method: 'POST',
      body: reportData,
    });
  },
};

// Circles API
export const circlesApi = {
  match: async (matchData) => {
    const response = await apiCall('/circles/match', {
      method: 'POST',
      body: matchData,
    });
    
    // Auto-save circle data
    if (response.circle && response.member) {
      storage.saveCircleData(
        response.circle.id,
        response.member.anonymousId,
        response.member.displayName
      );
    }
    
    return response;
  },
  
  getDetails: async (circleId) => {
    return apiCall(`/circles/${circleId}`);
  },
  
  getMessages: async (circleId, options = {}) => {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.before) params.append('before', options.before);
    
    const query = params.toString();
    return apiCall(`/circles/${circleId}/messages${query ? `?${query}` : ''}`);
  },
  
  sendMessage: async (circleId, message) => {
    const { anonymousId } = storage.getCircleData();
    if (!anonymousId) {
      throw new Error('Not matched to a circle. Please match first.');
    }
    
    return apiCall(`/circles/${circleId}/messages`, {
      method: 'POST',
      body: {
        anonymousId,
        message,
      },
    });
  },
  
  leave: async (circleId) => {
    const { anonymousId } = storage.getCircleData();
    if (!anonymousId) {
      throw new Error('Not matched to a circle.');
    }
    
    const response = await apiCall(`/circles/${circleId}/leave`, {
      method: 'POST',
      body: { anonymousId },
    });
    
    storage.clearCircleData();
    return response;
  },
};

// Resources API
export const resourcesApi = {
  search: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const query = params.toString();
    const response = await apiCall(`/resources${query ? `?${query}` : ''}`);
    return response.resources || [];
  },
};

