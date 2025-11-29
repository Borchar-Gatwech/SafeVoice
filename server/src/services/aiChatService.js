const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatConversation = require('../models/ChatConversation');

// Initialize Google Generative AI with API key (supports both env var names for compatibility)
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const systemPrompt = `
You are SafeCircle AI, a compassionate support companion for survivors of gender-based violence in Africa.

YOUR ROLE:
- Listen empathetically without judgment
- Provide emotional support and validation
- Suggest appropriate resources (not medical/legal advice)
- Detect crisis situations and escalate appropriately
- Encourage peer support and community connection

CRITICAL RULES:
1. NEVER give medical or legal advice
2. ALWAYS suggest professional help for serious situations
3. Detect self-harm language → immediate crisis resources
4. Be culturally sensitive to African contexts
5. Use trauma-informed language
6. Keep responses under 200 words

CRISIS KEYWORDS: suicide, kill myself, end it all, self-harm, hurt myself, dangerous situation
ESCALATION ACTIONS: Provide crisis hotlines, suggest immediate professional help

RESOURCE TYPES:
- Hotlines: 24/7 crisis support
- NGOs: Long-term support services
- Legal Aid: For legal matters (refer, don't advise)
- Counseling: Professional therapy
- Shelter: Safe housing
- Police: For immediate danger

Always ask: "Would you like me to help you find local resources?"
Always remind: "You deserve support. You are not alone."
`;

// Crisis keywords
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'self-harm', 
  'hurt myself', 'dangerous', 'threatened', 'afraid for my life'
];

