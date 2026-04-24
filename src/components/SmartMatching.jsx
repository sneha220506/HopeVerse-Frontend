import { useState } from 'react';
import { communityNeeds, volunteers } from '../data/mockData';
import { getCategoryIcon, getUrgencyColor } from '../utils/helpers';

const CATEGORY_SKILL_MAP = {
  healthcare: ['medical', 'nursing', 'first aid', 'cpr', 'nutrition', 'health', 'diagnostics'],
  education: ['teaching', 'tutoring', 'mentoring', 'mathematics', 'science', 'computer', 'literacy'],
  food: ['cooking', 'food safety', 'management', 'logistics', 'nutrition', 'distribution'],
  shelter: ['construction', 'plumbing', 'electrical', 'carpentry', 'building'],
  environment: ['gardening', 'environmental', 'ecology', 'recycling', 'conservation'],
  elderly: ['nursing', 'counseling', 'art therapy', 'companionship', 'caregiving'],
  youth: ['teaching', 'mentoring', 'art therapy', 'counseling', 'coaching', 'leadership'],
  disaster: ['fire safety', 'rescue', 'first aid', 'construction', 'emergency', 'logistics'],
};

function calculateScore(vol, need) {
  let score = 0;
  const reasons = [];

  if (vol.preferredCategories?.includes(need.category)) { score += 35; reasons.push(`Prefers ${need.category}`); }
  const relevantSkills = CATEGORY_SKILL_MAP[need.category] || [];
  const matched = vol.skills.filter(s => relevantSkills.some(rs => s.toLowerCase().includes(rs) || rs.includes(s.toLowerCase())));
  if (matched.length > 0) { score += Math.min(matched.length * 15, 45); reasons.push(`${matched.length} relevant skill(s)`); }
  if (vol.region === need.region || need.region === 'All Zones') { score += 20; reasons.push('Same region'); }
  if (need.urgency === 'critical') { score += 10; reasons.push('Critical priority'); }
  else if (need.urgency === 'high') { score += 5; }
  if (vol.tasksCompleted > 20) { score += 10; reasons.push('Experienced'); }
  else if (vol.tasksCompleted > 5) { score += 4; }
  score += ({ 'full-time': 8, flexible: 6, 'part-time': 4, weekends: 2 }[vol.availability] || 0);
  score += Math.round((vol.rating || 0) * 2);

  return { score: Math.min(score, 100), reasons };
}

export default function SmartMatching({ permissions }) {
  const [selectedNeed, setSelectedNeed] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [assigned, setAssigned] = useState(new Set());

  const openNeeds = communityNeeds.filter(n => n.status !== 'resolved');
  const available = volunteers.filter(v => v.status === 'active');

  const runMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      const needs = selectedNeed ? openNeeds.filter(n => n._id === selectedNeed) : openNeeds.filter(n => n.volunteersAssigned < n.volunteersNeeded);
      const results = [];
      for (const need of needs) {
        for (const vol of available) {
          const { score, reasons } = calculateScore(vol, need);
          if (score >= 30) results.push({ volunteer: vol, need, score, reasons });
        }
      }
      results.sort((a, b) => b.score - a.score);
      setMatches(results.slice(0, 12));
      setIsMatching(false);
    }, 1500);
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">🤖 Smart Matching Engine</h2>
          <p className="text-gray-400 text-sm mt-1">AI-powered volunteer-to-need matching based on skills, location, and availability</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 block">Select Community Need (Optional)</label>
              <select value={selectedNeed} onChange={(e) => setSelectedNeed(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-emerald-500">
                <option value="">All Urgent Needs</option>
                {openNeeds.map(n => <option key={n._id} value={n._id}>{getCategoryIcon(n.category)} {n.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium mb-2 block">Available Volunteers</label>
              <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">{available.slice(0, 4).map(v => <div key={v._id} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-sm">{v.avatar}</div>)}</div>
                  <span className="text-white font-semibold text-lg">{available.length}</span><span className="text-gray-500 text-sm">ready</span>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={runMatch} disabled={isMatching}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
                {isMatching ? (<><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyzing...</>) : '⚡ Run Smart Match'}
              </button>
            </div>
          </div>
        </div>

        {matches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Match Results</h3>
              <span className="text-emerald-400 text-sm">{matches.length} matches found</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match, idx) => {
                const key = `${match.volunteer._id}-${match.need._id}`;
                const isAssigned = assigned.has(key);
                return (
                  <div key={idx} className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border p-5 transition-all hover:-translate-y-1 ${isAssigned ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-gray-700/50 hover:border-gray-600'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${match.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : match.score >= 60 ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{match.score}%</div>
                        <span className="text-gray-400 text-xs">Match</span>
                      </div>
                      {isAssigned && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-medium">✓ Assigned</span>}
                    </div>
                    <div className="flex items-center gap-2 mb-2 p-2 bg-gray-700/30 rounded-lg">
                      <span className="text-lg">{match.volunteer.avatar}</span>
                      <div><p className="text-white text-sm font-medium">{match.volunteer.name}</p><p className="text-gray-500 text-[10px]">{match.volunteer.skills.slice(0, 2).join(', ')}</p></div>
                    </div>
                    <div className="text-center text-gray-600 text-xs my-1">→ matched with →</div>
                    <div className="flex items-center gap-2 mb-3 p-2 bg-gray-700/30 rounded-lg">
                      <span className="text-lg">{getCategoryIcon(match.need.category)}</span>
                      <div><p className="text-white text-sm font-medium line-clamp-1">{match.need.title}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getUrgencyColor(match.need.urgency)}`}>{match.need.urgency}</span>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3">
                      {match.reasons.map((r, i) => <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-400"><span className="text-emerald-500">✓</span>{r}</div>)}
                    </div>
                    <button onClick={() => setAssigned(prev => new Set([...prev, key]))} disabled={isAssigned}
                      className={`w-full py-2 rounded-lg text-xs font-medium transition-colors ${isAssigned ? 'bg-emerald-500/10 text-emerald-400 cursor-default' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}>
                      {isAssigned ? '✓ Assignment Confirmed' : permissions?.canConfirmMatch ? 'Confirm Assignment' : 'View Match'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {matches.length === 0 && !isMatching && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-12 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Match</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">Our smart matching engine analyzes volunteer skills, location proximity, availability, and community needs.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Skills Analysis', 'Location Matching', 'Urgency Priority', 'Availability Check'].map(f => <span key={f} className="px-3 py-1.5 bg-gray-700/50 text-gray-400 rounded-lg text-xs">{f}</span>)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
