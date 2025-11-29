import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

export default function BadgeNotification({ badge, onClose, autoCloseDelay = 8000, onViewBadges }) {
  const [show, setShow] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    // Handle window resize for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Stop confetti after 3 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    // Auto-close notification after delay
    const closeTimer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(closeTimer);
    };
  }, [autoCloseDelay]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation
  };

  if (!show || !badge) return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-purple-400 p-8 max-w-md w-full transform transition-all duration-300 animate-scale-in relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Badge Icon with glow effect */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="text-9xl mb-4 animate-pulse filter drop-shadow-2xl transform hover:scale-110 transition-transform">
              {badge.icon || '🛡️'}
            </div>
            
            {/* Achievement text */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4 animate-bounce shadow-lg">
              🎉 {badge.name?.toUpperCase() || 'BADGE'} EARNED! 🎉
            </div>

            {/* Badge name */}
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              {badge.name || 'Bravely'}
            </h3>

            {/* Badge description */}
            <p className="text-gray-700 text-base mb-5 font-medium">
              {badge.description || 'You showed courage by submitting a report'}
            </p>

            {/* Rarity badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              badge.rarity === 'legendary' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : badge.rarity === 'rare'
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {badge.rarity?.toUpperCase() || 'COMMON'}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => {
                if (onClose) onClose();
                if (onViewBadges) {
                  onViewBadges();
                } else {
                  // Fallback: trigger navigation via custom event
                  window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'badges' } }));
                }
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              🏆 View My Badges
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `I just earned a badge: ${badge.name || 'Bravely'}!`,
                    text: badge.description || 'You showed courage by submitting a report',
                  });
                } else {
                  // Fallback: copy to clipboard
                  const text = `I just earned the ${badge.name || 'Bravely'} badge on SafeVoice! ${badge.description || 'You showed courage by submitting a report'}`;
                  navigator.clipboard.writeText(text).then(() => {
                    alert('Achievement text copied to clipboard!');
                  });
                }
              }}
              className="w-full px-6 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              Share Achievement
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
}

