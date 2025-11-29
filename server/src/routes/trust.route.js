const express = require('express');
const router = express.Router();
const trustService = require('../services/trustService');

/**
 * GET /api/trust/score?anonymousId=xxx
 * Get trust score
 */
router.get('/score', async (req, res) => {
  try {
    const { anonymousId } = req.query;
    if (!anonymousId) {
      return res.status(400).json({ message: 'anonymousId is required' });
    }

    const trustScore = await trustService.calculateTrustLevel(anonymousId);
    if (!trustScore) {
      return res.status(404).json({ message: 'Trust score not found' });
    }

    return res.json({
      anonymousId,
      trustLevel: trustScore.trustLevel,
      helpfulnessScore: trustScore.helpfulnessScore,
      reportCount: trustScore.reportCount,
      isMuted: trustScore.isMuted,
      isBanned: trustScore.isBanned
    });
  } catch (error) {
    console.error('Error getting trust score:', error);
    return res.status(500).json({ message: 'Error retrieving trust score' });
  }
});

/**
 * POST /api/trust/report
 * Report a user
 */
router.post('/report', async (req, res) => {
  try {
    const { reporterId, reportedId, reason, circleId } = req.body;

    if (!reporterId || !reportedId || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await trustService.reportUser(reporterId, reportedId, reason, circleId);
    return res.json(result);
  } catch (error) {
    console.error('Error reporting user:', error);
    return res.status(500).json({ message: 'Error reporting user' });
  }
});

/**
 * POST /api/trust/block
 * Block a user
 */
router.post('/block', async (req, res) => {
  try {
    const { anonymousId, blockUserId } = req.body;

    if (!anonymousId || !blockUserId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await trustService.blockUser(blockUserId);
    return res.json(result);
  } catch (error) {
    console.error('Error blocking user:', error);
    return res.status(500).json({ message: 'Error blocking user' });
  }
});

module.exports = router;

