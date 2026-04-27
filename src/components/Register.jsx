import { useState } from 'react';

export default function Register({ onRegister, onSwitchToLogin, onBack }) {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'viewer', organization: '', phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await onRegister({
        name: formData.name, email: formData.email, password: formData.password,
        role: formData.role, organization: formData.organization, phone: formData.phone
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => setFormData({ ...formData, [field]: value });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Enhanced CSS Effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        
        .input-field-refined {
          width: 100%;
          background: white;
          border: 2px solid #F1F5F9;
          padding: 0.875rem 1.25rem;
          border-radius: 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s ease;
          color: #1E293B;
        }
        .input-field-refined:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          transform: translateY(-2px);
        }
        .input-box {
          transition: all 0.3s ease;
        }
        .input-box:focus-within label {
          color: #6366f1;
        }
      `}} />

      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-secondary/5 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}} />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Navigation */}
        {onBack && (
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 text-slate-dark/40 hover:text-primary text-[11px] font-black uppercase tracking-[0.2em] mb-10 transition-all animate-slide-up"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Back to Home
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="w-20 h-20 bg-hero-grad rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 mx-auto mb-6 transform hover:rotate-12 transition-all duration-500 cursor-pointer">
            <span className="text-white text-4xl">🤝</span>
          </div>
          <h1 className="text-4xl font-heading font-black text-slate-dark tracking-tight">
            Create <span className="text-primary">Account</span>
          </h1>
          <p className="text-slate-dark/40 text-base font-semibold mt-3">Join the network of community coordination</p>
        </div>

        {/* Main Card (The Box) */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[3.5rem] border border-white p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] animate-slide-up stagger-1">
          {error && (
            <div className="mb-10 p-5 bg-rose-50 border border-rose-100 rounded-[1.5rem] animate-bounce text-center">
              <p className="text-rose-500 text-[11px] font-black uppercase tracking-wider">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name Box */}
              <div className="space-y-3 input-box animate-slide-up stagger-2">
                <label className="text-slate-dark/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Full Name</label>
                <input 
                  type="text" required 
                  value={formData.name} 
                  onChange={(e) => updateField('name', e.target.value)} 
                  placeholder="John Doe"
                  className="input-field-refined" 
                />
              </div>

              {/* Email Box */}
              <div className="space-y-3 input-box animate-slide-up stagger-2">
                <label className="text-slate-dark/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Email Address</label>
                <input 
                  type="email" required 
                  value={formData.email} 
                  onChange={(e) => updateField('email', e.target.value)} 
                  placeholder="john@example.com"
                  className="input-field-refined" 
                />
              </div>

              {/* Password Box */}
              <div className="space-y-3 input-box animate-slide-up stagger-3">
                <label className="text-slate-dark/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Password</label>
                <input 
                  type="password" required 
                  value={formData.password} 
                  onChange={(e) => updateField('password', e.target.value)} 
                  placeholder="••••••••"
                  className="input-field-refined" 
                />
              </div>

              {/* Confirm Password Box */}
              <div className="space-y-3 input-box animate-slide-up stagger-3">
                <label className="text-slate-dark/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Confirm Password</label>
                <input 
                  type="password" required 
                  value={formData.confirmPassword} 
                  onChange={(e) => updateField('confirmPassword', e.target.value)} 
                  placeholder="••••••••"
                  className="input-field-refined" 
                />
              </div>

              {/* Role Selection Box */}
              <div className="space-y-3 input-box animate-slide-up stagger-4">
                <label className="text-slate-dark/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Identify As</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => updateField('role', e.target.value)}
                  className="input-field-refined appearance-none bg-no-repeat bg-right"
                  // style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236366f1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.25rem', backgroundPosition: 'right 1rem center' }}
                >
                  <option value="viewer">Viewer</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="volunteer">Field Worker</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>

              {/* Organization Box */}
              <div className="space-y-3 input-box animate-slide-up stagger-4">
                <label className="text-slate-dark/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Organization</label>
                <input 
                  type="text" 
                  value={formData.organization} 
                  onChange={(e) => updateField('organization', e.target.value)} 
                  placeholder="Optional"
                  className="input-field-refined" 
                />
              </div>
            </div>

            {/* Phone Box */}
            <div className="space-y-3 input-box animate-slide-up stagger-4">
              <label className="text-slate-dark/50 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone} 
                onChange={(e) => updateField('phone', e.target.value)} 
                placeholder="+1 (555) 000-0000"
                className="input-field-refined" 
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 animate-slide-up" style={{animationDelay: '0.5s'}}>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-primary text-white rounded-2xl text-xs uppercase tracking-[0.25em] font-black shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1.5 active:scale-95 flex items-center justify-center gap-4 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-12 pt-10 border-t border-slate-100 text-center animate-slide-up" style={{animationDelay: '0.6s'}}>
            <p className="text-slate-dark/40 text-sm font-bold">
              Already a member?{' '}
              <button 
                onClick={onSwitchToLogin} 
                className="text-primary hover:text-primary-dark font-black underline underline-offset-4 decoration-2 transition-colors ml-1"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}