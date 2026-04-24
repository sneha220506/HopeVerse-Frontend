import { communityNeeds, volunteers, regionStats } from '../data/mockData';
import { getCategoryIcon, getUrgencyColor } from '../utils/helpers';

export default function Dashboard({ onNavigate, permissions }) {
  const p = permissions || {};
  const criticalNeeds = communityNeeds.filter(n => n.urgency === 'critical');
  const topVolunteers = [...volunteers].sort((a, b) => b.tasksCompleted - a.tasksCompleted).slice(0, 5);
  const categoryCounts = communityNeeds.reduce((acc, n) => { acc[n.category] = (acc[n.category] || 0) + 1; return acc; }, {});

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Operations Dashboard</h2>
            <p className="text-gray-400 text-sm mt-1">
              {p.label && <span className="text-emerald-400">{p.label}</span>}
              {p.canCreateTask ? ' — Full management access' : p.canSubmitSurvey ? ' — Report and view access' : ' — Read-only access'}
            </p>
          </div>
          {p.canSubmitSurvey && (
            <button onClick={() => onNavigate('survey')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-sm font-medium border border-emerald-500/20">
              + Submit Report
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Critical Needs */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><h3 className="text-white font-semibold">Critical Needs</h3></div>
              <button onClick={() => onNavigate('needs')} className="text-emerald-400 text-sm hover:text-emerald-300">View All →</button>
            </div>
            <div className="divide-y divide-gray-700/30">
              {criticalNeeds.map(need => (
                <div key={need._id} className="px-6 py-4 hover:bg-gray-700/20 transition-colors">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl mt-0.5">{getCategoryIcon(need.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-medium truncate">{need.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(need.urgency)}`}>{need.urgency}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-1">{need.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>📍 {need.location}</span><span>👥 {need.affectedPeople.toLocaleString()}</span><span>🙋 {need.volunteersAssigned}/{need.volunteersNeeded}</span>
                      </div>
                    </div>
                    <div className="w-16"><div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${(need.volunteersAssigned / need.volunteersNeeded) * 100}%` }} /></div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Category Distribution */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
              <h3 className="text-white font-semibold mb-4">Needs by Category</h3>
              <div className="space-y-3">
                {Object.entries(categoryCounts).sort(([,a],[,b]) => b-a).map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-lg">{getCategoryIcon(cat)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1"><span className="text-sm text-gray-300 capitalize">{cat}</span><span className="text-sm text-gray-500">{count}</span></div>
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${(count / communityNeeds.length) * 100}%` }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Volunteers */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
              <div className="flex items-center justify-between mb-4"><h3 className="text-white font-semibold">Top Volunteers</h3><button onClick={() => onNavigate('volunteers')} className="text-emerald-400 text-xs hover:text-emerald-300">View All</button></div>
              <div className="space-y-3">
                {topVolunteers.map(v => (
                  <div key={v._id} className="flex items-center gap-3">
                    <span className="text-lg w-8 text-center">{v.avatar}</span>
                    <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{v.name}</p><p className="text-xs text-gray-500">{v.tasksCompleted} tasks • ⭐ {v.rating}</p></div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === 'on-task' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{v.status === 'on-task' ? 'Busy' : 'Available'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions - ROLE BASED */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
              <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {/* Only show "Report a Need" if user CAN create needs */}
                {p.canCreateNeed && (
                  <button onClick={() => onNavigate('survey')} className="w-full flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-left">
                    <span className="text-lg">📋</span><div><p className="text-white text-sm font-medium">Report a Need</p><p className="text-gray-500 text-[10px]">Submit a new community need</p></div>
                  </button>
                )}
                {/* Only show "Create Task" if user CAN create tasks */}
                {p.canCreateTask && (
                  <button onClick={() => onNavigate('tasks')} className="w-full flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors text-left">
                    <span className="text-lg">✅</span><div><p className="text-white text-sm font-medium">Create Task</p><p className="text-gray-500 text-[10px]">Assign volunteers to a need</p></div>
                  </button>
                )}
                {/* Only show "Submit Report" if user CAN submit surveys */}
                {p.canSubmitSurvey && (
                  <button onClick={() => onNavigate('survey')} className="w-full flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors text-left">
                    <span className="text-lg">📝</span><div><p className="text-white text-sm font-medium">Submit Field Report</p><p className="text-gray-500 text-[10px]">Log survey data from the field</p></div>
                  </button>
                )}
                {/* Show "Smart Match" only if user can confirm matches */}
                {p.canConfirmMatch && (
                  <button onClick={() => onNavigate('matching')} className="w-full flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors text-left">
                    <span className="text-lg">🤖</span><div><p className="text-white text-sm font-medium">Smart Match & Assign</p><p className="text-gray-500 text-[10px]">Find and assign best volunteers</p></div>
                  </button>
                )}
                {/* View-only users see this */}
                {!p.canCreateNeed && !p.canCreateTask && !p.canSubmitSurvey && (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">👁️ View-only access</p>
                    <p className="text-gray-600 text-xs mt-1">Contact admin for more permissions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Region Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {regionStats.map(r => (
            <div key={r.region} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 hover:border-emerald-500/30 transition-colors">
              <h4 className="text-white font-medium text-sm mb-2">{r.region}</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Needs</span><span className="text-gray-300">{r.totalNeeds}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Critical</span><span className="text-red-400">{r.criticalNeeds}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Volunteers</span><span className="text-emerald-400">{r.volunteersActive}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="text-blue-400">{r.tasksCompleted}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
