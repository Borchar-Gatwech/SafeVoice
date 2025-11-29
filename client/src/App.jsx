import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReportForm from './components/ReportForm'
import Homepage from './components/Homepage'
import EmotionalSupportChatEnhanced from './components/EmotionalSupportChatEnhanced'
import AdminDashboard from './components/AdminDashboard'
import PeerSupportCircle from './components/PeerSupportCircle'
import Resources from './components/Resources'
import LanguageSelector from './components/LanguageSelector'
import DeveloperPortal from './components/DeveloperPortal'
import BadgeShowcase from './components/BadgeShowcase'
import BadgeNotification from './components/BadgeNotification'
import QuickHelpButton from './components/QuickHelpButton'

// Main navigation items (shown in navbar) - labels will be translated in component
const mainNavItems = [
  { id: 'home', labelKey: 'home', icon: '🏠' },
  { id: 'report', labelKey: 'submit_report', icon: '📝' },
  { id: 'support', labelKey: 'ai_support_chat', icon: '💬' },
  { id: 'circle', labelKey: 'peer_circle', icon: '👥' },
  { id: 'resources', labelKey: 'resources', icon: '📞' }
]

// Secondary navigation items (moved to footer) - labels will be translated in component
const secondaryNavItems = [
  { id: 'badges', labelKey: 'my_badges', icon: '🏆' },
  { id: 'developer', labelKey: 'developer_portal', icon: '🚀' },
  { id: 'admin', labelKey: 'admin', icon: '⚙️' }
]

export default function App() {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newBadge, setNewBadge] = useState(null)

  // Get anonymousId from localStorage
  const getAnonymousId = () => {
    let anonymousId = localStorage.getItem('anonymousId');
    if (!anonymousId) {
      anonymousId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('anonymousId', anonymousId);
    }
    return anonymousId;
  }

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
      <span>{t(item.labelKey || item.id)}</span>
    </button>
  )

  return (
    <div className=" bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
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
              {mainNavItems.map(item => (
                <NavButton key={item.id} item={item} />
              ))}
              <LanguageSelector />
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
              {mainNavItems.map(item => (
                <NavButton key={item.id} item={item} />
              ))}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <LanguageSelector />
              </div>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <p className="text-xs text-gray-500 mb-2">More Options:</p>
                {secondaryNavItems.map(item => (
                  <NavButton key={item.id} item={item} />
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full">
        {currentPage === 'home' && <Homepage setCurrentPage={setCurrentPage} />}
        
        {currentPage === 'report' && (
          <div className="bg-white shadow-lg overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 sm:px-8 py-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">📝 {t('submit_report')}</h2>
              <p className="text-purple-100 mt-2">{t('privacy_protected')}</p>
            </div>
            <div className="flex-1 flex items-center justify-center p-5 sm:p-6">
              <div className="w-full max-w-3xl">
                <ReportForm 
                  setCurrentPage={setCurrentPage} 
                  onBadgeEarned={(badge) => setNewBadge(badge)}
                />
              </div>
            </div>
          </div>
        )}
        
        {currentPage === 'support' && (
          <div className="bg-white shadow-lg overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">💬 {t('ai_support_chat')}</h2>
              <p className="text-blue-100 mt-2">{t('ai_chat_description', { defaultValue: 'Talk to our compassionate AI assistant anytime' })}</p>
            </div>
            <div className="flex-1 p-0">
              <EmotionalSupportChatEnhanced setCurrentPage={setCurrentPage} />
            </div>
          </div>
        )}
        
        {currentPage === 'badges' && (
          <div className="bg-white shadow-lg overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 sm:px-8 py-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">🏆 {t('my_badges', { defaultValue: 'My Badges' })}</h2>
              <p className="text-yellow-100 mt-2">{t('view_badges_progress', { defaultValue: 'View your badges and progress' })}</p>
            </div>
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
              <BadgeShowcase anonymousId={getAnonymousId()} />
            </div>
          </div>
        )}
        
        {currentPage === 'developer' && (
          <DeveloperPortal />
        )}
        
        {currentPage === 'circle' && (
          <div className="bg-white shadow-lg overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">👥 {t('peer_circle')}</h2>
              <p className="text-indigo-100 mt-2">{t('circle_description')}</p>
            </div>
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
              <PeerSupportCircle />
            </div>
          </div>
        )}
        
        {currentPage === 'resources' && (
          <div className="bg-white shadow-lg overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 sm:px-8 py-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">📞 {t('resources')}</h2>
              <p className="text-green-100 mt-2">{t('find_help')}</p>
            </div>
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
              <Resources />
            </div>
          </div>
        )}
        
        {currentPage === 'admin' && (
          <div className="bg-white shadow-lg overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 sm:px-8 py-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">⚙️ {t('admin_dashboard')}</h2>
              <p className="text-gray-300 mt-2">{t('manage_reports')}</p>
            </div>
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
              <AdminDashboard />
            </div>
          </div>
        )}
      </main>

      {/* Badge Notification Overlay */}
      {newBadge && (
        <BadgeNotification
          badge={newBadge}
          onClose={() => setNewBadge(null)}
          onViewBadges={() => {
            setNewBadge(null);
            setCurrentPage('badges');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Quick Help Floating Button */}
      <QuickHelpButton setCurrentPage={setCurrentPage} />

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span>🛡️</span> SafeVoice
              </h4>
              <p className="text-sm text-gray-400">Anonymous reporting platform for women and girls</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="text-sm space-y-2 text-gray-400">
                <li><button onClick={() => setCurrentPage('report')} className="hover:text-white transition text-left">Anonymous Reports</button></li>
                <li><button onClick={() => setCurrentPage('support')} className="hover:text-white transition text-left">AI Support Chat</button></li>
                <li><button onClick={() => setCurrentPage('resources')} className="hover:text-white transition text-left">Resources</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">More</h4>
              <ul className="text-sm space-y-2 text-gray-400">
                {secondaryNavItems.map(item => (
                  <li key={item.id}>
                    <button 
                      onClick={() => {
                        setCurrentPage(item.id)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="hover:text-white transition flex items-center gap-2"
                    >
                      <span>{item.icon}</span>
                      <span>{t(item.labelKey || item.id)}</span>
                    </button>
                  </li>
                ))}
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
