import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EmotionalSupportChatEnhanced({ setCurrentPage }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [crisisResources, setCrisisResources] = useState([]);
  const [suggestedResources, setSuggestedResources] = useState([]);
  const [suggestPeerCircle, setSuggestPeerCircle] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  // Initialize session - create NEW session each time (fresh chat)
  useEffect(() => {
    // Always create a NEW session for fresh chat (don't load old history)
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    setSessionId(newSessionId);

    // Clear any old session data
    // localStorage.removeItem('chat-session-id'); // Optionally clear old session

    // Start with fresh welcome message (will be translated)
    const welcomeMessage = t('ai_welcome', { 
      defaultValue: "👋 Hello! I'm SafeVoice AI, your compassionate companion. I'm here to listen and support you whenever you need to talk. Remember, this is a safe, judgment-free space. How are you feeling today?"
    });
    setMessages([{
      id: 1,
      type: 'ai',
      text: welcomeMessage,
      timestamp: new Date()
    }]);

    setCrisisDetected(false);
    setCrisisResources([]);
    setSuggestedResources([]);
    setSuggestPeerCircle(false);

    // Don't load old conversation history - start fresh each time
  }, []);

  // Removed loadConversationHistory - each chat starts fresh now

  // Improved scroll behavior - prevent layout shifts and abrupt jumps
  useEffect(() => {
    // Don't scroll on initial mount - let user see the welcome message at top
    if (prevMessagesLengthRef.current === 0 && messages.length === 1) {
      // This is the initial welcome message - don't scroll
      prevMessagesLengthRef.current = messages.length;
      return;
    }
    
    // Only scroll when new messages are added (not on initial load)
    if (messages.length > prevMessagesLengthRef.current && prevMessagesLengthRef.current > 0) {
      // Small delay to let DOM update
      const timer = setTimeout(() => {
        if (messagesContainerRef.current) {
          const { scrollHeight, clientHeight, scrollTop } = messagesContainerRef.current;
          const isScrolledNearBottom = scrollHeight - (clientHeight + scrollTop) < 150;
          
          // Only auto-scroll if user is already near the bottom
          if (isScrolledNearBottom) {
            requestAnimationFrame(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            });
          }
        }
        
        prevMessagesLengthRef.current = messages.length;
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsLoading(true);
    setCrisisDetected(false);
    setCrisisResources([]);
    setSuggestedResources([]);
    setSuggestPeerCircle(false);
    
    // Scroll to bottom after user message is added (but smoothly)
    setTimeout(() => {
      if (messagesContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = messagesContainerRef.current;
        const isScrolledNearBottom = scrollHeight - (clientHeight + scrollTop) < 200;
        
        if (isScrolledNearBottom) {
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          });
        }
      }
    }, 100);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          message: messageText,
          language: i18n.language || 'en'
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: data.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Scroll to bottom after AI response (but only if user is near bottom)
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight, scrollTop } = messagesContainerRef.current;
            const isScrolledNearBottom = scrollHeight - (clientHeight + scrollTop) < 200;
            
            if (isScrolledNearBottom) {
              requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
              });
            }
          }
        }, 100);

        // Handle crisis detection
        if (data.crisisDetected) {
          setCrisisDetected(true);
          if (data.resources) {
            setCrisisResources(data.resources);
          }
        }

        // Handle resource suggestions
        if (data.resources) {
          setSuggestedResources(data.resources);
        }

        // Handle peer circle suggestion
        if (data.suggestPeerCircle) {
          setSuggestPeerCircle(true);
        }
      } else {
        // Error message
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: "I'm sorry, I'm having trouble connecting right now. Please try again, or if you're in immediate danger, please call 911 or your local emergency services.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm sorry, there was an error. Please try again or contact emergency services if you're in immediate danger.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickResponses = [
    "I'm feeling overwhelmed",
    "I need to talk",
    "I'm not okay",
    "I need support",
    "Can you help me?"
  ];

  const handleQuickResponse = (response) => {
    setInputValue(response);
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-12rem)] bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Crisis Alert Banner */}
      {crisisDetected && (
        <div className="bg-red-600 text-white px-6 py-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🆘</span>
              <div>
                <h3 className="font-bold text-lg">URGENT: Crisis Detected</h3>
                <p className="text-sm text-red-100">
                  If you're in immediate danger, please call emergency services now.
                </p>
              </div>
            </div>
            <a
              href="tel:911"
              className="px-4 py-2 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition"
            >
              Call 911
            </a>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center gap-3 shadow-md">
        <div className="text-2xl">💜</div>
        <div>
          <h3 className="font-bold text-lg">SafeVoice AI Support</h3>
          <p className="text-blue-100 text-sm">Available 24/7 • Always confidential</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${activeTab === 'chat'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${activeTab === 'about'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          ℹ️ About
        </button>
      </div>

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <>
          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
            style={{ scrollBehavior: 'smooth', scrollbarGutter: 'stable' }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${message.type === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    } shadow-sm`}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Crisis Resources */}
            {crisisDetected && crisisResources.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <h4 className="font-bold text-red-900 mb-3">🆘 Immediate Help Resources</h4>
                {crisisResources.map((resource, index) => (
                  <div key={index} className="mb-2">
                    <p className="font-semibold text-red-800">{resource.name}</p>
                    <a href={`tel:${resource.phone}`} className="text-red-600 hover:underline">
                      {resource.phone}
                    </a>
                    <p className="text-sm text-red-700">{resource.available}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Resources */}
            {suggestedResources.length > 0 && !crisisDetected && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                <h4 className="font-bold text-blue-900 mb-3">📞 Helpful Resources</h4>
                <div className="space-y-3">
                  {suggestedResources.map((resource, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="font-semibold text-gray-900">{resource.name}</p>
                      <p className="text-sm text-gray-600">{resource.type}</p>
                      {resource.phone && (
                        <a href={`tel:${resource.phone}`} className="text-blue-600 hover:underline text-sm">
                          {resource.phone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
            
            {/* Peer Circle Suggestion */}
            {suggestPeerCircle && (
              <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4">
                <h4 className="font-bold text-purple-900 mb-2">👥 Connect with Others</h4>
                <p className="text-purple-800 mb-3">
                  Would you like to connect with others who understand what you're going through?
                </p>
                <button
                  onClick={() => {
                    // Navigate to peer circle page
                    if (setCurrentPage) {
                      setCurrentPage('circle');
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Find a Support Circle
                </button>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Responses */}
          {messages.length <= 2 && (
            <div className="px-4 sm:px-6 py-3 bg-blue-50 border-t border-blue-200">
              <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">Quick responses:</p>
              <div className="flex flex-wrap gap-2">
                {quickResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickResponse(response)}
                    className="px-3 py-1.5 text-xs sm:text-sm bg-white border border-blue-300 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-blue-200 bg-white px-4 sm:px-6 py-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Share what's on your mind..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="hidden sm:inline">Send</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">💭 Everything you share is completely confidential</p>
          </form>
        </>
      )}

      {/* ABOUT TAB - Keep existing about tab content */}
      {activeTab === 'about' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">👋 Welcome to SafeVoice AI</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              I'm here to provide compassionate, judgment-free emotional support whenever you need it. Whether you're feeling overwhelmed, confused, scared, or just need someone to listen, I'm available 24/7.
            </p>
          </div>
        </div>
      )}

      {/* Information Banner */}
      <div className="bg-yellow-50 border-t border-yellow-200 px-4 sm:px-6 py-3 text-xs sm:text-sm text-yellow-800">
        <p className="font-medium">⚠️ Important:</p>
        <p>If you're in immediate danger, please contact emergency services at 911 or your local emergency number.</p>
      </div>
    </div>
  );
}

