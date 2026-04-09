"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getQuestionnaireSession,
  startQuestionnaireSession,
  getCategoryIntro,
  getCategoryItems,
  getItemQuestions,
  submitAnswer,
  saveSelection,
  completeQuestionnaire,
  getCategoryCompletion,
} from "@/lib/api/categoryApi";
import SportProgressBar from "@/app/components/SportProgressBar";

export default function CategorySelection() {
  const router = useRouter();

  // Token state - initialized after component mounts
  const [token, setToken] = useState(null);

  // Initialize token on mount
  useEffect(() => {
    const storedToken = typeof window !== "undefined" 
      ? sessionStorage.getItem("accessToken") 
      : null;
    setToken(storedToken);
  }, []);

  const [sessionId, setSessionId] = useState(null);
  const [currentCategoryKey, setCurrentCategoryKey] = useState(null);

  const [introData, setIntroData] = useState(null);
  const [itemsData, setItemsData] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentItemKey, setCurrentItemKey] = useState(null);
  const [qIndex, setQIndex] = useState(0);

  const [screen, setScreen] = useState("loading");
  const [showPopup, setShowPopup] = useState(false);
  
  // Popup states for dynamic messages
  const [noQuestionsPopup, setNoQuestionsPopup] = useState(null); // { itemName, itemKey }
  const [itemCompletedPopup, setItemCompletedPopup] = useState(null); // { itemName, itemKey }

  // Track completed categories for visual indication
  const [completedCategories, setCompletedCategories] = useState([]);
  
  // Store full session data for tracking item completion status
  const [sessionData, setSessionData] = useState(null);

  const [progressPercentage, setProgressPercentage] = useState(0);
const [pendingCoins, setPendingCoins] = useState(0);

const [selectedOption, setSelectedOption] = useState(null);
const [remainingSlots, setRemainingSlots] = useState(null);

const [completionData, setCompletionData] = useState(null);

 // ✅ ADD HERE
  const completedItemsCount =
    itemsData?.items?.filter(
      (item) => item.status === "completed" || item.is_completed
    ).length || 0;

  const remainingItems =
    itemsData?.max_selection - completedItemsCount;

const [rewardScreen, setRewardScreen] = useState(false);
const [earnedCoins, setEarnedCoins] = useState(0);

const colorPalette = [
  { card: "from-[#1B5CD1] to-[#1EB9EC]", hover: "hover:bg-[#1EB9EC]" },
  { card: "from-[#9333EA] to-[#6366F1]", hover: "hover:bg-[#6366F1]" },
  { card: "from-[#14B8A6] to-[#22C55E]", hover: "hover:bg-[#22C55E]" },
];

const gradient = colorPalette[qIndex % colorPalette.length];

  /* ================= INIT ================= */

  useEffect(() => {
    initialize();
  }, []);

  
