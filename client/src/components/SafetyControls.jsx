import React, { useState } from 'react';
import TrustLevelBadge from './TrustLevelBadge';
import ReportButton from './ReportButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SafetyControls({ userId, circleId, trustLevel, onLeave, onBlock }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleBlock = async () => {
    if (!confirm('Are you sure you want to block this user? You will no longer see their messages.')) {
      return;
    }

    try {
      let anonymousId = localStorage.getItem('anonymousId');
      
      const response = await fetch(`${API_URL}/api/trust/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          anonymousId,
          blockUserId: userId
        })
      });

      if (response.ok) {
        setIsBlocked(true);
        if (onBlock) onBlock(userId);
        alert('User has been blocked.');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    }
  };

  const handleSafeExit = () => {
    if (confirm('Are you sure you want to leave this circle? This action will clear your conversation history from this circle.')) {
      if (onLeave) onLeave();
    }
  };

  if (isBlocked) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 text-center text-gray-600">
        This user has been blocked
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Safety controls"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            {/* Trust Level */}
            {trustLevel && (
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Trust Level</p>
                <TrustLevelBadge trustLevel={trustLevel} />
              </div>
            )}

            {/* Actions */}
            <div className="py-2">
              {userId && (
                <>
                  <ReportButton
                    reportedUserId={userId}
                    circleId={circleId}
                    onReported={() => setShowMenu(false)}
                  />
                  <button
                    onClick={handleBlock}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Block User
                  </button>
                </>
              )}

              {onLeave && (
                <button
                  onClick={handleSafeExit}
                  className="w-full text-left px-4 py-2 text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Safe Exit (Leave Circle)
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

