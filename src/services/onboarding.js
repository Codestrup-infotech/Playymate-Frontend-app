import api from "./api";

export const onboardingService = {
  // Fetch onboarding screens
  getScreens: (params = {}) => api.get("/onboarding/screens", { params }),

  // Get single screen
  getScreen: (screenId) => api.get(`/onboarding/screens/${screenId}`),

  // Analytics tracking
  startSession: (data) => api.post("/onboarding/session/start", data),

  endSession: (data) => api.post("/onboarding/session/end", data),

  trackView: (screenId, data = {}) =>
    api.post(`/onboarding/screens/${screenId}/view`, data),

  trackCta: (screenId, data = {}) =>
    api.post(`/onboarding/screens/${screenId}/cta`, data),

  trackTrustAck: (data = {}) => api.post("/onboarding/trust/ack", data),
};
