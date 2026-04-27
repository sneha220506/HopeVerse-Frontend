import { useEffect, useState } from 'react';
// import { communityNeeds } from '../data/mockData'; // Switched to live DB
import { needsAPI } from '../services/api'; 
import { getCategoryIcon, getCategoryBg, getUrgencyColor } from '../utils/helpers';

export default function CommunityNeeds({ onNavigate, permissions }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  
  // Database States
  const [needs, setNeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from DB on load
  useEffect(() => {
    const fetchNeeds = async () => {
      setIsLoading(true);
      try {
        const response = await needsAPI.getAll();
        const data = Array.isArray(response) ? response : response?.data || [];
        setNeeds(data);
      } catch (error) {
        console.error("Field Intelligence Fetch Error:", error);
        setNeeds([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNeeds();
  }, []);

  const filteredNeeds = needs.filter(need => {
    if (filterCategory !== 'all' && need.category !== filterCategory) return false;
    if (filterUrgency !== 'all' && need.urgency !== filterUrgency) return false;
    return true;
  });

  const categories = [...new Set(needs.map(n => n.category))];

  // Tactical Color Mapping for Urgency - PRESERVED
  const urgencyStyles = {
    critical: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]', light: 'bg-red-50' },
    high: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]', light: 'bg-orange-50' },
    medium: { bg: 'bg-yellow-400', text: 'text-yellow-600', border: 'border-yellow-400', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]', light: 'bg-yellow-50' },
    low: { bg: 'bg-[#FEF9C3]', text: 'text-yellow-700', border: 'border-yellow-200', glow: 'shadow-none', light: 'bg-[#FEF9C3]/50' },
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Syncing Field Intelligence...</p>
      </div>
    </div>
  );

  return (
    <section className="py-24 bg-[#F8FAFC] min-h-screen relative overflow-hidden">
      {/* Global Tactical Styles - PRESERVED */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radar-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-radar-pulse { animation: radar-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal-card { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        
        .tactical-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.25rem center;
          background-size: 1rem;
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h2 className="text-4xl font-heading font-black text-slate-dark tracking-tighter">
              Operational <span className="text-primary/70">Requirements</span>
            </h2>
            <p className="text-slate-dark/40 font-black uppercase tracking-[0.2em] text-[11px] mt-4 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Live Stream: <span className="text-red-500">{filteredNeeds.length} active nodes</span> detected
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            {permissions?.canCreateNeed && (
              <button 
                onClick={() => onNavigate('survey')} 
                className="bg-primary/70 text-white px-10 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95"
              >
                + New Requirement
              </button>
            )}
            
            <div className="flex p-2 bg-white rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <button 
                onClick={() => setViewMode('map')} 
                className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${viewMode === 'map' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                RADAR VIEW
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                INDEX VIEW
              </button>
            </div>
          </div>
        </div>

        {/* --- Tactical Filters --- */}
        <div className="flex flex-wrap gap-5 mb-16 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)} 
            className="tactical-select bg-white border-2 border-slate-50 rounded-2xl px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-sm outline-none cursor-pointer min-w-[220px] transition-all"
          >
            <option value="all">Category: All Sectors</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
          </select>
          
          <select 
            value={filterUrgency} 
            onChange={(e) => setFilterUrgency(e.target.value)} 
            className="tactical-select bg-white border-2 border-slate-50 rounded-2xl px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-sm outline-none cursor-pointer min-w-[220px] transition-all"
          >
            <option value="all">Urgency: Global</option>
            <option value="critical">🔴 Critical Response</option>
            <option value="high">🟠 High Priority</option>
            <option value="medium">🟡 Medium Watch</option>
            <option value="low">⚪ Low Priority</option>
          </select>
        </div>

        {/* --- Radar Visualization --- */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-[4rem] p-8 mb-20 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden animate-in zoom-in duration-700">
            <div className="relative w-full aspect-[21/9] bg-slate-50 rounded-[3rem] overflow-hidden border-2 border-white shadow-inner">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="tactical-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="1" fill="currentColor" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#tactical-grid)" />
                </svg>
              </div>

              {filteredNeeds.map((need, idx) => {
                const style = urgencyStyles[need.urgency] || urgencyStyles.low;
                // If coordinates missing in DB, generate deterministic layout for radar
                const xPos = need.coordinates?.x || (20 + (idx * 17) % 60);
                const yPos = need.coordinates?.y || (20 + (idx * 11) % 60);

                return (
                  <div 
                    key={need._id} 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-500" 
                    style={{ left: `${xPos}%`, top: `${yPos}%` }}
                  >
                    <div className={`absolute inset-0 w-12 h-12 -m-3 rounded-full opacity-40 animate-radar-pulse ${style.bg}`} />
                    <div className={`relative w-8 h-8 rounded-2xl flex items-center justify-center text-sm shadow-2xl transition-all duration-500 group-hover:scale-150 group-hover:z-50 border-2 border-white ${style.bg} text-white`}>
                      {getCategoryIcon(need.category)}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[60] translate-y-2 group-hover:translate-y-0">
                      <div className="bg-slate-900 rounded-[1.5rem] p-5 shadow-2xl min-w-[240px] text-center border border-white/10">
                        <p className="text-white text-[11px] font-black uppercase tracking-widest leading-tight">{need.title}</p>
                        <div className="mt-3 h-[1px] bg-white/10 w-full" />
                        <div className="flex items-center justify-between mt-3">
                           <p className={`${style.text} text-[9px] font-black uppercase tracking-[0.2em]`}>{need.urgency}</p>
                           <p className="text-slate-400 text-[9px] font-bold">{need.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- Index Grid --- */}
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredNeeds.map((need, idx) => {
            const style = urgencyStyles[need.urgency] || urgencyStyles.low;
            const saturation = need.volunteersNeeded > 0 
              ? Math.round((need.volunteersAssigned / need.volunteersNeeded) * 100) 
              : 0;

            return (
              <div 
                key={need._id} 
                style={{ animationDelay: `${idx * 0.05}s` }}
                className="reveal-card bg-white rounded-[3rem] border-2 border-transparent p-10 shadow-soft hover:shadow-2xl hover:border-primary/10 hover:-translate-y-3 transition-all duration-500 group relative flex flex-col"
              >
                <div className="flex items-start gap-6 mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm border border-slate-100`}>
                    {getCategoryIcon(need.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-dark font-black text-xl tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                      {need.title}
                    </h4>
                    <p className="text-slate-dark/30 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                      📍 {need.location}
                    </p>
                  </div>
                </div>

                <p className="text-slate-dark/50 text-xs mb-10 leading-relaxed font-semibold line-clamp-2 italic bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                  "{need.description}"
                </p>
                
                {/* Resource Metrics */}
                <div className="mt-auto space-y-4 mb-10">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-dark/20">Resource Saturation</span>
                    <span className="text-primary">{saturation}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden p-[1px] border border-slate-100">
                    <div 
                      className="h-full bg-hero-grad rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.min(saturation, 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 ${style.light} ${style.border} ${style.text}`}>
                    {need.urgency}
                  </span>
                  <button 
                    onClick={() => onNavigate('matching')} 
                    className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:translate-x-2 transition-transform flex items-center gap-2"
                  >
                    Deploy Support <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredNeeds.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-slate-100 animate-in zoom-in duration-500">
            <div className="text-6xl mb-6 grayscale opacity-20">📡</div>
            <p className="text-slate-dark/20 font-black uppercase tracking-[0.4em] text-sm">
              Zero Signal: No active nodes matched filters
            </p>
            <button onClick={() => {setFilterCategory('all'); setFilterUrgency('all')}} className="mt-8 text-primary font-black text-[10px] uppercase tracking-widest underline underline-offset-8">Reset Protocol</button>
          </div>
        )}
      </div>
    </section>
  );
}