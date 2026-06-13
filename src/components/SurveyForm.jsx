import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { surveysAPI } from "../services/api";
import { getCategoryIcon, getCategoryBg, getUrgencyColor } from "../utils/helpers";
import { useJsApiLoader, Autocomplete, GoogleMap, Marker } from "@react-google-maps/api";

const ASSET_URL = "http://localhost:5000";
const libraries = ["places"];
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

export default function SurveyForm({ permissions, user }) {
  const [formData, setFormData] = useState({
    submittedBy: "",
    submitterId: "",
    location: "",
    region: "",
    fullAddress: "",
    category: "",
    description: "",
    affectedCount: "",
    urgency: "medium",
    surveyType: "observation",
    source: "field-report",
    photos: [],
  });

  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [allReports, setAllReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autocomplete, setAutocomplete] = useState(null);

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const mapRef = useRef(null);

  // Hook handles global singleton loading instance safely
  const { isLoaded: isMapScriptLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 35,
    restDelta: 0.001,
  });

  const isAdminOrCoordinator =
    permissions?.label === "Administrator" || permissions?.label === "Coordinator";
  const p = permissions;
  const canVerify = isAdminOrCoordinator;
  const canDelete = isAdminOrCoordinator;

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        submittedBy: user.name,
        submitterId: user.id || "",
      }));
    }
  }, [user]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(coords);
          setMarkerPosition(coords);
          handleMapLocationChange(coords.lat, coords.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your current location. Please search or click on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const onLoad = (autoC) => {
    setAutocomplete(autoC);
  };

  const parseAddressComponents = (addressComponents) => {
    let city = "";
    let state = "";

    addressComponents?.forEach((component) => {
      const types = component.types;
      if (types.includes("locality")) {
        city = component.long_name;
      }
      if (!city && types.includes("administrative_area_level_2")) {
        city = component.long_name;
      }
      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }
    });

    return { city, state };
  };

  const onPlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const newCoords = { lat, lng };

    setMapCenter(newCoords);
    setMarkerPosition(newCoords);

    let { city, state } = parseAddressComponents(place.address_components);

    if (!city && place.name) {
      city = place.name;
    }

    setFormData((prev) => ({
      ...prev,
      location: city,
      region: state,
      fullAddress: place.formatted_address || "",
    }));
  };

  const handleMapLocationChange = async (lat, lng) => {
    setMarkerPosition({ lat, lng });

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const topResult = data.results[0];
        let { city, state } = parseAddressComponents(topResult.address_components);

        if (!city) {
          city = topResult.formatted_address.split(",")[0];
        }

        setFormData((prev) => ({
          ...prev,
          location: city,
          region: state,
          fullAddress: topResult.formatted_address || "",
        }));
      }
    } catch (error) {
      console.error("Geocoding reverse lookup error:", error);
    }
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const response = await surveysAPI.getAll();
      const reportsArray = Array.isArray(response) ? response : response?.data || [];
      setAllReports(reportsArray);
    } catch (error) {
      console.error("Database Fetch Error:", error);
      setAllReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const myReports = (allReports || []).filter(
    (report) =>
      report.submitterId && user?.id && String(report.submitterId) === String(user.id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "photos" && key !== "affectedCount") {
          data.append(key, formData[key]);
        }
      });

      data.append("affectedCount", Number(formData.affectedCount) || 0);

      if (markerPosition) {
        data.append("gpsCoordinates[latitude]", markerPosition.lat);
        data.append("gpsCoordinates[longitude]", markerPosition.lng);

        data.append("mapLocation[type]", "Point");
        data.append("mapLocation[coordinates][0]", markerPosition.lng);
        data.append("mapLocation[coordinates][1]", markerPosition.lat);
      }

      if (formData.photos && formData.photos.length > 0) {
        for (let i = 0; i < formData.photos.length; i++) {
          data.append("photos", formData.photos[i]);
        }
      }

      data.append("date", new Date().toISOString());
      data.append("verified", false);

      const response = await surveysAPI.submit(data);
      const savedReport = response.data;

      setAllReports((prev) => [savedReport, ...prev]);
      setSubmitted(true);
      setMarkerPosition(null);
      setShowMapSelector(false);

      setFormData({
        submittedBy: user?.name || "",
        submitterId: user?.id || "",
        location: "",
        region: "",
        fullAddress: "",
        category: "",
        description: "",
        affectedCount: "",
        urgency: "medium",
        surveyType: "observation",
        source: "field-report",
        photos: [],
      });

      setTimeout(() => {
        setSubmitted(false);
        setActiveTab("reports");
      }, 2000);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Field Intelligence Transmission Failed. Please check connectivity.");
    }
  };

  const handleVerify = async (id) => {
    try {
      await surveysAPI.verify(id);
      setAllReports((prev) => prev.map((r) => (r._id === id ? { ...r, verified: true } : r)));
    } catch (error) {
      console.error("Verification Error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this report?")) return;
    try {
      await surveysAPI.delete(id);
      setAllReports((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative w-32 h-32">
        
        <motion.div
          className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-2 border-4 border-pink-200 border-t-pink-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-4 border-4 border-blue-200 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-3xl">⚡</span>
        </motion.div>

      </div>
    </div>
  );
}
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  return (
    <section className="py-16 bg-[#F8FAFC] min-h-screen font-sans relative overflow-x-hidden">
      {/* Hugo Style Line Track System */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .hugo-fixed-track-1 {
            position: fixed; top: 30%; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.03) 50%, transparent);
            pointer-events: none; z-index: 0;
          }
          .hugo-fixed-track-2 {
            position: fixed; top: 70%; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.03) 50%, transparent);
            pointer-events: none; z-index: 0;
          }
        `,
        }}
      />

      {/* Progress Bar */}
      

      {/* Fixed Geometric Linear Background Tracks */}
      <div className="hugo-fixed-track-1" />
      <div className="hugo-fixed-track-2" />

      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Header */}
        <motion.div 
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              
              <h2 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
                Field <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Intelligence</span>
              </h2>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
              Synchronized with Secure Cloud Database
            </p>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2.5 mb-12 overflow-x-auto pb-2 no-scrollbar">
          <TabButton
            active={activeTab === "form"}
            onClick={() => setActiveTab("form")}
            label="New Entry"
            index={0}
          />
          <TabButton
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            label={`All Reports (${(allReports || []).length})`}
            index={1}
          />
          {p?.canViewSurvey && (
            <TabButton
              active={activeTab === "yourreports"}
              onClick={() => setActiveTab("yourreports")}
              label={`Your Reports (${(myReports || []).length})`}
              index={2}
            />
          )}
          {isAdminOrCoordinator && (
            <TabButton
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
              label={`Review (${(allReports || []).filter((r) => !r.verified).length})`}
              index={3}
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* FORM VIEW */}
          {activeTab === "form" && (
            <motion.div
              key="form-view"
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <SuccessMessage key="success" />
                ) : (
                  <SurveyFormContent
                    key="form"
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    onLoad={onLoad}
                    onPlaceChanged={onPlaceChanged}
                    showMapSelector={showMapSelector}
                    setShowMapSelector={setShowMapSelector}
                    getCurrentLocation={getCurrentLocation}
                    mapCenter={mapCenter}
                    markerPosition={markerPosition}
                    handleMapLocationChange={handleMapLocationChange}
                    mapRef={mapRef}
                    isMapScriptLoaded={isMapScriptLoaded}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* REPORTS VIEW */}
          {(activeTab === "reports" || activeTab === "pending" || activeTab === "yourreports") && (
            <ReportsView
              key="reports-view"
              activeTab={activeTab}
              allReports={allReports}
              myReports={myReports}
              canVerify={canVerify}
              canDelete={canDelete}
              handleVerify={handleVerify}
              handleDelete={handleDelete}
              containerVariants={containerVariants}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ============ TAB BUTTON COMPONENT ============
function TabButton({ active, onClick, label, icon, index }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap overflow-hidden ${
        active 
          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
          : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {active && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <span>{icon}</span>
      {label}
    </motion.button>
  );
}

// ============ SUCCESS MESSAGE COMPONENT ============
function SuccessMessage() {
  return (
    <motion.div
      className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xl relative overflow-hidden"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <div className="relative z-10">
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          ✅
        </motion.div>
        <motion.h3
          className="text-xl font-bold text-slate-900 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Transmission Successful
        </motion.h3>
        <motion.p
          className="text-slate-400 text-sm font-medium"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Report saved to database with GPS coordinates.
        </motion.p>
      </div>
    </motion.div>
  );
}

// ============ SURVEY FORM CONTENT COMPONENT ============
function SurveyFormContent({
  formData,
  setFormData,
  handleSubmit,
  onLoad,
  onPlaceChanged,
  showMapSelector,
  setShowMapSelector,
  getCurrentLocation,
  mapCenter,
  markerPosition,
  handleMapLocationChange,
  mapRef,
  isMapScriptLoaded,
}) {
  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm space-y-10 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="space-y-10 relative z-10">
        {/* Section 0: Identity */}
        <motion.div 
          className="border-b border-slate-100 pb-8"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <SectionHeader title="Section 00: Reporter Identity" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Field label="Your Name" required>
              <input
                type="text"
                required
                readOnly
                value={formData.submittedBy || ""}
                placeholder="e.g. Raj K."
                className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
              />
            </Field>
          </div>
        </motion.div>

        {/* Section 1: Location */}
        <motion.div 
          className="space-y-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader title="Section 01: Location Parameters" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Target Location (Search)" required>
              <div className="relative group">
                <motion.span 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-base opacity-60 z-10"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📍
                </motion.span>
                {isMapScriptLoaded ? (
                  <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Search city"
                      className="w-full px-4 py-3 pl-10 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Loading lookup context..."
                    className="w-full px-4 py-3 pl-10 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 focus:outline-none transition-all"
                    disabled
                  />
                )}
              </div>
            </Field>

            <Field label="Administrative Region" required>
              <input
                type="text"
                required
                readOnly
                value={formData.region}
                placeholder="Auto detected state"
                className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all"
              />
            </Field>
          </div>

          {/* Full Address Display */}
          <AnimatePresence>
            {formData.fullAddress && (
              <motion.div
                className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Full Address</p>
                <p className="text-xs text-slate-700 font-semibold">{formData.fullAddress}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Location Buttons */}
          <div className="flex gap-2.5 flex-wrap">
            <motion.button
              type="button"
              onClick={() => setShowMapSelector(!showMapSelector)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showMapSelector ? "Hide Map" : "Select on Map"}
            </motion.button>

            <motion.button
              type="button"
              onClick={getCurrentLocation}
              className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 hover:border-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Use My Location
            </motion.button>
          </div>

          {/* Map Display */}
          <AnimatePresence>
            {showMapSelector && (
              <motion.div
                className="w-full space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
                  {isMapScriptLoaded ? (
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={mapCenter}
                      zoom={markerPosition ? 14 : 5}
                      onLoad={(map) => { mapRef.current = map; }}
                      onClick={(e) => handleMapLocationChange(e.latLng.lat(), e.latLng.lng())}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                      }}
                    >
                      {markerPosition && (
                        <Marker
                          position={markerPosition}
                          draggable={true}
                          onDragEnd={(e) => handleMapLocationChange(e.latLng.lat(), e.latLng.lng())}
                        />
                      )}
                    </GoogleMap>
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 animate-pulse">
                        Initializing Spatial Engine...
                      </p>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {markerPosition && (
                    <motion.div
                      className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">📍 Location Pinned</p>
                        <p className="text-sm font-bold text-slate-900">
                          {formData.location || "Coordinates Bound"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium font-mono mt-0.5">
                          {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section 2: Category & Survey Type */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Field label="Intelligence Category" required>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all"
            >
              <option value="">Choose category</option>
              {["healthcare", "education", "food", "shelter", "environment", "disaster"].map((c) => (
                <option key={c} value={c}>
                  {getCategoryIcon(c)} {c.toUpperCase()}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Survey Type" required>
            <select
              required
              value={formData.surveyType}
              onChange={(e) => setFormData({ ...formData, surveyType: e.target.value })}
              className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none transition-all"
            >
              <option value="">Choose Type</option>
              {["door-to-door", "community-meeting", "phone-survey", "online", "observation", "other", "interview"].map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </Field>
        </motion.div>

        {/* Urgency Protocol */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Field label="Urgency Protocol" required>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {["low", "medium", "high", "critical"].map((level, index) => (
                <motion.button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: level })}
                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    formData.urgency === level
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  {level}
                </motion.button>
              ))}
            </div>
          </Field>
        </motion.div>

        {/* Description & Impact */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="md:col-span-2">
            <Field label="Detailed Intelligence Log" required>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Log specific field metrics and narrative notes..."
                className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-all resize-none p-4"
              />
            </Field>
          </div>

          <div className="space-y-6">
            <Field label="Impact Count">
              <input
                type="number"
                value={formData.affectedCount}
                onChange={(e) => setFormData({ ...formData, affectedCount: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
              />
            </Field>

            <Field label="Evidence Photos">
              <motion.div 
                className="relative h-28 w-full bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-all overflow-hidden group"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFormData({ ...formData, photos: e.target.files })}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <motion.span 
                  className="text-xl mb-1"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📸
                </motion.span>
                <span className="text-[9px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest transition-colors">
                  {formData.photos?.length > 0 ? `${formData.photos.length} Selected` : "Attach Media File"}
                </span>
              </motion.div>
            </Field>
          </div>
        </motion.div>

        {/* Submit Layout */}
        <motion.button
          type="submit"
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-[11px] transition-all shadow-md relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Finalize & Deploy Intelligence Log
        </motion.button>
      </div>
    </motion.form>
  );
}

// ============ SECTION HEADER COMPONENT ============
function SectionHeader({ title }) {
  return (
    <motion.p
      className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <motion.span
        className="w-1 h-1 bg-slate-400 rounded-full"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {title}
    </motion.p>
  );
}

// ============ FIELD COMPONENT ============
function Field({ label, children, required }) {
  return (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <label className="text-slate-900 text-[10px] font-black uppercase tracking-widest ml-0.5 flex items-center gap-1.5">
        {label}
        {required && (
          <motion.span
            className="w-1 h-1 bg-slate-900 rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </label>
      {children}
    </motion.div>
  );
}

// ============ REPORTS VIEW COMPONENT ============
function ReportsView({
  activeTab,
  allReports,
  myReports,
  canVerify,
  canDelete,
  handleVerify,
  handleDelete,
  containerVariants,
}) {
  const getReportsToShow = () => {
    if (activeTab === "yourreports") return myReports || [];
    if (activeTab === "pending") return (allReports || []).filter((r) => !r.verified);
    return allReports || [];
  };

  const reports = getReportsToShow();

  return (
    <motion.div
      key="reports-view"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="popLayout">
        {reports.map((entry, idx) => (
          <ReportCard
            key={entry._id}
            entry={entry}
            index={idx}
            canVerify={canVerify}
            canDelete={canDelete}
            onVerify={handleVerify}
            onDelete={handleDelete}
            highlight={activeTab === "pending" || activeTab === "yourreports"}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// ============ REPORT CARD COMPONENT ============
function ReportCard({ entry, index, canVerify, canDelete, onVerify, onDelete, highlight }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: "-40px" });

  const handleOpenModal = () => {
    if (entry.photos && entry.photos.length > 0) {
      const photoPath = entry.photos[0].url;
      const imageUrl = photoPath.startsWith("http") ? photoPath : `${ASSET_URL}${photoPath}`;
      setSelectedImage(imageUrl);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        className={`group bg-white rounded-xl border p-6 transition-all duration-300 relative overflow-hidden ${
          highlight 
            ? "border-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.04)]" 
            : "border-slate-200 shadow-sm hover:border-slate-900"
        }`}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.04, 0.2) }}
        whileHover={{ y: -5 }}
      >
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div >
              {getCategoryIcon(entry.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <h4 className="text-slate-900 font-bold text-base truncate tracking-tight">
                  {entry.location}
                </h4>
                <motion.span 
                  className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                    entry.verified 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                      : "bg-amber-50 border-amber-200 text-amber-600"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: index * 0.05 }}
                >
                  {entry.verified ? "Verified" : "Pending"}
                </motion.span>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                By {entry.submittedBy} • {new Date(entry.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed mb-5 font-medium line-clamp-2">
            {entry.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-5 text-[8px] font-black uppercase tracking-wider">
            <span className={`px-2.5 py-1 rounded border ${getCategoryBg(entry.category)}`}>
              {entry.category}
            </span>
            <span className={`px-2.5 py-1 rounded border ${getUrgencyColor(entry.urgency)}`}>
              {entry.urgency}
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-900 text-white border border-slate-900">
              👥 {Number(entry.affectedCount).toLocaleString()} IMPACTED
            </span>
          </div>

          {/* GPS Coordinates Field */}
          {entry.gpsCoordinates?.latitude && entry.gpsCoordinates?.longitude && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">📍 Coordinates Registry</p>
              <p className="text-[10px] text-slate-700 font-mono font-bold">
                {entry.gpsCoordinates.latitude.toFixed(6)}, {entry.gpsCoordinates.longitude.toFixed(6)}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleOpenModal}
              disabled={!entry.photos || entry.photos.length === 0}
              className={`w-full py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border transition-all ${
                entry.photos && entry.photos.length > 0
                  ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-400"
                  : "bg-slate-50/50 text-slate-300 border-transparent cursor-not-allowed"
              }`}
            >
              {entry.photos?.length > 0 ? `View Evidence (${entry.photos.length})` : "No Evidence Registered"}
            </button>

            {(canVerify || canDelete) && (
              <div className="flex gap-2">
                {!entry.verified && canVerify && (
                  <button
                    onClick={() => onVerify(entry._id)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm"
                  >
                    Authorize Node
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(entry._id)}
                    className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 border border-transparent hover:border-rose-300 rounded-lg transition-all text-sm"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imgSrc={selectedImage}
        location={entry.location}
      />
    </>
  );
}

// ============ IMAGE MODAL COMPONENT ============
function ImageModal({ isOpen, onClose, imgSrc, location }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-xl border border-slate-200"
            initial={{ scale: 0.96, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white border border-slate-200 text-slate-700 rounded-full flex items-center justify-center hover:border-slate-900 text-xs font-bold transition-all"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col">
              <div className="bg-slate-50 p-5 border-b border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Field Evidence Registry</p>
                <h3 className="text-slate-900 font-bold text-base tracking-tight">{location}</h3>
              </div>

              <div className="p-4 bg-white flex items-center justify-center min-h-[260px] max-h-[60vh] overflow-hidden">
                <img
                  src={imgSrc}
                  alt="Field Evidence"
                  className="max-w-full max-h-[50vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.jp/24/334155/ffffff/600x400.png?text=Evidence+Not+Found";
                  }}
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}