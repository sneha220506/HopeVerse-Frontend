import { useState, useEffect } from 'react';
// import { communityNeeds, volunteers } from '../data/mockData'; // Switched to live DB
import { needsAPI, volunteersAPI, matchingAPI } from '../services/api';
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
  const matched = (vol.skills || []).filter(s => relevantSkills.some(rs => s.toLowerCase().includes(rs) || rs.includes(s.toLowerCase())));
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
  
  // DB States
  const [dbNeeds, setDbNeeds] = useState([]);
  const [dbVolunteers, setDbVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nRes, vRes] = await Promise.all([needsAPI.getAll(), volunteersAPI.getAll()]);
        setDbNeeds(Array.isArray(nRes) ? nRes : nRes.data || []);
        setDbVolunteers(Array.isArray(vRes) ? vRes : vRes.data || []);
      } catch (err) {
        console.error("Matrix Data Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const openNeeds = dbNeeds.filter(n => n.status !== 'resolved');
  const available = dbVolunteers.filter(v => v.status === 'active');

  const runMatch = () => {
    setIsMatching(true);
    setMatches([]); 
    setTimeout(() => {
      const targetNeeds = selectedNeed ? openNeeds.filter(n => n._id === selectedNeed) : openNeeds.filter(n => (n.volunteersAssigned || 0) < (n.volunteersNeeded || 1));
      const results = [];
      for (const need of targetNeeds) {
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

  const handleConfirmDeployment = async (match, key) => {
    try {
      // Logic to confirm in DB if matchingAPI.confirm exists
      if (matchingAPI.confirm) {
        await matchingAPI.confirm(match.volunteer._id, match.need._id);
      }
      setAssigned(prev => new Set([...prev, key]));
    } catch (err) {
      alert("Deployment Protocol Error: " + err.message);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse font-black text-primary tracking-[0.3em] uppercase text-xs">Initializing Neural Engine...</div>
    </div>
  );

  return (
    <section className="py-12 bg-[#F8FAFC] min-h-screen relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        .scan-line { height: 2px; background: linear-gradient(90deg, transparent, #6366f1, transparent); position: absolute; width: 100%; z-index: 20; animation: scan 2s linear infinite; }
        @keyframes revealCard { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .reveal-match { animation: revealCard 0.5s cubic-bezier(0.17, 0.55, 0.55, 1) forwards; opacity: 0; }
        .stagger-1 { animation-delay: 0.1s; } .stagger-2 { animation-delay: 0.2s; } .stagger-3 { animation-delay: 0.3s; }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-reveal">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-4xl font-heading font-black text-slate-dark tracking-tighter">Smart Match <span className="text-primary">Engine</span></h2>
          </div>
          
        </div>

        <div className="bg-primary/20 backdrop-blur-3xl rounded-[3rem] border border-white p-10 mb-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] animate-reveal stagger-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-5">
              <label className="text-slate-dark text-[10px] font-black uppercase tracking-[0.25em] mb-4 block ml-2">Analyze Target Need</label>
              <div className="relative">
                <select value={selectedNeed} onChange={(e) => setSelectedNeed(e.target.value)} className="w-full bg-white border-2 border-slate-50 rounded-[1.5rem] px-6 py-5 text-[15px] font-bold text-slate-dark focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none outline-none shadow-sm transition-all">
                  <option value="">Global Scan (All Open Needs)</option>
                  {openNeeds.map(n => <option key={n._id} value={n._id}>{getCategoryIcon(n.category)} {n.title}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></div>
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <label className="text-slate-dark text-[10px] font-black uppercase tracking-[0.25em] mb-4 block ml-2">Active Personnel Pool</label>
              <div className="flex items-center gap-5 bg-white border-2 border-slate-50 rounded-[1.5rem] px-6 py-4 shadow-sm">
                <div className="flex -space-x-3">
                  {available.slice(0, 4).map((v, idx) => (
                    <div key={v._id} className="w-10 h-10 rounded-full bg-white border-2 border-white flex items-center justify-center text-lg shadow-md ring-1 ring-slate-100 z-10" style={{zIndex: 10-idx}}>{v.avatar}</div>
                  ))}
                  {available.length > 4 && <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">+{available.length - 4}</div>}
                </div>
                <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                <div><span className="text-slate-dark font-black text-xl leading-none block">{available.length}</span><span className="text-slate-dark/30 text-[9px] font-black uppercase tracking-widest mt-1 block">Deployable</span></div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <button onClick={runMatch} disabled={isMatching} className={`w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-4 transition-all duration-500 font-black uppercase tracking-[0.2em] text-[11px] ${isMatching ? 'bg-slate-100 text-slate-400' : 'bg-primary text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1'}`}>
                {isMatching ? <><div className="w-5 h-5 border-[3px] border-slate-300 border-t-primary rounded-full animate-spin" />Crunching Data...</> : <><span className="text-xl"></span>Execute Matrix Scan</>}
              </button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          {isMatching && <div className="scan-line" />}
          {matches.length > 0 && !isMatching && (
            <div className="animate-reveal">
              <div className="flex items-center justify-between mb-10 px-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-heading font-black text-slate-dark tracking-tight">Optimization Results</h3>
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">Top {matches.length} Pairings</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {matches.map((match, idx) => {
                  const key = `${match.volunteer._id}-${match.need._id}`;
                  const isAssigned = assigned.has(key);
                  return (
                    <div key={idx} className={`reveal-match stagger-${(idx % 3) + 1} group bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 relative ${isAssigned ? 'border-primary shadow-2xl shadow-primary/10 scale-95' : 'border-transparent shadow-soft hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2'}`}>
                      <div className="absolute top-6 right-6 w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-50 flex flex-col items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                        <span className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1 group-hover:text-white/60">Match</span>
                        <span className={`text-2xl font-black leading-none group-hover:text-white ${match.score >= 80 ? 'text-primary' : 'text-slate-dark'}`}>{match.score}%</span>
                      </div>
                      <div className="space-y-6 mb-8">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 group-hover:bg-white transition-colors">
                          <span className="text-3xl filter drop-shadow-sm">{match.volunteer.avatar}</span>
                          <div>
                            <p className="text-slate-dark font-black text-sm tracking-tight">{match.volunteer.name}</p>
                            <p className="text-slate-dark/30 text-[9px] font-black uppercase tracking-[0.15em] mt-1">{match.volunteer.skills?.[0]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-[1.5rem] shadow-xl">
                          <span className="text-3xl">{getCategoryIcon(match.need.category)}</span>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-white font-black text-sm truncate tracking-tight">{match.need.title}</p>
                            <div className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mt-1 bg-white/10 ${getUrgencyColor(match.need.urgency)}`}>{match.need.urgency}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {match.reasons.map((r, i) => <span key={i} className="px-3 py-1.5 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-tighter border border-slate-100">{r}</span>)}
                      </div>
                      <button onClick={() => handleConfirmDeployment(match, key)} disabled={isAssigned} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${isAssigned ? 'bg-success text-white shadow-lg' : 'bg-primary/5 text-primary hover:bg-primary hover:text-white'}`}>
                        {isAssigned ? '✓ Deployment Confirmed' : permissions?.canConfirmMatch ? 'Confirm Match' : 'Deploy Task'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {matches.length === 0 && !isMatching && (
            <div className="bg-white/40 backdrop-blur-md rounded-[4rem] border-2 border-dashed border-slate-200 p-24 text-center animate-reveal">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-6xl mx-auto mb-10 shadow-xl shadow-slate-200/50">🤖</div>
              <h3 className="text-3xl font-heading font-black text-slate-dark mb-4 tracking-tighter">Engine on Standby</h3>
              <p className="text-slate-dark/40 max-w-lg mx-auto mb-12 font-semibold text-lg leading-relaxed">The Smart Match Neural Engine is waiting for parameters. Initiate a global scan to optimize resource distribution.</p>
              <div className="flex flex-wrap justify-center gap-4">
                {['Geo-Mapping', 'Skill Matching', 'Urgency Weighting', 'Impact Scoring'].map(f => <div key={f} className="px-6 py-2.5 bg-white border border-slate-100 text-slate-dark/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">{f}</div>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}