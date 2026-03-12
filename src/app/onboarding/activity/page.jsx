"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { userService } from "@/services/user";
import { kycService } from "@/services/kyc";
import { getRouteFromStep } from "@/lib/api/navigation";

export default function ActivityIntentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we have role info from URL (user came from role selection)
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

  // If we have role info, show DetailsForm; otherwise show RoleSelection
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

/* ---------------- ROLE SELECTION COMPONENT (STEP 1) ---------------- */

function RoleSelection({ onBack, activityScreenConfig }) {
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
      <div className="w-[500px]  flex   flex-col justify-center items-center text-center h-screen text-white mx-auto">
        {/* HEADER */}
        <div className="flex   mb-6 ">
          {/* <button
            onClick={onBack}
            className="text-3xl text-gray-400 font-bold"
          >
            ← 
          </button> */}
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

        {/* ---------------- STEP 1: ROLE SELECTION ---------------- */}
        {rolesLoading ? (
          <p className="text-gray-400">Loading options...</p>
        ) : roles.length === 0 ? (
          <p className="text-gray-400">No roles available</p>
        ) : (
          <div className="space-y-3 font-Poppins ">
            {roles.map((role) => (
              // <button
              //   key={role.value}
              //   onClick={() => handleSelectRole(role)}
              //   disabled={loading}
              //   className="w-full px-4 py-2 rounded-xl border border-[#1A43CA] hover:border-white transition disabled:opacity-50 flex items-center gap-3"
              // >
              //   {role.icon && <span className="text-2xl">{role.icon}</span>}
              //   <div className="text-left">
              //     <div className="font-medium">{role.label}</div>
              //     {role.description && (
              //       <div className="text-sm text-gray-400">{role.description}</div>
              //     )}
              //   </div>
              // </button>
            
  <button
    key={role.value}
    onClick={() => handleSelectRole(role)}
    disabled={loading}
    className="w-80 px-4  py-2 rounded-xl border border-blue-600 bg-[#0B0B0F] hover:bg-blue-600 flex items-center gap-3 disabled:opacity-50"
  >
    {role.icon && <span className="text-2xl">{role.icon}</span>}

    <div className="text-left">
      <div className="font-medium text-[#A6A6A6]">{role.label}</div>
      {role.description && (
        <div className="text-sm text-[#A6A6A6]">{role.description}</div>
      )}
    </div>

  {/* Right side circular double ring button */}
<div className="ml-auto flex items-center justify-center w-6 h-6 bg-white rounded-full">
  
  {/* Gradient ring */}
  <div className="flex items-center justify-center w-4 h-4 p-[2px] rounded-full bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] hover:from-green-500 hover:to-yellow-500 transition">
    
    {/* Inner white circle */}
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

/* ---------------- DYNAMIC FORM COMPONENT (STEP 2) ---------------- */

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

  /* ---------------- FETCH PROFILE ROLE CONFIG ---------------- */
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);

        console.log('Fetching profile config for role:', roleValue);
        
        // Call with role parameter to get specific role config
        const configRes = await userService.getProfileRoleConfig(roleValue);
        
        console.log('Full API Response:', configRes);
        
        // The actual API response structure is: data.data.config.fields
        // Also contains: data.data.config.common_fields
        let fields = [];
        
        const responseData = configRes?.data?.data;
        const config = responseData?.config || responseData;
        
        console.log('Config:', config);
        console.log('Config fields:', config?.fields);
        
        if (config?.fields) {
          // Combine fields from config.fields and config.common_fields
          // Use a Map to avoid duplicates (common_fields may overlap with fields)
          const fieldMap = new Map();
          
          // Add common fields first
          if (config.common_fields) {
            config.common_fields.forEach(field => {
              fieldMap.set(field.key, field);
            });
          }
          
          // Add role-specific fields (will override common fields with same key)
          if (config.fields) {
            config.fields.forEach(field => {
              fieldMap.set(field.key, field);
            });
          }
          
          // Convert map to array and map to our format
          fields = Array.from(fieldMap.values()).map(field => ({
            key: field.key,
            name: field.name,
            field_type: field.type, // API uses 'type'
            icon: field.icon, // Include icon from API
            required: field.required,
            placeholder: field.placeholder || `Enter ${field.name}`, // Handle null placeholder
            options: field.options,
          }));
          
          console.log('Mapped fields:', fields);
        } else {
          console.log('No fields found in config');
        }

        setFormFields(fields);
      } catch (err) {
        console.error("Failed to load profile config:", err);
        // Don't show error to user, just continue with empty fields
        setFormFields([]);
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
    // Check required fields
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
      
      // Navigate based on next_required_step from the API response
      const nextStep = response?.data?.next_required_step || 'PROFILE_DETAILS';
      
      // Check KYC screen visibility to determine navigation
    // Check KYC screen visibility to determine navigation
try {
  const screensRes = await kycService.getKycScreens();
  const { screens } = screensRes.data?.data || {};

  const aadhaarEnabled = screens?.aadhaar?.enabled ?? true;
  const livenessEnabled = screens?.liveness?.enabled ?? true;

  if (!aadhaarEnabled && !livenessEnabled) {
    // Both disabled → skip KYC
    router.push("/onboarding/physical");
    return;
  }

  if (aadhaarEnabled && livenessEnabled) {
    // Both enabled
    router.push("/onboarding/kyc");
    return;
  }

  if (aadhaarEnabled && !livenessEnabled) {
    // Only Aadhaar enabled
    router.push("/onboarding/kyc");
    return;
  }

  if (!aadhaarEnabled && livenessEnabled) {
    // Only Liveness enabled
    router.push("/onboarding/kyc/liveness");
    return;
  }
} catch (screenErr) {
  console.error("Failed to fetch KYC screens:", screenErr);
}

// Fallback: use default behavior based on next_required_step
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
  {/* Back Button */}
  <button
    onClick={onBack}
    className="absolute left-96 text-3xl text-gray-400 font-bold"
  >
    ←
  </button>

  {/* Title */}
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

  {/* Subtitle */}
  <p className="mt-2 text-gray-400 text-sm font-Poppins">
    {basicScreenConfig?.subtitle || "Add a few more details so people can know you better"}
  </p>
</div>

      <div className="w-[390px] text-white mx-auto font-Poppins ">
        {/* HEADER */}
        

        {/* ---------------- STEP 2: DYNAMIC FORM ---------------- */}
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
{/* <button
  className="text-gray-400 mt-3"
  onClick={() => router.push("/")}
>
  {basicScreenConfig?.button_text?.skip || "Skip for now"}
</button> */}
          </div>
        )}
      </div>
    </div>
  );
}



// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { useState, useEffect } from "react";
// import { userService } from "@/services/user";
// import { kycService } from "@/services/kyc";
// import { getRouteFromStep } from "@/lib/api/navigation";

// export default function ActivityIntentPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // Check if we have role info from URL (user came from role selection)
//   const roleValue = searchParams.get("roleValue");
//   const roleLabel = searchParams.get("roleLabel");

//   const handleBack = () => {
//     router.back();
//   };

//   // If we have role info, show DetailsForm; otherwise show RoleSelection
//   if (roleValue && roleLabel) {
//     return (
//       <DetailsForm
//         roleValue={roleValue}
//         roleLabel={roleLabel}
//         onBack={handleBack}
//       />
//     );
//   }

//   return <RoleSelection onBack={handleBack} />;
// }

// /* ---------------- ROLE SELECTION COMPONENT (STEP 1) ---------------- */

// function RoleSelection({ onBack }) {
//   const router = useRouter();

//   const [roles, setRoles] = useState([]);
//   const [rolesLoading, setRolesLoading] = useState(true);
//   const [loading, setLoading] = useState(false);

//   /* ---------------- FETCH ROLES ---------------- */
//   useEffect(() => {
//     setRolesLoading(true);

//     userService
//       .getActivityIntentRoles()
//       .then((res) => {
//         const rolesArray =
//           res?.data?.data?.roles || res?.data?.roles || [];
//         setRoles(Array.isArray(rolesArray) ? rolesArray : []);
//       })
//       .catch(() => setRoles([]))
//       .finally(() => setRolesLoading(false));
//   }, []);

//   /* ---------------- SELECT ROLE AND NAVIGATE TO DETAILS ---------------- */
//   const handleSelectRole = async (role) => {
//     try {
//       setLoading(true);

//       // Save activity intent
//       await userService.setActivityIntent(role.value, "");

//       // Navigate to details page with role data
//       router.push(
//         `/onboarding/activity?roleValue=${encodeURIComponent(
//           role.value
//         )}&roleLabel=${encodeURIComponent(role.label)}`
//       );
//     } catch (err) {
//       console.error("Failed to save activity:", err);
//       alert(
//         err?.response?.data?.message || err?.message || "Failed to save activity."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-black">
//       <div className="w-[390px]  h-screen text-white mx-auto">
//         {/* HEADER */}
//         <div className="flex  gap-6 mb-6 pt-6">
//           {/* <button
//             onClick={onBack}
//             className="text-3xl text-gray-400 font-bold"
//           >
//             ← 
//           </button> */}
// <div className="flex  flex-col space-y-3 "> 
//           <h1 className="text-2xl font-semibold font-Playfair Display">
//             What are you doing right now?
//           </h1>
//           <p className="text-sm font-Poppins">This helps us tailor your Playymate experience.</p> </div>
//         </div>

//         {/* ---------------- STEP 1: ROLE SELECTION ---------------- */}
//         {rolesLoading ? (
//           <p className="text-gray-400">Loading options...</p>
//         ) : roles.length === 0 ? (
//           <p className="text-gray-400">No roles available</p>
//         ) : (
//           <div className="space-y-3 font-Poppins ">
//             {roles.map((role) => (
//               // <button
//               //   key={role.value}
//               //   onClick={() => handleSelectRole(role)}
//               //   disabled={loading}
//               //   className="w-full px-4 py-2 rounded-xl border border-[#1A43CA] hover:border-white transition disabled:opacity-50 flex items-center gap-3"
//               // >
//               //   {role.icon && <span className="text-2xl">{role.icon}</span>}
//               //   <div className="text-left">
//               //     <div className="font-medium">{role.label}</div>
//               //     {role.description && (
//               //       <div className="text-sm text-gray-400">{role.description}</div>
//               //     )}
//               //   </div>
//               // </button>
            
//   <button
//     key={role.value}
//     onClick={() => handleSelectRole(role)}
//     disabled={loading}
//     className="w-full px-4 py-2 rounded-xl border border-blue-600 bg-[#0B0B0F] flex items-center gap-3 disabled:opacity-50"
//   >
//     {role.icon && <span className="text-2xl">{role.icon}</span>}

//     <div className="text-left">
//       <div className="font-medium text-[#A6A6A6]">{role.label}</div>
//       {role.description && (
//         <div className="text-sm text-[#A6A6A6]">{role.description}</div>
//       )}
//     </div>

//   {/* Right side circular double ring button */}
// <div className="ml-auto flex items-center justify-center w-6 h-6 bg-white rounded-full">
  
//   {/* Gradient ring */}
//   <div className="flex items-center justify-center w-4 h-4 p-[2px] rounded-full bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] hover:from-green-500 hover:to-yellow-500 transition">
    
//     {/* Inner white circle */}
//     <div className="w-full h-full bg-white rounded-full"></div>

//   </div>

// </div>
//   </button>

//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ---------------- DYNAMIC FORM COMPONENT (STEP 2) ---------------- */

// function DetailsForm({ roleValue, roleLabel, onBack }) {
//   const router = useRouter();

//   const [formFields, setFormFields] = useState([]);
//   const [formData, setFormData] = useState({});
//   const [loading, setLoading] = useState(true);

//   /* ---------------- FETCH PROFILE ROLE CONFIG ---------------- */
//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         setLoading(true);

//         console.log('Fetching profile config for role:', roleValue);
        
//         // Call with role parameter to get specific role config
//         const configRes = await userService.getProfileRoleConfig(roleValue);
        
//         console.log('Full API Response:', configRes);
        
//         // The actual API response structure is: data.data.config.fields
//         // Also contains: data.data.config.common_fields
//         let fields = [];
        
//         const responseData = configRes?.data?.data;
//         const config = responseData?.config || responseData;
        
//         console.log('Config:', config);
//         console.log('Config fields:', config?.fields);
        
//         if (config?.fields) {
//           // Combine fields from config.fields and config.common_fields
//           // Use a Map to avoid duplicates (common_fields may overlap with fields)
//           const fieldMap = new Map();
          
//           // Add common fields first
//           if (config.common_fields) {
//             config.common_fields.forEach(field => {
//               fieldMap.set(field.key, field);
//             });
//           }
          
//           // Add role-specific fields (will override common fields with same key)
//           if (config.fields) {
//             config.fields.forEach(field => {
//               fieldMap.set(field.key, field);
//             });
//           }
          
//           // Convert map to array and map to our format
//           fields = Array.from(fieldMap.values()).map(field => ({
//             key: field.key,
//             name: field.name,
//             field_type: field.type, // API uses 'type'
//             icon: field.icon, // Include icon from API
//             required: field.required,
//             placeholder: field.placeholder || `Enter ${field.name}`, // Handle null placeholder
//             options: field.options,
//           }));
          
//           console.log('Mapped fields:', fields);
//         } else {
//           console.log('No fields found in config');
//         }

//         setFormFields(fields);
//       } catch (err) {
//         console.error("Failed to load profile config:", err);
//         // Don't show error to user, just continue with empty fields
//         setFormFields([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (roleValue) {
//       fetchConfig();
//     }
//   }, [roleValue]);

//   /* ---------------- HANDLE CHANGE ---------------- */
//   const handleChange = (key, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   /* ---------------- SUBMIT FORM ---------------- */
//   const handleSubmit = async () => {
//     // Check required fields
//     const missingFields = formFields
//       .filter((field) => field.required && !formData[field.key])
//       .map((field) => field.name || field.key);

//     if (missingFields.length > 0) {
//       alert(`Please fill in: ${missingFields.join(", ")}`);
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await userService.setProfileDetails(roleValue, formData);
      
//       // Navigate based on next_required_step from the API response
//       const nextStep = response?.data?.next_required_step || 'PROFILE_DETAILS';
      
//       // Check KYC screen visibility to determine navigation
//     // Check KYC screen visibility to determine navigation
// try {
//   const screensRes = await kycService.getKycScreens();
//   const { screens } = screensRes.data?.data || {};

//   const aadhaarEnabled = screens?.aadhaar?.enabled ?? true;
//   const livenessEnabled = screens?.liveness?.enabled ?? true;

//   if (!aadhaarEnabled && !livenessEnabled) {
//     // Both disabled → skip KYC
//     router.push("/onboarding/physical");
//     return;
//   }

//   if (aadhaarEnabled && livenessEnabled) {
//     // Both enabled
//     router.push("/onboarding/kyc");
//     return;
//   }

//   if (aadhaarEnabled && !livenessEnabled) {
//     // Only Aadhaar enabled
//     router.push("/onboarding/kyc");
//     return;
//   }

//   if (!aadhaarEnabled && livenessEnabled) {
//     // Only Liveness enabled
//     router.push("/onboarding/kyc/liveness");
//     return;
//   }
// } catch (screenErr) {
//   console.error("Failed to fetch KYC screens:", screenErr);
// }

// // Fallback: use default behavior based on next_required_step
// const route = getRouteFromStep(nextStep);
// router.push(route);
//     } catch (err) {
//       console.error("Failed to save profile details:", err);
//       alert(
//         err?.response?.data?.message || err?.message || "Failed to save profile details."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-black py-8 ">
//       <div className="flex items-center  justify-center gap-6 mb-6 ">
//           <button
//             onClick={onBack}
//             className="text-3xl text-gray-400 font-bold"
//           >
//             ←
//           </button>

//           <h1 className="text-2xl font-semibold text-white">
//             Tell us more about your {roleLabel}
//           </h1>
//         </div>
//       <div className="w-[390px] text-white mx-auto font-Poppins ">
//         {/* HEADER */}
        

//         {/* ---------------- STEP 2: DYNAMIC FORM ---------------- */}
//         {loading && !formFields.length ? (
//           <p className="text-gray-400">Loading...</p>
//         ) : formFields.length === 0 ? (
//           <div className="text-gray-400">
//             <p>No form fields available for this role.</p>
//             <p className="text-sm mt-2">Role: {roleValue}</p>
//           </div>
//         ) : (
//           <div className="mt-6 space-y-4">
//             {formFields.map((field) => (
//               <div key={field.key}>
//                 <label className="text-sm text-gray-400">
//                   {field.name || field.key}
//                   {field.required && <span className="text-red-500"> *</span>}
//                 </label>
//                 {field.field_type === 'select' ? (
//                   <div className="relative">
//                     {field.icon && (
//                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
//                         {field.icon}
//                       </span>
//                     )}
//                     <select
//                       className={`w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700 text-white ${field.icon ? 'pl-10' : ''}`}
//                       onChange={(e) => handleChange(field.key, e.target.value)}
//                       value={formData[field.key] || ''}
//                     >
//                       <option value="">{field.placeholder || `Select ${field.name || field.key}`}</option>
//                       {(field.options || []).map((option) => (
//                         <option key={option} value={option}>
//                           {option}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 ) : field.field_type === 'boolean' ? (
//                   <div className="flex items-center gap-3 mt-2">
//                     <button
//                       type="button"
//                       onClick={() => handleChange(field.key, true)}
//                       className={`px-4 py-2 rounded-lg border ${
//                         formData[field.key] === true
//                           ? 'bg-pink-500 border-pink-500'
//                           : 'border-gray-700'
//                       }`}
//                     >
//                       Yes
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => handleChange(field.key, false)}
//                       className={`px-4 py-2 rounded-lg border ${
//                         formData[field.key] === false
//                           ? 'bg-pink-500 border-pink-500'
//                           : 'border-gray-700'
//                       }`}
//                     >
//                       No
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="relative">
//                     {field.icon && (
//                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
//                         {field.icon}
//                       </span>
//                     )}
//                     <input
//                       type={field.field_type === 'number' ? 'number' : 'text'}
//                       placeholder={field.placeholder || `Enter ${field.name || field.key}`}
//                       className={`w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700 text-white ${field.icon ? 'pl-10' : ''}`}
//                       onChange={(e) =>
//                         handleChange(field.key, e.target.value)
//                       }
//                     />
//                   </div>
//                 )}
//               </div>
//             ))}

