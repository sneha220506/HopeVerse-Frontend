import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationItem from "./NotificationItem";

export default function NotificationBell({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications(user);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Logic for notifications side-effects if needed
  }, [notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <style dangerouslySetInnerHTML={{ __html: `
        .notif-dropdown {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 25px 50px -12px rgba(142, 124, 195, 0.15);
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-pop { animation: popIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}} />

      {/* Bell Icon */}
      <button
        onClick={() => {
          const nextOpenState = !isOpen;
          setIsOpen(nextOpenState);

          // FIX: When opening dropdown, optimistically mark all visible unread notifications as read
          if (nextOpenState && unreadCount > 0) {
            notifications.forEach((n) => {
              if (!n.isRead) {
                markAsRead(n._id || n.id);
              }
            });
          }
        }}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${isOpen ? 'bg-[#F3F0FF] text-[#8E7CC3]' : 'text-slate-400 hover:bg-slate-50'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            pathLength={360}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8E7CC3] opacity-40"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8E7CC3] text-[9px] font-black items-center justify-center text-white shadow-sm">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-85 min-w-[320px] notif-dropdown rounded-[2rem] overflow-hidden z-[100] animate-pop">
          <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Activity <span className="text-[#8E7CC3]">Stream</span>
            </span>
            {unreadCount > 0 && (
              <span className="text-[9px] bg-[#F3F0FF] text-[#8E7CC3] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const uniqueKey =
                  n._id?.toString() ||
                  n.id?.toString() ||
                  `notif-${Date.now()}-${Math.random()}`;

                return (
                  <NotificationItem
                    key={uniqueKey}
                    notification={n}
                    onMarkAsRead={markAsRead}
                  />
                );
              })
            ) : (
              <div className="py-16 text-center">
                <div className="text-3xl mb-3 opacity-20">🔔</div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                  All caught up
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
            <button className="text-[9px] text-slate-400 hover:text-[#8E7CC3] uppercase tracking-[0.25em] font-black transition-all duration-300">
              Clear All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}