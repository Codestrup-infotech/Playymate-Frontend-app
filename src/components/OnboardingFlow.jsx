"use client";

import { useState, useEffect, useCallback } from "react";
import { onboardingService } from "@/services/onboarding";

export default function OnboardingFlow({ onComplete }) {
  const [screens, setScreens] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketingIndex, setMarketingIndex] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [trustAcknowledged, setTrustAcknowledged] = useState(false);

  // Generate unique session ID
  const generateSessionId = () => {
    return `onb_sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate device ID
  const getDeviceId = () => {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem('onboarding_device_id');
      if (!deviceId) {
        deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('onboarding_device_id', deviceId);
      }
      return deviceId;
    }
    return `web_unknown`;
  };

  // Start onboarding session
  const startSession = useCallback(async () => {
    try {
      const newSessionId = generateSessionId();
      const deviceId = getDeviceId();
      
      const response = await onboardingService.startSession({
        session_id: newSessionId,
        device_id: deviceId,
        platform: "web",
        metadata: {
          app_version: "1.0.0",
          locale: typeof navigator !== 'undefined' ? navigator.language : 'en'
        }
      });

      if (response.data?.status === "success") {
        setSessionId(newSessionId);
        setIsSessionStarted(true);
        console.log("Onboarding session started:", newSessionId);
      }
    } catch (err) {
      console.error("Error starting onboarding session:", err);
      // Continue even if session start fails - don't block user experience
    }
  }, []);

  // End onboarding session
  const endSession = useCallback(async (reason = "completed") => {
    if (!sessionId || !isSessionStarted) return;

    try {
      await onboardingService.endSession({
        session_id: sessionId,
        ended_at: new Date().toISOString(),
        metadata: {
          reason: reason
        }
      });
      console.log("Onboarding session ended:", reason);
      setIsSessionStarted(false);
    } catch (err) {
      console.error("Error ending onboarding session:", err);
    }
  }, [sessionId, isSessionStarted]);

  // Track screen view
  const trackScreenView = useCallback(async (screen, order) => {
    if (!sessionId || !isSessionStarted) return;

    try {
      await onboardingService.trackView(screen._id, {
        session_id: sessionId,
        order: order,
        platform: "web",
        occurred_at: new Date().toISOString(),
        metadata: {
          source: "carousel_swipe"
        }
      });
      console.log("Screen view tracked:", screen._id);
    } catch (err) {
      console.error("Error tracking screen view:", err);
    }
  }, [sessionId, isSessionStarted]);

  // Track CTA click
  const trackCtaClick = useCallback(async (ctaAction, screenType) => {
    if (!sessionId || !isSessionStarted) return;

    try {
      const currentScreen = screens[currentIndex];
      if (currentScreen?._id) {
        await onboardingService.trackCta(currentScreen._id, {
          session_id: sessionId,
          cta_action: ctaAction,
          occurred_at: new Date().toISOString(),
          metadata: {
            screen_type: screenType
          }
        });
        console.log("CTA click tracked:", ctaAction);
      }
    } catch (err) {
      console.error("Error tracking CTA click:", err);
    }
  }, [sessionId, isSessionStarted, screens, currentIndex]);

  // Track trust acknowledgment
  const trackTrustAck = useCallback(async () => {
    if (!sessionId || trustAcknowledged) return;

    try {
      await onboardingService.trackTrustAck({
        session_id: sessionId,
        acknowledged: true,
        occurred_at: new Date().toISOString(),
        metadata: {
          modal_version: "v1"
        }
      });
      setTrustAcknowledged(true);
      console.log("Trust acknowledgment recorded");
    } catch (err) {
      console.error("Error tracking trust acknowledgment:", err);
    }
  }, [sessionId, trustAcknowledged]);

  // Fetch screens and start session
  useEffect(() => {
    let mounted = true;
    
    const initializeOnboarding = async () => {
      if (mounted) {
        await startSession();
        fetchScreens();
      }
    };
    initializeOnboarding();
    
    return () => {
      mounted = false;
      if (isSessionStarted && sessionId) {
        endSession("user_unmounted");
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchScreens = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await onboardingService.getScreens();
      
      if (response.data?.status === "success") {
        // Sort screens by order
        const sortedScreens = (response.data.data.screens || []).sort(
          (a, b) => a.order - b.order
        );
        setScreens(sortedScreens);
      } else {
        setError(response.data?.message || "Failed to fetch onboarding screens");
      }
    } catch (err) {
      console.error("Error fetching onboarding screens:", err);
      setError(err.response?.data?.message || "Failed to load onboarding screens");
    } finally {
      setLoading(false);
    }
  };

  // Track view when screen changes
  useEffect(() => {
    if (screens.length > 0 && sessionId && isSessionStarted && currentIndex < screens.length) {
      const screen = screens[currentIndex];
      if (screen) {
        trackScreenView(screen, currentIndex + 1);
      }
    }
  }, [currentIndex, sessionId, isSessionStarted, screens]);

  const handleNext = async () => {
    // Track CTA click before navigation
    await trackCtaClick("next", screens[currentIndex]?.type || "default");
    
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Reset marketing index when moving to next section
      setMarketingIndex(0);
    } else {
      // Onboarding completed - end session
      await endSession("onboarding_completed");
      if (onComplete) {
        onComplete();
      }
    }
  };


  const handleOptionSelect = async (option) => {
    // Track option selection CTA
    await trackCtaClick(option?.value || "option_select", screens[currentIndex]?.type || "default");
    
    // Handle option selection if needed
    console.log("Selected option:", option);
    handleNext();
  };

  const handleCtaClick = async (cta) => {
    // Track CTA click
    await trackCtaClick(cta?.action || "cta_click", screens[currentIndex]?.type || "default");
    
    if (cta?.action) {
      // Handle CTA action
      console.log("CTA action:", cta.action);
      handleNext();
    } else {
      handleNext();
    }
  };

  const handleMarketingNext = async () => {
    // Track marketing CTA click
    await trackCtaClick("marketing_next", "marketing");
    
    const marketingScreens = screens.filter(s => s.type === "marketing");
    if (marketingIndex < marketingScreens.length - 1) {
      setMarketingIndex(marketingIndex + 1);
    } else {
      handleNext();
    }
  };

  // Get marketing screens
  const marketingScreens = screens.filter(s => s.type === "marketing");
  const currentMarketingScreen = marketingScreens[marketingIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <button
          onClick={fetchScreens}
          className="px-6 py-2 bg-white text-black rounded-full"
        >
          Retry
        </button>
      </div>
    );
  }

  if (screens.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">No onboarding screens available</div>
      </div>
    );
  }

  const currentScreen = screens[currentIndex];

  // Check if current screen is marketing type
  const isMarketingSection = currentScreen.type === "marketing" || marketingScreens.length > 0;
  
  // Check if current screen is trust/privacy type
  const isTrustScreen = currentScreen.type === "trust" || currentScreen.type === "privacy" || 
                        currentScreen.title?.toLowerCase().includes("privacy") ||
                        currentScreen.title?.toLowerCase().includes("trust") ||
                        currentScreen.subtitle?.toLowerCase().includes("privacy") ||
                        currentScreen.subtitle?.toLowerCase().includes("trust");

  // Handle trust acknowledgment
  const handleTrustAcknowledge = async () => {
    if (!trustAcknowledged) {
      await trackTrustAck();
    }
    handleNext();
  };

  // Render marketing slider
  const renderMarketingSlider = () => {
    if (!currentMarketingScreen) return null;

    return (
      <div className="flex flex-col items-center justify-center w-full">
        {/* Image with border */}
        {currentMarketingScreen.image_url && (
          <div className="mb-8 w-full max-w-md">
            <div className="border-4 border-orange-400 rounded-2xl overflow-hidden">
              <img
                src={currentMarketingScreen.image_url}
                alt={currentMarketingScreen.title}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        )}

        {/* Title */}
        {currentMarketingScreen.title && (
          <h1 className="text-3xl font-bold text-center mb-4 px-4">
            {currentMarketingScreen.title}
          </h1>
        )}

        {/* Subtitle */}
        {currentMarketingScreen.subtitle && (
          <p className="text-gray-400 text-center text-lg mb-8 px-4">
            {currentMarketingScreen.subtitle}
          </p>
        )}

        {/* Marketing dots pagination */}
        {marketingScreens.length > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {marketingScreens.map((_, index) => (
              <button
                key={index}
                onClick={() => setMarketingIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === marketingIndex
                    ? "bg-orange-400 w-8"
                    : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Screen content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        {/* Handle marketing type - show as slider */}
        {currentScreen.type === "marketing" ? (
          renderMarketingSlider()
        ) : (
          <>
            {/* Image for non-marketing screens */}
            {currentScreen.image_url && (
              <div className="mb-8">
                <img
                  src={currentScreen.image_url}
                  alt={currentScreen.title}
                  className="max-w-full h-auto object-contain"
                />
              </div>
            )}

            {/* Title */}
            {currentScreen.title && (
              <h1 className="text-3xl font-bold text-center mb-4">
                {currentScreen.title}
              </h1>
            )}

            {/* Subtitle */}
            {currentScreen.subtitle && (
              <p className="text-gray-400 text-center text-lg mb-8">
                {currentScreen.subtitle}
              </p>
            )}

            {/* Options */}
            {currentScreen.options && currentScreen.options.length > 0 && (
              <div className="w-full max-w-sm mb-8">
                {currentScreen.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className="w-full py-3 px-4 mb-3 rounded-lg border border-gray-600 
                             hover:border-orange-400 hover:bg-orange-400/10 transition-all text-left"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Button */}
      <div className="p-6">
        {/* Trust/Privacy acknowledgment checkbox */}
        {isTrustScreen && (
          <div className="flex items-center justify-center mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={trustAcknowledged}
                onChange={(e) => {
                  if (e.target.checked && !trustAcknowledged) {
                    trackTrustAck();
                  }
                }}
                className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-orange-400 
                         focus:ring-orange-400 focus:ring-offset-0 mr-3"
              />
              <span className="text-gray-400 text-sm">
                I agree to the Privacy Policy and Terms
              </span>
            </label>
          </div>
        )}
        
        {/* Marketing CTA */}
        {currentScreen.type === "marketing" ? (
          <button
            onClick={handleMarketingNext}
            className="w-full max-w-sm mx-auto block py-4 rounded-full 
                     bg-gradient-to-r from-pink-500 to-orange-400 text-lg font-semibold"
          >
            {marketingIndex === marketingScreens.length - 1 ? "Get Started" : "Next"}
          </button>
        ) : (
          <>
            {currentScreen.cta && (
              <button
                onClick={isTrustScreen ? handleTrustAcknowledge : () => handleCtaClick(currentScreen.cta)}
                disabled={isTrustScreen && !trustAcknowledged}
                className={`w-full max-w-sm mx-auto block py-4 rounded-full 
                         bg-gradient-to-r from-pink-500 to-orange-400 text-lg font-semibold
                         ${isTrustScreen && !trustAcknowledged ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {currentScreen.cta.text || "Continue"}
              </button>
            )}
            
            {!currentScreen.cta && currentScreen.type !== "splash" && (
              <button
                onClick={isTrustScreen ? handleTrustAcknowledge : handleNext}
                disabled={isTrustScreen && !trustAcknowledged}
                className={`w-full max-w-sm mx-auto block py-4 rounded-full 
                         bg-gradient-to-r from-pink-500 to-orange-400 text-lg font-semibold
                         ${isTrustScreen && !trustAcknowledged ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {currentIndex === screens.length - 1 ? "Get Started" : "Continue"}
              </button>
            )}
          </>
        )}

        {/* Pagination dots - show for non-marketing screens */}
        {currentScreen.type !== "marketing" && (
          <div className="flex justify-center mt-6 gap-2">
            {screens.map((screen, index) => {
              // Skip counting marketing screens individually in main pagination
              if (screen.type === "marketing") return null;
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-orange-400 w-6"
                      : "bg-gray-600"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
