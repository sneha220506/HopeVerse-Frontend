// Helper functions for the ImpactHub frontend

export const getCategoryColor = (category) => {
  const colors = {
    healthcare: 'from-red-500 to-rose-600', education: 'from-blue-500 to-indigo-600',
    food: 'from-amber-500 to-orange-600', shelter: 'from-emerald-500 to-green-600',
    environment: 'from-teal-500 to-cyan-600', elderly: 'from-purple-500 to-violet-600',
    youth: 'from-pink-500 to-fuchsia-600', disaster: 'from-red-600 to-red-800',
  };
  return colors[category] || 'from-gray-500 to-gray-600';
};

export const getCategoryBg = (category) => {
  const colors = {
    healthcare: 'bg-red-500/20 text-red-400 border-red-500/30', education: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    food: 'bg-amber-500/20 text-amber-400 border-amber-500/30', shelter: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    environment: 'bg-teal-500/20 text-teal-400 border-teal-500/30', elderly: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    youth: 'bg-pink-500/20 text-pink-400 border-pink-500/30', disaster: 'bg-red-600/20 text-red-400 border-red-600/30',
  };
  return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

export const getUrgencyColor = (urgency) => {
  const colors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return colors[urgency] || 'bg-gray-500/20 text-gray-400';
};

export const getStatusColor = (status) => {
  const colors = {
    open: 'bg-blue-500/20 text-blue-400', pending: 'bg-yellow-500/20 text-yellow-400',
    assigned: 'bg-purple-500/20 text-purple-400', 'in-progress': 'bg-orange-500/20 text-orange-400',
    completed: 'bg-green-500/20 text-green-400', resolved: 'bg-green-500/20 text-green-400',
    active: 'bg-green-500/20 text-green-400', inactive: 'bg-gray-500/20 text-gray-400',
    'on-task': 'bg-blue-500/20 text-blue-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};

export const getCategoryIcon = (category) => {
  const icons = {
    healthcare: '🏥', education: '📚', food: '🍲', shelter: '🏠',
    environment: '🌿', elderly: '👴', youth: '👦', disaster: '🆘',
  };
  return icons[category] || '📌';
};
