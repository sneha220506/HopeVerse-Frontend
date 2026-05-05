import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationItem from "./NotificationItem";

export default function NotificationBell({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications(user);
  const dropdownRef = useRef(null);
  useEffect(() => {

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
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 text-[10px] font-bold items-center justify-center text-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white backdrop-blur-lg border-slate-700 shadow-2xl rounded-xl overflow-hidden z-[100] animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </div>

          {notifications.length > 0 ? (
            notifications.map((n) => {
              // ✅ Generate a guaranteed unique key
              const uniqueKey =
                n._id?.toString() ||
                n.id?.toString() ||
                `notif-${Date.now()}-${Math.random()}`;

              return (
                <NotificationItem
                  key={uniqueKey}
                  notification={n}
                  onMarkAsRead={() => markAsRead(n._id || n.id)}
                />
              );
            })
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-500 text-xs italic">
                No New Notifications found.
              </p>
            </div>
          )}

          <div className="p-2 bg-slate-400/50 border-t border-slate-700 text-center">
            <button className="text-[10px] text-black hover:text-white uppercase tracking-widest font-bold transition-colors">
              Clear All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
