// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import {
//   getQuestionnaireSession,
//   startQuestionnaireSession,
//   getCategoryIntro,
//   getCategoryItems,
//   getItemQuestions,
//   submitAnswer,
//   saveSelection,
// } from "@/lib/api/categoryApi";

// export default function CategorySelection() {
//   const router = useRouter();

//   const [sessionId, setSessionId] = useState(null);
//   const [currentCategoryKey, setCurrentCategoryKey] = useState(null);

//   const [introData, setIntroData] = useState(null);
//   const [itemsData, setItemsData] = useState(null);

//   const [questions, setQuestions] = useState([]);
//   const [currentItemKey, setCurrentItemKey] = useState(null);
//   const [qIndex, setQIndex] = useState(0);

//   const [screen, setScreen] = useState("loading");
//   const [showPopup, setShowPopup] = useState(false);
  
//   // Popup states for dynamic messages
//   const [noQuestionsPopup, setNoQuestionsPopup] = useState(null); // { itemName, itemKey }
//   const [itemCompletedPopup, setItemCompletedPopup] = useState(null); // { itemName, itemKey }

//   // Track completed categories for visual indication
//   const [completedCategories, setCompletedCategories] = useState([]);

//   const token =
//     typeof window !== "undefined"
//       ? sessionStorage.getItem("accessToken")
//       : null;

//   /* ================= INIT ================= */

//   useEffect(() => {
//     initialize();
//   }, []);

//   // async function initialize() {
//   //   try {
//   //     setScreen("loading");
      
//   //     console.log('=== INITIALIZE QUESTIONNAIRE ===');
//   //     console.log('Token available:', !!token);
//   //     console.log('Token value:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
//   //     // STEP 1: Try to get existing session (resume from where user left off)
//   //     let session = null;
      
//   //     try {
//   //       console.log('Calling getQuestionnaireSession...');
//   //       const response = await getQuestionnaireSession(token);
//   //       console.log('API Response raw:', response);
//   //       console.log('Response type:', typeof response);
//   //       console.log('Response keys:', response ? Object.keys(response) : 'N/A');
        
//   //       // getQuestionnaireSession returns null if no session, or session object
//   //       session = response;
        
//   //       if (session) {
//   //         console.log('✅ Existing session found:', session);
//   //         console.log('Session ID:', session.session_id);
//   //         console.log('Current category key:', session.current_category_key);
//   //       } else {
//   //         console.log('❌ No active session found, will start new');
//   //       }
//   //     } catch (err) {
//   //       console.log('❌ No existing session error:', err.message);
//   //       console.log('Error details:', err);
//   //       // No existing session - will start new one below
//   //     }
      
//   //     // STEP 2: If we have an existing session, resume from it
//   //     if (session && session.session_id) {
//   //       console.log('>>> RESUMING EXISTING SESSION');
//   //       setSessionId(session.session_id);
//   //       setCurrentCategoryKey(session.current_category_key);
        
//   //       // Track completed categories
//   //       if (session.completed_categories) {
//   //         setCompletedCategories(
//   //           session.completed_categories.map(c => c.category_key)
//   //         );
//   //       }
        
//   //       // Check what stage user is in
//   //       const currentStage = session.current_stage;
//   //       const currentItem = session.current_item_key;
        
//   //       console.log('=== RESUMING QUESTIONNAIRE ===');
//   //       console.log('Current category key:', session.current_category_key);
//   //       console.log('Current item key:', currentItem);
//   //       console.log('Current stage:', currentStage);
//   //       console.log('Completed categories:', session.completed_categories);
//   //       console.log('==============================');
        
//   //       // If user was in the middle of answering questions for an item
//   //       if (currentItem && currentStage === 'answering_questions') {
//   //         console.log('User was answering questions for item:', currentItem);
//   //         // Resume the questions for this item
//   //         await resumeItemQuestions(session.current_category_key, currentItem);
//   //         return;
//   //       }
        
//   //       // Otherwise, load the current category (intro or items)
//   //       // This is key - we load the CURRENT category, not the first one
//   //       console.log('Loading intro for category:', session.current_category_key);
//   //       await loadIntro(session.current_category_key);
//   //       return;
//   //     }
      
//   //     // STEP 3: No existing session - start fresh
//   //     console.log('>>> STARTING NEW SESSION');
//   //     console.log('Starting new questionnaire session');
//   //     session = await startQuestionnaireSession(token, false);
//   //     console.log('New session created:', session);
//   //     console.log('New session current_category_key:', session.current_category_key);
//   //     setSessionId(session.session_id);
//   //     setCurrentCategoryKey(session.current_category_key);
      
