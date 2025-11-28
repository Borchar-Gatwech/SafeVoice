const Circle = require('../models/circle.model');
const CircleMember = require('../models/circleMember.model');
const crypto = require('crypto');

/**
 * AI-Powered Peer Matching Service
 * Matches survivors to appropriate support circles
 */

class MatchingService {
  
  /**
   * Find or create a matching circle for a survivor
   */
  static async findMatch(profile) {
    const {
      incidentType,
      locationRegion,
      language = 'english',
      ageRange,
      severity,
      reportId
    } = profile;

    // Step 1: Try to find existing circles with space
    const existingCircles = await Circle.find({
      incidentType: incidentType,
      locationRegion: locationRegion,
      language: language,
      isActive: true,
      $expr: { $lt: ['$memberCount', '$maxMembers'] }
    })
    .sort({ memberCount: 1, averageHelpfulnessScore: -1 })
    .limit(5);

    // If suitable circle found, enhance with AI if available
    if (existingCircles.length > 0) {
      let bestCircle;
      
      // Try AI enhancement if Gemini API key is available
      if (process.env.GEMINI_API_KEY && existingCircles.length > 1) {
        try {
          const aiMatch = await this.enhanceMatchingWithAI(existingCircles, profile);
          bestCircle = aiMatch || this.selectBestCircle(existingCircles, profile);
        } catch (error) {
          console.error('AI matching error, using rule-based:', error);
          bestCircle = this.selectBestCircle(existingCircles, profile);
        }
      } else {
        bestCircle = this.selectBestCircle(existingCircles, profile);
      }

      return {
        circle: bestCircle,
        isNewCircle: false,
        matchReason: this.generateMatchReason(bestCircle, profile)
      };
    }

    // Step 2: Create new circle if no match found
    const newCircle = await this.createNewCircle(profile);
    return {
      circle: newCircle,
      isNewCircle: true,
      matchReason: 'Created a new support circle for you with similar experiences'
    };
  }

  /**
   * Select best circle from candidates using AI-like scoring
   */
  static selectBestCircle(circles, profile) {
    let bestCircle = circles[0];
    let highestScore = 0;

    for (const circle of circles) {
      let score = 0;

      // Prefer circles with some members but not full
      if (circle.memberCount >= 2 && circle.memberCount <= 4) {
        score += 30;
      } else if (circle.memberCount === 1) {
        score += 20;
      }

      // Prefer circles with high helpfulness
      score += circle.averageHelpfulnessScore * 5;

      // Exact match on tags
      if (circle.tags && profile.tags) {
        const matchingTags = circle.tags.filter(tag => profile.tags.includes(tag));
        score += matchingTags.length * 10;
      }

      // Prefer circles with facilitators
      if (circle.facilitatorId) {
        score += 15;
      }

      if (score > highestScore) {
        highestScore = score;
        bestCircle = circle;
      }
    }

    return bestCircle;
  }

  /**
   * Create a new support circle
   */
  static async createNewCircle(profile) {
    const circleName = this.generateCircleName(profile);
    
    const circle = new Circle({
      name: circleName,
      incidentType: profile.incidentType,
      locationRegion: profile.locationRegion,
      language: profile.language || 'english',
      description: `Safe space for survivors of ${profile.incidentType} in ${profile.locationRegion}`,
      tags: profile.tags || [],
      maxMembers: 5
    });

    await circle.save();
    return circle;
  }

  /**
   * Generate meaningful circle name
   */
  static generateCircleName(profile) {
    const typeNames = {
      'online_harassment': 'Online Safety Circle',
      'workplace_discrimination': 'Workplace Support Circle',
      'dating_app_harassment': 'Dating Safety Circle',
      'cyberbullying': 'Cyber Safety Circle',
      'stalking': 'Safety & Security Circle',
      'general': 'Support Circle'
    };

    const baseName = typeNames[profile.incidentType] || 'Support Circle';
    return `${baseName} - ${profile.locationRegion}`;
  }

