"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { userService } from "@/services/user";

export default function DetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleValue = searchParams.get("roleValue");
  const roleLabel = searchParams.get("roleLabel");

  const handleBack = () => {
    router.back();
  };

  return (
    <DetailsForm
      roleValue={roleValue}
      roleLabel={roleLabel}
      onBack={handleBack}
    />
  );
}

/* ---------------- DYNAMIC FORM COMPONENT (STEP 2) ---------------- */

function DetailsForm({ roleValue, roleLabel, onBack }) {
  const router = useRouter();

  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH PROFILE ROLE CONFIG ---------------- */
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);

        const configRes = await userService.getProfileRoleConfig();
        const configs = configRes?.data?.data?.configs || [];

        const roleConfig = configs.find((c) => c.role_type === roleValue);

        if (roleConfig?.fields) {
          setFormFields(roleConfig.fields);
        }
      } catch (err) {
        console.error("Failed to load profile config:", err);
      } finally {
        setLoading(false);
      }
    };

    if (roleValue) {
      fetchConfig();
    }
  }, [roleValue]);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ---------------- SUBMIT FORM ---------------- */
  const handleSubmit = async () => {
    const missingFields = formFields
      .filter((field) => field.required && !formData[field.key])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    if (!formData.current_city) {
      alert("Please enter your current city");
      return;
    }

    try {
      setLoading(true);

      await userService.setProfileDetails(roleValue, formData);

      router.push("/onboarding/kyc");
    } catch (err) {
      alert(
        err?.response?.data?.message || "Failed to save profile details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black h-screen">
      <div className="w-[360px] text-white mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-6 mb-6">
          <button
            onClick={onBack}
            className="text-3xl text-gray-400 font-bold"
          >
            ←
          </button>

          <h1 className="text-2xl font-semibold">
            Tell us more about your {roleLabel}
          </h1>
        </div>

        {/* ---------------- STEP 2: DYNAMIC FORM ---------------- */}
        {loading && !formFields.length ? (
          <p>Loading...</p>
        ) : (
          <div className="mt-6 space-y-4">
            {formFields.map((field) => (
              <div key={field.key}>
                <label className="text-sm text-gray-400">
                  {field.label}
                </label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700"
                  onChange={(e) =>
                    handleChange(field.key, e.target.value)
                  }
                />
              </div>
            ))}

            {/* Current City (mandatory) */}
            <div>
              <label className="text-sm text-gray-400">Current City</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700"
                onChange={(e) =>
                  handleChange("current_city", e.target.value)
                }
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
