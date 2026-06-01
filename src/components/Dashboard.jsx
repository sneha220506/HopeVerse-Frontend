import { communityNeeds, volunteers, regionStats } from "../data/mockData";
import { getCategoryIcon, getUrgencyColor } from "../utils/helpers";

export default function Dashboard({ onNavigate, permissions }) {
  const p = permissions || {};
  const criticalNeeds = communityNeeds.filter((n) => n.urgency === "critical");
  const topVolunteers = [...volunteers]
    .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
    .slice(0, 5);
  const categoryCounts = communityNeeds.reduce((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1;
    return acc;
  }, {});

  // Calculate stats for hero metrics
  const totalNeeds = communityNeeds.length;
  const activeVolunteers = volunteers.filter(v => v.status === "on-task").length;
  const completionRate = Math.round(
    (communityNeeds.filter(n => n.volunteersAssigned >= n.volunteersNeeded).length / totalNeeds) * 100
  );

  return (
    <section className="py-8 bg-gradient-to-br from-slate-50 via-white to-primary min-h-screen relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/10 via-success/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 animate-pulse-slow animation-delay-2000" />
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/20 rounded-2xl rotate-12 animate-float" />
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-secondary/20 rounded-full animate-float animation-delay-1000" />
        <div className="absolute bottom-40 left-1/4 w-12 h-12 border-2 border-accent/20 rounded-lg rotate-45 animate-float animation-delay-3000" />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideLeft {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.3); }
          50% { box-shadow: 0 0 40px rgba(79, 70, 229, 0.6); }
        }
        
        .animate-card { animation: fadeSlideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-slide-down { animation: fadeSlideDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-slide-left { animation: fadeSlideLeft 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-slide-right { animation: fadeSlideRight 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-scale-in { animation: scaleIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #8E7CC3, #7C3AED); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #4338CA, #6D28D9); }
        
        .gradient-border {
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #4F46E5, #7C3AED, #EC4899) border-box;
          border: 2px solid transparent;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
        {/* Dynamic Header with Metrics */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-slide-down">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-primary rounded-full animate-ping absolute" />
                  <div className="w-3 h-3 bg-primary rounded-full relative" />
                </div>
                <h1 className="text-5xl font-heading font-black text-slate-dark tracking-tight">
                  Operations{" "}
                  <span className="text-primary">Command</span>
                </h1>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {p.label && (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-wider text-xs rounded-full shadow-lg">
                    {p.label}
                  </span>
                )}
                <p className="text-slate-dark/50 text-sm font-medium">
                  {p.canDeleteVolunteer
                    ? "🛡️ Secure Administrative Node"
                    : p.canSubmitSurvey
                      ? " Standard Field Access"
                      : " Observer Interface"}
                </p>
              </div>
            </div>

            {p.label === "volunteer" && (
              <button
                onClick={() => onNavigate("survey")}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary via-secondary to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-2xl shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-500 active:scale-95 overflow-hidden"
                style={{
                  backgroundSize: "200% 100%",
                  backgroundPosition: "0% 0%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundPosition = "100% 0%";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = "0% 0%";
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <div className="relative flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <span className="font-black uppercase tracking-widest text-sm">
                    Submit Report
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Hero Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in stagger-1">
            <MetricCard
              icon="🎯"
              label="Active Operations"
              value={totalNeeds}
              trend="+12%"
              color="primary"
              delay="stagger-1"
            />
            <MetricCard
              icon="👥"
              label="Deployed Personnel"
              value={activeVolunteers}
              trend="+8%"
              color="secondary"
              delay="stagger-2"
            />
            <MetricCard
              icon="✅"
              label="Mission Success Rate"
              value={`${completionRate}%`}
              trend="+5%"
              color="success"
              delay="stagger-3"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Critical Needs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Critical Interventions Card */}
            <div className="gradient-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-right stagger-2 group hover:shadow-primary/20 transition-shadow duration-500">
              <div className="bg-gradient-to-br from-white via-primary/5 to-secondary/5">
                {/* Header */}
                <div className="px-10 py-7 border-b border-slate-100/50 flex items-center justify-between bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <span className="text-2xl">🚨</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-ping" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full" />
                    </div>
                    <div>
                      <h3 className="text-slate-dark font-black text-xl tracking-tight">
                        Critical Interventions
                      </h3>
                      <p className="text-xs text-slate-dark/40 font-bold uppercase tracking-wider mt-0.5">
                        Priority Response Queue
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate("needs")}
                    className="group/btn px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary hover:to-secondary text-primary hover:text-white rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl"
                  >
                    <span className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
                      Full Intel
                      <svg
                        className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Needs List */}
                <div className="divide-y divide-slate-100/50 overflow-y-auto custom-scrollbar max-h-[600px]">
                  {criticalNeeds.map((need, idx) => (
                    <NeedCard key={need._id} need={need} index={idx} />
                  ))}
                </div>
              </div>
            </div>

            {/* System Actions Panel */}
            {p.canViewVolunteers && (
              <div className="gradient-border rounded-[2.5rem] shadow-2xl p-8 animate-slide-right stagger-3 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-50" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl animate-glow">
                      <span className="text-3xl">⚡</span>
                    </div>
                    <div>
                      <h3 className="font-black text-2xl tracking-tight text-slate-dark">
                        Mission Control
                      </h3>
                      <p className="text-xs text-slate-dark/50 font-bold uppercase tracking-wider">
                        Tactical Operations Hub
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p.canViewMatching && (
                      <ActionButton
                        onClick={() => onNavigate("survey")}
                        icon="📋"
                        title="Report Incident"
                        subtitle="Log Emergency Data"
                        color="amber"
                      />
                    )}
                    {p.canViewMatching && (
                      <ActionButton
                        onClick={() => onNavigate("needs")}
                        icon="🎯"
                        title="View Needs"
                        subtitle="Data Insight Matrix"
                        color="lime"
                      />
                    )}
                    {p.canViewMatching && (
                      <ActionButton
                        onClick={() => onNavigate("analytics")}
                        icon="📊"
                        title="Analytics"
                        subtitle="Strategic Data Feed"
                        color="cyan"
                      />
                    )}
                    {p.canViewVolunteers && (
                      <ActionButton
                        onClick={() => onNavigate("volunteers")}
                        icon="👥"
                        title="Personnel"
                        subtitle="Deployment Status"
                        color="rose"
                      />
                    )}
                    {p.canViewSurvey && (
                      <ActionButton
                        onClick={() => onNavigate("survey")}
                        icon="🗂️"
                        title="Field Reports"
                        subtitle="Intelligence Archive"
                        color="yellow"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Analytics */}
          <div className="space-y-6 animate-slide-left stagger-3">
            {/* Category Distribution */}
            <div className="gradient-border rounded-[2.5rem] shadow-2xl p-8 bg-white hover:shadow-primary/20 transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-slate-dark font-black text-lg tracking-tight">
                    Sector Analysis
                  </h3>
                  <p className="text-xs text-slate-dark/40 font-bold uppercase tracking-wider">
                    Category Distribution
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(categoryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count], idx) => (
                    <CategoryBar
                      key={cat}
                      category={cat}
                      count={count}
                      total={totalNeeds}
                      index={idx}
                    />
                  ))}
              </div>
            </div>

            {/* Top Performers */}
            {p.canViewVolunteers && (
              <div className="gradient-border rounded-[2.5rem] shadow-2xl p-8 bg-white hover:shadow-secondary/20 transition-all duration-500 group">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div>
                      <h3 className="text-slate-dark font-black text-lg tracking-tight">
                        Top Performers
                      </h3>
                      <p className="text-xs text-slate-dark/40 font-bold uppercase tracking-wider">
                        Elite Response Team
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {topVolunteers.map((v, i) => (
                    <VolunteerCard key={v._id} volunteer={v} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Regional Intelligence Grid */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8 animate-slide-up stagger-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center shadow-xl">
              <span className="text-3xl">🗺️</span>
            </div>
            <div>
              <h2 className="text-3xl font-heading font-black text-slate-dark tracking-tight">
                Regional Intelligence
              </h2>
              <p className="text-sm text-slate-dark/50 font-bold uppercase tracking-wider">
                Geographic Distribution & Status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-scale-in stagger-5">
            {regionStats.map((region, idx) => (
              <RegionCard key={region.region} region={region} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ COMPONENT LIBRARY ============

function MetricCard({ icon, label, value, trend, color, delay }) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/10 text-primary border-primary/30",
    secondary: "from-secondary/20 to-secondary/10 text-secondary border-secondary/30",
    success: "from-success/20 to-success/10 text-success border-success/30",
  };

  return (
    <div
      className={`gradient-border rounded-2xl p-6 bg-gradient-to-br ${colorClasses[color]} hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer ${delay}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
          {icon}
        </div>
        <div className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full">
          <span className="text-xs font-black text-success">{trend}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider opacity-70">
          {label}
        </p>
        <p className="text-4xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function NeedCard({ need, index }) {
  return (
    <div
      className="px-10 py-8 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all cursor-pointer group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="text-4xl w-16 h-16 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            {getCategoryIcon(need.category)}
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-[10px] font-black text-white">!</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <h4 className="text-slate-dark font-black text-lg group-hover:text-primary transition-colors">
              {need.title}
            </h4>
            <span
              className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 ${getUrgencyColor(need.urgency)} shadow-sm`}
            >
              {need.urgency}
            </span>
          </div>

          <p className="text-slate-dark/60 text-sm line-clamp-2 leading-relaxed font-medium mb-5">
            {need.description}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <InfoChip icon="📍" label={need.location} />
            <InfoChip
              icon="👥"
              label={need.affectedPeople.toLocaleString()}
            />
            <InfoChip
              icon="🙋"
              label={`${need.volunteersAssigned}/${need.volunteersNeeded}`}
            />
          </div>
        </div>

        <ProgressRing
          progress={(need.volunteersAssigned / need.volunteersNeeded) * 100}
        />
      </div>
    </div>
  );
}

function InfoChip({ icon, label }) {
  return (
    <span className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-black text-slate-dark/60 uppercase tracking-wider transition-colors">
      <span>{icon}</span>
      {label}
    </span>
  );
}

function ProgressRing({ progress }) {
  return (
    <div className="w-20 flex flex-col items-center">
      <div className="relative w-16 h-16 mb-2">
        <svg
          viewBox="0 0 36 36"
          className="w-full h-full transform -rotate-90"
        >
          <path
            className="stroke-slate-100"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="stroke-primary transition-all duration-1000"
            strokeWidth="3"
            strokeDasharray={`${progress}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-primary">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <p className="text-[9px] text-center font-black text-slate-dark/30 uppercase tracking-tight">
        Progress
      </p>
    </div>
  );
}

function ActionButton({ onClick, icon, title, subtitle, color }) {
  const colorClasses = {
    amber: "from-amber-500/10 to-amber-500/5 hover:from-amber-500 hover:to-amber-600 border-amber-500/20 hover:border-amber-500 text-amber-600 hover:text-white",
    lime: "from-lime-500/10 to-lime-500/5 hover:from-lime-500 hover:to-lime-600 border-lime-500/20 hover:border-lime-500 text-lime-600 hover:text-white",
    cyan: "from-cyan-500/10 to-cyan-500/5 hover:from-cyan-500 hover:to-cyan-600 border-cyan-500/20 hover:border-cyan-500 text-cyan-600 hover:text-white",
    rose: "from-rose-500/10 to-rose-500/5 hover:from-rose-500 hover:to-rose-600 border-rose-500/20 hover:border-rose-500 text-rose-600 hover:text-white",
    yellow: "from-yellow-500/10 to-yellow-500/5 hover:from-yellow-500 hover:to-yellow-600 border-yellow-500/20 hover:border-yellow-500 text-yellow-600 hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`group/btn relative flex items-center gap-4 p-4 bg-gradient-to-br ${colorClasses[color]} border-2 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
      
      <div className="relative w-12 h-12 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all duration-500">
        {icon}
      </div>

      <div className="text-left flex-1 relative z-10">
        <p className="text-sm font-black tracking-tight leading-tight group-hover/btn:text-white transition-colors">
          {title}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-0.5 group-hover/btn:text-white/90 transition-colors">
          {subtitle}
        </p>
      </div>

      <svg
        className="w-5 h-5 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all relative z-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </button>
  );
}

function CategoryBar({ category, count, total, index }) {
  const percentage = (count / total) * 100;

  return (
    <div
      className="group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
            {getCategoryIcon(category)}
          </span>
          <span className="text-sm font-bold text-slate-dark/70 capitalize tracking-tight">
            {category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
            {count}
          </span>
          <span className="text-[10px] font-bold text-slate-dark/40">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
}

function VolunteerCard({ volunteer, rank }) {
  const medals = ["🥇", "🥈", "🥉"];
  const medal = medals[rank - 1] || "🏅";

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-transparent hover:from-secondary/10 hover:to-primary/10 transition-all duration-500 group border border-transparent hover:border-primary/20">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-slate-100 shadow-lg flex items-center justify-center text-3xl border-2 border-slate-200 group-hover:border-primary/30 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
          {volunteer.avatar}
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg text-sm">
          {medal}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-black text-slate-dark truncate tracking-tight group-hover:text-primary transition-colors">
            {volunteer.name}
          </p>
          <div
            className={`w-2 h-2 rounded-full ${volunteer.status === "on-task" ? "bg-secondary animate-pulse" : "bg-success"}`}
          />
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-dark/40 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            ⚡ {volunteer.tasksCompleted}
          </span>
          <span className="flex items-center gap-1">
            ⭐ {volunteer.rating}
          </span>
        </div>
      </div>

      <div className="text-xs font-black text-slate-dark/20 group-hover:text-primary/40 transition-colors">
        #{rank}
      </div>
    </div>
  );
}

function RegionCard({ region, index }) {
  const criticalPercentage = (region.criticalNeeds / region.totalNeeds) * 100;

  return (
    <div
      className="gradient-border rounded-2xl p-6 bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
          🗺️
        </div>
        <div
          className={`w-3 h-3 rounded-full ${criticalPercentage > 50 ? "bg-accent animate-pulse" : "bg-success"}`}
        />
      </div>

      <h4 className="text-slate-dark font-black text-sm uppercase tracking-wider mb-4 group-hover:text-primary transition-colors">
        {region.region}
      </h4>

      <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-dark/40">
          <span>Operations</span>
          <span className="text-slate-dark">{region.totalNeeds}</span>
        </div>

        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all duration-1000"
            style={{ width: `${criticalPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="text-center p-2 bg-accent/10 rounded-lg">
            <p className="text-xs font-black text-accent">
              {region.criticalNeeds}
            </p>
            <p className="text-[9px] font-bold text-slate-dark/40 uppercase tracking-wider">
              Critical
            </p>
          </div>
          <div className="text-center p-2 bg-success/10 rounded-lg">
            <p className="text-xs font-black text-success">
              {region.volunteersActive}
            </p>
            <p className="text-[9px] font-bold text-slate-dark/40 uppercase tracking-wider">
              Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}