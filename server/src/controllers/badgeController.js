const badgeService = require('../services/badgeService');

// Get user's badges
exports.getMyBadges = async (req, res) => {
  try {
    const { anonymousId } = req.query;

    if (!anonymousId) {
      return res.status(400).json({ message: 'anonymousId is required' });
    }

    const badges = await badgeService.getBadgesForUser(anonymousId);
    const progress = await badgeService.getProgressTowardBadges(anonymousId);

    return res.json({
      badges: badges.map(b => ({
        id: b.id,
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        rarity: b.badge.rarity,
        earnedAt: b.earnedAt,
        progress: b.progress
      })),
      progressTowardNext: progress.map(p => ({
        badge: {
          name: p.badge.name,
          description: p.badge.description,
          icon: p.badge.icon,
          rarity: p.badge.rarity,
          criteria: p.badge.criteria
        },
        progress: p.progress
      }))
    });
  } catch (error) {
    console.error('Error getting badges:', error);
    return res.status(500).json({ message: 'Error retrieving badges' });
  }
};

// Get all available badges
exports.getAllBadges = async (req, res) => {
  try {
    const Badge = require('../models/Badge');
    const badges = await Badge.find({ isActive: true }).sort({ points: -1 });

    return res.json({
      badges: badges.map(b => ({
        id: b._id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        criteria: b.criteria,
        rarity: b.rarity,
        points: b.points
      }))
    });
  } catch (error) {
    console.error('Error getting all badges:', error);
    return res.status(500).json({ message: 'Error retrieving badges' });
  }
};

// Initialize badges (admin only - can be called once)
exports.initializeBadges = async (req, res) => {
  try {
    await badgeService.initializeBadges();
    return res.json({ message: 'Badges initialized successfully' });
  } catch (error) {
    console.error('Error initializing badges:', error);
    return res.status(500).json({ message: 'Error initializing badges' });
  }
};

// Mark badge as notified
exports.markNotified = async (req, res) => {
  try {
    const { userBadgeId } = req.body;
    await badgeService.markBadgeNotified(userBadgeId);
    return res.json({ message: 'Badge marked as notified' });
  } catch (error) {
    console.error('Error marking badge as notified:', error);
    return res.status(500).json({ message: 'Error updating badge' });
  }
};

