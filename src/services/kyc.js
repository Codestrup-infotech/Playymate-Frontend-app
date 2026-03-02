import api from "./api";
import axios from "axios";

export const kycService = {
  /* =========================================================
      KYC STATUS & SCREENS
   ========================================================== */

  /**
   * Get KYC Status
   * Returns current KYC verification status
   * Endpoint: GET /api/v1/kyc/status
   */
  getKycStatus: () => api.get("/kyc/status"),

  /**
   * Get KYC Screen Visibility
   * Returns which KYC screens are enabled
   * Endpoint: GET /api/v1/kyc/screens
   */
  getKycScreens: () => api.get("/kyc/screens"),

  /* =========================================================
      MEDIA PRESIGN (Face Liveness Upload)
   ========================================================== */

  /**
   * Get presigned URL for uploading selfie to storage
   * Endpoint: POST /api/v1/users/media/presign
   * @param {string} fileName
   * @param {number} sizeBytes
   * @param {string} mimeType
   * @param {string} purpose
   */
  getPresignedUrl: (
    fileName,
    sizeBytes,
    mimeType = "image/jpeg",
    purpose = "kyc"
  ) =>
    api.post("/users/media/presign", {
      file_name: fileName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      purpose: purpose,
    }),

  /**
   * Upload file directly to S3/Wasabi using presigned URL
   * @param {string} presignedUrl
   * @param {Blob} file
   * @param {string} contentType
   */
  uploadToPresigned: (presignedUrl, file, contentType = "image/jpeg") =>
    axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": contentType,
      },
    }),

  /* =========================================================
      DIGILOCKER KYC
   ========================================================== */

  /**
   * Optional: Check if user has DigiLocker account
   * Endpoint: POST /api/v1/kyc/digilocker/account-check
   * @param {string} verificationId
   * @param {string} mobileNumber
   */
  digilockerAccountCheck: (verificationId, mobileNumber) =>
    api.post("/kyc/digilocker/account-check", {
      verification_id: verificationId,
      mobile_number: mobileNumber,
    }),

  /**
   * Create DigiLocker Consent URL
   * Endpoint: POST /api/v1/kyc/digilocker/create-url
   * @param {string} verificationId
   * @param {Array} documentRequested
   * @param {string} redirectUrl
   * @param {string} userFlow
   */
  digilockerCreateUrl: (
    verificationId,
    documentRequested,
    redirectUrl,
    userFlow = "verification"
  ) =>
    api.post("/kyc/digilocker/create-url", {
      verification_id: verificationId,
      document_requested: documentRequested,
      redirect_url: redirectUrl,
      user_flow: userFlow,
    }),

  /**
   * Check DigiLocker verification status
   * Returns: verified | pending | failed
   * Endpoint: GET /api/v1/kyc/digilocker/status
   * @param {string} verificationId
   */
  digilockerStatus: (verificationId) =>
    api.get(
      `/kyc/digilocker/status?verification_id=${verificationId}`
    ),

  /**
   * Fetch Aadhaar document after verification
   * Endpoint: GET /api/v1/kyc/digilocker/document/AADHAAR
   * @param {string} type (must be "AADHAAR")
   * @param {string} verificationId
   */
  digilockerDocument: (type, verificationId) =>
    api.get(
      `/kyc/digilocker/document/${type}?verification_id=${verificationId}`
    ),

  /* =========================================================
      FACE LIVENESS
   ========================================================== */

  /**
   * Submit selfie for liveness verification
   * Endpoint: POST /api/v1/kyc/face-liveness
   * @param {string} imageUrl
   */
  faceLiveness: (imageUrl) =>
    api.post("/kyc/face-liveness", {
      image_url: imageUrl,
    }),

  /* =========================================================
      KYC COMPLETE
   ========================================================== */

  /**
   * Finalize KYC after Aadhaar + Liveness
   * Endpoint: POST /api/v1/kyc/complete
   */
  completeKYC: () => api.post("/kyc/complete"),

  /**
   * Skip Aadhaar (Soft KYC - Grace Period)
   * Endpoint: POST /api/v1/kyc/skip-aadhaar
   */
  skipAadhaar: () => api.post("/kyc/skip-aadhaar"),
};

export default kycService;
