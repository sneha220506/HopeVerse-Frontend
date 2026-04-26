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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-15%] left-[-5%] w-[45rem] h-[45rem] bg-secondary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] bg-primary/5 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        {/* Navigation */}
        {onBack && (
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 text-slate-dark/30 hover:text-primary text-[10px] font-black uppercase tracking-widest mb-8 transition-all"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-hero-grad rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20 mx-auto mb-6 transform hover:rotate-6 transition-transform">
            <span className="text-white text-3xl">🤝</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-slate-dark tracking-tight">
            Join <span className="text-primary">CommunityPulse</span>
          </h1>
          <p className="text-slate-dark/40 text-sm font-medium mt-2">Start coordinating impact and driving community change</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white p-8 md:p-12 shadow-soft">
          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-shake text-center">
              <p className="text-rose-500 text-xs font-black uppercase tracking-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest ml-1">Full Name *</label>
                <input 
                  type="text" required 
                  value={formData.name} 
                  onChange={(e) => updateField('name', e.target.value)} 
                  placeholder="John Doe"
                  className="input-field-refined" 
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest ml-1">Email *</label>
                <input 
                  type="email" required 
                  value={formData.email} 
                  onChange={(e) => updateField('email', e.target.value)} 
                  placeholder="john@email.com"
                  className="input-field-refined" 
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest ml-1">Password *</label>
                <input 
                  type="password" required 
                  value={formData.password} 
                  onChange={(e) => updateField('password', e.target.value)} 
                  placeholder="••••••••"
                  className="input-field-refined" 
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest ml-1">Confirm Password *</label>
                <input 
                  type="password" required 
                  value={formData.confirmPassword} 
                  onChange={(e) => updateField('confirmPassword', e.target.value)} 
                  placeholder="••••••••"
                  className="input-field-refined" 
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest ml-1">Your Role</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => updateField('role', e.target.value)}
                  className="input-field-refined appearance-none bg-no-repeat bg-right"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236366f1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.5rem', backgroundPosition: 'right 1rem center' }}
                >
                  <option value="viewer">Viewer</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="field-worker">Field Worker</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest ml-1">Organization</label>
                <input 
                  type="text" 
                  value={formData.organization} 
                  onChange={(e) => updateField('organization', e.target.value)} 
                  placeholder="Optional"
                  className="input-field-refined" 
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest ml-1">Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone} 
                onChange={(e) => updateField('phone', e.target.value)} 
                placeholder="+1 (555) 000-0000 (Optional)"
                className="input-field-refined" 
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-4 text-sm uppercase tracking-widest font-black shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Initializing Account...
                  </>
                ) : (
                  'Create My Account'
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-10 pt-8 border-t border-primary/5 text-center">
            <p className="text-slate-dark/40 text-xs font-medium">
              Already have an account?{' '}
              <button 
                onClick={onSwitchToLogin} 
                className="text-primary hover:text-primary-dark font-black uppercase tracking-tight transition-colors"
              >
                Sign In Instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}