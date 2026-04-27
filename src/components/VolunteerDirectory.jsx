import React, { useState, useEffect } from 'react';
import { volunteersAPI } from "../services/api";

const VolunteerModal = ({ vol, onClose, onNavigate, onDelete, isAdmin }) => {
  if (!vol) return null;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-[#2F2F3A]/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[#F3F0FA] max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-[#FAFAFC] text-[#2F2F3A]/40 hover:text-[#8E7CC3] transition-colors z-10"
        >
          ✕
        </button>

        <div className="p-10 sm:p-14">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-[#8E7CC3] to-[#B8A1E3] flex items-center justify-center text-4xl text-white shadow-xl shadow-purple-50 mb-4">
              {vol.avatar || "👤"}
            </div>
            <h3 className="text-3xl font-bold text-[#2F2F3A] tracking-tight">{vol.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${vol.status === 'active' ? 'bg-[#7BC47F]' : 'bg-amber-400'}`} />
              <p className="text-[#8E7CC3] font-black uppercase tracking-[0.2em] text-[9px]">
                {vol.status} Responder • {vol.region}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { label: "Acts", val: vol.tasksCompleted, icon: "🌱" },
              { label: "Rating", val: vol.rating, icon: "✨" },
              { label: "Hours", val: `${vol.hoursLogged}h`, icon: "⏳" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#F3F0FA]/50 rounded-3xl p-5 text-center border border-[#F3F0FA]">
                <div className="text-xl font-bold text-[#2F2F3A]">{stat.val}</div>
                <div className="text-[8px] text-[#2F2F3A]/40 uppercase font-black tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-10">
            <div className="bg-[#FAFAFC] rounded-3xl p-6 border border-[#F3F0FA]">
              <h4 className="text-[9px] font-black text-[#2F2F3A]/30 uppercase tracking-[0.2em] mb-4">Weekly Availability</h4>
              <div className="flex justify-between gap-1">
                {days.map(day => (
                  <div key={day} className={`flex-1 text-center py-2 rounded-xl text-[9px] font-bold transition-colors ${vol.schedule?.[day] ? 'bg-[#8E7CC3] text-white' : 'bg-white text-slate-200 border border-[#F3F0FA]'}`}>
                    {day.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAFAFC] rounded-3xl p-6 border border-[#F3F0FA] space-y-3">
              <div className="flex justify-between">
                <span className="text-[9px] font-black text-[#2F2F3A]/30 uppercase">Email</span>
                <span className="text-xs font-bold text-[#2F2F3A]">{vol.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] font-black text-[#2F2F3A]/30 uppercase">Phone</span>
                <span className="text-xs font-bold text-[#2F2F3A]">{vol.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { onNavigate("matching"); onClose(); }}
              className="w-full py-5 bg-[#8E7CC3] text-white rounded-2xl font-bold uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-purple-100 hover:bg-[#7160A1] transition-all"
            >
              Propose Collaboration
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm(`Permanently remove ${vol.name} from the network?`)) {
                    onDelete(vol._id);
                    onClose();
                  }
                }}
                className="w-full py-4 border border-rose-100 text-rose-400 rounded-2xl font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-rose-50 transition-all mt-2"
              >
                Delete Volunteer Record
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
  // Track which card is in "confirm delete" armed state
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFC]">
      <div className="w-12 h-12 border-4 border-[#8E7CC3]/20 border-t-[#8E7CC3] rounded-full animate-spin" />
    </div>
  );

  return (
    <section className="py-20 bg-[#FAFAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <h2 className="text-5xl font-bold text-[#2F2F3A] tracking-tight">
              Our <span className="text-[#8E7CC3]">Collective</span>
            </h2>
            <p className="text-[#2F2F3A]/40 font-medium mt-4">
              Authorized view of {volunteers.length} community pillars.
            </p>
            {/* Admin indicator badge */}
            {isAdmin && (
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-rose-50 border border-rose-100 rounded-2xl">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
                  Admin — Delete controls active
                </span>
              </div>
            )}
          </div>
          <div className="relative w-full md:w-[400px]">
            <input
              type="text"
              placeholder="Search by name or specialty..."
              className="w-full bg-white border border-[#F3F0FA] rounded-3xl px-8 py-5 text-sm shadow-sm focus:ring-4 focus:ring-[#8E7CC3]/5 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((vol) => {
            const isArmed = confirmDeleteId === vol._id;

            return (
              <div
                key={vol._id}
                onClick={() => {
                  // If a delete button is armed, clicking card bg disarms it
                  if (confirmDeleteId) {
                    setConfirmDeleteId(null);
                    return;
                  }
                  setSelectedVol(vol);
                }}
                className="group relative bg-white rounded-[3rem] p-10 border border-transparent shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col items-center"
              >
                {/* ── ADMIN DELETE BUTTON ──
                    Always visible to admin (no opacity hiding).
                    Two-step: first click arms it, second confirms deletion. */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      // Stop card click (modal open) from firing
                      e.stopPropagation();
                      if (isArmed) {
                        // Second click — execute delete
                        handleDelete(vol._id);
                      } else {
                        // First click — arm the button
                        setConfirmDeleteId(vol._id);
                      }
                    }}
                    title={isArmed ? "Click again to confirm" : "Delete volunteer"}
                    className={`
                      absolute top-6 right-6 z-10
                      flex items-center gap-2
                      px-4 py-2.5 rounded-2xl
                      text-[10px] font-black uppercase tracking-widest
                      border-2 transition-all duration-200
                      ${isArmed
                        // Armed state — bold red, impossible to miss
                        ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200 scale-105'
                        // Default state — clearly visible but not alarming
                        : 'bg-rose-50 border-rose-200 text-rose-400 hover:bg-rose-500 hover:border-rose-500 hover:text-white hover:scale-105'
                      }
                    `}
                  >
                    {/* Trash icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {/* Label flips on arm */}
                    <span>{isArmed ? 'Confirm?' : 'Delete'}</span>
                  </button>
                )}

                <div className="w-20 h-20 rounded-[2rem] bg-[#FAFAFC] border border-[#F3F0FA] flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
                  {vol.avatar || "👤"}
                </div>
                
                <h4 className="text-2xl font-bold text-[#2F2F3A] mb-1">{vol.name}</h4>
                <p className="text-[#8E7CC3] text-[9px] font-black uppercase tracking-[0.2em] mb-8">{vol.region}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  {vol.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="px-4 py-2 bg-[#F3F0FA] text-[#2F2F3A]/60 rounded-xl text-[10px] font-bold">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto w-full pt-6 border-t border-[#F3F0FA] flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black text-[#2F2F3A] uppercase tracking-widest">★ {vol.rating}</span>
                  <span className="text-[10px] font-black text-[#8E7CC3] uppercase tracking-widest underline underline-offset-8">Details</span>
                </div>

                {/* Armed state overlay hint — subtle red tint on card border */}
                {isArmed && (
                  <div className="absolute inset-0 rounded-[3rem] border-2 border-rose-300 pointer-events-none animate-pulse" />
                )}
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
        />
      )}
    </section>
  );
}