//   //     // Load the first category intro
//   //     await loadIntro(session.current_category_key);
//   //   } catch (err) {
//   //     console.error("Initialize error:", err);
//   //     setScreen("error");
//   //   }
//   // }
// async function initialize() {
//   try {
//     setScreen("loading");

//     console.log("=== INITIALIZE QUESTIONNAIRE ===");

//     let session = null;

//     /* ===============================
//        STEP 1: CHECK EXISTING SESSION
//     =============================== */

//     try {
//       console.log("Checking existing session...");
//       session = await getQuestionnaireSession(token);

//       if (session) {
//         console.log("Existing session found:", session);
//       } else {
//         console.log("No existing session");
//       }
//     } catch (err) {
//       console.log("Session check failed:", err.message);
//     }

//     /* ===============================
//        STEP 2: RESUME EXISTING SESSION
//     =============================== */

//     if (session && session.session_id) {
//       console.log(">>> RESUMING SESSION");

//       setSessionId(session.session_id);

//     let categoryToLoad = session.current_category_key;

// if (session.categories_progress?.length) {

//   const completedKeys = session.categories_progress
//     .filter(c => c.completed === true)
//     .map(c => c.category_key);

//   setCompletedCategories(completedKeys);

//   // find next incomplete category
//   const nextCategory = session.categories_progress.find(
//     c => c.completed === false
//   );

//   if (nextCategory) {
//     categoryToLoad = nextCategory.category_key;
//   }
// }

//       setCurrentCategoryKey(categoryToLoad);

//       const currentStage = session.current_stage;
//       const currentItem = session.current_item_key;

//       console.log("Resume info:", {
//         categoryToLoad,
//         currentStage,
//         currentItem,
//       });

//       /* Resume question if user was answering */
//       if (currentItem && currentStage === "answering_questions") {
//         await resumeItemQuestions(categoryToLoad, currentItem);
//         return;
//       }

//       /* Otherwise load category intro */
//       await loadIntro(categoryToLoad);
//       return;
//     }

//     /* ===============================
//        STEP 3: START NEW SESSION
//     =============================== */

//     console.log(">>> STARTING NEW SESSION");

//     const newSession = await startQuestionnaireSession(token, false);

//     setSessionId(newSession.session_id);
//     setCurrentCategoryKey(newSession.current_category_key);

//     await loadIntro(newSession.current_category_key);

//   } catch (err) {
//     console.error("Initialize error:", err);
//     setScreen("error");
//   }
// }
//   /* ================= RESUME ITEM QUESTIONS ================= */
  
//   async function resumeItemQuestions(categoryKey, itemKey) {
//     try {
//       setCurrentCategoryKey(categoryKey);
//       setCurrentItemKey(itemKey);
      
//       // Get category items first (to show which item was being answered)
//       const itemsRes = await getCategoryItems(categoryKey, sessionId);
//       setItemsData(itemsRes);
      
//       // Get questions for the item
//       const data = await getItemQuestions(token, itemKey, sessionId);
      
//       let questionsList = [];
//       if (data.questions) {
//         questionsList = data.questions;
//       } else if (Array.isArray(data)) {
//         questionsList = data;
//       } else if (data.data?.questions) {
//         questionsList = data.data.questions;
//       }
      
//       // Check if there's a current_question_index in the session
//       const session = await getQuestionnaireSession(token);
//       const qIndex = session.current_question_index || 0;
      
//       setQuestions(questionsList);
//       setQIndex(qIndex);
//       setScreen("questions");
//     } catch (err) {
//       console.error('Failed to resume item questions:', err);
//       // Fallback to loading intro
//       await loadIntro(categoryKey);
//     }
//   }

//   /* ================= INTRO ================= */

//   async function loadIntro(categoryKey) {
//     try {
//       const intro = await getCategoryIntro(categoryKey);
//       setIntroData(intro);
//       setScreen("intro");
      
//       // Don't auto-load items - show "Continue" button instead
//       // This ensures user sees the intro content
//     } catch (err) {
//       console.error("Intro error:", err);
//       // If intro fails, still load items
//       loadItems(categoryKey);
//     }
//   }

//   // Manual continue from intro - explicit user action
//   function handleIntroContinue() {
//     loadItems(currentCategoryKey);
//   }

//   /* ================= LOAD ITEMS ================= */