// Detect crisis in message
function detectCrisis(message) {
  const lowerMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

// Get crisis resources based on location
async function getCrisisResources(location) {
  // This would query the resources database
  // For now, return general crisis resources
  return [
    {
      type: 'hotline',
      name: 'Crisis Helpline',
      phone: '116',
      available: '24/7'
    },
    {
      type: 'hotline',
      name: 'Emergency Services',
      phone: '911',
      available: '24/7'
    }
  ];
}

// Generate contextual, conversational fallback response using conversation history
function generateContextualFallbackResponse(message, conversationHistory, conversation, isCrisis) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Parse conversation history to understand context
  const historyLines = conversationHistory.split('\n').filter(l => l.trim());
  const userMessages = historyLines
    .filter(l => l.startsWith('user:'))
    .map(l => l.replace(/^user:\s*/i, '').toLowerCase())
    .slice(-3); // Last 3 user messages
  
  const hasPreviousMessages = userMessages.length > 1;
  const messageCount = userMessages.length;
  
  // Extract emotional keywords and topics from conversation
  const allText = (lowerMessage + ' ' + userMessages.join(' ')).toLowerCase();
  
  // Detect emotional states
  const isStressed = allText.includes('stressed') || allText.includes('stress') || allText.includes('pressure');
  const isSad = allText.includes('sad') || allText.includes('depressed') || allText.includes('down') || allText.includes('upset');
  const isAnxious = allText.includes('anxious') || allText.includes('worry') || allText.includes('worried') || allText.includes('nervous');
  const isOverwhelmed = allText.includes('overwhelmed') || allText.includes('too much') || allText.includes('cant handle');
  const wantsToTalk = lowerMessage.includes('talk') || lowerMessage.includes('chat') || lowerMessage.includes('speak') || lowerMessage.includes('conversation');
  const askingForHelp = lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('support');
  const feelingAlone = allText.includes('alone') || allText.includes('lonely') || allText.includes('isolated');
  
  // Crisis response
  if (isCrisis) {
    return "🆘 I'm here with you during this critical moment. Your safety is the absolute priority right now. Please contact your local crisis helpline (116) or emergency services (911) immediately if you're in danger. You are not alone, and help is available. Is there someone safe you can contact right now?";
  }
  
  // PRIORITY: If they want to talk - respond directly and conversationally
  if (wantsToTalk) {
    if (lowerMessage.includes('want you to help') || lowerMessage.includes('help me by')) {
      return `Absolutely! I'm here to talk with you right now. Let's have a conversation - I'm listening.

${hasPreviousMessages ? `You mentioned you're feeling ${isStressed ? 'stressed' : isSad ? 'sad' : 'some things'}, and I want to understand better. ` : ''}What's on your mind? Let's talk - whatever you want to share, I'm here to listen. What would you like to talk about?`;
    }
    
    if (askingForHelp) {
      return `Yes, I'm absolutely here to talk with you and help you. This is a safe space, and I'm listening. 

${hasPreviousMessages ? `You've shared that you're ${isStressed ? 'feeling stressed' : 'going through something'}, and I want to help. ` : ''}What would help you most right now? We can just talk about what's on your mind, or we can explore ways to cope, or find resources. What feels most helpful?`;
    }
    
    return `I'm absolutely here to talk with you. Talking things through can really help, and this is a safe space where you can share whatever's on your mind.

${hasPreviousMessages ? `I've been listening to what you've shared. ` : ''}What's on your mind? I'm here, and whatever you want to talk about - big or small - matters. Let's talk.`;
  }
  
  // If they mentioned being stressed
  if (isStressed || allText.includes('stressed')) {
    const stressResponse = `I hear that you're feeling stressed. Stress is completely understandable, and it's okay to feel this way. ${hasPreviousMessages ? 'Thank you for continuing to share with me.' : 'Thank you for trusting me enough to tell me that.'}

When stress hits, sometimes it helps to:
• Take slow, deep breaths (inhale for 4, hold for 4, exhale for 4)
• Name what's causing the stress - putting words to it can make it feel more manageable
• Remember that this feeling won't last forever

Would it help to talk about what's making you feel stressed? Sometimes just talking it through can help. I'm here, and you're not alone in this.`;
    
    return stressResponse;
  }
  
  if (isSad) {
    return `I can hear the sadness in what you're sharing, and I'm sorry you're going through this. Sadness is a real and valid feeling. ${hasPreviousMessages ? "You've been brave to share what you've shared." : "It takes courage to open up about difficult feelings."}

Sometimes sadness can feel overwhelming, but it doesn't mean you're weak - it means you're human, and you've experienced things that matter. Would it help to talk more about what's making you feel this way? Sometimes just being heard can help lighten the weight a little. I'm here, and you're not alone.`;
  }
  
  if (isAnxious) {
    return `I hear that you're feeling anxious, and that's completely understandable. Anxiety can feel overwhelming, but you're taking a good step by reaching out. ${hasPreviousMessages ? 'Thank you for continuing to trust me.' : 'Thank you for trusting me with this.'}

When anxiety feels heavy, sometimes it helps to:
• Ground yourself - notice 5 things you can see, 4 you can touch, 3 you can hear
• Remind yourself that this moment will pass
• Know that your feelings are valid

What's making you feel anxious? Sometimes talking about it can help. I'm here to listen.`;
  }
  
  if (isOverwhelmed) {
    return `It sounds like things feel really overwhelming right now. That's completely understandable - sometimes life can feel like too much. ${hasPreviousMessages ? "You've been dealing with a lot." : "You don't have to carry everything alone."}

When things feel overwhelming, sometimes it helps to:
• Break things down into smaller pieces
• Focus on just one thing at a time
• Remember that it's okay to ask for help
• Take things moment by moment

What's feeling most overwhelming right now? We can take this one step at a time together. I'm here with you.`;
  }
  
  if (feelingAlone) {
    return `I hear you, and I want you to know that you are not alone - even when it feels that way. ${hasPreviousMessages ? "You've shared with me, and I'm here." : "I'm here right now, listening."} Many people have walked similar paths, and there is support available.

Would it help to connect with a peer support circle? You can talk with others who understand what you're going through. Or we can keep talking here - whatever feels right for you. Your feelings are valid, and you deserve support. You're not alone.`;
  }
  
  if (askingForHelp) {
    return `I'm absolutely here for you, and I want to help. ${hasPreviousMessages ? `Based on what ${messageCount === 2 ? "you've" : "we've"} talked about, ` : ''}I want you to know that your feelings matter, and you deserve support.

What kind of help would feel most useful right now? We could:
• Talk through what's happening
• Explore ways to cope with what you're feeling
• Find local resources or support services
• Connect you with a peer support circle of people who understand

What feels most helpful to you right now?`;
  }
  
  if (wantsToTalk) {
    return `I'm absolutely here to talk with you. Talking things through can really help, and this is a safe space where you can share whatever's on your mind. 

${hasPreviousMessages ? `I've been listening to what you've shared. ` : ''}What's on your mind? I'm here, and whatever you want to talk about - big or small - matters. You don't have to figure this out alone.`;
  }
  
  // Build on conversation history - respond to what they actually said
  if (hasPreviousMessages) {
    const allPreviousText = userMessages.join(' ').toLowerCase();
    const mentionedStress = allPreviousText.includes('stress') || allPreviousText.includes('stressed');
    const mentionedHelp = allPreviousText.includes('help');
    const mentionedFeeling = allPreviousText.includes('feeling') || allPreviousText.includes('feel');
    
    // If they said they're stressed
    if (mentionedStress || isStressed) {
      return `I hear that you're feeling stressed, and I want you to know that stress is completely understandable. Thank you for sharing that with me.

Stress can feel overwhelming, but you're not alone. Sometimes it helps to:
• Take a moment - breathe slowly (in for 4, hold for 4, out for 4)
• Name what's causing the stress - putting words to it can help
• Remember that this feeling won't last forever

${lowerMessage.includes('talk') || lowerMessage.includes('want you') ? 'I\'m absolutely here to talk with you. What would help you most right now? We can talk about what\'s causing the stress, explore ways to manage it, or I can help you find resources.' : 'Would it help to talk about what\'s making you feel stressed? I\'m here to listen.'}`;
    }
    
    // If they asked for help/talking
    if (mentionedHelp || wantsToTalk) {
      return `I'm absolutely here to talk with you. ${mentionedStress ? "I heard you mention feeling stressed - let's talk about that." : ""} This is a safe space, and I'm listening.

${lowerMessage.includes('talk') ? "Yes, let's talk. What would help you most right now? We could discuss what's on your mind, explore ways to cope, or I can help you find support resources." : "What would be most helpful to you right now? We could talk through what's happening, explore ways to cope, or find resources that might help."}

I'm here, and you're not alone. What would you like to talk about?`;
    }
    
    // General continuation response
    return `I'm listening, and I hear you. ${mentionedFeeling ? "I can see you're sharing your feelings, and that matters." : "What you're sharing is important."}

Can you tell me more about that? Or what would be most helpful for you right now? I'm here, and we can work through this together.`;
  }
  
  // First message or general empathetic response
  if (lowerMessage.includes('stressed') || lowerMessage.includes('stress')) {
    return `I hear that you're feeling stressed, and I want you to know that stress is completely understandable. Thank you for trusting me enough to share that with me.

Stress can feel overwhelming, but you're not alone. Sometimes it helps to:
• Take slow, deep breaths (inhale for 4, hold for 4, exhale for 4)
• Name what's causing the stress - putting words to it can make it feel more manageable
• Remember that this feeling won't last forever

Would it help to talk about what's making you feel stressed? I'm here to listen, and we can work through this together.`;
  }
  
  // General empathetic response that references their specific message
  return `I'm here for you, and I'm listening. ${message.length < 50 ? `You said "${message}" - I want to understand better. Can you tell me more about that?` : "What you're sharing matters, and I want to understand."} This is a safe space where you can express whatever you're feeling.

You're not alone in this, and we can talk about whatever's on your mind. What would be helpful to explore together?`;
}

