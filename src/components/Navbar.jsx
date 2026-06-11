import { useState } from 'react';
import { useNotifications } from "../hooks/useNotifications";
import NotificationBell from './Notification/NotificationBell';
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ activeSection, onNavigate, backendStatus, user, onLogout, perms }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications(user);

  const p = perms || {};

  const allLinks = [
    { id: 'dashboard', name: 'Dashboard', show: true },
    { id: 'needs', name: 'Needs', show: p.canViewNeeds },
    { id: 'volunteers', name: 'Volunteers', show: p.canViewVolunteers },
    { id: 'matching', name: 'Matching', show: p.canViewMatching },
    { id: 'tasks', name: 'Tasks', show: p.canViewTasks },
    { id: 'survey', name: 'Reports', show: p.canViewSurvey },
    { id: 'analytics', name: 'Analytics', show: p.canViewAnalytics },
  ];

  const navLinks = allLinks.filter(l => l.show);
  
  const roleColors = { 
    admin: 'text-primary', 
    coordinator: 'text-secondary', 
    volunteer: 'text-accent',
    viewer: 'text-slate-400'
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md border-b border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.01)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left Side: Brand Logo */}
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-2.5 group flex-shrink-0 focus:outline-none"
          >
            <motion.div 
              className="w-9 h-9 bg-hero-grad rounded-xl flex items-center justify-center shadow-md shadow-primary/10"
              whileHover={{ scale: 1.05, rotate: 6 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <span className="text-white text-lg leading-none">🤝</span>
            </motion.div>
            <span className="text-slate-800 font-heading font-black text-base sm:text-lg tracking-tight hidden sm:inline-block">
              Hope<span className="text-primary font-bold">Verse</span>
            </span>
          </button>

          {/* Center: Desktop Nav Links (Perfectly Centered & Aligned) */}
          <div className="hidden lg:flex items-center gap-1 relative h-full">
            {navLinks.map((l) => {
              const isActive = activeSection === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => onNavigate(l.id)}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider relative transition-colors duration-300 focus:outline-none ${
                    isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-primary/5 rounded-full -z-10 border border-primary/5"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{l.name}</span>
                </button>
              );
            })}
          </div>
            
          {/* Right Side: Actions & Profile (Always Aligned and Visible) */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 h-full">
            {user && (
              <div className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-50 transition-colors">
                <NotificationBell user={user} />
              </div>
            )}

            {/* Desktop Action Button */}
            {!p.canViewVolunteers && (
              <motion.button 
                onClick={() => onNavigate('survey')} 
                className="hidden md:flex items-center justify-center bg-cta-grad text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm border border-transparent"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(236, 72, 153, 0.15)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                + New Report
              </motion.button>
            )}

            {/* User Dropdown Block */}
            <div className="relative flex items-center h-full">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)} 
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-sm ring-2 ring-white shadow-sm flex-shrink-0 overflow-hidden">
                  {user?.avatar || '👤'}
                </div>
                <div className="text-left hidden sm:block max-w-[90px] xl:max-w-none">
                  <p className="text-slate-800 text-xs font-black tracking-tight leading-none truncate">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <p className={`text-[8px] uppercase tracking-widest font-black mt-1 leading-none ${roleColors[user?.role] || 'text-slate-400'}`}>
                    {user?.role}
                  </p>
                </div>
                <motion.svg 
                  className="w-3.5 h-3.5 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: showUserMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <motion.div 
                      className="absolute right-0 top-[calc(100%-4px)] w-64 bg-white border border-slate-200/80 rounded-xl shadow-xl shadow-slate-900/5 z-50 overflow-hidden"
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 8 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-hero-grad flex items-center justify-center text-base shadow-sm flex-shrink-0">
                            {user?.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-900 font-bold text-sm truncate">{user?.name}</p>
                            <p className="text-slate-400 text-xs truncate mt-0.5">{user?.email}</p>
                          </div>
                        </div>                      
                      </div>
                      <div className="p-1">
                        <button onClick={() => { onNavigate('dashboard'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                          Dashboard
                        </button>

                        <button onClick={() => { onNavigate('settings'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-colors">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings & Profile
                        </button>

                        <div className="h-px bg-slate-100 my-1 mx-2" />

                        <button onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50/60 text-xs font-semibold transition-colors">
                          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburg menu button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus:outline-none flex-shrink-0"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 origin-top shadow-xl shadow-slate-900/5"
            initial={{ opacity: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {navLinks.map((l, idx) => (
              <motion.button 
                key={l.id} 
                onClick={() => { onNavigate(l.id); setIsOpen(false); }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                  activeSection === l.id ? 'bg-primary/5 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                {l.name}
              </motion.button>
            ))}
            
            {!p.canViewVolunteers && (
              <motion.button 
                onClick={() => { onNavigate('survey'); setIsOpen(false); }}
                className="block w-full text-center px-4 py-3 mt-3 bg-cta-grad text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: navLinks.length * 0.02 }}
              >
                + New Report
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}