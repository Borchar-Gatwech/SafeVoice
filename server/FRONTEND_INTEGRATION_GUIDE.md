# Frontend Integration Guide - SafeCircle API

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Base URL & Environment](#base-url--environment)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Authentication](#authentication)
5. [Request/Response Formats](#requestresponse-formats)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)
8. [Common Issues & Solutions](#common-issues--solutions)
9. [Testing Checklist](#testing-checklist)

---

## 🚀 Quick Start

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.safecircle.org/api` (when deployed)

### Essential Endpoints
```javascript
// Most commonly used endpoints
POST   /api/reports              // Submit anonymous report
POST   /api/circles/match        // Match to peer support circle
GET    /api/circles/:id/messages // Get circle messages
POST   /api/circles/:id/messages // Send message to circle
GET    /api/resources            // Find safety resources
POST   /api/auth/login           // Admin login
```

---

## 🌐 Base URL & Environment

### Environment Variables for Frontend
```javascript
// .env or config file
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SWAGGER_URL=http://localhost:5000/api-docs
```

### API Client Setup
```javascript
// api.js or apiClient.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## 📡 API Endpoints Reference

### 1. Anonymous Reporting

#### Submit Report
```http
POST /api/reports
Content-Type: application/json

{
  "title": "Online harassment incident",
  "description": "Required: Detailed description of the incident",
  "category": "🌐 Online",
  "location": "Nairobi, Kenya",
  "contactMethod": "email@example.com" | "prefer_not_to_contact",
  "seekingPeerSupport": true,
  "incidentType": "online_harassment",
  "locationRegion": "kenya",
  "language": "english"
}
```

**Response (201 Created):**
```json
{
  "message": "Report submitted successfully",
  "reportId": "507f1f77bcf86cd799439011",
  "peerSupport": {
    "matched": true,
    "circle": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Online Safety Circle - kenya",
      "memberCount": 2
    },
    "member": {
      "anonymousId": "anon_abc123def456...",
      "displayName": "Brave Survivor"
    },
    "message": "You have been matched to a peer support circle"
  }
}
```

**Important Notes:**
- `description` is **REQUIRED**
- If `seekingPeerSupport: true`, you MUST include `incidentType` and `locationRegion`
- Save `peerSupport.member.anonymousId` and `peerSupport.circle.id` for messaging

---

### 2. Peer Support Circles

#### Match to Circle
```http
POST /api/circles/match
Content-Type: application/json

{
  "incidentType": "online_harassment",
  "locationRegion": "kenya",
  "language": "english",
  "displayName": "Brave Survivor",
  "tags": ["dating_app", "harassment"],
  "reportId": "507f1f77bcf86cd799439011"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "circle": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Online Safety Circle - kenya",
    "description": "Safe space for survivors...",
    "memberCount": 3,
    "language": "english",
    "incidentType": "online_harassment"
  },
  "member": {
    "anonymousId": "anon_abc123def456...",
    "displayName": "Brave Survivor"
  },
  "matchReason": "Matched to Online Safety Circle - kenya: 2 members with similar experiences, based in kenya",
  "isNewCircle": false
}
```

**⚠️ CRITICAL:** Save `circle.id` and `member.anonymousId` - you'll need them for messaging!

---

#### Get Circle Details
```http
GET /api/circles/:circleId
```

**Response (200 OK):**
```json
{
  "circle": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Online Safety Circle - kenya",
    "description": "...",
    "memberCount": 3,
    "language": "english",
    "incidentType": "online_harassment",
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "members": [
    {
      "displayName": "Brave Survivor",
      "joinedAt": "2025-01-15T10:00:00Z",
      "helpfulnessScore": 4.5
    }
  ]
}
```

---

#### Get Circle Messages
```http
GET /api/circles/:circleId/messages?limit=50&before=2025-01-15T10:00:00Z
```

**Query Parameters:**
- `limit` (optional): Number of messages, default 50
- `before` (optional): ISO timestamp for pagination

**Response (200 OK):**
```json
{
  "messages": [
    {
      "id": "507f1f77bcf86cd799439013",
      "senderDisplayName": "Brave Survivor",
      "message": "Hello everyone...",
      "timestamp": "2025-01-15T10:30:00Z",
      "reactions": []
    }
  ]
}
```

**Note:** Messages are returned in chronological order (oldest first)

---

#### Send Message to Circle
```http
POST /api/circles/:circleId/messages
Content-Type: application/json

{
  "anonymousId": "anon_abc123def456...",
  "message": "Hello everyone, I'm new here..."
}
```

**Response (201 Created):**
```json
{
  "message": {
    "id": "507f1f77bcf86cd799439013",
    "senderDisplayName": "Brave Survivor",
    "message": "Hello everyone, I'm new here...",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**⚠️ IMPORTANT:**
- User MUST be a member of the circle (matched via `/api/circles/match`)
- `anonymousId` must match the one from matching response
- Message max length: 2000 characters

---

#### Leave Circle
```http
POST /api/circles/:circleId/leave
Content-Type: application/json

{
  "anonymousId": "anon_abc123def456..."
}
```

**Response (200 OK):**
```json
{
  "message": "Left circle successfully"
}
```

---

### 3. Safety Resources

#### Search Resources
```http
GET /api/resources?country=Kenya&type=ngo&lat=-1.2921&lng=36.8219&radius=50
```

**Query Parameters:**
- `country` (optional): Country name
- `region` (optional): State/Region
- `city` (optional): City name
- `type` (optional): `hotline` | `ngo` | `legal_aid` | `shelter` | `counseling` | `police` | `hospital`
- `lat` (optional): Latitude for geospatial search
- `lng` (optional): Longitude for geospatial search
- `radius` (optional): Search radius in km, default 50

**Response (200 OK):**
```json
{
  "count": 5,
  "resources": [
    {
      "id": "507f1f77bcf86cd799439014",
      "name": "Gender Violence Recovery Centre",
      "type": "ngo",
      "description": "Comprehensive support for GBV survivors",
      "phone": "+254 709 443 000",
      "email": "info@gvrc.or.ke",
      "website": "https://gvrc.or.ke",
      "location": {
        "country": "Kenya",
        "region": "Nairobi",
        "city": "Nairobi",
        "coordinates": {
          "lat": -1.2921,
          "lng": 36.8219
        }
      },
      "languages": ["English", "Swahili"],
      "hours": "24/7",
      "rating": 4.5,
      "services": ["counseling", "legal_aid", "shelter"],
      "isFree": true
    }
  ]
}
```

---

### 4. Admin Authentication

#### Admin Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "safe1234"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ IMPORTANT:**
- Save token in `localStorage` or secure storage
- Include in Authorization header for protected endpoints
- Token expires in 8 hours

---

#### Get All Reports (Admin Only)
```http
GET /api/reports?category=🌐 Online&reviewed=false&search=harassment
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `category` (optional): Filter by category
- `reviewed` (optional): `true` | `false`
- `search` (optional): Search in title/description/location
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Online harassment incident",
    "description": "...",
    "category": "🌐 Online",
    "location": "Nairobi, Kenya",
    "date": "2025-01-15T10:00:00Z",
    "reviewed": false,
    "anonymous": true
  }
]
```

---

## 🔐 Authentication

### Admin Authentication (JWT)
```javascript
// Login
const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'safe1234' })
});
const { token } = await loginResponse.json();