async function initialize() {
  try {
    // Get token directly from sessionStorage for immediate use
    const authToken =
      typeof window !== "undefined"
        ? sessionStorage.getItem("accessToken")
        : null;
    
    setScreen("loading");

    console.log("=== INITIALIZE QUESTIONNAIRE ===");

    let session = null;

    /* ===============================
       STEP 1: CHECK EXISTING SESSION
    =============================== */

    try {
      console.log("Checking existing session...");
      session = await getQuestionnaireSession(authToken);

      if (session) {
        console.log("Existing session found:", session);
      } else {
        console.log("No existing session");
      }
    } catch (err) {
      console.log("Session check failed:", err.message);
    }

    /* ===============================
       STEP 2: RESUME EXISTING SESSION
    =============================== */

    if (session && session.session_id) {
      console.log(">>> RESUMING SESSION");

      setSessionId(session.session_id);
      setSessionData(session); // Store full session data
      if (session?.overall_progress?.percentage === 100) {
  console.log("All preference categories already completed");

  // Complete questionnaire to update state to QUESTIONNAIRE_COMPLETED
  try {
    await completeQuestionnaire(authToken, session.session_id);
    console.log("Questionnaire completed successfully");
  } catch (completeErr) {
    console.error("Error completing questionnaire:", completeErr);
  }

  router.push("/onboarding/experience");
  return;
}

      // DEBUG: Log full session data
      console.log('=== DEBUG: Full session data ===');
      console.log('current_category_key:', session.current_category_key);
      console.log('categories_progress:', session.categories_progress);
      console.log('completed_categories:', session.completed_categories);
      console.log('all_session_data:', JSON.stringify(session, null, 2));
      console.log('=== End session data ===');

    let categoryToLoad = session.current_category_key;

if (session.categories_progress?.length) {

  const completedKeys = session.categories_progress
    .filter(c => c.completed === true)
    .map(c => c.category_key);

  setCompletedCategories(completedKeys);

  // DEBUG: Log each category's progress
  console.log('=== Category Progress Details ===');
  session.categories_progress.forEach(cat => {
    console.log(`${cat.category_key}: percentage=${cat.percentage}%, selected=${cat.selected_items?.length}, completed=${cat.completed_items?.length}, in_progress=${cat.in_progress_item}`);
  });
  console.log('=== End Category Progress ===');

  // find next incomplete category (percentage < 100)
  // This handles both cases: categories with completed=false AND categories with percentage < 100
  const nextCategory = session.categories_progress.find(
    c => c.percentage < 100
  );

  if (nextCategory) {
    console.log('Next incomplete category:', nextCategory.category_key);
    categoryToLoad = nextCategory.category_key;
  }
}
      // Also check completed_categories array
      else if (session.completed_categories?.length) {
        console.log('Completed categories from session:', session.completed_categories);
        setCompletedCategories(session.completed_categories);
        
        // If current category is in completed list, try to find next category
        if (session.completed_categories.includes(session.current_category_key)) {
          console.log('Current category is completed, need to find next');
          // TODO: Get next category - would need another API call or from categories_progress
        }
      }

      setCurrentCategoryKey(categoryToLoad);

      const currentStage = session.current_stage;
      const currentItem = session.current_item_key;

      console.log("Resume info:", {
        categoryToLoad,
        currentStage,
        currentItem,
      });

      /* Resume question if user was answering */
      if (currentItem && currentStage === "answering_questions") {
        await resumeItemQuestions(categoryToLoad, currentItem, session.session_id);
        return;
      }

      /* Otherwise load category intro */
      await loadIntro(categoryToLoad);
      return;
    }

    /* ===============================
       STEP 3: START NEW SESSION
    =============================== */

    console.log(">>> STARTING NEW SESSION");

    const newSession = await startQuestionnaireSession(authToken, false);
    console.log('[CategorySelection] New session created:', newSession);
    
    // After starting session, get full session details with session_id
    // This follows the API doc: Get Session Status with session_id
    const sessionDetails = await getQuestionnaireSession(authToken, newSession.session_id);
    console.log('[CategorySelection] Session details:', sessionDetails);
    
    // Use the session details
    const sessionToUse = sessionDetails || newSession;
    setSessionId(sessionToUse.session_id);
    setCurrentCategoryKey(sessionToUse.current_category_key);

    await loadIntro(sessionToUse.current_category_key);

  } catch (err) {
    console.error("Initialize error:", err);
    
    // Check if error is due to physical profile not complete
    const errorData = err.response?.data || err.data;
    if (errorData?.error_code === 'PHYSICAL_PROFILE_REQUIRED') {
      console.log('[CategorySelection] Physical profile required, redirecting to /onboarding/physical');
      router.push('/onboarding/physical');
      return;
    }
    
    setScreen("error");
  }
}
  /* ================= RESUME ITEM QUESTIONS ================= */
  
  async function resumeItemQuestions(categoryKey, itemKey, sessionIdOverride = null) {
    try {
      // Use passed sessionId or fall back to state
      const activeSessionId = sessionIdOverride || sessionId;
      
      console.log('[resumeItemQuestions] Using sessionId:', activeSessionId);
      
      setCurrentCategoryKey(categoryKey);
      setCurrentItemKey(itemKey);
      
      // Get category items first (to show which item was being answered)
      const itemsRes = await getCategoryItems(categoryKey, activeSessionId);
      setItemsData(itemsRes);
      
      // Get questions for the item
      const data = await getItemQuestions(token, itemKey, activeSessionId);
      
      let questionsList = [];
      if (data.questions) {
        questionsList = data.questions;
      } else if (Array.isArray(data)) {
        questionsList = data;
      } else if (data.data?.questions) {
        questionsList = data.data.questions;
      }
      
      // Get current question index from session
      let qIndex = 0;
      try {
        const session = await getQuestionnaireSession(token, activeSessionId);
        if (session && session.current_question_index) {
          qIndex = session.current_question_index;
          console.log('[resumeItemQuestions] Resuming from question index:', qIndex);
        }
      } catch (e) {
        console.log('[resumeItemQuestions] Could not get session for qIndex');
      }
      
     setQuestions(questionsList);

if (qIndex >= questionsList.length) {
  console.warn("Question index exceeded questions length, resetting");

  setCurrentItemKey(null);
  setScreen("items");
  return;
}

setQIndex(qIndex);
setScreen("questions");
    } catch (err) {
      console.error('Failed to resume item questions:', err);
      // Fallback to loading intro
      await loadIntro(categoryKey);
    }
  }

  /* ================= INTRO ================= */

  async function loadIntro(categoryKey) {
    try {
      const intro = await getCategoryIntro(categoryKey);
      setIntroData(intro);
      
      // Get progress percentage from category progress
      if (sessionData?.categories_progress) {
        const currentCatProgress = sessionData.categories_progress.find(
          c => c.category_key === categoryKey
        );
        if (currentCatProgress?.percentage !== undefined) {
          setProgressPercentage(currentCatProgress.percentage);
        }
      }
      
      setScreen("intro");
      
      // Don't auto-load items - show "Continue" button instead
      // This ensures user sees the intro content
    } catch (err) {
      console.error("Intro error:", err);
      // If intro fails, still load items
      loadItems(categoryKey);
    }
  }

  // Manual continue from intro - explicit user action
  function handleIntroContinue() {
    loadItems(currentCategoryKey);
  }

  /* ================= LOAD ITEMS ================= */

  async function loadItems(categoryKey) {
    try {
      const data = await getCategoryItems(categoryKey, sessionId);
      setItemsData(data);
      setScreen("items");
    } catch (err) {
      console.error("Failed to load items:", err);
      // Show error but still allow user to see items
      setItemsData({ items: [], category_title: categoryKey, max_selection: 0 });
      setScreen("items")
    }
  }

  // Handle back from questions - show completed item popup if applicable
  function handleBackToItems() {
    // Check if current item was completed (no questions or all questions answered)
    if (currentItemKey && itemsData?.items) {
      const currentItem = itemsData.items.find(i => i.key === currentItemKey);
      if (currentItem && currentItem.status === 'completed') {
        const itemDisplayName = getItemDisplayName(currentItem);
        setItemCompletedPopup({
          itemName: itemDisplayName,
          itemKey: currentItemKey
        });
        // Auto-hide popup after 2 seconds
        setTimeout(() => setItemCompletedPopup(null), 2000);
      }
    }
    setScreen("items");
  }

  /* ================= ITEM CLICK ================= */

  // Helper function to get item display name from API response
  function getItemDisplayName(item) {
    return item.title || item.name || item.key;
  }

