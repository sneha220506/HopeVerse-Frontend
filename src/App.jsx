import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import CommunityNeeds from "./components/CommunityNeeds";
import VolunteerDirectory from "./components/VolunteerDirectory";
import SmartMatching from "./components/SmartMatching";
import TaskBoard from "./components/TaskBoard";
import SurveyForm from "./components/SurveyForm";
import Analytics from "./components/Analytics";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword"; 
import { checkBackendHealth } from "./services/api";
import VerifyEmail from "./components/VerifyEmail";
import { initiateSocketConnection, disconnectSocket } from "./services/socket";
import { Toaster } from "react-hot-toast";
import { LoadScriptNext } from "@react-google-maps/api";
import Settings from "./components/Settings";

const libraries = ["places"];

// ============================================
// ROLE PERMISSIONS - Single Source of Truth
// ============================================
const ROLE_PERMISSIONS = {
  admin: {
    label: "Administrator",
    canDeletevolunteer: true,
    canViewDashboard: true,
    canViewNeeds: true,
    canCreateNeed: true,
    canViewVolunteers: true,
    canViewMatching: true,
    canViewTasks: true,
    canViewSurvey: true,
    canViewAnalytics: true,
  },
  coordinator: {
    label: "Coordinator",
    canSubmitSurvey: true,
    canViewDashboard: true,
    canViewNeeds: true,
    canViewVolunteers: true,
    canViewMatching: true,
    canViewTasks: true,
    canViewSurvey: true,
    canViewAnalytics: true,
  },
  volunteer: {
    label: "Volunteer",
    canViewDashboard: true,
    canViewNeeds: true,
    canViewVolunteers: true,
    canViewMatching: false,
    canViewTasks: true,
    canViewSurvey: true,
    canViewAnalytics: false,
    canviewsettings: true,
  },
  viewer: {
    label: "viewer",
    canViewDashboard: true,
    canViewSurvey: true,
  },
};

const DEMO_USERS = {
  "admin@hopeverse.org": {
    id: "u1",
    name: "System Admin",
    email: "admin@hopeverse.org",
    password: "admin123",
    role: "admin",
    avatar: "👑",
    organization: "HopeVerse HQ",
  },
  "sarah@hopeverse.org": {
    id: "u2",
    name: "Sarah Miller",
    email: "sarah@hopeverse.org",
    password: "password123",
    role: "coordinator",
    avatar: "👩‍💼",
    organization: "Regional Relief",
  },
  "volunteer@example.com": {
    id: "u4",
    name: "Alex Volunteer",
    email: "volunteer@example.com",
    password: "password123",
    role: "volunteer",
    avatar: "🙋",
    organization: "General Corps",
  },
};

