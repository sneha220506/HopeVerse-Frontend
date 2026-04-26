// import { communityNeeds, volunteers, tasks } from '../data/mockData';
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

  return (
    <div className="min-h-screen bg-background text-slate-dark selection:bg-primary/20">
      {/* Navbar (Refined) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-hero-grad rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white text-xl">🤝</span>
              </div>
              <span className="text-slate-dark font-heading font-bold text-xl tracking-tight">
                Community<span className="text-primary">Pulse</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How It Works', 'Impact', 'Roles'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                   className="text-slate-dark/60 hover:text-primary text-sm font-semibold transition-all">
                  {item}
                </a>
              ))}
              <div className="h-6 w-[1px] bg-slate-dark/10 mx-2" />
              <button onClick={onLogin} className="text-slate-dark/70 hover:text-slate-dark text-sm font-bold transition-colors px-4 py-2">
                Sign In
              </button>
              <button onClick={onRegister} 
                className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section (Aesthetic Refresh) */}
      <section className="pt-44 pb-32 relative overflow-hidden">
        {/* Soft Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Real-Time Social Coordination
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-heading font-bold leading-[1.1] text-slate-dark mb-8 tracking-tight">
            Smart Resource
            <br />
            <span className="bg-hero-grad bg-clip-text text-transparent italic px-2">Allocation</span>
          </h1>

          <p className="text-slate-dark/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Transform scattered community data into actionable insights. 
            Intelligently match hearts with needs through data-driven empathy.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-24">
            <button onClick={onRegister}
              className="px-10 py-5 bg-primary text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95">
              Start Volunteering →
            </button>
            <button onClick={onLogin}
              className="px-10 py-5 bg-white text-slate-dark rounded-full font-bold text-lg shadow-soft border border-primary/5 hover:border-primary/20 transition-all hover:-translate-y-1 active:scale-95">
              Access Dashboard
            </button>
          </div>

          {/* Glassmorphism Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: communityNeeds.length || '24', label: "Active Needs", icon: "📋" },
              { value: volunteers.length || '1.2k', label: "Volunteers", icon: "👥" },
              { value: `${(totalAffected / 1000).toFixed(1)}K`, label: "Impacted", icon: "🏘️" },
              { value: tasks.length || '850', label: "Tasks Done", icon: "✅" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-md rounded-3xl border border-white p-6 shadow-soft group hover:bg-white transition-all">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl font-heading font-bold text-slate-dark">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-dark/30 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-surface/50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-dark mb-6">Powerful Capabilities</h2>
            <p className="text-slate-dark/40 max-w-xl mx-auto font-medium">Precision tools built for high-stakes community coordination.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🗺️", title: "Needs Map", desc: "Visualize urgency across zones with high-fidelity interactive mapping.", color: "from-accent/20" },
              { icon: "👥", title: "Directory", desc: "Manage volunteers by granular skill sets, real-time availability, and location.", color: "from-primary/20" },
              { icon: "🤖", title: "Smart Match", desc: "AI-driven matching engine using 7 weighted factors for optimal resource placement.", color: "from-secondary/20" },
              { icon: "📋", title: "Task Board", desc: "Clean Kanban management with assignment tracking and automated monitoring.", color: "from-primary/20" },
              { icon: "📝", title: "Field Reports", desc: "Secure data collection from ground workers and community leaders.", color: "from-accent/20" },
              { icon: "📊", title: "Analytics", desc: "Deep-dive insights with regional performance charts and impact metrics.", color: "from-secondary/20" },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-primary/5 shadow-soft hover:shadow-xl transition-all group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} to-white flex items-center justify-center text-3xl mb-6 group-hover:rotate-6 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-slate-dark font-heading font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-slate-dark/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles (Refined Table-like Cards) */}
      <section id="roles" className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-dark mb-6">Permission Profiles</h2>
            <p className="text-slate-dark/40 max-w-xl mx-auto font-medium">Secured access tailored to your organizational role.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { role: "Admin", icon: "👑", theme: "bg-accent/5 border-accent/20 text-accent", features: ["Full platform control", "User management", "Financial tracking", "System verification"] },
              { role: "Coordinator", icon: "👩‍💼", theme: "bg-primary/5 border-primary/20 text-primary", features: ["Need & Task creation", "Volunteer assignment", "Match confirmation", "Regional analytics"] },
              { role: "Field Worker", icon: "👷", theme: "bg-secondary/5 border-secondary/20 text-secondary", features: ["Field report submission", "Local need viewing", "Task status updates", "Impact logging"] },
            ].map((r, i) => (
              <div key={i} className={`rounded-[2rem] border-2 ${r.theme} p-10 bg-white shadow-soft relative overflow-hidden`}>
                <div className="text-5xl mb-6">{r.icon}</div>
                <h3 className="text-slate-dark font-heading font-bold text-2xl mb-6">{r.role}</h3>
                <ul className="space-y-4">
                  {r.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-semibold text-slate-dark/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (The Lavender Finish) */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-hero-grad rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8 leading-tight">Ready to synchronize<br/>your community impact?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onRegister} className="px-10 py-5 bg-white text-primary rounded-full font-bold text-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
              Create Free Account
            </button>
            <button onClick={onLogin} className="px-10 py-5 bg-primary-dark/20 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-primary/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
            <div className="w-8 h-8 bg-hero-grad rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">🤝</span>
            </div>
            <span className="text-slate-dark font-bold">CommunityPulse</span>
          </div>
          <p className="text-slate-dark/30 text-xs font-bold uppercase tracking-widest">
            © 2026 Refined Hope Protocol • All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}