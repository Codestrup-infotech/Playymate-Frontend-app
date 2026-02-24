import api from './api';

export const kycService = {
  // ============ DIGILOCKER KYC ============
  
  // Check DigiLocker account
  digilockerAccountCheck: (verificationId, mobileNumber, aadhaarNumber = null) => 
    api.post('/kyc/digilocker/account-check', {
      verification_id: verificationId,
      mobile_number: mobileNumber,
      aadhaar_number: aadhaarNumber,
    }),

  // Create DigiLocker consent URL
  digilockerCreateUrl: (verificationId, documentRequested, redirectUrl, userFlow = 'verification') =>
    api.post('/kyc/digilocker/create-url', {
      verification_id: verificationId,
      document_requested: documentRequested,
      redirect_url: redirectUrl,
      user_flow: userFlow,
    }),

  // Get DigiLocker status
  digilockerStatus: (verificationId) =>
    api.get(`/kyc/digilocker/status?verification_id=${verificationId}`),

  // Get Aadhaar document
  digilockerDocument: (type, verificationId) =>
    api.get(`/kyc/digilocker/document/${type}?verification_id=${verificationId}`),

  // ============ FACE LIVENESS ============

  // Submit face liveness
  faceLiveness: (imageUrl) =>
    api.post('/kyc/face-liveness', { image_url: imageUrl }),

  // ============ KYC COMPLETE ============

  // Complete KYC
  completeKYC: () =>
    api.post('/kyc/complete'),

  // Get KYC status
  getKYCStatus: () =>
    api.get('/kyc/status'),
};

export default kycService;
