import { useEffect, useState } from 'react';
// DB connection ke liye APIs import ki hain
import { needsAPI, volunteersAPI, tasksAPI, surveysAPI } from '../services/api';
import { getCategoryIcon } from '../utils/helpers';

export default function Analytics({ permissions }) {
  // --- DATABASE SYNC LOGIC ---
  const [data, setData] = useState({
    communityNeeds: [],
    volunteers: [],
    tasks: [],
    surveyEntries: [],
    loading: true
  });

  useEffect(() => {
    const fetchDBData = async () => {
      try {
        const [needsRes, volunteersRes, tasksRes, surveysRes] = await Promise.all([
          needsAPI.getAll(),
          volunteersAPI.getAll(),
          tasksAPI.getAll(),
          surveysAPI.getAll()
        ]);

        setData({
          communityNeeds: needsRes.data || [],
          volunteers: volunteersRes.data || [],
          tasks: tasksRes.data || [],
          surveyEntries: surveysRes.data || [],
          loading: false
        });
      } catch (err) {
        console.error("DB Sync Error:", err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchDBData();
  }, []);

  if (data.loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFF]">
      <div className="w-10 h-10 border-4 border-[#8E7CC3] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // DB se aaye hue data ko use karna
  const { communityNeeds, volunteers, tasks, surveyEntries } = data;

  // --- EXISTING LOGIC (REMAINING UNCHANGED) ---
  const totalAffected = communityNeeds.reduce((s, n) => s + (Number(n.affectedPeople) || 0), 0);
  const totalHours = volunteers.reduce((s, v) => s + (Number(v.hoursLogged) || 0), 0);
  const avgRating = volunteers.length > 0 
    ? (volunteers.reduce((s, v) => s + (Number(v.rating) || 0), 0) / volunteers.length).toFixed(1) 
    : "0.0";

  const categoryData = communityNeeds.reduce((acc, n) => {
    if (!acc[n.category]) acc[n.category] = { count: 0, affected: 0 };
    acc[n.category].count += 1; 
    acc[n.category].affected += (Number(n.affectedPeople) || 0);
    return acc;
  }, {});

  const urgencyData = [
    { level: 'critical', count: communityNeeds.filter(n => n.urgency === 'critical').length, color: '#FF8A65' },
    { level: 'high', count: communityNeeds.filter(n => n.urgency === 'high').length, color: '#FFB199' },
    { level: 'medium', count: communityNeeds.filter(n => n.urgency === 'medium').length, color: '#8E7CC3' },
    { level: 'low', count: communityNeeds.filter(n => n.urgency === 'low').length, color: '#7BC47F' },
  ];

  const barColors = { 
    healthcare: 'from-rose-400 to-rose-500', 
    education: 'from-[#8E7CC3] to-[#7160A1]', 
    food: 'from-orange-400 to-orange-500', 
    shelter: 'from-indigo-400 to-indigo-600', 
    environment: 'from-emerald-400 to-emerald-600', 
    elderly: 'from-slate-400 to-slate-500', 
    youth: 'from-violet-400 to-violet-500', 
    disaster: 'from-red-500 to-red-700' 
  };

  return (
    <section className="py-12 bg-[#FDFDFF] min-h-screen relative overflow-hidden">
      {/* Visual Depth Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#8E7CC3]/5 to-transparent pointer-events-none" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes growWidth { from { width: 0; } }
        .animate-grow { animation: growWidth 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .glass-card { 
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(243, 240, 250, 0.8);
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .stagger-item { animation: fadeIn 0.6s ease forwards; opacity: 0; }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8 stagger-item" style={{animationDelay: '0.1s'}}>
          <div>
            <h2 className="text-5xl font-black text-[#2F2F3A] tracking-tighter">
              Impact <span className="text-[#8E7CC3]">Analytics</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-black text-slate-dark/60 uppercase tracking-widest">Live Engine Active</span>
             </div>
          </div>
        </div>

        {/* Impact Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {[
            { l: 'Affected', v: totalAffected.toLocaleString(), i: '🏘️', c: 'text-slate-dark', bg: 'bg-[#8E7CC3]/5' },
            { l: 'Open Needs', v: communityNeeds.length, i: '📋', c: 'text-slate-dark', bg: 'bg-[#FF8A65]/5' },
            { l: 'Volunteers', v: volunteers.length, i: '👥', c: 'text-slate-dark', bg: 'bg-[#7BC47F]/5' },
            { l: 'Completed', v: tasks.length, i: '✅', c: 'text-slate-dark', bg: 'bg-indigo-50/50' },
            { l: 'Hours', v: totalHours.toLocaleString(), i: '⏱️', c: 'text-slate-dark', bg: 'bg-blue-50/50' },
            { l: 'Sentiment', v: avgRating, i: '⭐', c: 'text-slate-dark', bg: 'bg-amber-50/50' }
          ].map((m, idx) => (
            <div key={m.l} className="stagger-item glass-card rounded-[2.5rem] p-7 text-center shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:shadow-[#8E7CC3]/10 hover:-translate-y-2 transition-all duration-500 group" style={{animationDelay: `${0.2 + idx * 0.05}s`}}>
              <div className={`w-14 h-14 ${m.bg} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                {m.i}
              </div>
              <div className={`text-3xl font-black tracking-tighter ${m.c}`}>{m.v}</div>
              <div className="text-[10px] font-black text-[#2F2F3A]/30 uppercase tracking-[0.2em] mt-3">{m.l}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          
          {/* Category Bar Chart */}
          <div className="stagger-item glass-card rounded-[3.5rem] p-12 shadow-sm" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-[#2F2F3A] font-bold text-2xl tracking-tight">Needs by Category</h3>
                <p className="text-slate-400 text-xs font-medium mt-1">Resource allocation by sector</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">📊</div>
            </div>
            <div className="space-y-10">
              {Object.entries(categoryData).sort(([,a],[,b]) => b.affected - a.affected).map(([cat, data]) => {
                const max = Math.max(...Object.values(categoryData).map(d => d.affected));
                return (
                  <div key={cat} className="group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-xl group-hover:scale-110 transition-transform">{getCategoryIcon(cat)}</span>
                        <span className="text-sm font-black text-[#2F2F3A] capitalize tracking-tight">{cat}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-black text-[#2F2F3A]">{data.affected.toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Reach</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${barColors[cat] || 'from-slate-400 to-slate-500'} animate-grow`} 
                        style={{ width: `${(data.affected / max) * 100}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Urgency Donut */}
          <div className="stagger-item glass-card rounded-[3.5rem] p-12 shadow-sm flex flex-col" style={{animationDelay: '0.5s'}}>
             <div className="mb-12">
                <h3 className="text-[#2F2F3A] font-bold text-2xl tracking-tight">Urgency Distribution</h3>
                <p className="text-slate-400 text-xs font-medium mt-1">Priority breakdown of active cases</p>
              </div>
            <div className="flex flex-col items-center flex-1 justify-center">
              <div className="relative w-72 h-72 mb-16">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    const total = urgencyData.reduce((s, d) => s + d.count, 0);
                    let offset = 0;
                    return urgencyData.map(d => {
                      const circ = 2 * Math.PI * 40;
                      const dash = total > 0 ? (d.count / total) * circ : 0;
                      const el = <circle key={d.level} cx="50" cy="50" r="40" fill="none" stroke={d.color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} className="transition-all duration-1000 ease-in-out" />;
                      offset += dash;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Total Cases</span>
                  <span className="text-6xl font-black text-[#2F2F3A] tracking-tighter leading-none">{communityNeeds.length}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                {urgencyData.map(d => (
                  <div key={d.level} className="flex items-center justify-between bg-white/50 rounded-3xl p-5 border border-slate-100 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color, boxShadow: `0 0 15px ${d.color}60` }} />
                      <span className="text-[10px] font-black text-[#2F2F3A]/40 uppercase tracking-widest">{d.level}</span>
                    </div>
                    <span className="text-xl font-black text-[#2F2F3A] group-hover:scale-110 transition-transform">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Personnel Density Section (Using Real DB Data) */}
          <div className="stagger-item glass-card rounded-[3.5rem] p-12 shadow-sm lg:col-span-2" style={{animationDelay: '0.7s'}}>
            <h3 className="text-[#2F2F3A] font-bold text-2xl tracking-tight mb-12">Personnel Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { l: 'Full Time', c: volunteers.filter(v => v.availability === 'full-time').length, bg: 'bg-[#8E7CC3]', text: 'text-white' },
                { l: 'Part Time', c: volunteers.filter(v => v.availability === 'part-time').length, bg: 'bg-white', text: 'text-slate-dark' },
                { l: 'Avg Rating', c: avgRating, bg: 'bg-white', text: 'text-slate-dark' },
                { l: 'Hours Logged', c: totalHours, bg: 'bg-white', text: 'text-slate-dark' }
              ].map(a => (
                <div key={a.l} className={`${a.bg} rounded-[2.5rem] p-8 text-center border border-slate-100 shadow-sm hover:scale-105 transition-transform`}>
                  <div className={`text-4xl font-black ${a.text} tracking-tighter`}>{a.c}</div>
                  <div className={`text-[9px] font-black ${a.text === 'text-white' ? 'opacity-60' : 'text-slate-400'} uppercase tracking-[0.2em] mt-3`}>{a.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Impact Summary Banner */}
        <div className="stagger-item mt-16 bg-[#2F2F3A] rounded-[4rem] p-16 text-white shadow-[0_50px_100px_-20px_rgba(47,47,58,0.3)] relative overflow-hidden group" style={{animationDelay: '0.8s'}}>
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-[#8E7CC3]/20 to-transparent rounded-full blur-[100px] -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110" />
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { v: `$${((totalHours * 25) / 1000).toFixed(0)}K+`, l: 'Valuation Created', i: '📈' },
              { v: `${(totalAffected / 1000).toFixed(1)}K`, l: 'Humans Helped', i: '💙' },
              { v: communityNeeds.length, l: 'Active Nodes', i: '🌍' },
              { v: surveyEntries.filter(s => s.verified).length, l: 'Verified Insights', i: '🛡️' }
            ].map((stat, i) => (
              <div key={stat.l} className="flex flex-col items-center">
                <span className="text-3xl mb-4">{stat.i}</span>
                <div className="text-5xl font-black text-white tracking-tighter mb-3">{stat.v}</div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}