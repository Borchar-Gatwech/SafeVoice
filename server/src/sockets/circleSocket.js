const socketIO = require('socket.io');
const CircleMessage = require('../models/circleMessage.model');
const CircleMember = require('../models/circleMember.model');

// Store online members per circle
const onlineMembers = new Map(); // circleId -> Set of anonymousIds
const typingUsers = new Map(); // circleId -> Map of anonymousId -> timestamp

let io;

function initializeSocketIO(server) {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Circle namespace for peer support circles
  const circleNamespace = io.of('/circles');

  circleNamespace.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a circle room
    socket.on('join-circle', async ({ circleId, anonymousId }) => {
      try {
        // Verify user is a member of this circle
        const member = await CircleMember.findOne({
          circleId: circleId,
          anonymousId: anonymousId,
          isActive: true
        });

        if (!member) {
          socket.emit('error', { message: 'Not a member of this circle' });
          return;
        }

        // Join the room
        socket.join(`circle:${circleId}`);

        // Track online member
        if (!onlineMembers.has(circleId)) {
          onlineMembers.set(circleId, new Set());
        }
        onlineMembers.get(circleId).add(anonymousId);

        // Store socket data
        socket.circleId = circleId;
        socket.anonymousId = anonymousId;
        socket.displayName = member.displayName;

        // Notify others in the circle
        socket.to(`circle:${circleId}`).emit('member-online', {
          anonymousId,
          displayName: member.displayName
        });

        // Send current online members to the new user
        const onlineSet = onlineMembers.get(circleId);
        socket.emit('online-members', {
          members: Array.from(onlineSet).map(id => ({
            anonymousId: id
          }))
        });

        console.log(`User ${anonymousId} joined circle ${circleId}`);
      } catch (error) {
        console.error('Error joining circle:', error);
        socket.emit('error', { message: 'Error joining circle' });
      }
    });

    // Leave a circle room
    socket.on('leave-circle', ({ circleId, anonymousId }) => {
      if (socket.circleId === circleId) {
        socket.leave(`circle:${circleId}`);

        // Remove from online members
        if (onlineMembers.has(circleId)) {
          onlineMembers.get(circleId).delete(anonymousId);
        }

        // Notify others
        socket.to(`circle:${circleId}`).emit('member-offline', {
          anonymousId
        });

        console.log(`User ${anonymousId} left circle ${circleId}`);
      }
    });

    // Send a message
    socket.on('send-message', async ({ circleId, anonymousId, message }) => {
      try {
        // Verify member
        const member = await CircleMember.findOne({
          circleId: circleId,
          anonymousId: anonymousId,
          isActive: true
        });

        if (!member) {
          socket.emit('error', { message: 'Not a member of this circle' });
          return;
        }

        // Basic AI safety check
        const riskScore = await checkMessageSafety(message);

        // Save message to database
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

        // Broadcast to all members in the circle (including sender)
        const messageData = {
          id: newMessage._id.toString(),
          senderId: anonymousId,
          senderDisplayName: member.displayName,
          message: message,
          timestamp: newMessage.timestamp,
          reactions: [],
          flaggedByAI: newMessage.flaggedByAI
        };

        circleNamespace.to(`circle:${circleId}`).emit('new-message', messageData);

        // Confirm delivery to sender
        socket.emit('message-sent', {
          messageId: newMessage._id.toString(),
          timestamp: newMessage.timestamp
        });

        console.log(`Message sent in circle ${circleId} by ${anonymousId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // User is typing
    socket.on('typing', ({ circleId, anonymousId }) => {
      if (socket.circleId === circleId) {
        // Store typing state
        if (!typingUsers.has(circleId)) {
          typingUsers.set(circleId, new Map());
        }
        typingUsers.get(circleId).set(anonymousId, Date.now());

        // Notify others (except sender)
        socket.to(`circle:${circleId}`).emit('user-typing', {
          anonymousId,
          displayName: socket.displayName
        });

        // Auto-stop typing after 3 seconds
        setTimeout(() => {
          if (typingUsers.has(circleId)) {
            typingUsers.get(circleId).delete(anonymousId);
          }
          socket.to(`circle:${circleId}`).emit('user-stop-typing', {
            anonymousId
          });
        }, 3000);
      }
    });

    // User stopped typing
    socket.on('stop-typing', ({ circleId, anonymousId }) => {
      if (socket.circleId === circleId) {
        if (typingUsers.has(circleId)) {
          typingUsers.get(circleId).delete(anonymousId);
        }
        socket.to(`circle:${circleId}`).emit('user-stop-typing', {
          anonymousId
        });
      }
    });

    // Message reaction
    socket.on('message-reaction', async ({ circleId, messageId, emoji, anonymousId }) => {
      try {
        const message = await CircleMessage.findById(messageId);
        if (!message || message.circleId.toString() !== circleId) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Find or create reaction
        let reaction = message.reactions.find(r => r.emoji === emoji);
        if (!reaction) {
          reaction = { emoji, count: 0, users: [] };
          message.reactions.push(reaction);
        }

        // Toggle user reaction
        const userIndex = reaction.users.indexOf(anonymousId);
        if (userIndex > -1) {
          // Remove reaction
          reaction.users.splice(userIndex, 1);
          reaction.count -= 1;
        } else {
          // Add reaction
          reaction.users.push(anonymousId);
          reaction.count += 1;
        }

        await message.save();

        // Broadcast updated reactions
        circleNamespace.to(`circle:${circleId}`).emit('message-reaction-updated', {
          messageId,
          reactions: message.reactions
        });
      } catch (error) {
        console.error('Error updating reaction:', error);
        socket.emit('error', { message: 'Error updating reaction' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.circleId && socket.anonymousId) {
        const circleId = socket.circleId;
        const anonymousId = socket.anonymousId;

        // Remove from online members
        if (onlineMembers.has(circleId)) {
          onlineMembers.get(circleId).delete(anonymousId);
        }

        // Notify others
        socket.to(`circle:${circleId}`).emit('member-offline', {
          anonymousId
        });

        console.log(`User ${anonymousId} disconnected from circle ${circleId}`);
      }
    });
  });

  return io;
}

// Helper: Check message safety (same as controller)
async function checkMessageSafety(message) {
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
}

// Get online members for a circle
function getOnlineMembers(circleId) {
  const members = onlineMembers.get(circleId);
  return members ? Array.from(members) : [];
}

module.exports = {
  initializeSocketIO,
  getOnlineMembers
};