//   async function loadItems(categoryKey) {
//     try {
//       const data = await getCategoryItems(categoryKey, sessionId);
//       setItemsData(data);
//       setScreen("items");
//     } catch (err) {
//       console.error("Failed to load items:", err);
//       // Show error but still allow user to see items
//       setItemsData({ items: [], category_title: categoryKey, max_selection: 0 });
//       setScreen("items")
//     }
//   }

//   // Handle back from questions - show completed item popup if applicable
//   function handleBackToItems() {
//     // Check if current item was completed (no questions or all questions answered)
//     if (currentItemKey && itemsData?.items) {
//       const currentItem = itemsData.items.find(i => i.key === currentItemKey);
//       if (currentItem && currentItem.status === 'completed') {
//         const itemDisplayName = getItemDisplayName(currentItem);
//         setItemCompletedPopup({
//           itemName: itemDisplayName,
//           itemKey: currentItemKey
//         });
//         // Auto-hide popup after 2 seconds
//         setTimeout(() => setItemCompletedPopup(null), 2000);
//       }
//     }
//     setScreen("items");
//   }

//   /* ================= ITEM CLICK ================= */

//   // Helper function to get item display name from API response
//   function getItemDisplayName(item) {
//     return item.title || item.name || item.key;
//   }

//   async function handleItemClick(itemKey) {
//     try {
//       // Get the item data from itemsData to find the display name
//       const clickedItem = itemsData?.items?.find(i => i.key === itemKey);
//       const itemDisplayName = clickedItem ? getItemDisplayName(clickedItem) : itemKey;
      
//       // First, set the current item key (this is crucial for the context)
//       setCurrentItemKey(itemKey);
//       console.log('Item clicked:', itemKey);

//       // CRITICAL: Call saveSelection BEFORE getting questions
//       // This sets the session's current_item_key to this item
//       const selectionRes = await saveSelection(token, sessionId, currentCategoryKey, itemKey);
//       console.log('Save selection response:', selectionRes);

//       // Now fetch questions - this will set the session context for this item
//       const data = await getItemQuestions(token, itemKey, sessionId);
//       console.log('Questions response:', data);

//       // Handle different response structures
//       let questionsList = [];
//       if (data.questions) {
//         questionsList = data.questions;
//       } else if (Array.isArray(data)) {
//         questionsList = data;
//       } else if (data.data?.questions) {
//         questionsList = data.data.questions;
//       }
      
//       console.log('Questions list:', questionsList);
      
//       // CHECK: If no questions for this item, show popup and disable the button
//       if (!questionsList || questionsList.length === 0) {
//         console.log('No questions for this item:', itemDisplayName);
//         setNoQuestionsPopup({
//           itemName: itemDisplayName,
//           itemKey: itemKey
//         });
//         // Auto-hide popup after 2 seconds
//         setTimeout(() => setNoQuestionsPopup(null), 2000);
//         return; // Don't proceed to questions screen
//       }
      
//       setQuestions(questionsList);
//       setQIndex(0);
//       setScreen("questions");
//     } catch (err) {
//       console.error("Question error:", err);
//     }
//   }

//   /* ================= SUBMIT ANSWER ================= */

//   async function handleAnswer(optionId) {
//     // Safety check
//     if (!questions || questions.length === 0 || !questions[qIndex]) {
//       console.error('No questions available');
//       setScreen("items");
//       return;
//     }
    
//     const question = questions[qIndex];

//     // Store session info in local variables at the start to avoid state issues
//     const sessionIdAtCompletion = sessionId;
//     const categoryKeyAtCompletion = currentCategoryKey;
//     const itemKeyAtCompletion = currentItemKey;
    
//     try {
//       // CRITICAL: Ensure we use the correct currentItemKey that was set when loading questions
//       // This item_key must match what was used in getItemQuestions
//       console.log('Submitting answer with:', {
//         session_id: sessionIdAtCompletion,
//         category_key: categoryKeyAtCompletion,
//         item_key: itemKeyAtCompletion,
//         question_id: question.question_id
//       });
      
//       const submitRes = await submitAnswer(token, {
//         session_id: sessionIdAtCompletion,
//         category_key: categoryKeyAtCompletion,
//         item_key: itemKeyAtCompletion,
//         question_id: question.question_id,
//         selected_option_ids: [optionId],
//       });
      
//       console.log('Submit answer response:', submitRes);

//       // Check if item is complete based on response
//       const isItemComplete = submitRes?.item_complete === true;
//       const isCategoryComplete = submitRes?.category_complete === true;
//       const nextAction = submitRes?.next_action;
//       const nextCategoryKey = submitRes?.next_category_key;
      
