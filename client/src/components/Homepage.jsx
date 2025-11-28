import React from 'react'

export default function Homepage({ setCurrentPage }) {
  const features = [
    {
      icon: '🔒',
      title: 'Completely Anonymous',
      description: 'No personal information required. Your identity is never exposed or logged.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '🛡️',
      title: 'Safe & Secure',
      description: 'End-to-end encryption protects your reports. Your safety is our priority.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '💬',
      title: '24/7 AI Support',
      description: 'Talk to our compassionate AI assistant anytime, anywhere you need help.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '👥',
      title: 'Peer Support Circles',
      description: 'Connect with 3-5 survivors who understand. Share experiences and find strength together.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: '📞',
      title: 'Connected Resources',
      description: 'Access professional support networks and crisis hotlines when you need them.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '⚡',
      title: 'Instant Submission',
      description: 'Submit your report in minutes. No forms, no complications, just support.',
      color: 'from-pink-500 to-pink-600'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Share Your Experience',
      description: 'Tell us what happened in your own words. Share as much or as little as you\'re comfortable with.',
      icon: '✍️'
    },
    {
      number: '2',
      title: 'Submit Anonymously',
      description: 'Your report is submitted securely with zero traceability. You remain completely anonymous.',
      icon: '🔐'
    },
    {
      number: '3',
      title: 'Get Support',
      description: 'Access resources, find support networks, or chat with our AI companion whenever you need.',
      icon: '💪'
    }
  ]

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 text-white text-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -mr-36 -mt-36"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full -ml-36 -mb-36"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Your Voice Matters
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            SafeVoice is a safe, anonymous platform where women and girls can report harassment, abuse, and discrimination without fear. We listen. We care. We act.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentPage('report')}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              📝 Submit a Report
            </button>
            <button
              onClick={() => setCurrentPage('circle')}
              className="px-8 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition-all transform hover:scale-105 shadow-lg text-lg border-2 border-white"
            >
              👥 Find Peer Circle
            </button>
          </div>
        </div>
      </section>

      {/* Why SafeVoice */}
      <section>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">Why Choose SafeVoice?</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto text-lg">
          Built with your safety in mind. Designed for your empowerment.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 group hover:scale-105 transform"
            >
              <div className={`text-5xl mb-4 inline-block p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white group-hover:scale-110 transform transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-3xl shadow-lg p-8 sm:p-12 lg:p-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">How It Works</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto text-lg">
          Three simple steps to share your story and get support.
        </p>

        <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-bold mb-4 shadow-lg">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-8 -right-4 lg:-right-8">
                  <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 text-center">
          <p className="text-gray-700 font-medium">
            ✨ Each step is designed with <span className="text-purple-600 font-bold">your safety and privacy</span> in mind
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl text-white p-8 sm:p-12 lg:p-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl sm:text-5xl font-bold mb-2">100%</p>
            <p className="text-gray-300 text-lg">Anonymous</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-bold mb-2">24/7</p>
            <p className="text-gray-300 text-lg">Available Support</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-bold mb-2">∞</p>
            <p className="text-gray-300 text-lg">Secure Storage</p>
          </div>
        </div>
      </section>

      {/* Features Spotlight */}
      <section className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Anonymous Reporting */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 sm:p-12 text-white flex flex-col justify-center">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">📝 Anonymous Reporting</h3>
            <p className="text-lg text-purple-100 mb-6">
              Submit detailed reports of harassment, abuse, or safety concerns completely anonymously. Your story matters, and your safety is protected.
            </p>
            <ul className="space-y-3 text-purple-100">
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>No names or personal information needed</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Encrypted end-to-end</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Reviewed by trained professionals</span>
              </li>
            </ul>
            <button
              onClick={() => setCurrentPage('report')}
              className="mt-8 px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-all self-start"
            >
              Start Reporting →
            </button>
          </div>

          {/* AI Support Chat */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 sm:p-12 text-white flex flex-col justify-center">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">💬 AI Emotional Support</h3>
            <p className="text-lg text-blue-100 mb-6">
              Chat with our compassionate AI assistant 24/7. Get emotional support, process your feelings, and access helpful resources anytime.
            </p>
            <ul className="space-y-3 text-blue-100">
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Available anytime, anywhere</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Non-judgmental conversations</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Nothing is stored or tracked</span>
              </li>
            </ul>
            <button
              onClick={() => setCurrentPage('support')}
              className="mt-8 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-all self-start"
            >
              Start Chatting →
            </button>
          </div>

          {/* Peer Support Circles */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 sm:p-12 text-white flex flex-col justify-center">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">👥 Peer Support Circles</h3>
            <p className="text-lg text-indigo-100 mb-6">
              Connect with 3-5 other survivors who share similar experiences. Find strength in community, share stories safely, and support each other.
            </p>
            <ul className="space-y-3 text-indigo-100">
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Verified members and safe spaces</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>AI safety monitoring</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span>Optional trained facilitators</span>
              </li>
            </ul>
            <button
              onClick={() => setCurrentPage('circle')}
              className="mt-8 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-all self-start"
            >
              Find Your Circle →
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 text-white text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Ready to Take the First Step?</h2>
        <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
          You deserve to be heard. You deserve to be safe. SafeVoice is here for you, completely confidential and always available.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setCurrentPage('report')}
            className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            Submit My Report
          </button>
          <button
            onClick={() => setCurrentPage('circle')}
            className="px-8 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition-all transform hover:scale-105 shadow-lg text-lg border-2 border-white"
          >
            Join a Peer Circle
          </button>
        </div>
      </section>

      {/* Safety Notice */}
      <section className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 sm:p-8 text-center">
        <p className="text-yellow-900 font-bold text-lg mb-2">⚠️ In Immediate Danger?</p>
        <p className="text-yellow-800 mb-4">
          If you or someone you know is in immediate danger, please contact emergency services right away.
        </p>
        <button
          onClick={() => setCurrentPage('resources')}
          className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors"
        >
          View Emergency Resources →
        </button>
      </section>
    </div>
  )
}
