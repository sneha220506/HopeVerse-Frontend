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
    { level: 'critical', count: communityNeeds.filter(n => n.urgency === 'critical').length, color: '#ef4444' },
    { level: 'high', count: communityNeeds.filter(n => n.urgency === 'high').length, color: '#f97316' },
    { level: 'medium', count: communityNeeds.filter(n => n.urgency === 'medium').length, color: '#eab308' },
    { level: 'low', count: communityNeeds.filter(n => n.urgency === 'low').length, color: '#22c55e' },
  ];

  const barColors = { healthcare: 'from-red-500 to-rose-500', education: 'from-blue-500 to-indigo-500', food: 'from-amber-500 to-orange-500', shelter: 'from-emerald-500 to-green-500', environment: 'from-teal-500 to-cyan-500', elderly: 'from-purple-500 to-violet-500', youth: 'from-pink-500 to-fuchsia-500', disaster: 'from-red-600 to-red-700' };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6"><h2 className="text-2xl font-bold text-white">📊 Analytics & Insights</h2><p className="text-gray-400 text-sm mt-1">Data-driven overview of community impact and operations</p></div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[{ l: 'People Affected', v: totalAffected.toLocaleString(), i: '🏘️', c: 'text-blue-400' },
            { l: 'Community Needs', v: communityNeeds.length, i: '📋', c: 'text-amber-400' },
            { l: 'Active Volunteers', v: volunteers.length, i: '👥', c: 'text-emerald-400' },
            { l: 'Total Tasks', v: tasks.length, i: '✅', c: 'text-purple-400' },
            { l: 'Hours Logged', v: totalHours.toLocaleString(), i: '⏱️', c: 'text-cyan-400' },
            { l: 'Avg Rating', v: avgRating, i: '⭐', c: 'text-yellow-400' }
          ].map(m => (
            <div key={m.l} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 text-center">
              <div className="text-2xl mb-1">{m.i}</div>
              <div className={`text-2xl font-bold ${m.c}`}>{m.v}</div>
              <div className="text-xs text-gray-500 mt-1">{m.l}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Bar Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-white font-semibold mb-4">Needs by Category</h3>
            <div className="space-y-3">
              {Object.entries(categoryData).sort(([,a],[,b]) => b.affected - a.affected).map(([cat, data]) => {
                const max = Math.max(...Object.values(categoryData).map(d => d.affected));
                return (<div key={cat}>
                  <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><span>{getCategoryIcon(cat)}</span><span className="text-sm text-gray-300 capitalize">{cat}</span></div><span className="text-xs text-gray-500">{data.affected.toLocaleString()}</span></div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${barColors[cat] || 'from-gray-500 to-gray-600'}`} style={{ width: `${(data.affected / max) * 100}%` }} />
                  </div>
                </div>);
              })}
            </div>
          </div>

          {/* Urgency Donut */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-white font-semibold mb-4">Urgency Distribution</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    const total = urgencyData.reduce((s, d) => s + d.count, 0);
                    let offset = 0;
                    return urgencyData.map(d => {
                      const circ = 2 * Math.PI * 40;
                      const dash = (d.count / total) * circ;
                      const el = <circle key={d.level} cx="50" cy="50" r="40" fill="none" stroke={d.color} strokeWidth="12" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} />;
                      offset += dash;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-white">{communityNeeds.length}</span>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {urgencyData.map(d => (
                <div key={d.level} className="flex items-center gap-2 bg-gray-700/30 rounded-lg p-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <div><div className="text-sm font-semibold text-gray-300">{d.count}</div><div className="text-[10px] text-gray-500 capitalize">{d.level}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Region Performance */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-white font-semibold mb-4">Region Performance</h3>
            <div className="space-y-4">
              {regionStats.map(r => {
                const rate = r.totalNeeds > 0 ? Math.round((r.tasksCompleted / (r.tasksCompleted + r.totalNeeds)) * 100) : 0;
                return (<div key={r.region}>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-300">{r.region}</span><span className="text-xs text-gray-500">{r.tasksCompleted} done</span></div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${rate}%` }} /></div>
                  <div className="flex justify-between mt-1 text-[10px] text-gray-600"><span>Pop: {r.population.toLocaleString()}</span><span>Vol: {r.volunteersActive}</span></div>
                </div>);
              })}
            </div>
          </div>

          {/* Volunteer Stats */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-white font-semibold mb-4">Volunteer Availability</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[{ l: 'Full Time', c: volunteers.filter(v => v.availability === 'full-time').length }, { l: 'Part Time', c: volunteers.filter(v => v.availability === 'part-time').length }, { l: 'Weekends', c: volunteers.filter(v => v.availability === 'weekends').length }, { l: 'Flexible', c: volunteers.filter(v => v.availability === 'flexible').length }].map(a => (
                <div key={a.l} className="bg-gray-700/30 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-white">{a.c}</div><div className="text-xs text-gray-400 mt-1">{a.l}</div></div>
              ))}
            </div>
            <h4 className="text-white font-medium text-sm mb-3">Top Skills</h4>
            <div className="flex flex-wrap gap-2">
              {['Medical', 'Teaching', 'Construction', 'Cooking', 'First Aid', 'Mentoring', 'Project Management', 'IT Support'].map(skill => {
                const count = volunteers.filter(v => v.skills.includes(skill)).length;
                return (<div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/50 rounded-lg"><span className="text-xs text-gray-300">{skill}</span><span className="text-[10px] text-emerald-400 font-medium">{count}</span></div>);
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><div className="text-3xl font-bold text-emerald-400">{((totalHours * 25) / 1000).toFixed(0)}K+</div><div className="text-sm text-gray-400 mt-1">Estimated Value ($)</div><div className="text-xs text-gray-600">@ $25/hr</div></div>
            <div><div className="text-3xl font-bold text-teal-400">{(totalAffected / 1000).toFixed(1)}K</div><div className="text-sm text-gray-400 mt-1">Lives Impacted</div></div>
            <div><div className="text-3xl font-bold text-cyan-400">{regionStats.length}</div><div className="text-sm text-gray-400 mt-1">Active Regions</div></div>
            <div><div className="text-3xl font-bold text-emerald-400">{surveyEntries.filter(s => s.verified).length}</div><div className="text-sm text-gray-400 mt-1">Verified Reports</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
