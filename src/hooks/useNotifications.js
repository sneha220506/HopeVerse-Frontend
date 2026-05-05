import { useState, useEffect } from "react";
import { getSocket } from "../services/socket";
import axios from "axios";
const url = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useNotifications = (user) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("CommunityPulse_token");
        const res = await axios.get(`${url}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n) => !n.isRead).length);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchNotifications();

    let socketListener;

    const connectListener = () => {
      const socket = getSocket();

      if (socket && socket.connected) {
        socket.on("NOTIFICATION_RECEIVED", (newNotif) => {
          // ✅ Prevent duplicates by checking if notification already exists
          setNotifications((prev) => {
            const notifId = newNotif._id || newNotif.id;
            const exists = prev.some((n) => (n._id || n.id) === notifId);

            if (exists) {
              console.warn("Duplicate notification received:", notifId);
              return prev;
            }

            return [newNotif, ...prev];
          });

          setUnreadCount((prev) => prev + 1);
        });

        socketListener = socket;
        return true;
      }
      return false;
    };

    const isConnected = connectListener();

    let checkInterval;
    if (!isConnected) {
      checkInterval = setInterval(() => {
        if (connectListener()) {
          clearInterval(checkInterval);
        }
      }, 1000);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (socketListener) {
        socketListener.off("NOTIFICATION_RECEIVED");
      }
    };
  }, [user]);

  const markAsRead = async (notificationId) => {
    // ✅ Handle both _id and id formats
    setNotifications((prev) =>
      prev.map((n) => {
        const nId = n._id || n.id;
        return nId === notificationId ? { ...n, isRead: true } : n;
      }),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, markAsRead };
};