//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="w-full mt-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50"
//             >
//               {loading ? "Saving..." : "Save & Continue"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useRouter, useSearchParams } from "next/navigation";
// import { useState, useEffect } from "react";
// import { userService } from "@/services/user";
// import { kycService } from "@/services/kyc";
// import { getRouteFromStep } from "@/lib/api/navigation";

// export default function ActivityIntentPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const roleValue = searchParams.get("roleValue");
//   const roleLabel = searchParams.get("roleLabel");

//   const handleBack = () => {
//     router.back();
//   };

//   if (roleValue && roleLabel) {
//     return (
//       <DetailsForm
//         roleValue={roleValue}
//         roleLabel={roleLabel}
//         onBack={handleBack}
//       />
//     );
//   }

//   return <RoleSelection onBack={handleBack} />;
// }

// /* ---------------- ROLE SELECTION COMPONENT ---------------- */

// function RoleSelection({ onBack }) {
//   const router = useRouter();

//   const [roles, setRoles] = useState([]);
//   const [rolesLoading, setRolesLoading] = useState(true);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setRolesLoading(true);

//     userService
//       .getActivityIntentRoles()
//       .then((res) => {
//         const rolesArray =
//           res?.data?.data?.roles || res?.data?.roles || [];
//         setRoles(Array.isArray(rolesArray) ? rolesArray : []);
//       })
//       .catch(() => setRoles([]))
//       .finally(() => setRolesLoading(false));
//   }, []);

