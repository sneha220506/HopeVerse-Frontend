import { useState } from 'react';
import { tasks, volunteers } from '../data/mockData';
import { getCategoryIcon, getUrgencyColor, getStatusColor } from '../utils/helpers';

export default function TaskBoard({ permissions }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [allTasks, setAllTasks] = useState(tasks);

  const filteredTasks = filterStatus === 'all' ? allTasks : allTasks.filter(t => t.status === filterStatus);
  const getVolDetails = (id) => volunteers.find(v => v._id === id);
  const progress = (t) => t.status === 'completed' ? 100 : t.status === 'in-progress' ? 60 : t.status === 'assigned' ? 30 : 10;

  const availableVolunteers = volunteers.filter(v => v.status === 'active');

  const handleAssignVolunteer = (taskId, volunteerId) => {
    setAllTasks(prev => prev.map(task => {
      if (task._id === taskId) {
        const newAssigned = [...task.assignedVolunteers, volunteerId];
        const newStatus = newAssigned.length >= task.volunteersRequired ? 'in-progress' : 'assigned';
        return { ...task, assignedVolunteers: newAssigned, status: newStatus };
      }
      return task;
    }));
    setShowAssignModal(null);
  };

  const handleComplete = (taskId) => {
    setAllTasks(prev => prev.map(task =>
      task._id === taskId ? { ...task, status: 'completed' } : task
    ));
  };

  const columns = [
    { status: 'pending', label: 'Pending', color: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', icon: '⏳' },
    { status: 'assigned', label: 'Assigned', color: 'border-[#B8A1E3]', bg: 'bg-[#F3F0FA]', text: 'text-[#8E7CC3]', icon: '📌' },
    { status: 'in-progress', label: 'Active', color: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-700', icon: '🔄' },
    { status: 'completed', label: 'Resolved', color: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '✅' },
  ];

  return (
    <section className="py-12 bg-[#FAFAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold text-[#2F2F3A] tracking-tight">
              Task <span className="text-[#8E7CC3]">Operations</span>
            </h2>
            <p className="text-[#2F2F3A]/50 font-medium mt-2 max-w-md">
              {permissions?.canAssignVolunteer 
                ? 'Strategic oversight and volunteer deployment.' 
                : 'Real-time updates for community support tasks.'}
            </p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-[#F3F0FA] shadow-soft backdrop-blur-md">
            {['all', 'pending', 'assigned', 'in-progress', 'completed'].map(s => (
              <button 
                key={s} 
                onClick={() => setFilterStatus(s)} 
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === s 
                    ? 'bg-[#8E7CC3] text-white shadow-lg shadow-purple-100' 
                    : 'text-[#2F2F3A]/40 hover:text-[#8E7CC3]'
                }`}
              >
                {s === 'all' ? 'All' : s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="flex flex-col h-full">
                {/* Column Header */}
                <div className={`mb-6 px-5 py-3 rounded-2xl border-b-2 ${col.color} ${col.bg} flex items-center justify-between shadow-sm`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{col.icon}</span>
                    <span className={`${col.text} font-bold text-xs uppercase tracking-widest`}>{col.label}</span>
                  </div>
                  <span className="bg-white/60 text-[#2F2F3A]/40 text-[10px] font-black px-2 py-0.5 rounded-lg">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Stack */}
                <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-hide pb-10">
                  {colTasks.map(task => (
                    <div 
                      key={task._id}
                      onClick={() => setSelectedTask(selectedTask === task._id ? null : task._id)}
                      className={`group relative bg-white rounded-[2rem] border transition-all duration-500 cursor-pointer ${
                        selectedTask === task._id 
                          ? 'border-[#8E7CC3] shadow-xl shadow-purple-50 -translate-y-1' 
                          : 'border-transparent shadow-soft hover:shadow-md'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-[#FAFAFC] p-2.5 rounded-xl text-xl border border-[#F3F0FA]">
                            {getCategoryIcon(task.category)}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${
                            task.urgency === 'High' ? 'bg-rose-50 border-rose-100 text-rose-500' : 
                            task.urgency === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-500' : 
                            'bg-emerald-50 border-emerald-100 text-emerald-500'
                          }`}>
                            {task.urgency}
                          </span>
                        </div>

                        <h4 className="text-[#2F2F3A] text-sm font-bold leading-snug mb-1 group-hover:text-[#8E7CC3] transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-[#2F2F3A]/40 text-[11px] font-medium flex items-center gap-1.5 mb-5">
                          📍 {task.location}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-2 mb-5">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#2F2F3A]/30">
                            <span>Fulfillment</span>
                            <span className="text-[#8E7CC3]">{progress(task)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#F3F0FA] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                task.status === 'completed' ? 'bg-[#7BC47F]' :
                                task.status === 'in-progress' ? 'bg-[#8E7CC3]' :
                                'bg-[#B8A1E3]'
                              }`} 
                              style={{ width: `${progress(task)}%` }} 
                            />
                          </div>
                        </div>

                        {/* Volunteers */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#FAFAFC]">
                          <div className="flex -space-x-2">
                            {task.assignedVolunteers.slice(0, 3).map(vId => {
                              const vol = getVolDetails(vId);
                              return (
                                <div key={vId} className="w-7 h-7 rounded-full bg-[#F3F0FA] border-2 border-white flex items-center justify-center text-xs shadow-sm" title={vol?.name}>
                                  {vol?.avatar || '👤'}
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-[#2F2F3A]/30 font-black tracking-tighter">
                            {task.assignedVolunteers.length}/{task.volunteersRequired} VOLUNTEERS
                          </div>
                        </div>

                        {/* Controls */}
                        {selectedTask === task._id && (
                          <div className="mt-5 pt-5 border-t border-[#F3F0FA] animate-in fade-in zoom-in-95 duration-300">
                            <p className="text-[#2F2F3A]/60 text-xs leading-relaxed mb-5 italic font-medium">"{task.description}"</p>
                            
                            <div className="flex flex-col gap-2">
                              {permissions?.canAssignVolunteer && task.assignedVolunteers.length < task.volunteersRequired && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowAssignModal(task._id); }}
                                  className="w-full py-3 bg-[#8E7CC3] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-100 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                  Deploy Personnel
                                </button>
                              )}
                              {permissions?.canCompleteTask && task.status === 'in-progress' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleComplete(task._id); }}
                                  className="w-full py-3 bg-[#FF8A65] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                  Mark as Resolved
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="border-2 border-dashed border-[#F3F0FA] rounded-[2rem] py-12 text-center">
                      <span className="text-[#2F2F3A]/20 text-[10px] font-black uppercase tracking-[0.2em] block px-4 leading-relaxed">
                        Sector <br/> Clear
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deployment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#2F2F3A]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAssignModal(null)}/>
          <div className="relative bg-white border border-[#F3F0FA] rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-10 py-8 border-b border-[#F3F0FA] flex items-center justify-between">
              <div>
                <h3 className="text-[#2F2F3A] text-xl font-bold">Deploy Personnel</h3>
                <p className="text-[10px] text-[#8E7CC3] uppercase font-black mt-1 tracking-widest">Sector: {allTasks.find(t => t._id === showAssignModal)?.location}</p>
              </div>
              <button onClick={() => setShowAssignModal(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FAFAFC] text-[#2F2F3A]/30 hover:text-rose-500 transition-colors">✕</button>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
              {availableVolunteers
                .filter(v => !allTasks.find(t => t._id === showAssignModal)?.assignedVolunteers.includes(v._id))
                .map(vol => (
                  <div 
                    key={vol._id} 
                    onClick={() => handleAssignVolunteer(showAssignModal, vol._id)}
                    className="flex items-center gap-4 p-4 bg-[#FAFAFC] rounded-2xl border border-transparent hover:border-[#8E7CC3] hover:bg-white cursor-pointer group transition-all shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#8E7CC3] to-[#B8A1E3] flex items-center justify-center text-2xl text-white shadow-md">
                      {vol.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#2F2F3A] text-sm font-bold group-hover:text-[#8E7CC3]">{vol.name}</p>
                      <div className="flex gap-1.5 mt-1">
                        {vol.skills.slice(0, 2).map(skill => (
                          <span key={skill} className="text-[9px] font-bold text-[#2F2F3A]/40 uppercase tracking-tighter">
                            #{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8E7CC3] text-[10px] font-black tracking-widest">SELECT</p>
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