//       // DEBUG: Log all values from response
//       console.log('=== DEBUG: Category Completion ===');
//       console.log('Full submitRes:', JSON.stringify(submitRes, null, 2));
//       console.log('isItemComplete:', isItemComplete);
//       console.log('isCategoryComplete:', isCategoryComplete);
//       console.log('nextAction:', nextAction);
//       console.log('nextCategoryKey:', nextCategoryKey);
//       console.log('qIndex:', qIndex);
//       console.log('questions.length:', questions.length);
//       console.log('=================================');

//       // Next question inside same item (if item not complete yet)
//       if (!isItemComplete && qIndex < questions.length - 1) {
//         setQIndex((prev) => prev + 1);
//         return;
//       }

//       // ===== ITEM COMPLETED - All questions answered =====
//       console.log('All questions answered for item:', itemKeyAtCompletion);
//       console.log('Session info - sessionId:', sessionIdAtCompletion, 'categoryKey:', categoryKeyAtCompletion);
      
//       // Show popup after item completed
//       setShowPopup(true);
//       setTimeout(() => setShowPopup(false), 1500);

//       // Use the submitAnswer response directly to determine next steps
//       // This is more reliable than calling getCategoryItems
//       if (isCategoryComplete && nextCategoryKey) {
//         console.log('Category complete! Moving to next category:', nextCategoryKey);
        
//         // Move to next category
//         setCurrentCategoryKey(nextCategoryKey);
        
//         // Load intro for next category
//         try {
//           const nextIntro = await getCategoryIntro(nextCategoryKey);
//           console.log('Next category intro:', nextIntro);
//           setIntroData(nextIntro);
//         } catch (introErr) {
//           console.error('Failed to load next intro:', introErr);
//         }
//         setScreen("intro");
//         return;
//       }
      
//       if (isCategoryComplete && !nextCategoryKey) {
//         console.log('All categories complete! Going to home');
//         router.push("/onboarding/experience");
//         return;
//       }

//       // If category is not complete, refresh the items list
//       console.log('Category not complete, refreshing category data...');
      
//       // Small delay to ensure backend processes everything
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       console.log('Calling getCategoryItems with:', { categoryKey: categoryKeyAtCompletion, sessionId: sessionIdAtCompletion });
      
//       const refreshed = await getCategoryItems(
//         categoryKeyAtCompletion,
//         sessionIdAtCompletion
//       );

//       console.log('Raw refresh response:', refreshed);

//       console.log('Refreshed category data:', refreshed);

//       // DEBUG: Log all fields
//       console.log('=== DEBUG: After getCategoryItems ===');
//       console.log('selected_count:', refreshed.selected_count);
//       console.log('completed_count:', refreshed.completed_count);
//       console.log('max_selection:', refreshed.max_selection);
//       console.log('completed_items:', refreshed.completed_items);
//       console.log('category_complete:', refreshed.category_complete);
//       console.log('next_category_key:', refreshed.next_category_key);
//       console.log('=====================================');

//       // Check various fields to determine completion status
//       const selectedCount = refreshed.selected_count;
//       const completedCount = refreshed.completed_count;
//       const maxSelection = refreshed.max_selection;
//       const completedItems = refreshed.completed_items || [];
//       const categoryComplete = refreshed.category_complete;

//       console.log('Counts - Selected:', selectedCount, 'Completed:', completedCount, 'Max:', maxSelection);
//       console.log('Completed items:', completedItems);
//       console.log('Category complete:', categoryComplete);

//       // Check if we have completed enough items (either via selected_count or completed_count)
//       const effectiveCompletedCount = completedCount || completedItems.length || 0;
      
//       // ===== CASE 1: Category NOT complete =====
//       // Either we haven't selected max items yet, or category is not complete
//       if (!categoryComplete && effectiveCompletedCount < maxSelection) {
//         console.log('Category not complete, showing items');
//         setItemsData(refreshed);
//         setScreen("items");
//         return;
//       }

//       // ===== CASE 2: Category Complete =====
//       if (categoryComplete === true) {
//         const nextCategoryKey = refreshed.next_category_key;
//         console.log('Category complete, next category:', nextCategoryKey);

//         // 🔥 ALL CATEGORIES FINISHED → GO TO HOME
//         if (!nextCategoryKey) {
//           console.log('No more categories, going to home');
//           router.push("/onboading/experience");
//           return;
//         }

//         // Move to next category
//         setCurrentCategoryKey(nextCategoryKey);

