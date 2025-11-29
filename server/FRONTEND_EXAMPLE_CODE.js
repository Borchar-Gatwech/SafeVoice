/**
 * SafeCircle API - Frontend Integration Examples
 * Copy and adapt these functions for your React/Vue/Angular app
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generic API call helper
 */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add body if provided
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Get admin token from storage
 */
function getAdminToken() {
  return localStorage.getItem('admin_token');
}

/**
 * Get circle IDs from storage
 */
function getCircleData() {
  return {
    circleId: localStorage.getItem('circleId'),
    anonymousId: localStorage.getItem('anonymousId'),
    displayName: localStorage.getItem('displayName'),
  };
}

/**
 * Save circle data to storage
 */
function saveCircleData(circleId, anonymousId, displayName) {
  localStorage.setItem('circleId', circleId);
  localStorage.setItem('anonymousId', anonymousId);
  localStorage.setItem('displayName', displayName);
}

// ============================================
// REPORT ENDPOINTS
// ============================================

/**
 * Submit anonymous report
 * @param {Object} reportData - Report data
 * @returns {Promise<Object>} Report response with optional peer support match
 */
export async function submitReport(reportData) {
  return apiCall('/reports', {
    method: 'POST',
    body: {
      title: reportData.title,
      description: reportData.description, // REQUIRED
      category: reportData.category,
      location: reportData.location,
      contactMethod: reportData.contactMethod,
      seekingPeerSupport: reportData.seekingPeerSupport || false,
      incidentType: reportData.incidentType,
      locationRegion: reportData.locationRegion,
      language: reportData.language || 'english',
    },
  });
}

/**
 * Submit report and auto-match to peer support
 * @param {Object} reportData - Report data
 * @returns {Promise<Object>} Report with peer support match info
 */
export async function submitReportWithPeerSupport(reportData) {
  const response = await submitReport({
    ...reportData,
    seekingPeerSupport: true,
  });

  // If peer support matched, save IDs
  if (response.peerSupport && response.peerSupport.matched) {
    const { circle, member } = response.peerSupport;
    saveCircleData(circle.id, member.anonymousId, member.displayName);
  }

  return response;
}

/**
 * Get all reports (Admin only)
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of reports
 */
