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
// ROLE PERMISSIONS - Each role has specific abilities
// ============================================
const ROLE_PERMISSIONS = {
  admin: {
    label: 'Admin',
    canViewDashboard: true,
    canViewNeeds: true,
    canCreateNeed: true,
    canEditNeed: true,
    canDeleteNeed: true,
    canVerifyNeed: true,
    canViewVolunteers: true,
    canEditVolunteer: true,
    canDeleteVolunteer: true,
    canRateVolunteer: true,
    canViewMatching: true,
    canConfirmMatch: true,
    canViewTasks: true,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canAssignVolunteer: true,
    canStartTask: true,
    canCompleteTask: true,
    canViewSurvey: true,
    canSubmitSurvey: true,
    canVerifySurvey: true,
    canDeleteSurvey: true,
    canViewAnalytics: true,
    canAccessAll: true,
  },
  coordinator: {
    label: 'Coordinator',
    canViewDashboard: true,
    canViewNeeds: true,
    canCreateNeed: true,
    canEditNeed: true,
    canDeleteNeed: false,
    canVerifyNeed: true,
    canViewVolunteers: true,
    canEditVolunteer: false,
    canDeleteVolunteer: false,
    canRateVolunteer: true,
    canViewMatching: true,
    canConfirmMatch: true,
    canViewTasks: true,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canAssignVolunteer: true,
    canStartTask: true,
    canCompleteTask: true,
    canViewSurvey: true,
    canSubmitSurvey: true,
    canVerifySurvey: true,
    canDeleteSurvey: false,
    canViewAnalytics: true,
    canAccessAll: false,
  },
  'field-worker': {
    label: 'Field Worker',
    canViewDashboard: true,
    canViewNeeds: true,
    canCreateNeed: true,
    canEditNeed: false,
    canDeleteNeed: false,
    canVerifyNeed: false,
    canViewVolunteers: true,
    canEditVolunteer: false,
    canDeleteVolunteer: false,
    canRateVolunteer: false,
    canViewMatching: true,
    canConfirmMatch: false,
    canViewTasks: true,
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canAssignVolunteer: false,
    canStartTask: false,
    canCompleteTask: false,
    canViewSurvey: true,
    canSubmitSurvey: true,
    canVerifySurvey: false,
    canDeleteSurvey: false,
    canViewAnalytics: true,
    canAccessAll: false,
  },
  volunteer: {
    label: 'Volunteer',
    canViewDashboard: true,
    canViewNeeds: true,
    canCreateNeed: false,
    canEditNeed: false,
    canDeleteNeed: false,
    canVerifyNeed: false,
    canViewVolunteers: true,
    canEditVolunteer: false,
    canDeleteVolunteer: false,
    canRateVolunteer: false,
    canViewMatching: true,
    canConfirmMatch: false,
    canViewTasks: true,
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canAssignVolunteer: false,
    canStartTask: false,
    canCompleteTask: false,
    canViewSurvey: true,
    canSubmitSurvey: true,
    canVerifySurvey: false,
    canDeleteSurvey: false,
    canViewAnalytics: true,
    canAccessAll: false,
  },
  viewer: {
    label: 'Viewer',
    canViewDashboard: true,
    canViewNeeds: true,
    canCreateNeed: false,
    canEditNeed: false,
    canDeleteNeed: false,
    canVerifyNeed: false,
    canViewVolunteers: true,
    canEditVolunteer: false,
    canDeleteVolunteer: false,
    canRateVolunteer: false,
    canViewMatching: true,
    canConfirmMatch: false,
    canViewTasks: true,
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canAssignVolunteer: false,
    canStartTask: false,
    canCompleteTask: false,
    canViewSurvey: true,
    canSubmitSurvey: false,
    canVerifySurvey: false,
    canDeleteSurvey: false,
    canViewAnalytics: true,
    canAccessAll: false,
  },
};

