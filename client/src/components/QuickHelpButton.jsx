import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function QuickHelpButton({ setCurrentPage }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      id: 'emergency',
      label: '🆘 Emergency Help',
      description: 'Call emergency services',
      action: () => {
        window.location.href = 'tel:911';
        setIsOpen(false);
      },
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      id: 'report',
      label: '📝 Submit Report',
      description: 'Report an incident',
      action: () => {
        setCurrentPage('report');
        setIsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'chat',
      label: '💬 AI Support Chat',
      description: 'Talk to our AI assistant',
      action: () => {
        setCurrentPage('support');
        setIsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'resources',
      label: '📞 Safety Resources',
      description: 'Find help resources',
      action: () => {
        setCurrentPage('resources');
        setIsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'circle',
      label: '👥 Peer Support',
      description: 'Join a support circle',
      action: () => {
        setCurrentPage('circle');
        setIsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      color: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ];

  return (
    <>
      {/* Floating Help Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center justify-center text-2xl font-bold animate-pulse"
          aria-label="Quick Help"
        >
          🆘
        </button>
      </div>

      {/* Quick Actions Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Actions Panel */}
          <div className="fixed bottom-24 left-6 z-50 bg-white rounded-2xl shadow-2xl p-4 min-w-[280px] max-w-sm animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Quick Help</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`w-full ${action.color} text-white px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-3 text-left`}
                >
                  <span className="text-xl">{action.label.split(' ')[0]}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{action.label.substring(action.label.indexOf(' ') + 1)}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                💜 Help is available 24/7
              </p>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

