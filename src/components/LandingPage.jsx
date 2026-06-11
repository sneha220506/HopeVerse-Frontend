import { needsAPI, volunteersAPI, tasksAPI } from "../services/api";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef } from "react";

export default function LandingPage({ onLogin, onRegister }) {
  const [communityNeeds, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFeature, setActiveFeature] = useState(0);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const fetchData = async () => {
    try {
      const [needsRes, volRes, taskRes] = await Promise.all([
        needsAPI.getAll(),
        volunteersAPI.getAll(),
        tasksAPI.getAll(),
      ]);
      setNeeds(needsRes.data || needsRes);
      setVolunteers(volRes.data || volRes);
      setTasks(taskRes.data || taskRes);
      setError("");
    } catch (err) {
      setError("Please refresh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = communityNeeds.filter((n) => n.urgency === "critical").length;
  const totalAffected = communityNeeds.reduce((s, n) => s + n.affectedPeople, 0);
  const totalHours = volunteers.reduce((s, v) => s + v.hoursLogged, 0);

  // Enhanced Loading UI with Framer Motion
  if (loading)
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-[#F4F2FF] via-white to-primary/5 flex flex-col items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Animated background orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        <div className="relative z-10">
          {/* Multi-ring loader */}
          <div className="relative w-32 h-32">
            <motion.div
              className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-secondary/20 border-t-secondary rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 border-4 border-accent/20 border-t-accent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-5xl">🤝</span>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="mt-12 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.p
            className="text-primary font-black uppercase tracking-[0.4em] text-xs mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Initializing Community Network
          </motion.p>
          <div className="flex gap-2 justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F2FF] via-white to-primary/5 text-slate-dark selection:bg-primary/20 overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent z-[200] origin-left"
        style={{ scaleX }}
      />

      {/* Enhanced Navbar */}
      <NavBar onLogin={onLogin} onRegister={onRegister} />

      {/* Hero Section */}
      <HeroSection
        onLogin={onLogin}
        onRegister={onRegister}
        communityNeeds={communityNeeds}
        volunteers={volunteers}
        tasks={tasks}
        totalAffected={totalAffected}
      />

      {/* Features Section */}
      <FeaturesSection activeFeature={activeFeature} setActiveFeature={setActiveFeature} />

      {/* Roles Section */}
      <RolesSection />

      {/* Impact Section */}
      <ImpactSection />

      {/* CTA Section */}
      <CTASection onLogin={onLogin} onRegister={onRegister} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

// ============ NAVBAR COMPONENT ============
function NavBar({ onLogin, onRegister }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-2xl shadow-xl border-b border-primary/20"
          : "bg-white/40 backdrop-blur-xl border-b border-primary/10"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative w-12 h-12 bg-gradient-to-br from-primary via-secondary to-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30"
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-white text-2xl">🤝</span>
              </motion.div>
            </div>
            <span className="text-slate-dark font-heading font-bold text-2xl tracking-tight">
              Hope
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Verse
              </span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Roles", "Impact"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-slate-dark/70 hover:text-primary text-sm font-bold transition-colors"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                whileHover={{ y: -2 }}
              >
                {item}
                <motion.div
                  className="absolute bottom-[-4px] left-0 h-[2px] bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}

            <div className="h-6 w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

            <motion.button
              onClick={onLogin}
              className="text-slate-dark/70 hover:text-slate-dark text-sm font-bold transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Sign In
            </motion.button>

            <motion.button
              onClick={onRegister}
              className="relative px-7 py-3 bg-gradient-to-r from-primary via-secondary to-primary rounded-full text-white text-sm font-bold shadow-xl shadow-primary/30 overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(218, 170, 238, 0.81)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="relative z-10">Get Started</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// ============ HERO SECTION ============
function HeroSection({ onLogin, onRegister, communityNeeds, volunteers, tasks, totalAffected }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Dynamic Background with Parallax */}
      <motion.div className="absolute inset-0 overflow-hidden" style={{ y }}>
        <motion.div
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-primary/20 via-secondary/15 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-accent/20 via-success/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-40 left-20 w-20 h-20 border-2 border-primary/20 rounded-2xl"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-60 right-32 w-16 h-16 border-2 border-secondary/20 rounded-full"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/3 w-12 h-12 border-2 border-accent/20 rounded-lg"
          animate={{
            y: [0, -15, 0],
            rotate: [45, 225, 405],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #bc91db 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </motion.div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ opacity }}
      >
        {/* Hero Content */}
        <div className="text-center mb-20">

          {/* Main Heading */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-extrabold leading-[1.05] text-slate-dark tracking-tighter">
                Smart Resource
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-extrabold leading-[1.05] tracking-tighter italic bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent py-2">
                Allocation
              </h1>
            </motion.div>
          </div>

          {/* Subheading */}
          <motion.p
            className="text-slate-dark/60 text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Transform scattered community data into{" "}
            <motion.span
              className="text-primary font-bold"
              whileHover={{ scale: 1.05 }}
              style={{ display: "inline-block" }}
            >
              actionable insights
            </motion.span>
            . Intelligently match hearts with needs through{" "}
            <motion.span
              className="text-secondary font-bold"
              whileHover={{ scale: 1.05 }}
              style={{ display: "inline-block" }}
            >
              data-driven empathy
            </motion.span>
            .
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.button
              onClick={onRegister}
              className="group relative px-10 py-5 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl text-white text-lg font-bold shadow-2xl shadow-primary/30 overflow-hidden"
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span>Start Volunteering</span>
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.button>

            <motion.button
              onClick={onLogin}
              className="group px-10 py-5 bg-white/80 backdrop-blur-xl text-slate-dark rounded-2xl text-lg font-bold shadow-xl border-2 border-primary/20 relative overflow-hidden"
              whileHover={{
                scale: 1.05,
                y: -5,
                backgroundColor: "rgba(255, 255, 255, 1)",
                borderColor: "rgba(79, 70, 229, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span>View Demo</span>
                <motion.svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                >
                  <path d="M8 5v14l11-7z" />
                </motion.svg>
              </span>
            </motion.button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {[
              {
                value: communityNeeds.length || "24",
                label: "Active Needs",
                icon: "📋",
                color: "from-blue-500/20 to-blue-500/10",
              },
              {
                value: volunteers.length || "1.2k",
                label: "Volunteers",
                icon: "👥",
                color: "from-primary/20 to-primary/10",
              },
              {
                value: `${(totalAffected / 1000).toFixed(1)}K`,
                label: "People Helped",
                icon: "🏘️",
                color: "from-secondary/20 to-secondary/10",
              },
              {
                value: tasks.length || "850",
                label: "Tasks Done",
                icon: "✅",
                color: "from-success/20 to-success/10",
              },
            ].map((stat, i) => (
              <StatCard key={i} {...stat} index={i} />
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1 h-3 bg-primary rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}

// ============ STAT CARD COMPONENT ============
function StatCard({ value, label, icon, color, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="group bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-primary/10 p-8 shadow-xl cursor-pointer relative overflow-hidden"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring" }}
      whileHover={{
        y: -10,
        scale: 1.05,
        borderColor: "rgba(79, 70, 229, 0.3)",
        boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-4xl shadow-lg`}
            whileHover={{ scale: 1.2, rotate: 12 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {icon}
          </motion.div>
          <motion.div
            className="px-3 py-1 bg-success/10 rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xs font-black text-success">● LIVE</span>
          </motion.div>
        </div>

        <motion.div
          className="text-5xl font-heading font-black text-slate-dark mb-2 tracking-tight"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.3, type: "spring" }}
        >
          {value}
        </motion.div>

        <div className="text-xs font-black text-slate-dark/50 uppercase tracking-wider">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

// ============ FEATURES SECTION ============
function FeaturesSection({ activeFeature, setActiveFeature }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const features = [
    {
      icon: "🗺️",
      title: "Interactive Needs Map",
      desc: "Visualize urgency across zones with high-fidelity interactive mapping and real-time updates.",
      color: "from-blue-500/20 via-blue-500/10 to-transparent",
      highlight: "border-blue-500/30",
    },
    {
      icon: "👥",
      title: "Volunteer Directory",
      desc: "Manage volunteers by granular skill sets, real-time availability, location, and expertise.",
      color: "from-primary/20 via-primary/10 to-transparent",
      highlight: "border-primary/30",
    },
    {
      icon: "🤖",
      title: "Smart AI Matching",
      desc: "AI-driven matching engine using 7 weighted factors for optimal resource placement.",
      color: "from-purple-500/20 via-purple-500/10 to-transparent",
      highlight: "border-purple-500/30",
    },
    {
      icon: "📋",
      title: "Dynamic Task Board",
      desc: "Clean Kanban management with assignment tracking and automated monitoring.",
      color: "from-indigo-500/20 via-indigo-500/10 to-transparent",
      highlight: "border-indigo-500/30",
    },
    {
      icon: "📝",
      title: "Field Reports",
      desc: "Secure data collection from ground workers and community leaders with verification.",
      color: "from-orange-500/20 via-orange-500/10 to-transparent",
      highlight: "border-orange-500/30",
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      desc: "Deep-dive insights with regional performance charts and real-time impact metrics.",
      color: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      highlight: "border-emerald-500/30",
    },
  ];

  return (
    <section
      id="features"
      ref={ref}
      className="py-32 bg-white/50 backdrop-blur-sm relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-24">
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full border border-primary/20 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚡
            </motion.span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Platform Capabilities
            </span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-heading font-bold text-slate-dark mb-8 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Powerful Features
          </motion.h2>

          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
            <motion.div
              className="w-3 h-3 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="w-20 h-1 bg-gradient-to-r from-primary via-transparent to-transparent rounded-full" />
          </motion.div>

          <motion.p
            className="text-slate-dark/60 max-w-2xl mx-auto font-semibold text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Precision tools built for high-stakes coordination and maximum community impact.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              {...feature}
              index={i}
              isActive={activeFeature === i}
              onHover={() => setActiveFeature(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ FEATURE CARD ============
function FeatureCard({ icon, title, desc, color, highlight, index, isActive, onHover }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 border-2 ${
        isActive ? highlight : "border-primary/10"
      } shadow-xl cursor-pointer overflow-hidden`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{
        y: -15,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
      }}
      onMouseEnter={onHover}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0"
        initial={{ x: "-100%", opacity: 0 }}
        whileHover={{ x: "100%", opacity: 0.1 }}
        transition={{ duration: 0.8 }}
        style={{
          background: "linear-gradient(90deg, transparent, white, transparent)",
        }}
      />

      <div className="relative z-10">
        <motion.div
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-5xl mb-8 shadow-xl`}
          whileHover={{ scale: 1.15, rotate: 6 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>

        <motion.h3
          className="text-slate-dark font-heading font-bold text-2xl mb-4"
          animate={{ color: isActive ? "#4F46E5" : "#334155" }}
        >
          {title}
        </motion.h3>

        <p className="text-slate-dark/60 leading-relaxed font-medium mb-6">{desc}</p>

        {/* Hover indicator */}
        <motion.div
          className="flex items-center gap-2 text-primary"
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm font-bold">Learn more</span>
          <motion.svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </motion.svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============ ROLES SECTION ============
function RolesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const roles = [
    {
      role: "Admin",
      icon: "👑",
      gradient: "from-accent via-accent/80 to-accent/60",
      border: "border-accent/30",
      bg: "bg-accent/5",
      features: [
        "Full platform control",
        "User management",
        "Financial tracking",
        "System verification",
        "Security protocols",
      ],
    },
    {
      role: "Coordinator",
      icon: "👩‍💼",
      gradient: "from-primary via-primary/80 to-primary/60",
      border: "border-primary/30",
      bg: "bg-primary/5",
      features: [
        "Need & Task creation",
        "Volunteer assignment",
        "Match confirmation",
        "Regional analytics",
        "Resource allocation",
      ],
    },
    {
      role: "Volunteer",
      icon: "👷",
      gradient: "from-secondary via-secondary/80 to-secondary/60",
      border: "border-secondary/30",
      bg: "bg-secondary/5",
      features: [
        "Field report submission",
        "Local need viewing",
        "Task status updates",
        "Impact logging",
        "Community engagement",
      ],
    },
  ];

  return (
    <section id="roles" ref={ref} className="py-32 relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-24">
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 rounded-full border border-secondary/20 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔐
            </motion.span>
            <span className="text-xs font-black uppercase tracking-wider text-secondary">
              Access Control
            </span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-heading font-bold text-slate-dark mb-8 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Permission Profiles
          </motion.h2>

          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent rounded-full" />
            <motion.div
              className="w-3 h-3 bg-secondary rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="w-20 h-1 bg-gradient-to-r from-secondary via-transparent to-transparent rounded-full" />
          </motion.div>

          <motion.p
            className="text-slate-dark/60 max-w-2xl mx-auto font-semibold text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Secured access tailored to your organizational role with granular permissions.
          </motion.p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, i) => (
            <RoleCard key={i} {...role} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ ROLE CARD ============
function RoleCard({ role, icon, gradient, border, bg, features, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={`group relative rounded-[3rem] border-2 ${border} p-12 bg-white/90 backdrop-blur-xl shadow-2xl cursor-pointer overflow-hidden`}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -15 }}
      transition={{ duration: 0.8, delay: index * 0.15, type: "spring" }}
      whileHover={{
        y: -15,
        scale: 1.02,
        rotateX: 5,
        boxShadow: "0 30px 60px -15px rgba(79, 70, 229, 0.3)",
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Gradient glow */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-[3rem]`}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.15 }}
        transition={{ duration: 0.3 }}
      />

      {/* Icon */}
      <div className="relative mb-8">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-2xl`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className={`relative w-24 h-24 ${bg} rounded-3xl flex items-center justify-center text-6xl shadow-xl`}
          whileHover={{ scale: 1.15, rotate: 12 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
      </div>

      {/* Role title */}
      <motion.h3
        className="text-slate-dark font-heading font-bold text-4xl mb-8"
        whileHover={{ color: "#4F46E5" }}
      >
        {role}
      </motion.h3>

      {/* Features list */}
      <ul className="space-y-5 mb-8">
        {features.map((feature, i) => (
          <motion.li
            key={i}
            className="flex items-center gap-4 text-sm font-bold text-slate-dark/70"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: index * 0.15 + i * 0.05 }}
            whileHover={{ x: 5, color: "rgb(188, 154, 227)" }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`}
              whileHover={{ scale: 1.5 }}
            />
            {feature}
          </motion.li>
        ))}
      </ul>

      {/* Action button */}
      <motion.button
        className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider ${bg} border-2 ${border}`}
        initial={{ opacity: 0, y: 20 }}
        whileHover={{ opacity: 1, y: 0, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Learn More
      </motion.button>
    </motion.div>
  );
}

// ============ IMPACT SECTION ============
function ImpactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const impactStats = [
    {
      icon: "⚡",
      stat: "95%",
      label: "Faster Response Time",
      desc: "AI matching reduces coordination overhead",
    },
    {
      icon: "🎯",
      stat: "3.2x",
      label: "Resource Efficiency",
      desc: "Better allocation through data insights",
    },
    {
      icon: "❤️",
      stat: "50K+",
      label: "Lives Impacted",
      desc: "Communities served across regions",
    },
  ];

  return (
    <section
      id="impact"
      ref={ref}
      className="py-32 bg-gradient-to-br from-white via-primary/5 to-secondary/5 relative overflow-hidden"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-success/10 rounded-full border border-success/20 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌟
            </motion.span>
            <span className="text-xs font-black uppercase tracking-wider text-success">
              Real Impact
            </span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-heading font-bold text-slate-dark mb-8 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Making a Difference
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Impact Stats */}
          <div className="space-y-8">
            {impactStats.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-6 p-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-primary/10 shadow-xl"
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{
                  x: 10,
                  boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
                }}
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl flex-shrink-0"
                  whileHover={{ scale: 1.2, rotate: 12 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item.icon}
                </motion.div>
                <div>
                  <motion.div
                    className="text-4xl font-black text-primary mb-2"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.3, type: "spring" }}
                  >
                    {item.stat}
                  </motion.div>
                  <div className="text-lg font-bold text-slate-dark mb-1">{item.label}</div>
                  <div className="text-sm text-slate-dark/60">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[3rem] blur-2xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="relative bg-white rounded-[3rem] p-12 shadow-2xl border border-primary/20"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl shadow-xl"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  💬
                </motion.div>
                <div>
                  <div className="text-lg font-bold text-slate-dark">Community Leader</div>
                  <div className="text-sm text-slate-dark/60">Regional Coordinator</div>
                </div>
              </div>
              <p className="text-slate-dark/80 text-lg leading-relaxed italic mb-6">
                "HopeVerse transformed how we coordinate relief efforts. The AI matching saved
                us countless hours, and the real-time analytics helped us make data-driven
                decisions that actually work."
              </p>
              <motion.div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl text-yellow-400"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: i * 0.1 + 0.5, type: "spring" }}
                    whileHover={{ scale: 1.3, rotate: 10 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============ CTA SECTION ============
function CTASection({ onLogin, onRegister }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  return (
    <section ref={ref} className="py-32 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        {/* Animated glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-20 blur-3xl rounded-[4rem]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative bg-gradient-to-br from-primary via-secondary to-accent rounded-[4rem] p-16 md:p-24 text-center text-white shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {/* Animated grid overlay */}
          <motion.div
            className="absolute inset-0 opacity-10 pointer-events-none"
            animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Floating orbs */}
          <motion.div
            className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
            animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10">
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
            >
              <motion.span
                className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🚀
              </motion.span>
              <span className="text-xs font-black uppercase tracking-wider">Join the Movement</span>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-7xl font-heading font-bold mb-8 leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.3 }}
            >
              Ready to synchronize
              <br />
              your community impact?
            </motion.h2>

            <motion.p
              className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4 }}
            >
              Join thousands of volunteers and coordinators making a real difference with
              data-driven community engagement.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={onRegister}
                className="group px-12 py-6 bg-white text-primary rounded-2xl font-black text-xl shadow-xl relative overflow-hidden"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Create Your Account
                  <motion.svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </motion.svg>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>

              <motion.button
                onClick={onLogin}
                className="px-12 py-6 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-black text-xl border-2 border-white/30"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Platform
              </motion.button>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-8 text-white/80 text-sm flex-wrap"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.6 }}
            >
              {["Free to start", "No credit card", "24/7 support"].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ FOOTER ============
function Footer() {
  return (
    <footer className="py-20 border-t border-primary/10 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-6 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-xl blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="relative w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-xl"
                  whileHover={{ rotate: 12 }}
                >
                  <span className="text-white text-xl">🤝</span>
                </motion.div>
              </div>
              <span className="text-slate-dark font-bold text-xl">HopeVerse</span>
            </motion.div>
            <p className="text-slate-dark/60 mb-6 max-w-md leading-relaxed">
              Empowering communities through intelligent resource allocation and data-driven
              coordination. Building a better tomorrow, together.
            </p>
            <div className="flex gap-4">
              {["twitter", "github", "linkedin"].map((social, i) => (
                <motion.a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="text-xl">
                    {social === "twitter" && "🐦"}
                    {social === "github" && "💻"}
                    {social === "linkedin" && "💼"}
                  </span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-dark mb-4 uppercase tracking-wider text-sm">
              Platform
            </h4>
            <ul className="space-y-3">
              {["Features", "Pricing", "Security", "Documentation"].map((link, i) => (
                <motion.li
                  key={link}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <motion.a
                    href="#"
                    className="text-slate-dark/60 hover:text-primary transition-colors text-sm font-medium"
                    whileHover={{ x: 5 }}
                  >
                    {link}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-slate-dark mb-4 uppercase tracking-wider text-sm">
              Support
            </h4>
            <ul className="space-y-3">
              {["Help Center", "Contact Us", "Status", "Privacy"].map((link, i) => (
                <motion.li
                  key={link}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <motion.a
                    href="#"
                    className="text-slate-dark/60 hover:text-primary transition-colors text-sm font-medium"
                    whileHover={{ x: 5 }}
                  >
                    {link}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-slate-dark/40 text-xs font-bold uppercase tracking-widest">
            © 2026 HopeVerse. All rights reserved.
          </p>
          <div className="flex gap-6 text-slate-dark/40 text-xs font-bold uppercase tracking-wider">
            {["Terms", "Privacy", "Cookies"].map((link, i) => (
              <motion.a
                key={link}
                href="#"
                className="hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.6 }}
              >
                {link}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}