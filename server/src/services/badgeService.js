const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const CircleMember = require('../models/circleMember.model');
const CircleMessage = require('../models/circleMessage.model');
const Report = require('../models/Report');

// Initialize default badges if they don't exist
async function initializeBadges() {
  const defaultBadges = [
    {
      name: 'Bravely',
      description: 'Submitted your first report',
      icon: '🛡️',
      criteria: 'submit_report',
      rarity: 'common',
      points: 20
    },
    {
      name: 'You Are Not Alone',
      description: 'Joined your first support circle - You are part of a support group',
      icon: '🌟',
      criteria: 'join_first_circle',
      rarity: 'common',
      points: 10
    },
    {
      name: 'Strength in Numbers',
      description: 'Sent 10 supportive messages',
      icon: '💪',
      criteria: 'send_10_messages',
      rarity: 'common',
      points: 15,
      progress: true
    },
    {
      name: 'Circle Guardian',
      description: 'Helped 5 different people',
      icon: '🤝',
      criteria: 'help_5_members',
      rarity: 'rare',
      points: 25,
      progress: true
    },
    {
      name: 'Active Supporter',
      description: 'Logged in 7 days in a row',
      icon: '🎯',
      criteria: 'consecutive_7_days',
      rarity: 'rare',
      points: 30,
      progress: true
    },
    {
      name: 'Voice of Encouragement',
      description: 'Received 10 helpful reactions',
      icon: '💬',
      criteria: 'receive_10_reactions',
      rarity: 'rare',
      points: 25,
      progress: true
    },
    {
      name: 'Community Builder',
      description: 'Invited someone to your circle',
      icon: '🌍',
      criteria: 'invite_member',
      rarity: 'legendary',
      points: 50
    },
    {
      name: 'Rising Phoenix',
      description: 'Completed personal growth milestone',
      icon: '⭐',
      criteria: 'growth_milestone',
      rarity: 'legendary',
      points: 100
    }
  ];

  for (const badgeData of defaultBadges) {
    await Badge.findOneAndUpdate(
      { name: badgeData.name },
      badgeData,
      { upsert: true, new: true }
    );
  }

  console.log('✅ Badges initialized');
}

