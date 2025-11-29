# SafeCircle API - Quick Reference

## 🔗 Base URL
```
Development: http://localhost:5000/api
Production: https://api.safecircle.org/api
```

---

## 📋 Essential Endpoints

### 1. Reports
```http
POST   /api/reports              # Submit report
GET    /api/reports              # Get all (Admin, Bearer token)
PATCH  /api/reports/:id/reviewed # Mark reviewed (Admin)
```

### 2. Circles (Peer Support)
```http
POST   /api/circles/match              # Match to circle
GET    /api/circles/:id               # Get circle details
GET    /api/circles/:id/messages       # Get messages
POST   /api/circles/:id/messages       # Send message
POST   /api/circles/:id/leave          # Leave circle
GET    /api/circles/stats              # Stats (API key required)
```

### 3. Resources
```http
GET    /api/resources          # Search resources
GET    /api/resources/:id     # Get resource details
POST   /api/resources/seed   # Seed database
```

### 4. Auth
```http
POST   /api/auth/login         # Admin login
```

### 5. Developer
```http
POST   /api/developer/register   # Get API key
GET    /api/developer/usage       # Check usage (API key)
POST   /api/developer/regenerate # Regenerate key
```

---

## 🔑 Authentication

### Admin (JWT)
```javascript
Authorization: Bearer <token>
```

### Developer (API Key)
```javascript
X-API-Key: sk_xxxxx
// OR
Authorization: Bearer sk_xxxxx
```

---

## 📤 Request Examples

### Submit Report
```json
POST /api/reports
{
  "description": "Required field",
  "title": "Optional",
  "category": "🌐 Online",
  "seekingPeerSupport": true,
  "incidentType": "online_harassment",
  "locationRegion": "kenya"
}
```

### Match to Circle
```json
POST /api/circles/match
{
  "incidentType": "online_harassment",
  "locationRegion": "kenya",
  "language": "english"
}
```

### Send Message
```json
POST /api/circles/:circleId/messages
{
  "anonymousId": "anon_xxxxx",
  "message": "Your message here"
}
```

---

## 📥 Response Examples

### Match Response
```json
{
  "circle": { "id": "..." },
  "member": { "anonymousId": "anon_xxxxx" }
}
```

### Messages Response
```json
{
  "messages": [
    {
      "id": "...",
      "senderDisplayName": "Brave Survivor",
      "message": "...",
      "timestamp": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## ⚠️ Important Notes

1. **Save IDs**: After matching, save `circle.id` and `member.anonymousId`
2. **Member Required**: Must match to circle before sending messages
3. **Description Required**: Report submission requires `description`
4. **Token Expiry**: Admin tokens expire in 8 hours
5. **Message Limit**: Max 2000 characters per message

---

## 🐛 Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Missing required field | Check request body |
| 401 | Unauthorized | Check token/API key |
| 403 | Not a member | Match to circle first |
| 404 | Not found | Check ID format |
| 429 | Rate limit | Wait or upgrade tier |

---

## 🔍 Testing

**Swagger UI**: `http://localhost:5000/api-docs`

Test endpoints directly in browser before frontend integration.

