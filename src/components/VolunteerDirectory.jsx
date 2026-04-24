import { useState } from 'react';
import { volunteers } from '../data/mockData';
import { getStatusColor } from '../utils/helpers';

export default function VolunteerDirectory({ onNavigate, permissions }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  const filtered = volunteers.filter(vol => {
    if (filterStatus !== 'all' && vol.status !== filterStatus) return false;
    if (filterAvailability !== 'all' && vol.availability !== filterAvailability) return false;
    if (searchTerm && !vol.name.toLowerCase().includes(searchTerm.toLowerCase()) && !vol.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  });

  const stats = { total: volunteers.length, active: volunteers.filter(v => v.status === 'active').length, onTask: volunteers.filter(v => v.status === 'on-task').length, totalHours: volunteers.reduce((s, v) => s + v.hoursLogged, 0), avgRating: (volunteers.reduce((s, v) => s + v.rating, 0) / volunteers.length).toFixed(1) };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Volunteer Directory</h2>
            <p className="text-gray-400 text-sm mt-1">{filtered.length} volunteers in the network</p>
          </div>
          <button onClick={() => onNavigate('matching')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-medium border border-emerald-500/20">🤖 Smart Match</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[{ l: 'Total', v: stats.total, i: '👥', c: 'text-white' }, { l: 'Active', v: stats.active, i: '✅', c: 'text-emerald-400' }, { l: 'On Task', v: stats.onTask, i: '🎯', c: 'text-blue-400' }, { l: 'Hours', v: stats.totalHours, i: '⏱️', c: 'text-amber-400' }, { l: 'Avg Rating', v: stats.avgRating, i: '⭐', c: 'text-yellow-400' }].map(s => (
            <div key={s.l} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-3 text-center">
              <div className="text-lg">{s.i}</div>
              <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
              <div className="text-xs text-gray-500">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search by name or skill..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500">
            <option value="all">All Status</option><option value="active">Active</option><option value="on-task">On Task</option>
          </select>
          <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500">
            <option value="all">All Availability</option><option value="full-time">Full Time</option><option value="part-time">Part Time</option><option value="weekends">Weekends</option><option value="flexible">Flexible</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(vol => (
            <div key={vol._id} onClick={() => setSelectedVolunteer(selectedVolunteer === vol._id ? null : vol._id)}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all cursor-pointer hover:-translate-y-1 ${selectedVolunteer === vol._id ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-gray-700/50 hover:border-gray-600'}`}>
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center text-2xl">{vol.avatar}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{vol.name}</h4>
                    <p className="text-gray-500 text-xs">📍 {vol.location}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(vol.status)}`}>{vol.status}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {vol.skills.map(skill => <span key={skill} className="px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded text-[10px]">{skill}</span>)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-700/30 rounded-lg p-2"><div className="text-white font-semibold text-sm">{vol.tasksCompleted}</div><div className="text-gray-500 text-[10px]">Tasks</div></div>
                  <div className="bg-gray-700/30 rounded-lg p-2"><div className="text-white font-semibold text-sm">{vol.hoursLogged}h</div><div className="text-gray-500 text-[10px]">Hours</div></div>
                  <div className="bg-gray-700/30 rounded-lg p-2"><div className="text-white font-semibold text-sm">⭐ {vol.rating}</div><div className="text-gray-500 text-[10px]">Rating</div></div>
                </div>

                {selectedVolunteer === vol._id && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Availability</span><span className="text-gray-300 capitalize">{vol.availability}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Joined</span><span className="text-gray-300">{new Date(vol.joinedDate).toLocaleDateString()}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Email</span><span className="text-gray-300">{vol.email}</span></div>
                    <div><span className="text-gray-500 text-xs">Preferred:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vol.preferredCategories.map(cat => <span key={cat} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] capitalize">{cat}</span>)}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onNavigate('matching'); }}
                      className="w-full mt-2 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors">Assign to Task →</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
