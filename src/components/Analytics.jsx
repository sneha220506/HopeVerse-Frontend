import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
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
      <motion.div 
        className="w-10 h-10 border-4 border-[#8E7CC3] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );

  // DB se aaye hue data ko use karna
  const { communityNeeds, volunteers, tasks, surveyEntries } = data;

  // --- LOGIC CALCULATIONS ---
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
    // <section className="py-16 bg-[#F8FAFC] min-h-screen relative overflow-x-hidden">
    <section className="py-8 bg-gradient-to-br from-slate-50 via-white to-primary min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/10 via-success/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 animate-pulse-slow animation-delay-2000" />
        
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/20 rounded-2xl rotate-12 animate-float" />
        <div className="absolute top-30 right-20 w-16 h-16 border-2 border-secondary/20 rounded-full animate-float animation-delay-1000" />
        <div className="absolute bottom-100 left-1/4 w-12 h-12 border-2 border-accent/20 rounded-lg rotate-45 animate-float animation-delay-3000" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hugo-track-line-1 {
          position: fixed; top: 35%; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(142, 124, 195, 0.04) 50%, transparent);
          pointer-events: none; z-index: 0;
        }
        .hugo-track-line-2 {
          position: fixed; top: 75%; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(142, 124, 195, 0.04) 50%, transparent);
          pointer-events: none; z-index: 0;
          @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        }
      `}} />

      <div className="hugo-track-line-1" />
      <div className="hugo-track-line-2" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] bg-[#8E7CC3]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-[-10%] w-[500px] h-[500px] bg-[#FF8A65]/4 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          className="mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h2 className="text-5xl font-black text-[#2F2F3A] tracking-tighter uppercase">
              Impact <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Analytics</span>
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-2">
              Real-time platform resource telemetry pipelines
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {[
            { l: 'Affected', v: totalAffected, bg: 'bg-[#8E7CC3]/5' },
            { l: 'Open Needs', v: communityNeeds.length, bg: 'bg-[#FF8A65]/5' },
            { l: 'Volunteers', v: volunteers.length,  bg: 'bg-[#7BC47F]/5' },
            { l: 'Completed', v: tasks.length,  bg: 'bg-indigo-50/50' },
            { l: 'Hours', v: totalHours,  bg: 'bg-blue-50/50' },
            { l: 'Sentiment', v: parseFloat(avgRating),  bg: 'bg-amber-50/50', isDecimal: true }
          ].map((m, idx) => (
            <MetricCard key={m.l} metric={m} index={idx} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          
          <CategoryChartCard categoryData={categoryData} barColors={barColors} getCategoryIcon={getCategoryIcon} />

          <UrgencyDonutCard urgencyData={urgencyData} totalCases={communityNeeds.length} />

          <PersonnelMetricsCard volunteers={volunteers} avgRating={avgRating} totalHours={totalHours} />
        </div>

        <GlobalSummaryBanner totalHours={totalHours} totalAffected={totalAffected} activeNodes={communityNeeds.length} verifiedInsights={surveyEntries.filter(s => s.verified).length} />
      </div>
    </section>
  );
}

function RunningCounter({ targetValue, isDecimal = false }) {
  const nodeRef = useRef(null);
  const motionValue = useMotionValue(0);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: "-40px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(0);
      const controls = animate(motionValue, targetValue, {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          if (nodeRef.current) {
            nodeRef.current.textContent = isDecimal 
              ? latest.toFixed(1) 
              : Math.floor(latest).toLocaleString();
          }
        }
      });
      return () => controls.stop();
    } else {
      if (nodeRef.current) {
        nodeRef.current.textContent = "0";
      }
    }
  }, [targetValue, isInView, motionValue, isDecimal]);

  return <span ref={cardRef}><span ref={nodeRef}>0</span></span>;
}

function MetricCard({ metric, index }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: "-50px" });

  return (
    <motion.div 
      ref={cardRef}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center transition-all duration-300 overflow-hidden relative"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      whileHover={{ y: -6, border: '1px solid #8E7CC3', boxShadow: "0 20px 40px rgba(142, 124, 195, 0.05)" }}
    >
      <div>
        {metric.i}
      </div>
      <div className="text-3xl font-black text-slate-800 tracking-tighter">
        <RunningCounter targetValue={metric.v} isDecimal={metric.isDecimal} />
      </div>
      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2.5">{metric.l}</div>
    </motion.div>
  );
}

function CategoryChartCard({ categoryData, barColors, getCategoryIcon }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  return (
    <motion.div 
      ref={ref}
      className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-slate-900 font-bold text-xl tracking-tight uppercase">Needs by Category</h3>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Resource allocation by sector</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shadow-sm">📊</div>
      </div>
      <div className="space-y-8">
        {Object.entries(categoryData).sort(([,a],[,b]) => b.affected - a.affected).map(([cat, data]) => {
          const max = Math.max(...Object.values(categoryData).map(d => d.affected));
          return (
            <div key={cat} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span>{getCategoryIcon(cat)}</span>
                  <span className="text-xs font-black text-slate-700 capitalize tracking-wide">{cat}</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-black text-slate-900">
                    <RunningCounter targetValue={data.affected} />
                  </span>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mt-0.5">Reach</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <motion.div 
                  className={`h-full rounded-full bg-gradient-to-r ${barColors[cat] || 'from-slate-400 to-slate-500'}`} 
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${(data.affected / max) * 100}%` } : { width: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function UrgencyDonutCard({ urgencyData, totalCases }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  return (
    <motion.div 
      ref={ref}
      className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm flex flex-col"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className="mb-10">
        <h3 className="text-slate-900 font-bold text-xl tracking-tight uppercase">Urgency Distribution</h3>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Priority breakdown of active cases</p>
      </div>
      <div className="flex flex-col items-center flex-1 justify-center">
        <div className="relative w-56 h-56 mb-10">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {(() => {
              const total = urgencyData.reduce((s, d) => s + d.count, 0);
              let offset = 0;
              return urgencyData.map(d => {
                const circ = 2 * Math.PI * 40;
                const dash = total > 0 ? (d.count / total) * circ : 0;
                const el = (
                  <motion.circle 
                    key={d.level} 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke={d.color} 
                    strokeWidth="9" 
                    strokeLinecap="round" 
                    initial={{ strokeDasharray: `0 ${circ}` }}
                    animate={isInView ? { strokeDasharray: `${dash} ${circ - dash}` } : { strokeDasharray: `0 ${circ}` }}
                    strokeDashoffset={-offset} 
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                );
                offset += dash;
                return el;
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.25em] mb-0.5">Total Cases</span>
            <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">
              <RunningCounter targetValue={totalCases} />
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 w-full">
          {urgencyData.map(d => (
            <div key={d.level} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3.5 hover:border-slate-300 transition-colors group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider truncate">{d.level}</span>
              </div>
              <span className="text-sm font-black text-slate-800 group-hover:scale-105 transition-transform">
                <RunningCounter targetValue={d.count} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PersonnelMetricsCard({ volunteers, avgRating, totalHours }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  return (
    <motion.div 
      ref={ref}
      className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm lg:col-span-2"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <h3 className="text-slate-900 font-bold text-xl tracking-tight uppercase mb-10">Personnel Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Full Time', c: volunteers.filter(v => v.availability === 'full-time').length},
          { l: 'Part Time', c: volunteers.filter(v => v.availability === 'part-time').length },
          { l: 'Avg Rating', c: parseFloat(avgRating), isDecimal: true },
          { l: 'Hours Logged', c: totalHours }
        ].map((a, i) => (
          <div key={a.l} className={`rounded-xl p-6 text-center border transition-all ${
            a.highlight 
              ? 'bg-primary/10 text-black bory shadow-md' 
              : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/50'
          }`}>
            <div className="text-3xl font-black tracking-tighter leading-none">
              <RunningCounter targetValue={a.c} isDecimal={a.isDecimal} />
            </div>
            <div className={`text-[8px] font-black uppercase tracking-widest mt-2.5 ${
              a.highlight ? 'text-slate-400' : 'text-slate-400'
            }`}>{a.l}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function GlobalSummaryBanner({ totalHours, totalAffected, activeNodes, verifiedInsights }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });

  return (
    <motion.div 
      ref={ref}
      className="mt-12 bg-primary/10 rounded-2xl p-10 md:p-12 text-black border border-primary/30 shadow-xl relative overflow-hidden group"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(142,124,195,0.12),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
        {[
          { v: ((totalHours * 25) / 1000), l: 'Valuation Created', prefix: '$', suffix: 'K+' },
          { v: (totalAffected / 1000), l: 'Humans Helped', suffix: 'K' },
          { v: activeNodes, l: 'Active Nodes' },
          { v: verifiedInsights, l: 'Verified Insights'}
        ].map((stat) => (
          <div key={stat.l} className="flex flex-col items-center justify-center px-2">
            <span className="text-xl mb-2.5">{stat.i}</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-700 tracking-tighter mb-1.5 flex items-center justify-center">
              {stat.prefix}
              <RunningCounter targetValue={stat.v} isDecimal={stat.v % 1 !== 0} />
              {stat.suffix}
            </div>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">{stat.l}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}