//   const handleSelectRole = async (role) => {
//     try {
//       setLoading(true);

//       await userService.setActivityIntent(role.value, "");

//       router.push(
//         `/onboarding/activity?roleValue=${encodeURIComponent(
//           role.value
//         )}&roleLabel=${encodeURIComponent(role.label)}`
//       );
//     } catch (err) {
//       alert(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to save activity."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-black">
//       <div className="w-[390px] py-8 text-white mx-auto">
//         <div className="flex gap-6 mb-6 pt-6">
//           <button
//             onClick={onBack}
//             className="text-3xl text-gray-400 font-bold"
//           >
//             ←
//           </button>

//           <div className="flex flex-col space-y-3">
//             <h1 className="text-2xl font-semibold font-Playfair Display">
//               What are you doing right now?
//             </h1>
//             <p className="text-sm font-Poppins">
//               This helps us tailor your Playymate experience.
//             </p>
//           </div>
//         </div>

//         {rolesLoading ? (
//           <p className="text-gray-400">Loading options...</p>
//         ) : roles.length === 0 ? (
//           <p className="text-gray-400">No roles available</p>
//         ) : (
//           <div className="space-y-3 font-Poppins">
//             {roles.map((role) => (
//               <button
//                 key={role.value}
//                 onClick={() => handleSelectRole(role)}
//                 disabled={loading}
//                 className="w-full px-4 py-4 rounded-xl border border-gray-700 hover:border-pink-500 transition disabled:opacity-50 flex items-center gap-3"
//               >
//                 {role.icon && (
//                   <span className="text-2xl">{role.icon}</span>
//                 )}