//         // Load intro for next category
//         const nextIntro = await getCategoryIntro(nextCategoryKey);
//         console.log('Next category intro:', nextIntro);
//         setIntroData(nextIntro);
//         setScreen("intro");

//         // Don't auto-load items - let user tap Continue
//         return;
//       }

//       // Fallback: If we've completed at least 1 item and max is reached, try next category
//       if (effectiveCompletedCount >= maxSelection) {
//         const nextCategoryKey = refreshed.next_category_key;
//         if (nextCategoryKey) {
//           console.log('Max items completed, moving to next category:', nextCategoryKey);
//           setCurrentCategoryKey(nextCategoryKey);
//           const nextIntro = await getCategoryIntro(nextCategoryKey);
//           setIntroData(nextIntro);
//           setScreen("intro");
//           return;
//         }
//       }

//       // Default: return to items screen
//       console.log('Default: showing items screen');
//       setItemsData(refreshed);
//       setScreen("items");
//     } catch (err) {
//       console.error("Submit answer error:", err);
//       alert("Failed to save answer. Please try again.");
//     }
//   }

//   /* ================= UI ================= */

//   if (screen === "loading") {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-pulse text-pink-500 text-xl mb-2">Loading...</div>
//           <p className="text-gray-400 text-sm">Setting up your preferences</p>
//         </div>
//       </div>
//     );
//   }

//   if (screen === "error") {
//     return (
//       <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
//         <div className="text-red-500 text-5xl mb-4"></div>
//         <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
//         <p className="text-gray-400 text-center mb-6">Failed to load questionnaire. Please try again.</p>
//         <button
//           onClick={() => initialize()}
//           className="px-8 py-3 bg-pink-500 rounded-full text-white font-semibold"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative">

//       {/* INTRO */}
//       {screen === "intro" && introData && (
//         <div className="max-w-md w-full flex flex-col  text-center justify-center items-center space-y-6">
//           {/* <h1 className="text-2xl mb-8 font-bold text-white text-md font-Playfair Display ">
//             {introData?.intro?.title_text}
//           </h1> */}

//           {introData?.intro?.media_url && (
//             <img
//               src={introData.intro.media_url}
//               alt="intro"
//               className="w-80 h-96 rounded-2xl "
//             />
//           )}

//           {introData?.intro?.subtitle_text && (
//             <p className="text-white text-md font-Playfair Display ">
//               {introData.intro.subtitle_text}
//             </p>
//           )}

//           {/* Continue button - user must tap to proceed */}
//           <button
//             onClick={handleIntroContinue}
//             className="w-80 text-white py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full font-Poppins font-semibold text-lg"
//           >
//             Get Started
//           </button>
//         </div>
//       )}

//       {/* ITEMS */}
//       {screen === "items" && itemsData && (

// <div className="flex flex-col space-y-6  "> 
//   <h2 className="text-2xl font-semibold text-center">
//             {itemsData.category_title}
           
//           </h2>

//           {/* <p className="text-2xl font-semibold text-center">  {itemsData.category_description}</p> */}

//           <p className="text-center text-gray-400 font-Poppins">
//             Select up to <span className="text-white font-Poppins"> {itemsData.max_selection}{" "}
//             {itemsData.category_title}  </span>
//           </p>

//         <div className=" grid grid-rows-2 grid-flow-col  gap-4 pt-10 font-Poppins">
//           {itemsData.items.map((item) => (
//             <button
//               key={item.key}
//               disabled={item.disabled || item.status === "completed"}
//               onClick={() => handleItemClick(item.key)}
//               className={`w-52 py-3 rounded-lg border transition
//                 ${
//                   item.disabled || item.status === "completed"
//                     ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
//                     : "border-pink-500 hover:bg-pink-500"
//                 }`}
//             >
//               {item.icon || '🏃'} {item.title || item.name || item.key}
//             </button>
//           ))}

//         </div> 
        
//         {/* POPUP: No questions for selected item */}
//         {noQuestionsPopup && (
//           <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
//             <p className="font-semibold">
//               No questions under {noQuestionsPopup.itemName}. Choose another!
//             </p>
//           </div>
//         )}
        
//         {/* POPUP: Item completed - choose next */}
//         {itemCompletedPopup && (
//           <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
//             <p className="font-semibold">
//               {itemCompletedPopup.itemName} is completed! Choose next item.
//             </p>
//           </div>
//         )}
        
//         </div>
//       )}


