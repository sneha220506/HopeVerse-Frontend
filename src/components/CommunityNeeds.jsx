import { useEffect ,useState } from 'react';
import { communityNeeds } from '../data/mockData';
import { getCategoryIcon, getCategoryBg, getUrgencyColor } from '../utils/helpers';

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
    <section className="py-12 bg-[#f8fafc] min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Header & View Toggle --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Field <span className="text-#8E7CC3-600">Requirements</span>
            </h2>
            <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">
              Live Monitoring: <span className="text-lavender-600">{filteredNeeds.length}</span> active nodes detected
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {permissions?.canCreateNeed && (
              <button 
                onClick={() => onNavigate('survey')} 
                className="bg-purple-300 hover:bg-purple-400 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-250 active:scale-95"
              >
                + Report Requirement
              </button>
            )}
            <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setViewMode('map')} 
                className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${viewMode === 'map' ? 'bg-#8E7CC3-50 text-purple-300 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
              >
                🗺️ RADAR
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-purple-300 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
              >
                📋 INDEX
              </button>
            </div>
          </div>
        </div>

        {/* --- Filters --- */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)} 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 shadow-sm outline-none"
          >
            <option value="all">Category: All</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select 
            value={filterUrgency} 
            onChange={(e) => setFilterUrgency(e.target.value)} 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 shadow-sm outline-none"
          >
            <option value="all">Urgency: All</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
          </select>
        </div>

        {/* --- Map Visualization (Light Mode) --- */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-[2rem] p-4 mb-10 shadow-xl border border-slate-200 relative overflow-hidden">
            <div className="relative w-full aspect-[21/9] bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-inner">
              {/* Tactical Grid Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="grid-blue" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4f46e5" strokeWidth="1"/>
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid-blue)" />
                </svg>
              </div>

              {/* Data Pins */}
              {filteredNeeds.map(need => (
                <div 
                  key={need._id} 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" 
                  style={{ left: `${need.coordinates.x}%`, top: `${need.coordinates.y}%` }}
                >
                  {need.urgency === 'critical' && (
                    <div className="absolute inset-0 w-8 h-8 -m-1.5 bg-rose-500 rounded-full animate-ping opacity-20" />
                  )}
                  <div className={`relative w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg transition-all duration-300 group-hover:scale-150 group-hover:z-30 
                    ${need.urgency === 'critical' ? 'bg-rose-500 text-white' : need.urgency === 'high' ? 'bg-orange-500 text-white' : 'bg-indigo-500 text-white'}`}>
                    {getCategoryIcon(need.category)}
                  </div>
                  
                  {/* Floating Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-40 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white rounded-xl p-3 shadow-2xl min-w-[180px] border border-slate-100 text-center">
                      <p className="text-slate-900 text-[10px] font-black uppercase tracking-tight leading-tight">{need.title}</p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                         <span className="text-indigo-600 text-[9px] font-black uppercase tracking-widest">{need.urgency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Needs Index Grid --- */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredNeeds.map(need => (
            <div key={need._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getCategoryBg(need.category)} flex items-center justify-center text-2xl shadow-sm border border-white`}>
                  {getCategoryIcon(need.category)}
                </div>
                <div className="flex-1">
                  <h4 className="text-slate-900 font-black text-sm uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                    {need.title}
                  </h4>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">📍 {need.location}</p>
                </div>
              </div>

              <p className="text-slate-500 text-xs mb-6 leading-relaxed line-clamp-2 font-medium">{need.description}</p>
              
              {/* Resource Metrics */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Response Level</span>
                  <span className="text-indigo-600">{Math.round((need.volunteersAssigned / need.volunteersNeeded) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((need.volunteersAssigned / need.volunteersNeeded) * 100, 100)}%` }} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${need.urgency === 'critical' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                  {need.urgency}
                </span>
                <button 
                  onClick={() => onNavigate('matching')} 
                  className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform"
                >
                  Allocate Support →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}