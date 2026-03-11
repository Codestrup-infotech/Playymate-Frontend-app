/**
 * Question API Service
 * Handles fetching questions and submitting answers via GET/POST APIs
 * Uses mock data fallback if API is not available
 */

import axios from "axios";
import { getAuthToken } from "./client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetch all questions for a specific item within a category
 * Uses GET API endpoint: /questionnaire/items/{itemId}/questions
 * Falls back to mock data if API fails
 * 
 * @param {string} category - Category slug (e.g., 'sports', 'hobbies')
 * @param {string} itemId - Item ID to fetch questions for
 * @param {string} sessionId - Optional session ID
 * @param {string} token - Optional auth token (will use from storage if not provided)
 * @returns {Promise<Object>} Questions data
 */
export async function fetchAllQuestions(category, itemId, sessionId = null, token = null) {
  const authToken = token || getAuthToken();

  // Use mock data if no token available (development mode)
  if (!authToken) {
    console.log("⚠️ No auth token, using mock questions data");
    return fetchMockQuestions(category, itemId, sessionId);
  }

  try {
    const response = await axios.get(
      `${API_BASE}/questionnaire/items/${itemId}/questions`,
      {
        params: {
          category,
          session_id: sessionId
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        timeout: 10000,
      }
    );

    if (response.data?.success) {
      return response.data.data || response.data;
    }

    throw new Error("Invalid API response");
  } catch (error) {
    console.warn(`⚠️ API fetch failed for item ${itemId}, using mock data:`, error.message);
    return fetchMockQuestions(category, itemId, sessionId);
  }
}

/**
 * Submit an answer for a question
 * Uses POST API endpoint: /questionnaire/answers
 * Falls back to mock response if API fails
 * 
 * @param {string} questionId - Question ID
 * @param {*} answer - The answer value
 * @param {string} sessionId - Session ID
 * @param {string} token - Optional auth token
 * @returns {Promise<Object>} Submission response
 */
export async function postAnswer(questionId, answer, sessionId, token = null) {
  const authToken = token || getAuthToken();

  // Use mock response if no token available
  if (!authToken) {
    console.log("⚠️ No auth token, using mock answer response");
    return mockSubmitAnswer(questionId, answer, sessionId);
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
          Authorization: `Bearer ${authToken}`,
        },
        timeout: 10000,
      }
    );

    if (response.data?.success) {
      return response.data;
    }

    throw new Error("Invalid API response");
  } catch (error) {
    console.warn("⚠️ API submit failed, using mock response:", error.message);
    return mockSubmitAnswer(questionId, answer, sessionId);
  }
}

/**
 * Submit multiple answers at once (batch)
 * Uses POST API endpoint: /questionnaire/answers/batch
 * 
 * @param {Array} answers - Array of {questionId, answer} objects
 * @param {string} sessionId - Session ID
 * @param {string} token - Optional auth token
 * @returns {Promise<Object>} Batch submission response
 */
