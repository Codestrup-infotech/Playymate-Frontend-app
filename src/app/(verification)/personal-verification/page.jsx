


"use client";

import React, { useState, useEffect } from "react";
import { userService } from "@/services/user";
import { useRouter } from "next/navigation";
import { getStartingStep } from "@/lib/onboarding/stateMapper";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutocomplete";
import { validateLocationData, validateCoordinates } from "@/lib/validators/locationValidator";



export default function PersonalVerification() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [ageGroup, setAgeGroup] = useState(null);

  /* ---------------------------------------------------------- */
  /* AUTH + ONBOARDING STATE SYNC                               */
  /* ---------------------------------------------------------- */

  useEffect(() => {
    const init = async () => {
      try {
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("playymate_access_token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await userService.getOnboardingStatus();
        const data = response?.data?.data;

        const {
          onboarding_state,
          onboarding_complete,
        } = data;

        if (onboarding_complete) {
          router.push("/home");
          return;
        }

        const savedAgeGroup = localStorage.getItem("user_age_group");
        if (savedAgeGroup) {
          setAgeGroup(savedAgeGroup);
        }

        const initialStep = getStartingStep(
          onboarding_state,
          savedAgeGroup
        );

        setStep(initialStep || 1);
      } catch (error) {
        console.error("Failed to fetch onboarding state:", error);
        setStep(1);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  /* ---------------------------------------------------------- */
  /* Refresh Step From Backend (CRITICAL)                       */
  /* ---------------------------------------------------------- */

  const refreshStepFromServer = async () => {
    const response = await userService.getOnboardingStatus();
    const state = response?.data?.data?.onboarding_state;
    const savedAgeGroup = localStorage.getItem("user_age_group");
    const correctStep = getStartingStep(state, savedAgeGroup);
    setStep(correctStep || 1);
  };

  /* ---------------------------------------------------------- */
  /* LOADING                                                     */
  /* ---------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  /* ---------------------------------------------------------- */
  /* STEP RENDERING                                              */
  /* ---------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">

      {step === 1 && (
       <GenderStep onSuccess={refreshStepFromServer} />
      )}

      {step === 2 && (
        <AgeStep
          onSuccess={(serverAgeGroup, calculatedAge) => {
            if (serverAgeGroup) {
              localStorage.setItem("user_age_group", serverAgeGroup);
              setAgeGroup(serverAgeGroup);
            }
            // For adults (age >= 18), go to step 4 (Location)
            // For minors (age < 18), go to step 3 (Parent Consent)
            if (calculatedAge >= 18) {
              setStep(4); // Location for adults
            } else {
              setStep(3); // Parent consent for minors
            }
          }}
        />
      )}

      {step === 3 && (
        <ParentConsentStep
          onNext={refreshStepFromServer}
          onBack={() => setStep(2)}
        />
      )}

     {step === 4 && (
  <LocationPickerStep
    onSuccess={refreshStepFromServer}
  />
)}

      {step === 5 && (
        <PhotoStep
          onSuccess={refreshStepFromServer}
        />
      )}

      {step === 6 && (
        <StatusStep />
      )}

    </div>
  );
}





// STEP 1 — GENDER

function GenderStep({ onSuccess }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const genders = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const handleContinue = async () => {
    if (!selected) return;

    try {
      setLoading(true);
      setError(null);

      await userService.updateGender(selected);

      // ✅ Refresh step from backend
      onSuccess();

    } catch (err) {
      console.error("Error saving gender:", err);
      setError("Failed to save gender. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[360px] text-center">

      <h2 className="text-3xl font-bold mb-6">
        What's Your Gender?
      </h2>

      <div className="space-y-4">
        {genders.map((g) => (
          <button
            key={g.value}
            onClick={() => setSelected(g.value)}
            className={`w-full py-4 rounded-xl border transition
              ${
                selected === g.value
                  ? "border-pink-500 bg-white/5"
                  : "border-gray-700"
              }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-400 mt-4 text-sm">{error}</p>
      )}

      <button
        disabled={!selected || loading}
        onClick={handleContinue}
        className="mt-6 w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}

// STEP 2 — AGE

function AgeStep({ onSuccess }) {
  const [loading, setLoading] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];
  const years = Array.from(
    { length: 90 },
    (_, i) => new Date().getFullYear() - i
  );

  const [day, setDay] = useState(7);
  const [month, setMonth] = useState("Feb");
  const [year, setYear] = useState(2002);

  const age = new Date().getFullYear() - year;

  async function confirmDob() {
    const dob = `${year}-${String(
      months.indexOf(month) + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    try {
      setLoading(true);

      const response = await userService.updateDOB(dob);

      const ageGroup = response?.data?.data?.age_group;

      if (ageGroup) {
        localStorage.setItem("user_age_group", ageGroup);
      }

      // Calculate age from selected year
      const calculatedAge = new Date().getFullYear() - year;
      
      // ✅ Pass both ageGroup and calculatedAge to parent
      onSuccess(ageGroup, calculatedAge);

    }
    //  catch (error) {
    //   console.error("Error saving DOB:", error);
    //   alert("Failed to save Date of Birth. Please try again.");
    // }
    
    catch (error) {
  console.log("FULL DOB ERROR:", {
    status: error?.response?.status,
    data: error?.response?.data,
    message: error?.response?.data?.message,
    error_code: error?.response?.data?.error_code,
  });

  alert(error?.response?.data?.message || "Failed to save DOB");
}

    finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[360px] text-center">

      <h1 className="text-3xl mb-6">
        How Old Are You?
      </h1>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <select value={day} onChange={(e)=>setDay(Number(e.target.value))}>
          {days.map(d => <option key={d}>{d}</option>)}
        </select>

        <select value={month} onChange={(e)=>setMonth(e.target.value)}>
          {months.map(m => <option key={m}>{m}</option>)}
        </select>

        <select value={year} onChange={(e)=>setYear(Number(e.target.value))}>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      <p className="mb-4">You're {age}</p>

      <button
        onClick={confirmDob}
        disabled={loading}
        className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-40"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}




// STEP 3 — PARENT CONSENT

function ParentConsentStep({ onNext, onBack }) {
    const [checked, setChecked] = React.useState(false);
    const [loading, setLoading] = useState(false);

    const handleConsent = async () => {
        if (!checked) return;
        
        try {
            setLoading(true);
            // Save parent consent to backend
            await userService.giveParentConsent();
            onNext();
        } catch (error) {
  console.error('Error saving parent consent:', error);
  alert("Failed to save parent consent. Please try again.");
  return; // STOP here
}finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-[360px] h-[640px] text-white relative px-6">

            {/* BACK */}
            <button
                onClick={onBack}
                className="absolute top-4 left-2 text-xl"
            >
                ←
            </button>

            {/* CONTENT */}
            <div className="mt-24 text-center">

                <h1 className="text-3xl font-Playfair Display">
                    <span className="bg-gradient-to-r font-Playfair Display from-pink-500 to-orange-400 bg-clip-text text-transparent">
                        Parent Consent
                    </span>
                </h1>

                <p className="mt-6 text-gray-400 text-sm leading-relaxed font-Poppins ">
                    To continue using Playmate, we need permission from a parent or
                    guardian. This helps us keep the experience safe and age-appropriate.
                </p>

                <p className="mt-4 text-gray-500 text-xs font-Poppins">
                    Your information is secure and never shared.
                </p>

                {/* CHECKBOX */}
                <label className="mt-10 flex items-start gap-3 text-left text-sm cursor-pointer font-Poppins">

                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="mt-1 accent-pink-500"
                    />

                    <span>
                        I am parent or legal guardian and I give consent
                    </span>
                </label>

            </div>

            {/* FOOTER */}
            <div className="absolute bottom-8 left-0 w-full px-6 font-Poppins">

                <button
                    disabled={!checked || loading}
                    onClick={handleConsent}
                    className="w-full py-4 rounded-full
            bg-gradient-to-r from-pink-500 to-orange-400
          
            disabled:opacity-40"
                >
                    {loading ? 'Saving...' : 'Give Consent'}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                    By continuing, you agree to Playmate's Terms & Privacy Policy.
                </p>
            </div>

        </div>
    );
}



// STEP 4 Location


function LocationPickerStep({ onSuccess }) {
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = React.useRef(null);

  // ✅ Google Places Hook
  const {
    predictions,
    selectedPlace,
    isLoaded,
    error: placesError,
    getPredictions,
    selectPrediction,
    parseAddress,
    clearSelection,
  } = usePlacesAutocomplete(inputRef);

  /* ---------------------------------------------------------- */
  /* AUTO REQUEST GEOLOCATION ON MOUNT                         */
  /* ---------------------------------------------------------- */

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // user denied → silently ignore
      },
      { enableHighAccuracy: true }
    );
  }, []);

  /* ---------------------------------------------------------- */
  /* HANDLE SEARCH INPUT                                        */
  /* ---------------------------------------------------------- */

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 3) {
      getPredictions(value);
    }
  };

  const handleSelectPrediction = async (prediction) => {
    const place = await selectPrediction(prediction);
    if (!place) return;

    const parsed = parseAddress(place);
    setQuery(parsed.fullAddress || prediction.description);

    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setCoords({ lat, lng });
    }
  };

  /* ---------------------------------------------------------- */
  /* CONFIRM LOCATION                                           */
  /* ---------------------------------------------------------- */

  const handleConfirmLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!coords) {
        setError("Please allow location or search a location.");
        setLoading(false);
        return;
      }

      const payload = {
        lat: coords.lat,
        lng: coords.lng,
        location: {
          type: "Point",
          coordinates: [coords.lng, coords.lat],
        },
      };

      const response = await userService.updateLocation(payload);

      console.log("Location saved:", response.data);

      // 🔥 Refresh onboarding step from backend
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.log("FULL LOCATION ERROR:", err?.response?.data);

      const status = err?.response?.status;

      if (status === 401) {
        window.location.href = "/login";
        return;
      }

      if (status === 400) {
        // State mismatch → just refresh
        if (onSuccess) {
          onSuccess();
        }
        return;
      }

      setError(
        err?.response?.data?.message ||
        "Failed to save location. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------- */
  /* MAP URL                                                     */
  /* ---------------------------------------------------------- */

  const mapUrl = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  /* ---------------------------------------------------------- */
  /* UI                                                          */
  /* ---------------------------------------------------------- */

  return (
    <div className="relative w-[360px] h-[640px] bg-black text-white">

      <iframe
        src={mapUrl}
        className="absolute inset-0 w-full h-full border-0"
        loading="lazy"
      />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%]
        bg-black/80 rounded-xl p-3 backdrop-blur">

        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-2 border border-pink-500/40 rounded-lg px-3 py-2">
            🔍
            <input
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              placeholder="Search location..."
              className="bg-transparent outline-none text-sm flex-1 text-white"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  clearSelection();
                  setCoords(null);
                }}
              >
                ✕
              </button>
            )}
          </div>

          {predictions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-900 rounded-lg max-h-40 overflow-y-auto">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handleSelectPrediction(prediction)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800"
                >
                  {prediction.description}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Places Error */}
        {placesError && (
          <p className="text-yellow-400 text-xs mt-2 text-center">
            {placesError}
          </p>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirmLocation}
          disabled={loading}
          className="mt-3 w-full py-3 rounded-full
            bg-gradient-to-r from-pink-500 to-orange-400
            disabled:opacity-40"
        >
          {loading ? "Saving..." : "Confirm Location"}
        </button>

        {error && (
          <p className="text-red-400 text-xs text-center mt-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}


// STEP 5 — PHOTO

function PhotoStep({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------------------------------------------------- */
  /* HANDLE FILE SELECT                                         */
  /* ---------------------------------------------------------- */

  const handleUpload = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  /* ---------------------------------------------------------- */
  /* SUBMIT PHOTO                                               */
  /* ---------------------------------------------------------- */

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a photo.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fileName = `profile_${Date.now()}.jpg`;
      const contentType = file.type || "image/jpeg";

      // 1️⃣ Get presigned URL
    const presignResponse = await userService.getPresignedUrl(
  fileName,
  file
);

      const { upload_url, file_url } =
        presignResponse?.data?.data || {};

      if (!upload_url || !file_url) {
        throw new Error("Invalid presign response");
      }

      // 2️⃣ Upload file to S3
     await userService.uploadToPresigned(
  upload_url,
  file,
  file.type
);

      // 3️⃣ Save file URL to backend
      await userService.updateProfilePhoto(file_url);

      console.log("Profile photo saved successfully");

      // 4️⃣ Refresh step from backend
      if (onSuccess) {
        onSuccess();
      }

    } 
    // catch (err) {
    //   console.log("FULL PHOTO ERROR:", err?.response?.data);

    //   const status = err?.response?.status;

    //   if (status === 401) {
    //     window.location.href = "/login";
    //     return;
    //   }

    //   if (status === 400) {
    //     // state mismatch → refresh
    //     if (onSuccess) {
    //       onSuccess();
    //     }
    //     return;
    //   }

    //   setError(
    //     err?.response?.data?.message ||
    //     "Failed to upload photo. Please try again."
    //   );
    // }

    catch (err) {
  console.log("FULL PHOTO ERROR:", err?.response?.data);
  console.log("VALIDATION DETAILS:", err?.response?.data?.errors);
}

// catch (err) {
//   const errorMessage =
//     err?.response?.data?.message ||
//     "Photo validation failed.";

//   setError(errorMessage);
// }
    
    finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------- */
  /* UI                                                          */
  /* ---------------------------------------------------------- */

  return (
    <div className="w-[360px] text-center text-white py-16">

      <h1 className="text-3xl font-Playfair Display">
        Add a Profile{" "}
        <span className="text-orange-400">Photo</span>
      </h1>

      <div className="relative mt-10 mx-auto w-[170px] h-[210px]
        rounded-2xl p-[2px]
        bg-gradient-to-br from-pink-500 to-orange-400">

        <div className="w-full h-full bg-white rounded-2xl overflow-hidden flex items-center justify-center">

          {preview ? (
            <img
              src={preview}
              alt="profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Photo</span>
          )}
        </div>

        <label className="absolute -bottom-3 -right-3 w-12 h-12
          rounded-full bg-gradient-to-r from-pink-500 to-orange-400
          flex items-center justify-center cursor-pointer shadow-lg">

          📷
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
          />
        </label>
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-4">{error}</p>
      )}

      <button
        disabled={!file || loading}
        onClick={handleSubmit}
        className="mt-12 w-[90%] py-4 rounded-full
          bg-gradient-to-r from-pink-500 to-orange-400
          disabled:opacity-40"
      >
        {loading ? "Uploading..." : "Continue"}
      </button>
    </div>
  );
}

// STEP 6 — STATUS







 function StatusStep({ onBack }) {
  const router = useRouter();

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Fetch roles from backend
  useEffect(() => {
    setRolesLoading(true);
    userService.getActivityIntentRoles()
      .then((res) => {
        // API returns { data: { roles: [...] } }
        const rolesArray = res?.data?.data?.roles || res?.data?.roles || [];
        console.log("Activity intent roles response:", rolesArray);
        setRoles(Array.isArray(rolesArray) ? rolesArray : []);
      })
      .catch((err) => {
        console.error("Error fetching roles:", err);
        setRoles([]);
      })
      .finally(() => {
        setRolesLoading(false);
      });
  }, []);

  // ✅ When role selected
  const handleSelectRole = async (role) => {
    setSelectedRole(role);
    setFormFields([]);
    setFormData({});

    try {
      setLoading(true);

      // POST selected role - details should be empty string initially
      const response = await userService.setActivityIntent(role.value, '');
      console.log("Activity intent set:", response.data);

      // GET profile role config (form fields)
      try {
        const configRes = await userService.getProfileRoleConfig();
        const configs = configRes?.data?.data?.configs || [];
        
        // Find the config for the selected role
        const roleConfig = configs.find(c => c.role_type === role.value);
        if (roleConfig && roleConfig.fields) {
          setFormFields(roleConfig.fields);
        } else {
          console.log("No fields config found for role:", role.value);
        }
      } catch (fieldErr) {
        console.log("No profile role config:", fieldErr);
      }
      
    } catch (err) {
      console.error("Error setting activity intent:", err);
      alert(err?.response?.data?.message || "Failed to save activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ✅ Submit profile details
  const handleSubmit = async () => {
    console.log("Form fields:", formFields);
    console.log("Form data:", formData);
    console.log("Selected role:", selectedRole?.value);
    
    // Validate required fields
    const missingFields = formFields
      .filter(field => field.required && !formData[field.key])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    // Check if current_city is required
    if (!formData.current_city) {
      alert("Please enter your current city");
      return;
    }

    try {
      setLoading(true);
      
      // Build details object - include all form data plus current_city
      const details = {
        ...formData,
      };
      
      console.log("Submitting details:", { role_type: selectedRole?.value, details });
      
      // Use userService.setProfileDetails with correct format
      const response = await userService.setProfileDetails(selectedRole?.value, details);
      console.log("Profile details saved:", response.data);
      
      // Redirect to KYC
      router.push("/personal-verification/kyc");
    } catch (err) {
      console.error("Profile details error:", err.response?.data || err);
      alert(err?.response?.data?.message || "Failed to save profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[360px] text-white mx-auto">

      {/* TOP BAR */}
      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={onBack}
          className="text-3xl text-gray-400 font-bold"
        >
          ←
        </button>

        <h1 className="text-2xl font-semibold leading-tight">
          What are you{" "}
          <span className="bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
            doing right now?
          </span>
        </h1>
      </div>

      {/* ROLE OPTIONS */}
      {rolesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading options...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No activity options available.</p>
          <p className="text-gray-500 text-sm mt-2">Please try again later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => {
            const active = selectedRole?.value === role.value;

            return (
              <button
                key={role.value}
                onClick={() => handleSelectRole(role)}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all
                  ${
                    active
                      ? "border-pink-500 bg-white/5"
                      : "border-gray-700 bg-white/2"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{role.icon}</span>
                  <span className="text-sm">{role.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* DYNAMIC FORM */}
      {selectedRole && (
        <div className="mt-6 space-y-4">

          <h2 className="text-lg font-semibold">
            {selectedRole.label} Details
          </h2>

          {loading && <p className="text-gray-400">Loading fields...</p>}

          {/* Backend generated fields */}
          {formFields.map((field) => (
            <div key={field.key}>
              <label className="text-sm text-gray-400">
                {field.icon} {field.label}
              </label>

              {field.type === "select" ? (
                <select
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700"
                  value={formData[field.key] || ''}
                  onChange={(e) =>
                    handleChange(field.key, e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700"
                  onChange={(e) =>
                    handleChange(field.key, e.target.value)
                  }
                />
              )}
            </div>
          ))}

          {/* Always include current_city as it's required by the API */}
          {!formFields.find(f => f.key === 'current_city') && (
            <div>
              <label className="text-sm text-gray-400">
                📍 Current City
              </label>
              <input
                type="text"
                placeholder="Enter your city"
                value={formData.current_city || ''}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700"
                onChange={(e) =>
                  handleChange('current_city', e.target.value)
                }
              />
            </div>
          )}

          {/* Special Case → Other */}
          {selectedRole.value === "OTHER" && (
            <div>
              <label className="text-sm text-gray-400">
                Enter your profession
              </label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 rounded-lg bg-black border border-gray-700"
                onChange={(e) =>
                  handleChange("custom_profession", e.target.value)
                }
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full mt-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
          >
            Save & Continue
          </button>
        </div>
      )}
    </div>
  );
}
