import React, { useState, useEffect } from 'react'
import { resourcesApi } from '../services/api'

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    country: '',
    type: '',
  })

  useEffect(() => {
    // Load resources on mount
    loadResources()
  }, [])

  const loadResources = async () => {
    setLoading(true)
    setError('')
    try {
      const results = await resourcesApi.search(filters)
      setResources(results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadResources()
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-4">Search Safety Resources</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Country</label>
            <input
              type="text"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              placeholder="Kenya"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Types</option>
              <option value="hotline">Hotline</option>
              <option value="ngo">NGO</option>
              <option value="legal_aid">Legal Aid</option>
              <option value="shelter">Shelter</option>
              <option value="counseling">Counseling</option>
              <option value="police">Police</option>
              <option value="hospital">Hospital</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <p className="text-red-800 font-semibold">❌ {error}</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading resources...</p>
        ) : resources.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">No resources found</p>
            <p className="text-yellow-700 text-sm">Try different search filters or seed the database first via Swagger UI</p>
          </div>
        ) : (
          resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{resource.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                </div>
                {resource.rating > 0 && (
                  <div className="text-right">
                    <p className="font-semibold">⭐ {resource.rating}</p>
                    <p className="text-xs text-gray-500">{resource.reviewCount} reviews</p>
                  </div>
                )}
              </div>

              {resource.description && (
                <p className="text-gray-700 mb-3">{resource.description}</p>
              )}

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                {resource.phone && (
                  <p><strong>Phone:</strong> <a href={`tel:${resource.phone}`} className="text-blue-600 hover:underline">{resource.phone}</a></p>
                )}
                {resource.email && (
                  <p><strong>Email:</strong> <a href={`mailto:${resource.email}`} className="text-blue-600 hover:underline">{resource.email}</a></p>
                )}
                {resource.website && (
                  <p><strong>Website:</strong> <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{resource.website}</a></p>
                )}
                {resource.hours && (
                  <p><strong>Hours:</strong> {resource.hours}</p>
                )}
              </div>

              {resource.location && (
                <p className="text-sm text-gray-600 mt-3">
                  📍 {resource.location.city || resource.location.region || resource.location.country}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

