import React, { useState, useEffect } from 'react';
import { volunteersAPI } from "../services/api";

/**
 * VOLUNTEER MODAL COMPONENT
 */
const VolunteerModal = ({ vol, onClose, onNavigate }) => {
  if (!vol) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#2F2F3A]/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}/>
      <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[#F3F0FA]">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-[#FAFAFC] text-[#2F2F3A]/40 hover:text-[#8E7CC3] transition-colors z-10">✕</button>
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-[#8E7CC3] to-[#B8A1E3] flex items-center justify-center text-5xl text-white shadow-xl mb-4">{vol.avatar}</div>
            <h3 className="text-3xl font-bold text-[#2F2F3A]">{vol.name}</h3>
            <p className="text-[#8E7CC3] font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Verified Community Responder</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[{ label: "Acts", val: vol.tasksCompleted, icon: "🌱" }, { label: "Rating", val: `★${vol.rating}`, icon: "✨" }, { label: "Hours", val: `${vol.hoursLogged}h`, icon: "⏳" }].map((stat) => (
              <div key={stat.label} className="bg-[#F3F0FA] rounded-2xl p-4 text-center">
                <div className="text-lg mb-1">{stat.icon}</div>
                <div className="text-md font-bold text-[#2F2F3A]">{stat.val}</div>
                <div className="text-[9px] text-[#2F2F3A]/40 uppercase font-black tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => { onNavigate("matching"); onClose(); }} className="w-full mt-8 py-5 bg-gradient-to-r from-[#FF8A65] to-[#FFB199] text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-orange-100 hover:scale-[1.02] transition-transform">Send Collaboration Request</button>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN VOLUNTEER DIRECTORY COMPONENT
 */
export default function VolunteerDirectory({ onNavigate }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVol, setSelectedVol] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // Track which card is in "Confirm Delete" mode

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await volunteersAPI.getAll();
        setVolunteers(res.data || res);
      } catch (err) { console.error("Sync error."); } finally { setLoading(false); }
    };
    fetchVolunteers();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await volunteersAPI.delete(id);
      setVolunteers(volunteers.filter(v => v._id !== id));
      setDeletingId(null);
    } catch (err) { alert("Could not remove volunteer."); }
  };

  const filtered = volunteers.filter((vol) => 
    vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vol.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFC]">
      <div className="flex space-x-2 animate-pulse text-[#8E7CC3] font-bold uppercase tracking-widest text-xs">Syncing Hearts...</div>
    </div>
  );

  return (
    <section className="py-16 bg-[#FAFAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <h2 className="text-4xl font-bold text-[#2F2F3A] tracking-tight">Community <span className="text-[#8E7CC3]">Directory</span></h2>
            <p className="text-[#2F2F3A]/50 font-medium mt-2">Managing {volunteers.length} verified hearts.</p>
          </div>
          <input type="text" placeholder="Search by name or skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 bg-white border border-[#F3F0FA] rounded-2xl px-6 py-4 text-sm text-[#2F2F3A] shadow-soft outline-none focus:ring-2 focus:ring-[#8E7CC3]/20 transition-all"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((vol) => (
            <div key={vol._id} onClick={() => setSelectedVol(vol)}
              className="group relative bg-white rounded-[2.5rem] p-8 border border-transparent shadow-soft hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col items-center text-center overflow-hidden"
            >
              {/* DELETE LOGIC */}
              <div className="absolute top-6 right-6 z-20">
                {deletingId === vol._id ? (
                  <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                    <button onClick={(e) => handleDelete(e, vol._id)} className="bg-rose-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg shadow-lg hover:bg-rose-600 transition-colors">CONFIRM</button>
                    <button onClick={(e) => { e.stopPropagation(); setDeletingId(null); }} className="bg-slate-100 text-slate-400 text-[9px] font-bold px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">CANCEL</button>
                  </div>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setDeletingId(vol._id); }} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-300 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="w-20 h-20 rounded-full bg-[#F3F0FA] flex items-center justify-center text-4xl mb-6 group-hover:bg-gradient-to-tr group-hover:from-[#8E7CC3] group-hover:to-[#B8A1E3] group-hover:text-white transition-all duration-500 shadow-inner">{vol.avatar}</div>
              <h4 className="text-xl font-bold text-[#2F2F3A] mb-1">{vol.name}</h4>
              <p className="text-[#2F2F3A]/40 text-[10px] font-black uppercase tracking-[0.2em] mb-6">{vol.location}</p>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {vol.skills.slice(0, 2).map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-[#F3F0FA] text-[#8E7CC3] rounded-full text-[10px] font-bold">{skill}</span>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t border-[#F3F0FA] w-full text-[10px] font-black text-[#8E7CC3] uppercase tracking-[0.2em] opacity-60">View Profile</div>
            </div>
          ))}
        </div>
      </div>
      {selectedVol && <VolunteerModal vol={selectedVol} onClose={() => setSelectedVol(null)} onNavigate={onNavigate} />}
    </section>
  );
}