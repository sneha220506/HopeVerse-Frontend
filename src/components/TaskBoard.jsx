import { useState, useEffect } from "react";
// import { tasks, volunteers } from '../data/mockData'; // No longer needed
import { tasksAPI, volunteersAPI } from "../services/api";
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
  const [currentView, setCurrentView] = useState("board"); // 'board' | 'focused_task' | 'category_view'
  const [activeCategory, setActiveCategory] = useState(null);

  // Initial Data Load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, volunteersData] = await Promise.all([
          tasksAPI.getAll(),
          volunteersAPI.getAll(),
        ]);
        setAllTasks(
          Array.isArray(tasksData) ? tasksData : tasksData.data || [],
        );
        setAllVolunteers(
          Array.isArray(volunteersData)
            ? volunteersData
            : volunteersData.data || [],
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
    },
    {
      status: "assigned",
      label: "Assigned",
      color: "border-primary",
      bg: "bg-primary/5",
      text: "text-primary",
      icon: "📌",
    },
    {
      status: "in-progress",
      label: "Active",
      color: "border-blue-400",
      bg: "bg-blue-50/50",
      text: "text-blue-600",
      icon: "🔄",
    },
    {
      status: "completed",
      label: "Completed",
      color: "border-emerald-400",
      bg: "bg-emerald-50/50",
      text: "text-emerald-600",
      icon: "✅",
    },
  ];

  // EXACT CONFIG PROVIDED BY YOU
  const statusPermissions = {
    all: true, // Open to all roles
    pending: permissions?.canViewAnalytics, // Only visible to coordinators/admins
    assigned: permissions.label == "Volunteer",
    "in-progress": permissions?.canViewAnalytics,
    completed: true,
  };

  // --- PERSISTENT DATA PIPELINE ---
  const filteredTasks =
    filterStatus === "all"
      ? allTasks
      : allTasks.filter((t) => t.status === filterStatus);

  // Get volunteer details from the state synced with DB
  const getVolDetails = (id) => allVolunteers.find((v) => v._id === id);

  const progress = (t) =>
    t.status === "completed"
      ? 100
      : t.status === "in-progress"
        ? 60
        : t.status === "assigned"
          ? 30
          : 10;

  const availableVolunteers = allVolunteers.filter(
    (v) => v.status === "active",
  );

  const handleAssignVolunteer = async (taskId, volunteerId) => {
    try {
      await tasksAPI.assignVolunteer(taskId, volunteerId);
      setAllTasks((prev) =>
        prev.map((task) => {
          if (task._id === taskId) {
            const newAssigned = [...task.assignedVolunteers, volunteerId];
            const newStatus =
              newAssigned.length >= task.volunteersRequired
                ? "in-progress"
                : "assigned";
            return {
              ...task,
              assignedVolunteers: newAssigned,
              status: newStatus,
            };
          }
          return task;
        }),
      );
      setShowAssignModal(null);
    } catch (err) {
      alert("Personnel Deployment Failed: " + err.message);
    }
  };

  const handleActivateTask = async (taskId) => {
    try {
      await tasksAPI.updateStatus(taskId, 'in-progress');
      setAllTasks(prev => prev.map(task =>
        task._id === taskId ? { ...task, status: 'in-progress' } : task
      ));
    } catch (err) {
      alert("Activation Protocol Failed: " + err.message);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await tasksAPI.complete(taskId);
      setAllTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, status: "completed" } : task,
        ),
      );
    } catch (err) {
      alert("Resolution Protocol Failed: " + err.message);
    }
  };

  // --- SEQUENTIAL NAVIGATION CONTROLS ---
  const handleNextTask = () => {
    const contextTasks = activeCategory 
      ? allTasks.filter(t => t.status === activeCategory)
      : filteredTasks;
    const currentIndex = contextTasks.findIndex(t => t._id === selectedTask);
    if (currentIndex !== -1 && currentIndex < contextTasks.length - 1) {
      setSelectedTask(contextTasks[currentIndex + 1]._id);
    } else if (contextTasks.length > 0) {
      setSelectedTask(contextTasks[0]._id);
    }
  };

  const handlePrevTask = () => {
    const contextTasks = activeCategory 
      ? allTasks.filter(t => t.status === activeCategory)
      : filteredTasks;
    const currentIndex = contextTasks.findIndex(t => t._id === selectedTask);
    if (currentIndex > 0) {
      setSelectedTask(contextTasks[currentIndex - 1]._id);
    } else if (contextTasks.length > 0) {
      setSelectedTask(contextTasks[contextTasks.length - 1]._id);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse font-black text-primary tracking-[0.3em] uppercase text-xs">
          Synchronizing Operations...
        </div>
      </div>
    );

  const currentFocusedTaskInstance = allTasks.find(t => t._id === selectedTask);

  return (
    <section className="py-12 bg-[#F8FAFC] min-h-screen relative overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .task-card { 
          animation: slideInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
          opacity: 0; 
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .glass-modal {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 1);
        }
      `,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* INTERFACE ROUTER LAYER 1: BASE BOARD VIEWS (HORIZONTAL BAR LAYOUT) */}
        {currentView === "board" && (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
              <div className="animate-in fade-in slide-in-from-left duration-700">
                <h2 className="text-5xl font-heading font-black text-slate-dark tracking-tighter">
                  Task <span className="text-primary/70">Operations</span>
                </h2>
                <p className="text-slate-dark/40 font-bold text-sm mt-3 max-w-md">
                  {permissions?.canAssignVolunteer
                    ? "High-level tactical layout management."
                    : "Real-time observation of support operations."}
                </p>
              </div>

              <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-x-auto max-w-full scrollbar-hide">
                {["all", "pending", "assigned", "in-progress", "completed"]
                  .filter((status) => statusPermissions[status])
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                        filterStatus === s
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "text-slate-dark/30 hover:text-primary hover:bg-slate-50"
                      }`}
                    >
                      {s === "all" ? "View All" : s.replace("-", " ")}
                    </button>
                  ))}
              </div>
            </div>

            {/* Horizontal Continuous Lanes Container Stack */}
            <div className="space-y-10">
              {columns
                .filter((col) => statusPermissions[col.status]) // Apply rule filtering directly to the lanes
                .filter((col) => filterStatus === "all" || filterStatus === col.status)
                .map((col, colIdx) => {
                  const colTasks = filteredTasks.filter((t) => t.status === col.status);
                  return (
                    <div 
                      key={col.status} 
                      className="flex flex-col bg-slate-50/40 rounded-[2.5rem] p-6 border border-slate-100/60 shadow-inner w-full"
                    >
                      {/* Lane Header Row */}
                      <div
                        className={`mb-6 px-6 py-4 rounded-2xl border-b-4 ${col.color} ${col.bg} flex items-center justify-between shadow-sm animate-in fade-in duration-500`}
                        style={{ animationDelay: `${colIdx * 0.07}s` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl flex-shrink-0">{col.icon}</span>
                          <span className={`${col.text} font-black text-sm uppercase tracking-wider truncate`}>
                            {col.label} Sector
                          </span>
                          <span className="bg-white text-slate-800/80 text-xs font-black px-2.5 py-0.5 rounded-md border border-slate-100 shadow-xs ml-2">
                            {colTasks.length}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setActiveCategory(col.status);
                            setCurrentView("category_view");
                          }}
                          className={`px-4 py-2 bg-white ${col.text} border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-md transition-all active:scale-95`}
                        >
                          View All
                        </button>
                      </div>

                      {/* Horizontal Sliding LaneViewport */}
                      <div className="flex gap-6 overflow-x-auto pb-4 pt-2 px-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent snap-x">
                        {colTasks.map((task, taskIdx) => (
                          <div
                            key={task._id}
                            onClick={() => {
                              setSelectedTask(task._id);
                              setCurrentView("focused_task");
                            }}
                            className="task-card relative bg-white rounded-2xl border-2 border-slate-100/70 shadow-sm hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer select-none group w-[310px] flex-shrink-0 snap-start"
                            style={{
                              animationDelay: `${colIdx * 0.05 + taskIdx * 0.03}s`,
                            }}
                          >
                            <div className="p-5">
                              <div className="flex justify-between items-center mb-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                                  {getCategoryIcon(task.category)}
                                </div>
                                <div className="flex items-center gap-2">
                                  {task.status === "in-progress" && permissions?.canCompleteTask && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleComplete(task._id);
                                      }}
                                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                                    >
                                      ✓ Complete
                                    </button>
                                  )}
                                  <span
                                    className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                                      task.urgency?.toLowerCase() === "critical"
                                        ? "bg-red-50 border-red-100 text-red-600"
                                        : task.urgency?.toLowerCase() === "high"
                                          ? "bg-orange-50 border-orange-100 text-orange-600"
                                          : "bg-emerald-50 border-emerald-100 text-emerald-600"
                                    }`}
                                  >
                                    {task.urgency}
                                  </span>
                                </div>
                              </div>

                              <h4 className="text-slate-800 text-base font-extrabold leading-snug mb-1.5 tracking-tight group-hover:text-primary transition-colors duration-200 truncate">
                                {task.title}
                              </h4>
                              <p className="text-slate-400 text-[11px] font-semibold flex items-center gap-1.5 mb-4 truncate">
                                <span className="text-sm grayscale-20 opacity-70">📍</span> {task.location}
                              </p>

                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center text-[10px] font-bold tracking-wide">
                                  <span className="text-slate-400 uppercase text-[9px]">Maturity</span>
                                  <span className="text-primary">{progress(task)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                                      task.status === "completed"
                                        ? "bg-emerald-500"
                                        : task.status === "in-progress"
                                          ? "bg-primary"
                                          : "bg-primary/40"
                                    }`}
                                    style={{ width: `${progress(task)}%` }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex -space-x-2 overflow-hidden">
                                  {task.assignedVolunteers.map((vId) => {
                                    const vol = getVolDetails(vId);
                                    return (
                                      <div
                                        key={vId}
                                        className="w-8 h-8 rounded-lg bg-white border-2 border-white flex items-center justify-center text-base shadow-xs ring-1 ring-slate-100"
                                        title={vol?.name}
                                      >
                                        {vol?.avatar || "👤"}
                                      </div>
                                    );
                                  })}
                                  {task.assignedVolunteers.length < task.volunteersRequired && (
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                                      +
                                    </div>
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
                          </div>
                        ))}

                        {colTasks.length === 0 && (
                          <div className="border-2 border-dashed border-slate-200/60 rounded-2xl py-8 text-center bg-white/40 min-w-[310px] flex flex-col items-center justify-center">
                            <div className="text-2xl mb-1 opacity-40">🏝️</div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block px-4">
                              No Operational Load
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {/* INTERFACE ROUTER LAYER 2: SEPARATE DEDICATED INDIVIDUAL TASK INTERFACE */}
        {currentView === "focused_task" && currentFocusedTaskInstance && (
          <div className="animate-in fade-in duration-500 max-w-3xl mx-auto space-y-6">
            
            {/* Control Strip */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-xl">
              <button
                onClick={() => {
                  setCurrentView(activeCategory ? "category_view" : "board");
                }}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
              >
                ← Back to List
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handlePrevTask}
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  ◀ Back
                </button>
                <button
                  onClick={handleNextTask}
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Next ▶
                </button>
              </div>
            </div>

            {/* Task Focused Window Card */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-8 md:p-10 relative">
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl border border-slate-100">
                    {getCategoryIcon(currentFocusedTaskInstance.category)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">{currentFocusedTaskInstance.title}</h3>
                    <p className="text-slate-400 text-xs font-semibold flex items-center gap-1">📍 {currentFocusedTaskInstance.location}</p>
                  </div>
                </div>
                
                <span className={`text-black font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border bg-slate-50`}>
                  Priority: {currentFocusedTaskInstance.urgency}
                </span>
              </div>

              {/* Task Data Spec Sheets */}
              <div className="space-y-6">
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block mb-2">Description</span>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">"{currentFocusedTaskInstance.description}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block mb-1">Workflow Status</span>
                    <span className="text-xs font-black text-black uppercase tracking-wider">{currentFocusedTaskInstance.status}</span>
                  </div>
                  <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block mb-1">Maturity Level</span>
                    <span className="text-xs font-black text-slate-800">{progress(currentFocusedTaskInstance)}%</span>
                  </div>
                </div>

                {/* Team Roster section */}
                <div className="pt-4">
                  <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block mb-3">Other Assignees</span>
                  <div className="flex flex-wrap gap-3">
                    {currentFocusedTaskInstance.assignedVolunteers.map(vId => {
                      const vol = getVolDetails(vId);
                      return (
                        <div key={vId} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                          <span className="text-lg">{vol?.avatar || "👤"}</span>
                          <span className="text-xs font-bold text-slate-700">{vol?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic Action Floor */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-2">
                {permissions?.label === "Volunteer" && currentFocusedTaskInstance.status === "assigned" && (
                  <button
                    onClick={() => handleActivateTask(currentFocusedTaskInstance._id)}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
                  >
                     Activate Task
                  </button>
                )}
                {permissions?.canAssignVolunteer && currentFocusedTaskInstance.assignedVolunteers.length < currentFocusedTaskInstance.volunteersRequired && (
                  <button
                    onClick={() => setShowAssignModal(currentFocusedTaskInstance._id)}
                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
                  >
                    Deploy Personnel
                  </button>
                )}
                {permissions?.canCompleteTask && currentFocusedTaskInstance.status === "in-progress" && (
                  <button
                    onClick={() => handleComplete(currentFocusedTaskInstance._id)}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
                  >
                    Finalize & Resolve Task
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INTERFACE ROUTER LAYER 3: DEDICATED FULL CATEGORY EXPLORER VIEW */}
        {currentView === "category_view" && activeCategory && (
          <div className="animate-in fade-in duration-500 space-y-6">
            
            {/* View Title Belt */}
            <div className="flex justify-between items-center flex-wrap gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
              <div>
                <button
                  onClick={() => {
                    setCurrentView("board");
                    setActiveCategory(null);
                  }}
                  className="text-xs font-black text-primary tracking-widest uppercase mb-1 hover:underline block"
                >
                  ← Back to Task Board
                </button>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                  <span className="text-black">{activeCategory.replace("-", " ")} Tasks</span>
                </h3>
              </div>
            </div>

            {/* Dedicated full column response collection structure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {allTasks
                .filter(t => t.status === activeCategory)
                .map((task, taskIdx) => (
                  <div
                    key={task._id}
                    onClick={() => {
                      setSelectedTask(task._id);
                      setCurrentView("focused_task");
                    }}
                    className="task-card relative bg-white rounded-2xl border-2 border-slate-100/70 shadow-sm hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer p-5 group"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl border border-slate-100">
                        {getCategoryIcon(task.category)}
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === "in-progress" && permissions?.canCompleteTask && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(task._id);
                            }}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                          >
                            ✓ Complete
                          </button>
                        )}
                        <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-slate-50">
                          {task.urgency}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-slate-800 text-base font-extrabold leading-snug mb-1.5 truncate">{task.title}</h4>
                    <p className="text-slate-400 text-[11px] font-semibold mb-4">📍 {task.location}</p>

                    <div className="space-y-2 mb-4">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${progress(task)}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-[11px] text-slate-700 font-extrabold">
                        {task.assignedVolunteers.length}/{task.volunteersRequired} Personnel
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* Deployment Modal Overlay */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
            onClick={() => setShowAssignModal(null)}
          />
          <div className="relative glass-modal rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="px-12 py-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-slate-dark text-2xl font-black tracking-tight">
                  Personnel Deployment
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-[10px] text-primary uppercase font-black tracking-[0.2em]">
                    Sector Intelligence:{" "}
                    {allTasks.find((t) => t._id === showAssignModal)?.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(null)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-8 max-h-[450px] overflow-y-auto space-y-4 custom-scrollbar">
              {availableVolunteers
                .filter(
                  (v) =>
                    !allTasks
                      .find((t) => t._id === showAssignModal)
                      ?.assignedVolunteers.includes(v._id),
                )
                .map((vol, idx) => (
                  <div
                    key={vol._id}
                    onClick={() =>
                      handleAssignVolunteer(showAssignModal, vol._id)
                    }
                    className="flex items-center gap-5 p-5 bg-white border-2 border-slate-50 rounded-[2rem] hover:border-primary hover:shadow-xl cursor-pointer group transition-all animate-in fade-in slide-in-from-right-4"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                      {vol.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-dark text-base font-black tracking-tight group-hover:text-primary transition-colors">
                        {vol.name}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {vol.skills?.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-slate-50 rounded-lg text-[8px] font-black text-slate-dark/40 uppercase tracking-tighter border border-slate-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right px-4">
                      <span className="text-primary text-[10px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        SELECT
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}