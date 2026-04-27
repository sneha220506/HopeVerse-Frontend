import { useState } from 'react';

export default function Login({ onLogin, onSwitchToRegister, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
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

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await onLogin(demoEmail, demoPassword);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Premium Visual Styles */}
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
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.05);
        }
        
        .input-group:focus-within label {
          color: #6366f1;
          transform: translateX(4px);
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}} />

      {/* Dynamic Background */}
      <div className="absolute top-[-10%] right-[-5%] w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-secondary/5 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}} />

      <div className="relative z-10 w-full max-w-md">
        {/* Back Navigation */}
        {onBack && (
          <button 
            onClick={onBack} 
            className="group flex items-center gap-3 text-slate-dark/40 hover:text-primary text-[11px] font-black uppercase tracking-[0.2em] mb-10 transition-all animate-reveal"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Back to Home
          </button>
        )}

        {/* Branding */}
        <div className="text-center mb-10 animate-reveal stagger-1">
          <div className="w-20 h-20 bg-hero-grad rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20 mx-auto mb-6 transform hover:rotate-12 transition-all duration-500 cursor-pointer">
            <span className="text-white text-4xl">🤝</span>
          </div>
          <h1 className="text-4xl font-heading font-black text-slate-dark tracking-tighter">
            System <span className="text-primary">Login</span>
          </h1>
          <p className="text-slate-dark/40 text-base font-semibold mt-3">Access the coordination hub</p>
        </div>

        {/* Auth Box */}
        <div className="auth-card rounded-[3.5rem] p-10 md:p-12 animate-reveal stagger-2">
          {error && (
            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[1.5rem] animate-shake">
              <p className="text-rose-500 text-[11px] font-black text-center uppercase tracking-wider leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="input-group animate-reveal stagger-3">
              <label className="text-slate-dark-100 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-2 transition-all">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-dark/20 group-focus-within:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@communitypulse.org"
                  className="w-full bg-white border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-4 text-[15px] font-semibold text-slate-dark placeholder-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="input-group animate-reveal stagger-4">
              <label className="text-slate-dark-100 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ml-2 transition-all">Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-dark/20 group-focus-within:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-slate-50 rounded-2xl pl-14 pr-14 py-4 text-[15px] font-semibold text-slate-dark placeholder-slate-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-dark/20 hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-white rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1.5 active:scale-95 flex items-center justify-center gap-4 transition-all duration-300 animate-reveal stagger-5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In Now'
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-100 text-center animate-reveal" style={{animationDelay: '0.6s'}}>
            <p className="text-slate-dark/40 text-sm font-bold">
              New to the platform?{' '}
              <button 
                onClick={onSwitchToRegister} 
                className="text-primary hover:text-primary-dark font-black underline underline-offset-8 decoration-2 transition-all ml-1"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Demo Fast-Track Boxes */}
        <div className="mt-12 animate-reveal" style={{animationDelay: '0.7s'}}>
          <p className="text-[10px] font-black text-black-100 uppercase tracking-[0.4em] mb-6 text-center">Protocol Review Access</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { email: 'admin@CommunityPulse.org', pass: 'admin123', label: 'Admin', icon: '👑', color: 'hover:border-accent' },
              { email: 'sarah@CommunityPulse.org', pass: 'password123', label: 'Coord', icon: '👩‍💼', color: 'hover:border-primary' },
              { email: 'raj@CommunityPulse.org', pass: 'password123', label: 'Vol', icon: '👷', color: 'hover:border-secondary' },
            ].map((demo) => (
              <button
                key={demo.label}
                onClick={() => handleDemoLogin(demo.email, demo.pass)}
                disabled={loading}
                className={`group flex flex-col items-center gap-3 p-5 bg-white/40 hover:bg-white rounded-[2rem] border-2 border-transparent ${demo.color} transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-2`}
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-500">{demo.icon}</span>
                <span className="text-[9px] font-black text-slate-dark/40 uppercase tracking-widest">{demo.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}