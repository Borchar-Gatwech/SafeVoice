import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EmailPreferences({ anonymousId, email }) {
  const [preferences, setPreferences] = useState({
    email: email || '',
    welcomeEmails: true,
    circleNotifications: true,
    weeklyDigest: false,
    badgeNotifications: true,
    resourceRecommendations: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (anonymousId) {
      loadPreferences();
    }
  }, [anonymousId]);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`${API_URL}/api/email/preferences?anonymousId=${anonymousId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(prev => ({ ...prev, ...data.preferences }));
        }
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  };

  const handleChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!anonymousId) {
      setError('Please provide your anonymous ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/email/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          anonymousId,
          ...preferences
        })
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('Are you sure you want to unsubscribe from all emails?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/email/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ anonymousId })
      });

      if (response.ok) {
        setPreferences(prev => ({
          ...prev,
          welcomeEmails: false,
          circleNotifications: false,
          weeklyDigest: false,
          badgeNotifications: false,
          resourceRecommendations: false
        }));
        alert('Successfully unsubscribed from all emails');
      }
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError('Failed to unsubscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">📧 Email Preferences</h2>
        <p className="text-gray-600">
          Choose how you want to receive notifications and updates from SafeCircle
        </p>
      </div>

      {/* Email Address */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={preferences.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="your.email@example.com"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          We'll only send emails to this address
        </p>
      </div>

      {/* Preferences */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Welcome Emails</h3>
            <p className="text-sm text-gray-600">
              Receive welcome messages and getting started guides
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.welcomeEmails}
              onChange={(e) => handleChange('welcomeEmails', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Circle Notifications</h3>
            <p className="text-sm text-gray-600">
              Get notified when matched to a peer support circle
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.circleNotifications}
              onChange={(e) => handleChange('circleNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Badge Notifications</h3>
            <p className="text-sm text-gray-600">
              Celebrate when you earn new achievement badges
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.badgeNotifications}
              onChange={(e) => handleChange('badgeNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Weekly Digest</h3>
            <p className="text-sm text-gray-600">
              Receive a weekly summary of your activity and community highlights
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.weeklyDigest}
              onChange={(e) => handleChange('weeklyDigest', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Resource Recommendations</h3>
            <p className="text-sm text-gray-600">
              Get suggestions for helpful resources based on your location
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.resourceRecommendations}
              onChange={(e) => handleChange('resourceRecommendations', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Success/Error Messages */}
      {saved && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">
          ✓ Preferences saved successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
        
        <button
          onClick={handleUnsubscribe}
          disabled={loading}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Unsubscribe All
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        You can change these preferences at any time. Your privacy is important to us.
      </p>
    </div>
  );
}

