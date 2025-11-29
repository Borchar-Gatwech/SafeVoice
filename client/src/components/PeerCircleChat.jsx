import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage as sendMessageAPI, getMyBadges } from '../api';
import {
  joinCircle as joinSocketCircle,
  disconnect,
  sendMessage as sendSocketMessage,
  onNewMessage,
  onUserTyping,
  onUserStopTyping,
  emitTyping,
  emitStopTyping,
  onOnlineMembers,
  onError,
  isConnected
} from '../services/socketService';
import BadgeNotification from './BadgeNotification';

export default function PeerCircleChat({ circleId, anonymousId, displayName, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [error, setError] = useState('');
  const [newBadge, setNewBadge] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const scrollPositionRef = useRef(0);
  const userJustSentMessageRef = useRef(false);

  // Improved scroll behavior - prevent layout shifts and aggressive scrolling
  // Only scroll when messages change, NOT when typing indicators change
  useEffect(() => {
    // Don't scroll on initial mount
    if (prevMessagesLengthRef.current === 0 && messages.length > 0) {
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    if (messagesContainerRef.current && messages.length !== prevMessagesLengthRef.current) {
      const container = messagesContainerRef.current;
      const { scrollHeight, clientHeight, scrollTop } = container;
      const isScrolledNearBottom = scrollHeight - (clientHeight + scrollTop) < 200;
      
      // Only auto-scroll if user is near bottom AND it's a new message
      if (isScrolledNearBottom) {
        // Use a small delay to ensure DOM has fully updated before scrolling
        // This prevents aggressive scrolling that causes both interfaces to jump
        const scrollTimeout = setTimeout(() => {
          if (messagesContainerRef.current) {
            const updatedContainer = messagesContainerRef.current;
            const newScrollHeight = updatedContainer.scrollHeight;
            const newClientHeight = updatedContainer.clientHeight;
            const currentScrollTop = updatedContainer.scrollTop;
            
            // Only scroll if still near bottom (user didn't scroll up)
            const stillNearBottom = newScrollHeight - (newClientHeight + currentScrollTop) < 250;
            
            if (stillNearBottom) {
              // Use scrollTop with smooth behavior via CSS transition
              // This is more controlled than scrollIntoView and prevents both interfaces from jumping
              updatedContainer.style.scrollBehavior = 'smooth';
              updatedContainer.scrollTop = newScrollHeight;
              
              // Reset scroll behavior after a short delay
              setTimeout(() => {
                if (updatedContainer) {
                  updatedContainer.style.scrollBehavior = 'auto';
                }
              }, 300);
            }
          }
        }, 150); // Delay to let DOM fully settle and prevent aggressive scrolling
        
        // Reset the flag after scrolling
        if (userJustSentMessageRef.current) {
          userJustSentMessageRef.current = false;
        }
        
        // Return cleanup function to cancel scroll if component unmounts
        return () => clearTimeout(scrollTimeout);
      }
      
      // Save current scroll position
      scrollPositionRef.current = scrollTop;
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages]); // Removed typingUsers from dependencies - typing indicator should NOT trigger scroll

  // Preserve scroll position when typing indicator appears/disappears
  // This prevents the interface from jumping when someone starts/stops typing
  useEffect(() => {
    if (messagesContainerRef.current && typingUsers.length >= 0) {
      const container = messagesContainerRef.current;
      const currentScrollTop = container.scrollTop;
      const { scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - (clientHeight + currentScrollTop) < 200;
      
      // Only preserve scroll if user is NOT near bottom
      // If near bottom, let it scroll naturally (typing indicator won't affect it due to fixed height)
      if (!isNearBottom && scrollPositionRef.current > 0) {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = scrollPositionRef.current;
          }
        });
      } else {
        // Update saved position
        scrollPositionRef.current = currentScrollTop;
      }
    }
  }, [typingUsers]); // This effect only preserves scroll, doesn't trigger new scrolling

  // Initialize socket connection and load messages
  useEffect(() => {
    if (!circleId || !anonymousId) return;

    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        const { data, ok } = await getMessages(circleId);
        if (ok && data.messages) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    // Join socket room
    joinSocketCircle(circleId, anonymousId);

    // Load initial messages
    loadInitialMessages();

    // Setup socket listeners
    const unsubscribeNewMessage = onNewMessage((message) => {
      setMessages(prev => {
        // Check if message already exists by ID (avoid duplicates)
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        
        // Check if this is a confirmation of an optimistic message we sent
        // Look for a pending message with same content, sender, and recent timestamp
        // Only check for our own messages (same senderId)
        if (message.senderId === anonymousId) {
          const now = Date.now();
          const timeWindow = 10000; // 10 seconds window for matching
          
          const pendingMessageIndex = prev.findIndex(m => 
            m.pending === true &&
            m.senderId === message.senderId &&
            m.message === message.message &&
            Math.abs(now - new Date(m.timestamp).getTime()) < timeWindow
          );
          
          if (pendingMessageIndex !== -1) {
            // Replace the optimistic message with the real one
            const updated = [...prev];
            updated[pendingMessageIndex] = { ...message, pending: false };
            return updated;
          }
        }
        
        
        // Otherwise, add as new message
        return [...prev, message];
      });
    });

    const unsubscribeTyping = onUserTyping(({ anonymousId: userId, displayName: userDisplayName }) => {
      if (userId !== anonymousId) {
        setTypingUsers(prev => {
          if (prev.some(u => u.anonymousId === userId)) {
            return prev;
          }
          return [...prev, { anonymousId: userId, displayName: userDisplayName }];
        });
      }
    });

    const unsubscribeStopTyping = onUserStopTyping(({ anonymousId: userId }) => {
      setTypingUsers(prev => prev.filter(u => u.anonymousId !== userId));
    });

    const unsubscribeOnline = onOnlineMembers((data) => {
      if (data.members) {
        setOnlineCount(data.members.length);
      } else {
        // Single member event
        setOnlineCount(prev => {
          // This is a simplified counter - you might want to track actual online members
          return prev;
        });
      }
    });

    const unsubscribeError = onError((error) => {
      console.error('Socket error:', error);
      setError(error.message || 'Connection error');
    });

    // Cleanup on unmount
    return () => {
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeStopTyping();
      unsubscribeOnline();
      unsubscribeError();
      disconnect();
    };
  }, [circleId, anonymousId]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing indicator
    emitTyping();

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);
    emitStopTyping();

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      // Use Socket.io for real-time messaging
      if (isConnected()) {
        // Mark that user just sent a message (for scroll behavior)
        userJustSentMessageRef.current = true;
        
        sendSocketMessage(messageText);
        // Optimistically add message (will be confirmed by socket)
        setMessages(prev => [...prev, {
          id: `temp-${Date.now()}`,
          senderId: anonymousId,
          senderDisplayName: displayName,
          message: messageText,
          timestamp: new Date(),
          reactions: [],
          pending: true
        }]);
      } else {
        // Fallback to HTTP if socket not connected
        const { data, ok } = await sendMessageAPI(circleId, anonymousId, messageText);
        if (ok && data.message) {
          setMessages(prev => [...prev, data.message]);
        } else {
          setError('Failed to send message');
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      
      // Check for badges after sending message (after a short delay)
      setTimeout(async () => {
        try {
          const { data } = await getMyBadges(anonymousId);
          if (data && data.badges) {
            // Check if there are newly earned badges (could be enhanced with timestamp checking)
            const latestBadge = data.badges[0];
            if (latestBadge && latestBadge.earnedAt) {
              const earnedRecently = new Date() - new Date(latestBadge.earnedAt) < 10000; // Last 10 seconds
              if (earnedRecently) {
                setNewBadge(latestBadge.badge || latestBadge);
              }
            }
          }
        } catch (err) {
          // Silent fail - badges are optional
        }
      }, 1000);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="mt-2 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg">Circle Chat</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${isConnected() ? 'bg-green-300' : 'bg-gray-300'}`}></span>
            <p className="text-xs text-indigo-100">
              {isConnected() ? `${onlineCount} online` : 'Connecting...'}
            </p>
          </div>
        </div>
        {onLeave && (
          <button
            onClick={onLeave}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition"
          >
            Leave Circle
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        style={{ scrollbarGutter: 'stable' }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message below</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === anonymousId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-80">
                      {message.senderDisplayName || 'Anonymous'}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p className={`text-xs ${isOwnMessage ? 'text-indigo-100' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {message.pending && (
                      <span className="text-xs opacity-70">Sending...</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator - Fixed height to prevent layout shifts */}
        <div className="min-h-[40px] flex items-start">
          {typingUsers.length > 0 && (
            <div className="flex justify-start w-full">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-600 ml-2">
                    {typingUsers.map(u => u.displayName || 'Someone').join(', ')} typing...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-2 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            rows="2"
            maxLength={2000}
            disabled={sending || !isConnected()}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || !isConnected()}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <span>Send</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {newMessage.length}/2000 characters
        </p>
      </form>

      {/* Badge Notification Overlay */}
      {newBadge && (
        <BadgeNotification
          badge={newBadge}
          onClose={() => setNewBadge(null)}
        />
      )}
    </div>
  );
}