export async function postBatchAnswers(answers, sessionId, token = null) {
  const authToken = token || getAuthToken();

  if (!authToken) {
    console.log("⚠️ No auth token, using mock batch response");
    return {
      success: true,
      data: {
        session_id: sessionId,
        answers_submitted: answers.length,
        completed: true,
      }
    };
  }

  try {
    const response = await axios.post(
      `${API_BASE}/questionnaire/answers/batch`,
      {
        answers,
        session_id: sessionId,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.warn("⚠️ Batch submit failed:", error.message);
    return {
      success: true,
      data: {
        session_id: sessionId,
        answers_submitted: answers.length,
        completed: true,
      }
    };
  }
}

/* MOCK QUESTION API - Used when real API is not available */

/**
 * Generate mock questions based on category and item
 * @param {string} category - Category slug
 * @param {string} itemId - Item ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Mock questions data
 */
export async function fetchMockQuestions(category, itemId, sessionId = null) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockQuestions = getMockQuestionsByCategory(category, itemId);

  return {
    questions: mockQuestions,
    session_id: sessionId || `mock_session_${Date.now()}`,
    category,
    item_id: itemId,
  };
}

/**
 * Get mock questions based on category
 */
function getMockQuestionsByCategory(category, itemId) {
  const normalizedCategory = category?.toLowerCase();

  // Category-specific mock questions
  const mockData = {
    sports: [
      {
        question_id: `q1_${itemId}`,
        question_text: "How often do you engage in this sport?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "daily", label: "Daily", value: "daily" },
          { option_id: "weekly", label: "Weekly", value: "weekly" },
          { option_id: "monthly", label: "Monthly", value: "monthly" },
          { option_id: "rarely", label: "Rarely", value: "rarely" },
        ],
      },
      {
        question_id: `q2_${itemId}`,
        question_text: "What is your skill level?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "beginner", label: "Beginner", value: "beginner" },
          { option_id: "intermediate", label: "Intermediate", value: "intermediate" },
          { option_id: "advanced", label: "Advanced", value: "advanced" },
          { option_id: "professional", label: "Professional", value: "professional" },
        ],
      },
      {
        question_id: `q3_${itemId}`,
        question_text: "Do you prefer playing individually or in a team?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "individual", label: "Individual", value: "individual" },
          { option_id: "team", label: "Team", value: "team" },
          { option_id: "both", label: "Both", value: "both" },
        ],
      },
    ],
    hobbies: [
      {
        question_id: `q1_${itemId}`,
        question_text: "How would you describe your interest level?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "casual", label: "Casual Hobby", value: "casual" },
          { option_id: "serious", label: "Serious Hobby", value: "serious" },
          { option_id: "passionate", label: "Very Passionate", value: "passionate" },
        ],
      },
      {
        question_id: `q2_${itemId}`,
        question_text: "How often do you practice this hobby?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "daily", label: "Every Day", value: "daily" },
          { option_id: "weekly", label: "A Few Times a Week", value: "weekly" },
          { option_id: "monthly", label: "Occasionally", value: "monthly" },
          { option_id: "rarely", label: "Rarely", value: "rarely" },
        ],
      },
    ],
    interests: [
      {
        question_id: `q1_${itemId}`,
        question_text: "What attracts you to this interest?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "fun", label: "Fun & Entertainment", value: "fun" },
          { option_id: "learning", label: "Learning New Things", value: "learning" },
          { option_id: "social", label: "Social Connection", value: "social" },
          { option_id: "fitness", label: "Health & Fitness", value: "fitness" },
        ],
      },
      {
        question_id: `q2_${itemId}`,
        question_text: "Would you like to explore this interest actively?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "yes", label: "Yes, definitely!", value: "yes" },
          { option_id: "maybe", label: "Maybe sometime", value: "maybe" },
          { option_id: "no", label: "Just curious", value: "no" },
        ],
      },
    ],
    activities: [
      {
        question_id: `q1_${itemId}`,
        question_text: "What type of activities do you prefer?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "indoor", label: "Indoor Activities", value: "indoor" },
          { option_id: "outdoor", label: "Outdoor Activities", value: "outdoor" },
          { option_id: "both", label: "Both", value: "both" },
        ],
      },
      {
        question_id: `q2_${itemId}`,
        question_text: "How social do you like your activities?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "solo", label: "Solo", value: "solo" },
          { option_id: "small_group", label: "Small Group", value: "small_group" },
          { option_id: "large_group", label: "Large Group", value: "large_group" },
        ],
      },
    ],
    experience: [
      {
        question_id: `q1_${itemId}`,
        question_text: "How would you rate your experience level?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "novice", label: "Novice", value: "novice" },
          { option_id: "intermediate", label: "Intermediate", value: "intermediate" },
          { option_id: "expert", label: "Expert", value: "expert" },
          { option_id: "master", label: "Master", value: "master" },
        ],
      },
    ],
    "nostalgia-games": [
      {
        question_id: `q1_${itemId}`,
        question_text: "How often did you play this game in the past?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "all_the_time", label: "All the time!", value: "all_the_time" },
          { option_id: "sometimes", label: "Sometimes", value: "sometimes" },
          { option_id: "rarely", label: "Rarely", value: "rarely" },
        ],
      },
      {
        question_id: `q2_${itemId}`,
        question_text: "Would you like to reconnect with this game?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "definitely", label: "Definitely!", value: "definitely" },
          { option_id: "maybe", label: "Maybe", value: "maybe" },
          { option_id: "nostalgia_only", label: "Just for nostalgia", value: "nostalgia_only" },
        ],
      },
    ],
    new: [
      {
        question_id: `q1_${itemId}`,
        question_text: "What kind of new experience are you looking for?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "adventure", label: "Adventure", value: "adventure" },
          { option_id: "creative", label: "Creative", value: "creative" },
          { option_id: "relaxing", label: "Relaxing", value: "relaxing" },
          { option_id: "challenging", label: "Challenging", value: "challenging" },
        ],
      },
      {
        question_id: `q2_${itemId}`,
        question_text: "How open are you to learning something new?",
        type: "single_choice",
        required: true,
        options: [
          { option_id: "very_open", label: "Very Open", value: "very_open" },
          { option_id: "somewhat", label: "Somewhat", value: "somewhat" },
          { option_id: "cautious", label: "Cautious", value: "cautious" },
        ],
      },
    ],
  };

  // Return category-specific questions or default
  return mockData[normalizedCategory] || mockData.sports;
}

/**
 * Mock answer submission response
 */
function mockSubmitAnswer(questionId, answer, sessionId) {
  return {
    success: true,
    data: {
      question_id: questionId,
      answer,
      session_id: sessionId,
      submitted_at: new Date().toISOString(),
      completed: false,
    },
  };
}

/**
 * Start a new questionnaire session
 * Uses POST API: /questionnaire/session/start
 */
export async function startQuestionnaireSession(category, token = null) {
  const authToken = token || getAuthToken();

  if (!authToken) {
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
    console.warn("⚠️ Session start failed:", error.message);
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
}

/**
 * Complete a questionnaire session
 * Uses POST API: /questionnaire/session/complete
 */
export async function completeQuestionnaireSession(sessionId, token = null) {
  const authToken = token || getAuthToken();

  if (!authToken) {
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
      `${API_BASE}/questionnaire/session/complete`,
      { session_id: sessionId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.warn("⚠️ Session complete failed:", error.message);
    return {
      success: true,
      data: {
        session_id: sessionId,
        status: "COMPLETED",
        completed_at: new Date().toISOString(),
      },
    };
  }
}

export default {
  fetchAllQuestions,
  postAnswer,
  postBatchAnswers,
  fetchMockQuestions,
  startQuestionnaireSession,
  completeQuestionnaireSession,
};
