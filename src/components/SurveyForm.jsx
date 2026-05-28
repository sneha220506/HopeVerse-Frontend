import { useEffect, useState, useRef } from "react";
import { surveysAPI } from "../services/api";
import {
  getCategoryIcon,
  getCategoryBg,
  getUrgencyColor,
} from "../utils/helpers";
import {
  LoadScript,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";

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

  const isAdminOrCoordinator =
    permissions?.label === "Administrator" ||
    permissions?.label === "Coordinator";
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
          alert(
            "Unable to get your current location. Please search or click on the map.",
          );
        },
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
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();

      if (data.results && data.results[0]) {
        const topResult = data.results[0];
        let { city, state } = parseAddressComponents(
          topResult.address_components,
        );

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
      const reportsArray = Array.isArray(response)
        ? response
        : response?.data || [];
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
      report.submitterId &&
      user?.id &&
      String(report.submitterId) === String(user.id),
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
      alert(
        "Field Intelligence Transmission Failed. Please check connectivity.",
      );
    }
  };

  const handleVerify = async (id) => {
    try {
      await surveysAPI.verify(id);
      setAllReports((prev) =>
        prev.map((r) => (r._id === id ? { ...r, verified: true } : r)),
      );
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

  return (
    <section className="py-12 bg-surface min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📝</span>
              <h2 className="text-3xl font-heading font-bold text-slate-dark tracking-tight">
                Field Intelligence
              </h2>
            </div>
            <p className="text-slate-dark/40 text-sm font-medium italic">
              Synchronized with Secure Cloud Database
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
          <TabButton
            active={activeTab === "form"}
            onClick={() => setActiveTab("form")}
            label="New Entry"
            icon="✍️"
          />
          <TabButton
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
            label={`All Reports (${(allReports || []).length})`}
            icon="📊"
          />
          {p?.canViewSurvey && (
            <TabButton
              active={activeTab === "yourreports"}
              onClick={() => setActiveTab("yourreports")}
              label={`Your Reports (${(myReports || []).length})`}
              icon="📊"
            />
          )}
          {isAdminOrCoordinator && (
            <TabButton
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
              label={`Review (${(allReports || []).filter((r) => !r.verified).length})`}
              icon="⏳"
            />
          )}
        </div>

        <div className="transition-all duration-500">
          {activeTab === "form" && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              {submitted ? (
                <div className="bg-white rounded-[3rem] border border-primary/10 p-16 text-center shadow-soft">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                    ✅
                  </div>
                  <h3 className="text-2xl font-bold text-slate-dark mb-3">
                    Transmission Successful
                  </h3>
                  <p className="text-slate-dark/40 font-medium">
                    Report saved to database with GPS coordinates.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="relative bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-soft space-y-10 overflow-hidden"
                >
                  {/* Section 0: Identity */}
                  <div className="border-b border-slate-100 pb-8">
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-6">
                      Section 00: Reporter Identity
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Field label="Your Name" required>
                        <input
                          type="text"
                          required
                          readOnly
                          value={formData.submittedBy || ""}
                          placeholder="e.g. Raj K."
                          className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold placeholder:text-slate-400 transition-all duration-300"
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Section 1: Location & Interactive Map Integration */}
                  <div className="space-y-6">
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">
                      Section 01: Location Parameters
                    </p>

                    {/* 1. Stripped away <LoadScript> wrapper to avoid instantiation conflicts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Target Location Input */}
                      <Field label="Target Location (Search)" required>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-50 z-10">
                            📍
                          </span>
                          <Autocomplete
                            onLoad={onLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                              componentRestrictions: { country: "in" },
                            }}
                          >
                            <input
                              type="text"
                              required
                              value={formData.location}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  location: e.target.value,
                                })
                              }
                              placeholder="Search city"
                              className="input-field-refined pl-12 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold placeholder:text-slate-400 transition-all duration-300 w-full"
                            />
                          </Autocomplete>
                        </div>
                      </Field>

                      {/* State Input */}
                      <Field label="Administrative Region" required>
                        <input
                          type="text"
                          required
                          readOnly
                          value={formData.region}
                          placeholder="Auto detected state"
                          className="input-field-refined bg-slate-50 border-2 border-transparent text-slate-900 font-bold w-full"
                        />
                      </Field>
                    </div>

                    {/* Full Address Display */}
                    {formData.fullAddress && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                          Full Address
                        </p>
                        <p className="text-sm text-slate-700 font-medium">
                          {formData.fullAddress}
                        </p>
                      </div>
                    )}

                    {/* Location Selection Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowMapSelector(!showMapSelector)}
                        className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:brightness-110 transition-all flex items-center gap-2 shadow-lg"
                      >
                        <span>🗺️</span>
                        {showMapSelector ? "Hide Map" : "Select on Map"}
                      </button>

                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-slate-700 transition-all flex items-center gap-2 shadow-lg"
                      >
                        <span>📍</span>
                        Use My Location
                      </button>
                    </div>

                    {/* Map Display Window */}
                    {showMapSelector && (
                      <div className="w-full space-y-4 animate-fade-in">
                        <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl relative">
                          {/* 2. Directly tracking the map setup wrapper */}
                          {typeof window !== "undefined" &&
                          window.google?.maps ? (
                            <GoogleMap
                              mapContainerStyle={{
                                width: "100%",
                                height: "100%",
                              }}
                              center={mapCenter}
                              zoom={markerPosition ? 14 : 5}
                              onLoad={(map) => {
                                mapRef.current = map;
                              }}
                              onClick={(e) =>
                                handleMapLocationChange(
                                  e.latLng.lat(),
                                  e.latLng.lng(),
                                )
                              }
                              options={{
                                streetViewControl: false,
                                mapTypeControl: true,
                                fullscreenControl: true,
                                zoomControl: true,
                              }}
                            >
                              {markerPosition && (
                                <Marker
                                  position={markerPosition}
                                  draggable={true}
                                  onDragEnd={(e) =>
                                    handleMapLocationChange(
                                      e.latLng.lat(),
                                      e.latLng.lng(),
                                    )
                                  }
                                  animation={
                                    window.google?.maps?.Animation?.DROP
                                  }
                                />
                              )}
                            </GoogleMap>
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center animate-pulse text-xs font-black uppercase text-slate-400">
                              Initializing Spatial Context Engine...
                            </div>
                          )}

                          {!markerPosition && (
                            <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                              <div className="bg-white/95 px-8 py-6 rounded-2xl shadow-xl border-2 border-primary/20 max-w-md text-center">
                                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900 mb-2">
                                  🎯 Interactive Map Mode
                                </p>
                                <p className="text-[10px] text-slate-600 font-medium">
                                  Click anywhere on the map to pin your location
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {markerPosition && (
                          <div className="bg-gradient-to-r from-emerald-50 to-primary/5 border-2 border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl font-black text-emerald-600">
                              ✓
                            </div>
                            <div className="flex-1">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">
                                Location Selected
                              </p>
                              <p className="text-sm font-bold text-slate-900">
                                {formData.location || "Unknown Location"},{" "}
                                {formData.region || "..."}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium mt-1">
                                Coordinates: {markerPosition.lat.toFixed(6)},{" "}
                                {markerPosition.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        )}

                        <p className="text-[10px] text-slate-400 italic text-center">
                          💡 <strong>Tip:</strong> Click the map, drag the pin,
                          or use "My Location" for precise positioning
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Category & Survey Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <Field label="Intelligence Category" required>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold appearance-none w-full"
                      >
                        <option value="">Choose category</option>
                        {[
                          "healthcare",
                          "education",
                          "food",
                          "shelter",
                          "environment",
                          "disaster",
                        ].map((c) => (
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            surveyType: e.target.value,
                          })
                        }
                        className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold appearance-none w-full"
                      >
                        <option value="">Choose Type</option>
                        {[
                          "door-to-door",
                          "community-meeting",
                          "phone-survey",
                          "online",
                          "observation",
                          "other",
                          "interview",
                        ].map((c) => (
                          <option key={c} value={c}>
                            {getCategoryIcon(c)} {c.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {/* Urgency Protocol */}
                  <Field label="Urgency Protocol" required>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["low", "medium", "high", "critical"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, urgency: level })
                          }
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${
                            formData.urgency === level
                              ? level === "critical"
                                ? "bg-rose-600 border-rose-600 text-white shadow-lg"
                                : "bg-primary border-primary text-white shadow-lg"
                              : "bg-slate-50 border-transparent text-slate-500 hover:border-slate-200"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Logs & Impact */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <Field label="Detailed Intelligence Log" required>
                        <textarea
                          required
                          rows={5}
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Log specific observations..."
                          className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 resize-none p-5 w-full"
                        />
                      </Field>
                    </div>

                    <div className="space-y-6">
                      <Field label="Impact Count">
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.affectedCount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                affectedCount: e.target.value,
                              })
                            }
                            placeholder="0"
                            className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold pr-12 w-full"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">
                            QTY
                          </span>
                        </div>
                      </Field>

                      <Field label="Evidence Photos">
                        <div className="group relative h-32 w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-primary/30 transition-all">
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                photos: e.target.files,
                              })
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                            📸
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {formData.photos?.length > 0
                              ? `${formData.photos.length} files`
                              : "Attach Files"}
                          </span>
                        </div>
                      </Field>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-6 bg-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] text-white hover:bg-primary transition-all duration-500 shadow-xl shadow-slate-900/10"
                  >
                    Finalize & Push Survey
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Reports Display Section */}
          {(activeTab === "reports" || activeTab === "pending") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {isLoading ? (
                <div className="col-span-full py-32 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.4em]">
                  Synchronizing Master Registry...
                </div>
              ) : (
                (activeTab === "reports"
                  ? allReports || []
                  : (allReports || []).filter((r) => !r.verified)
                ).map((entry) => (
                  <ReportCard
                    key={entry._id}
                    entry={entry}
                    canVerify={canVerify}
                    canDelete={canDelete}
                    onVerify={handleVerify}
                    onDelete={handleDelete}
                    highlight={activeTab === "pending"}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === "yourreports" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {isLoading ? (
                <div className="col-span-full py-32 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.4em]">
                  Synchronizing Master Registry...
                </div>
              ) : (
                (myReports || []).map((entry) => (
                  <ReportCard
                    key={entry._id}
                    entry={entry}
                    canVerify={canVerify}
                    canDelete={canDelete}
                    onVerify={handleVerify}
                    onDelete={handleDelete}
                    highlight={true}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Helper Components
function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
        active
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "bg-white text-slate-dark/40 border border-primary/5 hover:border-primary/20 hover:text-slate-dark"
      }`}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

function Field({ label, children, required }) {
  return (
    <div className="space-y-2">
      <label className="text-slate-900 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
        {label}{" "}
        {required && (
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
        )}
      </label>
      {children}
    </div>
  );
}

function ReportCard({
  entry,
  canVerify,
  canDelete,
  onVerify,
  onDelete,
  highlight,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const handleOpenModal = () => {
    if (entry.photos && entry.photos.length > 0) {
      const photoPath = entry.photos[0].url;
      const imageUrl = photoPath.startsWith("http")
        ? photoPath
        : `${ASSET_URL}${photoPath}`;
      setSelectedImage(imageUrl);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className={`group bg-white rounded-[2rem] border p-7 transition-all duration-300 hover:shadow-soft ${highlight ? "ring-2 ring-primary ring-offset-4 ring-offset-surface" : "border-white shadow-sm hover:border-primary/20"}`}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-primary/5">
            {getCategoryIcon(entry.category)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-slate-dark font-bold text-base truncate">
                {entry.location}
              </h4>
              <span
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${entry.verified ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500 animate-pulse"}`}
              >
                {entry.verified ? "Verified" : "Pending"}
              </span>
            </div>
            <p className="text-slate-dark/30 text-[10px] font-bold uppercase tracking-tight italic">
              By {entry.submittedBy} •{" "}
              {new Date(entry.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <p className="text-slate-dark/60 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
          {entry.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-6 text-[9px] font-black uppercase">
          <span
            className={`px-3 py-1.5 rounded-xl border ${getCategoryBg(entry.category)}`}
          >
            {entry.category}
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl border ${getUrgencyColor(entry.urgency)}`}
          >
            {entry.urgency}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-dark text-white">
            👥 {Number(entry.affectedCount).toLocaleString()} IMPACTED
          </span>
        </div>

        {/* GPS Coordinates Display */}
        {entry.gpsCoordinates?.latitude && entry.gpsCoordinates?.longitude && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">
              📍 GPS Location
            </p>
            <p className="text-[10px] text-blue-800 font-mono">
              {entry.gpsCoordinates.latitude.toFixed(6)},{" "}
              {entry.gpsCoordinates.longitude.toFixed(6)}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleOpenModal}
            disabled={!entry.photos || entry.photos.length === 0}
            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all ${entry.photos && entry.photos.length > 0 ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200" : "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent"}`}
          >
            📸{" "}
            {entry.photos?.length > 0
              ? `View Evidence (${entry.photos.length})`
              : "No Evidence"}
          </button>
          {(canVerify || canDelete) && (
            <div className="flex gap-3">
              {!entry.verified && canVerify && (
                <button
                  onClick={() => onVerify(entry._id)}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all"
                >
                  Authorize
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => onDelete(entry._id)}
                  className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-100 transition-colors text-lg"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imgSrc={selectedImage}
        location={entry.location}
      />
    </>
  );
}

function ImageModal({ isOpen, onClose, imgSrc, location }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/10 hover:bg-black/20 text-slate-900 rounded-full flex items-center justify-center transition-colors text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col">
          <div className="bg-slate-50 p-6 border-b border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
              Field Evidence Preview
            </p>
            <h3 className="text-slate-dark font-bold text-lg">{location}</h3>
          </div>
          <div className="p-4 bg-white flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
            <img
              src={imgSrc}
              alt="Field Evidence"
              className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.jp/24/334155/ffffff/600x400.png?text=Evidence+Not+Found";
              }}
            />
          </div>
          <div className="p-6 bg-slate-50 flex justify-center">
            <button
              onClick={onClose}
              className="px-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary transition-all duration-300"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
