import { useState } from 'react';
import { surveyEntries } from '../data/mockData';
import { getCategoryIcon, getCategoryBg, getUrgencyColor } from '../utils/helpers';

export default function SurveyForm({ permissions }) {
  const [formData, setFormData] = useState({ submittedBy: '', location: '', category: '', description: '', affectedCount: '', urgency: '' });
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');
  const [allReports, setAllReports] = useState(surveyEntries);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      _id: 's' + Date.now(),
      submittedBy: formData.submittedBy,
      location: formData.location,
      category: formData.category,
      description: formData.description,
      affectedCount: Number(formData.affectedCount) || 0,
      urgency: formData.urgency,
      date: new Date().toISOString(),
      verified: false
    };
    setAllReports(prev => [newReport, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ submittedBy: '', location: '', category: '', description: '', affectedCount: '', urgency: '' });
      setActiveTab('reports');
    }, 2000);
  };

  const handleVerify = (id) => {
    setAllReports(prev => prev.map(r => r._id === id ? { ...r, verified: true } : r));
  };

  const handleDelete = (id) => {
    setAllReports(prev => prev.filter(r => r._id !== id));
  };

  const canSubmit = permissions?.canSubmitSurvey;
  const canVerify = permissions?.canVerifySurvey;
  const canDelete = permissions?.canDeleteSurvey;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">📝 Field Reports & Survey Data</h2>
          <p className="text-gray-400 text-sm mt-1">
            {canSubmit ? 'Submit and review community needs data from field surveys' : 'Review submitted reports from field workers'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {canSubmit && (
            <button onClick={() => setActiveTab('form')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'form' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
              📝 Submit New Report
            </button>
          )}
          <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reports' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
            📊 Reports ({allReports.length})
          </button>
          <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
            ⏳ Pending ({allReports.filter(r => !r.verified).length})
          </button>
        </div>

        {/* Submit Form - Only for roles that can submit */}
        {activeTab === 'form' && canSubmit && (
          <div className="max-w-2xl">
            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-emerald-400 mb-2">Report Submitted Successfully!</h3>
                <p className="text-gray-400">Your field report has been recorded and will be reviewed by the coordination team.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-gray-400 text-sm font-medium mb-1.5 block">Submitted By *</label>
                    <input type="text" required value={formData.submittedBy} onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })} placeholder="e.g., Field Worker - John D."
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500" /></div>
                  <div><label className="text-gray-400 text-sm font-medium mb-1.5 block">Location *</label>
                    <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Riverside District"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-gray-400 text-sm font-medium mb-1.5 block">Category *</label>
                    <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-emerald-500">
                      <option value="">Select category</option>
                      {['healthcare', 'education', 'food', 'shelter', 'environment', 'elderly', 'youth', 'disaster'].map(c => <option key={c} value={c}>{getCategoryIcon(c)} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select></div>
                  <div><label className="text-gray-400 text-sm font-medium mb-1.5 block">Urgency Level *</label>
                    <select required value={formData.urgency} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-emerald-500">
                      <option value="">Select urgency</option>
                      <option value="critical">🔴 Critical</option><option value="high">🟠 High</option>
                      <option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
                    </select></div>
                </div>

                <div><label className="text-gray-400 text-sm font-medium mb-1.5 block">Affected People Count</label>
                  <input type="number" value={formData.affectedCount} onChange={(e) => setFormData({ ...formData, affectedCount: e.target.value })} placeholder="Estimated number"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500" /></div>

                <div><label className="text-gray-400 text-sm font-medium mb-1.5 block">Description *</label>
                  <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the community need in detail..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none" /></div>

                <button type="submit" className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25">
                  Submit Field Report
                </button>
              </form>
            )}
          </div>
        )}

        {/* All Reports */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allReports.map(entry => (
              <ReportCard key={entry._id} entry={entry} canVerify={canVerify} canDelete={canDelete} onVerify={handleVerify} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Pending Verification */}
        {activeTab === 'pending' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allReports.filter(r => !r.verified).map(entry => (
              <ReportCard key={entry._id} entry={entry} canVerify={canVerify} canDelete={canDelete} onVerify={handleVerify} onDelete={handleDelete} highlight />
            ))}
            {allReports.filter(r => !r.verified).length === 0 && (
              <div className="col-span-2 text-center py-16">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-400">All reports have been verified!</p>
              </div>
            )}
          </div>
        )}

        {/* No submit permission message */}
        {activeTab === 'form' && !canSubmit && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🚫</div>
            <p className="text-gray-400">You don't have permission to submit reports.</p>
            <p className="text-gray-500 text-sm mt-1">Contact a coordinator to request access.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ReportCard({ entry, canVerify, canDelete, onVerify, onDelete, highlight }) {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border p-5 transition-all hover:-translate-y-1 ${highlight ? 'border-yellow-500/30' : 'border-gray-700/50 hover:border-gray-600'}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{getCategoryIcon(entry.category)}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-white font-medium text-sm">{entry.location}</h4>
            {entry.verified ? (
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]">✓ Verified</span>
            ) : (
              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] animate-pulse">⏳ Pending</span>
            )}
          </div>
          <p className="text-gray-500 text-xs">By {entry.submittedBy} • {new Date(entry.date).toLocaleDateString()}</p>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-3">{entry.description}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryBg(entry.category)}`}>{entry.category}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getUrgencyColor(entry.urgency)}`}>{entry.urgency}</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-700/50 text-gray-400">👥 {Number(entry.affectedCount).toLocaleString()}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!entry.verified && canVerify && (
          <button onClick={() => onVerify(entry._id)}
            className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors">
            ✓ Verify Report
          </button>
        )}
        {canDelete && (
          <button onClick={() => onDelete(entry._id)}
            className="py-2 px-3 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors">
            🗑️
          </button>
        )}
        {!canVerify && !canDelete && (
          <span className="text-gray-600 text-[10px] py-2">👁️ View only</span>
        )}
      </div>
    </div>
  );
}
