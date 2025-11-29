require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db/connect');
const { swaggerUi, specs } = require('./src/config/swagger');

// Import routers
const reportsRouter = require('./src/routes/reports');
const authRouter = require('./src/routes/auth');
const circlesRouter = require('./src/routes/circle.route');
const developerRouter = require('./src/routes/developer.route');
const resourcesRouter = require('./src/routes/resource.route');
const badgeRouter = require('./src/routes/badge.route');
const emailRouter = require('./src/routes/email.route');
const trustRouter = require('./src/routes/trust.route');
const chatRouter = require('./src/routes/chat.route');

// Import language middleware
const languageMiddleware = require('./src/middleware/language.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Language detection middleware (must be before routes)
app.use(languageMiddleware);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SafeCircle API Documentation'
}));

// Routes
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/circles', circlesRouter);
app.use('/api/developer', developerRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/badges', badgeRouter);
app.use('/api/email', emailRouter);
app.use('/api/trust', trustRouter);
app.use('/api/chat', chatRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'SafeCircle API running',
    version: '2.0',
    endpoints: {
      reports: '/api/reports',
      circles: '/api/circles',
      resources: '/api/resources',
      developer: '/api/developer',
      documentation: '/docs'
    }
  });
});

// API Documentation endpoint (simple version)
app.get('/docs', (req, res) => {
  res.json({
    title: 'SafeCircle API Documentation',
    version: '2.0',
    description: 'Peer-to-peer safety network API for developers',
    baseUrl: `http://localhost:${PORT}/api`,
    
    endpoints: {
      
      // PEER MATCHING
      peerMatching: {
        endpoint: 'POST /circles/match',
        description: 'Find or create matching peer support circle',
        authentication: 'None (public)',
        requestBody: {
          incidentType: 'string (required) - e.g., "online_harassment"',
          locationRegion: 'string (required) - e.g., "kenya"',
          language: 'string (optional) - default "english"',
          tags: 'array (optional) - additional matching criteria',
          displayName: 'string (optional) - anonymous display name',
          reportId: 'string (optional) - link to report'
        },
        response: {
          circle: { id: '...', name: '...', memberCount: 3 },
          member: { anonymousId: '...', displayName: '...' },
          matchReason: 'Why this match was selected',
          isNewCircle: true
        }
      },

      // CIRCLE MESSAGES
      getMessages: {
        endpoint: 'GET /circles/:circleId/messages',
        description: 'Get messages from a circle',
        authentication: 'None',
        queryParams: {
          limit: 'number (default 50)',
          before: 'timestamp - pagination'
        }
      },

      sendMessage: {
        endpoint: 'POST /circles/:circleId/messages',
        description: 'Send message to circle',
        authentication: 'None',
        requestBody: {
          anonymousId: 'string (required)',
          message: 'string (required)'
        }
      },

      // RESOURCES
      getResources: {
        endpoint: 'GET /resources',
        description: 'Find help resources by location',
        authentication: 'None',
        queryParams: {
          country: 'string - e.g., "Kenya"',
          region: 'string - e.g., "Nairobi"',
          type: 'string - hotline|ngo|legal_aid|shelter|counseling',
          lat: 'number - latitude for geospatial search',
          lng: 'number - longitude',
          radius: 'number - search radius in km (default 50)'
        }
      },

      // DEVELOPER API
      registerApiKey: {
        endpoint: 'POST /developer/register',
        description: 'Register for API key',
        authentication: 'None',
        requestBody: {
          name: 'string (required)',
          email: 'string (required)',
          appName: 'string (required)',
          appDescription: 'string (optional)'
        },
        response: {
          apiKey: { key: 'sk_...', tier: 'free', requestLimit: 1000 }
        }
      },

      getUsage: {
        endpoint: 'GET /developer/usage',
        description: 'Check API usage',
        authentication: 'API Key (X-API-Key header)',
        response: {
          usage: {
            requestsThisMonth: 45,
            requestLimit: 1000,
            remaining: 955
          }
        }
      }
    },

    authentication: {
      apiKey: {
        description: 'Include in request header',
        header: 'X-API-Key: sk_your_api_key_here',
        alternative: 'Authorization: Bearer sk_your_api_key_here'
      }
    },

    rateLimits: {
      free: '1,000 requests/month',
      startup: '10,000 requests/month - $99',
      enterprise: 'Unlimited - $999'
    },

    examples: {
      curl: {
        peerMatch: `curl -X POST http://localhost:${PORT}/api/circles/match \\
  -H "Content-Type: application/json" \\
  -d '{
    "incidentType": "online_harassment",
    "locationRegion": "kenya",
    "language": "english"
  }'`,
        
        getResources: `curl "http://localhost:${PORT}/api/resources?country=Kenya&type=ngo"`,
        
        withApiKey: `curl http://localhost:${PORT}/api/developer/usage \\
  -H "X-API-Key: sk_your_api_key_here"`
      },
      
      javascript: {
        peerMatch: `fetch('http://localhost:${PORT}/api/circles/match', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    incidentType: 'online_harassment',
    locationRegion: 'kenya'
  })
})
.then(res => res.json())
.then(data => console.log(data.circle));`,

        withApiKey: `fetch('http://localhost:${PORT}/api/developer/usage', {
  headers: { 'X-API-Key': 'sk_your_api_key_here' }
})
.then(res => res.json())
.then(data => console.log(data.usage));`
      }
    },

    support: {
      email: 'daniel@safecircle.org',
      documentation: 'https://docs.safecircle.org',
      github: 'https://github.com/safecircle/api'
    }
  });
});

// Import Socket.io setup
const { initializeSocketIO } = require('./src/sockets/circleSocket');

// Import cron jobs
const weeklyDigestJob = require('./src/jobs/weeklyDigest');

// Start server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const server = app.listen(PORT, () => {
      console.log(`🚀 SafeCircle API listening on port ${PORT}`);
      console.log(`📚 Documentation: http://localhost:${PORT}/docs`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Initialize Socket.io
    initializeSocketIO(server);
    console.log(`⚡ Socket.io initialized on /circles namespace`);

    // Start cron jobs (comment out in development if needed)
    if (process.env.NODE_ENV === 'production') {
      weeklyDigestJob.start();
      console.log(`📧 Weekly digest job scheduled (Mondays 9 AM)`);
    }
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();