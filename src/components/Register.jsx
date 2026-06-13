import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

export default function Register({ onRegister, onSwitchToLogin, onBack }) {
  const [formData, setFormData] = useState({
    name: "",
    gender:"",
    email: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
    organization: "",
    phone: "",
    skills: "",
    availability: "full-time",
    location: "",
    region: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [autocomplete, setAutocomplete] = useState(null);

  const roles = [
    {
      id: "volunteer",
      label: "Volunteer",
      icon: "👷",
    },
    {
      id: "viewer",
      label: "Viewer",
      icon: "👁️",
    },
  ];

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onLoad = (autoC) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();

    let city = "";
    let state = "";

    place.address_components?.forEach((component) => {
      const types = component.types;

      // CITY
      if (types.includes("locality")) {
        city = component.long_name;
      }

      // FALLBACK CITY
      if (!city && types.includes("administrative_area_level_2")) {
        city = component.long_name;
      }

      // STATE
      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }
    });

    // Final fallback
    if (!city && place.name) {
      city = place.name;
    }

    setFormData((prev) => ({
      ...prev,
      location: city,
      region: state,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");

      return;
    }

    setLoading(true);

    try {
      const processedData = {
        ...formData,

        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== ""),

        status: "available",

        joinedDate: new Date().toISOString(),
      };

      await onRegister(processedData);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className="min-h-screen bg-[#FDFCFE] flex items-center justify-center px-4 py-16 relative overflow-hidden">
        <style
          dangerouslySetInnerHTML={{
            __html: `

        .input-field-refined {
          width: 100%;
          background: white;
          border: 2px solid #F1F5F9;
          padding: 0.875rem 1.25rem;
          border-radius: 1.25rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          color: #1E293B;
        }

        .input-field-refined:focus {
          outline: none;
          border-color: #8E7CC3;
          box-shadow: 0 0 0 4px rgba(142, 124, 195, 0.1);
          transform: translateY(-2px);
        }

        .role-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid #F1F5F9;
          cursor: pointer;
        }

        .role-active {
          border-color: #8E7CC3;
          background: #F3F0FF;
          transform: translateY(-5px);

          box-shadow:
            0 10px 20px -5px
            rgba(142, 124, 195, 0.15);
        }

      `,
          }}
        />

        <div className="relative z-10 w-full max-w-3xl">
          {onBack && (
            <button
              onClick={onBack}
              className="fixed top-6 left-6 group flex items-center gap-2 text-slate-400 hover:text-[#8E7CC3] text-[11px] font-black uppercase tracking-[0.2em] mb-10 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-[#8E7CC3] group-hover:text-white transition-all">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              Back to Home
            </button>
          )}

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Create <span className="text-[#8E7CC3]">Account</span>
            </h1>

            <p className="text-slate-400 text-sm font-semibold mt-2 tracking-wide">
              Enter your profile details to join
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] p-8 md:p-14 shadow-2xl border border-white">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Full Name"
                    className="input-field-refined"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Gender
                  </label>

                  <select
                    value={formData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="input-field-refined"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="email@example.com"
                    className="input-field-refined"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Phone Number"
                    className="input-field-refined"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    City
                  </label>

                  <Autocomplete
                    onLoad={onLoad}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      componentRestrictions: {
                        country: "in",
                      },
                    }}
                  >
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="Search city"
                      className="input-field-refined"
                    />
                  </Autocomplete>
                </div>

                {/* State */}
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    State
                  </label>

                  <input
                    type="text"
                    value={formData.region}
                    readOnly
                    placeholder="Auto detected state"
                    className="input-field-refined bg-slate-50"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="••••••••"
                      className="input-field-refined pr-12"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateField("confirmPassword", e.target.value)
                      }
                      placeholder="••••••••"
                      className="input-field-refined pr-12"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Section */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="text-center">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block">
                    System Role
                  </label>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Select your account access level
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => updateField("role", role.id)}
                      className={`role-card p-4 rounded-2xl text-center ${
                        formData.role === role.id ? "role-active" : "bg-white"
                      }`}
                    >
                      <div className="text-2xl mb-2">{role.icon}</div>

                      <div
                        className={`text-[10px] font-black uppercase tracking-tighter ${
                          formData.role === role.id
                            ? "text-[#8E7CC3]"
                            : "text-slate-400"
                        }`}
                      >
                        {role.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#8E7CC3] text-white rounded-[1.5rem] text-[11px] uppercase tracking-[0.4em] font-black shadow-lg shadow-[#8E7CC3]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
              >
                {loading ? "Processing..." : "Complete Registration"}
              </button>
            </form>

            <div className="mt-10 text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-slate-400 text-xs font-bold hover:text-[#8E7CC3] transition-colors"
              >
                Already a member?{" "}
                <span className="text-[#8E7CC3] underline underline-offset-8 ml-1">
                  Sign In
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}
