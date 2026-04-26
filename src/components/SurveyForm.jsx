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
    <section className="py-12 bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📝</span>
              <h2 className="text-3xl font-heading font-bold text-slate-dark tracking-tight">Field Intelligence</h2>
            </div>
            <p className="text-slate-dark/40 text-sm font-medium italic">
              {canSubmit ? 'Capture and validate real-time community needs.' : 'Monitor verified field reports and survey data.'}
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
          {canSubmit && (
            <TabButton 
              active={activeTab === 'form'} 
              onClick={() => setActiveTab('form')}
              label="New Intelligence"
              icon="✍️"
            />
          )}
          <TabButton 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')}
            label={`All Reports (${allReports.length})`}
            icon="📊"
          />
          <TabButton 
            active={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')}
            label={`Awaiting Review (${allReports.filter(r => !r.verified).length})`}
            icon="⏳"
          />
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500">
          {activeTab === 'form' && canSubmit && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              {submitted ? (
                <div className="bg-white rounded-[3rem] border border-primary/10 p-16 text-center shadow-soft">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">✅</div>
                  <h3 className="text-2xl font-bold text-slate-dark mb-3">Report Transmitted</h3>
                  <p className="text-slate-dark/40 font-medium">Validation complete. Intelligence added to regional queue.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-white p-8 md:p-12 shadow-soft space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field label="Agent Identifier" required>
                      <input type="text" required value={formData.submittedBy} onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })} placeholder="Worker Name / ID" className="input-field-refined" />
                    </Field>
                    <Field label="Target Location" required>
                      <input type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="District or Sector" className="input-field-refined" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field label="Intelligence Category" required>
                      <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field-refined">
                        <option value="">Choose category</option>
                        {['healthcare', 'education', 'food', 'shelter', 'environment', 'elderly', 'youth', 'disaster'].map(c => <option key={c} value={c}>{getCategoryIcon(c)} {c.toUpperCase()}</option>)}
                      </select>
                    </Field>
                    <Field label="Urgency Protocol" required>
                      <select required value={formData.urgency} onChange={(e) => setFormData({ ...formData, urgency: e.target.value })} className="input-field-refined">
                        <option value="">Select priority</option>
                        <option value="critical">🔴 CRITICAL</option>
                        <option value="high">🟠 HIGH</option>
                        <option value="medium">🟡 MEDIUM</option>
                        <option value="low">🟢 LOW</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Estimated Affected Population">
                    <input type="number" value={formData.affectedCount} onChange={(e) => setFormData({ ...formData, affectedCount: e.target.value })} placeholder="Numerical estimate" className="input-field-refined" />
                  </Field>

                  <Field label="Detailed Intelligence Log" required>
                    <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Provide context, specific requirements, and field observations..." className="input-field-refined resize-none" />
                  </Field>

                  <button type="submit" className="btn-primary w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">
                    Finalize & Submit Report
                  </button>
                </form>
              )}
            </div>
          )}

          {(activeTab === 'reports' || activeTab === 'pending') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {(activeTab === 'reports' ? allReports : allReports.filter(r => !r.verified)).map(entry => (
                <ReportCard 
                  key={entry._id} 
                  entry={entry} 
                  canVerify={canVerify} 
                  canDelete={canDelete} 
                  onVerify={handleVerify} 
                  onDelete={handleDelete} 
                  highlight={activeTab === 'pending'} 
                />
              ))}
              
              {activeTab === 'pending' && allReports.filter(r => !r.verified).length === 0 && (
                <div className="col-span-full py-32 text-center bg-white/50 rounded-[3rem] border border-dashed border-slate-dark/10">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-slate-dark/30 uppercase tracking-widest">All Clear</h3>
                  <p className="text-slate-dark/20 text-sm">Every field report has been successfully verified.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* Helper Components for Refined UI */

function TabButton({ active, onClick, label, icon }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
        active 
        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
        : 'bg-white text-slate-dark/40 border border-primary/5 hover:border-primary/20 hover:text-slate-dark'
      }`}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

function Field({ label, children, required }) {
  return (
    <div className="space-y-2">
      <label className="text-slate-dark/60 text-[10px] font-black uppercase tracking-widest ml-1">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function ReportCard({ entry, canVerify, canDelete, onVerify, onDelete, highlight }) {
  return (
    <div className={`group bg-white rounded-[2rem] border p-7 transition-all duration-300 hover:shadow-soft ${highlight ? 'ring-2 ring-primary ring-offset-4 ring-offset-surface' : 'border-white shadow-sm hover:border-primary/20'}`}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-primary/5">
          {getCategoryIcon(entry.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-slate-dark font-bold text-base truncate">{entry.location}</h4>
            {entry.verified ? (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-tighter">Verified</span>
            ) : (
              <span className="px-3 py-1 bg-amber-50 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-tighter animate-pulse">Pending</span>
            )}
          </div>
          <p className="text-slate-dark/30 text-[10px] font-bold uppercase tracking-tight italic">
            By {entry.submittedBy} • {new Date(entry.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <p className="text-slate-dark/60 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
        {entry.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getCategoryBg(entry.category)}`}>
          {entry.category}
        </span>
        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getUrgencyColor(entry.urgency)}`}>
          {entry.urgency}
        </span>
        <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-dark text-white">
          👥 {Number(entry.affectedCount).toLocaleString()} IMPACTED
        </span>
      </div>

      <div className="flex gap-3">
        {!entry.verified && canVerify && (
          <button 
            onClick={() => onVerify(entry._id)}
            className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-md shadow-primary/10"
          >
            Authorize Report
          </button>
        )}
        {canDelete && (
          <button 
            onClick={() => onDelete(entry._id)}
            className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-100 transition-colors"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}