async function handleItemClick(itemKey) {
  // Get item name first (available for error handling)
  const clickedItem = itemsData?.items?.find(i => i.key === itemKey);
  const itemDisplayName = getItemDisplayName(clickedItem);
  
  try {
    setCurrentItemKey(itemKey);

    // FIRST get questions
    const data = await getItemQuestions(token, itemKey, sessionId);

    let questionsList = [];

    if (data.questions) questionsList = data.questions;
    else if (Array.isArray(data)) questionsList = data;
    else if (data.data?.questions) questionsList = data.data.questions;

    console.log('[loadItemQuestions] Questions loaded:', questionsList.length);
    console.log('[loadItemQuestions] Questions data:', data);

    // 🚨 NO QUESTIONS CASE - go back to items and don't count this item
   if (!questionsList || questionsList.length === 0) {

  console.warn("Backend returned no questions but item expected to have questions");

  setCurrentItemKey(null);
  setScreen("items");

  return;
}

    // SAVE selection ONLY if questions exist
    await saveSelection(token, sessionId, currentCategoryKey, itemKey);

    // Set progress percentage from the response data
    if (data.progress_percentage !== undefined) {
      setProgressPercentage(data.progress_percentage);
    }

    setQuestions(questionsList);
    setQIndex(0);
    setScreen("questions");

  } catch (err) {
    console.error("Question error:", err);
    
    // Check if item is already completed
    const errorMessage = err.message || "";
    if (errorMessage.includes("already completed") || errorMessage.includes("ITEM_ALREADY_COMPLETED")) {
      setItemCompletedPopup({
        itemName: itemDisplayName,
        itemKey: itemKey,
      });
      setTimeout(() => setItemCompletedPopup(null), 2500);
      setCurrentItemKey(null);
      return;
    }
    
    // Show generic error for other cases
    alert("Failed to load questions. Please try again.");
  }
}

  /* ================= SUBMIT ANSWER ================= */

  async function handleAnswer(optionId) {
    // Safety check
    if (!questions || questions.length === 0 || !questions[qIndex]) {
      console.error('No questions available');
      setScreen("items");
      return;
    }
    
    const question = questions[qIndex];

    // Store session info in local variables at the start to avoid state issues
    const sessionIdAtCompletion = sessionId;
    const categoryKeyAtCompletion = currentCategoryKey;
    const itemKeyAtCompletion = currentItemKey;
    
    try {
      // CRITICAL: Ensure we use the correct currentItemKey that was set when loading questions
      // This item_key must match what was used in getItemQuestions
      console.log('Submitting answer with:', {
        session_id: sessionIdAtCompletion,
        category_key: categoryKeyAtCompletion,
        item_key: itemKeyAtCompletion,
        question_id: question.question_id
      });
      
   
      

      const submitRes = await submitAnswer(token, {
  session_id: sessionIdAtCompletion,
  category_key: categoryKeyAtCompletion,
  item_key: itemKeyAtCompletion,
  question_id: question.question_id,
  selected_option_ids: [optionId],
});

// update progress
if (submitRes?.item_progress?.percentage !== undefined) {
  setProgressPercentage(submitRes.item_progress.percentage);
}

// update coins
if (submitRes?.reward?.pending_coins !== undefined) {
  setPendingCoins(submitRes.reward.pending_coins);
}

// update remaining items
if (submitRes?.remaining_slots !== undefined) {
  setRemainingSlots(submitRes.remaining_slots);
}

// update progress %
if (submitRes?.item_progress?.percentage !== undefined) {
  setProgressPercentage(submitRes.item_progress.percentage);
}

// update earned coins
if (submitRes?.reward?.pending_coins !== undefined) {
  setPendingCoins(submitRes.reward.pending_coins);
}

      console.log('Submit answer response:', submitRes);

      // Check if item is complete based on response
      const isItemComplete = submitRes?.item_complete === true;
      const isCategoryComplete = submitRes?.category_complete === true;
      const nextAction = submitRes?.next_action;
      const nextCategoryKey = submitRes?.next_category_key;
      
      // DEBUG: Log all values from response
      console.log('=== DEBUG: Category Completion ===');
      console.log('Full submitRes:', JSON.stringify(submitRes, null, 2));
      console.log('isItemComplete:', isItemComplete);
      console.log('isCategoryComplete:', isCategoryComplete);
      console.log('nextAction:', nextAction);
      console.log('nextCategoryKey:', nextCategoryKey);
      console.log('qIndex:', qIndex);
      console.log('questions.length:', questions.length);
      console.log('=================================');

      // Next question inside same item (if item not complete yet)
      if (!isItemComplete && qIndex < questions.length - 1) {
        setQIndex((prev) => prev + 1);
        return;
      }

      // ===== ITEM COMPLETED - All questions answered =====
      console.log('All questions answered for item:', itemKeyAtCompletion);
      console.log('Session info - sessionId:', sessionIdAtCompletion, 'categoryKey:', categoryKeyAtCompletion);
      
      // Go directly to next category intro (skip completion screen with coins)
      if (submitRes?.category_complete) {
        const nextCategoryKey = submitRes?.next_category_key;
        
        if (nextCategoryKey) {
          setCurrentItemKey(null);
          setCurrentCategoryKey(nextCategoryKey);

          const nextIntro = await getCategoryIntro(nextCategoryKey);
          setIntroData(nextIntro);
          setScreen("intro");
        } else {
          // All categories complete - redirect to experience
          router.push("/onboarding/experience");
        }
        return;
      }
      
      if (isCategoryComplete && !nextCategoryKey) {
        console.log('All categories complete! Going to experience');

        // Complete questionnaire to update state to QUESTIONNAIRE_COMPLETED
        try {
          const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
          await completeQuestionnaire(token, sessionIdAtCompletion);
          console.log("Questionnaire completed successfully");
        } catch (completeErr) {
          console.error("Error completing questionnaire:", completeErr);
        }

        console.log("Redirecting to /onboarding/experience (second location)...");
        // Use window.location for more reliable redirect
        if (typeof window !== 'undefined') {
          window.location.href = '/onboarding/experience';
        } else {
          router.push("/onboarding/experience");
        }
        console.log("After router.push (second) - this should not appear if redirect works");
        return;
      }

      // If category is not complete, refresh the items list
      console.log('Category not complete, refreshing category data...');
      
      // Small delay to ensure backend processes everything
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Calling getCategoryItems with:', { categoryKey: categoryKeyAtCompletion, sessionId: sessionIdAtCompletion });
      
      const refreshed = await getCategoryItems(
        categoryKeyAtCompletion,
        sessionIdAtCompletion
      );

      // Refresh session data to get updated completion status
      try {
        const updatedSession = await getQuestionnaireSession(token, sessionIdAtCompletion);
        if (updatedSession) {
          setSessionData(updatedSession);
          console.log('[WORKAROUND] Updated sessionData from API');
        }
      } catch (e) {
        console.log('[WORKAROUND] Could not refresh sessionData:', e);
      }

      console.log('Raw refresh response:', refreshed);

      // DEBUG: Log each item to see structure
      console.log('=== DEBUG: Items structure ===');
      if (refreshed.items && Array.isArray(refreshed.items)) {
        refreshed.items.forEach((item, idx) => {
          console.log(`Item ${idx}:`, JSON.stringify(item));
        });
      }
      console.log('=== End Items structure ===');

      console.log('Refreshed category data:', refreshed);

      // DEBUG: Log all fields
      console.log('=== DEBUG: After getCategoryItems ===');
      console.log('selected_count:', refreshed.selected_count);
      console.log('completed_count:', refreshed.completed_count);
      console.log('max_selection:', refreshed.max_selection);
      console.log('completed_items:', refreshed.completed_items);
      console.log('category_complete:', refreshed.category_complete);
      console.log('next_category_key:', refreshed.next_category_key);
      console.log('=====================================');

      // Check various fields to determine completion status
      const selectedCount = refreshed.selected_count;
      const completedCount = refreshed.completed_count;
      const maxSelection = refreshed.max_selection;
      const completedItems = refreshed.completed_items || [];
      const categoryComplete = refreshed.category_complete;

      console.log('Counts - Selected:', selectedCount, 'Completed:', completedCount, 'Max:', maxSelection);
      console.log('Completed items:', completedItems);
      console.log('Category complete:', categoryComplete);

      // ===== WORKAROUND: Use sessionData to get correct completion status =====
      // The getCategoryItems API doesn't return correct completion status
      // So we get it from sessionData which has the correct info
      let effectiveCompletedCount = completedCount || completedItems.length || 0;
      let effectiveSelectedCount = selectedCount;
      
      // Get current category's progress from session data
      if (sessionData && sessionData.categories_progress) {
        const currentCatProgress = sessionData.categories_progress.find(
          c => c.category_key === currentCategoryKey
        );
        
        if (currentCatProgress) {
          const sessionCompletedItems = currentCatProgress.completed_items || [];
          const sessionSelectedItems = currentCatProgress.selected_items || [];
          
          console.log('[WORKAROUND] Session progress for', currentCategoryKey, ':');
          console.log('  selected_items:', sessionSelectedItems);
          console.log('  completed_items:', sessionCompletedItems);
          console.log('  percentage:', currentCatProgress.percentage);
          
          // Use session data if API returned incorrect data
          if (effectiveCompletedCount === 0 && sessionCompletedItems.length > 0) {
            effectiveCompletedCount = sessionCompletedItems.length;
            console.log('[WORKAROUND] Using session completed count:', effectiveCompletedCount);
          }
          if (effectiveSelectedCount === 0 && sessionSelectedItems.length > 0) {
            effectiveSelectedCount = sessionSelectedItems.length;
            console.log('[WORKAROUND] Using session selected count:', effectiveSelectedCount);
          }
        }
      }
      
      console.log('Effective counts - Selected:', effectiveSelectedCount, 'Completed:', effectiveCompletedCount, 'Max:', maxSelection);
      
      // ===== Check if max items reached (workaround for backend not returning correct data) =====
      // If we've completed items in this session (based on the response), check for next category
      if (effectiveCompletedCount >= maxSelection || categoryComplete) {
        console.log('Max items completed or category complete, checking for next category...');
        
        // Try to get next category from session status
        let nextCatKey = null;
        try {
          const sessionData = await getQuestionnaireSession(token, sessionId);
          console.log('Session data for next category:', sessionData);
          
          if (sessionData && sessionData.next_category_key) {
            console.log('Found next category from session:', sessionData.next_category_key);
            nextCatKey = sessionData.next_category_key;
          }
          
          // Also check for next_category in response
          if (!nextCatKey && refreshed.next_category_key) {
            console.log('Found next category from refresh:', refreshed.next_category_key);
            nextCatKey = refreshed.next_category_key;
          }
        } catch (err) {
          console.log('Error getting session for next category:', err);
        }
        
        // If there's a next category, skip completion screen and go directly to next category intro
        if (nextCatKey) {
          setCurrentCategoryKey(nextCatKey);
          const nextIntro = await getCategoryIntro(nextCatKey);
          setIntroData(nextIntro);
          setScreen("intro");
          return;
        }
        
        // If we still can't find next category but max items reached, all categories are done
        if (effectiveCompletedCount >= maxSelection) {
          console.log('Max items completed but no next category found - all categories are done');
          // Go directly to experience (skip completion screen)
          router.push("/onboarding/experience");
          return;
        }
      }
      
      // ===== CASE 1: Category NOT complete =====
      // Either we haven't selected max items yet, or category is not complete
      if (!categoryComplete && effectiveCompletedCount < maxSelection) {
        console.log('Category not complete, showing items');
        setItemsData(refreshed);
        setScreen("items");
        return;
      }

      // Default: return to items screen
      console.log('Default: showing items screen');
      setItemsData(refreshed);
      setScreen("items");
    }
        
    catch (err) {
      console.error("Submit answer error:", err);
      alert("Failed to save answer. Please try again.");
    }
  }

  /* ================= UI ================= */

  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-pink-500 text-xl mb-2">Loading...</div>
          <p className="text-gray-400 text-sm">Setting up your preferences</p>
        </div>
      </div>
    );
  }

  if (screen === "error") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="text-red-500 text-5xl mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-center mb-6">Failed to load questionnaire. Please try again.</p>
        <button
          onClick={() => initialize()}
          className="px-8 py-3 bg-pink-500 rounded-full text-white font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative">

      {/* INTRO */}
      {screen === "intro" && introData && (
        <div className="max-w-md w-full flex flex-col  text-center justify-center items-center space-y-6">
          {/* Overlay text - above the image */}
          {/* {introData?.intro?.title_text && (
            <div className="px-4">
              {(() => {
                const title = introData?.intro?.title_text || "Tell Us About Your Experience";
                const words = title.split(" ");
                const lastWord = words.pop();

                return (
                  <h1 className="text-white text-xl font-bold leading-tight">
                    {words.join(" ")}{" "}
                    <span className="bg-gradient-to-r from-orange-500 to-pink-400 bg-clip-text text-transparent">
                      {lastWord}
                    </span>
                  </h1>
                );
              })()}
            </div>
          )} */}

          {/* {introData?.intro?.media_url && (
            <img
              src={introData.intro.media_url}
              alt="intro"
              className=" w-[280px]  h-[430px]  rounded-3xl "
            />
          )} */}


{introData?.intro?.media_url && (
  <div className="relative w-[280px] h-[430px]">

    <img
      src={introData.intro.media_url}
      alt="intro"
      className="w-full h-full object-cover rounded-3xl"
    />

    {/* TEXT ON IMAGE */}
    {introData?.intro?.title_text && (
      <div className="absolute bottom-4 left-0 right-0 font-Poppins px-4 text-center">
        {(() => {
          const title = introData.intro.title_text;
          const words = title.split(" ");
          const lastWord = words.pop();

          return (
            <h1 className="text-white text-3xl font-bold ">
              {words.join(" ")}{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-400 bg-clip-text text-transparent">
                {lastWord}
              </span>
            </h1>
          );
        })()}
      </div>
    )}

  </div>
)}


          {introData?.intro?.subtitle_text && (
            <p className="text-white text-md font-Playfair Display ">
              {introData.intro.subtitle_text}
            </p>
          )}

          {/* Continue button - user must tap to proceed */}
          <button
            onClick={handleIntroContinue}
            className="w-80 text-white py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full font-Poppins font-semibold text-lg"
          >
            Get Started
          </button>
        </div>
      )}

      {/* ITEMS */}
      {screen === "items" && itemsData && (

<div className="flex flex-col space-y-6  "> 
  <h2 className="text-2xl font-semibold text-center">
            {itemsData.category_title}
           
          </h2>

       
<p className="text-center text-gray-400 font-Poppins">
  Select up to{" "}
  <span className="text-white font-Poppins">
    {itemsData?.max_selection} {itemsData?.category_title}
  </span>

  {(remainingSlots ?? itemsData?.max_selection) > 0 && (
    <span className="text-pink-400 ml-2">
      ({remainingSlots ?? itemsData?.max_selection} more remaining)
    </span>
  )}
</p>


        <div className=" grid grid-rows-2 grid-flow-col  gap-4 pt-10 font-Poppins">
          {itemsData.items.map((item) => (

<button
  key={item.key}
  disabled={
    item.disabled ||
    item.status === "completed" ||
    item.is_completed === true ||
    (sessionData?.categories_progress?.find(c => c.category_key === currentCategoryKey)?.completed_items?.includes(item.key))
  }
  onClick={() => handleItemClick(item.key)}
  className={`w-52 py-3 rounded-lg border transition flex items-center justify-center gap-2

  ${
    item.status === "completed" || 
    item.is_completed === true ||
    (sessionData?.categories_progress?.find(c => c.category_key === currentCategoryKey)?.completed_items?.includes(item.key))
      ? "bg-pink-700 border-pink-600 text-white cursor-not-allowed"
      : item.disabled
      ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
      : "border-[#ff02c8] hover:bg-[#ff03ea]"
  }
`}
>
  {item.icon || "🎯"} {item.title || item.name || item.key}

  {(item.status === "completed" || 
    item.is_completed === true ||
    (sessionData?.categories_progress?.find(c => c.category_key === currentCategoryKey)?.completed_items?.includes(item.key))) && (
    <span className="text-white font-bold">✓</span>
  )}
</button>

          ))}

        </div> 
        
        {/* POPUP: No questions for selected item */}
        {noQuestionsPopup && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            <p className="font-semibold">
              No questions under {noQuestionsPopup.itemName}. Choose another!
            </p>
          </div>
        )}
        
        {/* POPUP: Item completed - choose next */}
        {itemCompletedPopup && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            <p className="font-semibold">
              {itemCompletedPopup.itemName} is completed! Choose next item.
            </p>
          </div>
        )}
        
        </div>
      )}

      {/* QUESTIONS */}
    {screen === "questions" && questions && questions.length > 0 && (
  <div className="max-w-md absolute flex flex-col justify-center items-center w-full ">
<div className="relative top-4">
 <SportProgressBar
   percentage={questions[qIndex]?.progress_percentage || progressPercentage}
   pendingCoins={pendingCoins}
   colorStart={gradient.card.split(" ")[0].replace("from-[", "").replace("]", "")}
   colorEnd={gradient.card.split(" ")[1].replace("to-[", "").replace("]", "")}
 />
</div>
    {questions[qIndex] && qIndex < questions.length ? (
      <>
        <div className={`p-6 w-80 rounded-xl mb-2 bg-gradient-to-r ${gradient.card} text-lg text-white font-Poppins text-center`}>
          {/* Category Item Header inside question box */}
          {currentItemKey && (
            <div className="flex flex-col items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {itemsData?.items?.find(i => i.key === currentItemKey)?.icon || "🎯"}
                </span>
                <span className="text-lg font-semibold">
                  {getItemDisplayName(itemsData?.items?.find(i => i.key === currentItemKey))}
                </span>
              </div>
              <div className="w-full h-[0.5px] bg-gray-50 mt-2"></div>
            </div>
          )}
          {questions[qIndex].question_text}
        </div>

        {questions[qIndex].options &&
          questions[qIndex].options.map((opt) => (
            <button
              key={opt.option_id}
           onClick={() => {
  setSelectedOption(opt.option_id);
  handleAnswer(opt.option_id);
}}
             className={`w-80 py-3 mb-3 mt-2 border font-Poppins rounded-xl transition
${
  selectedOption === opt.option_id
    ? "bg-[#474746] border-[#DBD8D4] text-white"
    : `border-[#DBD8D4] ${gradient.hover}`
}`}
            >
              {opt.label}
            </button>
          ))}

        {/* <button
          onClick={() => handleBackToItems()}
          className="mt-4 text-gray-400 hover:text-white text-sm"
        >
          ← Back to Items
        </button> */}
      </>
    ) : (
      <div className="text-center text-gray-400">
        No questions available for this item
      </div>
    )}
  </div>
)}

      {/* No questions available */}
      {screen === "questions" && (!questions || questions.length === 0) && (
        <div className="max-w-md w-full text-center space-y-4">
          <p className="text-gray-400">No questions available for this item</p>
          <button
            onClick={() => {
              handleBackToItems();
            }}
            className="px-6 py-3 bg-pink-500 rounded-full"
          >
            Back to Items
          </button>
        </div>
      )}
      
      {/* POPUP: No questions for selected item (when back from questions screen) */}
      {noQuestionsPopup && screen !== "items" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <p className="font-semibold">
            No questions under {noQuestionsPopup.itemName}. Choose another!
          </p>
        </div>
      )}
      
      {/* POPUP: Item completed - choose next (when back from questions screen) */}
      {itemCompletedPopup && screen !== "items" && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <p className="font-semibold">
            {itemCompletedPopup.itemName} is completed! Choose next item.
          </p>
        </div>
      )}
    </div>
  );
}  