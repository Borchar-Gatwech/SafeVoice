import React, { useState, useEffect } from 'react'
import { matchCircle } from '../api'
import PeerCircleChat from './PeerCircleChat'

export default function PeerSupportCircle() {
  const [step, setStep] = useState('welcome') // welcome, matching, joined, create
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [matchedCircle, setMatchedCircle] = useState(null)
  const [joinedCircle, setJoinedCircle] = useState(null)
  const [anonymousId, setAnonymousId] = useState('')
  const [memberDisplayName, setMemberDisplayName] = useState('')
  
  // Form data for matching
  const [formData, setFormData] = useState({
    incidentType: '',
    location: '',
    language: '',
    safetyLevel: '',
    wantsFacilitator: false
  })

  // Map display labels to API values
  const incidentTypeMap = {
    '🚨 Harassment': 'harassment',
    '⚠️ Safety Concern': 'safety_concern',
    '👥 Discrimination': 'discrimination',
    '💼 Workplace Issue': 'workplace_issue',
    '🏫 Educational': 'educational',
    '🏥 Health-Related': 'health_related',
    '🌐 Online': 'online_harassment',
    '📍 Other': 'other'
  }
  
  const incidentTypes = Object.keys(incidentTypeMap)

  const languages = [
    'English',
    'Spanish',
    'French',
    'Arabic',
    'Swahili',
    'Other'
  ]

  const safetyLevels = [
    '🟢 Low - General support',
    '🟡 Medium - Recent incident',
    '🔴 High - Active danger'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const searchForMatch = async () => {
    if (!formData.incidentType || !formData.location || !formData.language || !formData.safetyLevel) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Map incident type display value to API value
      const normalizedIncidentType = incidentTypeMap[formData.incidentType] || 'other'
      
      // Normalize location to locationRegion (expecting country name like "nigeria")
      const locationRegion = formData.location.toLowerCase().trim()
      
      // Normalize language to lowercase
      const normalizedLanguage = formData.language.toLowerCase().trim()
      
      // Map safety level to severity
      let severity = 'low'
      if (formData.safetyLevel.includes('High') || formData.safetyLevel.includes('🔴')) {
        severity = 'high'
      } else if (formData.safetyLevel.includes('Medium') || formData.safetyLevel.includes('🟡')) {
        severity = 'medium'
      }
      
      // Prepare API payload
      const apiPayload = {
        incidentType: normalizedIncidentType,
        locationRegion: locationRegion,
        language: normalizedLanguage,
        severity: severity
      }
      
      console.log('Sending API payload:', apiPayload) // Debug log
      
      const { data, ok } = await matchCircle(apiPayload)
      if (!ok) {
        throw new Error(data.message || 'Failed to search for match')
      }

      // Server auto-joins and returns circle + member info.
      const circle = { _id: data.circle.id || data.circle._id, ...data.circle }
      setMatchedCircle(circle)
      setJoinedCircle(circle)
      setAnonymousId(data.member?.anonymousId || '')
      setMemberDisplayName(data.member?.displayName || '')
      setStep('joined')
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const joinExistingCircle = async () => {
    if (!matchedCircle) return

    setLoading(true)
    setError('')

    try {
      // Reuse match endpoint to ensure the user is added and receives an anonymousId
      const { data, ok } = await matchCircle(formData)
      if (!ok) throw new Error(data.message || 'Failed to join circle')

      const circle = { _id: data.circle.id || data.circle._id, ...data.circle }
      setJoinedCircle(circle)
      setAnonymousId(data.member?.anonymousId || '')
      setMemberDisplayName(data.member?.displayName || '')
      setStep('joined')
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createNewCircle = async () => {
    setLoading(true)
    setError('')

    try {
      // Use match endpoint which will create a new circle if none exists
      const { data, ok } = await matchCircle(formData)
      if (!ok) throw new Error(data.message || 'Failed to create circle')

      const circle = { _id: data.circle.id || data.circle._id, ...data.circle }
      setJoinedCircle(circle)
      setAnonymousId(data.member?.anonymousId || '')
      setMemberDisplayName(data.member?.displayName || '')
      setStep('joined')
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetFlow = () => {
    setStep('welcome')
    setFormData({
      incidentType: '',
      location: '',
      language: '',
      safetyLevel: '',
      wantsFacilitator: false
    })
    setMatchedCircle(null)
    setJoinedCircle(null)
    setError('')
  }

  return (
    <div className="space-y-8">
      {/* Welcome Step */}
      {step === 'welcome' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              👥 Find Your Peer Support Circle
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Connect with 3-5 survivors who understand what you've been through. Share experiences, provide mutual support, and know you're not alone.
            </p>
            <div className="space-y-3 text-gray-700">
              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <div>
                  <p className="font-semibold">Verified Members</p>
                  <p className="text-sm text-gray-600">All members are verified survivors committed to support</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <div>
                  <p className="font-semibold">AI Safety Monitoring</p>
                  <p className="text-sm text-gray-600">Our AI monitors conversations for safety and provides resources</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">✓</span>
                <div>
                  <p className="font-semibold">Shared Experiences</p>
                  <p className="text-sm text-gray-600">Connected by similar experiences and location for genuine understanding</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                🎯 What type of incident? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {incidentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleInputChange('incidentType', type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.incidentType === type
                        ? 'bg-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                📍 Your Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Nairobi, Lagos, Online"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">General location only—helps match with nearby survivors</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                🌐 Preferred Language <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleInputChange('language', lang)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.language === lang
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                🚨 Safety Level <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {safetyLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleInputChange('safetyLevel', level)}
                    className={`w-full px-4 py-3 text-left rounded-lg font-medium transition-all ${
                      formData.safetyLevel === level
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Helps us match you with members at similar safety levels
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.wantsFacilitator}
                  onChange={(e) => handleInputChange('wantsFacilitator', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-bold text-gray-900">Would you like a trained facilitator?</span>
                  <p className="text-xs text-gray-600 mt-1">A professional can help guide circle conversations (optional)</p>
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 border-2 border-red-300 rounded-xl p-4">
                <p className="font-bold">❌ Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={searchForMatch}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Searching for matches...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Find My Circle
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Matching Found Step */}
      {step === 'matching' && matchedCircle && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              ✨ Match Found!
            </h2>
            <p className="text-lg text-gray-700">
              We found a peer support circle with members who share similar experiences and are in your area.
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Incident Type</p>
              <p className="text-lg font-semibold text-gray-900">{matchedCircle.incidentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-900">{matchedCircle.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Language</p>
              <p className="text-lg font-semibold text-gray-900">{matchedCircle.language}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Circle Members</p>
              <p className="text-lg font-semibold text-gray-900">
                {matchedCircle.memberCount || 1} / {matchedCircle.maxMembers || 5} members
              </p>
            </div>
            {matchedCircle.needsFacilitator && (
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <span className="text-lg">👤</span>
                <p className="text-sm text-gray-700">This circle has a <span className="font-semibold">verified facilitator</span></p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={joinExistingCircle}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Joining circle...
                </>
              ) : (
                <>
                  <span>👥</span>
                  Join This Circle
                </>
              )}
            </button>
            <button
              onClick={resetFlow}
              className="w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              Search Again
            </button>
          </div>
        </div>
      )}

      {/* Create New Circle Step */}
      {step === 'create' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🌱 Start a New Circle
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              No existing circle matches your criteria right now. That's okay! You can start a new circle and others will be matched with you.
            </p>
            <p className="text-gray-600">
              As the circle founder, you'll help shape this supportive community. Other survivors with similar experiences will be invited to join.
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Incident Type</p>
              <p className="text-lg font-semibold text-gray-900">{formData.incidentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-900">{formData.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Language</p>
              <p className="text-lg font-semibold text-gray-900">{formData.language}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Safety Level</p>
              <p className="text-lg font-semibold text-gray-900">{formData.safetyLevel}</p>
            </div>
            {formData.wantsFacilitator && (
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <span className="text-lg">👤</span>
                <p className="text-sm text-gray-700">You've requested a <span className="font-semibold">trained facilitator</span></p>
              </div>
            )}
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <p className="text-sm text-gray-700 mb-2 font-semibold">💡 What happens next?</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Your circle will be created and visible to potential members</li>
              <li>✓ We'll match survivors with similar backgrounds and locations</li>
              <li>✓ You'll receive notifications when members join</li>
              <li>✓ The group will have up to 5 members for intimate conversations</li>
              <li>✓ All conversations are private and secure</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 border-2 border-red-300 rounded-xl p-4">
              <p className="font-bold">❌ Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={createNewCircle}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Creating circle...
                </>
              ) : (
                <>
                  <span>🌱</span>
                  Create My Circle
                </>
              )}
            </button>
            <button
              onClick={resetFlow}
              className="w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Circle Joined Successfully - Show Chat */}
      {step === 'joined' && joinedCircle && anonymousId && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  🎉 Welcome to Your Circle!
                </h2>
                <p className="text-sm text-gray-700">
                  {joinedCircle.location || 'Peer Support Circle'} • {joinedCircle.memberCount || 1} members
                </p>
              </div>
              <button
                onClick={resetFlow}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition border border-gray-200"
              >
                Leave Circle
              </button>
            </div>
          </div>

          {/* Real-time Chat Interface */}
          <PeerCircleChat
            circleId={joinedCircle._id || joinedCircle.id}
            anonymousId={anonymousId}
            displayName={memberDisplayName}
            onLeave={resetFlow}
          />

          {/* Safety Reminders - Collapsible */}
          <details className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <summary className="text-sm font-bold text-gray-900 cursor-pointer">
              🛡️ Safety Reminders
            </summary>
            <ul className="text-sm text-gray-700 space-y-1 mt-3">
              <li>• Never share personal identifying information</li>
              <li>• If conversations become unsafe, report members to moderators</li>
              <li>• Our AI monitors for abuse and harmful behavior</li>
              <li>• You're always in control—leave if you're uncomfortable</li>
            </ul>
          </details>
        </div>
      )}
    </div>
  )
}
