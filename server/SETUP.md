# SafeCircle Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory with:

```env
MONGO_URI=mongodb://localhost:27017/safecircle
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
ADMIN_USER=admin
ADMIN_PASS=safe1234
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Documentation (Swagger)

Once the server is running, visit:
- **Swagger UI**: http://localhost:5000/api-docs
- **API Root**: http://localhost:5000
- **API Docs JSON**: http://localhost:5000/api-docs.json

## Key Endpoints

### Reports
- `POST /api/reports` - Submit anonymous report
- `GET /api/reports` - Get all reports (Admin only)
- `PATCH /api/reports/:id/reviewed` - Mark as reviewed

### Circles (Peer Support)
- `POST /api/circles/match` - Find or create matching circle
- `GET /api/circles/:circleId` - Get circle details
- `GET /api/circles/:circleId/messages` - Get messages
- `POST /api/circles/:circleId/messages` - Send message
- `POST /api/circles/:circleId/leave` - Leave circle

### Resources
- `GET /api/resources` - Find resources by location
- `GET /api/resources/:id` - Get resource details
- `POST /api/resources/seed` - Seed database with African resources

### Developer API
- `POST /api/developer/register` - Register for API key
- `GET /api/developer/usage` - Check usage (requires API key)
- `POST /api/developer/regenerate` - Regenerate API key

### Auth
- `POST /api/auth/login` - Admin login

## Testing with Swagger

1. Start the server: `npm run dev`
2. Open http://localhost:5000/api-docs in your browser
3. Use the interactive Swagger UI to test all endpoints
4. For protected endpoints:
   - **Admin endpoints**: Click "Authorize" and enter JWT token from `/api/auth/login`
   - **Developer endpoints**: Click "Authorize" and enter API key in format `sk_xxxxx`

## Getting a Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

## Database Setup

Make sure MongoDB is running:
- Local: `mongod` or start MongoDB service
- Atlas: Use connection string in `MONGO_URI`

## Troubleshooting

### "Cannot find module" errors
- Make sure all dependencies are installed: `npm install`
- Check that all model files exist in `src/models/`

### MongoDB connection errors
- Verify MongoDB is running
- Check `MONGO_URI` in `.env` file
- For Atlas, ensure IP is whitelisted

### Swagger not loading
- Check that server is running on correct port
- Verify `swagger-ui-express` and `swagger-jsdoc` are installed
- Check browser console for errors

