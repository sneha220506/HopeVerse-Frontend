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

  return (
    <section className="py-8 bg-[#F8FAFC] min-h-screen relative overflow-hidden">
      {/* Visual Depth Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-liner-to-b from-primary/5 to-transparent pointer-events-none" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card { animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 animate-card stagger-1">
          <div>
            {/* <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em]">Operational Live Feed</span>
            </div> */}
            <h2 className="text-4xl font-heading font-black text-slate-dark tracking-tight">
              Operations <span className="text-primary/70">Dashboard</span>
            </h2>
            <p className="text-slate-dark/40 text-sm font-medium mt-1">
              {p.label && (
                <span className="text-primary font-bold uppercase tracking-wider text-xs mr-2">
                  {p.label}
                </span>
              )}
              {p.canDeletevolunteer
                ? "Secure Administrative Node"
                : p.canSubmitSurvey
                  ? "Standard Field Access"
                  : "Observer Interface"}
            </p>
          </div>
          {(p.label==="volunteer") && (
            <button
              onClick={() => onNavigate("survey")}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95 text-sm font-black uppercase tracking-widest"
            >
              <span className="text-xl">+</span> Submit Report
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Critical Needs */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-soft border border-slate-100 overflow-hidden animate-card stagger-2 flex flex-col">
            <div className="px-10 py-7 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-accent rounded-full animate-ping absolute" />
                  <div className="w-3 h-3 bg-accent rounded-full relative" />
                </div>
                <h3 className="text-slate-dark font-black text-xl tracking-tight">
                  Critical Interventions
                </h3>
              </div>
              <button
                onClick={() => onNavigate("needs")}
                className="px-4 py-2 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-all"
              >
                View All Intelligence →
              </button>
            </div>

            <div className="divide-y divide-slate-50 overflow-y-auto custom-scrollbar max-h-[600px]">
              {criticalNeeds.map((need, idx) => (
                <div
                  key={need._id}
                  className="px-10 py-8 hover:bg-slate-50/80 transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Subtle Hover Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="flex items-start gap-6 relative z-10">
                    <div className="text-4xl w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      {getCategoryIcon(need.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h4 className="text-slate-dark font-black text-lg group-hover:text-primary transition-colors">
                          {need.title}
                        </h4>
                        <span
                          className={`px-3 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border-2 ${getUrgencyColor(need.urgency)}`}
                        >
                          {need.urgency}
                        </span>
                      </div>
                      <p className="text-slate-dark/50 text-sm line-clamp-2 leading-relaxed font-medium mb-5">
                        {need.description}
                      </p>

                      <div className="flex items-center gap-6 text-[10px] font-black text-slate-dark/30 uppercase tracking-widest">
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                          📍 {need.location}
                        </span>
                        <span className="flex items-center gap-2">
                          👥 {need.affectedPeople.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-2">
                          🙋 {need.volunteersAssigned}/{need.volunteersNeeded}
                        </span>
                      </div>
                    </div>

                    <div className="w-24 flex flex-col items-end">
                      <div className="relative w-12 h-12 mb-3">
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
                            strokeDasharray={`${(need.volunteersAssigned / need.volunteersNeeded) * 100}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary">
                          {Math.round(
                            (need.volunteersAssigned / need.volunteersNeeded) *
                              100,
                          )}
                          %
                        </div>
                      </div>
                      <p className="text-[9px] text-right font-black text-slate-dark/20 uppercase tracking-tighter">
                        Status: Deploying
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Actions */}
            {p.canViewVolunteers &&
            (<div className="bg-primary/65 rounded-[2.5rem] shadow-2xl shadow-primary/20 p-8 text-slate-dark relative overflow-hidden group mt-8">
              <div className=" absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <h3 className="font-black text-lg mb-6 flex items-center gap-3 relative z-10">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm">
                  ⚡
                </span>
                System Actions
              </h3>
              <div className="space-y-4 relative z-10">
                {p.canViewMatching && (
                  <button
                    onClick={() => onNavigate("survey")}
                    className="w-full flex items-center gap-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-[1.25rem] transition-all duration-500 shadow-lg group/btn border border-white/10 relative overflow-hidden"
                  >
                    {/* Emergency Alert Pulse - Top Right Corner */}
                    <div className="absolute top-2 right-2">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                      </span>
                    </div>

                    {/* Tactical Clipboard Icon Box */}
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shadow-inner border border-amber-500/20 group-hover/btn:scale-110 transition-transform duration-500">
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>

                    {/* Content Stack */}
                    <div className="text-left flex-1 z-10">
                      <p className=" text-[15px] font-black tracking-tight leading-tight">
                        Report Incident
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-amber-500/80 text-[10px] font-black uppercase tracking-[0.15em]">
                          Log Emergency Data
                        </p>
                      </div>
                    </div>

                    {/* Action Indicator */}
                    <div className="group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </div>
                  </button>
                )}
                {p.canViewMatching && (
                  <button
                    onClick={() => onNavigate("needs")}
                    className="w-full flex items-center gap-4 p-3 bg-violet-600/20 hover:bg-violet-600/40 backdrop-blur-md rounded-[1.25rem] transition-all duration-500 shadow-lg group/btn border border-violet-500/20 relative overflow-hidden"
                  >
                    {/* Hyper-Scan Pulse Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] pointer-events-none" />

                    {/* Analytics Icon Box - Cyber Lime Contrast */}
                    <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center text-lime-400 shadow-inner border border-lime-400/20 group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-transform duration-500">
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                        />
                      </svg>
                    </div>

                    {/* Text Logic */}
                    <div className="text-left flex-1 z-10">
                      <p className="text-[15px] font-black tracking-tight leading-tight">
                        Needs
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-lime-400/80 text-[10px] font-black uppercase tracking-[0.15em]">
                          Data Insight Matrix
                        </p>
                      </div>
                    </div>

                    {/* Trend Indicator Icon */}
                    <div className="text-white/40 group-hover/btn:text-lime-400 group-hover/btn:translate-x-1 transition-all duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.712-1.26m-1.121 4.645l1.717-4.186-4.186 1.717"
                        />
                      </svg>
                    </div>
                  </button>
                )}
                {p.canViewMatching && (
                  <button
                    onClick={() => onNavigate("analytics")}
                    className="w-full flex items-center gap-4 p-3 bg-violet-300/20 hover:bg-violet-600/40 backdrop-blur-md rounded-[1.25rem] transition-all duration-500 shadow-lg group/btn border border-violet-500/30 relative overflow-hidden"
                  >
                    <div className="w-10 h-10 bg-cyan-400/10 rounded-xl flex items-center justify-center text-cyan-400 shadow-inner border border-cyan-400/20 group-hover/btn:scale-110 transition-transform duration-500">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                        />
                      </svg>
                    </div>
                    <div className="text-left flex-1 z-10">
                      <p className="text-[15px] font-black tracking-tight leading-tight">
                        Intelligence Analysis
                      </p>
                      <p className="text-cyan-400/80 text-[10px] font-black uppercase tracking-[0.15em] mt-0.5">
                        Strategic Data Feed
                      </p>
                    </div>
                    <div className="text-white/40 group-hover/btn:text-cyan-400 group-hover/btn:translate-x-1 transition-all duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.712-1.26m-1.121 4.645l1.717-4.186-4.186 1.717"
                        />
                      </svg>
                    </div>
                  </button>
                )}
                {p.canViewVolunteers && (
                  <button
                    onClick={() => onNavigate("volunteers")}
                    className="w-full flex items-center gap-4 p-3 bg-rose-500/20 hover:bg-rose-500/40 backdrop-blur-md rounded-[1.25rem] transition-all duration-500 shadow-lg group/btn border border-rose-500/30 relative overflow-hidden"
                  >
                    {/* Biometric Scan Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-400/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] pointer-events-none" />

                    {/* Personnel Icon Box - Rose/Crimson Theme */}
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 shadow-inner border border-rose-500/20 group-hover/btn:scale-110 transition-transform duration-500">
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.941 3.197m0 0a5.995 5.995 0 005.058 2.771M12 12.75a3 3 0 100-6 3 3 0 000 6zm6.53 4.22a4.13 4.13 0 01-6.213 0m6.213 0a4.13 4.13 0 00-6.213 0M12 12.75a4.131 4.131 0 01-3.107-1.354m0 0a4.13 4.13 0 000 5.44m0-5.44a4.13 4.13 0 016.213 0"
                        />
                      </svg>
                    </div>

                    {/* Text Section */}
                    <div className="text-left flex-1 z-10">
                      <p className="text-[15px] font-black tracking-tight leading-tight">
                        View Volunteers
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-rose-400/80 text-[10px] font-black uppercase tracking-[0.15em]">
                          Personnel Deployment
                        </p>
                      </div>
                    </div>

                    {/* Small Interactive Element */}
                    <div className="text-white/20 group-hover/btn:text-rose-400 group-hover/btn:translate-x-1 transition-all duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 8.049 7.433 5 12 5c4.567 0 8.51 3.05 9.964 6.678.113.283.113.565 0 .848-1.454 3.628-5.397 6.678-9.964 6.678-4.567 0-8.51-3.05-9.964-6.678z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </button>
                )}
                {p.canViewSurvey && (
                  <button
                    onClick={() => onNavigate("survey")}
                    className="w-full flex items-center gap-4 p-3 bg-yellow-500/10 hover:bg-yellow-500/20 backdrop-blur-md rounded-[1.25rem] transition-all duration-500 shadow-lg group/btn border border-yellow-500/20 relative overflow-hidden"
                  >
                    {/* Data Retrieval Scan Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_3s_infinite] pointer-events-none" />

                    {/* Database Icon Box - Electric Gold Theme */}
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 shadow-inner border border-yellow-500/20 group-hover/btn:scale-110 transition-transform duration-500">
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 6.375c0 1.035-.84 1.875-1.875 1.875h-12.75c-1.035 0-1.875-.84-1.875-1.875v-1.125c0-1.035.84-1.875 1.875-1.875h12.75c1.035 0 1.875.84 1.875 1.875v1.125zM3.375 7.5h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 012.25 10.125v-1.5c0-.621.504-1.125 1.125-1.125zM2.25 16.5v-2.25h19.5v2.25a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25z"
                        />
                      </svg>
                    </div>

                    {/* Text Section */}
                    <div className="text-left flex-1 z-10">
                      <p className="text-[15px] font-black tracking-tight leading-tight">
                        Field Reports
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-yellow-500/80 text-[10px] font-black uppercase tracking-[0.15em]">
                          Intelligence Archive
                        </p>
                      </div>
                    </div>

                    {/* Search/Archive Icon */}
                    <div className="text-white/20 group-hover/btn:text-yellow-500 group-hover/btn:translate-x-1 transition-all duration-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                    </div>
                  </button>
                )}
              </div>
            </div>)}
          </div>

          {/* Right Column */}
          <div className="space-y-8 animate-card stagger-3">
            {/* Category Distribution */}
            <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-100 p-8 hover:shadow-xl transition-all duration-500">
              <h3 className="text-slate-dark font-black text-lg mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm">
                  📊
                </span>
                Sector Analysis
              </h3>
              <div className="space-y-6">
                {Object.entries(categoryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count]) => (
                    <div key={cat} className="group">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl group-hover:scale-125 transition-transform duration-300">
                            {getCategoryIcon(cat)}
                          </span>
                          <span className="text-sm font-bold text-slate-dark/70 capitalize tracking-tight">
                            {cat}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                          {count}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden p-[1px]">
                        <div
                          className="h-full rounded-full bg-hero-grad transition-all duration-1000 ease-out"
                          style={{
                            width: `${(count / communityNeeds.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Volunteers */}
            {p.canViewVolunteers &&
            (<div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-slate-dark font-black text-lg">
                  Top Performers
                </h3>
                {/* <button
                  onClick={() => onNavigate("volunteers")}
                  className="text-primary text-[10px] font-black hover:underline uppercase tracking-[0.2em]"
                >
                  Full Roster
                </button> */}
              </div>
              <div className="space-y-5">
                {topVolunteers.map((v, i) => (
                  <div
                    key={v._id}
                    className="flex items-center gap-4 p-3 rounded-[1.5rem] hover:bg-slate-50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-slate-100 group-hover:rotate-6 transition-transform">
                      {v.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-dark truncate tracking-tight">
                        {v.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-dark/30 uppercase tracking-widest mt-1">
                        {v.tasksCompleted} Impact Points • ⭐ {v.rating}
                      </p>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${v.status === "on-task" ? "bg-secondary animate-pulse" : "bg-success"}`}
                    />
                  </div>
                ))}
              </div>
            </div>)}

            {/* Quick Actions Card */}
          </div>
        </div>

        {/* Region Stats - Enhanced Horizontal Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 animate-card stagger-3">
          {regionStats.map((r) => (
            <div
              key={r.region}
              className="bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100 hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 group"
            >
              <h4 className="text-slate-dark font-black text-xs uppercase tracking-[0.15em] mb-4 group-hover:text-primary transition-colors">
                {r.region}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-dark/20">
                  <span>Incident Load</span>
                  <span className="text-slate-dark">{r.totalNeeds}</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{
                      width: `${(r.criticalNeeds / r.totalNeeds) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-accent tracking-tighter">
                      {r.criticalNeeds} Critical
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-success tracking-tighter">
                      {r.volunteersActive} Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
