import React, { useState, useEffect } from 'react';
import { volunteersAPI } from "../services/api";

const VolunteerModal = ({
  vol,
  onClose,
  onNavigate,
  onDelete,
  isAdmin,
  onNext,
  onPrev
}) => {

  if (!vol) return null;

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">

      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Navigation Buttons */}
      <div className="absolute inset-x-4 md:inset-x-10 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[160]">

        <button
          onClick={onPrev}
          className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 hover:bg-white backdrop-blur-md border border-white/20 text-white hover:text-primary shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105"
        >
          ←
        </button>

        <button
          onClick={onNext}
          className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 hover:bg-white backdrop-blur-md border border-white/20 text-white hover:text-primary shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105"
        >
          →
        </button>

      </div>

      <div className="relative bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden border border-white max-h-[90vh] overflow-y-auto transition-all duration-500 scale-100 animate-in fade-in zoom-in-95">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors duration-300"
        >
          ✕
        </button>

        <div className="p-12 sm:p-16">

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-12">

            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-6xl text-white shadow-2xl">
                {vol.userId?.avatar || "👤"}
              </div>
            </div>

            <h3 className="text-4xl font-black text-slate-dark tracking-tighter mb-3">
              {vol.userId?.name || "Unknown"}
            </h3>

            <div className="flex items-center gap-3">

              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  vol.status === 'active'
                    ? 'bg-success'
                    : 'bg-amber-400'
                }`}
              />

              <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                {vol.status} Operator • {vol.userId?.region || "N/A"}
              </p>

            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-5 mb-12">

            {[
              {
                label: "Mission Acts",
                val: vol.tasksCompleted
              },
              {
                label: "Community Rating",
                val: vol.rating
              },
              {
                label: "Engagement",
                val: `${vol.hoursLogged}h`
              },
            ].map((stat, idx) => (

              <div
                key={`stat-${idx}`}
                className="bg-slate-50 rounded-[2.5rem] p-6 text-center border border-slate-100 transition-all duration-300 hover:border-slate-200"
              >

                <div className="text-2xl font-black tracking-tight mb-2">
                  {stat.val}
                </div>

                <div className="text-[9px] text-slate-dark/30 uppercase font-black tracking-widest leading-tight">
                  {stat.label}
                </div>

              </div>

            ))}

          </div>

          {/* Schedule */}
          <div className="space-y-6 mb-12">

            <div className="bg-slate-50 rounded-[3rem] p-8 border border-slate-100">

              <div className="flex items-center gap-3 mb-6">

                <span className="text-lg">📅</span>

                <h4 className="text-[10px] font-black text-slate-dark uppercase tracking-[0.2em]">
                  Deployment Schedule
                </h4>

              </div>

              <div className="flex justify-between gap-2">

                {days.map((day, idx) => (

                  <div
                    key={`day-${idx}`}
                    className={`flex-1 text-center py-3 rounded-xl text-[10px] font-black transition-all duration-300 ${
                      vol.schedule?.[day]
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white text-slate-200 border border-slate-100'
                    }`}
                  >
                    {day.charAt(0).toUpperCase()}
                  </div>

                ))}

              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 grid grid-cols-1 gap-4">

              <div className="flex justify-between items-center px-2">

                <span className="text-[10px] font-black text-slate-dark uppercase tracking-widest">
                  Digital Address
                </span>

                <span className="text-sm font-bold text-slate-dark">
                  {vol.userId?.email || "N/A"}
                </span>

              </div>

              <div className="w-full h-px bg-slate-100" />

              <div className="flex justify-between items-center px-2">

                <span className="text-[10px] font-black text-slate-dark uppercase tracking-widest">
                  Comm Link
                </span>

                <span className="text-sm font-bold text-slate-dark">
                  {vol.userId?.phone || "N/A"}
                </span>

              </div>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4">

            <button
              onClick={() => {
                onNavigate("matching");
                onClose();
              }}
              className="w-full py-5 bg-primary text-white rounded-[2rem] font-black transition-all duration-300 hover:shadow-lg active:scale-[0.99]"
            >
              Initialize Smart Matching
            </button>

            {isAdmin && (

              <button
                onClick={() => {

                  if (
                    window.confirm(
                      `Permanently remove ${vol.userId?.name}?`
                    )
                  ) {
                    onDelete(vol._id);
                    onClose();
                  }

                }}
                className="w-full py-4 border-2 border-rose-100 hover:bg-rose-50 hover:border-rose-200 text-rose-500 rounded-[2rem] font-black transition-all duration-300"
              >
                Remove Volunteer
              </button>

            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default function VolunteerDirectory({
  onNavigate,
  permissions
}) {

  const p = permissions || {};

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVol, setSelectedVol] = useState(null);
  
  // Track which card is flipped locally by ID
  const [flippedCardId, setFlippedCardId] = useState(null);

  const isAdmin = p.label === 'Administrator';

  useEffect(() => {

    const fetchVolunteers = async () => {

      try {

        const res = await volunteersAPI.getAll();
        setVolunteers(res.data);

      } catch (err) {

        console.error("Volunteer fetch failed");

      } finally {

        setLoading(false);

      }
    };

    fetchVolunteers();

  }, []);

  /* Search Filter */
  const filtered = volunteers.filter((vol) =>

    vol.userId?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())

    ||

    vol.skills?.some((s) =>
      s.toLowerCase().includes(
        searchTerm.toLowerCase()
      )
    )

  );

  /* Delete Volunteer */
  const handleDelete = async (id) => {

    try {

      await volunteersAPI.delete(id);

      setVolunteers((prev) =>
        prev.filter((v) => v._id !== id)
      );

    } catch (err) {

      alert("Delete failed");

    }
  };

  /* Next / Prev Modal */
  const navigateProfile = (direction) => {

    if (!selectedVol) return;

    const currentIndex =
      filtered.findIndex(
        (v) => v._id === selectedVol._id
      );

    let nextIndex;

    if (direction === 'next') {

      nextIndex =
        (currentIndex + 1) % filtered.length;

    } else {

      nextIndex =
        (currentIndex - 1 + filtered.length)
        % filtered.length;
    }

    setSelectedVol(filtered[nextIndex]);
  };

  /* Loading matched perfectly to system theme style */
  if (loading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white via-[#F5F2FF] to-[#8E7CC3]/20">
      
      <div className="relative">
        <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>

        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-[#8E7CC3] rounded-full animate-spin"></div>
      </div>

      <div className="mt-6 text-slate-600 font-bold text-sm uppercase tracking-[0.2em] animate-pulse">
        Loading Directory...
      </div>

    </div>
  );
}

  return (

    <section className="py-24 bg-[#F8FAFC] min-h-screen">

      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-24">

          <div>

            <h2 className="text-6xl font-black text-slate-dark tracking-tight transition-all duration-300">
              The <span className="text-primary">Collective</span>
            </h2>

            <p className="text-black font-bold text-lg mt-4">
              Secure oversight of {volunteers.length} volunteers.
            </p>

          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search volunteer..."
            className="border border-primary p-4 rounded-2xl w-full md:w-[400px] shadow-sm focus:outline-none focus:border-primary transition-all duration-300"
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

        </div>

        {/* Volunteer Flashcards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 [perspective:1500px]">

          {filtered.map((vol, idx) => {
            const isFlipped = flippedCardId === vol._id;
            
            return (
              <div
                key={`vol-${vol._id}-${idx}`}
                onClick={() => setFlippedCardId(isFlipped ? null : vol._id)}
                className="relative h-[480px] w-full cursor-pointer transition-all duration-500 [transform-style:preserve-3d] hover:scale-[1.02]"
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'none'
                }}
              >
                
                {/* FLASHCARD FRONT: Standard Overview Profile */}
                <div className="absolute inset-0 bg-white rounded-[3rem] p-10 shadow-xl border border-slate-50 flex flex-col justify-between [backface-visibility:hidden]">
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-5xl">
                        {vol.userId?.avatar || "👤"}
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        vol.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {vol.status || 'N/A'}
                      </span>
                    </div>

                    <h4 className="text-3xl font-black mb-1 text-slate-dark tracking-tight">
                      {vol.userId?.name || "Unknown"}
                    </h4>

                    <p className="text-primary text-sm font-bold mb-4">
                      {vol.userId?.region || "N/A"}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">
                        ⭐ {vol.rating || "N/A"}
                      </span>

                      <span className="text-primary text-sm font-black uppercase tracking-wider bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 hover:bg-primary hover:text-white transition-all duration-300">
                        Details →
                      </span>
                    </div>
                  </div>
                </div>

                {/* FLASHCARD BACK: Whole Identity Details */}
                <div className="absolute inset-0 bg-white rounded-[3rem] p-10 shadow-2xl border border-primary/10 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                      <h4 className="text-xl font-black text-slate-dark">
                        Identity Check
                      </h4>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVol(vol);
                        }}
                        className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        More Details↗
                      </span>
                    </div>

                    {/* Personal Identity Metadata */}
                    <div className="space-y-4 mb-6 text-xs text-slate-700">
                      <div>
                        <span className="block font-black text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Email Digital Address</span> 
                        <span className="text-sm font-bold text-slate-dark">{vol.userId?.email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="block font-black text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Comm Link Phone</span> 
                        <span className="text-sm font-bold text-slate-dark">{vol.userId?.phone || "N/A"}</span>
                      </div>
                      <div>
                        <span className="block font-black text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Physical Hub Location</span> 
                        <span className="text-sm font-bold text-slate-dark">{vol.userId?.address || vol.userId?.location || "N/A"}</span>
                      </div>
                    </div>

                    {/* Specialization / Skills */}
                    <div className="mb-4">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">Specializations</div>
                      <div className="flex flex-wrap gap-1.5">
                        {vol.skills && vol.skills.length > 0 ? (
                          vol.skills.map((skill, sIdx) => (
                            <span
                              key={`skill-${skill}-${sIdx}`}
                              className="px-3 py-1.5 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No specializations specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400">Rating: ⭐ {vol.rating || "N/A"}</span>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">← Tap to flip</span>
                    </div>

                    {/* Inline Delete/Remove Button - Only Visible to Admin */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents flipping the card back over
                          if (window.confirm(`Permanently remove ${vol.userId?.name || 'this volunteer'}?`)) {
                            handleDelete(vol._id);
                          }
                        }}
                        className="w-full py-3 border border-rose-200 hover:bg-rose-50 text-rose-500 rounded-2xl text-xs font-black tracking-wider uppercase transition-colors duration-300"
                      >
                        Remove Volunteer
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Modal */}
      {selectedVol && (

        <VolunteerModal
          vol={selectedVol}
          onClose={() => setSelectedVol(null)}
          onNavigate={onNavigate}
          onDelete={handleDelete}
          isAdmin={isAdmin}
          onNext={() => navigateProfile('next')}
          onPrev={() => navigateProfile('prev')}
        />

      )}

    </section>
  );
}