//       {/* QUESTIONS */}
//       {screen === "questions" && questions && questions.length > 0 && (
//         <div className="max-w-md flex flex-col justify-center items-center w-full space-y-6">
//           {questions[qIndex] ? (
//             <>
//    {itemsData.items_title}
//               <div className="p-6 w-96 rounded-xl  bg-gradient-to-r from-[#1B5CD1] to-[#1EB9EC] text-lg text-white font-Poppins text-center">
                
//                 {questions[qIndex].question_text}
//               </div>

//               {questions[qIndex].options && questions[qIndex].options.map((opt) => (
//                 <button
//                   key={opt.option_id}
//                   onClick={() => handleAnswer(opt.option_id)}
//                   className="w-96 py-3 border border-pink-500 hover:bg-[#e28010] font-Poppins rounded-lg"
//                 >
//                   {opt.label}
//                 </button>
//               ))}
              
//               {/* Back button to return to items */}
//               <button
//                 onClick={() => handleBackToItems()}
//                 className="mt-4 text-gray-400 hover:text-white text-sm"
//               >
//                 ← Back to Items
//               </button>
//             </>
//           ) : (
//             <div className="text-center text-gray-400">
//               No questions available for this item
//             </div>
//           )}
//         </div>
//       )}

//       {/* No questions available */}
//       {screen === "questions" && (!questions || questions.length === 0) && (
//         <div className="max-w-md w-full text-center space-y-4">
//           <p className="text-gray-400">No questions available for this item</p>
//           <button
//             onClick={() => {
//               handleBackToItems();
//             }}
//             className="px-6 py-3 bg-pink-500 rounded-full"
//           >
//             Back to Items
//           </button>
//         </div>
//       )}
      
//       {/* POPUP: No questions for selected item (when back from questions screen) */}
//       {noQuestionsPopup && screen !== "items" && (
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
//           <p className="font-semibold">
//             No questions under {noQuestionsPopup.itemName}. Choose another!
//           </p>
//         </div>
//       )}
      
//       {/* POPUP: Item completed - choose next (when back from questions screen) */}
//       {itemCompletedPopup && screen !== "items" && (
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
//           <p className="font-semibold">
//             {itemCompletedPopup.itemName} is completed! Choose next item.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }



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
} from "@/lib/api/categoryApi";
import SportProgressBar from "@/app/components/SportProgressBar";

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

const colorPalette = [
  { card: "from-[#1B5CD1] to-[#1EB9EC]", hover: "hover:bg-[#1EB9EC]" },
  { card: "from-[#9333EA] to-[#6366F1]", hover: "hover:bg-[#6366F1]" },
  { card: "from-[#14B8A6] to-[#22C55E]", hover: "hover:bg-[#22C55E]" },
];

