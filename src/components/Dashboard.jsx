import { communityNeeds, volunteers, regionStats } from '../data/mockData';
import { getCategoryIcon, getUrgencyColor } from '../utils/helpers';

export default function Dashboard({ onNavigate, permissions }) {
  const p = permissions || {};
  const criticalNeeds = communityNeeds.filter(n => n.urgency === 'critical');
  const topVolunteers = [...volunteers].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 5);
  const categoryCounts = communityNeeds.reduce((acc, n) => { acc[n.category] = (acc[n.category] || 0) + 1; return acc; }, {});

  return (
    <section className="py-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-heading font-bold text-slate-dark">Operations Dashboard</h2>
            <p className="text-slate-dark/50 text-sm mt-1">
              {p.label && <span className="text-primary font-semibold">{p.label}</span>}
              {p.canCreateTask ? ' — Full management access' : p.canSubmitSurvey ? ' — Report and view access' : ' — Read-only access'}
            </p>
          </div>
          {p.canSubmitSurvey && (
            <button onClick={() => onNavigate('survey')} 
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white text-primary rounded-full hover:bg-primary hover:text-white text-sm font-semibold border border-primary/20 shadow-sm transition-all active:scale-95">
              + Submit Report
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Critical Needs */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-soft border border-primary/5 overflow-hidden">
            <div className="px-8 py-5 border-b border-primary/5 flex items-center justify-between bg-surface/30">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
                <h3 className="text-slate-dark font-bold text-lg">Critical Needs</h3>
              </div>
              <button onClick={() => onNavigate('needs')} className="text-primary text-sm font-semibold hover:underline">View All →</button>
            </div>
            
            <div className="divide-y divide-primary/5">
              {criticalNeeds.map(need => (
                <div key={need._id} className="px-8 py-6 hover:bg-surface/40 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-5">
                    <span className="text-3xl p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      {getCategoryIcon(need.category)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-slate-dark font-bold text-base">{need.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getUrgencyColor(need.urgency)}`}>
                          {need.urgency}
                        </span>
                      </div>
                      <p className="text-slate-dark/60 text-sm mt-2 line-clamp-2 leading-relaxed">{need.description}</p>
                      
                      <div className="flex items-center gap-5 mt-4 text-xs font-medium text-slate-dark/40">
                        <span className="flex items-center gap-1">📍 {need.location}</span>
                        <span className="flex items-center gap-1">👥 {need.affectedPeople.toLocaleString()}</span>
                        <span className="flex items-center gap-1">🙋 {need.volunteersAssigned}/{need.volunteersNeeded}</span>
                      </div>
                    </div>
                    
                    {/* Visual Progress Circle or Bar */}
                    <div className="w-20 pt-2">
                      <div className="h-2 bg-surface rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-hero-grad rounded-full" 
                             style={{ width: `${(need.volunteersAssigned / need.volunteersNeeded) * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-right mt-2 font-bold text-primary">
                        {Math.round((need.volunteersAssigned / need.volunteersNeeded) * 100)}% Filled
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Category Distribution */}
            <div className="bg-white rounded-3xl shadow-soft border border-primary/5 p-6">
              <h3 className="text-slate-dark font-bold mb-5 flex items-center gap-2">
                <span className="text-primary text-xl">📊</span> Needs by Category
              </h3>
              <div className="space-y-5">
                {Object.entries(categoryCounts).sort(([,a],[,b]) => b-a).map(([cat, count]) => (
                  <div key={cat} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg opacity-80">{getCategoryIcon(cat)}</span>
                        <span className="text-sm font-semibold text-slate-dark/70 capitalize">{cat}</span>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-md">{count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-hero-grad transition-all duration-1000" 
                           style={{ width: `${(count / communityNeeds.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Volunteers */}
            <div className="bg-white rounded-3xl shadow-soft border border-primary/5 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-slate-dark font-bold">Top Volunteers</h3>
                <button onClick={() => onNavigate('volunteers')} className="text-primary text-xs font-bold hover:underline uppercase tracking-widest">View All</button>
              </div>
              <div className="space-y-4">
                {topVolunteers.map(v => (
                  <div key={v._id} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-surface/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-xl shadow-sm">{v.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-dark truncate">{v.name}</p>
                      <p className="text-[10px] font-medium text-slate-dark/40 uppercase tracking-tighter">
                        {v.tasksCompleted} tasks • ⭐ {v.rating}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${v.status === 'on-task' ? 'bg-secondary/10 text-secondary' : 'bg-success/10 text-success'}`}>
                      {v.status === 'on-task' ? 'BUSY' : 'READY'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-hero-grad rounded-3xl shadow-lg p-6 text-white">
              <h3 className="font-bold mb-5 flex items-center gap-2">⚡ Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                {p.canCreateNeed && (
                  <button onClick={() => onNavigate('survey')} className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                    <div className="text-left">
                      <p className="text-sm font-bold">Report a Need</p>
                      <p className="text-white/60 text-[10px]">Log new emergency</p>
                    </div>
                  </button>
                )}
                {p.canConfirmMatch && (
                  <button onClick={() => onNavigate('matching')} className="flex items-center gap-3 p-3 bg-accent hover:bg-accent/90 rounded-2xl transition-all shadow-md group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
                    <div className="text-left">
                      <p className="text-sm font-bold">Smart Match</p>
                      <p className="text-white/80 text-[10px]">AI-driven assignment</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Region Stats - Horizontal Cards */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {regionStats.map(r => (
            <div key={r.region} className="bg-white p-5 rounded-2xl shadow-soft border border-primary/5 hover:border-primary/20 transition-all group">
              <h4 className="text-slate-dark font-bold text-sm mb-3 group-hover:text-primary transition-colors">{r.region}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-dark/30">
                  <span>Needs</span><span className="text-slate-dark">{r.totalNeeds}</span>
                </div>
                <div className="h-1 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${(r.criticalNeeds / r.totalNeeds) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-accent">Critical: {r.criticalNeeds}</span>
                  <span className="text-success">Active: {r.volunteersActive}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}