// Send AI chat message with context
async function sendMessage(sessionId, message, userLanguage = 'en', anonymousId = null) {
  try {
    // Get or create conversation first (always save user messages)
    let conversation = await ChatConversation.findOne({ sessionId });
    
    if (!conversation) {
      conversation = new ChatConversation({
        sessionId,
        anonymousId,
        messages: []
      });
    }

    // Check for crisis
    const isCrisis = detectCrisis(message);
    if (isCrisis) {
      conversation.crisisDetected = true;
      conversation.crisisTimestamp = new Date();
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      language: userLanguage
    });
    
    // Keep only last 10 messages
    if (conversation.messages.length > 10) {
      conversation.messages = conversation.messages.slice(-10);
    }
    
    conversation.lastActive = new Date();
    await conversation.save();

    // Build conversation history for context (always build this first)
    const conversationHistory = conversation.messages
      .slice(-10) // Last 10 messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    // Check if AI is configured - if not, use contextual fallback response
    if (!genAI || !apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not configured. Using contextual fallback response.');
      
      // Use contextual fallback that responds to user's actual message
      const fallbackResponse = generateContextualFallbackResponse(message, conversationHistory, conversation, isCrisis);
      
      // Add fallback response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
        language: userLanguage
      });
      
      if (conversation.messages.length > 10) {
        conversation.messages = conversation.messages.slice(-10);
      }
      await conversation.save();

      return {
        message: fallbackResponse,
        crisisDetected: isCrisis,
        resources: isCrisis ? await getCrisisResources(null) : null,
        suggestPeerCircle: false
      };
    }
    
    // Try to generate AI response, but gracefully handle model unavailability
    let response;
    let modelWorked = false;
    
    // Only try once with the most common model to reduce error noise
    // If this fails, we'll use helpful fallback
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `${systemPrompt}

CONVERSATION HISTORY:
${conversationHistory}

USER: ${message}
ASSISTANT:`;

      const result = await model.generateContent(prompt);
      response = result.response.text();
      modelWorked = true;
    } catch (err) {
      // Model not available - that's okay, we'll use fallback
      modelWorked = false;
    }
    
    // Use helpful fallback response if AI model unavailable
    if (!modelWorked || !response) {
      // Create contextual, conversational fallback response based on conversation history
      response = generateContextualFallbackResponse(message, conversationHistory, conversation, isCrisis);
    }

    // Check if peer support should be suggested
    const shouldSuggestCircle = !conversation.peerCircleSuggested && 
      (message.toLowerCase().includes('alone') || 
       message.toLowerCase().includes('isolated') ||
       message.toLowerCase().includes('support'));

    if (shouldSuggestCircle) {
      conversation.peerCircleSuggested = true;
    }

    // Add assistant response
    conversation.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      language: userLanguage
    });
    
    // Keep only last 10 messages again
    if (conversation.messages.length > 10) {
      conversation.messages = conversation.messages.slice(-10);
    }
    
    conversation.lastActive = new Date();
    await conversation.save();

    // Get resources if crisis or suggested
    let resources = [];
    if (isCrisis) {
      resources = await getCrisisResources(null); // TODO: Get from user location
    }

    return {
      message: response,
      crisisDetected: isCrisis,
      resources: resources.length > 0 ? resources : null,
      suggestPeerCircle: shouldSuggestCircle
    };
  } catch (error) {
    console.error('AI chat error:', error);
    // Return a helpful error message instead of throwing
    return {
      message: "I'm sorry, I'm experiencing some technical difficulties right now. Please know that you're not alone. If you need immediate support, please contact your local crisis helpline or emergency services. You can try again in a moment.",
      crisisDetected: detectCrisis(message),
      resources: null,
      suggestPeerCircle: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}

// Get conversation history
async function getConversationHistory(sessionId) {
  const conversation = await ChatConversation.findOne({ sessionId });
  return conversation ? conversation.messages : [];
}

module.exports = {
  sendMessage,
  getConversationHistory,
  detectCrisis,
  getCrisisResources
};

