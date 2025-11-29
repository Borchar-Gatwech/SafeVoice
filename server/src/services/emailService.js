const transporter = require('../config/email.config');
const EmailPreference = require('../models/EmailPreference');

const FROM_EMAIL = process.env.EMAIL_FROM || 'SafeCircle <noreply@safecircle.org>';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Check if user wants to receive emails
async function shouldSendEmail(anonymousId, emailType) {
  const preferences = await EmailPreference.findOne({ anonymousId });
  
  if (!preferences || preferences.unsubscribed || !preferences.email) {
    return false;
  }

  switch (emailType) {
    case 'welcome':
      return preferences.welcomeEmails;
    case 'circle':
      return preferences.circleNotifications;
    case 'badge':
      return preferences.badgeNotifications;
    case 'weekly':
      return preferences.weeklyDigest;
    case 'resources':
      return preferences.resourceRecommendations;
    default:
      return true;
  }
}

// Send welcome email
async function sendWelcomeEmail(email, name) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ Welcome to SafeCircle</h1>
          </div>
          <div class="content">
            <p>Dear ${name || 'Survivor'},</p>
            <p>Thank you for your courage in submitting a report. You've taken an important step toward healing and support.</p>
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Your report is being reviewed by trained professionals</li>
              <li>You can connect with peer support circles</li>
              <li>Access resources and support anytime</li>
            </ul>
            <p><strong>You are not alone.</strong> Our community is here to support you.</p>
            <p style="text-align: center;">
              <a href="${APP_URL}" class="button">Visit SafeCircle</a>
            </p>
            <p>With care,<br>The SafeCircle Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to ${email}</p>
            <p><a href="${APP_URL}/unsubscribe">Unsubscribe from emails</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: '🛡️ Welcome to SafeCircle',
      html
    });

    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

// Send circle match email
async function sendCircleMatchEmail(email, circleName, memberCount) {
  try {
    if (!(await shouldSendEmail(email, 'circle'))) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👥 You've Been Matched!</h1>
          </div>
          <div class="content">
            <p>Great news! You've been matched to a peer support circle: <strong>${circleName}</strong></p>
            <p>This circle currently has <strong>${memberCount}</strong> members who share similar experiences.</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Join the circle chat to connect with others</li>
              <li>Share your experiences in a safe, supportive environment</li>
              <li>Build connections with survivors who understand</li>
            </ul>
            <p style="text-align: center;">
              <a href="${APP_URL}" class="button">Join Your Circle</a>
            </p>
            <p>Remember: All conversations are private and confidential.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: '👥 You\'ve Been Matched to a Support Circle',
      html
    });
  } catch (error) {
    console.error('Error sending circle match email:', error);
  }
}

// Send badge earned email
async function sendBadgeEarnedEmail(email, badgeName, badgeIcon) {
  try {
    if (!(await shouldSendEmail(email, 'badge'))) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .badge { font-size: 80px; margin: 20px 0; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <div class="badge">${badgeIcon}</div>
            <h2>You Earned a Badge!</h2>
            <h3>${badgeName}</h3>
            <p>Your dedication and support to the community has been recognized. Keep being amazing!</p>
            <p style="text-align: center;">
              <a href="${APP_URL}" class="button">View Your Badges</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 You Earned a Badge: ${badgeName}`,
      html
    });
  } catch (error) {
    console.error('Error sending badge email:', error);
  }
}

// Send weekly digest
async function sendWeeklyDigest(email, stats) {
  try {
    if (!(await shouldSendEmail(email, 'weekly'))) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .stat { background: #667eea; color: white; padding: 15px; border-radius: 5px; margin: 10px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 Your Weekly SafeCircle Digest</h1>
          <div class="stat">
            <h2>${stats.messagesSent || 0}</h2>
            <p>Messages Sent This Week</p>
          </div>
          <p>Thank you for being part of our supportive community!</p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: '📊 Your Weekly SafeCircle Digest',
      html
    });
  } catch (error) {
    console.error('Error sending weekly digest:', error);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendCircleMatchEmail,
  sendBadgeEarnedEmail,
  sendWeeklyDigest,
  shouldSendEmail
};

