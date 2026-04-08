import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
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
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getAllNotifications = async (limit = 20) => {
  const res = await api.get(`/notifications?limit=${limit}`);
  return res.data;
};

export const getNotificationsByType = async (type) => {
  const res = await api.get(`/notifications?limit=50`);
  const all = res.data?.notifications || res.data?.data?.notifications || [];
  const filtered = all.filter((item) => item.notification_type === type);
  return { ...res.data, data: { ...res.data.data, notifications: filtered } };
};

export const getUnreadNotifications = async () => {
  const res = await api.get(`/notifications?unread_only=true&limit=20`);
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await api.get(`/notifications/count`);
  return res.data;
};

export const getNotificationById = async (id) => {
  const res = await api.get(`/notifications/${id}`);
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await api.put(`/notifications/read-all`);
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await api.delete(`/notifications/${id}`);
  return res.data;
};

export const clearAllNotifications = async () => {
  const res = await api.delete(`/notifications/clear-all`);
  return res.data;
};

export const getNotificationPreferences = async () => {
  const res = await api.get(`/notifications/preferences`);
  return res.data;
};

export const updateNotificationPreferences = async (payload) => {
  const res = await api.put(`/notifications/preferences`, payload);
  return res.data;
};

export const registerFcmToken = async (token) => {
  try {
    console.log("FCM: Sending token to backend:", token);
    const res = await api.post(`/notifications/fcm-token`, {
      token,
      device_type: "web",
    });
    console.log("FCM: Backend response:", res.data);
    return res.data;
  } catch (error) {
    console.error("FCM: Failed to register token:", error.response?.data || error.message);
    throw error;
  }
};

export const deactivateFcmToken = async (token) => {
  try {
    console.log("FCM: Deactivating token:", token);
    const res = await api.delete(`/notifications/fcm-token`, {
      data: { token },
    });
    console.log("FCM: Deactivation response:", res.data);
    return res.data;
  } catch (error) {
    console.error("FCM: Failed to deactivate token:", error.response?.data || error.message);
    throw error;
  }
};

export const testSendNotification = async (fcmToken, title, description) => {
  try {
    console.log("FCM: Sending test notification...");
    const res = await api.post(`/notifications/test-send`, {
      device_id: fcmToken,
      title,
      description,
    });
    console.log("FCM: Test notification response:", res.data);
    return res.data;
  } catch (error) {
    console.error("FCM: Test notification failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getFcmTokenFromStorage = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fcm_token_registered");
};