const gradient = colorPalette[qIndex % colorPalette.length];
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

    console.log("=== INITIALIZE QUESTIONNAIRE ===");

    let session = null;

    /* ===============================
       STEP 1: CHECK EXISTING SESSION
    =============================== */

    try {
      console.log("Checking existing session...");
      session = await getQuestionnaireSession(token);

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
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
    await completeQuestionnaire(token, session.session_id);
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

    const newSession = await startQuestionnaireSession(token, false);
    console.log('[CategorySelection] New session created:', newSession);
    
    // After starting session, get full session details with session_id
    // This follows the API doc: Get Session Status with session_id
    const sessionDetails = await getQuestionnaireSession(token, newSession.session_id);
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

//   async function handleItemClick(itemKey) {
//     try {
//       // Get the item data from itemsData to find the display name
//     const clickedItem = itemsData?.items?.find(i => i.key === itemKey);

// if (clickedItem?.status === "completed" || clickedItem?.is_completed) {
//   console.log("Item already completed, ignoring click");
//   return;
// }
//       const itemDisplayName = clickedItem ? getItemDisplayName(clickedItem) : itemKey;
      
//       // First, set the current item key (this is crucial for the context)
//       setCurrentItemKey(itemKey);
//       console.log('Item clicked:', itemKey);

//       // CRITICAL: Call saveSelection BEFORE getting questions
//       // This sets the session's current_item_key to this item
//       const selectionRes = await saveSelection(token, sessionId, currentCategoryKey, itemKey);
//       console.log('Save selection response:', selectionRes);

//       // Now fetch questions - this will set the session context for this item
//       const data = await getItemQuestions(token, itemKey, sessionId);
//       console.log('Questions response:', data);

//       // Handle different response structures
//       let questionsList = [];
//       if (data.questions) {
//         questionsList = data.questions;
//       } else if (Array.isArray(data)) {
//         questionsList = data;
//       } else if (data.data?.questions) {
//         questionsList = data.data.questions;
//       }
      
//       console.log('Questions list:', questionsList);
      
//       // CHECK: If no questions for this item, show popup and disable the button
//       // if (!questionsList || questionsList.length === 0) {
//       //   console.log('No questions for this item:', itemDisplayName);
//       //   setNoQuestionsPopup({
//       //     itemName: itemDisplayName,
//       //     itemKey: itemKey
//       //   });
//       //   // Auto-hide popup after 2 seconds
//       //   setTimeout(() => setNoQuestionsPopup(null), 2000);
//       //   return; // Don't proceed to questions screen
//       // }

//       if (!questionsList || questionsList.length === 0) {

//   console.log("No questions for item:", itemDisplayName);

//   // show popup
//   setNoQuestionsPopup({
//     itemName: itemDisplayName,
//     itemKey: itemKey,
//   });

//   // hide popup automatically
//   setTimeout(() => setNoQuestionsPopup(null), 2000);

//   // IMPORTANT: stay on items screen
//   setScreen("items");

//   return; // stop execution
// }
      
//       setQuestions(questionsList);
//       setQIndex(0);
//       setScreen("questions");
//     } catch (err) {
//       console.error("Question error:", err);
//     }
//   }
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
      
      // const submitRes = await submitAnswer(token, {
      //   session_id: sessionIdAtCompletion,
      //   category_key: categoryKeyAtCompletion,
      //   item_key: itemKeyAtCompletion,
      //   question_id: question.question_id,
      //   selected_option_ids: [optionId],
      // });
      

      const submitRes = await submitAnswer(token, {
  session_id: sessionIdAtCompletion,
  category_key: categoryKeyAtCompletion,
  item_key: itemKeyAtCompletion,
  question_id: question.question_id,
  selected_option_ids: [optionId],
});

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
      
      // Show popup after item completed
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);

      // Use the submitAnswer response directly to determine next steps
      // This is more reliable than calling getCategoryItems
      // if (isCategoryComplete && nextCategoryKey) {
      //   console.log('Category complete! Moving to next category:', nextCategoryKey);
        
      //   // Move to next category
      //   setCurrentCategoryKey(nextCategoryKey);
        
      //   // Load intro for next category
      //   try {
      //     const nextIntro = await getCategoryIntro(nextCategoryKey);
      //     console.log('Next category intro:', nextIntro);
      //     setIntroData(nextIntro);
      //   } catch (introErr) {
      //     console.error('Failed to load next intro:', introErr);
      //   }
      //   setScreen("intro");
      //   return;
      // }

      // CATEGORY COMPLETED → GO NEXT CATEGORY
// if (submitRes?.category_complete === true) {

//   const nextCategoryKey = submitRes?.next_category_key;

//   if (nextCategoryKey) {
//     console.log("Moving to next category:", nextCategoryKey);

//     setCurrentCategoryKey(nextCategoryKey);

//     const nextIntro = await getCategoryIntro(nextCategoryKey);
//     setIntroData(nextIntro);

//     setScreen("intro");
//     return;
//   }

//   // No more categories
//   console.log("All categories completed");
//   router.push("/onboarding/experience");
//   return;
// }

// if (submitRes?.category_complete) {

//   const nextCategoryKey = submitRes?.next_category_key;

//   // ✅ Mark this category as completed locally
//   setCompletedCategories(prev => [
//     ...prev,
//     categoryKeyAtCompletion
//   ]);

//   if (nextCategoryKey) {

//     console.log("Moving to next category:", nextCategoryKey);

//     setCurrentItemKey(null);
//     setCurrentCategoryKey(nextCategoryKey);

//     const nextIntro = await getCategoryIntro(nextCategoryKey);

//     setIntroData(nextIntro);
//     setScreen("intro");

//     return;
//   }

//   router.push("/onboarding/experience");
//   return;
// }

