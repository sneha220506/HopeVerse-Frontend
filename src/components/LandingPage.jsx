import { needsAPI, volunteersAPI, tasksAPI } from "../services/api";
import { useEffect, useState } from "react";

export default function LandingPage({ onLogin, onRegister }) {
  const [communityNeeds, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [needsRes, volRes, taskRes] = await Promise.all([
        needsAPI.getAll(),
        volunteersAPI.getAll(),
        tasksAPI.getAll(),
      ]);
      setNeeds(needsRes.data || needsRes);
      setVolunteers(volRes.data || volRes);
      setTasks(taskRes.data || taskRes);
      setError("");
    } catch (err) {
      setError("Please refresh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const criticalCount = communityNeeds.filter((n) => n.urgency === "critical").length;
  const totalAffected = communityNeeds.reduce((s, n) => s + n.affectedPeople, 0);
  const totalHours = volunteers.reduce((s, v) => s + v.hoursLogged, 0);

  // --- NEW LOADING UI ---
  if (loading) return (
    <div className="min-h-screen bg-[#F4F2FF] flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        {/* Inner static icon */}
        <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">🤝</div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Pulse Network</p>
        <div className="flex gap-1 justify-center mt-2">
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0s'}} />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
        </div>
      </div>
    </div>
  );

  return (
    // UPDATED GLOBAL BACKGROUND TO LIGHT LAVENDER
    <div className="min-h-screen bg-[#F4F2FF] text-slate-dark selection:bg-primary/20 overflow-x-hidden">
      {/* Custom Global Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-fade-up { animation: fadeUp 0.8s ease-out forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .floating { animation: float 4s ease-in-out infinite; }
      `}} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/60 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 bg-hero-grad rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:rotate-6 transition-transform duration-300">
                <span className="text-white text-xl">🤝</span>
              </div>
              <span className="text-slate-dark font-heading font-bold text-2xl tracking-tight">
                Community<span className="text-primary group-hover:text-primary-dark transition-colors">Pulse</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              {['Features', 'Roles'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                   className="text-slate-dark/60 hover:text-primary text-sm font-bold transition-all relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all">
                  {item}
                </a>
              ))}
              <div className="h-6 w-[1px] bg-primary/10 mx-2" />
              <button onClick={onLogin} className="text-slate-dark/70 hover:text-slate-dark text-sm font-bold transition-colors px-2">
                Sign In
              </button>
              <button onClick={onRegister} 
                className="bg-primary text-white px-7 py-3 rounded-full text-sm font-bold hover:shadow-[0_10px_20px_-5px_rgba(var(--primary-rgb),0.4)] hover:-translate-y-0.5 transition-all active:scale-95">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-52 pb-32 relative">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] floating" />
        <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] floating" style={{animationDelay: '1s'}} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          
          <h1 className="text-6xl md:text-8xl font-heading font-extrabold leading-[1.05] text-slate-dark mb-8 tracking-tighter animate-fade-up delay-1">
            Smart Resource
            <br />
            <span className="bg-hero-grad bg-clip-text text-transparent italic inline-block py-2">Allocation</span>
          </h1>

          <p className="text-slate-dark/60 text-lg md:text-2xl max-w-2xl mx-auto mb-14 leading-relaxed font-medium animate-fade-up delay-2">
            Transform scattered community data into actionable insights. 
            Intelligently match hearts with needs through data-driven empathy.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-28 animate-fade-up delay-3">
            <button onClick={onRegister}
              className="px-12 py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1.5 active:scale-95 group">
              Start Volunteering 
            </button>
            <button onClick={onLogin}
              className="px-12 py-5 bg-white text-slate-dark rounded-2xl font-bold text-lg shadow-soft border border-primary/10 hover:border-primary/20 transition-all hover:-translate-y-1.5 active:scale-95">
              Sign-In
            </button>
          </div>

          {/* Quick Stats with Glassmorphism */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto animate-fade-up" style={{animationDelay: '0.5s'}}>
            {[
              { value: communityNeeds.length || '24', label: "Active Needs", icon: "📋", border: "border-primary/10" },
              { value: volunteers.length || '1.2k', label: "Volunteers", icon: "👥", border: "border-primary/10" },
              { value: `${(totalAffected / 1000).toFixed(1)}K`, label: "Impacted", icon: "🏘️", border: "border-primary/10" },
              { value: tasks.length || '850', label: "Tasks Done", icon: "✅", border: "border-primary/10" },
            ].map((stat, i) => (
              <div key={i} className={`bg-white/60 backdrop-blur-md rounded-[2.5rem] border ${stat.border} p-8 shadow-sm group hover:bg-white/90 hover:shadow-xl hover:-translate-y-2 transition-all duration-500`}>
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">{stat.icon}</div>
                <div className="text-4xl font-heading font-black text-slate-dark tracking-tight">{stat.value}</div>
                <div className="text-[11px] font-black text-slate-dark/40 uppercase tracking-[0.15em] mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-40 bg-white/30 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-slate-dark mb-8 tracking-tight">Powerful Capabilities</h2>
            <div className="w-24 h-1.5 bg-hero-grad mx-auto rounded-full mb-8"></div>
            <p className="text-slate-dark/50 max-w-xl mx-auto font-semibold text-lg">Precision tools built for high-stakes coordination.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: "🗺️", title: "Needs Map", desc: "Visualize urgency across zones with high-fidelity interactive mapping.", color: "from-blue-500/20" },
              { icon: "👥", title: "Directory", desc: "Manage volunteers by granular skill sets, real-time availability, and location.", color: "from-primary/20" },
              { icon: "🤖", title: "Smart Match", desc: "AI-driven matching engine using 7 weighted factors for optimal resource placement.", color: "from-purple-500/20" },
              { icon: "📋", title: "Task Board", desc: "Clean Kanban management with assignment tracking and automated monitoring.", color: "from-indigo-500/20" },
              { icon: "📝", title: "Field Reports", desc: "Secure data collection from ground workers and community leaders.", color: "from-orange-500/20" },
              { icon: "📊", title: "Analytics", desc: "Deep-dive insights with regional performance charts and impact metrics.", color: "from-emerald-500/20" },
            ].map((f, i) => (
              <div key={i} className="bg-white/80 rounded-[2rem] p-10 border border-primary/5 shadow-soft hover:shadow-2xl hover:bg-white transition-all duration-500 group">
                <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${f.color} to-white flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {f.icon}
                </div>
                <h3 className="text-slate-dark font-heading font-bold text-2xl mb-4">{f.title}</h3>
                <p className="text-slate-dark/50 text-base leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-slate-dark mb-8 tracking-tight">Permission Profiles</h2>
            <p className="text-slate-dark/50 max-w-xl mx-auto font-semibold text-lg">Secured access tailored to your organizational role.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { role: "Admin", icon: "👑", theme: "hover:border-accent/30 text-accent", bg: "bg-accent/5", features: ["Full platform control", "User management", "Financial tracking", "System verification"] },
              { role: "Coordinator", icon: "👩‍💼", theme: "hover:border-primary/30 text-primary", bg: "bg-primary/5", features: ["Need & Task creation", "Volunteer assignment", "Match confirmation", "Regional analytics"] },
              { role: "Volunteer", icon: "👷", theme: "hover:border-secondary/30 text-secondary", bg: "bg-secondary/5", features: ["Field report submission", "Local need viewing", "Task status updates", "Impact logging"] },
            ].map((r, i) => (
              <div key={i} className={`group rounded-[3rem] border border-primary/10 ${r.theme} p-12 bg-white/80 shadow-soft transition-all duration-500 hover:-translate-y-4 hover:bg-white`}>
                <div className={`w-20 h-20 ${r.bg} rounded-3xl flex items-center justify-center text-5xl mb-8 transition-transform group-hover:scale-110`}>{r.icon}</div>
                <h3 className="text-slate-dark font-heading font-bold text-3xl mb-8">{r.role}</h3>
                <ul className="space-y-5">
                  {r.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-sm font-bold text-slate-dark/60">
                      <span className="w-2 h-2 rounded-full bg-current opacity-40" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto bg-hero-grad rounded-[4rem] p-16 md:p-28 text-center text-white shadow-[0_40px_100px_-20px_rgba(var(--primary-rgb),0.35)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />
          
          <h2 className="text-4xl md:text-7xl font-heading font-bold mb-10 leading-[1.1] animate-fade-up">Ready to synchronize<br/>your community impact?</h2>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <button onClick={onRegister} className="px-12 py-6 bg-white text-primary rounded-2xl font-black text-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 shadow-xl">
              Create Your Account
            </button>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-primary/10 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-hero-grad rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <span className="text-white text-sm">🤝</span>
            </div>
            <span className="text-slate-dark font-bold text-lg">CommunityPulse</span>
          </div>
          <div className="flex gap-10 text-slate-dark/40 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">API</a>
          </div>
          <p className="text-slate-dark/30 text-[10px] font-black uppercase tracking-[0.3em]">
            © 2026 Refined Hope Protocol
          </p>
        </div>
      </footer>
    </div>
  );
}