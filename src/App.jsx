import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CommunityNeeds from './components/CommunityNeeds';
import VolunteerDirectory from './components/VolunteerDirectory';
import SmartMatching from './components/SmartMatching';
import TaskBoard from './components/TaskBoard';
import SurveyForm from './components/SurveyForm';
import Analytics from './components/Analytics';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import { checkBackendHealth } from './services/api';

// ============================================
// ROLE PERMISSIONS - Single Source of Truth
// ============================================
const ROLE_PERMISSIONS = {
  admin: {
    label: 'Administrator',
    canViewDashboard: true,
    canViewNeeds: true,
    canCreateNeed: true,
    canViewVolunteers: true,
    canViewMatching: true,
    canViewTasks: true,
    canViewSurvey: true,
    canViewAnalytics: true,
  },
  coordinator: {
    label: 'Coordinator',
    canViewDashboard: true,
    canViewNeeds: true,
    canViewVolunteers: true,
    canViewMatching: true,
    canViewTasks: true,
    canViewSurvey: true,
    canViewAnalytics: true,
  },
  'field-worker': {
    label: 'Field Worker',
    canViewDashboard: true,
    canViewNeeds: true,
    canViewVolunteers: true,
    canViewMatching: false,
    canViewTasks: true,
    canViewSurvey: true,
    canViewAnalytics: false,
  },
  volunteer: {
    label: 'Volunteer',
    canViewDashboard: true,
    canViewNeeds: true,
    canViewVolunteers: false,
    canViewMatching: false,
    canViewTasks: true,
    canViewSurvey: true,
    canViewAnalytics: false,
  },
  viewer: {
    label: 'Guest Viewer',
    canViewDashboard: true,
    canViewNeeds: true,
    canViewVolunteers: false,
    canViewMatching: false,
    canViewTasks: false,
    canViewSurvey: false,
    canViewAnalytics: false,
  },
};

