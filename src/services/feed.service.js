import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** Read the auth token from localStorage */
function getAuthHeaders() {
    if (typeof window === "undefined") return {};
    const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("playymate_access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("access_token") ||
        sessionStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET /api/v1/feed
 * Personalized home feed — returns items[], profile_completion_card, pagination
 */
export const getFeed = async (cursor = null, limit = 20) => {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit);

    const res = await axios.get(`${API_BASE}/feed?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    return res.data.data;
};

/**
 * GET /api/v1/feed/suggested-follows
 * Suggested users to follow
 */
export const getSuggestedFollows = async () => {
    const res = await axios.get(`${API_BASE}/feed/suggested-follows`, {
        headers: getAuthHeaders(),
    });
    return res.data.data?.items ?? [];
};

/**
 * GET /api/v1/feed/nearby-venues
 * Nearby venues based on user's location
 */
export const getNearbyVenues = async () => {
    const res = await axios.get(`${API_BASE}/feed/nearby-venues`, {
        headers: getAuthHeaders(),
    });
    return res.data.data?.items ?? [];
};

/**
 * POST /api/v1/feed/refresh
 * Invalidate feed cache so next GET returns fresh data
 */
export const refreshFeedCache = async () => {
    const res = await axios.post(
        `${API_BASE}/feed/refresh`,
        {},
        { headers: getAuthHeaders() }
    );
    return res.data;
};
