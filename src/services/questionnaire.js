import api from './api';
import axios from 'axios';

export const questionnaireService = {


  // ============ PHYSICAL PROFILE CONSENT ============


// Get consent screen
getPhysicalProfileConsentScreen: () =>
api.get('/questionnaire/physical-profile/consent-screen'),

// Submit physical profile consent
submitConsent: (consentGiven, sessionId = null) =>
api.post('/questionnaire/physical-profile/consent', {
  session_id: sessionId,
  consent_given: consentGiven,
}),
  

  // ============ PHYSICAL PROFILE QUESTIONS ============
  
  async getOnboardingScreen(type = "physical_intro", platform = "web") {
    return api.get("/onboarding/screens", {
      params: {
        type,
        platform,
      },
    });
  },



  // Get physical profile questions - fetches all categories at once
  getQuestions: (categoryKey = null, sessionId = null) => {
    const params = {};
    if (categoryKey) params.category_key = categoryKey;
    if (sessionId) params.session_id = sessionId;
    return api.get('/questionnaire/physical-profile/questions', { params });
  },

  // Get specific category questions
  getCategoryQuestions: async (categoryKey, sessionId = null) => {
    try {
      const response = await api.get('/questionnaire/physical-profile/questions', {
        params: {
          category_key: categoryKey,
          session_id: sessionId
        }
      });
      
      // Handle both response formats: success and status
      const data = response.data?.data || response.data;
      
      // The API returns questions under data.questions.{categoryKey}
      // Handle both 'success' and 'status' response formats
      if (data?.questions) {
        return data.questions[categoryKey] || [];
      }
      
      return [];
    } catch (error) {
      console.error(`Failed to fetch ${categoryKey} questions:`, error);
      return [];
    }
  },

  // Get all physical profile categories
  getAllCategories: async () => {
    try {
      const response = await api.get('/questionnaire/physical-profile/questions', {
        params: {}
      });
      
      const data = response.data?.data || response.data;
      
      // Return categories array if available
      if (data?.categories) {
        return data.categories;
      }
      
      // Default categories based on API response
      return [
        { key: 'basic_metrics', title: 'Basic Metrics' },
        { key: 'fitness', title: 'Fitness Level' },
        { key: 'medical', title: 'Medical Information' }
      ];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [
        { key: 'basic_metrics', title: 'Basic Metrics' },
        { key: 'fitness', title: 'Fitness Level' },
        { key: 'medical', title: 'Medical Information' }
      ];
    }
  },

  // ============ PHYSICAL PROFILE ANSWER ============
  
  // Submit answer for a question (number type - height/weight)
  submitNumberAnswer: (questionId, answerNumber, sessionId = null) =>
    api.post('/questionnaire/physical-profile/answer', {
      session_id: sessionId,
      question_id: questionId,
      answer_number: answerNumber,
    }),

  // Submit answer for a question (single choice)
  submitSingleChoiceAnswer: (questionId, selectedOptionIds, sessionId = null) =>
    api.post('/questionnaire/physical-profile/answer', {
      session_id: sessionId,
      question_id: questionId,
      selected_option_ids: selectedOptionIds,
    }),

  // Submit answer for a question (multi choice)
  submitMultiChoiceAnswer: (questionId, selectedOptionIds, sessionId = null) =>
    api.post('/questionnaire/physical-profile/answer', {
      session_id: sessionId,
      question_id: questionId,
      selected_option_ids: selectedOptionIds,
    }),

  // Submit answer for a question (boolean)
  submitBooleanAnswer: (questionId, answerBoolean, sessionId = null) =>
    api.post('/questionnaire/physical-profile/answer', {
      session_id: sessionId,
      question_id: questionId,
      answer_boolean: answerBoolean,
    }),

  // Submit answer for a question (text)
  submitTextAnswer: (questionId, answerText, sessionId = null) =>
    api.post('/questionnaire/physical-profile/answer', {
      session_id: sessionId,
      question_id: questionId,
      answer_text: answerText,
    }),

  // Generic answer submission - for single_select, multi_select, boolean
  submitAnswer: (questionId, answerData, sessionId = null) => {
    // Build payload based on what fields are present in answerData
    const payload = {
      question_id: questionId,
    };
    
    if (sessionId) {
      payload.session_id = sessionId;
    }
    
    // Add the appropriate answer field
    if (answerData.selected_option_ids) {
      payload.selected_option_ids = answerData.selected_option_ids;
    } else if (answerData.answer_boolean !== undefined) {
      payload.answer_boolean = answerData.answer_boolean;
    } else if (answerData.answer_text) {
      payload.answer_text = answerData.answer_text;
    } else if (answerData.answer_number !== undefined) {
      payload.answer_number = answerData.answer_number;
    }
    
    return api.post('/questionnaire/physical-profile/answer', payload);
  },

  // ============ MEDIA UPLOAD (for profile photos) ============
  
  // Get presigned URL for file upload
  getPresignedUrl: (fileName, sizeBytes, purpose = 'profile') =>
    api.post('/users/media/presign', {
      file_name: fileName,
      size_bytes: sizeBytes,
      purpose: purpose,
    }),

  // Upload file to presigned URL
  uploadToPresigned: async (presignedUrl, file, contentType) => {
    return axios.put(presignedUrl, file, {
      headers: { 'Content-Type': contentType },
    });
  },
};

export default questionnaireService;