export default function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [backendStatus, setBackendStatus] = useState(false);
  const [authView, setAuthView] = useState("landing");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [verifyEmail, setVerifyEmail] = useState("");

  // Deep Link Reset Token Parameters State
  const [resetToken, setResetToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  // Derived permissions
  const perms = user
    ? ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.viewer
    : ROLE_PERMISSIONS.viewer;

  useEffect(() => {
    // Only connect if user is authenticated and backend is up
    if (user && user.id && backendStatus) {
      initiateSocketConnection(user);
    }

    // Cleanup: Disconnect when user logs out or app unmounts
    return () => {
      disconnectSocket();
    };
  }, [user, backendStatus]);

  useEffect(() => {
    const init = async () => {
      try {
        const health = await checkBackendHealth();
        setBackendStatus(health.connected);
      } catch {
        setBackendStatus(false);
      }

      // --- PATH-BASED DEEP LINK INTERCEPTION PROTOCOL ---
      // Intercepts custom formatted links like: https://hopeverse01.web.app/reset/:token
      const currentPath = window.location.pathname;
      if (currentPath.includes("/reset/")) {
        const tokenFromPath = currentPath.split("/reset/")[1];
        if (tokenFromPath) {
          setResetToken(tokenFromPath);
          setResetEmail(""); // Set by context dynamically if needed later
          setAuthView("reset-password"); // Push viewport layout to update submission state
          setAuthLoading(false);
          return;
        }
      }
      // --------------------------------------------------

      const stored = localStorage.getItem("HopeVerse_user");
      if (stored) {
        setUser(JSON.parse(stored));
        setAuthView("authenticated");
      }
      setAuthLoading(false);
    };
    init();

    const iv = setInterval(async () => {
      try {
        const health = await checkBackendHealth();
        setBackendStatus(health.connected);
      } catch {
        setBackendStatus(false);
      }
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  const doLogin = async (email, pw) => {
    // 1. Try Live Auth
    if (backendStatus) {
      try {
        const { authAPI } = await import("./services/api");
        const d = await authAPI.login(email, pw);
        localStorage.setItem("HopeVerse_token", d.token);
        localStorage.setItem("HopeVerse_user", JSON.stringify(d.user));
        setUser(d.user);
        setAuthView("authenticated");
        setActiveSection("dashboard");
        return;
      } catch (err) {
        console.warn("Live login failed, checking demo...");
      }
    }

    // 2. Demo Fallback
    const demo = DEMO_USERS[email.toLowerCase()];
    if (demo && demo.password === pw) {
      const u = { ...demo };
      delete u.password;
      localStorage.setItem("HopeVerse_user", JSON.stringify(u));
      setUser(u);
      setAuthView("authenticated");
      setActiveSection("dashboard");
    } else {
      throw new Error(
        "Invalid credentials. Check connection or try demo account.",
      );
    }
  };

  const doRegister = async (data) => {
    if (backendStatus) {
      try {
        const { authAPI } = await import("./services/api");
        const d = await authAPI.register(data);
        localStorage.setItem("HopeVerse_token", d.token);
        localStorage.setItem("HopeVerse_user", JSON.stringify(d.user));
        setUser(d.user);
        setVerifyEmail(data.email);
        setAuthView("verify");
        return;
      } catch (e) {
        throw new Error(e.message);
      }
    }
    const u = {
      id: "u" + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role || "viewer",
      avatar: "👤",
      organization: data.organization || "",
    };
    localStorage.setItem("HopeVerse_user", JSON.stringify(u));
    setUser(u);
    setAuthView("authenticated");
    setActiveSection("dashboard");
  };

  const doLogout = () => {
    disconnectSocket();
    localStorage.clear();
    setUser(null);
    setAuthView("landing");
    setActiveSection("dashboard");
    // Purges path strings safely back to clean core base routing path
    window.history.replaceState({}, document.title, "/");
  };

  const go = (s) => {
    setActiveSection(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVerify = async (email, otp) => {
    try {
      const { authAPI } = await import("./services/api");
      const d = await authAPI.verifyOTP(email, otp);

      if (!d || !d.user) {
        throw new Error("User data not received");
      }

      localStorage.setItem("HopeVerse_token", d.token);
      localStorage.setItem("HopeVerse_user", JSON.stringify(d.user));

      setUser(d.user); 
      setAuthView("authenticated");
      setActiveSection("dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleResendOTP = async (email) => {
    try {
      const { authAPI } = await import("./services/api");
      await authAPI.resendOTP(email);
      alert("OTP resent successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading) return <LoadingScreen />;

  // ============================================
  // AUTH VIEWS ROUTING MATRIX
  // ============================================
  if (authView === "landing")
    return (
      <LandingPage
        onLogin={() => setAuthView("login")}
        onRegister={() => setAuthView("register")}
      />
    );
  if (authView === "login")
    return (
      <Login
        onLogin={doLogin}
        onSwitchToRegister={() => setAuthView("register")}
        onForgotPassword={() => setAuthView("reset-request")}
        onBack={() => setAuthView("landing")}
      />
    );
  if (authView === "register")
    return (
      <Register
        onRegister={doRegister}
        onSwitchToLogin={() => setAuthView("login")}
        onBack={() => setAuthView("landing")}
      />
    );
  if (authView === "verify")
    return (
      <VerifyEmail
        email={verifyEmail}
        onVerify={handleVerify}
        onResendOTP={handleResendOTP}
      />
    );
    
  if (authView === "reset-request" || authView === "reset-password")
    return (
      <ResetPassword
        mode={authView === "reset-request" ? "request" : "submit"}
        token={resetToken}
        email={resetEmail}
        onBackToLogin={() => {
          // Clears out path artifacts dynamically on viewport cancel action
          window.history.replaceState({}, document.title, "/");
          setAuthView("login");
        }}
      />
    );

  // ============================================
  // MAIN APP NAVIGATION DATA BLOCK
  // ============================================
  const renderSection = () => {
    const config = {
      dashboard: {
        comp: <Dashboard onNavigate={go} permissions={perms} />,
        view: true,
      },
      needs: {
        comp: <CommunityNeeds onNavigate={go} permissions={perms} />,
        view: perms.canViewNeeds,
      },
      volunteers: {
        comp: <VolunteerDirectory onNavigate={go} permissions={perms} />,
        view: perms.canViewVolunteers,
      },
      matching: {
        comp: <SmartMatching permissions={perms} />,
        view: perms.canViewMatching,
      },
      tasks: {
        comp: <TaskBoard permissions={perms} />,
        view: perms.canViewTasks,
      },
      survey: {
        comp: <SurveyForm permissions={perms} user={user}/>,
        view: perms.canViewSurvey,
      },
      analytics: {
        comp: <Analytics permissions={perms} />,
        view: perms.canViewAnalytics,
      },
      settings: {
        comp: <Settings user={user} permissions={perms} />,
        view: true,
      },
      verifyEmail: { comp: <VerifyEmail />, view: true },
    };

    const target = config[activeSection] || config.dashboard;

    // Security Gate: Redirect if no permission
    if (!target.view) {
      setTimeout(() => setActiveSection("dashboard"), 0);
      return config.dashboard.comp;
    }

    return target.comp;
  };

  return (
    <LoadScriptNext
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className="min-h-screen bg-[#f8f2fc] text-slate-200">
        <Toaster position="top-right" />
        <Navbar
          activeSection={activeSection}
          onNavigate={go}
          backendStatus={backendStatus}
          user={user}
          onLogout={doLogout}
          perms={perms}
        />

        {/* Section Animation Wrapper */}
        <div className="transition-all duration-500 ease-in-out ">
          {renderSection()}
        </div>
      </main>
        
      <Footer />
    </div>
    </LoadScriptNext>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#f8f2fc] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border border-slate-700 mb-6 mx-auto animate-pulse">
          <span className="text-3xl">🤝</span>
        </div>
        <div className="space-y-2">
          <p className="text-white font-bold tracking-widest uppercase text-xs">
            HopeVerse
          </p>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Decrypting Network...
          </p>
        </div>
      </div>
    </div>
  );
}