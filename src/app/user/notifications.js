import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔹 Axios Instance
const api = axios.create({
  baseURL: BASE_URL,
});

// 🔹 Attach Token Automatically
api.interceptors.request.use((config) => {
  // Check multiple possible token keys (same as other services)
  const token =
    typeof window !== "undefined" && (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("playymate_access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("accessToken") ||
      sessionStorage.getItem("access_token") ||
      sessionStorage.getItem("playymate_access_token")
    );

  console.log("🔐 Token Check:", token ? "Token exists" : "No token found");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔐 Authorization header added");
  } else {
    console.warn("⚠️ No token available for API call:", config.url);
  }

  return config;
});

// ==============================
// 🔔 GET NOTIFICATIONS
// ==============================

// Get All Notifications
export const getAllNotifications = async (limit = 20) => {
  console.log("📡 API Call: getAllNotifications with limit:", limit);
  const res = await api.get(`/notifications?limit=${limit}`);
  console.log("📡 API Response: getAllNotifications", res.data);
  return res.data;
};

// Get Notifications by Type (Frontend Filter)
export const getNotificationsByType = async (type) => {
  console.log("📡 API Call: getNotificationsByType:", type);
  const res = await api.get(`/notifications?limit=50`);
  console.log("📡 API Response: getNotificationsByType", res.data);

  // Handle both response formats: res.data.notifications or res.data.data.notifications
  const all = res.data?.notifications || res.data?.data?.notifications || [];
  console.log("📡 All notifications:", all);

  const filtered = all.filter(
    (item) => item.notification_type === type
  );
  console.log("📡 Filtered notifications:", filtered);

  return {
    ...res.data,
    data: {
      ...res.data.data,
      notifications: filtered,
    },
  };
};

// Get Unread Only
export const getUnreadNotifications = async () => {
  console.log("📡 API Call: getUnreadNotifications");
  const res = await api.get(
    `/notifications?unread_only=true&limit=20`
  );
  console.log("📡 API Response: getUnreadNotifications", res.data);
  return res.data;
};

// Get Unread Count
export const getUnreadCount = async () => {
  console.log("📡 API Call: getUnreadCount");
  const res = await api.get(`/notifications/count`);
  console.log("📡 API Response: getUnreadCount", res.data);
  return res.data;
};

// Get Single Notification
export const getNotificationById = async (id) => {
  const res = await api.get(`/notifications/${id}`);
  return res.data;
};

// ==============================
// ✅ MARK AS READ
// ==============================

// Mark One as Read
export const markAsRead = async (id) => {
  console.log("📡 API Call: markAsRead for id:", id);
  const res = await api.put(`/notifications/${id}/read`);
  console.log("📡 API Response: markAsRead", res.data);
  return res.data;
};

// Mark All as Read
export const markAllAsRead = async () => {
  console.log("📡 API Call: markAllAsRead");
  const res = await api.put(`/notifications/read-all`);
  console.log("📡 API Response: markAllAsRead", res.data);
  return res.data;
};

// ==============================
// ❌ DELETE
// ==============================

// Delete Single Notification
export const deleteNotification = async (id) => {
  console.log("📡 API Call: deleteNotification for id:", id);
  const res = await api.delete(`/notifications/${id}`);
  console.log("📡 API Response: deleteNotification", res.data);
  return res.data;
};

// Clear All Notifications
export const clearAllNotifications = async () => {
  console.log("📡 API Call: clearAllNotifications");
  const res = await api.delete(`/notifications/clear-all`);
  console.log("📡 API Response: clearAllNotifications", res.data);
  return res.data;
};

// ==============================
// ⚙️ PREFERENCES
// ==============================

// Get Preferences
export const getNotificationPreferences = async () => {
  const res = await api.get(`/notifications/preferences`);
  return res.data;
};

// Update Preferences
export const updateNotificationPreferences = async (payload) => {
  const res = await api.put(`/notifications/preferences`, payload);
  return res.data;
};

// ==============================
// 📱 FCM TOKEN
// ==============================

// Register FCM Token
export const registerFcmToken = async (token) => {
  const res = await api.post(`/notifications/fcm-token`, {
    token,
    device_type: "android",
  });
  return res.data;
};

// Deactivate FCM Token
export const deactivateFcmToken = async (token) => {
  const res = await api.delete(`/notifications/fcm-token`, {
    data: { token },
  });
  return res.data;
};