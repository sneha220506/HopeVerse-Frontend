import { useState } from 'react';

export default function Navbar({ activeSection, onNavigate, backendStatus, user, onLogout, permissions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filter nav links by permission
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
  const roleColors = { admin: 'text-red-400', coordinator: 'text-blue-400', 'field-worker': 'text-amber-400', volunteer: 'text-emerald-400', viewer: 'text-gray-400' };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30"><span className="text-white text-lg">🤝</span></div>
            <span className="text-white font-bold text-lg">Community<span className="text-emerald-400">Pulse</span></span>
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(l => (
              <button key={l.id} onClick={() => onNavigate(l.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === l.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                {l.name}
              </button>
            ))}
            <div className={`ml-2 w-2.5 h-2.5 rounded-full ${backendStatus ? 'bg-emerald-400' : 'bg-yellow-500'}`} title={backendStatus ? 'Connected' : 'Offline'} />
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {p.canSubmitSurvey && (
              <button onClick={() => onNavigate('survey')} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25">
                + New Report
              </button>
            )}

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/30 flex items-center justify-center text-sm">{user?.avatar || '👤'}</div>
                <div className="text-left hidden xl:block">
                  <p className="text-white text-sm font-medium">{user?.name?.split(' ')[0]}</p>
                  <p className={`text-[10px] capitalize ${roleColors[user?.role]}`}>{user?.role}</p>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/30 flex items-center justify-center text-xl">{user?.avatar}</div>
                        <div>
                          <p className="text-white font-medium">{user?.name}</p>
                          <p className="text-gray-400 text-xs">{user?.email}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-700/50 ${roleColors[user?.role]}`}>{p.label || user?.role}</span>
                        </div>
                      </div>                      
                    </div>
                    <div className="p-2">
                      <button onClick={() => { onNavigate('dashboard'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700/50 text-sm text-left">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Dashboard
                      </button>
                      <div className="border-t border-gray-700/50 my-2" />
                      <button onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 text-sm text-left">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-4 py-3 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/30 flex items-center justify-center text-lg">{user?.avatar}</div>
            <div className="flex-1"><p className="text-white text-sm font-medium">{user?.name}</p><p className={`text-xs capitalize ${roleColors[user?.role]}`}>{p.label}</p></div>
            <div className={`w-2.5 h-2.5 rounded-full ${backendStatus ? 'bg-emerald-400' : 'bg-yellow-500'}`} />
          </div>
          {navLinks.map(l => (
            <button key={l.id} onClick={() => { onNavigate(l.id); setIsOpen(false); }}
              className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${activeSection === l.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {l.name}
            </button>
          ))}
          <div className="border-t border-gray-700/50 my-2" />
          <button onClick={() => { onLogout(); setIsOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10">🚪 Sign Out</button>
        </div>
      )}
    </nav>
  );
}

function PermItem({ label, active }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[10px] ${active ? 'text-emerald-400' : 'text-red-400'}`}>{active ? '✓' : '✗'}</span>
      <span className={`text-[10px] ${active ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
    </div>
  );
}