// Store token
localStorage.setItem('admin_token', token);

// Use token in requests
const reports = await fetch(`${API_BASE_URL}/reports`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### API Key Authentication (Developer Endpoints)
```javascript
// For developer endpoints like /api/circles/stats
const response = await fetch(`${API_BASE_URL}/circles/stats`, {
  headers: {
    'X-API-Key': 'sk_your_api_key_here'
    // OR
    // 'Authorization': 'Bearer sk_your_api_key_here'
  }
});
```

---

## 📦 Request/Response Formats

### Standard Request Format
```javascript
{
  method: 'POST' | 'GET' | 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token' // if needed
  },
  body: JSON.stringify({ ... }) // for POST/PATCH
}
```

### Standard Success Response
```javascript
{
  success: true, // sometimes
  message: "...", // sometimes
  data: { ... } // varies by endpoint
}
```

### Standard Error Response
```javascript
{
  message: "Error description",
  error: "Detailed error" // sometimes
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created (POST success)
- `400` - Bad Request (missing/invalid data)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (not a member, etc.)
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Server Error

### Error Handling Example
```javascript
async function submitReport(reportData) {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific errors
      if (response.status === 400) {
        throw new Error(`Validation Error: ${data.message}`);
      }
      if (response.status === 401) {
        // Redirect to login
        throw new Error('Please login again');
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('Report submission error:', error);
    // Show user-friendly error message
    throw error;
  }
}
```

---

## 💻 Code Examples

### Complete Report Submission with Peer Matching
```javascript
async function submitReportAndMatch(reportData) {
  try {
    // Submit report
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: reportData.title,
        description: reportData.description, // REQUIRED
        category: reportData.category,
        location: reportData.location,
        contactMethod: reportData.contactMethod,
        seekingPeerSupport: true, // Enable peer support
        incidentType: reportData.incidentType, // REQUIRED if seekingPeerSupport
        locationRegion: reportData.locationRegion, // REQUIRED if seekingPeerSupport
        language: reportData.language || 'english'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit report');
    }

    // If peer support matched, save IDs
    if (data.peerSupport && data.peerSupport.matched) {
      const { circle, member } = data.peerSupport;
      
      // Save to localStorage or state
      localStorage.setItem('circleId', circle.id);
      localStorage.setItem('anonymousId', member.anonymousId);
      localStorage.setItem('displayName', member.displayName);
      
      return {
        reportId: data.reportId,
        circleId: circle.id,
        anonymousId: member.anonymousId,
        displayName: member.displayName
      };
    }

    return { reportId: data.reportId };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Send Message to Circle
```javascript
async function sendMessageToCircle(circleId, anonymousId, messageText) {
  try {
    const response = await fetch(`${API_BASE_URL}/circles/${circleId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousId: anonymousId,
        message: messageText
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('You are not a member of this circle. Please match to a circle first.');
      }
      throw new Error(data.message || 'Failed to send message');
    }

    return data.message;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
}
```

### Get Circle Messages (with Polling)
```javascript
async function getCircleMessages(circleId, limit = 50) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/circles/${circleId}/messages?limit=${limit}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get messages');
    }

    return data.messages; // Array of messages
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
}