//                 <div className="text-left">
//                   <div className="font-medium">{role.label}</div>
//                   {role.description && (
//                     <div className="text-sm text-gray-400">
//                       {role.description}
//                     </div>
//                   )}
//                 </div>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ---------------- DYNAMIC FORM COMPONENT ---------------- */

// function DetailsForm({ roleValue, roleLabel, onBack }) {
//   const router = useRouter();

//   const [formFields, setFormFields] = useState([]);
//   const [formData, setFormData] = useState({});
//   const [loading, setLoading] = useState(true);

//   const [screenConfig, setScreenConfig] = useState(null);

//   /* ---------------- FETCH SCREEN CONFIG ---------------- */

//  useEffect(() => {
//   const fetchScreenConfig = async () => {
//     try {
//       const res = await kycService.getScreenConfig(
//         "profile_details_basic"
//       );

//       setScreenConfig(res?.data?.data || null);
//     } catch (err) {
//       console.error("Failed to fetch screen config:", err);
//       setScreenConfig(null);
//     }
//   };

//   fetchScreenConfig();
// }, []);

//   /* ---------------- FETCH PROFILE ROLE CONFIG ---------------- */

//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         setLoading(true);

//         const configRes = await userService.getProfileRoleConfig(
//           roleValue
//         );

//         let fields = [];

