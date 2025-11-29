/**
 * Centralized API client for SafeVoice
 * Handles all backend communication with proper error handling and auth headers
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Make API request with optional auth token
 * @param {string} endpoint - API endpoint (e.g., '/api/circles/match')
 * @param {object} options - fetch options (method, body, headers, etc.)
 * @param {string} token - Optional JWT token for auth
 * @returns {Promise<{data: object, ok: boolean, status: number}>}
 */
export async function apiCall(endpoint, options = {}, token = null) {
  const url = `${API_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // Add auth token if provided
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json()

    return {
      data,
      ok: response.ok,
      status: response.status
    }
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error)
    throw error
  }
}

/**
 * POST /api/circles/match
 * Find or create matching peer support circle
 */
export async function matchCircle(formData) {
  return apiCall('/api/circles/match', {
    method: 'POST',
    body: JSON.stringify(formData)
  })
}

/**
 * GET /api/circles/:circleId
 * Get circle details
 */
export async function getCircle(circleId) {
  return apiCall(`/api/circles/${circleId}`)
}

/**
 * GET /api/circles/:circleId/messages
 * Get messages from circle
 */
export async function getMessages(circleId, limit = 50, before = null) {
  const params = new URLSearchParams({ limit })
  if (before) params.append('before', before)
  return apiCall(`/api/circles/${circleId}/messages?${params.toString()}`)
}

/**
 * POST /api/circles/:circleId/messages
 * Send message to circle
 */
export async function sendMessage(circleId, anonymousId, message) {
  return apiCall(`/api/circles/${circleId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ anonymousId, message })
  })
}

/**
 * POST /api/circles/:circleId/leave
 * Leave a circle
 */
export async function leaveCircle(circleId, anonymousId) {
  return apiCall(`/api/circles/${circleId}/leave`, {
    method: 'POST',
    body: JSON.stringify({ anonymousId })
  })
}

/**
 * GET /api/circles/stats
 * Get circle statistics (requires API key)
 */
export async function getCircleStats() {
  return apiCall('/api/circles/stats')
}

/**
 * POST /api/reports
 * Submit anonymous incident report
 */
export async function submitReport(reportData) {
  return apiCall('/api/reports', {
    method: 'POST',
    body: JSON.stringify(reportData)
  })
}

/**
 * GET /api/reports
 * Get all reports (admin only, requires token)
 */
export async function getReports(token, params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiCall(`/api/reports?${query}`, {}, token)
}

/**
 * PATCH /api/reports/:id/reviewed
 * Mark report as reviewed (admin only, requires token)
 */
export async function markReportReviewed(id, token) {
  return apiCall(`/api/reports/${id}/reviewed`, {
    method: 'PATCH'
  }, token)
}

/**
 * POST /api/auth/login
 * Admin login
 */
export async function login(username, password) {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

/**
 * GET /api/resources
 * Find resources by location and type
 */
export async function getResources(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiCall(`/api/resources?${query}`)
}

/**
 * GET /api/resources/:id
 * Get single resource details
 */
export async function getResource(id) {
  return apiCall(`/api/resources/${id}`)
}

/**
 * POST /api/developer/register
 * Register for API key
 */
export async function registerDeveloper(name, email, appName, appDescription = '') {
  return apiCall('/api/developer/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, appName, appDescription })
  })
}

/**
 * GET /api/developer/usage
 * Get API usage (requires API key header)
 */
export async function getDeveloperUsage(apiKey) {
  const headers = {
    'X-API-Key': apiKey
  }
  return apiCall('/api/developer/usage', { headers })
}

/**
 * GET /api/badges/my-badges?anonymousId=xxx
 * Get user's badges and progress
 */
export async function getMyBadges(anonymousId) {
  return apiCall(`/api/badges/my-badges?anonymousId=${anonymousId}`)
}

export default {
  apiCall,
  matchCircle,
  getCircle,
  getMessages,
  sendMessage,
  leaveCircle,
  getCircleStats,
  submitReport,
  getReports,
  markReportReviewed,
  login,
  getResources,
  getResource,
  registerDeveloper,
  getDeveloperUsage,
  getMyBadges
}