// Poll for new messages (every 5 seconds)
function startMessagePolling(circleId, onNewMessages) {
  const interval = setInterval(async () => {
    try {
      const messages = await getCircleMessages(circleId);
      onNewMessages(messages);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 5000);

  return () => clearInterval(interval); // Return cleanup function
}
```

### Search Resources
```javascript
async function searchResources(filters) {
  try {
    const params = new URLSearchParams();
    
    if (filters.country) params.append('country', filters.country);
    if (filters.region) params.append('region', filters.region);
    if (filters.type) params.append('type', filters.type);
    if (filters.lat) params.append('lat', filters.lat);
    if (filters.lng) params.append('lng', filters.lng);
    if (filters.radius) params.append('radius', filters.radius);

    const response = await fetch(
      `${API_BASE_URL}/resources?${params.toString()}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to search resources');
    }

    return data.resources;
  } catch (error) {
    console.error('Search resources error:', error);
    throw error;
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Not a member of this circle" Error
**Problem:** Trying to send message without being matched to circle first.

**Solution:**
```javascript
// ALWAYS match to circle first
const matchResponse = await fetch(`${API_BASE_URL}/circles/match`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    incidentType: 'online_harassment',
    locationRegion: 'kenya',
    language: 'english'
  })
});

const matchData = await matchResponse.json();
// Save circleId and anonymousId before sending messages
```

### Issue 2: Invalid circleId Format
**Problem:** circleId from URL params might not be valid ObjectId.

**Solution:**
```javascript
// Validate circleId before using
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

if (!isValidObjectId(circleId)) {
  throw new Error('Invalid circle ID');
}
```

### Issue 3: CORS Errors
**Problem:** Frontend can't access API due to CORS.

**Solution:**
- Backend already has CORS enabled
- If issues persist, check backend is running on correct port
- Verify API_BASE_URL matches backend URL

### Issue 4: Token Expired
**Problem:** Admin token expires after 8 hours.

**Solution:**
```javascript
// Check token before making admin requests
async function getAdminToken() {
  let token = localStorage.getItem('admin_token');
  
  // Optionally check if token is expired
  // If expired, redirect to login
  if (!token) {
    // Redirect to login
    return null;
  }
  
  return token;
}
```

### Issue 5: Messages Not Appearing
**Problem:** Messages sent but not showing up.

**Solution:**
```javascript
// Ensure you're using the correct circleId
// Messages are sorted chronologically (oldest first)
// Check that you're polling/refreshing messages after sending
```

---

## ✅ Testing Checklist

### Before Integration
- [ ] Backend server is running on `http://localhost:5000`
- [ ] Swagger UI accessible at `http://localhost:5000/api-docs`
- [ ] MongoDB is connected
- [ ] Test endpoints in Swagger first

### Core Functionality Tests
- [ ] Submit anonymous report
- [ ] Match to peer support circle
- [ ] Get circle details
- [ ] Send message to circle
- [ ] Get circle messages
- [ ] Search resources
- [ ] Admin login
- [ ] Get reports (admin)

### Error Handling Tests
- [ ] Invalid credentials (401)
- [ ] Missing required fields (400)
- [ ] Not a member error (403)
- [ ] Invalid circle ID (404)
- [ ] Network errors

### Edge Cases
- [ ] Empty message array (new circle)
- [ ] Maximum message length (2000 chars)
- [ ] Special characters in messages
- [ ] Multiple users in same circle
- [ ] Leaving and rejoining circle

---

## 📚 Additional Resources

- **Swagger Documentation**: `http://localhost:5000/api-docs`
- **API Root**: `http://localhost:5000` (shows all endpoints)
- **Backend Setup Guide**: See `SETUP.md`

---

## 🆘 Need Help?

If you encounter issues:
1. Check Swagger UI for endpoint details
2. Verify request format matches examples
3. Check browser console for errors
4. Verify backend is running
5. Check network tab for actual request/response

**Common Debugging:**
```javascript
// Add logging to see actual requests
console.log('Request URL:', url);
console.log('Request Body:', body);
console.log('Response Status:', response.status);
console.log('Response Data:', data);
```

---

## 📝 Quick Reference Card

```javascript
// API Base
const API = 'http://localhost:5000/api';

// Submit Report
POST /api/reports
Body: { description, title?, category?, location?, seekingPeerSupport?, incidentType?, locationRegion? }

// Match to Circle
POST /api/circles/match
Body: { incidentType, locationRegion, language?, displayName? }
Returns: { circle: { id }, member: { anonymousId } }

// Send Message
POST /api/circles/:circleId/messages
Body: { anonymousId, message }
Requires: User must be matched to circle first

// Get Messages
GET /api/circles/:circleId/messages?limit=50

// Search Resources
GET /api/resources?country=Kenya&type=ngo

// Admin Login
POST /api/auth/login
Body: { username, password }
Returns: { token }
```

---

**Last Updated:** 2025-01-15  
**API Version:** 2.0.0