//         const responseData = configRes?.data?.data;
//         const config = responseData?.config || responseData;

//         if (config?.fields) {
//           const fieldMap = new Map();

//           if (config.common_fields) {
//             config.common_fields.forEach((field) => {
//               fieldMap.set(field.key, field);
//             });
//           }

//           config.fields.forEach((field) => {
//             fieldMap.set(field.key, field);
//           });

//           fields = Array.from(fieldMap.values()).map((field) => ({
//             key: field.key,
//             name: field.name,
//             field_type: field.type,
//             icon: field.icon,
//             required: field.required,
//             placeholder:
//               field.placeholder || `Enter ${field.name}`,
//             options: field.options,
//           }));
//         }

//         setFormFields(fields);
//       } catch (err) {
//         setFormFields([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (roleValue) fetchConfig();
//   }, [roleValue]);

//   /* ---------------- KYC NAVIGATION ---------------- */

//   const navigateAfterProfile = async () => {
//     try {
//       const screensRes = await kycService.getKycScreens();

//       const { screens } = screensRes.data?.data || {};

//       const aadhaarEnabled = screens?.aadhaar?.enabled ?? true;
//       const livenessEnabled = screens?.liveness?.enabled ?? true;

//       if (!aadhaarEnabled && !livenessEnabled) {
//         router.push("/onboarding/physical");
//         return;
//       }

