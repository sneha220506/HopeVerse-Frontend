import { useEffect, useState, useRef } from "react";
import { needsAPI } from "../services/api";
import {
  getCategoryIcon,
  getCategoryBg,
  getUrgencyColor,
} from "../utils/helpers";
import {
  GoogleMap,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const libraries = ["places"];
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // Central India

// Self-contained Scroll-driven Animated Wrapper for Cards
function ScrollAnimateCard({ children, delayStyle, className }) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target); // Stop observing once it has faded in
        }
      },
      {
        threshold: 0.05, // Triggers slightly after the card top enters the viewport
        rootMargin: "0px 0px -50px 0px" // Slight offset for a smoother effect
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      style={isIntersecting ? delayStyle : {}}
      className={`${className} transition-all duration-500 ${
        isIntersecting ? "reveal-card" : "opacity-0 translate-y-[30px]"
      }`}
    >
      {children}
    </div>
  );
}

export default function CommunityNeeds({ onNavigate, permissions }) {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // Database States
  const [needs, setNeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState(null);

  // Custom Tactical Modal Popup State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "confirm", // 'confirm' | 'status'
    title: "",
    message: "",
    onConfirm: null,
  });

  // Map States
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  // Fetch from DB on load
  useEffect(() => {
    const fetchNeeds = async () => {
      setIsLoading(true);
      try {
        const response = await needsAPI.getAll();
        const data = Array.isArray(response) ? response : response?.data || [];
        setNeeds(data);

        // Set map center to first need with coordinates
        const firstWithCoords = data.find(
          (n) => n.gpsCoordinates?.latitude && n.gpsCoordinates?.longitude,
        );
        if (firstWithCoords) {
          setMapCenter({
            lat: firstWithCoords.gpsCoordinates.latitude,
            lng: firstWithCoords.gpsCoordinates.longitude,
          });
        }
      } catch (error) {
        console.error("Field Intelligence Fetch Error:", error);
        setNeeds([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNeeds();
  }, []);

  // Triggers the deletion protocol api confirmation sequence
  const initiateDeleteSequence = (id, nodeTitle) => {
    setModalConfig({
      isOpen: true,
      type: "confirm",
      title: "⚠️ CRITICAL PROTOCOL",
      message: `Are you sure you want to terminate "${nodeTitle || "this requirement node"}" permanently? This action removes all satellite intelligence mapping for this node.`,
      onConfirm: () => executionDeleteSequence(id),
    });
  };

  const executionDeleteSequence = async (id) => {
    // Close confirmation modal to display action state
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
    setIsDeletingId(id);
    
    try {
      await needsAPI.delete(id);
      
      // Optimistic UI update
      setNeeds((prevNeeds) => prevNeeds.filter((need) => need._id !== id));
      if (selectedMarker?._id === id) {
        setSelectedMarker(null);
      }

      // Success Notification Modal
      setModalConfig({
        isOpen: true,
        type: "status",
        title: "📡 PROTOCOL COMPLETE",
        message: "Operational node successfully decoupled and erased from decentralized register maps.",
        onConfirm: null,
      });
    } catch (error) {
      console.error("Deletion error:", error);
      
      // Error Notification Modal
      setModalConfig({
        isOpen: true,
        type: "status",
        title: "❌ OPERATIONAL FAILURE",
        message: "Could not execute node deletion protocol due to database uplink disruption.",
        onConfirm: null,
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredNeeds = needs.filter((need) => {
    if (filterCategory !== "all" && need.category !== filterCategory)
      return false;
    if (filterUrgency !== "all" && need.urgency !== filterUrgency) return false;
    return true;
  });

  const needsWithCoordinates = filteredNeeds.filter(
    (need) => need.gpsCoordinates?.latitude && need.gpsCoordinates?.longitude,
  );

  const categories = [...new Set(needs.map((n) => n.category))];

  const urgencyStyles = {
    critical: {
      bg: "bg-red-500",
      text: "text-red-500",
      border: "border-red-500",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.5)]",
      light: "bg-red-50",
    },
    high: {
      bg: "bg-orange-500",
      text: "text-orange-500",
      border: "border-orange-500",
      glow: "shadow-[0_0_15px_rgba(249,115,22,0.5)]",
      light: "bg-orange-50",
    },
    medium: {
      bg: "bg-yellow-400",
      text: "text-yellow-600",
      border: "border-yellow-400",
      glow: "shadow-[0_0_15px_rgba(251,191,36,0.3)]",
      light: "bg-yellow-50",
    },
    low: {
      bg: "bg-[#FEF9C3]",
      text: "text-yellow-700",
      border: "border-yellow-200",
      glow: "shadow-none",
      light: "bg-[#FEF9C3]/50",
    },
  };

  const getMarkerColor = (urgency) => {
    const colors = {
      critical: "#EF4444",
      high: "#F97316",
      medium: "#FACC15",
      low: "#FEF9C3",
    };
    return colors[urgency] || colors.low;
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">
            Syncing Field Intelligence...
          </p>
        </div>
      </div>
    );

  return (
    <section className="py-8 bg-gradient-to-br from-slate-50 via-white to-primary min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/10 via-success/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 animate-pulse-slow animation-delay-2000" />
        
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/20 rounded-2xl rotate-12 animate-float" />
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-secondary/20 rounded-full animate-float animation-delay-1000" />
        <div className="absolute bottom-40 left-1/4 w-12 h-12 border-2 border-accent/20 rounded-lg rotate-45 animate-float animation-delay-3000" />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        
        .tactical-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.25rem center;
          background-size: 1rem;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: linear-gradient(180deg, #8E7CC3, #7C3AED); 
          border-radius: 10px; 
        }
        
        .gradient-border {
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #4F46E5, #7C3AED, #EC4899) border-box;
          border: 2px solid transparent !important;
        }
      `,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h2 className="text-4xl font-heading font-black text-slate-dark tracking-tighter">
              Operational <span className="text-primary/70">Requirements</span>
            </h2>
            <p className="text-slate-dark/40 font-black uppercase tracking-[0.2em] text-[11px] mt-4 flex items-center gap-3">
              <span className="text-red-500">
                {filteredNeeds.length} active nodes
              </span>{" "}
              detected
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {permissions?.canCreateNeed && (
              <button
                onClick={() => onNavigate("survey")}
                className="bg-primary/70 text-white px-10 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95"
              >
                + New Requirement
              </button>
            )}

            <div className="flex p-2 bg-white rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
              <button
                onClick={() => setViewMode("map")}
                className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${viewMode === "map" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
              >
                MAP VIEW
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${viewMode === "list" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
              >
                INDEX VIEW
              </button>
            </div>
          </div>
        </div>

        {/* --- Tactical Filters --- */}
        <div className="flex flex-wrap gap-5 mb-16 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="tactical-select bg-white border-2 border-slate-50 rounded-2xl px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-sm outline-none cursor-pointer min-w-[220px] transition-all"
          >
            <option value="all">Category: All Sectors</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="tactical-select bg-white border-2 border-slate-50 rounded-2xl px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest focus:ring-4 focus:ring-primary/5 focus:border-primary shadow-sm outline-none cursor-pointer min-w-[220px] transition-all"
          >
            <option value="all">Urgency: Global</option>
            <option value="critical">🔴 Critical Response</option>
            <option value="high">🟠 High Priority</option>
            <option value="medium">🟡 Medium Watch</option>
            <option value="low">⚪ Low Priority</option>
          </select>
        </div>

        {/* --- Google Maps View --- */}
        {viewMode === "map" && (
          <div className="bg-white rounded-[4rem] p-8 mb-20 shadow-2xl shadow-slate-200/50 border border-slate-50 animate-in zoom-in duration-700">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  🌍 Geographic Intelligence Map
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {needsWithCoordinates.length} locations plotted
                </p>
              </div>
            </div>

            {typeof window !== 'undefined' && window.google?.maps ? (
              <div className="w-full h-[600px] rounded-[3rem] overflow-hidden border-2 border-slate-100 shadow-inner">
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={mapCenter}
                  zoom={needsWithCoordinates.length === 1 ? 12 : 5}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                    navigatorControl: false,
                  }}
                >
                  {needsWithCoordinates.map((need) => (
                    <Marker
                      key={need._id}
                      position={{ lat: need.gpsCoordinates.latitude, lng: need.gpsCoordinates.longitude }}
                      onClick={() => setSelectedMarker(need)}
                      icon={{
                        path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                        fillColor: getMarkerColor(need.urgency),
                        fillOpacity: 0.9,
                        strokeColor: "#ffffff",
                        strokeWeight: 3,
                        scale: 12,
                      }}
                    />
                  ))}

                  {selectedMarker && (
                    <InfoWindow
                      position={{
                        lat: selectedMarker.gpsCoordinates.latitude,
                        lng: selectedMarker.gpsCoordinates.longitude,
                      }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="p-4 max-w-xs">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{getCategoryIcon(selectedMarker.category)}</span>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm leading-tight">{selectedMarker.title}</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">📍 {selectedMarker.location}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">{selectedMarker.description.substring(0, 100)}...</p>

                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${urgencyStyles[selectedMarker.urgency]?.light} ${urgencyStyles[selectedMarker.urgency]?.text}`}>
                              {selectedMarker.urgency}
                            </span>
                            <button onClick={() => onNavigate("matching")} className="text-primary text-[9px] font-black uppercase tracking-wider hover:underline">Deploy →</button>
                          </div>
                          
                          {permissions?.canCreateNeed && (
                            <button
                              disabled={isDeletingId === selectedMarker._id}
                              onClick={() => initiateDeleteSequence(selectedMarker._id, selectedMarker.title)}
                              className="w-full mt-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-center py-2 rounded-lg text-[8px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                              {isDeletingId === selectedMarker._id ? "TERMINATING..." : "✕ DELETE NODE"}
                            </button>
                          )}
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>
            ) : (
              <div className="w-full h-[600px] bg-slate-100 flex items-center justify-center rounded-[3rem] text-xs font-black uppercase tracking-widest text-slate-400">
                Loading Map Layer Grid...
              </div>
            )}
          </div>
        )}

        {/* --- Index Grid --- */}
        {viewMode === "list" && (
          <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredNeeds.map((need, idx) => {
              const style = urgencyStyles[need.urgency] || urgencyStyles.low;
              const saturation = need.volunteersNeeded > 0 ? Math.round((need.volunteersAssigned / need.volunteersNeeded) * 100) : 0;
              const itemEvidence = need.images || need.photos || [];

              return (
                <ScrollAnimateCard
                  key={need._id}
                  delayStyle={{ animationDelay: `${(idx % 3) * 0.1}s` }}
                  className="gradient-border rounded-[3rem] p-10 shadow-soft hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group relative flex flex-col"
                >
                  {permissions?.canCreateNeed && (
                    <button
                      disabled={isDeletingId === need._id}
                      onClick={() => initiateDeleteSequence(need._id, need.title)}
                      className="absolute top-6 right-6 z-20 bg-slate-50 hover:bg-red-500 hover:text-white text-slate-400 border border-slate-100 rounded-full w-8 h-8 flex items-center justify-center text-xs font-black transition-all shadow-sm hover:rotate-90 disabled:opacity-50"
                      title="Terminate Requirement Node"
                    >
                      {isDeletingId === need._id ? "..." : "✕"}
                    </button>
                  )}

                  <div className="flex items-start gap-6 mb-6 pr-6">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-dark font-black text-xl tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                        {need.title}
                      </h4>
                      <p className="text-slate-dark/30 text-[10px] font-black uppercase tracking-[0.2em] mt-2">📍 {need.location} ({need.region})</p>
                    </div>
                  </div>

                  <p className="text-slate-dark/50 text-xs mb-6 leading-relaxed font-semibold line-clamp-2 italic bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    "{need.description}"
                  </p>

                  {itemEvidence.length > 0 && (
                    <div className="mb-6">
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {itemEvidence.map((imgUrl, i) => (
                          <div key={i} onClick={() => setActiveLightboxImage(imgUrl)} className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 relative bg-slate-100 border border-slate-100 cursor-zoom-in">
                            <img src={imgUrl} alt="Evidence" className="absolute inset-0 w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto space-y-4 mb-8">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-dark/20">Resource Saturation</span>
                      <span className="text-primary">{saturation}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden p-[1px] border border-slate-100">
                      <div className="h-full bg-hero-grad rounded-full transition-all duration-1000" style={{ width: `${Math.min(saturation, 100)}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 ${style.light} ${style.border} ${style.text}`}>
                      {need.urgency}
                    </span>
                    <button onClick={() => onNavigate("matching")} className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:translate-x-2 transition-transform flex items-center gap-2">
                      Deploy Support <span>→</span>
                    </button>
                  </div>
                </ScrollAnimateCard>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Tactical Lightbox Preview Overlay --- */}
      {activeLightboxImage && (
        <div onClick={() => setActiveLightboxImage(null)} className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed top-0 right-0 p-6 z-[100000]">
            <button onClick={() => setActiveLightboxImage(null)} className="bg-white hover:bg-red-500 text-slate-900 hover:text-white px-6 py-4 rounded-2xl text-[10px] font-black tracking-widest border border-slate-100">✕ CLOSE PREVIEW</button>
          </div>
          <div onClick={(e) => e.stopPropagation()} className="max-w-[85vw] max-h-[75vh] rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-900 mt-16">
            <img src={activeLightboxImage} alt="Field Evidence" className="w-full h-full object-contain max-h-[75vh]" />
          </div>
        </div>
      )}

      {/* --- CUSTOM TACTICAL MODAL POPUP COMPONENT --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150 p-4">
          <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className={`text-base font-black tracking-wider mb-3 uppercase ${modalConfig.type === 'confirm' ? 'text-amber-600' : 'text-slate-900'}`}>
              {modalConfig.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              {modalConfig.message}
            </p>
            
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
              {modalConfig.type === "confirm" ? (
                <>
                  <button
                    onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                    className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    Abort
                  </button>
                  <button
                    onClick={modalConfig.onConfirm}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-red-200"
                  >
                    Confirm Execution
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-200"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}