import { useState, useEffect, useCallback } from "react";
import { getProfileCompletionStatus, getCurrentUserId, getUserProfile } from "@/services/profile.service";

export default function useProfileCompletion() {
  const [showCard, setShowCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState({
    username: true,
    profile_main_type: true,
    bio: true,
  });
  const [userData, setUserData] = useState({
    username: null,
    profile_main_type: null,
    bio: null,
  });

  const checkProfileCompletion = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get profile completion card status from feed API
      const card = await getProfileCompletionStatus();

      if (card && card.enabled) {
        setShowCard(true);
        setTasks(card.tasks || {
          username: true,
          profile_main_type: true,
          bio: true,
        });
      } else {
        setShowCard(false);
      }

      // Also fetch user profile data for display
      const userId = getCurrentUserId();
      if (userId) {
        try {
          const profile = await getUserProfile(userId);
          setUserData({
            username: profile.username || null,
            profile_main_type: profile.profile_main_type?.value || null,
            bio: profile.bio || null,
          });
        } catch (profileErr) {
          console.warn("Failed to fetch user profile:", profileErr);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile completion status:", err);
      setError(err);
      // Show card by default if API fails
      setShowCard(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkProfileCompletion();
  }, [checkProfileCompletion]);

  const refreshProfile = useCallback(async () => {
    await checkProfileCompletion();
  }, [checkProfileCompletion]);

  return {
    showCard,
    loading,
    error,
    tasks,
    userData,
    refreshProfile,
  };
}
