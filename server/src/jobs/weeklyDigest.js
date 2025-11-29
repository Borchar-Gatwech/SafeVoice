const cron = require('node-cron');
const EmailPreference = require('../models/EmailPreference');
const CircleMessage = require('../models/circleMessage.model');
const { sendWeeklyDigest } = require('../services/emailService');

// Run every Monday at 9 AM
const weeklyDigestJob = cron.schedule('0 9 * * 1', async () => {
  console.log('📧 Starting weekly digest job...');
  
  try {
    // Find all users with weekly digest enabled and email
    const preferences = await EmailPreference.find({
      weeklyDigest: true,
      unsubscribed: false,
      email: { $exists: true, $ne: null }
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const pref of preferences) {
      try {
        // Get user stats for the week
        const messagesSent = await CircleMessage.countDocuments({
          senderId: pref.anonymousId,
          timestamp: { $gte: oneWeekAgo }
        });

        const stats = {
          messagesSent,
          // Add more stats as needed
        };

        // Send digest
        await sendWeeklyDigest(pref.email, stats);
        console.log(`Weekly digest sent to ${pref.email}`);
      } catch (error) {
        console.error(`Error sending digest to ${pref.email}:`, error);
      }
    }

    console.log(`✅ Weekly digest job completed. Sent to ${preferences.length} users.`);
  } catch (error) {
    console.error('Error in weekly digest job:', error);
  }
}, {
  scheduled: false,
  timezone: 'Africa/Nairobi'
});

module.exports = weeklyDigestJob;

