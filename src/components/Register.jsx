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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-lg">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Home
          </button>
        )}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto mb-4">
            <span className="text-white text-2xl">🤝</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Your <span className="text-emerald-400">Account</span></h1>
          <p className="text-gray-400 text-sm mt-1">Join CommunityPulse and start making a difference</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="John Doe"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="john@email.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">Password *</label>
                <input type="password" required value={formData.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Min 6 characters"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">Confirm Password *</label>
                <input type="password" required value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="Re-enter password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">Role</label>
                <select value={formData.role} onChange={(e) => updateField('role', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-emerald-500">
                  <option value="viewer">Viewer</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="field-worker">Field Worker</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1.5 block">Organization</label>
                <input type="text" value={formData.organization} onChange={(e) => updateField('organization', e.target.value)} placeholder="Optional"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm font-medium mb-1.5 block">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Optional"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (<><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating Account...</>) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
