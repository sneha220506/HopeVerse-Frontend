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
    <section className="py-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🤖</span>
              <h2 className="text-3xl font-heading font-bold text-slate-dark tracking-tight">Smart Match Engine</h2>
            </div>
            <p className="text-slate-dark/40 text-sm font-medium">Algorithmic precision for community impact.</p>
          </div>
          
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-white rounded-2xl border border-primary/5 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-dark/30 block mb-1">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-dark uppercase">Engine Online</span>
                </div>
             </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 mb-12 shadow-soft">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-5">
              <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Target Community Need</label>
              <select 
                value={selectedNeed} 
                onChange={(e) => setSelectedNeed(e.target.value)} 
                className="w-full bg-surface border border-primary/5 rounded-2xl px-5 py-4 text-sm font-bold text-slate-dark focus:ring-4 focus:ring-primary/10 transition-all appearance-none outline-none shadow-inner"
              >
                <option value="">Analyze All High-Urgency Needs</option>
                {openNeeds.map(n => <option key={n._id} value={n._id}>{getCategoryIcon(n.category)} {n.title}</option>)}
              </select>
            </div>
            
            <div className="lg:col-span-4">
              <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-1">Available Workforce</label>
              <div className="flex items-center gap-4 bg-surface border border-primary/5 rounded-2xl px-5 py-3.5 shadow-inner">
                <div className="flex -space-x-3">
                  {available.slice(0, 4).map(v => (
                    <div key={v._id} className="w-9 h-9 rounded-full bg-white border-2 border-surface flex items-center justify-center text-sm shadow-sm ring-1 ring-primary/5">
                      {v.avatar}
                    </div>
                  ))}
                </div>
                <div>
                  <span className="text-slate-dark font-black text-lg leading-none block">{available.length}</span>
                  <span className="text-slate-dark/30 text-[10px] font-bold uppercase">Ready to Deploy</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <button 
                onClick={runMatch} 
                disabled={isMatching}
                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-2xl transition-all bg-[#F3F0FA] text-slate-dark font-black uppercase tracking-[0.2em]"
              >
                {isMatching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="uppercase tracking-widest font-black text-xs">Computing...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">⚡</span>
                    <span className="uppercase tracking-widest font-black text-xs">Execute Match</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {matches.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-xl font-heading font-bold text-slate-dark">Optimization Results</h3>
              <span className="px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                {matches.length} Optimal Pairings Found
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, idx) => {
                const key = `${match.volunteer._id}-${match.need._id}`;
                const isAssigned = assigned.has(key);
                return (
                  <div 
                    key={idx} 
                    className={`group relative bg-white rounded-[2rem] p-6 border transition-all duration-500 hover:-translate-y-2 ${
                      isAssigned ? 'border-primary shadow-xl shadow-primary/10' : 'border-white shadow-soft hover:shadow-xl hover:border-primary/20'
                    }`}
                  >
                    {/* Score Badge */}
                    <div className="absolute -top-3 -right-3 w-14 h-14 bg-white rounded-2xl shadow-lg border border-primary/5 flex flex-col items-center justify-center">
                       <span className="text-[9px] font-black text-slate-dark/30 uppercase leading-none mb-1">Score</span>
                       <span className={`text-lg font-black leading-none ${match.score >= 80 ? 'text-primary' : 'text-secondary'}`}>
                         {match.score}
                       </span>
                    </div>

                    {/* Pairing Visual */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-4 p-3 bg-surface rounded-2xl border border-primary/5">
                        <span className="text-2xl">{match.volunteer.avatar}</span>
                        <div>
                          <p className="text-slate-dark font-bold text-sm">{match.volunteer.name}</p>
                          <p className="text-slate-dark/30 text-[10px] font-black uppercase tracking-tighter">{match.volunteer.skills[0]}</p>
                        </div>
                      </div>

                      <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-white p-1 rounded-full border border-primary/10">
                          <svg className="w-5 h-5 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 bg-slate-dark/5 rounded-2xl border border-transparent">
                        <span className="text-2xl">{getCategoryIcon(match.need.category)}</span>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-slate-dark font-bold text-sm truncate">{match.need.title}</p>
                          <div className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter ${getUrgencyColor(match.need.urgency)}`}>
                            {match.need.urgency}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Match Logic */}
                    <div className="space-y-2 mb-6">
                      {match.reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-dark/40 uppercase tracking-tight">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                          {r}
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => setAssigned(prev => new Set([...prev, key]))} 
                      disabled={isAssigned}
                      className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                        isAssigned 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-surface text-slate-dark/40 hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {isAssigned ? '✓ Assignment Active' : permissions?.canConfirmMatch ? 'Confirm Deployment' : 'View Parameters'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {matches.length === 0 && !isMatching && (
          <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white p-20 text-center animate-fade-in shadow-soft">
            <div className="w-24 h-24 bg-surface rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🤖</div>
            <h3 className="text-2xl font-heading font-bold text-slate-dark mb-3 tracking-tight">Systems Standby</h3>
            <p className="text-slate-dark/40 max-w-lg mx-auto mb-10 font-medium">
              The matching engine is ready to analyze volunteer skillsets against community demands. 
              Run a scan to find optimal resource allocations.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Skill Heuristics', 'Regional Analysis', 'Urgency Weighting'].map(f => (
                <span key={f} className="px-4 py-2 bg-white border border-primary/5 text-slate-dark/30 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}