const DEMO_USERS = {
  'admin@communitypulse.org': { _id: 'u1', name: 'System Admin', email: 'admin@communitypulse.org', password: 'admin123', role: 'admin', avatar: '👑', organization: 'CommunityPulse HQ' },
  'sarah@communitypulse.org': { _id: 'u2', name: 'Sarah Miller', email: 'sarah@communitypulse.org', password: 'password123', role: 'coordinator', avatar: '👩‍💼', organization: 'Regional Relief' },
  'volunteer@example.com': { _id: 'u4', name: 'Alex Volunteer', email: 'volunteer@example.com', password: 'password123', role: 'volunteer', avatar: '🙋', organization: 'General Corps' },
};

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState(false);
  const [authView, setAuthView] = useState('landing');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Derived permissions
  const perms = user ? (ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.viewer) : ROLE_PERMISSIONS.viewer;

  useEffect(() => {
    const init = async () => {
      try { 
        const health = await checkBackendHealth();
        setBackendStatus(health.connected); 
      } catch { 
        setBackendStatus(false); 
      }
      
      const stored = localStorage.getItem('CommunityPulse_user');
      if (stored) { 
        setUser(JSON.parse(stored)); 
        setAuthView('authenticated'); 
      }
      setAuthLoading(false);
    };
    init();

    const iv = setInterval(async () => {
      try { 
        const health = await checkBackendHealth();
        setBackendStatus(health.connected); 
      } catch { 
        setBackendStatus(false); 
      }
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  const doLogin = async (email, pw) => {
    // 1. Try Live Auth
    if (backendStatus) {
      try { 
        const { authAPI } = await import('./services/api'); 
        const d = await authAPI.login(email, pw); 
        localStorage.setItem('CommunityPulse_token', d.token); 
        localStorage.setItem('CommunityPulse_user', JSON.stringify(d.user)); 
        setUser(d.user); 
        setAuthView('authenticated'); 
        setActiveSection('dashboard'); 
        return; 
      } catch (err) { console.warn("Live login failed, checking demo..."); }
    }
    
    // 2. Demo Fallback
    const demo = DEMO_USERS[email.toLowerCase()];
    if (demo && demo.password === pw) {
      const u = { ...demo };
      delete u.password;
      localStorage.setItem('CommunityPulse_user', JSON.stringify(u));
      setUser(u); 
      setAuthView('authenticated'); 
      setActiveSection('dashboard');
    } else { 
      throw new Error('Invalid credentials. Check connection or try demo account.'); 
    }
  };

  const doRegister = async (data) => {
    if (backendStatus) {
      try { 
        const { authAPI } = await import('./services/api'); 
        const d = await authAPI.register(data); 
        localStorage.setItem('CommunityPulse_token', d.token); 
        localStorage.setItem('CommunityPulse_user', JSON.stringify(d.user)); 
        setUser(d.user); 
        setAuthView('authenticated'); 
        setActiveSection('dashboard'); 
        return; 
      } catch (e) { throw new Error(e.message); }
    }
    const u = { _id: 'u' + Date.now(), name: data.name, email: data.email, role: data.role || 'viewer', avatar: '👤', organization: data.organization || '' };
    localStorage.setItem('CommunityPulse_user', JSON.stringify(u)); 
    setUser(u); 
    setAuthView('authenticated'); 
    setActiveSection('dashboard');
  };

  const doLogout = () => { 
    localStorage.clear();
    setUser(null); 
    setAuthView('landing'); 
    setActiveSection('dashboard');
  };

  const go = (s) => { 
    setActiveSection(s); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  if (authLoading) return <LoadingScreen />;

  // Auth Routing
  if (authView === 'landing') return <LandingPage onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} />;
  if (authView === 'login') return <Login onLogin={doLogin} onSwitchToRegister={() => setAuthView('register')} onBack={() => setAuthView('landing')} />;
  if (authView === 'register') return <Register onRegister={doRegister} onSwitchToLogin={() => setAuthView('login')} onBack={() => setAuthView('landing')} />;

  // Main Section Router with Security Guard
  const renderSection = () => {
    const config = {
      dashboard: { comp: <Dashboard onNavigate={go} permissions={perms} />, view: true },
      needs: { comp: <CommunityNeeds onNavigate={go} permissions={perms} />, view: perms.canViewNeeds },
      volunteers: { comp: <VolunteerDirectory onNavigate={go} permissions={perms} />, view: perms.canViewVolunteers },
      matching: { comp: <SmartMatching permissions={perms} />, view: perms.canViewMatching },
      tasks: { comp: <TaskBoard permissions={perms} />, view: perms.canViewTasks },
      survey: { comp: <SurveyForm permissions={perms} />, view: perms.canViewSurvey },
      analytics: { comp: <Analytics permissions={perms} />, view: perms.canViewAnalytics },
    };

    const target = config[activeSection] || config.dashboard;

    // Security Gate: Redirect if no permission
    if (!target.view) {
      setTimeout(() => setActiveSection('dashboard'), 0);
      return config.dashboard.comp;
    }

    return target.comp;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Navbar 
        activeSection={activeSection} 
        onNavigate={go} 
        backendStatus={backendStatus} 
        user={user} 
        onLogout={doLogout} 
        perms={perms} 
      />
      
      <main className="pt-16">
        {/* Tactical Status Bar */}
        <div className={`text-center py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border-b transition-all duration-700 ${
          backendStatus 
          ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' 
          : 'bg-amber-500/5 text-amber-500 border-amber-500/10'
        }`}>
          {backendStatus ? '● System Uplink Active' : '○ Local Offline Mode'}
          <span className="mx-4 opacity-20">|</span>
          Operator: {user.name} <span className="opacity-50">[{perms.label}]</span>
        </div>

        {/* Section Animation Wrapper */}
        <div className="transition-all duration-500 ease-in-out">
          {renderSection()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-700 mb-6 mx-auto animate-pulse">
          <span className="text-3xl">🤝</span>
        </div>
        <div className="space-y-2">
          <p className="text-white font-bold tracking-widest uppercase text-xs">CommunityPulse</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] animate-pulse">Decrypting Network...</p>
        </div>
      </div>
    </div>
  );
}