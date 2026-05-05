import { io } from "socket.io-client";
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return url.replace(/\/api$/, "").replace(/\/$/, ""); 
};
const SOCKET_URL = getBaseUrl();
let socket;

export const initiateSocketConnection = (user) => {
  const userId = user._id || user.id;
  if (!userId) return;

  socket = io(SOCKET_URL, {
    query: { userId, role: user.role },
    transports: ['websocket', 'polling'], 
    reconnection: true
  });

  socket.on("connect", () => {
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Connection Error Detail:", err.message); // Isse pata chalega asli wajah
  });
};

export const disconnectSocket = () => {
  if(socket) socket.disconnect();
};

export const getSocket = () => socket;