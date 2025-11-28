const ApiKey = require('../models/apiKey.model');
const crypto = require('crypto');

/**
 * POST /api/developer/register
 * Register for API access
 */
exports.register = async (req, res) => {
  try {
    const { name, email, appName, appDescription } = req.body;

    if (!name || !email || !appName) {
      return res.status(400).json({ 
        message: 'name, email, and appName are required' 
      });
    }

    // Check if email already registered
    const existing = await ApiKey.findOne({ email: email });
    if (existing) {
      return res.status(400).json({ 
        message: 'Email already registered. Check your inbox for existing API key.' 
      });
    }

    // Generate API key
    const apiKey = ApiKey.generateKey();

    const newApiKey = new ApiKey({
      key: apiKey,
      name: appName,
      email: email,
      tier: 'free',
      requestLimit: 1000 // Free tier: 1000 requests/month
    });

    await newApiKey.save();

    return res.status(201).json({
      success: true,
      message: 'API key created successfully',
      apiKey: {
        key: apiKey,
        tier: 'free',
        requestLimit: 1000,
        features: newApiKey.features
      },
      documentation: '/docs',
      warning: 'Keep your API key secure. Do not share it publicly.'
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Error creating API key' });
  }
};

/**
 * GET /api/developer/usage
 * Get API usage stats
 */
exports.getUsage = async (req, res) => {
  try {
    const apiKey = req.apiKey; // Set by API key middleware

    if (!apiKey) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    return res.json({
      appName: apiKey.name,
      tier: apiKey.tier,
      usage: {
        requestsThisMonth: apiKey.requestsThisMonth,
        requestLimit: apiKey.requestLimit,
        remaining: apiKey.requestLimit - apiKey.requestsThisMonth,
        percentage: ((apiKey.requestsThisMonth / apiKey.requestLimit) * 100).toFixed(1)
      },
      features: apiKey.features,
      lastUsed: apiKey.lastUsed,
      createdAt: apiKey.createdAt
    });

  } catch (error) {
    console.error('Usage error:', error);
    return res.status(500).json({ message: 'Error retrieving usage' });
  }
};

/**
 * POST /api/developer/regenerate
 * Regenerate API key
 */
exports.regenerate = async (req, res) => {
  try {
    const { email, oldKey } = req.body;

    if (!email || !oldKey) {
      return res.status(400).json({ message: 'email and oldKey are required' });
    }

    const apiKeyDoc = await ApiKey.findOne({ email: email, key: oldKey });

    if (!apiKeyDoc) {
      return res.status(404).json({ message: 'API key not found' });
    }

    // Generate new key
    const newKey = ApiKey.generateKey();
    apiKeyDoc.key = newKey;
    apiKeyDoc.requestsThisMonth = 0; // Reset usage
    await apiKeyDoc.save();

    return res.json({
      success: true,
      message: 'API key regenerated',
      apiKey: {
        key: newKey,
        tier: apiKeyDoc.tier,
        requestLimit: apiKeyDoc.requestLimit
      }
    });

  } catch (error) {
    console.error('Regenerate error:', error);
    return res.status(500).json({ message: 'Error regenerating API key' });
  }
};