import React from 'react';

export default function TrustLevelBadge({ trustLevel, showLabel = true }) {
  const getTrustLevelInfo = (level) => {
    switch (level) {
      case 'veteran':
        return {
          icon: '⭐',
          label: 'Veteran Supporter',
          color: 'from-yellow-400 to-orange-500',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        };
      case 'trusted':
        return {
          icon: '✓',
          label: 'Trusted Member',
          color: 'from-green-400 to-emerald-500',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'newcomer':
      default:
        return {
          icon: '🌱',
          label: 'Newcomer',
          color: 'from-blue-400 to-cyan-500',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
    }
  };

  const info = getTrustLevelInfo(trustLevel);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${info.bgColor} ${info.textColor} text-sm font-semibold`}>
      <span className="text-lg">{info.icon}</span>
      {showLabel && <span>{info.label}</span>}
    </div>
  );
}

