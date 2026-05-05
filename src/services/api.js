
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

// Helper for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("CommunityPulse_token");
    const { isFormData, ...rest } = options;

    // 1. URL Formatting (endpoint should start with /)
    const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const config = {
      ...rest,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...rest.headers,
      },
    };

    const response = await fetch(url, config);

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || "Server error occurred" };
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Error ${response.status}: Request failed`,
      );
    }

    return data;
  } catch (error) {
    console.error(`❌ API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// AUTH API 
export const authAPI = {
  register: (userData) =>
    apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        ...userData,
        email: userData.email?.toLowerCase().trim(), 
      }),
    }),

  login: (email, password) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
      }),
    }),

  getMe: () => apiCall("/auth/me"),

  updateProfile: (updates) =>
    apiCall("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  changePassword: (currentPassword, newPassword) =>
    apiCall("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  forgotPassword: (email) =>
    apiCall("/auth/forgot", {
      method: "POST",
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    }),

  RePassword: (token, password, confirmPassword) =>
    apiCall(`/auth/reset/${token}`, {
      method: "PATCH",
      body: JSON.stringify({ password, confirmPassword }),
    }),
    verifyOTP: (email, otp) =>
    apiCall("/auth/verify", {
      method: "POST",
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        otp,
      }),
    }),
};

// NEEDS API
export const needsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/needs${query ? `?${query}` : ""}`);
  },
  getById: (id) => apiCall(`/needs/${id}`),
  getStats: () => apiCall("/needs/stats"),
  getCriticalNeeds: () => apiCall("/needs/getcriticalneeds"),
  create: (needData) =>
    apiCall("/needs", {
      method: "POST",
      body: JSON.stringify(needData),
    }),
  update: (id, updates) =>
    apiCall(`/needs/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  verify: (id) => apiCall(`/needs/${id}/verify`, { method: "PUT" }),
  delete: (id) => apiCall(`/needs/${id}`, { method: "DELETE" }),
};

// VOLUNTEERS API
export const volunteersAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/volunteers${query ? `?${query}` : ""}`);
  },
  getById: (id) => apiCall(`/volunteers/${id}`),
  getStats: () => apiCall("/volunteers/stats"),
  register: (volunteerData) =>
    apiCall("/volunteers", {
      method: "POST",
      body: JSON.stringify(volunteerData),
    }),
  update: (id, updates) =>
    apiCall(`/volunteers/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  updateStatus: (id, status) =>
    apiCall(`/volunteers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  rate: (id, rating) =>
    apiCall(`/volunteers/${id}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    }),
  delete: (id) => apiCall(`/volunteers/${id}`, { method: "DELETE" }),
};

// TASKS API
export const tasksAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/tasks${query ? `?${query}` : ""}`);
  },
  getById: (id) => apiCall(`/tasks/${id}`),
  getBoard: () => apiCall("/tasks/board"),
  create: (taskData) =>
    apiCall("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    }),
  update: (id, updates) =>
    apiCall(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  assignVolunteer: (taskId, volunteerId) =>
    apiCall(`/tasks/${taskId}/assign`, {
      method: "POST",
      body: JSON.stringify({ volunteerId }),
    }),
  unassignVolunteer: (taskId, volunteerId) =>
    apiCall(`/tasks/${taskId}/unassign`, {
      method: "POST",
      body: JSON.stringify({ volunteerId }),
    }),
  complete: (id) => apiCall(`/tasks/${id}/complete`, { method: "POST" }),
  delete: (id) => apiCall(`/tasks/${id}`, { method: "DELETE" }),
};

// SURVEYS API
export const surveysAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/surveys${query ? `?${query}` : ""}`);
  },
  getById: (id) => apiCall(`/surveys/${id}`),
  getStats: () => apiCall("/surveys/stats"),
  submit: (formData) =>
    apiCall("/surveys", {
      method: "POST",
      body: formData, 
      isFormData: true,
    }),
  verify: (id) => apiCall(`/surveys/${id}/verify`, { method: "PUT" }),
  delete: (id) => apiCall(`/surveys/${id}`, { method: "DELETE" }),
};

// MATCHING API
export const matchingAPI = {
  matchForNeed: (needId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/matching/need/${needId}${query ? `?${query}` : ""}`, {
      method: "POST",
    });
  },
  matchAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/matching/all${query ? `?${query}` : ""}`, {
      method: "POST",
    });
  },
  matchForVolunteer: (volunteerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(
      `/matching/volunteer/${volunteerId}${query ? `?${query}` : ""}`,
      { method: "POST" },
    );
  },
  confirm: (volunteerId, needId, taskId) =>
    apiCall("/matching/confirm", {
      method: "POST",
      body: JSON.stringify({ volunteerId, needId, taskId }),
    }),
};

// HEALTH CHECK
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return { connected: false };
    const data = await response.json();
    return { connected: true, ...data };
  } catch {
    return { connected: false };
  }
};

export default apiCall;
