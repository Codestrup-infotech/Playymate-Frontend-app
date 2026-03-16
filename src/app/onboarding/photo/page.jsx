// "use client";

// import { useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Loader2, AlertCircle, Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
// import { userService } from '@/services/user';
// import { getErrorMessage } from '@/lib/api/errorMap';
// import { navigateToStep } from '@/lib/api/navigation';

// export default function OnboardingProfilePhotoPage() {
//   const router = useRouter();
//   const fileInputRef = useRef(null);
//   const [photo, setPhoto] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState(null);

//   const clearError = () => setError(null);

//   const handleFileSelect = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       setError('Please select an image file (JPG or PNG)');
//       return;
//     }

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       setError('Image size should be less than 5MB');
//       return;
//     }

//     clearError();
//     setPhoto(file);
    
//     // Create preview
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setPhotoPreview(e.target?.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleTakePhoto = () => {
//     // In production, would open camera
//     // For now, trigger file input
//     fileInputRef.current?.click();
//   };

//   const handleRemovePhoto = () => {
//     setPhoto(null);
//     setPhotoPreview(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleSubmit = async () => {
//     if (!photo) {
//       setError('Please select a profile photo');
//       return;
//     }

//     try {
//       setUploading(true);
//       clearError();

//       // Step 1: Get presigned URL
//       const fileName = `profile_${Date.now()}_${photo.name}`;
//       const presignResponse = await userService.getPresignedUrl(fileName, photo.type);
//       const { upload_url, file_url } = presignResponse.data.data;

//       // Step 2: Upload file to presigned URL
//       await userService.uploadToPresigned(upload_url, photo, photo.type);

//       // Step 3: Save profile photo URL to backend
//       setLoading(true);
//       const response = await userService.updateProfilePhoto(file_url);
      
//       // Navigate based on next_required_step
//       const nextStep = response?.data?.next_required_step;
//       if (nextStep) {
//         navigateToStep(nextStep, router);
//       } else {
//         // Default to activity intent
//         router.push('/onboarding/activity-intent');
//       }
//     } catch (err) {
//       const errorCode = err.response?.data?.error_code;
      
//       // Handle specific face validation errors
//       if (errorCode === 'FACE_NOT_DETECTED') {
//         setError('No face detected. Please upload a photo with your face visible.');
//       } else if (errorCode === 'MULTIPLE_FACES') {
//         setError('Multiple faces detected. Please upload a photo with only your face.');
//       } else if (errorCode === 'LOW_FACE_CONFIDENCE') {
//         setError('Could not verify your face. Please upload a clearer photo.');
//       } else {
//         const message = getErrorMessage(errorCode) || 'Failed to upload photo. Please try again.';
//         setError(message);
//       }
//     } finally {
//       setUploading(false);
//       setLoading(false);
//     }
//   };

//   const handleSkip = () => {
//     router.push('/onboarding/activity-intent');
//   };

//   return (
//     <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
//       <div className="w-full max-w-sm">
//         {/* Header */}
//         <div className="flex items-center gap-3 mb-8">
//           <button
//             onClick={() => router.push('/onboarding/location')}
//             className="p-2 rounded-full hover:bg-white/10 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </button>
//           <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[60%]" />
//           </div>
//         </div>

//         {/* Content */}
//         <div className="space-y-6">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
//               <Camera className="w-8 h-8 text-white" />
//             </div>
//             <h1 className="text-3xl font-Playfair Display font-bold">
//               Add your
//               <span className="bg-gradient-to-r px-2 from-pink-400 to-orange-400 bg-clip-text text-transparent">
//                 photo
//               </span>
//             </h1>
//             <p className="mt-2 text-gray-400 text-sm">
//               Upload a clear photo of yourself
//             </p>
//           </div>

//           {error && (
//             <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
//               <AlertCircle className="w-4 h-4" />
//               <span>{error}</span>
//             </div>
//           )}

//           {/* Photo Preview / Upload Area */}
//           <div className="flex justify-center">
//             {photoPreview ? (
//               <div className="relative">
//                 <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-pink-500">
//                   <img 
//                     src={photoPreview} 
//                     alt="Profile preview" 
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <button
//                   onClick={handleRemovePhoto}
//                   className="absolute -top-2 -right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//             ) : (
//               <div 
//                 onClick={handleTakePhoto}
//                 className="w-40 h-40 rounded-full border-4 border-dashed border-gray-600 
//                          flex flex-col items-center justify-center cursor-pointer
//                          hover:border-pink-500 hover:bg-white/5 transition-colors"
//               >
//                 <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
//                 <span className="text-sm text-gray-400">Tap to add</span>
//               </div>
//             )}
//           </div>

//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             onChange={handleFileSelect}
//             className="hidden"
//           />

//           {/* Upload Buttons */}
//           {!photoPreview && (
//             <div className="space-y-3">
//               <button
//                 onClick={handleTakePhoto}
//                 className="w-full py-3 rounded-xl border border-white/10 bg-white/5 
//                          flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
//               >
//                 <Upload className="w-5 h-5" />
//                 <span>Choose from gallery</span>
//               </button>
//             </div>
//           )}

//           <button
//             onClick={handleSubmit}
//             disabled={!photo || loading || uploading}
//             className="w-full py-4 rounded-full font-Poppins font-semibold
//                      bg-gradient-to-r from-pink-500 to-orange-400 
//                      disabled:opacity-50 disabled:cursor-not-allowed
//                      flex items-center justify-center gap-2"
//           >
//             {uploading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Uploading...
//               </>
//             ) : loading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               'Continue'
//             )}
//           </button>

//           <button
//             type="button"
//             onClick={handleSkip}
//             className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
//           >
//             Skip for now
//           </button>

//           <p className="text-center text-gray-500 text-xs">
//             For best results: Use a well-lit photo with your face clearly visible
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Camera, X, CheckCircle } from 'lucide-react';
import { userService } from '@/services/user';
import { kycService } from '@/services/kyc';
import { getErrorMessage } from '@/lib/api/errorMap';
import { getRouteFromStep } from '@/lib/api/navigation';

export default function OnboardingProfilePhotoPage() {
  const router = useRouter();
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];
  const [photos, setPhotos] = useState([null, null, null]);
  const [photoPreviews, setPhotoPreviews] = useState([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  // Track upload progress for each photo slot
  const [uploadProgress, setUploadProgress] = useState([false, false, false]);
  // Track successful uploads
  const [uploadedUrls, setUploadedUrls] = useState([null, null, null]);
  const [screenConfig, setScreenConfig] = useState(null);

  const clearError = () => setError(null);

  // Check onboarding status on mount
  // useEffect(() => {
  //   // ✅ Use stored next step — no API call needed
  //   const nextStep = sessionStorage.getItem("onboarding_next_step");
  //   const token = sessionStorage.getItem("access_token") || 
  //                 sessionStorage.getItem("accessToken") || 
  //                 localStorage.getItem("accessToken") ||
  //                 localStorage.getItem("playymate_access_token");

  //   if (!token) {
  //     router.push("/login/phone");
  //     return;
  //   }

  //   // If the backend says user's next step is PAST photo, skip forward
  //   if (nextStep && nextStep !== "PROFILE_PHOTO_CAPTURED" && nextStep !== "LOCATION_CAPTURED") {
  //     const stepRoutes = {
  //       "KYC_INFO": "/onboarding/kyc",
  //       "KYC_COMPLETED": "/onboarding/physical",
  //       "PHYSICAL_PROFILE_QUESTIONS": "/onboarding/physical",
  //       "ACTIVE_USER": "/onboarding/home",
  //       "COMPLETED": "/onboarding/home",
  //       "HOME": "/onboarding/home",
  //       "ACTIVE": "/onboarding/home",
  //     };
  //     const route = stepRoutes[nextStep];
  //     if (route) {
  //       router.push(route);
  //       return;
  //     }
  //   }

  //   // Otherwise, user belongs on this page — let them stay
  //   setInitialLoading(false);
  // }, [router]);




// Check onboarding status on mount
  useEffect(() => {
    const initialize = async () => {
      try {
  
        const response = await userService.getOnboardingStatus();
        const state = response?.data?.data?.onboarding_state;
  
        const validStates = [
          'PROFILE_PHOTO_CAPTURED',
          'ACTIVITY_INTENT_CAPTURED',
          'PROFILE_DETAILS_CAPTURED'
        ];
  
        if (validStates.includes(state)) {
          const nextStep = response?.data?.next_required_step;
  
          if (nextStep) {
            const route = getRouteFromStep(nextStep);
            router.push(route);
          } else {
            router.push('/onboarding/activity');
          }
          return;
        }
  
        if (state !== 'LOCATION_CAPTURED') {
          const nextStep = response?.data?.next_required_step;
  
          if (nextStep) {
            const route = getRouteFromStep(nextStep);
            router.push(route);
          } else {
            router.push('/onboarding/location');
          }
          return;
        }
  
        // ✅ FETCH PROFILE PHOTO SCREEN CONFIG
        const configRes = await userService.getScreenConfig("profile_photo");
  
        setScreenConfig(configRes?.data?.data?.screen);
  
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setInitialLoading(false);
      }
    };
  
    initialize();
  
  }, [router]);










  const handleFileSelect = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG or PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    clearError();
    // Reset uploaded URL for this slot when new file is selected
    const newUploadedUrls = [...uploadedUrls];
    newUploadedUrls[index] = null;
    setUploadedUrls(newUploadedUrls);

    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);

    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...photoPreviews];
      newPreviews[index] = e.target?.result;
      setPhotoPreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = [...photos];
    const newPreviews = [...photoPreviews];
    const newUploadedUrls = [...uploadedUrls];
    const newProgress = [...uploadProgress];
    newPhotos[index] = null;
    newPreviews[index] = null;
    newUploadedUrls[index] = null;
    newProgress[index] = false;
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
    setUploadedUrls(newUploadedUrls);
    setUploadProgress(newProgress);
    if (fileInputRefs[index].current) {
      fileInputRefs[index].current.value = '';
    }
  };

  const handleSubmit = async () => {
    const uploadedPhotos = photos.filter(Boolean);
    if (uploadedPhotos.length === 0) {
      setError('Please select at least one profile photo');
      return;
    }

    try {
      setUploading(true);
      setLoading(true);
      clearError();

      // Track all uploaded URLs
      const allUploadedUrls = [null, null, null];
      let firstPhotoUrl = null;

      // Process each photo that was selected
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (!photo) continue;

        // Skip if already uploaded (re-uploading the same file)
        if (uploadedUrls[i]) {
          allUploadedUrls[i] = uploadedUrls[i];
          if (!firstPhotoUrl) {
            firstPhotoUrl = uploadedUrls[i];
          }
          continue;
        }

        // Mark this slot as uploading
        const newProgress = [...uploadProgress];
        newProgress[i] = true;
        setUploadProgress(newProgress);

        try {
          // Step 1: Get presigned URL
          console.log("Profile photo is uploading...");
          console.log("Calling presign endpoint for photo index:", i);
          const fileName = `profile_${Date.now()}_${i}_${photo.name}`;
          const presignResponse = await userService.getPresignedUrl(fileName, photo);
          
          console.log("Presign endpoint response:", presignResponse);
          
          // Use wasabi_url as per API documentation (not file_url)
          const { upload_url, wasabi_url } = presignResponse.data.data;
          
          if (!wasabi_url) {
            console.warn('No wasabi_url in response, falling back to file_url');
          }
          
          const imageUrl = wasabi_url || presignResponse.data.data.file_url;

          // Step 2: Upload file to presigned URL
          await userService.uploadToPresigned(upload_url, photo, photo.type);

          // Store the uploaded URL
          allUploadedUrls[i] = imageUrl;
          if (!firstPhotoUrl) {
            firstPhotoUrl = imageUrl;
          }

          // Mark this slot as complete
          const completedProgress = [...uploadProgress];
          completedProgress[i] = false; // Reset to show completion
          setUploadProgress(completedProgress);

        } catch (uploadErr) {
          console.error(`Error uploading photo ${i}:`, uploadErr);
          // Continue with other photos rather than failing completely
          const resetProgress = [...uploadProgress];
          resetProgress[i] = false;
          setUploadProgress(resetProgress);
        }
      }

      // Now save all photos to the backend
      // First photo becomes primary automatically
      let lastResponse = null;
      for (let i = 0; i < allUploadedUrls.length; i++) {
        const imageUrl = allUploadedUrls[i];
        if (!imageUrl) continue;

        try {
          const response = await userService.updateProfilePhoto(imageUrl);
          lastResponse = response;
          console.log(`Photo ${i} saved:`, response.data);
        } catch (saveErr) {
          console.error(`Error saving photo ${i}:`, saveErr);
          
          const errorCode = saveErr.response?.data?.error_code;
          const status = saveErr.response?.status;

          // Handle specific face validation errors
          if (errorCode === 'FACE_NOT_DETECTED') {
            setError('No face detected. Please upload a photo with your face visible.');
            setUploading(false);
            setLoading(false);
            return;
          } else if (errorCode === 'MULTIPLE_FACES') {
            setError('Multiple faces detected. Please upload a photo with only your face.');
            setUploading(false);
            setLoading(false);
            return;
          } else if (errorCode === 'LOW_FACE_CONFIDENCE') {
            setError('Could not verify your face. Please upload a clearer photo.');
            setUploading(false);
            setLoading(false);
            return;
          } else if (status === 400) {
            // State mismatch - get next step from response
            const nextStep = saveErr.response?.data?.next_required_step;
            if (nextStep) {
              const route = getRouteFromStep(nextStep);
              router.push(route);
              return;
            }
          }

          // Generic error handling
          const message = getErrorMessage(errorCode) || 'Failed to save photo. Please try again.';
          setError(message);
          setUploading(false);
          setLoading(false);
          return;
        }
      }

      // Navigate based on next_required_step from the API response
      const nextStep = lastResponse?.data?.next_required_step || 'ACTIVITY_INTENT';
      
      // Simple push to activity page after photo upload
      // The activity page will handle KYC screen visibility check
      router.push('/onboarding/activity');

    } catch (err) {
      console.error('Profile photo upload error:', err);
      
      const errorCode = err.response?.data?.error_code;
      const status = err.response?.status;

      // Handle authentication errors
      if (status === 401) {
        window.location.href = '/login';
        return;
      }

      // Handle 403 or FORBIDDEN - skip to next step (user already has photo set)
      if (status === 403 || errorCode === 'FORBIDDEN') {
        console.log("Got 403/FORBIDDEN on photo upload - skipping to next step");
        const nextStep = sessionStorage.getItem("onboarding_next_step");
        if (nextStep && nextStep !== "PROFILE_PHOTO_CAPTURED") {
          const route = getRouteFromStep(nextStep);
          if (route) {
            router.push(route);
            return;
          }
        }
        // Default skip to KYC
        sessionStorage.setItem("onboarding_next_step", "KYC_COMPLETED");
        router.push('/onboarding/kyc');
        return;
      }

      // Handle specific face validation errors
      if (errorCode === 'FACE_NOT_DETECTED') {
        setError('No face detected. Please upload a photo with your face visible.');
      } else if (errorCode === 'MULTIPLE_FACES') {
        setError('Multiple faces detected. Please upload a photo with only your face.');
      } else if (errorCode === 'LOW_FACE_CONFIDENCE') {
        setError('Could not verify your face. Please upload a clearer photo.');
      } else {
        const message = getErrorMessage(errorCode) || 'Failed to upload photo. Please try again.';
        setError(message);
      }
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  // const handleSkip = () => {
  //   router.push('/onboarding/activity');
  // };

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

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        {/* <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => router.push('/onboarding/location')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[60%]" />
          </div>
        </div> */}

        {/* Content */}
        <div className="space-y-6">
         <div className="text-center">
          <h1 className="text-3xl font-bold">
  {screenConfig?.title
    ?.split(" ")
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
        {/* <p className="mt-2 text-gray-400 text-sm font-Poppins">
        {screenConfig?.subtitle}
       </p> */}
       <p className="mt-2 text-gray-400 text-sm font-Poppins">
        {screenConfig?.description}
       </p>
          </div>
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-sm py-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Main large photo slot (center) */}
          <div className="flex justify-center">
            <div className="relative">
              {photoPreviews[0] ? (
                <div className="relative w-44 h-52 rounded-2xl overflow-hidden border-2 border-pink-500">
                  <img
                    src={photoPreviews[0]}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                  {uploadProgress[0] && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    </div>
                  )}
                  {!uploadProgress[0] && uploadedUrls[0] && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemovePhoto(0)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
  onClick={() => fileInputRefs[0].current?.click()}
  className="w-44 h-52 rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 p-[1px] cursor-pointer"
>
  <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center transition-colors">
    <div className="flex flex-col items-center gap-2">
      {/* Person icon */}
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="16" r="10" fill="#6b7280" />
        <ellipse cx="24" cy="38" rx="16" ry="10" fill="#6b7280" />
      </svg>
    </div>
  </div>
</div>
              )}
              {/* Camera badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center border-2 border-black">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Two smaller photo slots */}
          <div className="flex gap-4 justify-center pt-2 font-Poppins ">
            {[1, 2].map((index) => (
              <div key={index} className="relative">
                {photoPreviews[index] ? (
                  <div className="relative w-36 h-40 rounded-2xl overflow-hidden border-2 border-pink-500/60">
                    <img
                      src={photoPreviews[index]}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {uploadProgress[index] && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                      </div>
                    )}
                    {!uploadProgress[index] && uploadedUrls[index] && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRefs[index].current?.click()}
                    className="w-36 h-40 rounded-2xl border-2 border-dotted border-[#F97317]/60 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors gap-2"
                  >
                    {/* Person icon */}
                    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="16" r="10" fill="#6b7280" />
                      <ellipse cx="24" cy="38" rx="16" ry="10" fill="#6b7280" />
                    </svg>
                    <span className="text-gray-400 text-xs">{screenConfig?.option_labels?.upload_photo || "Upload Photo"}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hidden file inputs */}
          {[0, 1, 2].map((index) => (
            <input
              key={index}
              ref={fileInputRefs[index]}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, index)}
              className="hidden"
            />
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="w-full py-4 rounded-full font-Poppins font-normal bg-gradient-to-r from-pink-500 to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              screenConfig?.button_text?.primary || "Get Started"
            )}
          </button>

          {/* <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Skip for now
          </button> */}
        </div>
      </div>
    </div>
  );
}
