import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;
let currentCircleId = null;
let currentAnonymousId = null;

/**
 * Connect to Socket.io server and join a circle
 * @param {string} circleId - The circle ID to join
 * @param {string} anonymousId - The anonymous user ID
 */
export function joinCircle(circleId, anonymousId) {
  if (socket && socket.connected) {
    // Already connected, just join the new circle
    if (currentCircleId && currentCircleId !== circleId) {
      // Leave previous circle
      socket.emit('leave-circle', {
        circleId: currentCircleId,
        anonymousId: currentAnonymousId
      });
    }
    socket.emit('join-circle', { circleId, anonymousId });
  } else {
    // Create new connection
    socket = io(`${API_URL}/circles`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      // Join circle after connection
      socket.emit('join-circle', { circleId, anonymousId });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  currentCircleId = circleId;
  currentAnonymousId = anonymousId;
}

/**
 * Disconnect from Socket.io server
 */
export function disconnect() {
  if (socket) {
    if (currentCircleId && currentAnonymousId) {
      socket.emit('leave-circle', {
        circleId: currentCircleId,
        anonymousId: currentAnonymousId
      });
    }
    socket.disconnect();
    socket = null;
    currentCircleId = null;
    currentAnonymousId = null;
  }
}

/**
 * Send a message to the circle
 * @param {string} message - The message text
 */
export function sendMessage(message) {
  if (socket && socket.connected && currentCircleId && currentAnonymousId) {
    socket.emit('send-message', {
      circleId: currentCircleId,
      anonymousId: currentAnonymousId,
      message
    });
  } else {
    console.error('Socket not connected or not in a circle');
  }
}

/**
 * Subscribe to new messages
 * @param {Function} callback - Callback function(message)
 */
export function onNewMessage(callback) {
  if (socket) {
    socket.on('new-message', callback);
    return () => socket.off('new-message', callback);
  }
  return () => {};
}

/**
 * Subscribe to message sent confirmation
 * @param {Function} callback - Callback function(data)
 */
export function onMessageSent(callback) {
  if (socket) {
    socket.on('message-sent', callback);
    return () => socket.off('message-sent', callback);
  }
  return () => {};
}

/**
 * Subscribe to user typing events
 * @param {Function} callback - Callback function({ anonymousId, displayName })
 */
export function onUserTyping(callback) {
  if (socket) {
    socket.on('user-typing', callback);
    return () => socket.off('user-typing', callback);
  }
  return () => {};
}

/**
 * Subscribe to user stop typing events
 * @param {Function} callback - Callback function({ anonymousId })
 */
export function onUserStopTyping(callback) {
  if (socket) {
    socket.on('user-stop-typing', callback);
    return () => socket.off('user-stop-typing', callback);
  }
  return () => {};
}

/**
 * Emit typing indicator
 */
export function emitTyping() {
  if (socket && socket.connected && currentCircleId && currentAnonymousId) {
    socket.emit('typing', {
      circleId: currentCircleId,
      anonymousId: currentAnonymousId
    });
  }
}

/**
 * Emit stop typing indicator
 */
export function emitStopTyping() {
  if (socket && socket.connected && currentCircleId && currentAnonymousId) {
    socket.emit('stop-typing', {
      circleId: currentCircleId,
      anonymousId: currentAnonymousId
    });
  }
}

/**
 * Subscribe to online members updates
 * @param {Function} callback - Callback function(data)
 */
export function onOnlineMembers(callback) {
  if (socket) {
    socket.on('online-members', callback);
    socket.on('member-online', callback);
    socket.on('member-offline', callback);
    return () => {
      socket.off('online-members', callback);
      socket.off('member-online', callback);
      socket.off('member-offline', callback);
    };
  }
  return () => {};
}

/**
 * Add reaction to a message
 * @param {string} messageId - The message ID
 * @param {string} emoji - The emoji reaction
 */
export function addMessageReaction(messageId, emoji) {
  if (socket && socket.connected && currentCircleId && currentAnonymousId) {
    socket.emit('message-reaction', {
      circleId: currentCircleId,
      messageId,
      emoji,
      anonymousId: currentAnonymousId
    });
  }
}

/**
 * Subscribe to message reaction updates
 * @param {Function} callback - Callback function(data)
 */
export function onMessageReactionUpdated(callback) {
  if (socket) {
    socket.on('message-reaction-updated', callback);
    return () => socket.off('message-reaction-updated', callback);
  }
  return () => {};
}

/**
 * Subscribe to errors
 * @param {Function} callback - Callback function(error)
 */
export function onError(callback) {
  if (socket) {
    socket.on('error', callback);
    return () => socket.off('error', callback);
  }
  return () => {};
}

/**
 * Check if socket is connected
 */
export function isConnected() {
  return socket && socket.connected;
}

export default {
  joinCircle,
  disconnect,
  sendMessage,
  onNewMessage,
  onMessageSent,
  onUserTyping,
  onUserStopTyping,
  emitTyping,
  emitStopTyping,
  onOnlineMembers,
  addMessageReaction,
  onMessageReactionUpdated,
  onError,
  isConnected
};

