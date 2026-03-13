"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, Upload, X, CheckCircle, FileText, Phone, User } from "lucide-react";
import { userService } from "@/services/user";
import { getRouteFromStep } from "@/lib/api/navigation";

// Relationship options
const RELATIONSHIP_OPTIONS = [
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "GUARDIAN", label: "Legal Guardian" },
  { value: "OTHER", label: "Other" },
];

// ID Proof document types
const ID_PROOF_TYPES = [
  { value: "AADHAR_CARD", label: "Aadhaar Card" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "PASSPORT", label: "Passport" },
  { value: "VOTER_ID", label: "Voter ID" },
  { value: "OTHER", label: "Other ID" },
];

// Allowed file types
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function OnboardingParentConsentPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Form state
  const [parentFullName, setParentFullName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [idProofType, setIdProofType] = useState("");
  const [idProofFile, setIdProofFile] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Status state
  const [consentStatus, setConsentStatus] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const clearError = () => setError(null);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await userService.getOnboardingStatus();
        const state = response?.data?.data?.onboarding_state;
        const nextStep = response?.data?.next_required_step;

        console.log("[ParentConsent] Onboarding Status Check:", {
          onboardingState: state,
          nextRequiredStep: nextStep,
          fullResponse: response?.data
        });

        // If already approved, redirect to location
        if (state === "PARENT_CONSENT_APPROVED") {
          router.push("/onboarding/location");
          return;
        }

        // If location already captured, go to profile photo
        if (state === "LOCATION_CAPTURED" || state === "PROFILE_PHOTO_CAPTURED") {
          router.push("/onboarding/photo");
          return;
        }

        // If not in pending state, handle accordingly
        if (state !== "PARENT_CONSENT_PENDING") {
          if (state === "DOB_CAPTURED") {
            console.log("[ParentConsent] State is DOB_CAPTURED - staying on parent consent page");
            setInitialLoading(false);
            return;
          }

          const nextRequiredStep =
            nextStep && typeof nextStep === "string"
              ? nextStep
              : response?.data?.data?.next_required_step;

          if (nextRequiredStep && typeof nextRequiredStep === "string") {
            const route = getRouteFromStep(nextRequiredStep);
            router.push(route);
          } else {
            router.push("/onboarding/gender");
          }

          return;
        }

        // Check existing consent status
        try {
          const statusResponse = await userService.getParentConsentStatus();
          const statusData = statusResponse?.data?.data;
          
          console.log("[ParentConsent] Parent Consent Status Response:", statusData);
          
          if (statusData) {
            setConsentStatus(statusData.parent_consent_status);
            if (statusData.latest_request?.request_id) {
              setRequestId(statusData.latest_request.request_id);
            }
          }
        } catch (statusErr) {
          console.log("[ParentConsent] Could not fetch consent status:", statusErr);
        }
      } catch (err) {
        console.error("[ParentConsent] Failed to check onboarding status:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Please upload a valid image (JPEG, PNG) or PDF file");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10MB");
      return;
    }

    setIdProofFile(file);
    clearError();

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setIdProofPreview(null);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setIdProofFile(null);
    setIdProofPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload file to get URL
  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Get presigned URL
      const presignedResponse = await userService.getPresignedUrl(file.name, file);
      console.log('[ParentConsent] Presigned response:', presignedResponse.data);
      
      const { upload_url, file_url } = presignedResponse.data.data;
      
      if (!upload_url) {
        throw new Error('Failed to get upload URL from server');
      }

      setUploadProgress(40);

      // Upload file to presigned URL
      console.log('[ParentConsent] Uploading file to presigned URL...');
      await userService.uploadToPresigned(upload_url, file, file.type);

      setUploadProgress(100);
      console.log('[ParentConsent] File uploaded successfully, URL:', file_url);

      return file_url;
    } catch (err) {
      console.error("[ParentConsent] File upload error:", err);
      throw new Error("Failed to upload ID proof document");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!parentFullName.trim()) {
      setError("Please enter parent's full name");
      return;
    }

    if (!parentPhone.trim()) {
      setError("Please enter parent's phone number");
      return;
    }

    if (!relationship) {
      setError("Please select your relationship to the minor");
      return;
    }

    if (!idProofType) {
      setError("Please select ID proof document type");
      return;
    }

    if (!idProofFile) {
      setError("Please upload ID proof document");
      return;
    }

    if (!consentChecked) {
      setError("Please accept the consent checkbox");
      return;
    }

    try {
      setLoading(true);
      clearError();

      // Upload ID proof file
      const fileUrl = await uploadFile(idProofFile);

      // Prepare consent data
      const consentData = {
        parent_full_name: parentFullName.trim(),
        parent_phone: parentPhone.trim(),
        relationship: relationship,
        id_proof_document_type: idProofType,
        id_proof_file_url: fileUrl,
        id_proof_file_type: idProofFile.type,
        id_proof_file_size: idProofFile.size,
        id_proof_document_name: idProofFile.name,
        consent_checkbox: consentChecked,
      };

      console.log("[ParentConsent] Submitting parent consent with ID proof:", consentData);

      // Submit consent with ID proof
      const response = await userService.submitParentConsentWithID(consentData);

      console.log('[ParentConsent] Parent consent API Response:', response);
      console.log('[ParentConsent] Parent consent Response Data:', response?.data);
      console.log('[ParentConsent] Parent consent Response Data Data:', response?.data?.data);

      const responseData = response?.data?.data;

      if (responseData) {
        setRequestId(responseData.request_id);
        setConsentStatus(responseData.status);
      }

      // Navigate based on next_required_step from API
      const nextStep = response?.data?.next_required_step;
      if (nextStep && typeof nextStep === "string") {
        const route = getRouteFromStep(nextStep);
        router.push(route);
      } else {
        // Default to location after consent submission
        router.push("/onboarding/location");
      }
    } catch (err) {
      console.error("[ParentConsent] Error submitting parent consent:", err);
      console.error("[ParentConsent] Error response:", err.response?.data);

      const errorCode = err.response?.data?.error_code;
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message;

      // Handle authentication errors
      if (status === 401) {
        window.location.href = "/login";
        return;
      }

      // Handle 404 - endpoint not implemented on backend
      if (status === 404) {
        console.log("[ParentConsent] Parent consent endpoint not implemented (404)");
        setError("Parent consent feature is not available yet. Please try again later.");
        return;
      }

      // Handle state mismatch errors
      if (status === 400) {
        const nextStep = err.response?.data?.next_required_step;

        if (nextStep && typeof nextStep === "string") {
          const route = getRouteFromStep(nextStep);
          router.push(route);
          return;
        }

        if (errorCode === "INVALID_ONBOARDING_STATE") {
          console.log("[ParentConsent] Invalid onboarding state, redirecting to location");
          window.location.href = `${window.location.origin}/onboarding/location`;
          return;
        }

        if (errorMsg?.includes("state")) {
          try {
            const statusResponse = await userService.getOnboardingStatus();
            const currentState = statusResponse?.data?.data?.onboarding_state;
            const nextRequiredStep = statusResponse?.data?.next_required_step;

            console.log("[ParentConsent] State error - checking current state:", currentState);

            if (currentState === "PARENT_CONSENT_APPROVED") {
              router.push("/onboarding/location");
              return;
            }

            if (nextRequiredStep && typeof nextRequiredStep === "string") {
              const route = getRouteFromStep(nextRequiredStep);
              router.push(route);
              return;
            }

            if (currentState === "LOCATION_CAPTURED") {
              router.push("/onboarding/photo");
              return;
            }
          } catch (statusErr) {
            console.error("[ParentConsent] Error fetching status:", statusErr);
          }
        }

        setError(errorMsg || "Invalid state. Please try again or go back to previous step.");
        return;
      }

      if (errorMsg) {
        setError(errorMsg);
        return;
      }

      setError("Failed to submit parent consent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking status
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        </div>
      </div>
    );
  }

  // Show status if already submitted
  if (consentStatus && consentStatus !== "PENDING" && requestId) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-8">
        <button
          onClick={() => router.push("/onboarding/dob")}
          className="self-start mb-6 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            {consentStatus === "PENDING_REVIEW" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold">Consent Submitted</h1>
                <p className="text-gray-400">
                  Your parent consent request is under review. This usually takes 24-48 hours.
                </p>
              </>
            )}

            {consentStatus === "APPROVED" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold">Consent Approved</h1>
                <p className="text-gray-400">
                  Parent consent has been verified. You can now continue with onboarding.
                </p>
                <button
                  onClick={() => router.push("/onboarding/location")}
                  className="w-full py-4 mt-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 font-semibold"
                >
                  Continue
                </button>
              </>
            )}

            {consentStatus === "REJECTED" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold">Consent Rejected</h1>
                <p className="text-gray-400">
                  Your parent consent request was rejected. Please resubmit with valid documents.
                </p>
                <button
                  onClick={() => {
                    setConsentStatus(null);
                    setRequestId(null);
                  }}
                  className="w-full py-4 mt-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 font-semibold"
                >
                  Resubmit
                </button>
              </>
            )}
          </div>

          {requestId && (
            <div className="p-4 bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-400">Request ID:</p>
              <p className="font-mono text-xs">{requestId}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <button
          onClick={() => router.push("/onboarding/dob")}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold ml-2">Parent Consent</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 pt-4">
            <h1 className="text-2xl font-bold">
              Parent{" "}
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Consent
              </span>
            </h1>
            <p className="text-gray-400 text-sm">
              Please provide parent/guardian details and ID proof for verification
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm py-2 px-3 bg-red-400/10 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Parent Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Parent/Guardian Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={parentFullName}
                  onChange={(e) => setParentFullName(e.target.value)}
                  placeholder="Enter parent's full name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Parent Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Parent/Guardian Phone <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Relationship to Minor <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRelationship(option.value)}
                    className={`py-3 px-4 rounded-lg border transition-all ${
                      relationship === option.value
                        ? "border-pink-500 bg-pink-500/20 text-white"
                        : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ID Proof Document Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                ID Proof Document Type <span className="text-red-400">*</span>
              </label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full py-3 px-4 bg-gray-900 border border-gray-700 rounded-lg focus:border-pink-500 focus:outline-none text-gray-300"
              >
                <option value="">Select document type</option>
                {ID_PROOF_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ID Proof File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Upload ID Proof <span className="text-red-400">*</span>
              </label>
              
              {!idProofFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-gray-600 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">
                    Click to upload ID proof document
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG or PDF (max 10MB)
                  </p>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {idProofPreview ? (
                      <img
                        src={idProofPreview}
                        alt="ID Proof Preview"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{idProofFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(idProofFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_FILE_TYPES.join(",")}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 accent-pink-500 w-5 h-5"
              />
              <span className="text-gray-400">
                I confirm that I am the parent or legal guardian of the minor and I consent to their participation on Playmate. I have read and agree to the Terms & Privacy Policy.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              disabled={!consentChecked || loading || isUploading}
              onClick={handleSubmit}
              className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40 flex items-center justify-center font-semibold"
            >
              {loading || isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {isUploading ? `Uploading... ${uploadProgress}%` : "Submitting..."}
                </>
              ) : (
                "Submit Consent"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
