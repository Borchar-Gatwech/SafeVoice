const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SafeCircle API',
      version: '2.0.0',
      description: 'Peer-to-peer safety network API for developers. Match survivors to support circles, access resources, and integrate safety features into your platform.',
      contact: {
        name: 'SafeCircle Support',
        email: 'daniel@safecircle.org'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      },
      {
        url: 'https://api.safecircle.org',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for developer access'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for admin access'
        }
      }
    },
    tags: [
      {
        name: 'Reports',
        description: 'Anonymous incident reporting'
      },
      {
        name: 'Circles',
        description: 'Peer support circle matching and messaging'
      },
      {
        name: 'Resources',
        description: 'Location-based safety resources'
      },
      {
        name: 'Developer',
        description: 'API key management and usage'
      },
      {
        name: 'Auth',
        description: 'Admin authentication'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './index.js',
    './routes/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };

