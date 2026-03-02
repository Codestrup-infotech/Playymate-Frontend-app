"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { userService } from "@/services/user";

export default function ActivityIntentPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return <RoleSelection onBack={handleBack} />;
}

/* ---------------- ROLE SELECTION COMPONENT (STEP 1) ---------------- */

function RoleSelection({ onBack }) {
  const router = useRouter();

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH ROLES ---------------- */
  useEffect(() => {
    setRolesLoading(true);

    userService
      .getActivityIntentRoles()
      .then((res) => {
        const rolesArray =
          res?.data?.data?.roles || res?.data?.roles || [];
        setRoles(Array.isArray(rolesArray) ? rolesArray : []);
      })
      .catch(() => setRoles([]))
      .finally(() => setRolesLoading(false));
  }, []);

  /* ---------------- SELECT ROLE AND NAVIGATE TO DETAILS ---------------- */
  const handleSelectRole = async (role) => {
    try {
      setLoading(true);

      // Save activity intent
      await userService.setActivityIntent(role.value, "");

      // Navigate to details page with role data
      router.push(
        `/onboarding/details?roleValue=${encodeURIComponent(
          role.value
        )}&roleLabel=${encodeURIComponent(role.label)}`
      );
    } catch (err) {
      alert(
        err?.response?.data?.message || "Failed to save activity."
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
            What are you doing right now?
          </h1>
        </div>

        {/* ---------------- STEP 1: ROLE SELECTION ---------------- */}
        {rolesLoading ? (
          <p>Loading options...</p>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => handleSelectRole(role)}
                disabled={loading}
                className="w-full px-4 py-4 rounded-xl border border-gray-700 hover:border-pink-500 transition disabled:opacity-50"
              >
                {role.icon} {role.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
