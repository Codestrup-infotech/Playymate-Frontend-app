"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  startQuestionnaireSession,
  getCategoryIntro,
  getCategoryItems,
  getItemQuestions,
  submitAnswer,
  saveSelection,
} from "@/lib/api/categoryApi";

export default function CategorySelection() {
  const router = useRouter();

  const [sessionId, setSessionId] = useState(null);
  const [currentCategoryKey, setCurrentCategoryKey] = useState(null);

  const [introData, setIntroData] = useState(null);
  const [itemsData, setItemsData] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentItemKey, setCurrentItemKey] = useState(null);
  const [qIndex, setQIndex] = useState(0);

  const [screen, setScreen] = useState("loading");
  const [showPopup, setShowPopup] = useState(false);

  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("access_token")
      : null;

  /* ================= INIT ================= */

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    try {
      setScreen("loading");
      
      const session = await startQuestionnaireSession(token, false);
      setSessionId(session.session_id);
      setCurrentCategoryKey(session.current_category_key);
      
      // Load the first category intro
      await loadIntro(session.current_category_key);
    } catch (err) {
      console.error("Initialize error:", err);
      setScreen("error");
    }
  }

  /* ================= INTRO ================= */

  async function loadIntro(categoryKey) {
    try {
      const intro = await getCategoryIntro(categoryKey);
      setIntroData(intro);
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

  /* ================= ITEM CLICK ================= */

  async function handleItemClick(itemKey) {
    try {
      // First, set the current item key (this is crucial for the context)
      setCurrentItemKey(itemKey);
      console.log('Item clicked:', itemKey);

      // CRITICAL: Call saveSelection BEFORE getting questions
      // This sets the session's current_item_key to this item
      const selectionRes = await saveSelection(token, sessionId, currentCategoryKey, itemKey);
      console.log('Save selection response:', selectionRes);

      // Now fetch questions - this will set the session context for this item
      const data = await getItemQuestions(token, itemKey, sessionId);
      console.log('Questions response:', data);

      // Handle different response structures
      let questionsList = [];
      if (data.questions) {
        questionsList = data.questions;
      } else if (Array.isArray(data)) {
        questionsList = data;
      } else if (data.data?.questions) {
        questionsList = data.data.questions;
      }
      
      console.log('Questions list:', questionsList);
      
      setQuestions(questionsList);
      setQIndex(0);
      setScreen("questions");
    } catch (err) {
      console.error("Question error:", err);
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
      
      console.log('Submit answer response:', submitRes);

      // Check if item is complete based on response
      const isItemComplete = submitRes?.item_complete === true;
      const isCategoryComplete = submitRes?.category_complete === true;
      const nextAction = submitRes?.next_action;
      const nextCategoryKey = submitRes?.next_category_key;
      
      console.log('Item complete from response:', isItemComplete);
      console.log('Category complete from response:', isCategoryComplete);
      console.log('Next action:', nextAction);
      console.log('Next category key:', nextCategoryKey);

      // Next question inside same item (if item not complete yet)
      if (!isItemComplete && qIndex < questions.length - 1) {
        setQIndex((prev) => prev + 1);
        return;
      }

      // ===== ITEM COMPLETED - All questions answered =====
      console.log('All questions answered for item:', itemKeyAtCompletion);
      console.log('Session info - sessionId:', sessionIdAtCompletion, 'categoryKey:', categoryKeyAtCompletion);
      
      // Show popup after item completed
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);

      // Use the submitAnswer response directly to determine next steps
      // This is more reliable than calling getCategoryItems
      if (isCategoryComplete && nextCategoryKey) {
        console.log('Category complete! Moving to next category:', nextCategoryKey);
        
        // Move to next category
        setCurrentCategoryKey(nextCategoryKey);
        
        // Load intro for next category
        try {
          const nextIntro = await getCategoryIntro(nextCategoryKey);
          console.log('Next category intro:', nextIntro);
          setIntroData(nextIntro);
        } catch (introErr) {
          console.error('Failed to load next intro:', introErr);
        }
        setScreen("intro");
        return;
      }
      
      if (isCategoryComplete && !nextCategoryKey) {
        console.log('All categories complete! Going to home');
        router.push("/home");
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

      console.log('Raw refresh response:', refreshed);

      console.log('Refreshed category data:', refreshed);

      // Check various fields to determine completion status
      const selectedCount = refreshed.selected_count;
      const completedCount = refreshed.completed_count;
      const maxSelection = refreshed.max_selection;
      const completedItems = refreshed.completed_items || [];
      const categoryComplete = refreshed.category_complete;

      console.log('Counts - Selected:', selectedCount, 'Completed:', completedCount, 'Max:', maxSelection);
      console.log('Completed items:', completedItems);
      console.log('Category complete:', categoryComplete);

      // Check if we have completed enough items (either via selected_count or completed_count)
      const effectiveCompletedCount = completedCount || completedItems.length || 0;
      
      // ===== CASE 1: Category NOT complete =====
      // Either we haven't selected max items yet, or category is not complete
      if (!categoryComplete && effectiveCompletedCount < maxSelection) {
        console.log('Category not complete, showing items');
        setItemsData(refreshed);
        setScreen("items");
        return;
      }

      // ===== CASE 2: Category Complete =====
      if (categoryComplete === true) {
        const nextCategoryKey = refreshed.next_category_key;
        console.log('Category complete, next category:', nextCategoryKey);

        // 🔥 ALL CATEGORIES FINISHED → GO TO HOME
        if (!nextCategoryKey) {
          console.log('No more categories, going to home');
          router.push("/home");
          return;
        }

        // Move to next category
        setCurrentCategoryKey(nextCategoryKey);

        // Load intro for next category
        const nextIntro = await getCategoryIntro(nextCategoryKey);
        console.log('Next category intro:', nextIntro);
        setIntroData(nextIntro);
        setScreen("intro");

        // Don't auto-load items - let user tap Continue
        return;
      }

      // Fallback: If we've completed at least 1 item and max is reached, try next category
      if (effectiveCompletedCount >= maxSelection) {
        const nextCategoryKey = refreshed.next_category_key;
        if (nextCategoryKey) {
          console.log('Max items completed, moving to next category:', nextCategoryKey);
          setCurrentCategoryKey(nextCategoryKey);
          const nextIntro = await getCategoryIntro(nextCategoryKey);
          setIntroData(nextIntro);
          setScreen("intro");
          return;
        }
      }

      // Default: return to items screen
      console.log('Default: showing items screen');
      setItemsData(refreshed);
      setScreen("items");
    } catch (err) {
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
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
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
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-bold">
            {introData?.intro?.title_text}
          </h1>

          {introData?.intro?.media_url && (
            <img
              src={introData.intro.media_url}
              alt="intro"
              className="w-full rounded-lg"
            />
          )}

          {introData?.intro?.subtitle_text && (
            <p className="text-gray-300">
              {introData.intro.subtitle_text}
            </p>
          )}

          {/* Continue button - user must tap to proceed */}
          <button
            onClick={handleIntroContinue}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-black font-semibold text-lg"
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

          {/* <p className="text-2xl font-semibold text-center">  {itemsData.category_description}</p> */}

          <p className="text-center text-gray-400 font-Poppins">
            Select up to <span className="text-white font-Poppins"> {itemsData.max_selection}{" "}
            {itemsData.category_title}  </span>
          </p>

        <div className=" grid grid-rows-2 grid-flow-col  gap-4 pt-10 font-Poppins">
          {itemsData.items.map((item) => (
            <button
              key={item.key}
              disabled={item.disabled || item.status === "completed"}
              onClick={() => handleItemClick(item.key)}
              className={`w-52 py-3 rounded-lg border transition
                ${
                  item.disabled || item.status === "completed"
                    ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
                    : "border-pink-500 hover:bg-pink-500"
                }`}
            >
              {item.icon || '🏃'} {item.title || item.name || item.key}
            </button>
          ))}

        </div> </div>
      )}

      {/* QUESTIONS */}
      {screen === "questions" && questions && questions.length > 0 && (
        <div className="max-w-md flex flex-col justify-center items-center w-full space-y-6">
          {questions[qIndex] ? (
            <>
   {itemsData.items_title}
              <div className="p-6 w-96 rounded-xl  bg-gradient-to-r from-[#1B5CD1] to-[#1EB9EC] text-lg text-white font-Poppins text-center">
                
                {questions[qIndex].question_text}
              </div>

              {questions[qIndex].options && questions[qIndex].options.map((opt) => (
                <button
                  key={opt.option_id}
                  onClick={() => handleAnswer(opt.option_id)}
                  className="w-96 py-3 border border-pink-500 hover:bg-[#e28010] font-Poppins rounded-lg"
                >
                  {opt.label}
                </button>
              ))}
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
              setScreen("items");
            }}
            className="px-6 py-3 bg-pink-500 rounded-full"
          >
            Back to Items
          </button>
        </div>
      )}
    </div>
  );
}