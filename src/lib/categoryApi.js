// lib/categoryApi.js - API configuration and functions for questionnaire categories

import axios from "axios";
import { getAuthToken } from "@/lib/api/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api-dev.playymate.com/api/v1";

// Theme configurations for different categories
export const CATEGORY_THEMES = {
  sports: {
    title: "Sports",
    gradient: "from-blue-500 to-cyan-500",
    borderColor: "border-cyan-500",
    hoverGradient: "hover:from-blue-600 hover:to-cyan-400",
    selectedBg: "bg-blue-900/50",
    iconColor: "text-cyan-400",
  },
  hobbies: {
    title: "Hobbies",
    gradient: "from-pink-500 to-purple-500",
    borderColor: "border-pink-500",
    hoverGradient: "hover:from-pink-600 hover:to-purple-400",
    selectedBg: "bg-pink-900/50",
    iconColor: "text-pink-400",
  },
  interests: {
    title: "Interests",
    gradient: "from-green-500 to-emerald-500",
    borderColor: "border-green-500",
    hoverGradient: "hover:from-green-600 hover:to-emerald-400",
    selectedBg: "bg-green-900/50",
    iconColor: "text-green-400",
  },
  activities: {
    title: "Activities",
    gradient: "from-orange-500 to-amber-500",
    borderColor: "border-orange-500",
    hoverGradient: "hover:from-orange-600 hover:to-amber-400",
    selectedBg: "bg-orange-900/50",
    iconColor: "text-orange-400",
  },
  experience: {
    title: "Experience",
    gradient: "from-purple-500 to-indigo-500",
    borderColor: "border-purple-500",
    hoverGradient: "hover:from-purple-600 hover:to-indigo-400",
    selectedBg: "bg-purple-900/50",
    iconColor: "text-purple-400",
  },
  "nostalgia-games": {
    title: "Nostalgia Games",
    gradient: "from-yellow-500 to-orange-500",
    borderColor: "border-yellow-500",
    hoverGradient: "hover:from-yellow-600 hover:to-orange-400",
    selectedBg: "bg-yellow-900/50",
    iconColor: "text-yellow-400",
  },
  new: {
    title: "New",
    gradient: "from-rose-500 to-pink-500",
    borderColor: "border-rose-500",
    hoverGradient: "hover:from-rose-600 hover:to-pink-400",
    selectedBg: "bg-rose-900/50",
    iconColor: "text-rose-400",
  },
};

// Fallback theme for unknown categories
const DEFAULT_THEME = {
  title: "General",
  gradient: "from-gray-500 to-slate-500",
  borderColor: "border-gray-500",
  hoverGradient: "hover:from-gray-600 hover:to-slate-400",
  selectedBg: "bg-gray-900/50",
  iconColor: "text-gray-400",
};

/**
 * Get the theme configuration for a category
 * @param {string} category - The category slug
 * @returns {Object} Theme configuration object
 */
export const getCategoryTheme = (category) => {
  return CATEGORY_THEMES[category] || DEFAULT_THEME;
};

/**
 * Fetch all categories from the API
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Categories data
 */
export const fetchCategories = async (token) => {
  // Return mock data for development
  if (token === "dev_token") {
    return {
      categories: [
        { id: "sports", slug: "sports", name: "Sports", description: "Cricket, Football, Basketball & more" },
        { id: "hobbies", slug: "hobbies", name: "Hobbies", description: "Discover your hobbies vibe" },
        { id: "interests", slug: "interests", name: "Interests", description: "Choose your interest style" },
        { id: "activities", slug: "activities", name: "Activities", description: "Find your perfect activity" },
        { id: "experience", slug: "experience", name: "Experience", description: "Share your experience" },
        { id: "nostalgia-games", slug: "nostalgia-games", name: "Nostalgia Games", description: "Classic games" },
        { id: "new", slug: "new", name: "New", description: "Try something new" },
      ]
    };
  }

  try {
    const response = await axios.get(`${API_BASE}/questionnaire/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

/**
 * Fetch items for a specific category
 * @param {string} category - Category slug
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Category items data
 */
export const fetchCategoryItems = async (category, token) => {
  // Return mock data for development
  if (token === "dev_token") {
    const mockItems = {
      sports: [
        { id: "cricket", name: "Cricket", key: "cricket" },
        { id: "football", name: "Football", key: "football" },
        { id: "basketball", name: "Basketball", key: "basketball" },
      ],
      hobbies: [
        { id: "cycling", name: "Cycling", key: "cycling" },
        { id: "dancing", name: "Dancing", key: "dancing" },
        { id: "running", name: "Running", key: "running" },
      ],
      interests: [
        { id: "dance", name: "Dance", key: "dance" },
        { id: "music", name: "Music", key: "music" },
        { id: "art", name: "Art", key: "art" },
      ],
      activities: [
        { id: "social-events", name: "Social Events", key: "social-events" },
        { id: "outdoor", name: "Outdoor", key: "outdoor" },
        { id: "indoor", name: "Indoor", key: "indoor" },
      ],
      experience: [
        { id: "beginner", name: "Beginner", key: "beginner" },
        { id: "intermediate", name: "Intermediate", key: "intermediate" },
        { id: "advanced", name: "Advanced", key: "advanced" },
      ],
      "nostalgia-games": [
        { id: "gulli-danda", name: "Gulli Danda", key: "gulli-danda" },
        { id: "hide-seek", name: "Hide & Seek", key: "hide-seek" },
        { id: "kabbadi", name: "Kabbadi", key: "kabbadi" },
      ],
      new: [
        { id: "new-activity", name: "Try Something New", key: "new" },
        { id: "adventure", name: "Adventure", key: "adventure" },
        { id: "learning", name: "Learning", key: "learning" },
      ],
    };
    return { items: mockItems[category] || [], max_selection: 3 };
  }

  try {
    const response = await axios.get(
      `${API_BASE}/questionnaire/categories/${category}/items`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching ${category} items:`, error);
    throw error;
  }
};

