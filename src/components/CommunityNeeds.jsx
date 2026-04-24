import { useState } from 'react';
import { communityNeeds } from '../data/mockData';
import { getCategoryIcon, getCategoryBg, getUrgencyColor, getStatusColor } from '../utils/helpers';

export default function CommunityNeeds({ onNavigate, permissions }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [viewMode, setViewMode] = useState('map');

  const filteredNeeds = communityNeeds.filter(need => {
    if (filterCategory !== 'all' && need.category !== filterCategory) return false;
    if (filterUrgency !== 'all' && need.urgency !== filterUrgency) return false;
    return true;
  });
  const categories = [...new Set(communityNeeds.map(n => n.category))];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Community Needs Map</h2>
            <p className="text-gray-400 text-sm mt-1">{filteredNeeds.length} needs identified across all regions</p>
          </div>
          {permissions?.canCreateNeed && (
            <button onClick={() => onNavigate('survey')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-medium border border-emerald-500/20">
              + Report a Need
            </button>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('map')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>🗺️ Map</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>📋 List</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500">
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
          </select>
          <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500">
            <option value="all">All Urgency</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        {viewMode === 'map' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-6">
            <div className="relative w-full aspect-[16/9] bg-gray-900 rounded-xl overflow-hidden border border-gray-700/50">
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
              </div>
              <div className="absolute top-4 left-[15%] text-emerald-500/40 text-xs font-medium">West Zone</div>
              <div className="absolute top-4 left-[40%] text-emerald-500/40 text-xs font-medium">Central Zone</div>
              <div className="absolute top-4 right-[15%] text-emerald-500/40 text-xs font-medium">East Zone</div>
              <div className="absolute bottom-16 left-[30%] text-emerald-500/40 text-xs font-medium">South Zone</div>
              <div className="absolute top-[25%] left-[55%] text-emerald-500/40 text-xs font-medium">North Zone</div>

              {filteredNeeds.map(need => (
                <div key={need._id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ left: `${need.coordinates.x}%`, top: `${need.coordinates.y}%` }}>
                  {need.urgency === 'critical' && <div className="absolute inset-0 w-8 h-8 -m-1 bg-red-500 rounded-full animate-ping opacity-20" />}
                  <div className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg transition-transform group-hover:scale-150 group-hover:z-10 ${need.urgency === 'critical' ? 'bg-red-500 shadow-red-500/50' : need.urgency === 'high' ? 'bg-orange-500 shadow-orange-500/50' : 'bg-yellow-500 shadow-yellow-500/50'}`}>
                    {getCategoryIcon(need.category)}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
                      <p className="text-white text-xs font-medium">{need.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{need.location} • {need.affectedPeople.toLocaleString()} affected</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getUrgencyColor(need.urgency)}`}>{need.urgency}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(need.status)}`}>{need.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-4 right-4 bg-gray-900/90 border border-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-[10px] font-medium mb-2">URGENCY</p>
                <div className="space-y-1">
                  {[{ c: 'bg-red-500', l: 'Critical' }, { c: 'bg-orange-500', l: 'High' }, { c: 'bg-yellow-500', l: 'Medium' }, { c: 'bg-green-500', l: 'Low' }].map(item => (
                    <div key={item.l} className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${item.c}`} /><span className="text-gray-400 text-[10px]">{item.l}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredNeeds.map(need => (
            <div key={need._id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5 hover:border-gray-600 transition-all hover:-translate-y-1 group">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCategoryBg(need.category)} flex items-center justify-center text-lg border`}>{getCategoryIcon(need.category)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm leading-tight">{need.title}</h4>
                  <p className="text-gray-500 text-xs mt-0.5">📍 {need.location}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{need.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getUrgencyColor(need.urgency)}`}>{need.urgency}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(need.status)}`}>{need.status}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryBg(need.category)}`}>{need.category}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>👥 {need.affectedPeople.toLocaleString()} affected</span>
                <span>🙋 {need.volunteersAssigned}/{need.volunteersNeeded} volunteers</span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${Math.min((need.volunteersAssigned / need.volunteersNeeded) * 100, 100)}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-gray-500 text-[10px]">Source: {need.source}</span>
                <button onClick={() => onNavigate('matching')} className="text-emerald-400 text-xs hover:text-emerald-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Find Volunteers →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
