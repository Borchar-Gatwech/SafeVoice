import React, { useState } from 'react'
import ReportForm from './components/ReportForm'
import Homepage from './components/Homepage'
import EmotionalSupportChat from './components/EmotionalSupportChat'
import AdminDashboard from './components/AdminDashboard'
import PeerSupportCircle from './components/PeerSupportCircle'

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'report', label: 'Submit Report', icon: '📝' },
  { id: 'support', label: 'AI Support Chat', icon: '💬' },
  { id: 'circle', label: 'Peer Circle', icon: '👥' },
  { id: 'resources', label: 'Resources', icon: '📞' },
  { id: 'admin', label: 'Admin', icon: '⚙️' }
]

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NavButton = ({ item }) => (
    <button
      onClick={() => {
        setCurrentPage(item.id)
        setMobileMenuOpen(false)
      }}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
        currentPage === item.id
          ? 'bg-purple-600 text-white shadow-lg'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🛡️</div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SafeVoice
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(item => (
                <NavButton key={item.id} item={item} />
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4 flex flex-col gap-2">
              {navItems.map(item => (
                <NavButton key={item.id} item={item} />
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {currentPage === 'home' && <Homepage setCurrentPage={setCurrentPage} />}
        
        {currentPage === 'report' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 sm:px-8 py-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">📝 Submit Anonymous Report</h2>
              <p className="text-purple-100 mt-2">Your identity is completely protected</p>
            </div>
            <div className="p-6 sm:p-8">
              <ReportForm />
            </div>
          </div>
        )}
        
        {currentPage === 'support' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">💬 AI Emotional Support Chat</h2>
              <p className="text-blue-100 mt-2">Talk to our compassionate AI assistant anytime</p>
            </div>
            <div className="p-6 sm:p-8">
              <EmotionalSupportChat />
            </div>
          </div>
        )}
        
        {currentPage === 'circle' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">👥 Peer Support Circle</h2>
              <p className="text-indigo-100 mt-2">Connect with survivors and find strength in shared experiences</p>
            </div>
            <div className="p-6 sm:p-8">
              <PeerSupportCircle />
            </div>
          </div>
        )}
        
        {currentPage === 'resources' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 sm:px-8 py-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">📞 Safety Resources</h2>
              <p className="text-green-100 mt-2">Find help and support when you need it most</p>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              <div className="border-l-4 border-purple-600 pl-6 py-4 hover:bg-purple-50 rounded-r-lg transition-colors">
                <h3 className="text-xl font-bold text-gray-900">🚨 Emergency Hotlines</h3>
                <p className="text-gray-600 mt-3 font-medium">National Sexual Assault Hotline</p>
                <p className="text-gray-700 text-lg">+254695530598</p>
                <p className="text-gray-600 mt-2 font-medium">Domestic Violence Hotline</p>
                <p className="text-gray-700 text-lg">+2547695530598</p>
              </div>
              
              <div className="border-l-4 border-blue-600 pl-6 py-4 hover:bg-blue-50 rounded-r-lg transition-colors">
                <h3 className="text-xl font-bold text-gray-900">💻 Online Support</h3>
                <p className="text-gray-600 mt-3">SAFE.org - Confidential support and resources</p>
                <p className="text-gray-600">Crisis Text Line: Text HOME to 741741</p>
              </div>

              <div className="border-l-4 border-green-600 pl-6 py-4 hover:bg-green-50 rounded-r-lg transition-colors">
                <h3 className="text-xl font-bold text-gray-900">🌍 International Support</h3>
                <p className="text-gray-600 mt-3">Global resources and information available at WHO.int</p>
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'admin' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 sm:px-8 py-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">⚙️ Admin Dashboard</h2>
              <p className="text-gray-300 mt-2">Manage reports and system settings</p>
            </div>
            <div className="p-6 sm:p-8">
              <AdminDashboard />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span>🛡️</span> SafeVoice
              </h4>
              <p className="text-sm text-gray-400">Anonymous reporting platform for women and girls</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="text-sm space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Anonymous Reports</a></li>
                <li><a href="#" className="hover:text-white transition">AI Support Chat</a></li>
                <li><a href="#" className="hover:text-white transition">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Privacy</h4>
              <ul className="text-sm space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 SafeVoice - All reports are confidential and secure | Built with 💜 for your safety</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
