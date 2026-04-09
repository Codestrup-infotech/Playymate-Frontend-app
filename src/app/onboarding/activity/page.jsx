"use client";

export const dynamic = "force-dynamic"; // ← ADD THIS LINE

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { userService } from "@/services/user";
import { kycService } from "@/services/kyc";
import { getRouteFromStep } from "@/lib/api/navigation";


function ActivityIntentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleValue = searchParams.get("roleValue");
  const roleLabel = searchParams.get("roleLabel");
  const [activityScreenConfig, setActivityScreenConfig] = useState(null);
  const [basicScreenConfig, setBasicScreenConfig] = useState(null);
  const [additionalScreenConfig, setAdditionalScreenConfig] = useState(null);


useEffect(() => {
  const fetchScreenConfigs = async () => {
    try {
      const [activityRes, basicRes, additionalRes] = await Promise.all([
        userService.getScreenConfig("activity_intent"),
        userService.getScreenConfig("profile_details_basic"),
        userService.getScreenConfig("profile_details_additional"),
      ]);

      const activityScreen =
        activityRes?.data?.data?.screen ||
        activityRes?.data?.screen ||
        activityRes?.data;

      const basicScreen =
        basicRes?.data?.data?.screen ||
        basicRes?.data?.screen ||
        basicRes?.data;

      const additionalScreen =
        additionalRes?.data?.data?.screen ||
        additionalRes?.data?.screen ||
        additionalRes?.data;

      setActivityScreenConfig(activityScreen || null);
      setBasicScreenConfig(basicScreen || null);
      setAdditionalScreenConfig(additionalScreen || null);

    } catch (err) {
      console.error("Failed to fetch screen configs:", err);
    }
  };

  fetchScreenConfigs();
}, []);

  const handleBack = () => {
    router.back();
  };

  if (roleValue && roleLabel) {
    return (
      <DetailsForm
        roleValue={roleValue}
        roleLabel={roleLabel}
        onBack={handleBack}
        basicScreenConfig={basicScreenConfig}
        additionalScreenConfig={additionalScreenConfig}
      />
    );
  }

  return (
    <RoleSelection
      onBack={handleBack}
      activityScreenConfig={activityScreenConfig}
    />
  );
}

export default function ActivityIntentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <ActivityIntentPageContent />
    </Suspense>
  );
}

