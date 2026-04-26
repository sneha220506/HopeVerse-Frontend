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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
      {/* Refined Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-secondary/5 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Back Navigation */}
        {onBack && (
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 text-slate-dark/40 hover:text-primary text-[10px] font-black uppercase tracking-widest mb-8 transition-all"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        )}

        {/* Branding Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-hero-grad rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20 mx-auto mb-6 transform hover:scale-110 transition-transform">
            <span className="text-white text-3xl">🤝</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-slate-dark tracking-tight">
            Welcome to <span className="text-primary">CommunityPulse</span>
          </h1>
          <p className="text-slate-dark/40 text-sm font-medium mt-2">Enter your credentials to access the hub</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white p-10 shadow-soft">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-shake">
              <p className="text-rose-500 text-xs font-bold text-center uppercase tracking-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-dark/20 group-focus-within:text-primary transition-colors">
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
                  className="w-full bg-surface border border-primary/5 rounded-[1.25rem] pl-12 pr-4 py-4 text-sm text-slate-dark placeholder-slate-dark/20 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest mb-2 block ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-dark/20 group-focus-within:text-primary transition-colors">
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
                  className="w-full bg-surface border border-primary/5 rounded-[1.25rem] pl-12 pr-12 py-4 text-sm text-slate-dark placeholder-slate-dark/20 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-dark/20 hover:text-slate-dark transition-colors"
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
              className="btn-primary w-full py-4 text-sm uppercase tracking-widest font-black shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In Now'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-primary/5 text-center">
            <p className="text-slate-dark/40 text-xs font-medium">
              New to the platform?{' '}
              <button 
                onClick={onSwitchToRegister} 
                className="text-primary hover:text-primary-dark font-black uppercase tracking-tight transition-colors"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Demo Quick-Access */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-slate-dark/20 uppercase tracking-[0.2em] mb-4">Quick Access for Review</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { email: 'admin@CommunityPulse.org', pass: 'admin123', label: 'Admin', icon: '👑' },
              { email: 'sarah@CommunityPulse.org', pass: 'password123', label: 'Coord', icon: '👩‍💼' },
              { email: 'raj@CommunityPulse.org', pass: 'password123', label: 'Field', icon: '👷' },
            ].map((demo) => (
              <button
                key={demo.label}
                onClick={() => handleDemoLogin(demo.email, demo.pass)}
                disabled={loading}
                className="group flex flex-col items-center gap-2 p-3 bg-white/40 hover:bg-white rounded-[1.25rem] border border-primary/5 transition-all shadow-sm hover:shadow-md"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{demo.icon}</span>
                <span className="text-[9px] font-black text-slate-dark/40 uppercase tracking-tighter">{demo.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}