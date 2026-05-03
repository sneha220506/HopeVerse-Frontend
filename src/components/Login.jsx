import { useState } from 'react';
import { authAPI } from '../services/api';

export default function AuthContainer({ onLogin, onSwitchToRegister, onBack }) {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setResetSent(true);
    } catch (err) {
      setError('Email not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    onLogin(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }

        .auth-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 25px 50px -12px rgba(142, 124, 195, 0.1);
        }
        
        .forgot-link {
          position: relative;
          transition: all 0.3s ease;
          color: #8E7CC3;
        }
        .forgot-link::after {
          content: '';
          position: absolute;
          width: 0; height: 1.5px; bottom: -2px; left: 0;
          background-color: #8E7CC3;
          transition: width 0.3s ease;
        }
        .forgot-link:hover::after { width: 100%; }

        .role-tooltip {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: #8E7CC3;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .role-btn:hover .role-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `}} />

      <div className="absolute top-[-10%] right-[-5%] w-[50rem] h-[50rem] bg-[#8E7CC3]/5 rounded-full blur-[120px] animate-pulse" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* FIXED: Navigation Button Layout */}
        <div className="fixed top-6 left-6 mb-8 animate-reveal">
            <button 
                onClick={view === 'login' ? onBack : () => { setView('login'); setResetSent(false); }} 
                className="group flex items-center gap-3 text-slate-400 hover:text-[#8E7CC3] text-[11px] font-black uppercase tracking-[0.2em] transition-all"
            >
                <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center group-hover:bg-[#8E7CC3] group-hover:text-white transition-all transform group-active:scale-90">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
                </div>
                <span>{view === 'login' ? 'Back to Home' : 'Back to Login'}</span>
            </button>
        </div>

        <div className="text-center mb-10 animate-reveal stagger-1">
          <div className="w-20 h-20 bg-gradient-to-br from-white to-[#F3F0FF] rounded-[2rem] flex items-center justify-center shadow-xl shadow-[#8E7CC3]/10 mx-auto mb-6 transform hover:rotate-12 transition-all duration-500">
            <span className="text-4xl">{resetSent ? '📩' : '🤝'}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">
            {view === 'login' ? 'System' : 'Reset'} <span className="text-[#8E7CC3]">{view === 'login' ? 'Login' : 'Access'}</span>
          </h1>
          <p className="text-slate-400 text-base font-semibold mt-3 px-4 leading-relaxed">
            {view === 'login' ? 'Access the hub' : resetSent ? 'Check your Gmail inbox' : 'Request a secure reset link'}
          </p>
        </div>

        <div className="auth-card rounded-[3.5rem] p-10 md:p-12 animate-reveal stagger-2">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-[10px] font-black uppercase text-center tracking-widest">{error}</div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-8">
              <div className="input-group">
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-2">Email Address</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@communitypulse.org"
                  className="w-full bg-white border-2 border-slate-50 rounded-2xl px-6 py-4 text-[15px] font-semibold text-slate-700 focus:outline-none focus:border-[#8E7CC3] focus:ring-4 focus:ring-[#8E7CC3]/5 transition-all shadow-sm"
                />
              </div>

              <div className="input-group">
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-slate-50 rounded-2xl px-6 py-4 text-[15px] font-semibold text-slate-700 focus:outline-none focus:border-[#8E7CC3] focus:ring-4 focus:ring-[#8E7CC3]/5 transition-all shadow-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#8E7CC3] transition-colors font-black text-[10px] uppercase">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="flex justify-end mt-4">
                  <button type="button" onClick={() => setView('reset')} className="forgot-link text-[10px] font-black uppercase tracking-widest">Forgot password ?</button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 bg-[#8E7CC3] text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black shadow-xl shadow-[#8E7CC3]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {loading ? 'Authenticating...' : 'Sign In Now'}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              {!resetSent ? (
                <form onSubmit={handleForgotSubmit} className="space-y-8">
                  <div className="input-group">
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-2">Recovery Email</label>
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full bg-white border-2 border-slate-50 rounded-2xl px-6 py-4 text-[15px] font-semibold text-slate-700 focus:outline-none focus:border-[#8E7CC3] transition-all"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-5 bg-[#8E7CC3] text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black shadow-xl shadow-[#8E7CC3]/30 hover:shadow-2xl transition-all">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="py-4 bg-[#8E7CC3]/5 rounded-2xl border border-[#8E7CC3]/10">
                    <p className="text-[#8E7CC3] text-[10px] font-black uppercase tracking-widest leading-relaxed">Reset link sent to:<br/><span className="text-slate-600 lowercase">{email}</span></p>
                  </div>
                  <button onClick={() => setView('login')} className="w-full py-5 bg-[#8E7CC3] text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black shadow-xl transition-all">Back to Login</button>
                </div>
              )}
            </div>
          )}

          {view === 'login' && (
            <div className="mt-12 pt-10 border-t border-slate-100 text-center animate-reveal" style={{animationDelay: '0.6s'}}>
              <p className="text-slate-400 text-sm font-bold">New here? <button onClick={onSwitchToRegister} className="text-[#8E7CC3] font-black underline underline-offset-8 decoration-2 ml-1">Create Account</button></p>
            </div>
          )}
        </div>

        {view === 'login' && (
          <div className="mt-10 animate-reveal" style={{animationDelay: '0.7s'}}>
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6 text-center">Fast-Track Login - For Testing</p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'Admin', icon: '👑', email: 'admin@communitypulse.org' },
                { name: 'Coordinator', icon: '👩‍💼', email: 'sarah@communitypulse.org' },
                { name: 'Volunteer', icon: '👷', email: 'raj@communitypulse.org' },
                { name: 'Viewer', icon: '👁️', email: 'adore@communitypulse.org' }
              ].map((role) => (
                <button 
                  key={role.name} 
                  onClick={() => handleDemoLogin(role.email, 'password123')} 
                  className="role-btn relative p-5 bg-white shadow-sm hover:shadow-xl rounded-2xl border-2 border-transparent hover:border-[#8E7CC3] transition-all duration-500 group"
                >
                  <span className="role-tooltip">{role.name} Role</span>
                  <span className="text-2xl group-hover:scale-125 transition-transform duration-500 inline-block">{role.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}