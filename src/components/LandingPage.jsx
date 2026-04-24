import { communityNeeds, volunteers, tasks } from '../data/mockData';

export default function LandingPage({ onLogin, onRegister }) {
  const criticalCount = communityNeeds.filter(n => n.urgency === 'critical').length;
  const totalAffected = communityNeeds.reduce((s, n) => s + n.affectedPeople, 0);
  const totalHours = volunteers.reduce((s, v) => s + v.hoursLogged, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar (public) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white text-lg">🤝</span>
              </div>
              <span className="text-white font-bold text-lg">Impact<span className="text-emerald-400">Hub</span></span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors">How It Works</a>
              <a href="#stats" className="text-gray-400 hover:text-white text-sm transition-colors">Impact</a>
              <a href="#roles" className="text-gray-400 hover:text-white text-sm transition-colors">Roles</a>
              <button onClick={onLogin} className="text-gray-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Sign In</button>
              <button onClick={onRegister} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25">Get Started</button>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <button onClick={onLogin} className="text-gray-300 hover:text-white text-sm px-3 py-1.5">Sign In</button>
              <button onClick={onRegister} className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium">Sign Up</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '50px 50px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Data-Driven Volunteer Coordination</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Smart Resource<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Allocation</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Transform scattered community data into actionable insights. Intelligently match volunteers with the tasks where they can create the greatest impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={onRegister}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-1">
              Start Volunteering →
            </button>
            <button onClick={onLogin}
              className="px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all border border-gray-700 hover:-translate-y-1">
              Sign In to Your Account
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: communityNeeds.length, label: 'Active Needs', icon: '📋' },
              { value: volunteers.length, label: 'Volunteers', icon: '👥' },
              { value: `${(totalAffected / 1000).toFixed(1)}K`, label: 'People Impacted', icon: '🏘️' },
              { value: tasks.length, label: 'Tasks Tracked', icon: '✅' },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything you need to coordinate volunteers and manage community impact</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🗺️', title: 'Community Needs Map', desc: 'Visualize urgent needs across all zones with interactive maps and filters', color: 'from-red-500/20 to-red-600/10' },
              { icon: '👥', title: 'Volunteer Directory', desc: 'Search, filter, and manage volunteers by skills, availability, and location', color: 'from-emerald-500/20 to-emerald-600/10' },
              { icon: '🤖', title: 'Smart Matching', desc: 'AI-powered algorithm matches volunteers to needs based on 7 weighted factors', color: 'from-blue-500/20 to-blue-600/10' },
              { icon: '📋', title: 'Task Board', desc: 'Kanban-style task management with assignment tracking and progress monitoring', color: 'from-purple-500/20 to-purple-600/10' },
              { icon: '📝', title: 'Field Reports', desc: 'Collect and verify survey data from field workers and community leaders', color: 'from-amber-500/20 to-amber-600/10' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Data-driven insights with charts, donut graphs, and regional performance', color: 'from-teal-500/20 to-teal-600/10' },
            ].map((f, i) => (
              <div key={i} className={`bg-gradient-to-br ${f.color} backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:-translate-y-1 transition-all`}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">From data collection to action in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Collect Data', desc: 'Field workers submit surveys and reports from the ground', icon: '📝' },
              { step: '2', title: 'Identify Needs', desc: 'Scattered data is organized into actionable community needs', icon: '🔍' },
              { step: '3', title: 'Smart Match', desc: 'Our algorithm finds the best volunteers for each need', icon: '🤖' },
              { step: '4', title: 'Track Impact', desc: 'Monitor progress, measure results, and improve over time', icon: '📊' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/20">{s.icon}</div>
                <div className="text-emerald-400 font-semibold text-sm mb-1">Step {s.step}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Access */}
      <section id="roles" className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Role-Based Access</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Different permissions for different team members</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                role: 'Admin', icon: '👑', color: 'border-red-500/30 bg-red-500/5',
                features: ['Full platform access', 'Create & delete needs', 'Create & delete tasks', 'Assign volunteers', 'Verify reports', 'View analytics', 'Manage users']
              },
              {
                role: 'Coordinator', icon: '👩‍💼', color: 'border-blue-500/30 bg-blue-500/5',
                features: ['Create needs', 'Create tasks', 'Assign volunteers', 'Verify reports', 'Confirm matches', 'View analytics']
              },
              {
                role: 'Field Worker', icon: '👷', color: 'border-amber-500/30 bg-amber-500/5',
                features: ['Submit reports', 'View needs', 'View volunteers', 'View tasks', 'View analytics']
              },
              {
                role: 'Viewer', icon: '👁️', color: 'border-gray-500/30 bg-gray-500/5',
                features: ['View needs', 'View volunteers', 'View tasks', 'View analytics', 'Read-only access']
              },
            ].map((r, i) => (
              <div key={i} className={`rounded-xl border ${r.color} p-6`}>
                <div className="text-3xl mb-3">{r.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-4">{r.role}</h3>
                <ul className="space-y-2">
                  {r.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="text-emerald-500 text-xs">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section id="stats" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Impact So Far</h2>
              <p className="text-gray-400">Real numbers from our community operations</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              {[
                { value: `${(totalAffected / 1000).toFixed(1)}K`, label: 'Lives Impacted', icon: '🏘️' },
                { value: volunteers.length, label: 'Active Volunteers', icon: '👥' },
                { value: tasks.length, label: 'Tasks Tracked', icon: '✅' },
                { value: totalHours.toLocaleString(), label: 'Hours Logged', icon: '⏱️' },
                { value: criticalCount, label: 'Critical Needs', icon: '🚨' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-bold text-emerald-400">{s.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of volunteers coordinating social impact through technology</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onRegister}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25">
              Create Free Account
            </button>
            <button onClick={onLogin}
              className="px-8 py-4 bg-gray-800 text-white rounded-xl font-semibold text-lg hover:bg-gray-700 border border-gray-700 transition-all">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🤝</span>
              </div>
              <span className="text-white font-bold">Impact<span className="text-emerald-400">Hub</span></span>
            </div>
            <p className="text-gray-500 text-sm">© 2024 ImpactHub. Smart Resource Allocation for Social Impact. MERN Stack.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
