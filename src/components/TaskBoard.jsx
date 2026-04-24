import { useState } from 'react';
import { tasks, volunteers } from '../data/mockData';
import { getCategoryIcon, getUrgencyColor, getStatusColor } from '../utils/helpers';

export default function TaskBoard({ permissions }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [allTasks, setAllTasks] = useState(tasks);

  const filteredTasks = filterStatus === 'all' ? allTasks : allTasks.filter(t => t.status === filterStatus);
  const getVolName = (id) => { const v = volunteers.find(v => v._id === id); return v ? `${v.avatar} ${v.name}` : id; };
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

  const handleUnassign = (taskId, volunteerId) => {
    setAllTasks(prev => prev.map(task => {
      if (task._id === taskId) {
        const newAssigned = task.assignedVolunteers.filter(v => v !== volunteerId);
        const newStatus = newAssigned.length === 0 ? 'pending' : task.status;
        return { ...task, assignedVolunteers: newAssigned, status: newStatus };
      }
      return task;
    }));
  };

  const handleComplete = (taskId) => {
    setAllTasks(prev => prev.map(task =>
      task._id === taskId ? { ...task, status: 'completed' } : task
    ));
  };

  const handleStart = (taskId) => {
    setAllTasks(prev => prev.map(task =>
      task._id === taskId ? { ...task, status: 'in-progress' } : task
    ));
  };

  const columns = [
    { status: 'pending', label: 'Pending', color: 'border-yellow-500/30', icon: '⏳' },
    { status: 'assigned', label: 'Assigned', color: 'border-purple-500/30', icon: '📌' },
    { status: 'in-progress', label: 'In Progress', color: 'border-orange-500/30', icon: '🔄' },
    { status: 'completed', label: 'Completed', color: 'border-green-500/30', icon: '✅' },
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">📋 Task Board</h2>
            <p className="text-gray-400 text-sm mt-1">
              {permissions?.canAssignVolunteer ? 'Manage and assign volunteers to tasks' : 'View task progress and assignments'}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {['all', 'pending', 'assigned', 'in-progress', 'completed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {columns.map(col => {
            const count = allTasks.filter(t => t.status === col.status).length;
            return (
              <div key={col.status} className={`bg-gray-800/50 rounded-xl border ${col.color} p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{col.icon}</span>
                  <span className="text-gray-400 text-sm">{col.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="space-y-3">
                <div className={`bg-gray-800/30 rounded-t-xl border-t-2 ${col.color} px-4 py-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm">{col.icon} {col.label}</span>
                    <span className="text-gray-500 text-xs bg-gray-700/50 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {colTasks.map(task => (
                    <div key={task._id}
                      onClick={() => setSelectedTask(selectedTask === task._id ? null : task._id)}
                      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border p-4 cursor-pointer transition-all hover:-translate-y-1 ${
                        selectedTask === task._id ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-gray-700/50 hover:border-gray-600'
                      }`}>
                      {/* Header */}
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(task.category)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium line-clamp-2">{task.title}</h4>
                          <p className="text-gray-500 text-[10px] mt-0.5">📍 {task.location}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getUrgencyColor(task.urgency)}`}>{task.urgency}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(task.status)}`}>{task.status}</span>
                      </div>

                      {/* Progress */}
                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{progress(task)}%</span>
                        </div>
                        <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'in-progress' ? 'bg-orange-500' :
                            task.status === 'assigned' ? 'bg-purple-500' : 'bg-yellow-500'
                          }`} style={{ width: `${progress(task)}%` }} />
                        </div>
                      </div>

                      {/* Assigned volunteers */}
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                        <span>🙋 {task.assignedVolunteers.length}/{task.volunteersRequired} volunteers</span>
                        <span>⏱️ {task.estimatedHours}h</span>
                      </div>

                      {/* Volunteer avatars */}
                      {task.assignedVolunteers.length > 0 && (
                        <div className="flex -space-x-2 mb-3">
                          {task.assignedVolunteers.slice(0, 5).map(vId => {
                            const vol = getVolDetails(vId);
                            return (
                              <div key={vId} className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs" title={vol?.name}>
                                {vol?.avatar || '👤'}
                              </div>
                            );
                          })}
                          {task.assignedVolunteers.length > 5 && (
                            <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-[10px] text-gray-400">
                              +{task.assignedVolunteers.length - 5}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expanded Details */}
                      {selectedTask === task._id && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-3 animate-in fade-in duration-200">
                          <p className="text-gray-400 text-xs">{task.description}</p>

                          {/* Assigned Volunteers List */}
                          <div>
                            <span className="text-gray-500 text-xs font-medium">Assigned Volunteers:</span>
                            <div className="mt-1 space-y-1">
                              {task.assignedVolunteers.length > 0 ? (
                                task.assignedVolunteers.map(vId => {
                                  const vol = getVolDetails(vId);
                                  return (
                                    <div key={vId} className="flex items-center justify-between bg-gray-700/30 rounded-lg px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{vol?.avatar || '👤'}</span>
                                        <div>
                                          <p className="text-gray-300 text-xs font-medium">{vol?.name || vId}</p>
                                          <p className="text-gray-500 text-[10px]">{vol?.skills?.slice(0, 2).join(', ')}</p>
                                        </div>
                                      </div>
                                      {/* Only Admin/Coordinator can unassign */}
                                      {permissions?.canAssignVolunteer && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleUnassign(task._id, vId); }}
                                          className="text-red-400 hover:text-red-300 text-[10px] px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-gray-600 text-xs py-2">No volunteers assigned yet</p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons - Role Based */}
                          <div className="space-y-2">
                            {/* Assign Button - Admin & Coordinator ONLY */}
                            {permissions?.canAssignVolunteer && task.assignedVolunteers.length < task.volunteersRequired && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowAssignModal(task._id); }}
                                className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Assign Volunteer ({task.assignedVolunteers.length}/{task.volunteersRequired})
                              </button>
                            )}

                            {/* Start Task - Admin & Coordinator */}
                            {permissions?.canCompleteTask && task.status === 'assigned' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStart(task._id); }}
                                className="w-full py-2 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-500/30 transition-colors"
                              >
                                🔄 Start Task
                              </button>
                            )}

                            {/* Complete Task - Admin & Coordinator */}
                            {permissions?.canCompleteTask && task.status === 'in-progress' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleComplete(task._id); }}
                                className="w-full py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                              >
                                ✅ Mark as Complete
                              </button>
                            )}

                            {/* Field Worker / Viewer - Just info text */}
                            {!permissions?.canAssignVolunteer && !permissions?.canCompleteTask && (
                              <p className="text-gray-600 text-[10px] text-center py-1">
                                👁️ View-only — Contact a coordinator to assign volunteers
                              </p>
                            )}
                          </div>

                          {/* Meta */}
                          <div className="flex justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-700/30">
                            <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-xs">No tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Assign Volunteer Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAssignModal(null)} />
            <div className="relative bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-semibold">Assign Volunteer</h3>
                <button onClick={() => setShowAssignModal(null)} className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Task Info */}
              <div className="px-6 py-3 bg-gray-700/30 border-b border-gray-700/50">
                <p className="text-white text-sm font-medium">{allTasks.find(t => t._id === showAssignModal)?.title}</p>
                <p className="text-gray-500 text-xs">
                  {allTasks.find(t => t._id === showAssignModal)?.assignedVolunteers?.length || 0}/
                  {allTasks.find(t => t._id === showAssignModal)?.volunteersRequired} volunteers assigned
                </p>
              </div>

              {/* Volunteer List */}
              <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
                {availableVolunteers
                  .filter(v => !allTasks.find(t => t._id === showAssignModal)?.assignedVolunteers.includes(v._id))
                  .map(vol => (
                    <div
                      key={vol._id}
                      onClick={() => handleAssignVolunteer(showAssignModal, vol._id)}
                      className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 cursor-pointer transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-lg">{vol.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{vol.name}</p>
                        <p className="text-gray-500 text-[10px]">{vol.skills.slice(0, 3).join(', ')}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500">⭐ {vol.rating}</span>
                          <span className="text-[10px] text-gray-500">•</span>
                          <span className="text-[10px] text-gray-500">{vol.tasksCompleted} tasks</span>
                          <span className="text-[10px] text-gray-500">•</span>
                          <span className="text-[10px] capitalize text-gray-500">{vol.availability}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  ))}

                {availableVolunteers.filter(v => !allTasks.find(t => t._id === showAssignModal)?.assignedVolunteers.includes(v._id)).length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No more available volunteers
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