/**
 * Fetch questions for a specific item within a category
 * @param {string} category - Category slug
 * @param {string} itemId - Item ID
 * @param {string} sessionId - Session ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Questions data
 */
export const fetchItemQuestions = async (category, itemId, sessionId, token) => {
  // Return mock data for development
  if (token === "dev_token") {
    return {
      questions: [
        {
          id: "q1",
          question: "How often do you engage in this activity?",
          type: "single_choice",
          options: [
            { id: "daily", label: "Daily", icon: "sun" },
            { id: "weekly", label: "Weekly", icon: "calendar" },
            { id: "monthly", label: "Monthly", icon: "clock" },
          ],
        },
        {
          id: "q2",
          question: "What is your skill level?",
          type: "single_choice",
          options: [
            { id: "beginner", label: "Beginner", icon: "star" },
            { id: "intermediate", label: "Intermediate", icon: "medal" },
            { id: "advanced", label: "Advanced", icon: "trophy" },
          ],
        },
        {
          id: "q3",
          question: "Do you prefer individual or team activities?",
          type: "single_choice",
          options: [
            { id: "individual", label: "Individual", icon: "user" },
            { id: "team", label: "Team", icon: "users" },
          ],
        },
      ],
      session_id: sessionId || "dev_session",
    };
  }

  try {
    const response = await axios.get(
      `${API_BASE}/questionnaire/items/${itemId}/questions`,
      {
        params: { session_id: sessionId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching questions for ${itemId}:`, error);
    throw error;
  }
};

/**
 * Submit answers for a question
 * @param {string} questionId - Question ID
 * @param {*} answer - The selected answer
 * @param {string} sessionId - Session ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Submission response
 */
export const submitAnswer = async (questionId, answer, sessionId, token) => {
  // Return mock response for development
  if (token === "dev_token") {
    return {
      success: true,
      data: {
        question_id: questionId,
        answer,
        session_id: sessionId || "dev_session",
        completed: false,
      },
    };
  }

  try {
    const response = await axios.post(
      `${API_BASE}/questionnaire/answers`,
      {
        question_id: questionId,
        answer,
        session_id: sessionId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
} catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
};

/**
 * Start a new questionnaire session
 * @param {string} category - Category slug
 * @param {string} token - Authentication token (optional if using getAuthToken)
 * @returns {Promise<Object>} Session data with session_id
 */
export const startQuestionnaireSession = async (category, token = null) => {
  const authToken = token || getAuthToken();

  // Return mock response for development
  if (authToken === "dev_token" || !authToken) {
    return {
      success: true,
      data: {
        session_id: `session_${Date.now()}`,
        category,
        status: "STARTED",
        started_at: new Date().toISOString(),
      },
    };
  }

  try {
    const response = await axios.post(
      `${API_BASE}/questionnaire/session/start`,
      { category },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting questionnaire session:", error);
    throw error;
  }
};

/**
 * Submit category/item selection
 * @param {string} sessionId - Session ID
 * @param {Array} selections - Array of selected item IDs
 * @param {string} token - Authentication token (optional)
 * @returns {Promise<Object>} Selection response
 */
export const submitQuestionnaireSelection = async (sessionId, selections, token = null) => {
  const authToken = token || getAuthToken();

  // Return mock response for development
  if (authToken === "dev_token" || !authToken) {
    return {
      success: true,
      data: {
        session_id: sessionId,
        selections,
        status: "SELECTIONS_SAVED",
      },
    };
  }

  try {
    const response = await axios.post(
      `${API_BASE}/questionnaire/selection`,
      {
        session_id: sessionId,
        selections,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting selection:", error);
    throw error;
  }
};

/**
 * Complete a questionnaire session
 * @param {string} sessionId - Session ID
 * @param {string} token - Authentication token (optional)
 * @returns {Promise<Object>} Completion response
 */
export const completeQuestionnaireSession = async (sessionId, token = null) => {
  const authToken = token || getAuthToken();

  // Return mock response for development
  if (authToken === "dev_token" || !authToken) {
    return {
      success: true,
      data: {
        session_id: sessionId,
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
      },
    };
  }

  try {
    const response = await axios.post(
      `${API_BASE}/questionnaire/complete`,
      { session_id: sessionId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error completing questionnaire session:", error);
    throw error;
  }
};

// GIF mapping for categories (fallback visuals)
export const CATEGORY_GIFS = {
  sports: "/GIF/sportGif.gif",
  hobbies: "/GIF/hobbiesGif.gif",
  interests: "/GIF/interestGif.gif",
  activities: "/GIF/activityGif.gif",
  experience: "/GIF/fitnessGif.gif",
  "nostalgia-games": "/GIF/nostalgiaGif.gif",
  new: "/GIF/fitnessGif.gif",
};

export default {
  fetchCategories,
  fetchCategoryItems,
  fetchItemQuestions,
  submitAnswer,
  startQuestionnaireSession,
  submitQuestionnaireSelection,
  completeQuestionnaireSession,
  getCategoryTheme,
  CATEGORY_THEMES,
  CATEGORY_GIFS,
};
