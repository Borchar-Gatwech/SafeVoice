const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');

/**
 * GET /api/badges/my-badges?anonymousId=xxx
 * Get user's earned badges and progress
 */
router.get('/my-badges', badgeController.getMyBadges);

/**
 * GET /api/badges/all
 * Get all available badges
 */
router.get('/all', badgeController.getAllBadges);

/**
 * POST /api/badges/initialize
 * Initialize default badges (admin/one-time setup)
 */
router.post('/initialize', badgeController.initializeBadges);

/**
 * POST /api/badges/notified
 * Mark badge as notified
 */
router.post('/notified', badgeController.markNotified);

module.exports = router;

