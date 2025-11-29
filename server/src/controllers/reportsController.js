const Report =  require('../models/Report');
const MatchingService =  require('../services/matching.service'); 
const badgeService = require('../services/badgeService');
const path = require('path');

exports.createReport = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      location, 
      contactMethod, 
      category,
      seekingPeerSupport, // NEW: Does user want peer support?
      incidentType,
      locationRegion,
      language,
      anonymousId
    } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    // Create report with evidence images if provided
    const reportData = { 
      title, 
      description, 
      location, 
      contactMethod, 
      category, 
      anonymous: true,
      anonymousId: anonymousId || null // Store anonymousId for badge tracking
    };

    // Add evidence images if processed
    if (req.processedImages && req.processedImages.length > 0) {
      reportData.evidenceImages = req.processedImages;
    }

    const report = new Report(reportData);
    await report.save();

    // Check for badge unlocks and include in response
    let awardedBadges = [];
    if (anonymousId) {
      try {
        awardedBadges = await badgeService.checkAndAwardBadges(anonymousId, 'submit_report');
      } catch (err) {
        console.error('Badge check error:', err);
      }
    }

    const response = {
      message: 'Report submitted successfully',
      reportId: report._id,
      badges: awardedBadges // Include newly awarded badges in response
    };

    // If user wants peer support, match them to a circle
    if (seekingPeerSupport && incidentType && locationRegion) {
      try {
        const matchResult = await MatchingService.findMatch({
          incidentType,
          locationRegion,
          language: language || 'english',
          reportId: report._id
        });

        const { member, anonymousId } = await MatchingService.joinCircle(
          matchResult.circle._id,
          { reportId: report._id }
        );

        response.peerSupport = {
          matched: true,
          circle: {
            id: matchResult.circle._id,
            name: matchResult.circle.name,
            memberCount: matchResult.circle.memberCount + 1
          },
          member: {
            anonymousId: anonymousId,
            displayName: member.displayName
          },
          message: 'You have been matched to a peer support circle'
        };

      } catch (matchError) {
        console.error('Peer matching error:', matchError);
        response.peerSupport = {
          matched: false,
          message: 'Could not find peer match at this time'
        };
      }
    }

    return res.status(201).json(response);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { category, startDate, endDate, reviewed, search } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (typeof reviewed !== 'undefined') filter.reviewed = reviewed === 'true';
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await Report.find(filter).sort({ date: -1 });
    res.json(reports);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markReviewed = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    report.reviewed = true;
    await report.save();
    
    res.json({ message: 'Report marked as reviewed', id: report._id });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get evidence image (admin only or authenticated)
exports.getEvidenceImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Find report
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Find image in report
    const image = report.evidenceImages.find(img => img._id.toString() === imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // TODO: Add authentication check here - only admins should access
    // For now, allow access (add proper auth middleware later)

    // Serve image file
    const imagePath = image.path;
    res.sendFile(path.resolve(imagePath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};