"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const REPORT_OPTIONS = [
  { label: "I don't like this", value: "other" },
  { label: "Harassment or bullying", value: "harassment" },
  { label: "Self-harm related content", value: "violence" },
  { label: "Violence or harmful behavior", value: "violence" },
  { label: "Restricted or illegal items", value: "other" },
  { label: "Adult or inappropriate content", value: "nudity" },
  { label: "Spam or misleading", value: "spam" },
  { label: "False or incorrect info", value: "misinformation" },
];

export default function Report({
  isOpen,
  onClose,
  targetId,
  targetType = "post",
}) {
  const [step, setStep] = useState("options"); // options | success
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const popupRef = useRef(null);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleReport = async (reason) => {
    try {
      setLoading(true);

      // Get auth token from sessionStorage
      const token = sessionStorage.getItem("accessToken");

      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason,
          description: "Reported via Playymate",
        }),
      });

      const data = await response.json();
      console.log("Report submitted successfully:", data);
      console.log("Report details:", { targetType, targetId, reason });

      setStep("success");
    } catch (err) {
      console.error("Report error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40" onClick={handleOverlayClick}>
      <div ref={popupRef} className="w-full max-w-md  h-fit rounded-2xl  bg-white rounded-t-2xl p-4 animate-slideUp">
        {/* HEADER */}
        {step === "options" && (
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Report</h2>
            <button onClick={onClose} className="text-xl">
              ×
            </button>
          </div>
        )}

        {/* STEP 1: OPTIONS */}
        {step === "options" && (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Why are you reporting this?
            </p>

            <div className="space-y-2">
              {REPORT_OPTIONS.map((item, index) => (
                <button
                  key={index}
                  disabled={loading}
                  onClick={() => handleReport(item.value)}
                  className="w-full text-left px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SUCCESS */}
        {step === "success" && (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold mb-4">Thank You</h3>
            <p className="text-sm text-gray-600 mb-4">Your report has been submitted.</p>

            <button
              onClick={() =>
                router.push("/home/settings/withdraw-report")
              }
              className="w-60 bg-gradient-to-r from-[#F03FEF] to-[#FD7C2F]  text-white py-3 rounded-lg mb-2"
            >
              View My Reports
            </button>
            
            <button
              onClick={() => {
                onClose();
                setStep("options");
              }}
              className="w-full text-gray-600 py-2"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}