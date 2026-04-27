import { useState } from 'react';

export default function Navbar({ activeSection, onNavigate, backendStatus, user, onLogout, permissions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const allLinks = [
    { id: 'dashboard', name: 'Dashboard', show: true },
    { id: 'needs', name: 'Needs', show: true },
    { id: 'volunteers', name: 'Volunteers', show: true },
    { id: 'matching', name: 'Matching', show: true },
    { id: 'tasks', name: 'Tasks', show: true },
    { id: 'survey', name: 'Reports', show: true },
    { id: 'analytics', name: 'Analytics', show: true },
  ];

  const navLinks = allLinks.filter(l => l.show);
  const p = permissions || {};
  
  // Updated role colors to match the refined palette
  const roleColors = { 
    admin: 'text-primary', 
    coordinator: 'text-secondary', 
    'field-worker': 'text-accent', 
    volunteer: 'text-success', 
    viewer: 'text-slate-400' 
  };

  return (
    /* Changed to Light Glassmorphism: bg-white/80 and border-primary/10 */
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-lg border-b border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section - Lavender Gradient */}
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-hero-grad rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <span className="text-white text-lg">🤝</span>
            </div>
            <span className="text-slate-dark font-heading font-bold text-lg tracking-tight">
              Community<span className="text-primary">Pulse</span>
            </span>
          </button>

          {/* Nav Links - Muted Purple Hover */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => onNavigate(l.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSection === l.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-dark/60 hover:text-primary hover:bg-surface'
                }`}>
                {l.name}
              </button>
            ))}
            <div className={`ml-3 w-2 h-2 rounded-full ${backendStatus ? 'bg-success' : 'bg-yellow-400'} animate-pulse`} title={backendStatus ? 'Connected' : 'Offline'} />
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {p.canSubmitSurvey && (
              /* CTA Button - Warm Coral Gradient */
              <button onClick={() => onNavigate('survey')} 
                className="bg-cta-grad text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-accent/30 active:scale-95 transition-all">
                + New Report
              </button>
            )}

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 rounded-full hover:bg-surface transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/10 flex items-center justify-center text-sm ring-2 ring-white shadow-sm">
                  {user?.avatar || '👤'}
                </div>
                <div className="text-left hidden xl:block px-1">
                  <p className="text-slate-dark text-sm font-semibold leading-none">{user?.name?.split(' ')[0]}</p>
                  <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${roleColors[user?.role]}`}>{user?.role}</p>
                </div>
                <svg className="w-4 h-4 text-slate-dark/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-primary/10 rounded-2xl shadow-soft z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-5 bg-surface/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-hero-grad flex items-center justify-center text-xl shadow-md">{user?.avatar}</div>
                        <div>
                          <p className="text-slate-dark font-bold">{user?.name}</p>
                          <p className="text-slate-dark/50 text-xs">{user?.email}</p>
                        </div>
                      </div>                      
                    </div>
                    <div className="p-2">
                      <button onClick={() => { onNavigate('dashboard'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-dark/70 hover:bg-primary/5 hover:text-primary text-sm text-left font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Dashboard
                      </button>
                      <button onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent hover:bg-accent/5 text-sm text-left font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-xl text-slate-dark/60 hover:bg-surface">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-primary/5 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navLinks.map(l => (
            <button key={l.id} onClick={() => { onNavigate(l.id); setIsOpen(false); }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium ${
                activeSection === l.id ? 'bg-primary/10 text-primary' : 'text-slate-dark/60 hover:bg-surface'
              }`}>
              {l.name}
            </button>
          ))}
          <div className="pt-2 border-t border-primary/5">
            <button onClick={() => { onLogout(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-accent">🚪 Sign Out</button>
          </div>
        </div>
      )}
    </nav>
  );
}