function RoleSelection({ onBack, activityScreenConfig }) {
  const router = useRouter();

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const handleSelectRole = async (role) => {
    try {
      setLoading(true);

      await userService.setActivityIntent(role.value, "");

      router.push(
        `/onboarding/activity?roleValue=${encodeURIComponent(
          role.value
        )}&roleLabel=${encodeURIComponent(role.label)}`
      );
    } catch (err) {
      console.error("Failed to save activity:", err);
      alert(
        err?.response?.data?.message || err?.message || "Failed to save activity."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black">
      <div className="lg:w-[500px]  flex   flex-col justify-center items-center text-center h-screen text-white mx-auto">
        <div className="flex   mb-6 ">
<div className=" space-y-3 "> 
<h1 className="text-2xl font-semibold font-Playfair Display">
  {(activityScreenConfig?.title || "What are you doing right now?")
    .split(" ")
    .map((word, index) =>
      index === 3 ? (
        <span
          key={index}
          className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
        >
          {" " + word}
        </span>
      ) : (
        " " + word
      )
    )}
</h1>
<p className="text-sm font-Poppins">
  {activityScreenConfig?.subtitle || "This helps us tailor your Playymate experience."}
</p>          
          </div>
        </div>

        {rolesLoading ? (
          <p className="text-gray-400">Loading options...</p>
        ) : roles.length === 0 ? (
          <p className="text-gray-400">No roles available</p>
        ) : (
          <div className="space-y-3 font-Poppins ">
            {roles.map((role) => (
  <button
    key={role.value}
    onClick={() => handleSelectRole(role)}
    disabled={loading}
    className="w-80 px-4  py-2 rounded-xl border border-blue-600  hover:bg-gradient-to-r hover:from-[#1A43CA] hover:via-[#1A43CA] to-[#1FCCF2] flex items-center gap-3 disabled:opacity-50"
  >
    {role.icon && <span className="text-2xl">{role.icon}</span>}

    <div className="text-left">
      <div className="font-medium text-[#A6A6A6]">{role.label}</div>
      {role.description && (
        <div className="text-sm text-[#A6A6A6]">{role.description}</div>
      )}
    </div>

<div className="ml-auto flex items-center justify-center w-6 h-6 bg-white rounded-full">
  <div className="flex items-center justify-center w-4 h-4 p-[2px] rounded-full bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] hover:from-green-500 hover:to-yellow-500 transition">
    <div className="w-full h-full bg-white rounded-full"></div>
  </div>
</div>
  </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailsForm({
  roleValue,
  roleLabel,
  onBack,
  basicScreenConfig,
  additionalScreenConfig
}) {
  const router = useRouter();

  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);

        const configRes = await userService.getProfileRoleConfig(roleValue);
        
        let fields = [];
        
        const responseData = configRes?.data?.data;
        const config = responseData?.config || responseData;
        
        if (config?.fields) {
          const fieldMap = new Map();
          
          if (config.common_fields) {
            config.common_fields.forEach(field => {
              fieldMap.set(field.key, field);
            });
          }
          
          if (config.fields) {
            config.fields.forEach(field => {
              fieldMap.set(field.key, field);
            });
          }
          
          fields = Array.from(fieldMap.values()).map(field => ({
            key: field.key,
            name: field.name,
            field_type: field.type,
            icon: field.icon,
            required: field.required,
            placeholder: field.placeholder || `Enter ${field.name}`,
            options: field.options,
          }));
        }

        setFormFields(fields);
      } catch (err) {
        console.error("Failed to load profile config:", err);
        setFormFields([]);
      } finally {
        setLoading(false);
      }
    };

    if (roleValue) {
      fetchConfig();
    }
  }, [roleValue]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    const missingFields = formFields
      .filter((field) => field.required && !formData[field.key])
      .map((field) => field.name || field.key);

    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setLoading(true);

      const response = await userService.setProfileDetails(roleValue, formData);
      
      const nextStep = response?.data?.next_required_step || 'PROFILE_DETAILS';
      
try {
  const screensRes = await kycService.getKycScreens();
  const { screens } = screensRes.data?.data || {};

  const aadhaarEnabled = screens?.aadhaar?.enabled ?? true;
  const livenessEnabled = screens?.liveness?.enabled ?? true;

  if (!aadhaarEnabled && !livenessEnabled) {
    router.push("/onboarding/physical");
    return;
  }

  if (aadhaarEnabled && livenessEnabled) {
    router.push("/onboarding/kyc");
    return;
  }

  if (aadhaarEnabled && !livenessEnabled) {
    router.push("/onboarding/kyc");
    return;
  }

  if (!aadhaarEnabled && livenessEnabled) {
    router.push("/onboarding/kyc/liveness");
    return;
  }
} catch (screenErr) {
  console.error("Failed to fetch KYC screens:", screenErr);
}

const route = getRouteFromStep(nextStep);
router.push(route);
    } catch (err) {
      console.error("Failed to save profile details:", err);
      alert(
        err?.response?.data?.message || err?.message || "Failed to save profile details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black py-8 ">
      <div className="relative mb-6  text-center">
  <button
    onClick={onBack}
    className="absolute lg:left-96  text-3xl text-gray-400 font-bold"
  >
    ←
  </button>

  <h1 className="text-2xl font-Playfair Display font-bold text-white">
  {(basicScreenConfig?.title || "Complete your profile")
    .split(" ")
    .map((word, index) =>
      index === 2 ? (
        <span
          key={index}
          className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
        >
          {" " + word}
        </span>
      ) : (
        " " + word
      )
    )}
</h1>

  <p className="mt-2 text-gray-400 text-sm font-Poppins">
    {basicScreenConfig?.subtitle || "Add a few more details so people can know you better"}
  </p>
</div>

      <div className="lg:w-[390px] px-3  h-screen text-white mx-auto font-Poppins ">
        {loading && !formFields.length ? (
          <p className="text-gray-400">Loading...</p>
        ) : formFields.length === 0 ? (
          <div className="text-gray-400">
            <p>No form fields available for this role.</p>
            <p className="text-sm mt-2">Role: {roleValue}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {formFields.map((field) => (
              <div key={field.key}>
                <label className="text-sm text-gray-400">
                  {field.name || field.key}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>
                {field.field_type === 'select' ? (
                  <div className="relative">
                    {field.icon && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                        {field.icon}
                      </span>
                    )}
                    <select
                      className={`w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700 text-white ${field.icon ? 'pl-10' : ''}`}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      value={formData[field.key] || ''}
                    >
                      <option value="">{field.placeholder || `Select ${field.name || field.key}`}</option>
                      {(field.options || []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : field.field_type === 'boolean' ? (
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => handleChange(field.key, true)}
                      className={`px-4 py-2 rounded-lg border ${
                        formData[field.key] === true
                          ? 'bg-pink-500 border-pink-500'
                          : 'border-gray-700'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange(field.key, false)}
                      className={`px-4 py-2 rounded-lg border ${
                        formData[field.key] === false
                          ? 'bg-pink-500 border-pink-500'
                          : 'border-gray-700'
                      }`}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    {field.icon && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
                        {field.icon}
                      </span>
                    )}
                    <input
                      type={field.field_type === 'number' ? 'number' : 'text'}
                      placeholder={
                        basicScreenConfig?.input_placeholders?.[field.key] ||
                        additionalScreenConfig?.input_placeholders?.[field.key] ||
                        field.placeholder ||
                        `Enter ${field.name}`
                      }
                      className={`w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700 text-white ${field.icon ? 'pl-10' : ''}`}
                      onChange={(e) =>
                        handleChange(field.key, e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            ))}

<button
  onClick={handleSubmit}
  disabled={loading}
  className="w-full mt-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50"
>
  {loading
    ? "Saving..."
    : basicScreenConfig?.button_text?.primary || "Save & Continue"}
</button>
          </div>
        )}
      </div>
    </div>
  );
}

