import React from 'react';

export default function NotificationItem({ notification, onMarkAsRead }) {
  const { _id, title, message, type, isRead, createdAt } = notification;

  // Icon mapping based on notification type
  const getIcon = () => {
    switch (type) {
      case 'SURVEY_APPROVED': return '✅';
      case 'NEW_SURVEY': return '📝';
      case 'TASK_ASSIGNED': return '📌';
      default: return '🔔';
    }
  };

  return (
    <div 
      onClick={() => !isRead && onMarkAsRead(_id)}
      className={`p-4 border-b border-slate-300 cursor-pointer transition-colors ${
        isRead ? 'bg-transparent opacity-60' : 'bg-blue-500/5 hover:bg-blue-500/10'
      }`}
    >
      <div className="flex gap-3">
        <div className="text-lg">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className={`text-xs font-bold ${isRead ? 'text-slate-400' : 'text-white'}`}>
              {title}
            </h4>
            {!isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {message}
          </p>
          <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-tighter">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}