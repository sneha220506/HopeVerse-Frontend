import React, { useState, useEffect } from 'react';
import { volunteersAPI } from "../services/api";

const VolunteerModal = ({ vol, onClose, onNavigate, onDelete, isAdmin, onNext, onPrev }) => {
  if (!vol) return null;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* Side Navigation Buttons */}
      <div className="absolute inset-x-4 md:inset-x-10 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[160]">
        <button 
          onClick={onPrev}
          className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 hover:bg-white backdrop-blur-md border border-white/20 text-white hover:text-primary shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
        >
          <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={onNext}
          className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 hover:bg-white backdrop-blur-md border border-white/20 text-white hover:text-primary shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
        >
          <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div 
        key={vol._id} 
        className="relative bg-white w-full max-w-xl rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button 
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all z-20 shadow-sm"
        >
          <span className="text-xl">✕</span>
        </button>

        <div className="p-12 sm:p-16">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-6xl text-white shadow-2xl shadow-primary/20 transform hover:rotate-6 transition-transform duration-500">
                {vol.avatar || "👤"}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-slate-50">
                <span className="text-lg">🛡️</span>
              </div>
            </div>
            
            <h3 className="text-4xl font-black text-slate-dark tracking-tighter mb-3">{vol.name}</h3>
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${vol.status === 'active' ? 'bg-success animate-pulse' : 'bg-amber-400'}`} />
              <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                {vol.status} Operator • {vol.region}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-12">
            {[
              { label: "Mission Acts", val: vol.tasksCompleted, icon: "🌱", color: "text-emerald-500" },
              { label: "Community Rating", val: vol.rating, icon: "✨", color: "text-amber-500" },
              { label: "Engagement", val: `${vol.hoursLogged}h`, icon: "⏳", color: "text-blue-500" },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-50/50 rounded-[2.5rem] p-6 text-center border border-slate-100 hover:bg-white transition-colors group">
                <div className={`text-2xl font-black tracking-tight mb-2 ${stat.color}`}>{stat.val}</div>
                <div className="text-[9px] text-slate-dark/30 uppercase font-black tracking-widest leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-6 mb-12">
            <div className="bg-slate-50/50 rounded-[3rem] p-8 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-lg">📅</span>
                <h4 className="text-[10px] font-black text-slate-dark uppercase tracking-[0.2em]">Deployment Schedule</h4>
              </div>
              <div className="flex justify-between gap-2">
                {days.map(day => (
                  <div key={day} className={`flex-1 text-center py-3 rounded-xl text-[10px] font-black transition-all ${vol.schedule?.[day] ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-200 border border-slate-100'}`}>
                    {day.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-slate-dark uppercase tracking-widest">Digital Address</span>
                <span className="text-sm font-bold text-slate-dark">{vol.email}</span>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-slate-dark uppercase tracking-widest">Comm Link</span>
                <span className="text-sm font-bold text-slate-dark">{vol.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => { onNavigate("matching"); onClose(); }}
              className="w-full py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
            >
              Initialize Smart Matching
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm(`Permanently remove ${vol.name} from the network?`)) {
                    onDelete(vol._id);
                    onClose();
                  }
                }}
                className="w-full py-4 border-2 border-rose-100 text-rose-500 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-rose-50 hover:border-rose-200 transition-all mt-2 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Volunteer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VolunteerDirectory({ onNavigate, permissions }) {
  const p=permissions || {};
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVol, setSelectedVol] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isAdmin = p.label === 'Administrator';

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await volunteersAPI.getAll();
        setVolunteers(res.data || res);
      } catch (err) {
        console.error("Critical: Volunteer sync failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await volunteersAPI.delete(id);
      setVolunteers(prev => prev.filter(v => v._id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert("Unauthorized or network error. Record remains.");
    }
  };

  const filtered = volunteers.filter((vol) => 
    vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vol.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const navigateProfile = (direction) => {
    if (!selectedVol) return;
    const currentIndex = filtered.findIndex(v => v._id === selectedVol._id);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % filtered.length;
    } else {
      nextIndex = (currentIndex - 1 + filtered.length) % filtered.length;
    }
    setSelectedVol(filtered[nextIndex]);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="w-16 h-16 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <section className="py-24 bg-[#F8FAFC] min-h-screen relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .vol-card { animation: fadeSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-24">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h2 className="text-6xl font-heading font-black text-slate-dark tracking-tighter">
              The <span className="text-primary/70">Collective</span>
            </h2>
            <p className="text-black font-bold text-lg mt-4 max-w-md">
              Secure oversight of {volunteers.length} active community pillars.
            </p>
            {isAdmin && (
              <div className="inline-flex items-center gap-3 mt-6 px-6 py-2.5 bg-rose-50 border-2 border-rose-100 rounded-[1.5rem] shadow-xl shadow-rose-500/5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                  Administrative Deletion Protocol Active
                </span>
              </div>
            )}
          </div>

          <div className="relative w-full md:w-[450px] animate-in fade-in slide-in-from-right duration-700">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search by specialty, name, or skill..."
              className="w-full bg-white border-2 border-slate-50 rounded-[2rem] pl-16 pr-8 py-6 text-base font-bold shadow-xl shadow-slate-200/50 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder-slate-300"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((vol, idx) => {
            const isArmed = confirmDeleteId === vol._id;
            return (
              <div
                key={vol._id}
                onClick={() => {
                  if (confirmDeleteId) { setConfirmDeleteId(null); return; }
                  setSelectedVol(vol);
                }}
                style={{ animationDelay: `${idx * 0.05}s` }}
                className={`vol-card group relative bg-white rounded-[3.5rem] p-12 border-2 transition-all duration-500 cursor-pointer flex flex-col items-center overflow-hidden ${
                   isArmed ? 'border-rose-400 shadow-2xl shadow-rose-100' : 'border-transparent shadow-soft hover:shadow-2xl hover:-translate-y-3'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isArmed) { handleDelete(vol._id); } else { setConfirmDeleteId(vol._id); }
                    }}
                    className={`absolute top-8 right-8 z-20 flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isArmed ? 'bg-rose-500 text-white shadow-xl shadow-rose-200 scale-110' : 'bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-100/50'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {/* ONLY SHOW CONFIRM TEXT WHEN ARMED, OTHERWISE JUST THE ICON */}
                    <span>{isArmed ? 'Confirm?' : ''}</span>
                  </button>
                )}
                <div className="relative mb-8">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                     {vol.avatar || "👤"}
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-4 border-white ${vol.status === 'active' ? 'bg-success' : 'bg-amber-400'}`} />
                </div>
                <h4 className="text-3xl font-black text-slate-dark mb-2 tracking-tighter text-center">{vol.name}</h4>
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10">{vol.region}</p>
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  {vol.skills.slice(0, 2).map((skill) => (
                    <span key={skill} className="px-5 py-2.5 bg-slate-50 text-slate-dark/50 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 group-hover:bg-white transition-colors">
                      {skill}
                    </span>
                  ))}
                  {vol.skills.length > 2 && <span className="px-4 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">+{vol.skills.length - 2}</span>}
                </div>
                <div className="mt-auto w-full pt-8 border-t border-slate-50 flex justify-between items-center group-hover:border-primary/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-xl">★</span>
                    <span className="text-[11px] font-black text-slate-dark tracking-widest uppercase">{vol.rating}</span>
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Full Identity Profile</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedVol && (
        <VolunteerModal 
          vol={selectedVol} 
          isAdmin={isAdmin}
          onClose={() => setSelectedVol(null)} 
          onNavigate={onNavigate}
          onDelete={handleDelete}
          onNext={() => navigateProfile('next')}
          onPrev={() => navigateProfile('prev')}
        />
      )}
    </section>
  );
}