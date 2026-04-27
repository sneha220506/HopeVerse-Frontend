import { useEffect, useState } from "react";
import { surveysAPI } from "../services/api";
import {
  getCategoryIcon,
  getCategoryBg,
  getUrgencyColor,
} from "../utils/helpers";
const ASSET_URL = "http://localhost:5000";

export default function SurveyForm({ permissions }) {
  const [formData, setFormData] = useState({
    submittedBy: "",
    submitterId: "",
    location: "",
    region: "",
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

  const isAdminOrCoordinator =
    permissions?.label === "Administrator" ||
    permissions?.label === "Coordinator";
  const canVerify = isAdminOrCoordinator;
  const canDelete = isAdminOrCoordinator;

  useEffect(() => {
    loadReports();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // Data appending logic (same as before)
      Object.keys(formData).forEach((key) => {
        if (key !== "photos" && key !== "affectedCount") {
          data.append(key, formData[key]);
        }
      });
      data.append("affectedCount", Number(formData.affectedCount) || 0);

      if (formData.photos && formData.photos.length > 0) {
        for (let i = 0; i < formData.photos.length; i++) {
          data.append("photos", formData.photos[i]);
        }
      }

      data.append("date", new Date().toISOString());
      data.append("verified", false);

      // API Call
      const response = await surveysAPI.submit(data);
      const savedReport = response.data; // Response se data extract karein

      // 1. New report list mein add karein
      setAllReports((prev) => [savedReport, ...prev]);

      // 2. Success message dikhayein
      setSubmitted(true);

      // 3. Form clear karein
      setFormData({
        submittedBy: "",
        submitterId: "",
        location: "",
        region: "",
        category: "",
        description: "",
        affectedCount: "",
        urgency: "medium",
        surveyType: "observation",
        source: "field-report",
        photos: [],
      });

      // 4. Delay ke baad Reports tab par redirect karein
      setTimeout(() => {
        setSubmitted(false); // Success state reset
        setActiveTab("reports"); // Redirect to Reports tab
      }, 2000); // 2 seconds ka pause message padhne ke liye
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
                    Report saved to database.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="relative bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 shadow-soft space-y-10 overflow-hidden"
                >
                  {/* Section 0: Identity - Refined CSS */}
                  <div className="border-b border-slate-100 pb-8">
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-6">
                      Section 00: Reporter Identity
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Field label="volunteer Name" required>
                        <input
                          type="text"
                          required
                          value={formData.submittedBy}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              submittedBy: e.target.value,
                            })
                          }
                          placeholder="e.g. Raj K."
                          className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold placeholder:text-slate-400 transition-all duration-300"
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Section 1: Location & Region */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <Field label="Target Location" required>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-50">
                          📍
                        </span>
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
                          placeholder="District/Sector"
                          className="input-field-refined pl-12 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold placeholder:text-slate-400 transition-all duration-300"
                        />
                      </div>
                    </Field>

                    <Field label="Administrative Region" required>
                      <select
                        required
                        value={formData.region}
                        onChange={(e) =>
                          setFormData({ ...formData, region: e.target.value })
                        }
                        className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold appearance-none cursor-pointer"
                      >
                        <option value="">Select Region</option>
                        <option value="North Zone">North Zone</option>
                        <option value="South Zone">South Zone</option>
                        <option value="East Zone">East Zone</option>
                        <option value="West Zone">West Zone</option>
                      </select>
                    </Field>
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
                        className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold appearance-none"
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
                      <div className="flex bg-slate-50 p-1 rounded-2xl gap-1">
                        {["observation", "interview", "sensor"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, surveyType: type })
                            }
                            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                              formData.surveyType === type
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>

                  {/* Urgency Protocol - Refined Critical Style */}
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
                          className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 resize-none p-5"
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
                            className="input-field-refined bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white text-slate-900 font-bold pr-12"
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

          {/* Reports Section */}
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
        </div>
      </div>
    </section>
  );
}

// Reusable Components
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
              {entry.verified ? (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-tighter">
                  Verified
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-50 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-tighter animate-pulse">
                  Pending
                </span>
              )}
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

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleOpenModal}
            disabled={!entry.photos || entry.photos.length === 0}
            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all ${
              entry.photos && entry.photos.length > 0
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                : "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent"
            }`}
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

      {/* Modal Component Call */}
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
                // FIXED FALLBACK URL
                e.target.onerror = null; // Infinite loop rokne ke liye
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
              Close Intelligence Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