  /**
   * Generate human-readable match reason
   */
  static generateMatchReason(circle, profile) {
    const reasons = [];

    reasons.push(`${circle.memberCount} members with similar experiences`);
    
    if (circle.locationRegion === profile.locationRegion) {
      reasons.push(`based in ${profile.locationRegion}`);
    }

    if (circle.averageHelpfulnessScore > 3) {
      reasons.push('highly rated for support');
    }

    return `Matched to ${circle.name}: ${reasons.join(', ')}`;
  }

  /**
   * Add member to circle
   */
  static async joinCircle(circleId, profile) {
    // Generate anonymous ID
    const anonymousId = 'anon_' + crypto.randomBytes(16).toString('hex');

    const member = new CircleMember({
      circleId: circleId,
      anonymousId: anonymousId,
      displayName: profile.displayName || this.generateAnonymousName(),
      reportId: profile.reportId
    });

    await member.save();

    // Update circle member count
    await Circle.findByIdAndUpdate(circleId, {
      $inc: { memberCount: 1 }
    });

    return { member, anonymousId };
  }

  /**
   * Generate anonymous display name
   */
  static generateAnonymousName() {
    const adjectives = ['Brave', 'Strong', 'Resilient', 'Courageous', 'Hopeful', 'Empowered'];
    const nouns = ['Survivor', 'Warrior', 'Phoenix', 'Spirit', 'Voice', 'Heart'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adj} ${noun}`;
  }

  /**
   * Enhanced matching with Google Gemini AI (optional - use if API key available)
   */
  static async enhanceMatchingWithAI(circles, profile) {
    // Use Gemini API to analyze semantic similarity and provide better matching
    // Falls back to rule-based matching if API key not available
    
    if (!process.env.GEMINI_API_KEY) {
      console.log('Gemini API key not found, using rule-based matching');
      return this.selectBestCircle(circles, profile);
    }

    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Prepare context for Gemini
      const circlesSummary = circles.map(c => ({
        id: c._id.toString(),
        name: c.name,
        incidentType: c.incidentType,
        locationRegion: c.locationRegion,
        memberCount: c.memberCount,
        averageHelpfulnessScore: c.averageHelpfulnessScore,
        tags: c.tags || []
      }));

      const prompt = `You are an AI matching system for a peer support network. 

Given this survivor profile:
- Incident Type: ${profile.incidentType}
- Location: ${profile.locationRegion}
- Language: ${profile.language || 'english'}
- Age Range: ${profile.ageRange || 'not specified'}
- Tags: ${(profile.tags || []).join(', ') || 'none'}

And these available support circles:
${JSON.stringify(circlesSummary, null, 2)}

Which circle ID would provide the BEST emotional support match? Consider:
1. Similar experiences (incident type match)
2. Geographic proximity (same region preferred)
3. Group size (2-4 members is ideal, not too small or full)
4. Community quality (higher helpfulness score is better)
5. Language compatibility

Respond ONLY with the circle ID (the "id" field) that is the best match. If no good match exists, respond with "CREATE_NEW".`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Parse Gemini's response
      if (text === 'CREATE_NEW' || text.includes('CREATE_NEW')) {
        return null; // Signal to create new circle
      }

      // Try to extract circle ID from response
      const matchedCircle = circles.find(c => 
        text.includes(c._id.toString()) || 
        text === c._id.toString()
      );

      if (matchedCircle) {
        console.log(`Gemini matched to circle: ${matchedCircle.name}`);
        return matchedCircle;
      }

      // Fallback to rule-based if Gemini response unclear
      console.log('Gemini response unclear, using rule-based fallback');
      return this.selectBestCircle(circles, profile);

    } catch (error) {
      console.error('Gemini AI enhancement failed:', error.message);
      // Fallback to rule-based matching on error
      return this.selectBestCircle(circles, profile);
    }
  }
}

module.exports = MatchingService;