import React from 'react';

export default function NotificationItem({ notification, onMarkAsRead }) {
  const { _id, id, title, message, type, isRead, createdAt } = notification;
  const targetId = _id || id;

  // Icon mapping based on notification type
  const getIcon = () => {
    switch (type) {
      case 'SURVEY_APPROVED': return '✨';
      case 'NEW_SURVEY': return '📋';
      case 'TASK_ASSIGNED': return '📍';
      default: return '🔔';
    }
  };

  return (
    <div 
      onClick={() => !isRead && onMarkAsRead(targetId)}
      className={`group px-6 py-5 border-b border-slate-50 cursor-pointer transition-all duration-300 ${
        isRead ? 'bg-transparent' : 'bg-[#F3F0FF]/30 hover:bg-[#F3F0FF]/60'
      }`}
    >
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm transition-transform duration-300 group-hover:scale-110 ${
          isRead ? 'bg-slate-50 grayscale' : 'bg-white'
        }`}>
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h4 className={`text-[12px] font-black leading-tight tracking-tight ${
              isRead ? 'text-slate-400' : 'text-slate-800'
            }`}>
              {title}
            </h4>
            {!isRead && (
              <span className="shrink-0 w-2 h-2 bg-[#8E7CC3] rounded-full shadow-[0_0_8px_rgba(142,124,195,0.6)] animate-pulse mt-1"></span>
            )}
          </div>
          
          <p className={`text-[11px] mt-1.5 leading-relaxed font-medium ${
            isRead ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {message}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              {new Date(createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}