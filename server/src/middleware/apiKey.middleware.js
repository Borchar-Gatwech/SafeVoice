const ApiKey = require('../models/apiKey.model');

/**
 * Middleware to validate API key for developer endpoints
 */
module.exports = async function(req, res, next) {
  try {
    // Extract API key from header
    const authHeader = req.headers['x-api-key'] || req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'API key required. Include X-API-Key header.',
        documentation: '/docs'
      });
    }

    // Handle both "Bearer sk_xxx" and "sk_xxx" formats
    let apiKey = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    }

    // Validate API key
    const apiKeyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });

    if (!apiKeyDoc) {
      return res.status(401).json({ 
        message: 'Invalid or inactive API key',
        documentation: '/docs'
      });
    }

    // Check rate limit
    if (apiKeyDoc.requestsThisMonth >= apiKeyDoc.requestLimit) {
      return res.status(429).json({ 
        message: 'API rate limit exceeded',
        limit: apiKeyDoc.requestLimit,
        tier: apiKeyDoc.tier,
        upgrade: '/pricing'
      });
    }

    // Increment usage counter
    apiKeyDoc.requestsThisMonth += 1;
    apiKeyDoc.lastUsed = new Date();
    await apiKeyDoc.save();

    // Attach API key info to request
    req.apiKey = apiKeyDoc;

    next();

  } catch (error) {
    console.error('API key auth error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};