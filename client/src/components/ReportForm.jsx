import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { submitReport, getMyBadges } from '../api'
import ImagePreview from './ImagePreview'

export default function ReportForm({ setCurrentPage, onBadgeEarned }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [contactMethod, setContactMethod] = useState('')
  const [status, setStatus] = useState(null)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [includeEvidence, setIncludeEvidence] = useState(false)
  const [evidenceImages, setEvidenceImages] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Filter valid files
    const validFiles = files
      .filter(file => {
        const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
        const isValidSize = file.size <= maxSize;
        return isValidType && isValidSize;
      })
      .slice(0, maxFiles - evidenceImages.length); // Respect max limit

    // Create preview objects
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setEvidenceImages(prev => [...prev, ...newImages]);
    e.target.value = ''; // Reset input
  };

  const handleRemoveImage = (index) => {
    const image = evidenceImages[index];
    if (image.preview) {
      URL.revokeObjectURL(image.preview);
    }
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!agreePrivacy) {
      setStatus('Please acknowledge our privacy commitment')
      return
    }

    // Validate evidence images
    if (includeEvidence && evidenceImages.length === 0) {
      setStatus('Please select at least one image if including evidence')
      return
    }

    setStatus('loading')
    setUploadProgress(0)

    try {
      // Generate anonymous ID if not exists
      let anonymousId = localStorage.getItem('anonymousId');
      if (!anonymousId) {
        anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('anonymousId', anonymousId);
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('contactMethod', contactMethod);
      formData.append('category', category);
      formData.append('anonymousId', anonymousId);

      // Add evidence images if enabled
      if (includeEvidence && evidenceImages.length > 0) {
        evidenceImages.forEach((image, index) => {
          formData.append('evidence', image.file);
        });
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('submitted')
        // Clear form
        setTitle('')
        setDescription('')
        setLocation('')
        setCategory('')
        setContactMethod('')
        setAgreePrivacy(false)
        setIncludeEvidence(false)
        // Clean up image previews
        evidenceImages.forEach(img => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
        setEvidenceImages([])
        setUploadProgress(0)

        // Check for badges in response first (immediate check)
        if (data.badges && Array.isArray(data.badges) && data.badges.length > 0 && onBadgeEarned) {
          console.log('🎉 Badge found in response!', data.badges);
          // Find Bravely badge or use first badge
          const bravelyBadge = data.badges.find(b => {
            const badgeName = (b.name || '').toLowerCase();
            return badgeName.includes('bravely') || badgeName.includes('brave');
          }) || data.badges[0];
          
          const badgeInfo = {
            name: bravelyBadge.name || 'Bravely',
            description: bravelyBadge.description || 'You showed courage by submitting a report',
            icon: bravelyBadge.icon || '🛡️',
            rarity: bravelyBadge.rarity || 'common'
          };
          
          console.log('🎉 Showing badge notification...', badgeInfo);
          onBadgeEarned(badgeInfo);
          window.dispatchEvent(new CustomEvent('badgeEarned', { detail: badgeInfo }));
        } else {
          // Fallback: Check by fetching badges after a delay
          console.log('🔍 No badges in response, checking by fetching...');
          setTimeout(async () => {
            try {
              const { data: badgeData, ok: badgeOk } = await getMyBadges(anonymousId);
              
              if (badgeOk && badgeData && badgeData.badges) {
                const bravelyBadge = badgeData.badges.find(b => {
                  const badgeName = (b.name || (b.badge && b.badge.name) || '').toLowerCase();
                  return badgeName.includes('bravely') || badgeName.includes('brave');
                });
                
                if (bravelyBadge && bravelyBadge.earnedAt && onBadgeEarned) {
                  const badgeEarnedAt = new Date(bravelyBadge.earnedAt);
                  const now = new Date();
                  const timeDiff = now - badgeEarnedAt;
                  
                  // If badge was earned in the last 60 seconds, show notification
                  if (timeDiff < 60000 && timeDiff >= 0) {
                    const badgeInfo = {
                      name: bravelyBadge.name || bravelyBadge.badge?.name || 'Bravely',
                      description: bravelyBadge.description || bravelyBadge.badge?.description || 'You showed courage by submitting a report',
                      icon: bravelyBadge.icon || bravelyBadge.badge?.icon || '🛡️',
                      rarity: bravelyBadge.rarity || bravelyBadge.badge?.rarity || 'common'
                    };
                    
                    console.log('🎉 Badge found on fetch! Showing notification...', badgeInfo);
                    onBadgeEarned(badgeInfo);
                    window.dispatchEvent(new CustomEvent('badgeEarned', { detail: badgeInfo }));
                  }
                }
              }
            } catch (err) {
              console.error('❌ Error checking badges:', err);
            }
          }, 2000);
        }

        // Clear success message after 5 seconds
        setTimeout(() => setStatus(null), 5000)
      } else {
        setStatus(data.message || 'error')
      }
    } catch (err) {
      console.error(err)
      setStatus('network error')
    }
  }

  const categories = [
    '🚨 Harassment',
    '⚠️ Safety Concern',
    '👥 Discrimination',
    '💼 Workplace Issue',
    '🏫 Educational',
    '🏥 Health-Related',
    '🌐 Online',
    '📍 Other'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Privacy Notice */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6 sm:p-8">
        <div className="flex gap-3">
          <span className="text-2xl flex-shrink-0">🔐</span>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">{t('privacy_protected')}</h3>
            <p className="text-gray-700 text-sm">
              {t('privacy_notice')}
            </p>
          </div>
        </div>
      </div>

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-bold text-gray-900 mb-2">
          📌 {t('title')} <span className="text-gray-500 font-normal">{t('optional')}</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Incident at workplace or online harassment"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
        />
        <p className="text-xs text-gray-500 mt-1">A short summary helps us categorize your report</p>
      </div>

      {/* Category Selection */}
      <div>
        <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-3">
          📂 {t('category')} <span className="text-gray-500 font-normal">{t('optional')}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${category === cat
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
          📝 {t('what_happened')} <span className="text-red-500">{t('required')}</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Please share what happened. Include as much detail as you're comfortable with:
• What happened?
• When did it occur?
• Where were you?
• Who was involved?
• How did it make you feel?

Take your time—there's no rush."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400 h-48 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {description.length > 0 ? `${description.length} characters` : 'Start typing when you\'re ready...'}
        </p>
      </div>

      {/* Location Field */}
      <div>
        <label htmlFor="location" className="block text-sm font-bold text-gray-900 mb-2">
          📍 {t('location')} <span className="text-gray-500 font-normal">{t('optional')}</span>
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., City/District, venue name, or 'Online'"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
        />
        <p className="text-xs text-gray-500 mt-1">General location only—nothing that could identify you</p>
      </div>

      {/* Contact Method Field */}
      <div>
        <label htmlFor="contact" className="block text-sm font-bold text-gray-900 mb-2">
          📧 {t('contact_method')} <span className="text-gray-500 font-normal">{t('optional')}</span>
        </label>
        <input
          id="contact"
          type="text"
          value={contactMethod}
          onChange={(e) => setContactMethod(e.target.value)}
          placeholder="e.g., email@example.com, phone number, or 'Prefer not to be contacted'"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
        />
        <p className="text-xs text-gray-500 mt-1">
          We will only contact you if you provide this information. Your choice is respected.
        </p>
      </div>

      {/* Evidence Images Section */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={includeEvidence}
            onChange={(e) => {
              setIncludeEvidence(e.target.checked);
              if (!e.target.checked) {
                // Clean up previews when disabling
                evidenceImages.forEach(img => {
                  if (img.preview) URL.revokeObjectURL(img.preview);
                });
                setEvidenceImages([]);
              }
            }}
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5 flex-shrink-0"
          />
          <div>
            <span className="font-bold text-gray-900">📸 {t('include_evidence')}</span>
            <p className="text-xs text-gray-600 mt-1">
              {t('evidence_description')}
            </p>
          </div>
        </label>

        {includeEvidence && (
          <div className="mt-4">
            <input
              type="file"
              id="evidence-upload"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handleFileSelect}
              disabled={evidenceImages.length >= 5}
              className="hidden"
            />
            <label
              htmlFor="evidence-upload"
              className={`inline-block px-4 py-2 rounded-lg font-medium cursor-pointer transition ${evidenceImages.length >= 5
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
            >
              {evidenceImages.length === 0 ? '📁 Select Images (Max 5, 5MB each)' : `📁 Add More Images (${evidenceImages.length}/5)`}
            </label>

            {evidenceImages.length > 0 && (
              <ImagePreview
                images={evidenceImages}
                onRemove={handleRemoveImage}
                maxImages={5}
              />
            )}
          </div>
        )}
      </div>

      {/* Privacy Acknowledgement */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-gray-700">
            <span className="font-bold text-gray-900">{t('agreement')}</span> {t('privacy_agreement')}
          </span>
        </label>
      </div>

      {/* Success/Error Messages */}
      {status && (
        <div
          className={`p-4 rounded-xl font-medium text-sm ${status === 'submitted'
              ? 'bg-green-100 text-green-800 border-2 border-green-300'
              : status === 'loading'
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-red-100 text-red-800 border-2 border-red-300'
            }`}
        >
          {status === 'submitted' && `✓ ${t('report_submitted')}`}
          {status === 'loading' && `⏳ ${t('submitting')}`}
          {status !== 'submitted' && status !== 'loading' && `❌ Error: ${status}`}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-200">
        <button
          type="submit"
          disabled={status === 'loading' || !agreePrivacy || !description.trim()}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('submitting')}
            </>
          ) : (
            <>
              <span>🚀</span>
              {t('submit')}
            </>
          )}
        </button>

        <button
          type="reset"
          onClick={() => {
            setTitle('')
            setDescription('')
            setLocation('')
            setCategory('')
            setContactMethod('')
            setAgreePrivacy(false)
            setIncludeEvidence(false)
            evidenceImages.forEach(img => {
              if (img.preview) URL.revokeObjectURL(img.preview);
            });
            setEvidenceImages([])
            setStatus(null)
            setUploadProgress(0)
          }}
          className="px-6 py-4 bg-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-300 transition-colors"
        >
          {t('clear_form')}
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <p className="text-sm text-gray-700 mb-3 font-bold">💡 Tips for Your Report:</p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✓ Be as specific as you can, but only share what you're comfortable with</li>
          <li>✓ Include dates and times if you remember them</li>
          <li>✓ Describe exactly what happened in your own words</li>
          <li>✓ You can include other people involved (without names if preferred)</li>
          <li>✓ This will help us better understand and respond to your situation</li>
        </ul>
      </div>

      {/* Emergency Help */}
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
        <p className="text-sm font-bold text-red-900 mb-2">🆘 In Immediate Danger?</p>
        <p className="text-sm text-red-800 mb-3">
          If you or someone you know is in immediate danger, please hang up and call emergency services now: <span className="font-bold">911</span>
        </p>
        <p className="text-sm text-red-800">
          Don't wait—your safety comes first. This form can wait. Help is available right now.
        </p>
      </div>
    </form>
  )
}
