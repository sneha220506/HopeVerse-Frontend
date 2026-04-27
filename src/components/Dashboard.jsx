import { communityNeeds, volunteers, regionStats } from '../data/mockData';
import { getCategoryIcon, getUrgencyColor } from '../utils/helpers';

export default function Dashboard({ onNavigate, permissions }) {
  const p = permissions || {};
  const criticalNeeds = communityNeeds.filter(n => n.urgency === 'critical');
  const topVolunteers = [...volunteers].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 5);
  const categoryCounts = communityNeeds.reduce((acc, n) => { acc[n.category] = (acc[n.category] || 0) + 1; return acc; }, {});

  return (
    <section className="py-8 bg-[#F8FAFC] min-h-screen relative overflow-hidden">
      {/* Visual Depth Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card { animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 animate-card stagger-1">
          <div>
            {/* <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Operational Live Feed</span>
            </div> */}
            <h2 className="text-4xl font-heading font-black text-slate-dark tracking-tight">Operations <span className="text-primary/70">Dashboard</span></h2>
            <p className="text-slate-dark/40 text-sm font-medium mt-1">
              {p.label && <span className="text-primary font-bold uppercase tracking-wider text-xs mr-2">{p.label}</span>}
              {p.canCreateTask ? 'Secure Administrative Node' : p.canSubmitSurvey ? 'Standard Field Access' : 'Observer Interface'}
            </p>
          </div>
          {p.canSubmitSurvey && (
            <button onClick={() => onNavigate('survey')} 
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95 text-sm font-black uppercase tracking-widest">
              <span className="text-xl">+</span> Submit Report
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Critical Needs */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-soft border border-slate-100 overflow-hidden animate-card stagger-2 flex flex-col">
            <div className="px-10 py-7 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-accent rounded-full animate-ping absolute" />
                  <div className="w-3 h-3 bg-accent rounded-full relative" />
                </div>
                <h3 className="text-slate-dark font-black text-xl tracking-tight">Critical Interventions</h3>
              </div>
              <button onClick={() => onNavigate('needs')} className="px-4 py-2 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-all">View All Intelligence →</button>
            </div>
            
            <div className="divide-y divide-slate-50 overflow-y-auto custom-scrollbar max-h-[600px]">
              {criticalNeeds.map((need, idx) => (
                <div key={need._id} className="px-10 py-8 hover:bg-slate-50/80 transition-all cursor-pointer group relative overflow-hidden">
                  {/* Subtle Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="text-4xl w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      {getCategoryIcon(need.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h4 className="text-slate-dark font-black text-lg group-hover:text-primary transition-colors">{need.title}</h4>
                        <span className={`px-3 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border-2 ${getUrgencyColor(need.urgency)}`}>
                          {need.urgency}
                        </span>
                      </div>
                      <p className="text-slate-dark/50 text-sm line-clamp-2 leading-relaxed font-medium mb-5">{need.description}</p>
                      
                      <div className="flex items-center gap-6 text-[10px] font-black text-slate-dark/30 uppercase tracking-widest">
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">📍 {need.location}</span>
                        <span className="flex items-center gap-2">👥 {need.affectedPeople.toLocaleString()}</span>
                        <span className="flex items-center gap-2">🙋 {need.volunteersAssigned}/{need.volunteersNeeded}</span>
                      </div>
                    </div>
                    
                    <div className="w-24 flex flex-col items-end">
                      <div className="relative w-12 h-12 mb-3">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                           <path className="stroke-slate-100" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                           <path className="stroke-primary transition-all duration-1000" strokeWidth="3" strokeDasharray={`${(need.volunteersAssigned / need.volunteersNeeded) * 100}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary">
                          {Math.round((need.volunteersAssigned / need.volunteersNeeded) * 100)}%
                        </div>
                      </div>
                      <p className="text-[9px] text-right font-black text-slate-dark/20 uppercase tracking-tighter">Status: Deploying</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8 animate-card stagger-3">
            
            {/* Category Distribution */}
            <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-100 p-8 hover:shadow-xl transition-all duration-500">
              <h3 className="text-slate-dark font-black text-lg mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm">📊</span> 
                Sector Analysis
              </h3>
              <div className="space-y-6">
                {Object.entries(categoryCounts).sort(([,a],[,b]) => b-a).map(([cat, count]) => (
                  <div key={cat} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl group-hover:scale-125 transition-transform duration-300">{getCategoryIcon(cat)}</span>
                        <span className="text-sm font-bold text-slate-dark/70 capitalize tracking-tight">{cat}</span>
                      </div>
                      <span className="text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden p-[1px]">
                      <div className="h-full rounded-full bg-hero-grad transition-all duration-1000 ease-out" 
                           style={{ width: `${(count / communityNeeds.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Volunteers */}
            <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-slate-dark font-black text-lg">Top Performers</h3>
                <button onClick={() => onNavigate('volunteers')} className="text-primary text-[10px] font-black hover:underline uppercase tracking-[0.2em]">Full Roster</button>
              </div>
              <div className="space-y-5">
                {topVolunteers.map((v, i) => (
                  <div key={v._id} className="flex items-center gap-4 p-3 rounded-[1.5rem] hover:bg-slate-50 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-slate-100 group-hover:rotate-6 transition-transform">
                      {v.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-dark truncate tracking-tight">{v.name}</p>
                      <p className="text-[9px] font-bold text-slate-dark/30 uppercase tracking-widest mt-1">
                        {v.tasksCompleted} Impact Points • ⭐ {v.rating}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${v.status === 'on-task' ? 'bg-secondary animate-pulse' : 'bg-success'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-hero-grad rounded-[2.5rem] shadow-2xl shadow-primary/20 p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="font-black text-lg mb-6 flex items-center gap-3 relative z-10">
                <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">⚡</span>
                System Actions
              </h3>
              <div className="space-y-4 relative z-10">
                {p.canCreateNeed && (
                  <button onClick={() => onNavigate('survey')} className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/btn">
                    <span className="text-2xl group-hover/btn:scale-110 transition-transform">📋</span>
                    <div className="text-left">
                      <p className="text-sm font-black tracking-tight">Report Incident</p>
                      <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest">Log emergency data</p>
                    </div>
                  </button>
                )}
                {p.canConfirmMatch && (
                  <button onClick={() => onNavigate('matching')} className="w-full flex items-center gap-4 p-4 bg-accent hover:brightness-110 rounded-2xl transition-all shadow-xl group/btn">
                    <span className="text-2xl group-hover/btn:scale-110 transition-transform">🤖</span>
                    <div className="text-left">
                      <p className="text-sm font-black tracking-tight">AI Matching</p>
                      <p className="text-white/80 text-[9px] font-bold uppercase tracking-widest">Optimized Deployment</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Region Stats - Enhanced Horizontal Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 animate-card stagger-3">
          {regionStats.map(r => (
            <div key={r.region} className="bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100 hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 group">
              <h4 className="text-slate-dark font-black text-xs uppercase tracking-[0.15em] mb-4 group-hover:text-primary transition-colors">{r.region}</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-dark/20">
                  <span>Incident Load</span><span className="text-slate-dark">{r.totalNeeds}</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(r.criticalNeeds / r.totalNeeds) * 100}%` }} />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-accent tracking-tighter">{r.criticalNeeds} Critical</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-success tracking-tighter">{r.volunteersActive} Active</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}