export async function getReports(filters = {}) {
  const token = getAdminToken();
  if (!token) {
    throw new Error('Admin token required');
  }

  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.reviewed !== undefined) params.append('reviewed', filters.reviewed);
  if (filters.search) params.append('search', filters.search);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  const endpoint = queryString ? `/reports?${queryString}` : '/reports';

  return apiCall(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Mark report as reviewed (Admin only)
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Success message
 */
export async function markReportReviewed(reportId) {
  const token = getAdminToken();
  if (!token) {
    throw new Error('Admin token required');
  }

  return apiCall(`/reports/${reportId}/reviewed`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================
// CIRCLE (PEER SUPPORT) ENDPOINTS
// ============================================

/**
 * Match to peer support circle
 * @param {Object} matchData - Matching criteria
 * @returns {Promise<Object>} Circle and member info
 */
export async function matchToCircle(matchData) {
  const response = await apiCall('/circles/match', {
    method: 'POST',
    body: {
      incidentType: matchData.incidentType, // REQUIRED
      locationRegion: matchData.locationRegion, // REQUIRED
      language: matchData.language || 'english',
      displayName: matchData.displayName,
      tags: matchData.tags,
      reportId: matchData.reportId,
    },
  });

  // Save circle data for future use
  if (response.circle && response.member) {
    saveCircleData(
      response.circle.id,
      response.member.anonymousId,
      response.member.displayName
    );
  }

  return response;
}

/**
 * Get circle details
 * @param {string} circleId - Circle ID
 * @returns {Promise<Object>} Circle details
 */
export async function getCircleDetails(circleId) {
  return apiCall(`/circles/${circleId}`, {
    method: 'GET',
  });
}

/**
 * Get circle messages
 * @param {string} circleId - Circle ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Messages array
 */
export async function getCircleMessages(circleId, options = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit);
  if (options.before) params.append('before', options.before);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/circles/${circleId}/messages?${queryString}`
    : `/circles/${circleId}/messages`;

  return apiCall(endpoint, {
    method: 'GET',
  });
}

/**
 * Send message to circle
 * @param {string} circleId - Circle ID
 * @param {string} message - Message text
 * @returns {Promise<Object>} Sent message
 */
export async function sendMessageToCircle(circleId, message) {
  const { anonymousId } = getCircleData();

  if (!anonymousId) {
    throw new Error('Not matched to a circle. Please match first.');
  }

  return apiCall(`/circles/${circleId}/messages`, {
    method: 'POST',
    body: {
      anonymousId: anonymousId,
      message: message,
    },
  });
}

/**
 * Leave circle
 * @param {string} circleId - Circle ID
 * @returns {Promise<Object>} Success message
 */
export async function leaveCircle(circleId) {
  const { anonymousId } = getCircleData();

  if (!anonymousId) {
    throw new Error('Not matched to a circle.');
  }

  const response = await apiCall(`/circles/${circleId}/leave`, {
    method: 'POST',
    body: {
      anonymousId: anonymousId,
    },
  });

  // Clear circle data
  localStorage.removeItem('circleId');
  localStorage.removeItem('anonymousId');
  localStorage.removeItem('displayName');

  return response;
}

/**
 * Get circle statistics (Developer API)
 * @param {string} apiKey - API key
 * @returns {Promise<Object>} Statistics
 */
export async function getCircleStats(apiKey) {
  return apiCall('/circles/stats', {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
    },
  });
}

// ============================================
// RESOURCE ENDPOINTS
// ============================================

/**
 * Search resources
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>} Resources array
 */
export async function searchResources(filters = {}) {
  const params = new URLSearchParams();
  if (filters.country) params.append('country', filters.country);
  if (filters.region) params.append('region', filters.region);
  if (filters.city) params.append('city', filters.city);
  if (filters.type) params.append('type', filters.type);
  if (filters.lat) params.append('lat', filters.lat);
  if (filters.lng) params.append('lng', filters.lng);
  if (filters.radius) params.append('radius', filters.radius);

  const queryString = params.toString();
  const endpoint = queryString ? `/resources?${queryString}` : '/resources';

  return apiCall(endpoint, {
    method: 'GET',
  });
}

/**
 * Get resource details
 * @param {string} resourceId - Resource ID
 * @returns {Promise<Object>} Resource details
 */
export async function getResourceDetails(resourceId) {
  return apiCall(`/resources/${resourceId}`, {
    method: 'GET',
  });
}

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * Admin login
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Token
 */
export async function adminLogin(username, password) {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: {
      username: username,
      password: password,
    },
  });

  // Save token
  if (response.token) {
    localStorage.setItem('admin_token', response.token);
  }

  return response;
}

/**
 * Admin logout
 */
export function adminLogout() {
  localStorage.removeItem('admin_token');
}

// ============================================
// DEVELOPER API ENDPOINTS
// ============================================

/**
 * Register for API key
 * @param {Object} developerData - Developer info
 * @returns {Promise<Object>} API key
 */
export async function registerApiKey(developerData) {
  return apiCall('/developer/register', {
    method: 'POST',
    body: {
      name: developerData.name,
      email: developerData.email,
      appName: developerData.appName,
      appDescription: developerData.appDescription,
    },
  });
}

/**
 * Get API usage
 * @param {string} apiKey - API key
 * @returns {Promise<Object>} Usage statistics
 */
export async function getApiUsage(apiKey) {
  return apiCall('/developer/usage', {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
    },
  });
}

// ============================================
// REACT HOOK EXAMPLE
// ============================================

/**
 * React Hook for Circle Messages
 * Usage in React component:
 * 
 * const { messages, sendMessage, loading } = useCircleMessages(circleId);
 */
export function useCircleMessages(circleId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load messages
  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCircleMessages(circleId);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (messageText) => {
    try {
      const newMessage = await sendMessageToCircle(circleId, messageText);
      // Reload messages to get updated list
      await loadMessages();
      return newMessage;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Load messages on mount and when circleId changes
  useEffect(() => {
    if (circleId) {
      loadMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [circleId]);

  return { messages, sendMessage, loading, error, refresh: loadMessages };
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Submit report with peer support
try {
  const response = await submitReportWithPeerSupport({
    title: "Online harassment",
    description: "I was harassed on a dating app...",
    category: "🌐 Online",
    location: "Nairobi, Kenya",
    incidentType: "online_harassment",
    locationRegion: "kenya",
    language: "english"
  });
  
  if (response.peerSupport?.matched) {
    console.log("Matched to circle:", response.peerSupport.circle.id);
    // Circle data is automatically saved to localStorage
  }
} catch (error) {
  console.error("Error:", error.message);
}

// Example 2: Send message to circle
try {
  const circleId = localStorage.getItem('circleId');
  const message = await sendMessageToCircle(circleId, "Hello everyone!");
  console.log("Message sent:", message);
} catch (error) {
  console.error("Error:", error.message);
}

// Example 3: Get messages
try {
  const circleId = localStorage.getItem('circleId');
  const data = await getCircleMessages(circleId, { limit: 20 });
  console.log("Messages:", data.messages);
} catch (error) {
  console.error("Error:", error.message);
}

// Example 4: Search resources
try {
  const resources = await searchResources({
    country: "Kenya",
    type: "ngo"
  });
  console.log("Found resources:", resources);
} catch (error) {
  console.error("Error:", error.message);
}

// Example 5: Admin login
try {
  const { token } = await adminLogin("admin", "safe1234");
  console.log("Logged in, token saved");
  
  // Now can get reports
  const reports = await getReports({ reviewed: false });
  console.log("Reports:", reports);
} catch (error) {
  console.error("Error:", error.message);
}
*/

