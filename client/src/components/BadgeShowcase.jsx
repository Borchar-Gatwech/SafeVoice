import React, { useState, useEffect } from 'react';
import { getMyBadges as getMyBadgesAPI } from '../api';

export default function BadgeShowcase({ anonymousId }) {
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, earned, locked
  const [sort, setSort] = useState('recent'); // recent, rarity

  useEffect(() => {
    if (!anonymousId) return;
    loadBadges();
    
    // Listen for badge earned events to refresh
    const handleBadgeEarned = () => {
      setTimeout(() => loadBadges(), 2000); // Refresh after 2 seconds
    };
    
    window.addEventListener('badgeEarned', handleBadgeEarned);
    return () => window.removeEventListener('badgeEarned', handleBadgeEarned);
  }, [anonymousId]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const { data, ok } = await getMyBadgesAPI(anonymousId);
      if (ok && data) {
        setBadges(data.badges || []);
        setProgress(data.progressTowardNext || []);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'rare':
        return 'from-purple-400 via-pink-500 to-red-500';
      default:
        return 'from-gray-300 to-gray-400';
    }
  };

  const filteredBadges = () => {
    let filtered = [...badges];
    
    if (filter === 'earned') {
      filtered = filtered.filter(b => b.earnedAt);
    }
    
    // Sort badges
    if (sort === 'recent') {
      filtered.sort((a, b) => {
        if (!a.earnedAt && !b.earnedAt) return 0;
        if (!a.earnedAt) return 1;
        if (!b.earnedAt) return -1;
        return new Date(b.earnedAt) - new Date(a.earnedAt);
      });
    } else if (sort === 'rarity') {
      const rarityOrder = { legendary: 3, rare: 2, common: 1 };
      filtered.sort((a, b) => {
        const aRarity = rarityOrder[a.rarity] || 0;
        const bRarity = rarityOrder[b.rarity] || 0;
        return bRarity - aRarity;
      });
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="mt-2 text-gray-600">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">🏆 Your Achievements</h2>
        <p className="text-purple-100">
          You've earned {badges.length} badge{badges.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('earned')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'earned'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Earned ({badges.length})
          </button>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="rarity">Rarity</option>
        </select>
      </div>

      {/* Earned Badges Grid */}
      {filteredBadges().length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges().map((badge) => (
            <div
              key={badge.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all hover:shadow-xl hover:scale-105 ${
                badge.earnedAt
                  ? `border-transparent bg-gradient-to-br ${getRarityColor(badge.rarity)}`
                  : 'border-gray-200 opacity-50'
              }`}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{badge.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {badge.description}
                </p>
                
                {badge.earnedAt && (
                  <div className="text-xs text-gray-500">
                    Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                )}

                {badge.progress > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-600 mb-1">
                      Progress: {badge.progress}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-gray-600">No badges earned yet. Start interacting to earn your first badge!</p>
        </div>
      )}

      {/* Progress Toward Next Badges */}
      {progress.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Progress Toward Next Badges</h3>
          <div className="space-y-4">
            {progress.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{item.badge.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{item.badge.name}</h4>
                    <p className="text-sm text-gray-600">{item.badge.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.badge.rarity === 'legendary'
                      ? 'bg-yellow-100 text-yellow-800'
                      : item.badge.rarity === 'rare'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.badge.rarity?.toUpperCase()}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{item.progress.current} / {item.progress.target}</span>
                    <span>{item.progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${item.progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

