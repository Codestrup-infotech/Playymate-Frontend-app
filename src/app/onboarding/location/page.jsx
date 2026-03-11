"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, MapPin, Navigation } from 'lucide-react';
import { userService } from '@/services/user';
import { getErrorMessage } from '@/lib/api/errorMap';
import { getRouteFromStep } from '@/lib/api/navigation';
import { getOnboardingRedirect } from '@/lib/onboarding/stateMachine';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';

export default function OnboardingLocationPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const inputRef = useRef(null);
  const clearError = () => setError(null);

  // Google Places Hook
  const {
    predictions,
    isLoaded,
    error: placesError,
    getPredictions,
    selectPrediction,
    parseAddress,
    clearSelection,
  } = usePlacesAutocomplete(inputRef);

  // Auto request geolocation on mount
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

  // Check onboarding status on mount - redirect if not at correct step
  useEffect(() => {
    // ✅ Use stored next step — no API call needed
    const nextStep = sessionStorage.getItem("onboarding_next_step");
    const token = sessionStorage.getItem("access_token") || 
                  sessionStorage.getItem("accessToken") || 
                  localStorage.getItem("accessToken") ||
                  localStorage.getItem("playymate_access_token");

    if (!token) {
      router.push("/login/phone");
      return;
    }

    // If the backend says user's next step is PAST location, skip forward
    if (nextStep && nextStep !== "LOCATION_CAPTURED" && nextStep !== "LOCATION") {
      const stepRoutes = {
        "PROFILE_PHOTO_CAPTURED": "/onboarding/photo",
        "KYC_INFO": "/onboarding/kyc",
        "KYC_COMPLETED": "/onboarding/physical",
        "PHYSICAL_PROFILE_QUESTIONS": "/onboarding/physical",
        "ACTIVE_USER": "/onboarding/home",
        "COMPLETED": "/onboarding/home",
        "HOME": "/onboarding/home",
        "ACTIVE": "/onboarding/home",
      };
      const route = stepRoutes[nextStep];
      if (route) {
        router.push(route);
        return;
      }
    }

    // Otherwise, user belongs on this page — let them stay
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearError();

    if (value.length >= 3) {
      getPredictions(value);
    }
  };

  // Handle prediction selection
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

  // Handle detect location button
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    clearError();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setQuery('Current Location');
        setDetectingLocation(false);
      },
      (err) => {
        setError('Unable to detect location. Please search manually.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle confirm location
  const handleConfirmLocation = async () => {
    try {
      setLoading(true);
      clearError();

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

      // Navigate based on next_required_step
      const nextStep = response?.data?.next_required_step;
      if (nextStep) {
        const route = getRouteFromStep(nextStep);
        router.push(route);
      } else {
        // Default to profile photo
        router.push('/onboarding/photo');
      }

    } catch (err) {
      console.log("FULL LOCATION ERROR:", err?.response?.data);

      const status = err?.response?.status;
      const errorData = err?.response?.data;
      const errorCode = errorData?.error_code;
      const errorMessage = errorData?.message;

      if (status === 401) {
        window.location.href = "/login";
        return;
      }

      // Handle 403 or FORBIDDEN - skip to next step (user already has location set)
      if (status === 403 || errorCode === 'FORBIDDEN') {
        console.log("Got 403/FORBIDDEN on location update - skipping to next step");
        const nextStep = sessionStorage.getItem("onboarding_next_step");
        if (nextStep && nextStep !== "LOCATION_CAPTURED" && nextStep !== "LOCATION") {
          const route = getRouteFromStep(nextStep);
          if (route) {
            router.push(route);
            return;
          }
        }
        // Default skip to photo
        sessionStorage.setItem("onboarding_next_step", "PROFILE_PHOTO_CAPTURED");
        router.push('/onboarding/photo');
        return;
      }

      if (status === 400) {
        // Handle specific onboarding errors
        if (errorCode === 'ONBOARDING_INCOMPLETE') {
          // Get next step from response - check both locations
          const nextStep = errorData?.next_required_step;
          if (nextStep) {
            const route = getRouteFromStep(nextStep);
            console.log('Redirecting to:', route, 'due to:', errorMessage);
            router.push(route);
            return;
          }
          // Default redirect based on error message
          if (errorMessage?.includes('parent consent')) {
            router.push('/onboarding/parent-consent');
            return;
          }
        }

        // Handle INVALID_ONBOARDING_STATE - user is at wrong step, redirect based on next_required_step
        if (errorCode === 'INVALID_ONBOARDING_STATE') {
          console.log('Invalid state transition - fetching correct step');
          // Try to get next_required_step from error response
          const nextStep = errorData?.next_required_step;
          if (nextStep) {
            const route = getRouteFromStep(nextStep);
            console.log('Redirecting to:', route, 'due to invalid state');
            router.push(route);
            return;
          }
          // Fallback: fetch onboarding status to determine correct step
          try {
            const statusResponse = await userService.getOnboardingStatus();
            const currentState = statusResponse?.data?.data?.onboarding_state;
            const requiredStep = statusResponse?.data?.data?.next_required_step;
            console.log('Current state:', currentState, 'Required step:', requiredStep);
            
            if (requiredStep) {
              const route = getRouteFromStep(requiredStep);
              router.push(route);
              return;
            }
            // Fallback to state-based redirect
            if (currentState) {
              const route = getOnboardingRedirect(currentState);
              router.push(route);
              return;
            }
          } catch (statusErr) {
            console.error('Error fetching onboarding status:', statusErr);
          }
          // Ultimate fallback
          router.push('/onboarding/dob');
          return;
        }
        
        // Generic state mismatch → try to refresh
        const nextStep = errorData?.next_required_step;
        if (nextStep) {
          const route = getRouteFromStep(nextStep);
          router.push(route);
        } else {
          router.push('/onboarding/photo')
        }
        return;
      }

      setError(
        errorMessage ||
        "Failed to save location. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle skip
  // const handleSkip = () => {
  //   router.push('/onboarding/photo');
  // };

  // Map URL
  const mapUrl = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`
    : query
    ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
    : `https://www.google.com/maps?q=India&output=embed`;

  return (
    <> 
    <div className='bg-black flex justify-center items-center'> 
    <div className="min-h-screen py-4 w-96 bg-black text-white flex flex-col">
      {/* Header */}
      {/* <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => router.push('/onboarding/dob')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-500 to-orange-400 w-[50%]" />
        </div>
      </div> */}

      {/* Content */}
      <div className="flex-1 flex flex-col">
      

        {/* Error */}
        {error && (
          <div className="mx-4 flex items-center justify-center gap-2 text-red-400 text-sm py-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative mx-4 rounded-3xl overflow-hidden mb-6">
          <iframe
            src={mapUrl}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            allow="geolocation"
          />

          {/* Search Overlay */}
          <div className="absolute bottom-4 left-4 right-4 font-Poppins ">
            <div className="bg-black/90 backdrop-blur rounded-xl p-3 space-y-3">
              {/* Search Input */}
              <div className="relative">
                {/* <div className="flex items-center gap-2 border border-pink-500/40 rounded-lg px-3 py-2 bg-black/50">
                  <span className="text-gray-400">🔍</span>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search location..."
                    className="bg-transparent outline-none text-sm flex-1 text-white placeholder:text-gray-500"
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery("");
                        clearSelection();
                        setCoords(null);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div> */}

                {/* Predictions */}
                {predictions.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-900 rounded-lg max-h-40 overflow-y-auto">
                    {predictions.map((prediction) => (
                      <button
                        key={prediction.place_id}
                        onClick={() => handleSelectPrediction(prediction)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 text-white"
                      >
                        {prediction.description}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Places Error */}
              {placesError && (
                <p className="text-yellow-400 text-xs text-center">
                  {placesError}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleDetectLocation}
                  disabled={detectingLocation || loading}
                  className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {detectingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span>Detect</span>
                </button>
                <button
                  onClick={handleConfirmLocation}
                  disabled={loading || !coords}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 font-medium text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Skip Button */}
        {/* <div className="p-4">
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div> */}
      </div>
    </div> </div>
    </>
  );
}
