import api from './api';
import axios from 'axios';

export const questionnaireService = {
  // ============ PHYSICAL PROFILE CONSENT ============
  
  // Submit physical profile consent
  submitConsent: (consentGiven, sessionId = null) =>
    api.post('/questionnaire/physical-profile/consent', {
      session_id: sessionId,
      consent_given: consentGiven,
    }),

  // ============ PHYSICAL PROFILE QUESTIONS ============
  
  // Get physical profile questions
  getQuestions: (categoryKey = null, sessionId = null) => {
    const params = {};
    if (categoryKey) params.category_key = categoryKey;
    if (sessionId) params.session_id = sessionId;
    return api.get('/questionnaire/physical-profile/questions', { params });
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

  // Generic answer submission
  submitAnswer: (questionId, answerData, sessionId = null) =>
    api.post('/questionnaire/physical-profile/answer', {
      session_id: sessionId,
      question_id: questionId,
      ...answerData,
    }),

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
