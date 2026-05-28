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
          className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 hover:bg-white backdrop-blur-md border border-white/20 text-white hover:text-primary shadow-2xl flex items-center justify-center"
        >
          ←
        </button>

        <button
          onClick={onNext}
          className="pointer-events-auto w-14 h-14 rounded-full bg-white/10 hover:bg-white backdrop-blur-md border border-white/20 text-white hover:text-primary shadow-2xl flex items-center justify-center"
        >
          →
        </button>

      </div>

      <div className="relative bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden border border-white max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
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
                className="bg-slate-50 rounded-[2.5rem] p-6 text-center border border-slate-100"
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
                    className={`flex-1 text-center py-3 rounded-xl text-[10px] font-black ${
                      vol.schedule?.[day]
                        ? 'bg-primary text-white'
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
              className="w-full py-5 bg-primary text-white rounded-[2rem] font-black"
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
                className="w-full py-4 border-2 border-rose-100 text-rose-500 rounded-[2rem] font-black"
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

  /* Loading */
  if (loading) {

    return (

      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>

    );
  }

  return (

    <section className="py-24 bg-[#F8FAFC] min-h-screen">

      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-24">

          <div>

            <h2 className="text-6xl font-black text-slate-dark">
              The Collective
            </h2>

            <p className="text-black font-bold text-lg mt-4">
              Secure oversight of {volunteers.length} volunteers.
            </p>

          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search volunteer..."
            className="border p-4 rounded-2xl w-full md:w-[400px]"
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

        </div>

        {/* Volunteer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

          {filtered.map((vol, idx) => (

            <div
              key={`vol-${vol._id}-${idx}`}
              onClick={() => setSelectedVol(vol)}
              className="bg-white rounded-[3rem] p-10 shadow-xl cursor-pointer"
            >

              <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-5xl mb-8">
                {vol.userId?.avatar || "👤"}
              </div>

              <h4 className="text-3xl font-black mb-2">
                {vol.userId?.name || "Unknown"}
              </h4>

              <p className="text-primary text-sm mb-6">
                {vol.userId?.region || "N/A"}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-8">

                {vol.skills?.slice(0, 2).map((skill, idx) => (

                  <span
                    key={`skill-${skill}-${idx}`}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold"
                  >
                    {skill}
                  </span>

                ))}

              </div>

              <div className="flex justify-between items-center">

                <span className="font-bold">
                  ⭐ {vol.rating}
                </span>

                <span className="text-primary text-sm font-bold">
                  View Profile
                </span>

              </div>

            </div>

          ))}

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