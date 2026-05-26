import { useState, useEffect } from 'react';
// import { tasks, volunteers } from '../data/mockData'; // No longer needed
import { tasksAPI, volunteersAPI } from '../services/api';
import { getCategoryIcon, getUrgencyColor, getStatusColor } from '../utils/helpers';

export default function TaskBoard({ permissions }) {
  const [filterStatus, setFilterStatus] = useState('all'); // Handles focused row view: 'all' or specific status
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'focused'
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, volunteersData] = await Promise.all([
          tasksAPI.getAll(),
          volunteersAPI.getAll()
        ]);
        setAllTasks(Array.isArray(tasksData) ? tasksData : tasksData.data || []);
        setAllVolunteers(Array.isArray(volunteersData) ? volunteersData : volunteersData.data || []);
      } catch (error) {
        console.error("Operational Fetch Failure:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter tasks based on global top bar toggle or row focus state
  const filteredTasks = filterStatus === 'all' ? allTasks : allTasks.filter(t => t.status === filterStatus);
  
  // Get volunteer details from the state synced with DB
  const getVolDetails = (id) => allVolunteers.find(v => v._id === id);
  
  const progress = (t) => t.status === 'completed' ? 100 : t.status === 'in-progress' ? 60 : t.status === 'assigned' ? 30 : 10;

  const availableVolunteers = allVolunteers.filter(v => v.status === 'active');

  const handleAssignVolunteer = async (taskId, volunteerId) => {
    try {
      // API call to persist assignment
      await tasksAPI.assignVolunteer(taskId, volunteerId);
      
      // Update local state to reflect changes instantly
      setAllTasks(prev => prev.map(task => {
        if (task._id === taskId) {
          const newAssigned = [...task.assignedVolunteers, volunteerId];
          const newStatus = newAssigned.length >= task.volunteersRequired ? 'in-progress' : 'assigned';
          return { ...task, assignedVolunteers: newAssigned, status: newStatus };
        }
        return task;
      }));
      setShowAssignModal(null);
    } catch (err) {
      alert("Personnel Deployment Failed: " + err.message);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      // API call to persist completion
      await tasksAPI.complete(taskId);
      
      setAllTasks(prev => prev.map(task =>
        task._id === taskId ? { ...task, status: 'completed' } : task
      ));
    } catch (err) {
      alert("Resolution Protocol Failed: " + err.message);
    }
  };

  // Click handler to open separate focused interface
  const handleTaskClick = (task) => {
    setSelectedTask(task._id);
    setViewMode('focused');
  };

  // Next and Back navigation logic inside the focused list
  const handleNextTask = (e) => {
    e.stopPropagation();
    const currentIndex = filteredTasks.findIndex(t => t._id === selectedTask);
    if (currentIndex < filteredTasks.length - 1) {
      setSelectedTask(filteredTasks[currentIndex + 1]._id);
    } else {
      setSelectedTask(filteredTasks[0]._id); // Loop back to start
    }
  };

  const handlePrevTask = (e) => {
    e.stopPropagation();
    const currentIndex = filteredTasks.findIndex(t => t._id === selectedTask);
    if (currentIndex > 0) {
      setSelectedTask(filteredTasks[currentIndex - 1]._id);
    } else {
      setSelectedTask(filteredTasks[filteredTasks.length - 1]._id); // Loop to end
    }
  };

  const currentFocusedTask = allTasks.find(t => t._id === selectedTask);

  const columns = [
    { status: 'pending', label: 'Pending', color: 'border-amber-400', bg: 'bg-amber-50/50', text: 'text-amber-600', icon: '⏳' },
    { status: 'assigned', label: 'Assigned', color: 'border-primary', bg: 'bg-primary/5', text: 'text-primary', icon: '📌' },
    { status: 'in-progress', label: 'Active', color: 'border-blue-400', bg: 'bg-blue-50/50', text: 'text-blue-600', icon: '🔄' },
    { status: 'completed', label: 'Resolved', color: 'border-emerald-400', bg: 'bg-emerald-50/50', text: 'text-emerald-600', icon: '✅' },
  ];

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="animate-pulse font-black text-primary tracking-[0.3em] uppercase text-xs">Synchronizing Operations...</div>
    </div>
  );

  return (
    <section className="py-12 bg-[#F8FAFC] min-h-screen relative overflow-hidden">
      {/* Visual Depth Accents - CSS PRESERVED */}
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <h2 className="text-5xl font-heading font-black text-slate-dark tracking-tighter">
              Task <span className="text-primary/70">Operations</span>
            </h2>
            <p className="text-slate-dark/40 font-bold text-sm mt-3 max-w-md">
              {permissions?.canAssignVolunteer 
                ? 'High-level deployment and tactical task management.' 
                : 'Real-time observation of community support status.'}
            </p>
          </div>

          {viewMode === 'board' && (
            <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
              {['all', 'pending', 'assigned', 'in-progress', 'completed'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setFilterStatus(s)} 
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    filterStatus === s 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                      : 'text-slate-dark/30 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  {s === 'all' ? 'View All' : s.replace('-', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Navigation Interface for Board View vs Separate Interface View */}
        {viewMode === 'focused' && currentFocusedTask ? (
          <div className="animate-in fade-in duration-500 space-y-8">
            {/* Control Panel Action Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-md">
              <button 
                onClick={() => setViewMode('board')}
                className="px-6 py-3 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2"
              >
                ← Return To Board
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={handlePrevTask}
                  className="px-6 py-3 bg-white text-slate-dark border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  ◀ Previous Task
                </button>
                <button 
                  onClick={handleNextTask}
                  className="px-6 py-3 bg-white text-slate-dark border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Next Task ▶
                </button>
              </div>
            </div>

            {/* Separate Interface Layout View */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl p-8 md:p-12 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8 mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl border border-slate-100 shadow-sm">
                    {getCategoryIcon(currentFocusedTask.category)}
                  </div>
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border inline-block mb-3 ${
                      currentFocusedTask.urgency?.toLowerCase() === 'critical' ? 'bg-red-50 border-red-100 text-red-500' : 
                      currentFocusedTask.urgency?.toLowerCase() === 'high' ? 'bg-orange-50 border-orange-100 text-orange-500' : 
                      currentFocusedTask.urgency?.toLowerCase() === 'medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-500' : 
                      'bg-[#FEF9C3] border-yellow-100 text-yellow-700'
                    }`}>
                      {currentFocusedTask.urgency} Priority
                    </span>
                    <h3 className="text-3xl font-black text-slate-dark tracking-tight leading-none mb-2">
                      {currentFocusedTask.title}
                    </h3>
                    <p className="text-slate-dark/40 text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
                      <span className="text-lg">📍</span> {currentFocusedTask.location}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-dark/30">Current Sector Status</span>
                  <span className="px-5 py-2.5 rounded-2xl bg-primary/5 text-primary text-xs font-black uppercase tracking-widest border border-primary/10">
                    {currentFocusedTask.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Task Core Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-2 space-y-6">
                  <h4 className="text-xs font-black text-slate-dark/30 uppercase tracking-widest">Operational Intel</h4>
                  <p className="text-slate-dark/70 text-base leading-relaxed font-semibold bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 min-h-[120px]">
                    "{currentFocusedTask.description}"
                  </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-dark/30">Maturity Vector</span>
                      <span className="text-[10px] font-black text-primary">{progress(currentFocusedTask)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden p-[2px] border border-slate-200/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          currentFocusedTask.status === 'completed' ? 'bg-success' :
                          currentFocusedTask.status === 'in-progress' ? 'bg-primary' :
                          'bg-primary/40'
                        }`} 
                        style={{ width: `${progress(currentFocusedTask)}%` }} 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 flex justify-between items-center">
                    <div>
                      <p className="text-xl font-black text-slate-dark tracking-tighter leading-none">
                        {currentFocusedTask.assignedVolunteers.length} / {currentFocusedTask.volunteersRequired}
                      </p>
                      <p className="text-[8px] text-slate-dark/30 font-black uppercase tracking-widest mt-1">Personnel Assigned</p>
                    </div>
                    <div className="flex -space-x-2">
                      {currentFocusedTask.assignedVolunteers.map(vId => (
                        <div key={vId} className="w-9 h-9 rounded-xl bg-white border-2 border-white flex items-center justify-center text-sm shadow-sm ring-1 ring-slate-200" title={getVolDetails(vId)?.name}>
                          {getVolDetails(vId)?.avatar || '👤'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical Actions inside separate window */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100 justify-end">
                {permissions?.canAssignVolunteer && currentFocusedTask.assignedVolunteers.length < currentFocusedTask.volunteersRequired && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAssignModal(currentFocusedTask._id); }}
                    className="px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Deploy Personnel
                  </button>
                )}
                {permissions?.canCompleteTask && currentFocusedTask.status === 'in-progress' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleComplete(currentFocusedTask._id); }}
                    className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Finalize & Resolve Task
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Master Grid/Board Stack View Layout */
          <>
            {filterStatus !== 'all' && (
              <button 
                onClick={() => setFilterStatus('all')}
                className="mb-8 px-6 py-3 bg-white text-slate-dark border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
              >
                ← Back to All Sectors
              </button>
            )}

            <div className="space-y-12">
              {columns
                .filter(col => filterStatus === 'all' || filterStatus === col.status)
                .map((col, colIdx) => {
                  const colTasks = allTasks.filter(t => t.status === col.status);
                  
                  return (
                    <div key={col.status} className="flex flex-col w-full bg-white/40 p-6 rounded-[3rem] border border-slate-100/50">
                      
                      {/* Row Header with dynamic text tracking focused views */}
                      <div className={`mb-6 px-6 py-4 rounded-[1.5rem] border-l-4 ${col.color} ${col.bg} flex items-center justify-between shadow-sm`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{col.icon}</span>
                          <span className={`${col.text} font-black text-[11px] uppercase tracking-[0.2em]`}>
                            {col.label} Sector {filterStatus !== 'all' && '• Focused View'}
                          </span>
                          <span className="bg-white/80 text-slate-dark/40 text-[10px] font-black px-3 py-1 rounded-lg border border-white ml-2">
                            {colTasks.length}
                          </span>
                        </div>

                        {/* View All / Close Row Focus Interface Toggler */}
                        <button
                          onClick={() => setFilterStatus(filterStatus === col.status ? 'all' : col.status)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            filterStatus === col.status 
                              ? 'bg-slate-800 text-white border-transparent' 
                              : 'bg-white text-slate-dark/60 hover:text-primary border-slate-100'
                          }`}
                        >
                          {filterStatus === col.status ? 'Close Frame' : 'View All Tasks'}
                        </button>
                      </div>

                      {/* Horizontal Sliding Stack vs Isolated View Flex Grid wrapper */}
                      <div className={
                        filterStatus === 'all' 
                          ? "flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x" 
                          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6"
                      }>
                        {colTasks.map((task, taskIdx) => (
                          <div 
                            key={task._id}
                            onClick={() => handleTaskClick(task)}
                            className={`task-card relative bg-white rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer flex-shrink-0 snap-start ${
                              filterStatus === 'all' ? 'w-[320px]' : 'w-full'
                            } ${
                              selectedTask === task._id 
                                ? 'border-primary shadow-[0_20px_50px_-10px_rgba(99,102,241,0.15)] -translate-y-2' 
                                : 'border-transparent shadow-soft hover:shadow-xl hover:border-primary/20'
                            }`}
                            style={{ animationDelay: `${(colIdx * 0.1) + (taskIdx * 0.05)}s` }}
                          >
                            <div className="p-8">
                              <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100 group-hover:scale-110 transition-transform">
                                  {getCategoryIcon(task.category)}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${
                                    task.urgency?.toLowerCase() === 'critical' ? 'bg-red-50 border-red-100 text-red-500' : 
                                    task.urgency?.toLowerCase() === 'high' ? 'bg-orange-50 border-orange-100 text-orange-500' : 
                                    task.urgency?.toLowerCase() === 'medium' ? 'bg-yellow-50 border-yellow-100 text-yellow-500' : 
                                    'bg-[#FEF9C3] border-yellow-100 text-yellow-700'
                                  }`}>
                                    {task.urgency}
                                  </span>
                                  
                                  {/* Integrated Direct Complete button option inside Active status cards without needing selections */}
                                  {task.status === 'in-progress' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleComplete(task._id); }}
                                      className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-200"
                                    >
                                      ✓ Resolve Task
                                    </button>
                                  )}
                                </div>
                              </div>

                              <h4 className="text-slate-dark text-lg font-black leading-tight mb-2 tracking-tight">
                                {task.title}
                              </h4>
                              <p className="text-slate-dark/40 text-xs font-bold flex items-center gap-2 mb-6 uppercase tracking-wider">
                                <span className="text-lg">📍</span> {task.location}
                              </p>

                              {/* Progress System */}
                              <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-dark/20">Task Maturity</span>
                                  <span className="text-[10px] font-black text-primary">{progress(task)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-[2px] border border-slate-100/50">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                      task.status === 'completed' ? 'bg-success' :
                                      task.status === 'in-progress' ? 'bg-primary' :
                                      'bg-primary/40'
                                    }`} 
                                    style={{ width: `${progress(task)}%` }} 
                                  />
                                </div>
                              </div>

                              {/* Personnel Avatars */}
                              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <div className="flex -space-x-3">
                                  {task.assignedVolunteers.map(vId => {
                                    const vol = getVolDetails(vId);
                                    return (
                                      <div key={vId} className="w-9 h-9 rounded-xl bg-white border-2 border-white flex items-center justify-center text-lg shadow-md ring-1 ring-slate-100" title={vol?.name}>
                                        {vol?.avatar || '👤'}
                                      </div>
                                    );
                                  })}
                                  {task.assignedVolunteers.length < task.volunteersRequired && (
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-300">
                                      +
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-slate-dark font-black tracking-tighter leading-none">
                                    {task.assignedVolunteers.length}/{task.volunteersRequired}
                                  </p>
                                  <p className="text-[8px] text-slate-dark/20 font-black uppercase tracking-widest mt-1">Personnel</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {colTasks.length === 0 && (
                          <div className="border-4 border-dashed border-slate-100 rounded-[3rem] py-10 text-center animate-in fade-in duration-1000 w-full flex flex-col items-center justify-center">
                            <div className="text-4xl mb-2 opacity-20">🏝️</div>
                            <span className="text-slate-dark/20 text-[10px] font-black uppercase tracking-[0.3em] block px-8 leading-loose">
                              No Active Operational Load
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
      </div>

      {/* Deployment Modal Overlay */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setShowAssignModal(null)}/>
          <div className="relative glass-modal rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="px-12 py-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-slate-dark text-2xl font-black tracking-tight">Personnel Deployment</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-[10px] text-primary uppercase font-black tracking-[0.2em]">Sector Intelligence: {allTasks.find(t => t._id === showAssignModal)?.location}</p>
                </div>
              </div>
              <button onClick={() => setShowAssignModal(null)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">✕</button>
            </div>

            <div className="p-8 max-h-[450px] overflow-y-auto space-y-4 custom-scrollbar">
              {availableVolunteers
                .filter(v => !allTasks.find(t => t._id === showAssignModal)?.assignedVolunteers.includes(v._id))
                .map((vol, idx) => (
                  <div 
                    key={vol._id} 
                    onClick={() => handleAssignVolunteer(showAssignModal, vol._id)}
                    className="flex items-center gap-5 p-5 bg-white border-2 border-slate-50 rounded-[2rem] hover:border-primary hover:shadow-xl cursor-pointer group transition-all animate-in fade-in slide-in-from-right-4"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                      {vol.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-dark text-base font-black tracking-tight group-hover:text-primary transition-colors">{vol.name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {vol.skills?.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 bg-slate-50 rounded-lg text-[8px] font-black text-slate-dark/40 uppercase tracking-tighter border border-slate-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right px-4">
                      <span className="text-primary text-[10px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
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