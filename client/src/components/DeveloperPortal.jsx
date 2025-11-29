import React, { useState, useEffect } from 'react';
import { registerDeveloper, getDeveloperUsage } from '../api';
import africaMapUrl from '../../asset/africa.svg?url';

export default function DeveloperPortal() {
  const [activeSection, setActiveSection] = useState('overview');
  const [apiKey, setApiKey] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    appName: '',
    appDescription: ''
  });

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('developer-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      loadUsage(savedKey);
    }
  }, []);

  const loadUsage = async (key) => {
    try {
      const { data, ok } = await getDeveloperUsage(key);
      if (ok) {
        setUsage(data);
      }
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, ok } = await registerDeveloper(
        formData.name,
        formData.email,
        formData.appName,
        formData.appDescription
      );

      if (ok && data.apiKey) {
        const key = data.apiKey.key || data.apiKey;
        setApiKey(key);
        localStorage.setItem('developer-api-key', key);
        setActiveSection('dashboard');
        loadUsage(key);
      } else {
        alert(data.message || 'Failed to register');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      alert('API key copied to clipboard!');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col ">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16 px-4 ">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">🚀 SafeCircle Developer Portal</h1>
          <p className="text-xl text-purple-100 mb-6">
            Add peer support to your platform in 5 minutes
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveSection('register')}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:shadow-lg transition"
            >
              Get API Key
            </button>
            <button
              onClick={() => {
                // Open documentation in new tab or scroll to docs section
                window.open('https://github.com/SafeVoice', '_blank');
              }}
              className="px-6 py-3 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition"
            >
              View Docs
            </button>
          </div>
          <div className="mt-8 flex justify-center gap-8 text-sm">
            <div>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-purple-200">APIs Registered</p>
            </div>
            <div>
              <p className="text-2xl font-bold">45.2K</p>
              <p className="text-purple-200">Requests Served</p>
            </div>
            <div>
              <p className="text-2xl font-bold">89</p>
              <p className="text-purple-200">Platforms Protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'register', label: 'Get API Key' },
              { id: 'dashboard', label: 'Dashboard', requiresKey: true },
              { id: 'map', label: 'GBV Statistics Map' },
              { id: 'playground', label: 'API Playground' },
              { id: 'examples', label: 'Examples' }
            ].map((tab) => {
              if (tab.requiresKey && !apiKey) return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`px-6 py-4 font-medium border-b-2 transition ${
                    activeSection === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Overview */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-4">Production-Ready API</h2>
              <p className="text-gray-300 text-lg mb-6">
                SafeCircle provides a comprehensive API for integrating peer support and safety features into your platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">🔌 Easy Integration</h3>
                  <p className="text-gray-300">RESTful API with clear documentation</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">🛡️ Privacy First</h3>
                  <p className="text-gray-300">Anonymous by design, GDPR compliant</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-2">📊 Real-time Data</h3>
                  <p className="text-gray-300">Live statistics and insights</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Key Registration */}
        {activeSection === 'register' && (
          <div className="bg-gray-800 rounded-xl p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Register for API Key</h2>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Developer Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">App Name</label>
                <input
                  type="text"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">App Description (Optional)</label>
                <textarea
                  value={formData.appDescription}
                  onChange={(e) => setFormData({ ...formData, appDescription: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Get API Key'}
              </button>
            </form>

            {apiKey && (
              <div className="mt-6 bg-green-900/50 border border-green-500 rounded-lg p-4">
                <p className="font-bold mb-2">✓ API Key Generated!</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-900 px-3 py-2 rounded text-sm break-all">
                    {apiKey}
                  </code>
                  <button
                    onClick={copyApiKey}
                    className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  ⚠️ Store this securely. It cannot be recovered.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dashboard */}
        {activeSection === 'dashboard' && apiKey && (
          <DashboardSection apiKey={apiKey} usage={usage} />
        )}

        {/* Map */}
        {activeSection === 'map' && (
          <GBVStatisticsMap />
        )}

        {/* API Playground */}
        {activeSection === 'playground' && (
          <APIPlayground apiKey={apiKey} />
        )}

        {/* Examples */}
        {activeSection === 'examples' && (
          <IntegrationExamples />
        )}
      </div>
    </div>
  );
}

// Dashboard Section Component
function DashboardSection({ apiKey, usage }) {
  const usageData = usage || {
    requestsThisMonth: 45,
    requestLimit: 1000,
    remaining: 955
  };

  const percentage = (usageData.requestsThisMonth / usageData.requestLimit) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Usage This Month</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{usageData.requestsThisMonth} / {usageData.requestLimit} requests</span>
            <span>{usageData.remaining} remaining</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Most Used Endpoint</p>
          <p className="text-2xl font-bold">/circles/match</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Avg Response Time</p>
          <p className="text-2xl font-bold">142ms</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Error Rate</p>
          <p className="text-2xl font-bold text-green-400">0.2%</p>
        </div>
      </div>
    </div>
  );
}

// GBV Statistics Map Component
function GBVStatisticsMap() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  
  // Statistics data for African countries
  // Coordinates are in SVG viewBox units (0-1000 for x, 0-1001 for y)
  const countryStats = {
    kenya: { 
      name: 'Kenya',
      totalIncidents: 1247, 
      riskScore: 7.2, 
      topPlatform: 'Facebook', 
      circlesActive: 34,
      x: 807, // Approximate center of Kenya in SVG coordinates
      y: 490,
      color: '#8B5CF6'
    },
    nigeria: { 
      name: 'Nigeria',
      totalIncidents: 2156, 
      riskScore: 8.1, 
      topPlatform: 'Instagram', 
      circlesActive: 67,
      x: 468, // Approximate center of Nigeria in SVG coordinates
      y: 380,
      color: '#EC4899'
    },
    southAfrica: { 
      name: 'South Africa',
      totalIncidents: 1890, 
      riskScore: 7.8, 
      topPlatform: 'Twitter', 
      circlesActive: 45,
      x: 625, // Approximate center of South Africa in SVG coordinates
      y: 920,
      color: '#F59E0B'
    },
    ghana: { 
      name: 'Ghana',
      totalIncidents: 892, 
      riskScore: 6.5, 
      topPlatform: 'Facebook', 
      circlesActive: 23,
      x: 296, // Approximate center of Ghana in SVG coordinates
      y: 400,
      color: '#10B981'
    },
    tanzania: { 
      name: 'Tanzania',
      totalIncidents: 654, 
      riskScore: 6.1, 
      topPlatform: 'WhatsApp', 
      circlesActive: 18,
      x: 790, // Approximate center of Tanzania in SVG coordinates
      y: 600,
      color: '#3B82F6'
    },
    uganda: { 
      name: 'Uganda',
      totalIncidents: 743, 
      riskScore: 6.8, 
      topPlatform: 'Facebook', 
      circlesActive: 21,
      x: 711, // Approximate center of Uganda in SVG coordinates
      y: 480,
      color: '#EF4444'
    },
    ethiopia: { 
      name: 'Ethiopia',
      totalIncidents: 1023, 
      riskScore: 6.9, 
      topPlatform: 'Telegram', 
      circlesActive: 28,
      x: 755, // Approximate center of Ethiopia in SVG coordinates
      y: 350,
      color: '#06B6D4'
    },
    egypt: { 
      name: 'Egypt',
      totalIncidents: 1456, 
      riskScore: 7.5, 
      topPlatform: 'Facebook', 
      circlesActive: 39,
      x: 629, // Approximate center of Egypt in SVG coordinates
      y: 140,
      color: '#F97316'
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 8) return '#EF4444'; // Red - High risk
    if (riskScore >= 7) return '#F59E0B'; // Orange - Medium-High
    if (riskScore >= 6) return '#10B981'; // Green - Medium
    return '#6B7280'; // Gray - Low
  };

  const getPulseSize = (incidents) => {
    // Scale pulse size based on incidents (max 2500 = full size)
    return Math.min((incidents / 2500) * 100, 100);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">🗺️ African GBV Statistics Map</h3>
        <p className="text-sm text-gray-400">Click on hotspots to view statistics</p>
      </div>
      
      {/* Interactive Map Visualization */}
      <div className="relative bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg h-[600px] overflow-hidden border-2 border-gray-600">
        {/* Africa Map Background */}
        <img 
          src={africaMapUrl} 
          alt="Africa Map"
          className="absolute inset-0 w-full h-full object-contain opacity-90"
          style={{ filter: 'brightness(0.8) contrast(1.1)' }}
        />
        
        {/* Hotspots Overlay */}
        <svg 
          viewBox="0 0 1000 1001" 
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Country Hotspots */}
          {Object.entries(countryStats).map(([countryKey, stats]) => {
            const isSelected = selectedCountry === countryKey;
            const isHovered = hoveredCountry === countryKey;
            const pulseSize = getPulseSize(stats.totalIncidents);
            
            return (
              <g key={countryKey} style={{ pointerEvents: 'auto' }}>
                {/* Animated Pulse Ring */}
                <circle
                  cx={stats.x}
                  cy={stats.y}
                  r={15 + (pulseSize / 10)}
                  fill={stats.color}
                  opacity="0.3"
                  className="animate-ping"
                />
                
                {/* Hotspot Circle */}
                <circle
                  cx={stats.x}
                  cy={stats.y}
                  r="8"
                  fill={isSelected || isHovered ? stats.color : getRiskColor(stats.riskScore)}
                  stroke="#fff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:r-[12]"
                  onClick={() => setSelectedCountry(countryKey)}
                  onMouseEnter={() => setHoveredCountry(countryKey)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  style={{
                    filter: isSelected || isHovered ? 'drop-shadow(0 0 12px ' + stats.color + ')' : 'none',
                    pointerEvents: 'auto'
                  }}
                />
                
                {/* Country Label (on hover) */}
                {isHovered && (
                  <text
                    x={stats.x}
                    y={stats.y - 15}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="20"
                    fontWeight="bold"
                    className="pointer-events-none"
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {stats.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 text-sm">
          <p className="font-bold mb-2 text-white">Risk Level:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-300">High (8+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-gray-300">Medium-High (7-8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-300">Medium (6-7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span className="text-gray-300">Low (&lt;6)</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute top-4 right-4 bg-purple-600/90 backdrop-blur-sm rounded-lg p-3 text-sm text-white max-w-xs">
          <p className="font-semibold mb-1">💡 How to use:</p>
          <p className="text-purple-100 text-xs">Hover over hotspots to see country names. Click to view detailed statistics.</p>
        </div>
      </div>

      {/* Selected Country Stats */}
      {selectedCountry && countryStats[selectedCountry] && (
        <div className="mt-6 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-6 border-2 border-purple-500 animate-fadeIn">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-2xl font-bold text-white">
              📍 {countryStats[selectedCountry].name}
            </h4>
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total Incidents</p>
              <p className="text-3xl font-bold text-white">{countryStats[selectedCountry].totalIncidents.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Reported this year</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Risk Score</p>
              <p className="text-3xl font-bold" style={{ color: getRiskColor(countryStats[selectedCountry].riskScore) }}>
                {countryStats[selectedCountry].riskScore}/10
              </p>
              <p className="text-xs text-gray-500 mt-1">Overall risk level</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Top Platform</p>
              <p className="text-xl font-bold text-white">{countryStats[selectedCountry].topPlatform}</p>
              <p className="text-xs text-gray-500 mt-1">Most incidents reported</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Active Circles</p>
              <p className="text-3xl font-bold text-purple-400">{countryStats[selectedCountry].circlesActive}</p>
              <p className="text-xs text-gray-500 mt-1">Support groups active</p>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>⚡</span>
              <span>Data updated in real-time | Last sync: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Country List (Quick Access) */}
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-300 mb-3">Quick Access:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(countryStats).map(([countryKey, stats]) => (
            <button
              key={countryKey}
              onClick={() => setSelectedCountry(countryKey)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedCountry === countryKey
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {stats.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// API Playground Component
function APIPlayground({ apiKey }) {
  const [endpoint, setEndpoint] = useState('/api/circles/match');
  const [method, setMethod] = useState('POST');
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    incidentType: 'online_harassment',
    locationRegion: 'kenya'
  }, null, 2));
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTryIt = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (apiKey) {
        options.headers['X-API-Key'] = apiKey;
      }

      if (method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(`${API_URL}${endpoint}`, options);
      const data = await res.json();
      setResponse({
        status: res.status,
        data,
        statusText: res.statusText
      });
    } catch (error) {
      setResponse({
        status: 'Error',
        data: { error: error.message },
        statusText: 'Request Failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-6">
      <h3 className="text-2xl font-bold">API Playground</h3>
      
      <div className="flex gap-4">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PATCH</option>
        </select>
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
          placeholder="/api/endpoint"
        />
        <button
          onClick={handleTryIt}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Try It'}
        </button>
      </div>

      {method !== 'GET' && (
        <div>
          <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows="8"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg font-mono text-sm"
          />
        </div>
      )}

      {response && (
        <div>
          <label className="block text-sm font-medium mb-2">Response</label>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">
              Status: <span className={`font-bold ${response.status === 200 ? 'text-green-400' : 'text-red-400'}`}>
                {response.status} {response.statusText}
              </span>
            </p>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Integration Examples Component
function IntegrationExamples() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Integration Examples</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dating App */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-xl font-bold mb-3">💕 Dating App</h4>
          <p className="text-gray-300 mb-4">
            Add a "Get Support" button that matches users to peer circles.
          </p>
          <div className="bg-gray-900 rounded p-4 text-sm font-mono text-gray-400">
            {`<SafeCircleWidget 
  appId="your-app-id"
  onMatch={(circle) => {
    // Handle circle match
  }}
/>`}
          </div>
        </div>

        {/* Forum */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-xl font-bold mb-3">💬 Forum</h4>
          <p className="text-gray-300 mb-4">
            Show resource finder widget for location-based help.
          </p>
          <div className="bg-gray-900 rounded p-4 text-sm font-mono text-gray-400">
            {`<ResourceFinder 
  location={userLocation}
  onSelect={(resource) => {
    // Handle resource selection
  }}
/>`}
          </div>
        </div>

        {/* Marketplace */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-xl font-bold mb-3">🛒 Marketplace</h4>
          <p className="text-gray-300 mb-4">
            Display safety score badge with risk assessment.
          </p>
          <div className="bg-gray-900 rounded p-4 text-sm font-mono text-gray-400">
            {`<SafetyBadge 
  platform="marketplace"
  riskScore={calculateRisk()}
/>`}
          </div>
        </div>
      </div>
    </div>
  );
}