// Check and award badges based on action
async function checkAndAwardBadges(anonymousId, action, actionData = {}) {
  const awardedBadges = [];

  try {
    // Get all active badges
    const badges = await Badge.find({ isActive: true });

    for (const badge of badges) {
      // Skip if user already has this badge
      const existingBadge = await UserBadge.findOne({
        anonymousId,
        badgeId: badge._id
      });

      if (existingBadge) continue;

      let shouldAward = false;
      let progress = 0;

      // Check criteria based on action type
      switch (badge.criteria) {
        case 'submit_report':
          if (action === 'submit_report') {
            const reportCount = await Report.countDocuments({
              anonymousId
            });
            shouldAward = reportCount >= 1;
          }
          break;

        case 'join_first_circle':
          if (action === 'join_circle') {
            const circleCount = await CircleMember.countDocuments({
              anonymousId,
              isActive: true
            });
            shouldAward = circleCount >= 1;
          }
          break;

        case 'send_10_messages':
          if (action === 'send_message') {
            const messageCount = await CircleMessage.countDocuments({
              senderId: anonymousId
            });
            progress = messageCount;
            shouldAward = messageCount >= 10;
          }
          break;

        case 'help_5_members':
          if (action === 'receive_reaction' || action === 'send_message') {
            // Count unique members who reacted to user's messages
            const messages = await CircleMessage.find({
              senderId: anonymousId,
              'reactions.users': { $exists: true, $ne: [] }
            });
            const helpedMembers = new Set();
            messages.forEach(msg => {
              msg.reactions.forEach(reaction => {
                reaction.users.forEach(userId => {
                  if (userId !== anonymousId) {
                    helpedMembers.add(userId);
                  }
                });
              });
            });
            progress = helpedMembers.size;
            shouldAward = helpedMembers.size >= 5;
          }
          break;

        case 'consecutive_7_days':
          // This requires tracking login dates (simplified here)
          // In production, you'd check a login history model
          if (action === 'login') {
            // Simplified: award after 7 logins (should be consecutive in production)
            progress = actionData.consecutiveDays || 0;
            shouldAward = (actionData.consecutiveDays || 0) >= 7;
          }
          break;

        case 'receive_10_reactions':
          if (action === 'receive_reaction') {
            const messages = await CircleMessage.find({
              senderId: anonymousId,
              'reactions.users': { $exists: true, $ne: [] }
            });
            let totalReactions = 0;
            messages.forEach(msg => {
              msg.reactions.forEach(reaction => {
                totalReactions += reaction.count;
              });
            });
            progress = totalReactions;
            shouldAward = totalReactions >= 10;
          }
          break;

        case 'invite_member':
          if (action === 'invite_member') {
            shouldAward = true;
          }
          break;

        case 'growth_milestone':
          if (action === 'growth_milestone') {
            shouldAward = true;
          }
          break;
      }

      // Award badge if criteria met
      if (shouldAward) {
        const userBadge = new UserBadge({
          anonymousId,
          badgeId: badge._id,
          progress: badge.progress ? progress : 0,
          notified: false
        });

        await userBadge.save();
        awardedBadges.push({
          ...badge.toObject(),
          earnedAt: userBadge.earnedAt,
          progress
        });
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
}

// Get all badges for a user
async function getBadgesForUser(anonymousId) {
  try {
    const userBadges = await UserBadge.find({ anonymousId })
      .populate('badgeId')
      .sort({ earnedAt: -1 });

    return userBadges.map(ub => ({
      id: ub._id,
      badge: ub.badgeId,
      earnedAt: ub.earnedAt,
      progress: ub.progress,
      notified: ub.notified
    }));
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

// Get progress toward next badges
async function getProgressTowardBadges(anonymousId) {
  try {
    const allBadges = await Badge.find({ isActive: true });
    const userBadges = await UserBadge.find({ anonymousId });
    const userBadgeIds = new Set(userBadges.map(ub => ub.badgeId.toString()));

    const progressData = [];

    for (const badge of allBadges) {
      if (userBadgeIds.has(badge._id.toString())) continue; // Already earned

      let current = 0;
      let target = 0;

      switch (badge.criteria) {
        case 'send_10_messages':
          current = await CircleMessage.countDocuments({ senderId: anonymousId });
          target = 10;
          break;
        case 'receive_10_reactions':
          const messages = await CircleMessage.find({
            senderId: anonymousId,
            'reactions.users': { $exists: true, $ne: [] }
          });
          let totalReactions = 0;
          messages.forEach(msg => {
            msg.reactions.forEach(reaction => {
              totalReactions += reaction.count;
            });
          });
          current = totalReactions;
          target = 10;
          break;
        case 'help_5_members':
          const helpMessages = await CircleMessage.find({
            senderId: anonymousId,
            'reactions.users': { $exists: true, $ne: [] }
          });
          const helped = new Set();
          helpMessages.forEach(msg => {
            msg.reactions.forEach(reaction => {
              reaction.users.forEach(userId => {
                if (userId !== anonymousId) helped.add(userId);
              });
            });
          });
          current = helped.size;
          target = 5;
          break;
        default:
          continue; // Skip non-progressive badges
      }

      if (target > 0) {
        progressData.push({
          badge: badge.toObject(),
          progress: {
            current,
            target,
            percentage: Math.min(100, Math.round((current / target) * 100))
          }
        });
      }
    }

    return progressData;
  } catch (error) {
    console.error('Error getting badge progress:', error);
    return [];
  }
}

// Mark badge as notified
async function markBadgeNotified(userBadgeId) {
  await UserBadge.findByIdAndUpdate(userBadgeId, { notified: true });
}

module.exports = {
  initializeBadges,
  checkAndAwardBadges,
  getBadgesForUser,
  getProgressTowardBadges,
  markBadgeNotified
};

