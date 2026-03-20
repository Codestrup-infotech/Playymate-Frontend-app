import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/** Read the auth token from localStorage/sessionStorage */
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

// =====================================================
// SEARCH MODULE APIs
// Based on Postman Collection: Playymate — Advanced Search & Discovery
// =====================================================

/**
 * GET /api/v1/search/history
 * Get user's recent search history
 */
export const getSearchHistory = async (limit = 20) => {
  const params = new URLSearchParams();
  params.append("limit", limit);

  const res = await axios.get(`${API_BASE}/search/history?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * DELETE /api/v1/search/history
 * Clear user's search history
 */
export const clearSearchHistory = async () => {
  const res = await axios.delete(`${API_BASE}/search/history`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * GET /api/v1/search/trending
 * Get trending search queries by category
 */
export const getTrendingSearches = async (category = null, limit = 10) => {
  const params = new URLSearchParams();
  params.append("limit", limit);
  if (category) params.append("category", category);

  const res = await axios.get(`${API_BASE}/search/trending?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * GET /api/v1/search/suggestions
 * Get autocomplete suggestions for search input
 */
export const getAutocompleteSuggestions = async (query, limit = 10) => {
  const params = new URLSearchParams();
  params.append("q", query);
  params.append("limit", limit);

  const res = await axios.get(`${API_BASE}/search/suggestions?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * POST /api/v1/search/global
 * NLP-powered global search across multiple entity types
 */
export const globalSearch = async (searchData) => {
  const { q, latitude, longitude, distance = 10, limit = 20, page = 1, sort = "relevance" } = searchData;

  const body = {
    q,
    latitude,
    longitude,
    distance,
    limit,
    page,
    sort,
  };

  const res = await axios.post(`${API_BASE}/search/global`, body, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data;
};

/**
 * GET /api/v1/search/posts
 * Search posts with NLP query parsing and optional filters
 */
export const searchPosts = async (searchParams) => {
  const { q, latitude, longitude, distance = 10, category, limit = 20, page = 1 } = searchParams;

  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (latitude) params.append("latitude", latitude);
  if (longitude) params.append("longitude", longitude);
  if (distance) params.append("distance", distance);
  if (category) params.append("category", category);
  params.append("limit", limit);
  params.append("page", page);

  const res = await axios.get(`${API_BASE}/search/posts?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * GET /api/v1/search/accounts
 * Search for user accounts by username or bio text
 */
export const searchAccounts = async (query, limit = 20, page = 1) => {
  const params = new URLSearchParams();
  params.append("q", query);
  params.append("limit", limit);
  params.append("page", page);

  const res = await axios.get(`${API_BASE}/search/accounts?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * GET /api/v1/search/nearby
 * Find posts, venues, or events within a specific radius of a location
 */
export const getNearbyContent = async (searchParams) => {
  const { latitude, longitude, distance = 10, type = "post", limit = 20 } = searchParams;

  const params = new URLSearchParams();
  params.append("latitude", latitude);
  params.append("longitude", longitude);
  params.append("distance", distance);
  if (type) params.append("type", type);
  params.append("limit", limit);

  const res = await axios.get(`${API_BASE}/search/nearby?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * GET /api/v1/map/nearby
 * Get nearby items for map display with automatic clustering
 */
export const getMapNearby = async (searchParams) => {
  const { latitude, longitude, radius = 10, type = "all", zoom = 12 } = searchParams;

  const params = new URLSearchParams();
  params.append("latitude", latitude);
  params.append("longitude", longitude);
  params.append("radius", radius);
  if (type) params.append("type", type);
  params.append("zoom", zoom);

  const res = await axios.get(`${API_BASE}/map/nearby?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * GET /api/v1/map/clusters
 * Get map clusters for a bounding box area
 */
export const getMapClusters = async (searchParams) => {
  const { ne_lat, ne_lng, sw_lat, sw_lng, zoom = 10, type = "all" } = searchParams;

  const params = new URLSearchParams();
  params.append("ne_lat", ne_lat);
  params.append("ne_lng", ne_lng);
  params.append("sw_lat", sw_lat);
  params.append("sw_lng", sw_lng);
  params.append("zoom", zoom);
  if (type) params.append("type", type);

  const res = await axios.get(`${API_BASE}/map/clusters?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// =====================================================
// RECOMMENDATIONS APIs
// =====================================================

/**
 * GET /api/v1/recommendations
 * Get personalized recommendations
 */
export const getRecommendations = async (type = "hybrid", limit = 20) => {
  const params = new URLSearchParams();
  params.append("type", type);
  params.append("limit", limit);

  const res = await axios.get(`${API_BASE}/recommendations?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * GET /api/v1/recommendations/similar
 * Get content similar to a specific post or reel
 */
export const getSimilarContent = async (contentId, contentType = "post", limit = 10) => {
  const params = new URLSearchParams();
  params.append("contentId", contentId);
  params.append("contentType", contentType);
  params.append("limit", limit);

  const res = await axios.get(`${API_BASE}/recommendations/similar?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * GET /api/v1/recommendations/profile
 * Get user's interest profile derived from search behavior
 */
export const getUserSearchProfile = async () => {
  const res = await axios.get(`${API_BASE}/recommendations/profile`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// =====================================================
// FILTER PRESETS APIs
// =====================================================

/**
 * POST /api/v1/search/filters
 * Save a filter preset for quick access
 */
export const saveFilterPreset = async (filterData) => {
  const { name, entityType, filters, sortBy } = filterData;

  const body = {
    name,
    entityType,
    filters,
    sortBy,
  };

  const res = await axios.post(`${API_BASE}/search/filters`, body, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data;
};

/**
 * GET /api/v1/search/filters
 * Get user's saved filter presets
 */
export const getSavedFilters = async () => {
  const res = await axios.get(`${API_BASE}/search/filters`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * GET /api/v1/search/filters/available
 * Get available filter options for an entity type
 */
export const getAvailableFilters = async (entityType = "post") => {
  const params = new URLSearchParams();
  params.append("entityType", entityType);

  const res = await axios.get(`${API_BASE}/search/filters/available?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

/**
 * DELETE /api/v1/search/filters/:filterId
 * Delete a saved filter preset
 */
export const deleteFilterPreset = async (filterId) => {
  const res = await axios.delete(`${API_BASE}/search/filters/${filterId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// =====================================================
// ANALYTICS & TRACKING APIs
// =====================================================

/**
 * POST /api/v1/search/track
 * Track a search event for analytics
 */
export const trackSearchEvent = async (eventData) => {
  const { query, entityType, resultsReturned, queryTimeMs, filters } = eventData;

  const body = {
    query,
    entityType,
    resultsReturned,
    queryTimeMs,
    filters,
  };

  const res = await axios.post(`${API_BASE}/search/track`, body, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data;
};

/**
 * POST /api/v1/search/click
 * Track when user clicks on a search result
 */
export const trackResultClick = async (clickData) => {
  const { searchId, resultId, resultType, position, dwellTime } = clickData;

  const body = {
    searchId,
    resultId,
    resultType,
    position,
    dwellTime,
  };

  const res = await axios.post(`${API_BASE}/search/click`, body, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data;
};
