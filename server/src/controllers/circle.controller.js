const Circle = require('../models/circle.model');
const CircleMember = require('../models/circleMember.model');
const CircleMessage = require('../models/circleMessage.model');
const MatchingService = require('../services/matching.service');

/**
 * POST /api/circles/match
 * Find or create matching circle for survivor
 */
exports.findMatch = async (req, res) => {
  try {
    const { 
      incidentType, 
      locationRegion, 
      language, 
      ageRange,
      severity,
      tags,
      reportId,
      displayName 
    } = req.body;

    // Validate required fields
    if (!incidentType || !locationRegion) {
      return res.status(400).json({ 
        message: 'incidentType and locationRegion are required' 
      });
    }

    // Find matching circle
    const matchResult = await MatchingService.findMatch({
      incidentType,
      locationRegion,
      language: language || 'english',
      ageRange,
      severity,
      tags,
      reportId
    });

    // Auto-join the user to the circle
    const { member, anonymousId } = await MatchingService.joinCircle(
      matchResult.circle._id,
      { displayName, reportId }
    );

    return res.status(200).json({
      success: true,
      circle: {
        id: matchResult.circle._id,
        name: matchResult.circle.name,
        description: matchResult.circle.description,
        memberCount: matchResult.circle.memberCount + 1, // Include new member
        language: matchResult.circle.language,
        incidentType: matchResult.circle.incidentType
      },
      member: {
        anonymousId: anonymousId,
        displayName: member.displayName
      },
      matchReason: matchResult.matchReason,
      isNewCircle: matchResult.isNewCircle
    });

  } catch (error) {
    console.error('Match error:', error);
    return res.status(500).json({ message: 'Error finding match', error: error.message });
  }
};

/**
 * GET /api/circles/:circleId
 * Get circle details
 */
exports.getCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const circle = await Circle.findById(circleId);

    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Get member count
    const members = await CircleMember.find({ 
      circleId: circleId, 
      isActive: true 
    }).select('displayName joinedAt helpfulnessScore');

    return res.json({
      circle: {
        id: circle._id,
        name: circle.name,
        description: circle.description,
        memberCount: circle.memberCount,
        language: circle.language,
        incidentType: circle.incidentType,
        createdAt: circle.createdAt
      },
      members: members.map(m => ({
        displayName: m.displayName,
        joinedAt: m.joinedAt,
        helpfulnessScore: m.helpfulnessScore
      }))
    });

  } catch (error) {
    console.error('Get circle error:', error);
    return res.status(500).json({ message: 'Error retrieving circle' });
  }
};

/**
 * GET /api/circles/:circleId/messages
 * Get circle messages
 */
exports.getMessages = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { circleId: circleId };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await CircleMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    return res.json({
      messages: messages.reverse().map(m => ({
        id: m._id,
        senderDisplayName: m.senderDisplayName,
        message: m.message,
        timestamp: m.timestamp,
        reactions: m.reactions
      }))
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ message: 'Error retrieving messages' });
  }
};

/**
 * POST /api/circles/:circleId/messages
 * Send message to circle
 */
exports.sendMessage = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { anonymousId, message } = req.body;

    if (!anonymousId || !message) {
      return res.status(400).json({ message: 'anonymousId and message are required' });
    }

    // Verify member belongs to circle
    const member = await CircleMember.findOne({ 
      circleId: circleId, 
      anonymousId: anonymousId,
      isActive: true 
    });

    if (!member) {
      return res.status(403).json({ message: 'Not a member of this circle' });
    }

    // Basic AI safety check (simple keyword filtering for demo)
    const riskScore = await exports.checkMessageSafety(message);

    const newMessage = new CircleMessage({
      circleId: circleId,
      senderId: anonymousId,
      senderDisplayName: member.displayName,
      message: message,
      aiRiskScore: riskScore,
      flaggedByAI: riskScore > 7
    });

    await newMessage.save();

    // Update member activity
    member.messageCount += 1;
    member.lastActive = new Date();
    await member.save();

    return res.status(201).json({
      message: {
        id: newMessage._id,
        senderDisplayName: newMessage.senderDisplayName,
        message: newMessage.message,
        timestamp: newMessage.timestamp
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ message: 'Error sending message' });
  }
};

/**
 * POST /api/circles/:circleId/leave
 * Leave a circle
 */
exports.leaveCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { anonymousId } = req.body;

    const member = await CircleMember.findOne({ 
      circleId: circleId, 
      anonymousId: anonymousId 
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.isActive = false;
    await member.save();

    // Update circle count
    await Circle.findByIdAndUpdate(circleId, {
      $inc: { memberCount: -1 }
    });

    return res.json({ message: 'Left circle successfully' });

  } catch (error) {
    console.error('Leave circle error:', error);
    return res.status(500).json({ message: 'Error leaving circle' });
  }
};

/**
 * Helper: Check message safety (simple version for demo)
 */
exports.checkMessageSafety = async (message) => {
  // Simple keyword-based risk scoring for demo
  const dangerKeywords = ['kill', 'hurt', 'harm', 'suicide', 'die'];
  const concernKeywords = ['scared', 'afraid', 'danger', 'threat'];
  
  let score = 0;
  const lowerMessage = message.toLowerCase();
  
  dangerKeywords.forEach(word => {
    if (lowerMessage.includes(word)) score += 3;
  });
  
  concernKeywords.forEach(word => {
    if (lowerMessage.includes(word)) score += 1;
  });
  
  return Math.min(score, 10);
};

/**
 * GET /api/circles/stats
 * Get overall circle statistics (for demo/admin)
 */
exports.getStats = async (req, res) => {
  try {
    const totalCircles = await Circle.countDocuments({ isActive: true });
    const totalMembers = await CircleMember.countDocuments({ isActive: true });
    const totalMessages = await CircleMessage.countDocuments();

    const circlesByType = await Circle.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$incidentType', count: { $sum: 1 } } }
    ]);

    return res.json({
      totalCircles,
      totalMembers,
      totalMessages,
      circlesByType: circlesByType.map(c => ({
        type: c._id,
        count: c.count
      }))
    });

  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ message: 'Error retrieving stats' });
  }
};