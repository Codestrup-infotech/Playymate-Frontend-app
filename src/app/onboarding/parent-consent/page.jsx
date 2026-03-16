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

        if (state === "PARENT_CONSENT_APPROVED") {
          router.push("/onboarding/location");
          return;
        }

        if (state === "LOCATION_CAPTURED" || state === "PROFILE_PHOTO_CAPTURED") {
          router.push("/onboarding/photo");
          return;
        }

        if (state !== "PARENT_CONSENT_PENDING") {
          if (state === "DOB_CAPTURED") {
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

        try {
          const statusResponse = await userService.getParentConsentStatus();
          const statusData = statusResponse?.data?.data;

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

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Please upload a valid image (JPEG, PNG) or PDF file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10MB");
      return;
    }

    setIdProofFile(file);
    clearError();

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

      const presignedResponse = await userService.getPresignedUrl(file.name, file);
      const { upload_url, file_url } = presignedResponse.data.data;

      if (!upload_url) throw new Error("Failed to get upload URL from server");

      setUploadProgress(40);
      await userService.uploadToPresigned(upload_url, file, file.type);
      setUploadProgress(100);

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
    if (!parentFullName.trim()) { setError("Please enter parent's full name"); return; }
    if (!parentPhone.trim()) { setError("Please enter parent's phone number"); return; }
    if (!relationship) { setError("Please select your relationship to the minor"); return; }
    if (!idProofType) { setError("Please select ID proof document type"); return; }
    if (!idProofFile) { setError("Please upload ID proof document"); return; }
    if (!consentChecked) { setError("Please accept the consent checkbox"); return; }

    try {
      setLoading(true);
      clearError();

      const fileUrl = await uploadFile(idProofFile);

      const consentData = {
        parent_full_name: parentFullName.trim(),
        parent_phone: parentPhone.trim(),
        relationship,
        id_proof_document_type: idProofType,
        id_proof_file_url: fileUrl,
        id_proof_file_type: idProofFile.type,
        id_proof_file_size: idProofFile.size,
        id_proof_document_name: idProofFile.name,
        consent_checkbox: consentChecked,
      };

      const response = await userService.submitParentConsentWithID(consentData);
      const responseData = response?.data?.data;

      if (responseData) {
        setRequestId(responseData.request_id);
        setConsentStatus(responseData.status);
      }

      const nextStep = response?.data?.next_required_step;
      if (nextStep && typeof nextStep === "string") {
        const route = getRouteFromStep(nextStep);
        router.push(route);
      } else {
        router.push("/onboarding/location");
      }
    } catch (err) {
      console.error("[ParentConsent] Error submitting parent consent:", err);

      const errorCode = err.response?.data?.error_code;
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message;

      if (status === 401) { window.location.href = "/login"; return; }

      if (status === 404) {
        setError("Parent consent feature is not available yet. Please try again later.");
        return;
      }

      if (status === 400) {
        const nextStep = err.response?.data?.next_required_step;
        if (nextStep && typeof nextStep === "string") { router.push(getRouteFromStep(nextStep)); return; }

        if (errorCode === "INVALID_ONBOARDING_STATE") {
          window.location.href = `${window.location.origin}/onboarding/location`;
          return;
        }

        if (errorMsg?.includes("state")) {
          try {
            const statusResponse = await userService.getOnboardingStatus();
            const currentState = statusResponse?.data?.data?.onboarding_state;
            const nextRequiredStep = statusResponse?.data?.next_required_step;

            if (currentState === "PARENT_CONSENT_APPROVED") { router.push("/onboarding/location"); return; }
            if (nextRequiredStep && typeof nextRequiredStep === "string") { router.push(getRouteFromStep(nextRequiredStep)); return; }
            if (currentState === "LOCATION_CAPTURED") { router.push("/onboarding/photo"); return; }
          } catch (statusErr) {
            console.error("[ParentConsent] Error fetching status:", statusErr);
          }
        }

        setError(errorMsg || "Invalid state. Please try again or go back to previous step.");
        return;
      }

      if (errorMsg) { setError(errorMsg); return; }
      setError("Failed to submit parent consent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading screen ────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // ─── Status screen ─────────────────────────────────────────────────────────
  if (consentStatus && consentStatus !== "PENDING" && requestId) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col px-5 py-8">
        <button
          onClick={() => router.push("/onboarding/dob")}
          className="self-start mb-8 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-sm mx-auto w-full">
          {consentStatus === "PENDING_REVIEW" && (
            <>
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <Loader2 className="w-9 h-9 text-yellow-400 animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Consent Submitted</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your parent consent request is under review. This usually takes 24–48 hours.
                </p>
              </div>
            </>
          )}

          {consentStatus === "APPROVED" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-400" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Consent Approved</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Parent consent has been verified. You can now continue with onboarding.
                </p>
              </div>
              <button
                onClick={() => router.push("/onboarding/location")}
                className="w-full py-4 rounded-full font-semibold text-white"
                style={{ background: "linear-gradient(90deg, #f43f8a, #fb923c)" }}
              >
                Continue
              </button>
            </>
          )}

          {consentStatus === "REJECTED" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-9 h-9 text-red-400" />
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Consent Rejected</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your parent consent request was rejected. Please resubmit with valid documents.
                </p>
              </div>
              <button
                onClick={() => { setConsentStatus(null); setRequestId(null); }}
                className="w-full py-4 rounded-full font-semibold text-white"
                style={{ background: "linear-gradient(90deg, #f43f8a, #fb923c)" }}
              >
                Resubmit
              </button>
            </>
          )}

          {requestId && (
            <div className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs text-gray-500 mb-1">Request ID</p>
              <p className="font-mono text-xs text-gray-300 break-all">{requestId}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-2">
        <button
          onClick={() => router.push("/onboarding/dob")}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-semibold tracking-wide">Parent Consent</span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        <div className="max-w-md mx-auto">

          {/* Hero heading */}
          <div className="text-center pt-6 pb-7">
            <h1 className="text-[28px] font-extrabold leading-tight">
              Parent{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #f43f8a, #fb923c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Consent
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              Provide guardian details &amp; ID proof for verification
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">

            {/* Parent Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">
                Parent / Guardian Full Name <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-pink-400" />
                <input
                  type="text"
                  value={parentFullName}
                  onChange={(e) => setParentFullName(e.target.value)}
                  placeholder="Enter parent's full name"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#1a1a1a] border border-[#2e2e2e] focus:border-pink-500 focus:outline-none text-sm text-white placeholder-gray-600 transition-colors"
                />
              </div>
            </div>

            {/* Parent Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">
                Parent / Guardian Phone <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-pink-400" />
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#1a1a1a] border border-[#2e2e2e] focus:border-pink-500 focus:outline-none text-sm text-white placeholder-gray-600 transition-colors"
                />
              </div>
            </div>

            {/* Relationship */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">
                Relationship to Minor <span className="text-pink-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRelationship(option.value)}
                    className="py-3 px-4 rounded-2xl border text-sm font-medium transition-all"
                    style={
                      relationship === option.value
                        ? {
                            background: "linear-gradient(135deg, rgba(244,63,138,0.18), rgba(251,146,60,0.18))",
                            borderColor: "#f43f8a",
                            color: "#fff",
                          }
                        : {
                            background: "#1a1a1a",
                            borderColor: "#2e2e2e",
                            color: "#9ca3af",
                          }
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ID Proof Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">
                ID Proof Document Type <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                {/* custom arrow */}
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▾</span>
                <select
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value)}
                  className="w-full appearance-none py-3.5 px-4 rounded-2xl bg-[#1a1a1a] border border-[#2e2e2e] focus:border-pink-500 focus:outline-none text-sm text-gray-300 transition-colors"
                >
                  <option value="">Select document type</option>
                  {ID_PROOF_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">
                Upload ID Proof <span className="text-pink-500">*</span>
              </label>

              {!idProofFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2e2e2e] hover:border-pink-500/60 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-[#1a1a1a]"
                >
                  <div
                    className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
                    style={{ background: "linear-gradient(135deg, rgba(244,63,138,0.15), rgba(251,146,60,0.15))" }}
                  >
                    <Upload className="w-5 h-5 text-pink-400" />
                  </div>
                  <p className="text-sm text-gray-300 font-medium">Tap to upload document</p>
                  <p className="text-xs text-gray-600 mt-1">JPEG, PNG or PDF · max 10 MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-4">
                  {idProofPreview ? (
                    <img
                      src={idProofPreview}
                      alt="ID Proof"
                      className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#252525] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-pink-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">{idProofFile.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {(idProofFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
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

            {/* Consent checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                  style={
                    consentChecked
                      ? { background: "linear-gradient(135deg, #f43f8a, #fb923c)", borderColor: "transparent" }
                      : { background: "transparent", borderColor: "#3e3e3e" }
                  }
                >
                  {consentChecked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 leading-relaxed">
                I confirm that I am the parent or legal guardian of the minor and I consent to their
                participation on Playmate. I have read and agree to the{" "}
                <span className="text-pink-400">Terms &amp; Privacy Policy</span>.
              </span>
            </label>
          </div>

          {/* CTA */}
          <div className="mt-8 space-y-4">
            <button
              disabled={!consentChecked || loading || isUploading}
              onClick={handleSubmit}
              className="w-full py-4 rounded-full font-semibold text-white text-base flex items-center justify-center transition-opacity disabled:opacity-40"
              style={{ background: "linear-gradient(90deg, #f43f8a, #fb923c)" }}
            >
              {loading || isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {isUploading ? `Uploading… ${uploadProgress}%` : "Submitting…"}
                </>
              ) : (
                "Submit Consent"
              )}
            </button>

            <button
              onClick={() => router.push("/onboarding/dob")}
              className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
            >
              Go back
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
