const TrustScore = require('../models/TrustScore');
const CircleMember = require('../models/circleMember.model');
const CircleMessage = require('../models/circleMessage.model');

// Calculate and update trust level
async function calculateTrustLevel(anonymousId) {
  try {
    let trustScore = await TrustScore.findOne({ anonymousId });

    if (!trustScore) {
      trustScore = new TrustScore({ anonymousId });
    }

    // Get stats
    const messagesCount = await CircleMessage.countDocuments({ senderId: anonymousId });
    const circlesJoined = await CircleMember.countDocuments({ 
      anonymousId, 
      isActive: true 
    });

    // Count reactions received
    const messages = await CircleMessage.find({ senderId: anonymousId });
    let totalReactions = 0;
    messages.forEach(msg => {
      if (msg.reactions) {
        msg.reactions.forEach(reaction => {
          totalReactions += reaction.count;
        });
      }
    });

    // Calculate helpfulness score
    const helpfulnessScore = Math.min(100, 
      (totalReactions * 10) + 
      (messagesCount * 2) - 
      (trustScore.reportCount * 20)
    );

    // Determine trust level
    let trustLevel = 'newcomer';
    if (messagesCount >= 20 && totalReactions >= 20 && trustScore.reportCount === 0) {
      trustLevel = 'veteran';
    } else if (messagesCount >= 5 && totalReactions >= 5 && trustScore.reportCount === 0) {
      trustLevel = 'trusted';
    }

    // Update trust score
    trustScore.messagesCount = messagesCount;
    trustScore.joinedCirclesCount = circlesJoined;
    trustScore.reactionsReceived = totalReactions;
    trustScore.helpfulnessScore = Math.max(0, helpfulnessScore);
    trustScore.trustLevel = trustLevel;
    trustScore.lastActivityAt = new Date();

    await trustScore.save();
    return trustScore;
  } catch (error) {
    console.error('Error calculating trust level:', error);
    return null;
  }
}

// Report a user
async function reportUser(reporterId, reportedId, reason, circleId) {
  try {
    const trustScore = await calculateTrustLevel(reportedId);
    
    if (!trustScore) {
      return { success: false, message: 'User not found' };
    }

    trustScore.reportCount += 1;
    
    // Auto-mute after 3 reports
    if (trustScore.reportCount >= 3 && !trustScore.isMuted) {
      trustScore.isMuted = true;
      const muteDuration = new Date();
      muteDuration.setDate(muteDuration.getDate() + 7); // 7 days
      trustScore.mutedUntil = muteDuration;
    }

    await trustScore.save();

    // TODO: Create report entry in moderation queue
    // await ModerationReport.create({ reporterId, reportedId, reason, circleId });

    return {
      success: true,
      message: 'User reported successfully',
      muted: trustScore.isMuted
    };
  } catch (error) {
    console.error('Error reporting user:', error);
    return { success: false, message: 'Error reporting user' };
  }
}

// Check suspicious activity
async function checkSuspiciousActivity(anonymousId) {
  try {
    const trustScore = await calculateTrustLevel(anonymousId);
    
    if (!trustScore) return { suspicious: false };

    const suspicious = {
      suspicious: false,
      reasons: []
    };

    // Check for rapid circle joining
    const recentCircles = await CircleMember.countDocuments({
      anonymousId,
      joinedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });

    if (recentCircles > 5) {
      suspicious.suspicious = true;
      suspicious.reasons.push('Rapid circle joining');
    }

    // Check for multiple reports
    if (trustScore.reportCount >= 2) {
      suspicious.suspicious = true;
      suspicious.reasons.push('Multiple reports');
    }

    // Check for low helpfulness with high message count
    if (trustScore.messagesCount > 10 && trustScore.helpfulnessScore < 20) {
      suspicious.suspicious = true;
      suspicious.reasons.push('Low helpfulness score');
    }

    return suspicious;
  } catch (error) {
    console.error('Error checking suspicious activity:', error);
    return { suspicious: false };
  }
}

// Mute user
async function muteUser(anonymousId, durationDays = 7, reason = '') {
  try {
    const trustScore = await TrustScore.findOne({ anonymousId });
    
    if (!trustScore) {
      return { success: false, message: 'User not found' };
    }

    trustScore.isMuted = true;
    const muteUntil = new Date();
    muteUntil.setDate(muteUntil.getDate() + durationDays);
    trustScore.mutedUntil = muteUntil;
    trustScore.warningsReceived += 1;

    await trustScore.save();

    return { success: true, mutedUntil: muteUntil };
  } catch (error) {
    console.error('Error muting user:', error);
    return { success: false, message: 'Error muting user' };
  }
}

// Block user
async function blockUser(anonymousId, reason = '') {
  try {
    const trustScore = await TrustScore.findOne({ anonymousId });
    
    if (!trustScore) {
      return { success: false, message: 'User not found' };
    }

    trustScore.isBanned = true;
    trustScore.isMuted = true;
    await trustScore.save();

    return { success: true };
  } catch (error) {
    console.error('Error blocking user:', error);
    return { success: false, message: 'Error blocking user' };
  }
}

module.exports = {
  calculateTrustLevel,
  reportUser,
  checkSuspiciousActivity,
  muteUser,
  blockUser
};