// Demo accounts
const DEMO_USERS = {
  'admin@CommunityPulse.org': { _id: 'u1', name: 'Admin User', email: 'admin@CommunityPulse.org', password: 'admin123', role: 'admin', avatar: '👑', organization: 'CommunityPulse HQ' },
  'sarah@CommunityPulse.org': { _id: 'u2', name: 'Sarah Coordinator', email: 'sarah@CommunityPulse.org', password: 'password123', role: 'coordinator', avatar: '👩‍💼', organization: 'Community Aid NGO' },
  'raj@CommunityPulse.org': { _id: 'u3', name: 'Raj Field Worker', email: 'raj@CommunityPulse.org', password: 'password123', role: 'field-worker', avatar: '👷', organization: 'Field Operations Team' },
  'volunteer@example.com': { _id: 'u4', name: 'Test Volunteer', email: 'volunteer@example.com', password: 'password123', role: 'volunteer', avatar: '🙋', organization: 'General Volunteers' },
};

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState(false);
  const [authView, setAuthView] = useState('landing');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Derive permissions from user role — this is the SINGLE SOURCE OF TRUTH
  const perms = user ? (ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.viewer) : ROLE_PERMISSIONS.viewer;

  useEffect(() => {
    const init = async () => {
      try { setBackendStatus((await checkBackendHealth()).connected); } catch { setBackendStatus(false); }
      const stored = localStorage.getItem('CommunityPulse_user');
      if (stored) { setUser(JSON.parse(stored)); setAuthView('authenticated'); }
      else { setAuthView('landing'); }
      setAuthLoading(false);
    };
    init();
    const iv = setInterval(async () => {
      try { setBackendStatus((await checkBackendHealth()).connected); } catch { setBackendStatus(false); }
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  const doLogin = async (email, pw) => {
    if (backendStatus) {
      try { const { authAPI } = await import('./services/api'); const d = await authAPI.login(email, pw); localStorage.setItem('CommunityPulse_token', d.token); localStorage.setItem('CommunityPulse_user', JSON.stringify(d.user)); setUser(d.user); setAuthView('authenticated'); setActiveSection('dashboard'); return; } catch {}
    }
    const demo = DEMO_USERS[email.toLowerCase()];
    if (demo && demo.password === pw) {
      const u = { _id: demo._id, name: demo.name, email: demo.email, role: demo.role, avatar: demo.avatar, organization: demo.organization };
      localStorage.setItem('CommunityPulse_user', JSON.stringify(u));
      setUser(u); setAuthView('authenticated'); setActiveSection('dashboard');
    } else { throw new Error('Invalid credentials. Try a demo account.'); }
  };

  const doRegister = async (data) => {
    if (backendStatus) {
      try { const { authAPI } = await import('./services/api'); const d = await authAPI.register(data); localStorage.setItem('CommunityPulse_token', d.token); localStorage.setItem('CommunityPulse_user', JSON.stringify(d.user)); setUser(d.user); setAuthView('authenticated'); setActiveSection('dashboard'); return; } catch (e) { throw new Error(e.message); }
    }
    const u = { _id: 'u' + Date.now(), name: data.name, email: data.email, role: data.role || 'viewer', avatar: '👤', organization: data.organization || '' };
    localStorage.setItem('CommunityPulse_user', JSON.stringify(u)); setUser(u); setAuthView('authenticated'); setActiveSection('dashboard');
  };

  const doLogout = () => { localStorage.removeItem('CommunityPulse_token'); localStorage.removeItem('CommunityPulse_user'); setUser(null); setAuthView('landing'); };

  const go = (s) => { setActiveSection(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (authLoading) return <LoadingScreen />;

  if (authView === 'landing') return <LandingPage onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} />;
  if (authView === 'login') return <Login onLogin={doLogin} onSwitchToRegister={() => setAuthView('register')} onBack={() => setAuthView('landing')} />;
  if (authView === 'register') return <Register onRegister={doRegister} onSwitchToLogin={() => setAuthView('login')} onBack={() => setAuthView('landing')} />;

  // AUTHENTICATED — render with permissions
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard onNavigate={go} permissions={perms} />;
      case 'needs': return <CommunityNeeds onNavigate={go} permissions={perms} />;
      case 'volunteers': return <VolunteerDirectory onNavigate={go} permissions={perms} />;
      case 'matching': return <SmartMatching permissions={perms} />;
      case 'tasks': return <TaskBoard permissions={perms} />;
      case 'survey': return <SurveyForm permissions={perms} />;
      case 'analytics': return <Analytics permissions={perms} />;
      default: return <Dashboard onNavigate={go} permissions={perms} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar activeSection={activeSection} onNavigate={go} backendStatus={backendStatus} user={user} onLogout={doLogout} perms={perms} />
      <main className="pt-16">
        <div className={`text-center py-1.5 text-[11px] font-medium ${backendStatus ? 'bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border-b border-yellow-500/20'}`}>
          {backendStatus ? `✅ Backend — ${user.name} (${perms.label})` : `⚡ Demo — ${user.name} (${perms.label})`}
        </div>
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}

function LoadingScreen() {
  return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-center"><div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto mb-4 animate-pulse"><span className="text-white text-2xl">🤝</span></div><p className="text-gray-400 text-sm">Loading CommunityPulse...</p></div></div>;
}
