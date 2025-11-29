import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ReportButton({ reportedUserId, circleId, onReported }) {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = [
    'Inappropriate language',
    'Asking for personal information',
    'Requesting money',
    'Harassment or bullying',
    'Spam or off-topic',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) return;

    setLoading(true);

    try {
      // Get anonymousId from localStorage or generate
      let anonymousId = localStorage.getItem('anonymousId');
      if (!anonymousId) {
        anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('anonymousId', anonymousId);
      }

      const response = await fetch(`${API_URL}/api/trust/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reporterId: anonymousId,
          reportedId: reportedUserId,
          reason: reason === 'Other' ? otherReason : reason,
          circleId
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setReason('');
          setOtherReason('');
          if (onReported) onReported();
        }, 2000);
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
        aria-label="Report user"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Report
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Report Inappropriate Behavior</h3>
            
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <p className="text-gray-600 mb-4">
                  Please select a reason for reporting this user. All reports are reviewed by our moderation team.
                </p>

                <div className="space-y-2 mb-4">
                  {reportReasons.map((r) => (
                    <label key={r} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-5 h-5 text-red-600 focus:ring-2 focus:ring-red-500"
                      />
                      <span className="text-gray-900">{r}</span>
                    </label>
                  ))}
                </div>

                {reason === 'Other' && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please describe the issue..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none mb-4"
                    rows="3"
                    required
                  />
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setReason('');
                      setOtherReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reason || loading || (reason === 'Other' && !otherReason.trim())}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✓</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h4>
                <p className="text-gray-600">
                  Thank you for helping keep our community safe. Your report has been received and will be reviewed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