if (submitRes?.category_complete) {

  const nextCategoryKey = submitRes?.next_category_key;

  // mark category completed locally
  setCompletedCategories(prev => [
    ...prev,
    categoryKeyAtCompletion
  ]);

  // ✅ If next category exists → load it
  if (nextCategoryKey) {

    console.log("Moving to next category:", nextCategoryKey);

    setCurrentItemKey(null);
    setCurrentCategoryKey(nextCategoryKey);

    const nextIntro = await getCategoryIntro(nextCategoryKey);

    setIntroData(nextIntro);
    setScreen("intro");

    return;
  }

  // ✅ If no next category → onboarding finished
  console.log("All categories completed. Redirecting...");

  // Complete questionnaire to update state to QUESTIONNAIRE_COMPLETED
  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
    await completeQuestionnaire(token, sessionIdAtCompletion);
    console.log("Questionnaire completed successfully");
  } catch (completeErr) {
    console.error("Error completing questionnaire:", completeErr);
  }

  console.log("Redirecting to /onboarding/experience...");
  // Use window.location for more reliable redirect
  if (typeof window !== 'undefined') {
    window.location.href = '/onboarding/experience';
  } else {
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
        try {
          const sessionData = await getQuestionnaireSession(token, sessionId);
          console.log('Session data for next category:', sessionData);
          
          if (sessionData && sessionData.next_category_key) {
            console.log('Found next category from session:', sessionData.next_category_key);
            setCurrentCategoryKey(sessionData.next_category_key);
            const nextIntro = await getCategoryIntro(sessionData.next_category_key);
            setIntroData(nextIntro);
            setScreen("intro");
            return;
          }
          
          // Also check for next_category in response
          if (refreshed.next_category_key) {
            console.log('Found next category from refresh:', refreshed.next_category_key);
            setCurrentCategoryKey(refreshed.next_category_key);
            const nextIntro = await getCategoryIntro(refreshed.next_category_key);
            setIntroData(nextIntro);
            setScreen("intro");
            return;
          }
        } catch (err) {
          console.log('Error getting session for next category:', err);
        }
        
        // If we still can't find next category but max items reached, try to get from categories list
        if (effectiveCompletedCount >= maxSelection) {
          console.log('Max items completed but no next category found - all categories might be done');
          // Could redirect to experience or show completion
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
          {/* <h1 className="text-2xl mb-8 font-bold text-white text-md font-Playfair Display ">
            {introData?.intro?.title_text}
          </h1> */}

          {introData?.intro?.media_url && (
            <img
              src={introData.intro.media_url}
              alt="intro"
              className="w-80 h-96 rounded-2xl "
            />
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

          {/* <p className="text-2xl font-semibold text-center">  {itemsData.category_description}</p> */}

          <p className="text-center text-gray-400 font-Poppins">
            Select up to <span className="text-white font-Poppins"> {itemsData.max_selection}{" "}
            {itemsData.category_title}  </span>
          </p>

        <div className=" grid grid-rows-2 grid-flow-col  gap-4 pt-10 font-Poppins">
          {itemsData.items.map((item) => (
//             <button
//               key={item.key}
// disabled={
//   item.disabled ||
//   item.status === "completed" ||
//   item.is_completed === true
// }
//               onClick={() => handleItemClick(item.key)}
//             className={`w-52 py-3 rounded-lg border transition
//   ${
//     item.status === "completed" || item.is_completed
//       ? "bg-green-700 border-green-600 opacity-70 cursor-not-allowed"
//       : item.disabled
//       ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
//       : "border-pink-500 hover:bg-pink-500"
//   }`}
//             >
//               {item.icon || '🏃'} {item.title || item.name || item.key}
//             </button>
<button
  key={item.key}
  disabled={
    item.disabled ||
    item.status === "completed" ||
    item.is_completed === true
  }
  onClick={() => handleItemClick(item.key)}
  className={`w-52 py-3 rounded-lg border transition flex items-center justify-center gap-2

  ${
    item.status === "completed" || item.is_completed
      ? "bg-green-700 border-green-600 text-white cursor-not-allowed"
      : item.disabled
      ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
      : "border-pink-500 hover:bg-pink-500"
  }
`}
>
  {item.icon || "🎯"} {item.title || item.name || item.key}

  {(item.status === "completed" || item.is_completed) && (
    <span className="text-green-300 font-bold">✔</span>
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
  <div className="max-w-md flex flex-col justify-center items-center w-full space-y-6">

    <SportProgressBar
      percentage={progressPercentage}
      pendingCoins={pendingCoins}
    />

    {questions[qIndex] && qIndex < questions.length ? (
      <>
        <div className={`p-6 w-96 rounded-xl bg-gradient-to-r ${gradient.card} text-lg text-white font-Poppins text-center`}>
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
             className={`w-96 py-3 border font-Poppins rounded-lg transition
${
  selectedOption === opt.option_id
    ? "bg-pink-500 border-pink-500 text-white"
    : `border-pink-500 ${gradient.hover}`
}`}
            >
              {opt.label}
            </button>
          ))}

        <button
          onClick={() => handleBackToItems()}
          className="mt-4 text-gray-400 hover:text-white text-sm"
        >
          ← Back to Items
        </button>
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