const express = require('express');
const router = express.Router();
const EmailPreference = require('../models/EmailPreference');

/**
 * GET /api/email/preferences?anonymousId=xxx
 * Get email preferences
 */
router.get('/preferences', async (req, res) => {
  try {
    const { anonymousId } = req.query;
    if (!anonymousId) {
      return res.status(400).json({ message: 'anonymousId is required' });
    }

    const preferences = await EmailPreference.findOne({ anonymousId });
    if (!preferences) {
      return res.json({ preferences: null });
    }

    return res.json({ preferences });
  } catch (error) {
    console.error('Error getting preferences:', error);
    return res.status(500).json({ message: 'Error retrieving preferences' });
  }
});

/**
 * POST /api/email/preferences
 * Update email preferences
 */
router.post('/preferences', async (req, res) => {
  try {
    const { anonymousId, email, ...prefs } = req.body;
    
    if (!anonymousId) {
      return res.status(400).json({ message: 'anonymousId is required' });
    }

    const preferences = await EmailPreference.findOneAndUpdate(
      { anonymousId },
      {
        anonymousId,
        email,
        ...prefs,
        unsubscribed: false
      },
      { upsert: true, new: true }
    );

    return res.json({ 
      message: 'Preferences updated successfully',
      preferences 
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return res.status(500).json({ message: 'Error updating preferences' });
  }
});

/**
 * POST /api/email/unsubscribe
 * Unsubscribe from all emails
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { anonymousId } = req.body;
    
    if (!anonymousId) {
      return res.status(400).json({ message: 'anonymousId is required' });
    }

    await EmailPreference.findOneAndUpdate(
      { anonymousId },
      {
        unsubscribed: true,
        unsubscribedAt: new Date(),
        welcomeEmails: false,
        circleNotifications: false,
        weeklyDigest: false,
        badgeNotifications: false,
        resourceRecommendations: false
      },
      { upsert: true }
    );

    return res.json({ message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return res.status(500).json({ message: 'Error unsubscribing' });
  }
});

module.exports = router;