//       if (aadhaarEnabled && livenessEnabled) {
//         router.push("/onboarding/kyc");
//         return;
//       }

//       if (aadhaarEnabled && !livenessEnabled) {
//         router.push("/onboarding/kyc");
//         return;
//       }

//       if (!aadhaarEnabled && livenessEnabled) {
//         router.push("/onboarding/kyc/liveness");
//         return;
//       }
//     } catch (err) {
//       console.error("KYC check failed", err);
//       router.push("/onboarding/kyc");
//     }
//   };

//   /* ---------------- HANDLE CHANGE ---------------- */

//   const handleChange = (key, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   /* ---------------- SUBMIT ---------------- */

//   const handleSubmit = async () => {
//     const missingFields = formFields
//       .filter((field) => field.required && !formData[field.key])
//       .map((field) => field.name || field.key);

//     if (missingFields.length > 0) {
//       alert(`Please fill in: ${missingFields.join(", ")}`);
//       return;
//     }

//     try {
//       setLoading(true);

//       await userService.setProfileDetails(roleValue, formData);

//       await navigateAfterProfile();
//     } catch (err) {
//       alert(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to save profile details."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- SKIP ---------------- */

//   const handleSkip = async () => {
//     await navigateAfterProfile();
//   };

//   return (
//     <div className="bg-black py-8">
//       <div className="flex items-center justify-center gap-6 mb-6 pt-6">
//         <button
//           onClick={onBack}
//           className="text-3xl text-gray-400 font-bold"
//         >
//           ←
//         </button>

