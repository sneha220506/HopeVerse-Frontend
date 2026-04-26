import { communityNeeds, volunteers, tasks, regionStats, surveyEntries } from '../data/mockData';
import { getCategoryIcon } from '../utils/helpers';

export default function Analytics({ permissions }) {
  const totalAffected = communityNeeds.reduce((s, n) => s + n.affectedPeople, 0);
  const totalHours = volunteers.reduce((s, v) => s + v.hoursLogged, 0);
  const avgRating = (volunteers.reduce((s, v) => s + v.rating, 0) / volunteers.length).toFixed(1);

  const categoryData = communityNeeds.reduce((acc, n) => {
    if (!acc[n.category]) acc[n.category] = { count: 0, affected: 0 };
    acc[n.category].count += 1; acc[n.category].affected += n.affectedPeople;
    return acc;
  }, {});

  const urgencyData = [
    { level: 'critical', count: communityNeeds.filter(n => n.urgency === 'critical').length, color: '#FF8A65' }, // Muted Coral
    { level: 'high', count: communityNeeds.filter(n => n.urgency === 'high').length, color: '#FFB199' },
    { level: 'medium', count: communityNeeds.filter(n => n.urgency === 'medium').length, color: '#8E7CC3' }, // Signature Purple
    { level: 'low', count: communityNeeds.filter(n => n.urgency === 'low').length, color: '#7BC47F' }, // Sage Green
  ];

  // Refined Hope Palette Bar Colors
  const barColors = { 
    healthcare: 'from-rose-200 to-rose-300', 
    education: 'from-[#8E7CC3]/60 to-[#8E7CC3]', 
    food: 'from-orange-200 to-orange-300', 
    shelter: 'from-[#8E7CC3] to-[#7160A1]', 
    environment: 'from-[#7BC47F]/60 to-[#7BC47F]', 
    elderly: 'from-slate-300 to-slate-400', 
    youth: 'from-purple-200 to-purple-300', 
    disaster: 'from-rose-300 to-rose-400' 
  };

  return (
    <section className="py-12 bg-[#FAFAFC] min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold text-[#2F2F3A] tracking-tight">
              Impact <span className="text-[#8E7CC3]">Analytics</span>
            </h2>
            <p className="text-[#2F2F3A]/40 text-sm font-medium mt-2 italic">Measuring the heartbeat of community resilience</p>
          </div>
          <div className="px-5 py-2.5 bg-[#8E7CC3]/5 border border-[#8E7CC3]/10 rounded-2xl text-[#8E7CC3] text-[10px] font-black uppercase tracking-[0.2em]">
            Status: Real-time Data
          </div>
        </div>

        {/* Impact Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {[
            { l: 'People Affected', v: totalAffected.toLocaleString(), i: '🏘️', c: 'text-[#8E7CC3]' },
            { l: 'Active Needs', v: communityNeeds.length, i: '📋', c: 'text-[#FF8A65]' },
            { l: 'Volunteers', v: volunteers.length, i: '👥', c: 'text-[#7BC47F]' },
            { l: 'Total Tasks', v: tasks.length, i: '✅', c: 'text-[#8E7CC3]' },
            { l: 'Hours Logged', v: totalHours.toLocaleString(), i: '⏱️', c: 'text-indigo-400' },
            { l: 'Avg Rating', v: avgRating, i: '⭐', c: 'text-amber-400' }
          ].map(m => (
            <div key={m.l} className="bg-white rounded-[2.5rem] border border-[#F3F0FA] p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
              <div className="text-3xl mb-4 group-hover:scale-125 transition-transform duration-500">{m.i}</div>
              <div className={`text-2xl font-black tracking-tight ${m.c}`}>{m.v}</div>
              <div className="text-[9px] font-black text-[#2F2F3A]/30 uppercase tracking-[0.15em] mt-2">{m.l}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Category Bar Chart */}
          <div className="bg-white rounded-[3rem] border border-[#F3F0FA] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-[#2F2F3A] font-bold text-xl tracking-tight">Needs by Category</h3>
              <div className="w-10 h-10 rounded-2xl bg-[#FAFAFC] flex items-center justify-center text-sm border border-[#F3F0FA]">📊</div>
            </div>
            <div className="space-y-8">
              {Object.entries(categoryData).sort(([,a],[,b]) => b.affected - a.affected).map(([cat, data]) => {
                const max = Math.max(...Object.values(categoryData).map(d => d.affected));
                return (
                  <div key={cat} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl group-hover:rotate-12 transition-transform">{getCategoryIcon(cat)}</span>
                        <span className="text-sm font-bold text-[#2F2F3A]/70 capitalize">{cat}</span>
                      </div>
                      <span className="text-[10px] font-black text-[#2F2F3A]/20 uppercase tracking-widest">{data.affected.toLocaleString()} impacted</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#FAFAFC] rounded-full overflow-hidden p-[2px] border border-[#F3F0FA]">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${barColors[cat] || 'from-slate-200 to-slate-300'} transition-all duration-1000 ease-out`} 
                        style={{ width: `${(data.affected / max) * 100}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Urgency Donut */}
          <div className="bg-white rounded-[3rem] border border-[#F3F0FA] p-10 shadow-sm flex flex-col">
            <h3 className="text-[#2F2F3A] font-bold text-xl tracking-tight mb-10">Urgency Distribution</h3>
            <div className="flex flex-col items-center flex-1 justify-center">
              <div className="relative w-64 h-64 mb-12">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    const total = urgencyData.reduce((s, d) => s + d.count, 0);
                    let offset = 0;
                    return urgencyData.map(d => {
                      const circ = 2 * Math.PI * 40;
                      const dash = (d.count / total) * circ;
                      const el = <circle key={d.level} cx="50" cy="50" r="40" fill="none" stroke={d.color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} className="transition-all duration-1000 ease-in-out" />;
                      offset += dash;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-black text-[#2F2F3A] tracking-tighter">{communityNeeds.length}</span>
                  <span className="text-[9px] font-black text-[#2F2F3A]/20 uppercase tracking-[0.2em]">Total Focus</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                {urgencyData.map(d => (
                  <div key={d.level} className="flex items-center gap-4 bg-[#FAFAFC] rounded-[2rem] p-5 border border-[#F3F0FA]">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                    <div>
                      <div className="text-xl font-black text-[#2F2F3A] leading-none">{d.count}</div>
                      <div className="text-[9px] font-black text-[#2F2F3A]/20 uppercase tracking-widest mt-1.5">{d.level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Region Performance */}
          <div className="bg-white rounded-[3rem] border border-[#F3F0FA] p-10 shadow-sm">
            <h3 className="text-[#2F2F3A] font-bold text-xl tracking-tight mb-10">Regional Resolution</h3>
            <div className="space-y-8">
              {regionStats.map(r => {
                const rate = r.totalNeeds > 0 ? Math.round((r.tasksCompleted / (r.tasksCompleted + r.totalNeeds)) * 100) : 0;
                return (
                  <div key={r.region}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[#2F2F3A]/70">{r.region}</span>
                      <span className="text-[10px] font-black text-[#8E7CC3] bg-[#8E7CC3]/5 px-2 py-1 rounded-lg">{rate}% Fixed</span>
                    </div>
                    <div className="w-full h-2 bg-[#FAFAFC] rounded-full overflow-hidden border border-[#F3F0FA]">
                      <div className="h-full bg-[#8E7CC3] rounded-full transition-all duration-1000" style={{ width: `${rate}%` }} />
                    </div>
                    <div className="flex justify-between mt-3 text-[9px] font-black text-[#2F2F3A]/20 uppercase tracking-[0.15em]">
                      <span>Residents: {r.population.toLocaleString()}</span>
                      <span>Active: {r.volunteersActive}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resource Availability */}
          <div className="bg-white rounded-[3rem] border border-[#F3F0FA] p-10 shadow-sm">
            <h3 className="text-[#2F2F3A] font-bold text-xl tracking-tight mb-10">Personnel Allocation</h3>
            <div className="grid grid-cols-2 gap-6 mb-10">
              {[
                { l: 'Full Time', c: volunteers.filter(v => v.availability === 'full-time').length, bg: 'bg-[#8E7CC3]/5' },
                { l: 'Part Time', c: volunteers.filter(v => v.availability === 'part-time').length, bg: 'bg-[#7BC47F]/5' }
              ].map(a => (
                <div key={a.l} className={`${a.bg} rounded-[2.5rem] p-8 text-center border border-white shadow-sm`}>
                  <div className="text-4xl font-black text-[#2F2F3A] tracking-tighter">{a.c}</div>
                  <div className="text-[9px] font-black text-[#2F2F3A]/20 uppercase tracking-[0.2em] mt-2">{a.l}</div>
                </div>
              ))}
            </div>
            <h4 className="text-[#2F2F3A]/30 font-black text-[10px] uppercase tracking-[0.2em] mb-6 text-center">Talent Density</h4>
            <div className="flex flex-wrap gap-3 justify-center">
              {['Medical', 'Teaching', 'Construction', 'Cooking', 'First Aid', 'Project Mgmt'].map(skill => {
                const count = volunteers.filter(v => v.skills.includes(skill)).length;
                return (
                  <div key={skill} className="flex items-center gap-3 px-5 py-2.5 bg-white border border-[#F3F0FA] rounded-2xl shadow-sm hover:border-[#8E7CC3] transition-all cursor-default group">
                    <span className="text-[11px] font-bold text-[#2F2F3A]/60">{skill}</span>
                    <span className="w-6 h-6 rounded-lg bg-[#FAFAFC] border border-[#F3F0FA] flex items-center justify-center text-[10px] font-black text-[#8E7CC3] group-hover:bg-[#8E7CC3] group-hover:text-white transition-all">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Economic Impact Banner */}
        <div className="mt-16 bg-[#2F2F3A] rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8E7CC3]/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { v: `$${((totalHours * 25) / 1000).toFixed(0)}K+`, l: 'Economic Value' },
              { v: `${(totalAffected / 1000).toFixed(1)}K`, l: 'Lives Impacted' },
              { v: regionStats.length, l: 'Districts' },
              { v: surveyEntries.filter(s => s.verified).length, l: 'Verified Insights' }
            ].map(stat => (
              <div key={stat.l}>
                <div className="text-4xl font-black text-white tracking-tighter mb-2">{stat.v}</div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}