import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { tasksAPI, volunteersAPI } from "../services/api";
import { useRef } from "react";
import {
  getCategoryIcon,
  getUrgencyColor,
  getStatusColor,
} from "../utils/helpers";

export default function TaskBoard({ permissions, user }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI Navigation Engine States
  const [currentView, setCurrentView] = useState("board");
  const [activeCategory, setActiveCategory] = useState(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Initial Data Load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, volunteersData] = await Promise.all([
          tasksAPI.getAll(),
          volunteersAPI.getAll(),
        ]);
        setAllTasks(Array.isArray(tasksData) ? tasksData : tasksData.data || []);
        setAllVolunteers(
          Array.isArray(volunteersData) ? volunteersData : volunteersData.data || []
        );
      } catch (error) {
        console.error("Operational Fetch Failure:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      status: "pending",
      label: "Pending",
      color: "border-amber-400",
      bg: "bg-amber-50/50",
      text: "text-amber-600",
      icon: "⏳",
      gradient: "from-amber-500/20 to-amber-500/5",
    },
    {
      status: "assigned",
      label: "Assigned",
      color: "border-primary",
      bg: "bg-primary/5",
      text: "text-primary",
      icon: "📌",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      status: "in-progress",
      label: "Active",
      color: "border-blue-400",
      bg: "bg-blue-50/50",
      text: "text-blue-600",
      icon: "🔄",
      gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
      status: "completed",
      label: "Completed",
      color: "border-emerald-400",
      bg: "bg-emerald-50/50",
      text: "text-emerald-600",
      icon: "✅",
      gradient: "from-emerald-500/20 to-emerald-500/5",
    },
  ];

  const statusPermissions = {
    all: true,
    pending: permissions?.canViewAnalytics,
    assigned: permissions?.label === "Volunteer",
    "in-progress": permissions?.canViewAnalytics,
    completed: true,
  };

  const filteredTasks =
    filterStatus === "all"
      ? allTasks
      : allTasks.filter((t) => t.status === filterStatus);

  const getVolDetails = (id) => allVolunteers.find((v) => v._id === id);

  const progress = (t) =>
    t.status === "completed"
      ? 100
      : t.status === "in-progress"
        ? 60
        : t.status === "assigned"
          ? 30
          : 10;

  const availableVolunteers = allVolunteers.filter((v) => v.status === "active");

  const handleAssignVolunteer = async (taskId, volunteerId) => {
    try {
      await tasksAPI.assignVolunteer(taskId, volunteerId);
      setAllTasks((prev) =>
        prev.map((task) => {
          if (task._id === taskId) {
            const newAssigned = [...task.assignedVolunteers, volunteerId];
            const newStatus =
              newAssigned.length >= task.volunteersRequired ? "in-progress" : "assigned";
            return {
              ...task,
              assignedVolunteers: newAssigned,
              status: newStatus,
            };
          }
          return task;
        })
      );
      setShowAssignModal(null);
    } catch (err) {
      alert("Personnel Deployment Failed: " + err.message);
    }
  };

  const handleActivateTask = async (taskId) => {
    try {
      await tasksAPI.updateStatus(taskId, "in-progress");
      setAllTasks((prev) =>
        prev.map((task) => (task._id === taskId ? { ...task, status: "in-progress" } : task))
      );
    } catch (err) {
      alert("Activation Protocol Failed: " + err.message);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await tasksAPI.complete(taskId);
      setAllTasks((prev) =>
        prev.map((task) => (task._id === taskId ? { ...task, status: "completed" } : task))
      );
    } catch (err) {
      alert("Resolution Protocol Failed: " + err.message);
    }
  };

  const handleNextTask = () => {
    const contextTasks = activeCategory
      ? allTasks.filter((t) => t.status === activeCategory)
      : filteredTasks;
    const currentIndex = contextTasks.findIndex((t) => t._id === selectedTask);
    if (currentIndex !== -1 && currentIndex < contextTasks.length - 1) {
      setSelectedTask(contextTasks[currentIndex + 1]._id);
    } else if (contextTasks.length > 0) {
      setSelectedTask(contextTasks[0]._id);
    }
  };

  const handlePrevTask = () => {
    const contextTasks = activeCategory
      ? allTasks.filter((t) => t.status === activeCategory)
      : filteredTasks;
    const currentIndex = contextTasks.findIndex((t) => t._id === selectedTask);
    if (currentIndex > 0) {
      setSelectedTask(contextTasks[currentIndex - 1]._id);
    } else if (contextTasks.length > 0) {
      setSelectedTask(contextTasks[contextTasks.length - 1]._id);
    }
  };

  // Global Interactive Physics Mouse Hooks for Smooth Card Rotation
  const handleMouseMovePhysics = (e, targetEl) => {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const coordinateX = e.clientX - rect.left - rect.width / 2;
    const coordinateY = e.clientY - rect.top - rect.height / 2;

    // Apply high-end 3D translation angles
    targetEl.style.transform = `perspective(1000px) rotateX(${-coordinateY * 0.08}deg) rotateY(${coordinateX * 0.08}deg) translateY(-6px)`;
    
    const operationalGlow = targetEl.querySelector(".card-magnetic-glow");
    if (operationalGlow) {
      operationalGlow.style.left = `${e.clientX - rect.left}px`;
      operationalGlow.style.top = `${e.clientY - rect.top}px`;
      operationalGlow.style.opacity = "1";
    }
  };

  const handleMouseLeavePhysics = (targetEl) => {
    if (!targetEl) return;
    targetEl.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    const operationalGlow = targetEl.querySelector(".card-magnetic-glow");
    if (operationalGlow) operationalGlow.style.opacity = "0";
  };

  if (isLoading)
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F8FAFC] via-white to-primary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-24 h-24 mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div className="absolute inset-0 flex items-center justify-center text-4xl">
            📋
          </motion.div>
        </motion.div>
        <motion.p
          className="font-black text-primary tracking-[0.3em] uppercase text-xs"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Synchronizing Operations...
          </motion.p>
      </motion.div>
    );

  const currentFocusedTaskInstance = allTasks.find((t) => t._id === selectedTask);

  return (
    <section className="py-12 min-h-screen relative overflow-x-hidden bg-[#F8FAFC]">
      {/* Configuration Stylesheet for Advanced Micro-Interactions */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes slowFluidFloat {
            0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.14; }
            33% { transform: translateY(-40px) scale(1.1) rotate(5deg); opacity: 0.22; }
            66% { transform: translateY(20px) scale(0.92) rotate(-4deg); opacity: 0.16; }
          }
          @keyframes slowFluidFloatReverse {
            0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.12; }
            50% { transform: translateY(50px) scale(1.15) rotate(-8deg); opacity: 0.20; }
          }
          .ambient-fluid-particle-1 {
            position: fixed; top: 10%; left: 5%; width: 550px; height: 550px;
            background: radial-gradient(circle, #4F46E5 0%, transparent 70%);
            filter: blur(90px); pointer-events: none; z-index: 0;
            animation: slowFluidFloat 15s ease-in-out infinite;
          }
          .ambient-fluid-particle-2 {
            position: fixed; bottom: 5%; right: 2%; width: 600px; height: 600px;
            background: radial-gradient(circle, #7C3AED 0%, transparent 70%);
            filter: blur(100px); pointer-events: none; z-index: 0;
            animation: slowFluidFloatReverse 19s ease-in-out infinite;
          }
          .ambient-fluid-particle-3 {
            position: fixed; top: 45%; left: 55%; width: 450px; height: 450px;
            background: radial-gradient(circle, #EC4899 0%, transparent 70%);
            filter: blur(85px); pointer-events: none; z-index: 0;
            animation: slowFluidFloat 25s ease-in-out infinite alternate;
          }
          .card-magnetic-glow {
            position: absolute; width: 250px; height: 250px; 
            background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 75%);
            border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; opacity: 0; transition: opacity 0.3s ease;
          }
          .interactive-card-element {
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            transform-style: preserve-3d;
          }
        `,
        }}
      />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent z-[200] origin-left"
        style={{ scaleX }}
      />

      {/* Fixed Background Fluid Dynamic Aurora Ecosystem */}
      <div className="ambient-fluid-particle-1" />
      <div className="ambient-fluid-particle-2" />
      <div className="ambient-fluid-particle-3" />

      {/* Main Scrollable Content Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatePresence mode="wait">
          {/* BOARD VIEW */}
          {currentView === "board" && (
            <motion.div
              key="board-view"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header Section */}
              <motion.div
                className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div>
                  <motion.h2
                    className="text-5xl font-heading font-black text-slate-dark tracking-tighter"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Task <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Operations</span>
                  </motion.h2>
                  <motion.p
                    className="text-slate-dark/40 font-bold text-sm mt-3 max-w-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {permissions?.canAssignVolunteer
                      ? "High-level tactical layout management."
                      : "Real-time observation of support operations."}
                  </motion.p>
                </div>

                <motion.div
                  className="flex bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-100 shadow-xl overflow-x-auto max-w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {["all", "pending", "assigned", "in-progress", "completed"]
                    .filter((status) => statusPermissions[status])
                    .map((s, i) => (
                      <motion.button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                          filterStatus === s
                            ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                            : "text-slate-dark/30 hover:text-primary hover:bg-slate-50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                      >
                        {s === "all" ? "View All" : s.replace("-", " ")}
                      </motion.button>
                    ))}
                </motion.div>
              </motion.div>

              {/* Horizontal Task Lanes */}
              <div className="space-y-12">
                {columns
                  .filter((col) => statusPermissions[col.status])
                  .filter((col) => filterStatus === "all" || filterStatus === col.status)
                  .map((col, colIdx) => {
                    const colTasks = filteredTasks.filter((t) => t.status === col.status);
                    return (
                      <TaskLane
                        key={col.status}
                        col={col}
                        colIdx={colIdx}
                        colTasks={colTasks}
                        permissions={permissions}
                        getCategoryIcon={getCategoryIcon}
                        getVolDetails={getVolDetails}
                        progress={progress}
                        handleComplete={handleComplete}
                        setSelectedTask={setSelectedTask}
                        setCurrentView={setCurrentView}
                        setActiveCategory={setActiveCategory}
                        handleMouseMovePhysics={handleMouseMovePhysics}
                        handleMouseLeavePhysics={handleMouseLeavePhysics}
                      />
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* FOCUSED TASK VIEW */}
          {currentView === "focused_task" && currentFocusedTaskInstance && (
            <FocusedTaskView
              task={currentFocusedTaskInstance}
              permissions={permissions}
              activeCategory={activeCategory}
              setCurrentView={setCurrentView}
              handlePrevTask={handlePrevTask}
              handleNextTask={handleNextTask}
              getCategoryIcon={getCategoryIcon}
              progress={progress}
              getVolDetails={getVolDetails}
              handleActivateTask={handleActivateTask}
              setShowAssignModal={setShowAssignModal}
              handleComplete={handleComplete}
            />
          )}

          {/* CATEGORY VIEW */}
          {currentView === "category_view" && activeCategory && (
            <CategoryView
              activeCategory={activeCategory}
              allTasks={allTasks}
              setCurrentView={setCurrentView}
              setActiveCategory={setActiveCategory}
              setSelectedTask={setSelectedTask}
              permissions={permissions}
              getCategoryIcon={getCategoryIcon}
              progress={progress}
              handleComplete={handleComplete}
              handleMouseMovePhysics={handleMouseMovePhysics}
              handleMouseLeavePhysics={handleMouseLeavePhysics}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <AssignmentModal
            showAssignModal={showAssignModal}
            setShowAssignModal={setShowAssignModal}
            allTasks={allTasks}
            availableVolunteers={availableVolunteers}
            handleAssignVolunteer={handleAssignVolunteer}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ============ TASK LANE COMPONENT ============
function TaskLane({
  col,
  colIdx,
  colTasks,
  permissions,
  getCategoryIcon,
  getVolDetails,
  progress,
  handleComplete,
  setSelectedTask,
  setCurrentView,
  setActiveCategory,
  handleMouseMovePhysics,
  handleMouseLeavePhysics,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 border border-slate-100/80 shadow-[0_20px_50px_rgba(0,0,0,0.02)] w-full"
      initial={{ opacity: 0, y: 70, scale: 0.98 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 70, scale: 0.98 }}
      exit={{ opacity: 0, y: -70, scale: 0.98 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Lane Header */}
      <motion.div
        className={`mb-6 px-6 py-4 rounded-2xl border-b-4 ${col.color} bg-gradient-to-r ${col.gradient} flex items-center justify-between shadow-lg relative overflow-hidden`}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        <div className="flex items-center gap-3 min-w-0 relative z-10">
          <motion.span
            className="text-xl flex-shrink-0"
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {col.icon}
          </motion.span>
          <span className={`${col.text} font-black text-sm uppercase tracking-wider truncate`}>
            {col.label} Sector
          </span>
          <motion.span
            className="bg-white text-slate-800/80 text-xs font-black px-2.5 py-0.5 rounded-md border border-slate-100 shadow-xs ml-2"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
          >
            {colTasks.length}
          </motion.span>
        </div>

        <motion.button
          onClick={() => {
            setActiveCategory(col.status);
            setCurrentView("category_view");
          }}
          className={`px-4 py-2 bg-white ${col.text} border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg relative z-10`}
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)" }}
          whileTap={{ scale: 0.95 }}
        >
          View All
        </motion.button>
      </motion.div>

      {/* Horizontal Scrolling Task Cards */}
      <div className="flex gap-6 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory scroll-smooth">
        <AnimatePresence>
          {colTasks.map((task, taskIdx) => (
            <TaskCard
              key={task._id}
              task={task}
              taskIdx={taskIdx}
              colIdx={colIdx}
              permissions={permissions}
              getCategoryIcon={getCategoryIcon}
              getVolDetails={getVolDetails}
              progress={progress}
              handleComplete={handleComplete}
              handleMouseMovePhysics={handleMouseMovePhysics}
              handleMouseLeavePhysics={handleMouseLeavePhysics}
              onClick={() => {
                setSelectedTask(task._id);
                setCurrentView("focused_task");
              }}
            />
          ))}
        </AnimatePresence>

        {colTasks.length === 0 && (
          <motion.div
            className="border-2 border-dashed border-slate-200/60 rounded-2xl py-8 text-center bg-white/40 min-w-[310px] flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="text-2xl mb-1 opacity-40"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🏝️
            </motion.div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block px-4">
              No Operational Load
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ============ TASK CARD COMPONENT ============
function TaskCard({
  task,
  taskIdx,
  colIdx,
  permissions,
  getCategoryIcon,
  getVolDetails,
  progress,
  handleComplete,
  handleMouseMovePhysics,
  handleMouseLeavePhysics,
  onClick,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="interactive-card-element relative bg-white rounded-2xl border-2 border-slate-100/80 shadow-[0_10px_30px_rgba(0,0,0,0.02)] cursor-pointer select-none group w-[310px] flex-shrink-0 snap-start overflow-hidden"
      initial={{ opacity: 0, x: 50, scale: 0.94 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 50, scale: 0.94 }}
      exit={{ opacity: 0, x: -50, scale: 0.94 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(taskIdx * 0.05, 0.3) }}
      onMouseMove={(e) => handleMouseMovePhysics(e, ref.current)}
      onMouseLeave={() => handleMouseLeavePhysics(ref.current)}
      whileHover={{
        boxShadow: "0 30px 60px -15px rgba(79, 70, 229, 0.25)",
      }}
      onClick={onClick}
    >
      {/* Interactive Laser Glow Node */}
      <div className="card-magnetic-glow" />

      {/* Internal Shimmer Wave on Entry */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ x: "-100%" }}
        animate={isInView ? { x: "100%" } : { x: "-100%" }}
        transition={{ duration: 1.2, ease: "linear" }}
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        }}
      />

      <div className="p-5 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <motion.div
            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100 shadow-xs"
            whileHover={{ scale: 1.15, rotate: 12 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {getCategoryIcon(task.category)}
          </motion.div>
          <div className="flex items-center gap-2">
            {task.status === "in-progress" && permissions?.canCompleteTask && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete(task._id);
                }}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✓ Complete
              </motion.button>
            )}
            <motion.span
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                task.urgency?.toLowerCase() === "critical"
                  ? "bg-red-50 border-red-200 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  : task.urgency?.toLowerCase() === "high"
                    ? "bg-orange-50 border-orange-200 text-orange-600"
                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
              }`}
              animate={
                task.urgency?.toLowerCase() === "critical"
                  ? { scale: [1, 1.06, 1] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {task.urgency}
            </motion.span>
          </div>
        </div>

        <h4 className="text-slate-800 text-base font-extrabold leading-snug mb-1.5 tracking-tight group-hover:text-primary transition-colors duration-200 truncate">
          {task.title}
        </h4>
        <p className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5 mb-4 truncate">
          <span className="text-sm">📍</span> {task.location}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wide">
            <span className="text-slate-400 uppercase text-[9px]">Progress</span>
            <motion.span
              className="text-primary font-black"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {progress(task)}%
            </motion.span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className={`h-full rounded-full ${
                task.status === "completed"
                  ? "bg-emerald-500 animate-pulse"
                  : task.status === "in-progress"
                    ? "bg-primary"
                    : "bg-primary/40"
              }`}
              initial={{ width: 0 }}
              animate={isInView ? { width: `${progress(task)}%` } : { width: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            />
          </div>
        </div>

        {/* Team Section */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex -space-x-2 overflow-hidden">
            <AnimatePresence>
              {task.assignedVolunteers.map((vId, i) => {
                const vol = getVolDetails(vId);
                return (
                  <motion.div
                    key={vId}
                    className="w-8 h-8 rounded-lg bg-white border-2 border-white flex items-center justify-center text-base shadow-xs ring-1 ring-slate-100"
                    title={vol?.name}
                    initial={{ opacity: 0, scale: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0, x: -20 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.25, zIndex: 10 }}
                  >
                    {vol?.avatar || "👤"}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {task.assignedVolunteers.length < task.volunteersRequired && (
              <motion.div
                className="w-8 h-8 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400"
                whileHover={{ scale: 1.2, borderColor: "#4F46E5", backgroundColor: "#F4F2FF" }}
              >
                +
              </motion.div>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-700 font-extrabold tracking-tight leading-none">
              {task.assignedVolunteers.length}/{task.volunteersRequired}
            </p>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Personnel
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============ FOCUSED TASK VIEW COMPONENT ============
function FocusedTaskView({
  task,
  permissions,
  activeCategory,
  setCurrentView,
  handlePrevTask,
  handleNextTask,
  getCategoryIcon,
  progress,
  getVolDetails,
  handleActivateTask,
  setShowAssignModal,
  handleComplete,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      key="focused-task"
      className="max-w-3xl mx-auto space-y-6"
      initial={{ opacity: 0, scale: 0.93, y: 40 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.93, y: 40 }}
      exit={{ opacity: 0, scale: 0.93, y: -40 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Control Strip */}
      <motion.div
        className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-100 shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ delay: 0.1 }}
      >
        <motion.button
          onClick={() => {
            setCurrentView(activeCategory ? "category_view" : "board");
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to List
        </motion.button>

        <div className="flex gap-3">
          <motion.button
            onClick={handlePrevTask}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest"
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            ◀ Prev
          </motion.button>
          <motion.button
            onClick={handleNextTask}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest"
            whileHover={{ scale: 1.05, x: 4 }}
            whileTap={{ scale: 0.95 }}
          >
            Next ▶
          </motion.button>
        </div>
      </motion.div>

      {/* Task Detail Card */}
      <motion.div
        className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-slate-100 shadow-2xl p-8 md:p-10 relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
      >
        {/* Ambient Internal Glow Element */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10">
          <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 pb-6 mb-6">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-3xl border border-slate-200 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 12 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {getCategoryIcon(task.category)}
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                  {task.title}
                </h3>
                <p className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                  📍 {task.location}
                </p>
              </div>
            </motion.div>

            <motion.span
              className="text-black font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              Priority: {task.urgency}
            </motion.span>
          </div>

          {/* Task Details */}
          <div className="space-y-6">
            <motion.div
              className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-100 shadow-inner"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block mb-2">
                Description
              </span>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                "{task.description}"
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block mb-1">
                  Status
                </span>
                <span className="text-xs font-black text-black uppercase tracking-wider">
                  {task.status}
                </span>
              </motion.div>

              <motion.div
                className="p-4 bg-gradient-to-br from-primary/5 to-white rounded-xl border border-primary/20 shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block mb-1">
                  Progress
                </span>
                <motion.span
                  className="text-xs font-black text-primary"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  {progress(task)}%
                </motion.span>
              </motion.div>
            </div>

            {/* Team Roster */}
            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block mb-3">
                Assigned Team
              </span>
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {task.assignedVolunteers.map((vId, i) => {
                    const vol = getVolDetails(vId);
                    return (
                      <motion.div
                        key={vId}
                        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-lg"
                        initial={{ opacity: 0, scale: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0, x: -20 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                      >
                        <span className="text-lg">{vol?.avatar || "👤"}</span>
                        <span className="text-xs font-bold text-slate-700">{vol?.name}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.7 }}
          >
            {permissions?.label === "Volunteer" && task.status === "assigned" && (
              <motion.button
                onClick={() => handleActivateTask(task._id)}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl relative overflow-hidden group"
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative z-10">⚡ Activate Task</span>
              </motion.button>
            )}

            {permissions?.canAssignVolunteer &&
              task.assignedVolunteers.length < task.volunteersRequired && (
                <motion.button
                  onClick={() => setShowAssignModal(task._id)}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl relative overflow-hidden"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">👥 Deploy Personnel</span>
                </motion.button>
              )}

            {permissions?.canCompleteTask && task.status === "in-progress" && (
              <motion.button
                onClick={() => handleComplete(task._id)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xl"
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                ✓ Finalize & Resolve Task
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============ CATEGORY VIEW COMPONENT ============
function CategoryView({
  activeCategory,
  allTasks,
  setCurrentView,
  setActiveCategory,
  setSelectedTask,
  permissions,
  getCategoryIcon,
  progress,
  handleComplete,
  handleMouseMovePhysics,
  handleMouseLeavePhysics,
}) {
  const categoryTasks = allTasks.filter((t) => t.status === activeCategory);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      key="category-view"
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center flex-wrap gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <motion.button
            onClick={() => {
              setCurrentView("board");
              setActiveCategory(null);
            }}
            className="text-xs font-black text-primary tracking-widest uppercase mb-1 hover:underline block"
            whileHover={{ x: -5 }}
          >
            ← Back to Task Board
          </motion.button>
          <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {activeCategory.replace("-", " ")}
            </span>{" "}
            Tasks
          </h3>
        </div>
        <motion.span
          className="px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl text-primary font-black text-sm border border-primary/20"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          {categoryTasks.length} Tasks
        </motion.span>
      </motion.div>

      {/* Task Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence>
          {categoryTasks.map((task, idx) => {
            const cardRef = useRef(null);
            return (
              <motion.div
                key={task._id}
                ref={cardRef}
                onClick={() => {
                  setSelectedTask(task._id);
                  setCurrentView("focused_task");
                }}
                className="interactive-card-element relative bg-white rounded-2xl border-2 border-slate-100/70 shadow-lg cursor-pointer p-5 group overflow-hidden"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: idx * 0.04 }}
                onMouseMove={(e) => handleMouseMovePhysics(e, cardRef.current)}
                onMouseLeave={() => handleMouseLeavePhysics(cardRef.current)}
                whileHover={{
                  boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)",
                }}
              >
                <div className="card-magnetic-glow" />

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <motion.div
                      className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100"
                      whileHover={{ scale: 1.15, rotate: 12 }}
                    >
                      {getCategoryIcon(task.category)}
                    </motion.div>
                    {task.status === "in-progress" && permissions?.canCompleteTask && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(task._id);
                        }}
                        className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ✓ Complete
                      </motion.button>
                    )}
                  </div>

                  <h4 className="text-slate-800 text-base font-extrabold leading-snug mb-1.5 truncate group-hover:text-primary transition-colors">
                    {task.title}
                  </h4>
                  <p className="text-slate-400 text-[11px] font-semibold mb-4 truncate">
                    📍 {task.location}
                  </p>

                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${progress(task)}%` } : { width: 0 }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[11px] text-slate-700 font-extrabold">
                      {task.assignedVolunteers.length}/{task.volunteersRequired} Personnel
                    </span>
                    <motion.span
                      className="text-[9px] font-black uppercase text-primary"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      View →
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ============ ASSIGNMENT MODAL COMPONENT ============
function AssignmentModal({
  showAssignModal,
  setShowAssignModal,
  allTasks,
  availableVolunteers,
  handleAssignVolunteer,
}) {
  const task = allTasks.find((t) => t._id === showAssignModal);

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowAssignModal(null)}
      />

      <motion.div
        className="relative bg-white/95 backdrop-blur-2xl rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Header */}
        <div className="px-12 py-10 border-b border-slate-100 flex items-center justify-between">
          <div>
            <motion.h3
              className="text-slate-dark text-2xl font-black tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Personnel Deployment
            </motion.h3>
            <motion.div
              className="flex items-center gap-2 mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-[10px] text-primary uppercase font-black tracking-[0.2em]">
                Location: {task?.location}
              </p>
            </motion.div>
          </div>
          <motion.button
            onClick={() => { setShowAssignModal(null); }}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>

        {/* Volunteer List */}
        <div className="p-8 max-h-[450px] overflow-y-auto space-y-4">
          <AnimatePresence>
            {availableVolunteers
              .filter((v) => !task?.assignedVolunteers.includes(v._id))
              .map((vol, idx) => (
                <motion.div
                  key={vol._id}
                  onClick={() => handleAssignVolunteer(showAssignModal, vol._id)}
                  className="flex items-center gap-5 p-5 bg-white border-2 border-slate-50 rounded-[2rem] hover:border-primary cursor-pointer group relative overflow-hidden"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 30px -5px rgba(79, 70, 229, 0.2)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  <motion.div
                    className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-3xl shadow-lg border border-primary/10 relative z-10"
                    whileHover={{ scale: 1.15, rotate: 12 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {vol.avatar}
                  </motion.div>

                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-slate-dark text-base font-black tracking-tight group-hover:text-primary transition-colors">
                      {vol.name}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {vol.skills?.slice(0, 3).map((skill, i) => (
                        <motion.span
                          key={skill}
                          className="px-2 py-0.5 bg-slate-50 rounded-lg text-[8px] font-black text-slate-dark/40 uppercase tracking-tighter border border-slate-100"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 + i * 0.05 }}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    className="text-right px-4 relative z-10"
                    initial={{ opacity: 0, x: 20 }}
                    whileHover={{ opacity: 1, x: 0 }}
                  >
                    <span className="text-primary text-[10px] font-black tracking-widest">
                      SELECT →
                    </span>
                  </motion.div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}