//         <div className="text-white">
//           <h1 className="text-2xl font-semibold">
//             {screenConfig?.title || "Complete your profile"}
//           </h1>

//           <p className="text-sm text-gray-400">
//             {screenConfig?.subtitle ||
//               "Add a few more details so people can know you better"}
//           </p>
//         </div>
//       </div>

//       <div className="w-[390px] text-white mx-auto font-Poppins">
//         {loading && !formFields.length ? (
//           <p className="text-gray-400">Loading...</p>
//         ) : formFields.length === 0 ? (
//           <p>No form fields available</p>
//         ) : (
//           <div className="mt-6 space-y-4">
//             {formFields.map((field) => (
//               <div key={field.key}>
//                 <label className="text-sm text-gray-400">
//                   {field.name}
//                   {field.required && (
//                     <span className="text-red-500">*</span>
//                   )}
//                 </label>

//                 <input
//                   type="text"
//                   placeholder={field.placeholder}
//                   className="w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700 text-white"
//                   onChange={(e) =>
//                     handleChange(field.key, e.target.value)
//                   }
//                 />
//               </div>
//             ))}

//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="w-full mt-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
//             >
//               {screenConfig?.button_text?.primary ||
//                 "Save & Continue"}
//             </button>

//             <button
//               onClick={handleSkip}
//               className="w-full text-gray-400 mt-3"
//             >
//               {screenConfig?.button_text?.skip || "Skip for now"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }