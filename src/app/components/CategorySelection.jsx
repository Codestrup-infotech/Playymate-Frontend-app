// "use client";

// import { useEffect, useState } from "react";
// import {
//   getCategories,
//   getCategoryIntro,
//   getCategoryItems,
//   startQuestionnaireSession,
//   getCategoryItems as fetchItems,
// } from "@/lib/api/categoryApi";

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// export default function CategorySelection() {
//   const [sessionId, setSessionId] = useState(null);

//   const [categories, setCategories] = useState([]);
//   const [categoryIndex, setCategoryIndex] = useState(0);

//   const [items, setItems] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);

//   const [questions, setQuestions] = useState([]);
//   const [currentItemKey, setCurrentItemKey] = useState(null);
//   const [qIndex, setQIndex] = useState(0);

//   const [screen, setScreen] = useState("loading");
//   const [progress, setProgress] = useState(0);
//   const [categoryIntro, setCategoryIntro] = useState(null);

//   const currentCategory = categories?.[categoryIndex];

//   /* ---------------- INIT ---------------- */

//   useEffect(() => {
//     initialize();
//   }, []);

//   async function initialize() {
//     try {
//       setScreen("loading");

//       // First, get categories (doesn't require auth)
//       const categoryData = await getCategories("preference");
//       setCategories(categoryData);

//       // Try to start session if token exists
//       const token = sessionStorage.getItem("accessToken");
//       if (token) {
//         try {
//           const session = await startQuestionnaireSession(token, true);
//           setSessionId(session.session_id);
//         } catch (sessionErr) {
//           console.warn('Failed to start session, continuing without it:', sessionErr);
//         }
//       }

//       setScreen("intro");
//     } catch (err) {
//       console.error('Failed to initialize:', err);
//       setScreen("error");
//     }
//   }

//   /* ---------------- CATEGORY INTRO ---------------- */

//   useEffect(() => {
//     if (currentCategory && sessionId) {
//       loadCategoryIntro(currentCategory.key);
//     }
//   }, [categoryIndex, sessionId]);

//   async function loadCategoryIntro(categoryKey) {
//     try {
//       setScreen("intro");
      
//       // Fetch intro data from API
//       const introData = await getCategoryIntro(categoryKey);
//       console.log('Category intro data:', introData);
//       setCategoryIntro(introData);
      
//       // Don't wait - let the UI show the intro first
//       // The user can tap to continue to items
//     } catch (err) {
//       console.error('Failed to load category intro:', err);
//       // Fallback - show items anyway
//       loadItems(categoryKey);
//     }
//   }

//   async function loadItems(categoryKey) {
//     try {
//       const data = await getCategoryItems(
//         categoryKey,
//         sessionId
//       );

//       setItems(data.items);
//       setScreen("items");
//     } catch (err) {
//       console.error('Failed to load items:', err);
//     }
//   }

//   function handleIntroContinue() {
//     loadItems(currentCategory.key);
//   }

//   /* ---------------- ITEM SELECTION ---------------- */

//   function toggleItem(key) {
//     if (selectedItems.includes(key)) {
//       setSelectedItems((prev) =>
//         prev.filter((k) => k !== key)
//       );
//     } else {
//       setSelectedItems((prev) => [...prev, key]);
//     }
//   }

//   async function saveSelection() {
//     const token = sessionStorage.getItem("accessToken");
    
//     if (!token) {
//       alert("Please log in to save your selections");
//       return;
//     }

//     // Start session if not started
//     let currentSessionId = sessionId;
//     if (!currentSessionId) {
//       try {
//         const session = await startQuestionnaireSession(token, true);
//         currentSessionId = session.session_id;
//         setSessionId(currentSessionId);
//       } catch (err) {
//         console.error('Failed to start session:', err);
//         alert("Failed to start session. Please try again.");
//         return;
//       }
//     }

//     const response = await fetch(
//       `${BASE_URL}/questionnaire/selection`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           session_id: currentSessionId,
//           category_key: currentCategory.key,
//           selected_items: selectedItems,
//         }),
//       }
//     );

//     const json = await response.json();

//     if (json.status === "success") {
//       loadQuestions(selectedItems[0]);
//     }
//   }

//   /* ---------------- QUESTIONS ---------------- */

//   async function loadQuestions(itemKey) {
//     setCurrentItemKey(itemKey);

//     const res = await fetch(
//       `${BASE_URL}/questionnaire/items/${itemKey}/questions?session_id=${sessionId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${sessionStorage.getItem(
//             "accessToken"
//           )}`,
//         },
//       }
//     );

//     const json = await res.json();

//     setQuestions(json.data.questions);
//     setQIndex(0);
//     setScreen("questions");
//   }

//   async function submitAnswer(answer, questionType = null) {
//     const question = questions[qIndex];
//     const type = questionType || question?.question_type || 'single_select';

//     let payload = {};

//     // Handle based on question type - match API's single_select, multi_select
//     if (type === 'single_select' || type === 'single_choice' || type === 'single') {
//       // If answer is already option_id, use it directly
//       if (answer && typeof answer === 'string') {
//         const byId = question.options?.find(opt => opt.option_id === answer);
//         if (byId) {
//           payload.selected_option_ids = [answer];
//         } else {
//           // Try by label/value
//           const byLabel = question.options?.find(opt => opt.label === answer || opt.value === answer);
//           payload.selected_option_ids = byLabel ? [byLabel.option_id] : [];
//         }
//       } else {
//         payload.selected_option_ids = [answer];
//       }
//     } else if (type === 'multi_select' || type === 'multi_choice' || type === 'multi') {
//       // Array of option_ids
//       const selectedIds = (Array.isArray(answer) ? answer : [answer]).map(a => {
//         const byId = question.options?.find(opt => opt.option_id === a);
//         if (byId) return a;
//         const byLabel = question.options?.find(opt => opt.label === a || opt.value === a);
//         return byLabel?.option_id || a;
//       }).filter(Boolean);
//       payload.selected_option_ids = selectedIds;
//     } else if (type === 'boolean') {
//       // Boolean - use answer_boolean
//       if (answer === true || answer === 'true' || answer === '1' || answer === 1) {
//         payload.answer_boolean = true;
//       } else {
//         payload.answer_boolean = false;
//       }
//     } else if (type === 'text') {
//       payload.answer_text = answer;
//     } else if (type === 'number') {
//       payload.answer_number = typeof answer === 'number' ? answer : parseInt(answer);
//     } else {
//       // Default to single_select
//       payload.selected_option_ids = [answer];
//     }

//     await fetch(
//       `${BASE_URL}/questionnaire/answer`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${sessionStorage.getItem(
//             "accessToken"
//           )}`,
//         },
//         body: JSON.stringify({
//           session_id: sessionId,
//           item_key: currentItemKey,
//           question_id: question.question_id,
//           ...payload,
//         }),
//       }
//     );

//     if (qIndex < questions.length - 1) {
//       setQIndex((prev) => prev + 1);
//       setProgress(
//         Math.round(
//           ((qIndex + 2) / questions.length) * 100
//         )
//       );
//     } else {
//       setScreen("items");
//     }
//   }

//   /* ---------------- CATEGORY THEME ---------------- */

//   const categoryThemes = {
//     sports:
//       "bg-gradient-to-r from-pink-500 to-orange-400",
//     hobbies:
//       "bg-gradient-to-r from-blue-500 to-yellow-400",
//     music:
//       "bg-gradient-to-r from-purple-500 to-pink-400",
//   };

//   const theme =
//     categoryThemes[currentCategory?.key] ||
//     "bg-gradient-to-r from-indigo-500 to-cyan-500";

//   /* ---------------- RENDER ---------------- */

//   if (screen === "loading") {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center text-white">
//         Loading...
//       </div>
//     );
//   }

//   if (screen === "error") {
//     return (
//       <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
//         <p className="text-red-500 mb-4">Failed to load categories</p>
//         <button
//           onClick={() => initialize()}
//           className="px-4 py-2 rounded-full bg-gray-700"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">

//       {/* INTRO SCREEN */}
//       {screen === "intro" && (
//         <div className="w-full max-w-md space-y-6 text-center">
//           {categoryIntro ? (
//             <>
//               <h1 className="text-3xl font-bold">
//                 {categoryIntro.title || currentCategory?.name}
//               </h1>
              
//               <p className="text-gray-300 text-lg">
//                 {categoryIntro.description}
//               </p>
              
//               {categoryIntro.max_selections && (
//                 <p className="text-sm text-gray-400">
//                   You can select up to {categoryIntro.max_selections} items
//                 </p>
//               )}
//             </>
//           ) : (
//             <>
//               <h1 className="text-3xl font-bold">
//                 {currentCategory?.name}
//               </h1>
//               <p className="text-gray-300">Loading...</p>
//             </>
//           )}
          
//           <button
//             onClick={handleIntroContinue}
//             className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-black font-semibold"
//           >
//             Get Started
//           </button>
//         </div>
//       )}

//       {/* ITEMS SCREEN */}
//       {screen === "items" && (
//         <div className="w-full max-w-md space-y-6">
//           <h1 className="text-center text-2xl font-semibold">
//             {currentCategory?.name}
//           </h1>

//           {items.map((item) => (
//             <button
//               key={item.key}
//               onClick={() => toggleItem(item.key)}
//               className={`w-full py-4 rounded-xl border transition ${
//                 selectedItems.includes(item.key)
//                   ? "border-pink-500 bg-pink-500/10"
//                   : "border-gray-600 hover:bg-white/5"
//               }`}
//             >
//               {item.name}
//             </button>
//           ))}

//           <button
//             onClick={saveSelection}
//             className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-black font-semibold"
//           >
//             Continue
//           </button>
//         </div>
//       )}

//       {/* QUESTIONS SCREEN */}
//       {screen === "questions" && questions.length > 0 && (
//         <div className="w-full max-w-md space-y-6">

//           {/* Progress Circle */}
//           <div className="flex justify-center">
//             <div className="relative w-20 h-20">
//               <svg className="w-20 h-20">
//                 <circle
//                   cx="40"
//                   cy="40"
//                   r="35"
//                   stroke="gray"
//                   strokeWidth="5"
//                   fill="none"
//                 />
//                 <circle
//                   cx="40"
//                   cy="40"
//                   r="35"
//                   stroke="lime"
//                   strokeWidth="5"
//                   fill="none"
//                   strokeDasharray={220}
//                   strokeDashoffset={
//                     220 - (220 * progress) / 100
//                   }
//                 />
//               </svg>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 {progress}%
//               </div>
//             </div>
//           </div>

//           {/* Question Card */}
//           <div
//             className={`rounded-2xl p-6 text-center ${theme}`}
//           >
//             <h2 className="text-lg font-semibold mb-4">
//               {questions[qIndex].question_text}
//             </h2>
//           </div>

//           {/* Options */}
//           {questions[qIndex].options.map((opt) => (
//             <button
//               key={opt.option_id}
//               onClick={() =>
//                 submitAnswer(opt.option_id)
//               }
//               className="w-full py-3 rounded-xl border border-pink-500 hover:bg-pink-500/10"
//             >
//               {opt.label}
//             </button>
//           ))}

//           <button className="w-full mt-6 py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-black font-semibold">
//             Continue
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import {
  getCategories,
  getCategoryIntro,
  getCategoryItems,
  startQuestionnaireSession,
  saveSelection,
  getItemQuestions,
  submitAnswer,
  completeCategory,
  completeQuestionnaire,
} from "@/lib/api/categoryApi";

export default function CategorySelection() {
  const [categories, setCategories] = useState([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [categoryIntro, setCategoryIntro] = useState(null);

  const [sessionId, setSessionId] = useState(null);

  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [maxSelections, setMaxSelections] = useState(0);

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);

  const [screen, setScreen] = useState("loading");
  const [progress, setProgress] = useState(0);

  const currentCategory = categories[categoryIndex];
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("accessToken")
      : null;

  /* -------------------------------------------------------
     INIT
  ------------------------------------------------------- */

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    try {
      setScreen("loading");

      const categoryData = await getCategories("preference");
      setCategories(categoryData);

      if (token) {
        const session = await startQuestionnaireSession(
          token,
          false
        );
        setSessionId(session.session_id);
      }

      setScreen("intro");
    } catch (err) {
      console.error(err);
      setScreen("error");
    }
  }

  /* -------------------------------------------------------
     LOAD CATEGORY INTRO
  ------------------------------------------------------- */

  useEffect(() => {
    if (currentCategory) {
      loadIntro(currentCategory.key);
    }
  }, [categoryIndex]);

  async function loadIntro(categoryKey) {
    try {
      const intro = await getCategoryIntro(
        categoryKey
      );
      setCategoryIntro(intro);
      setMaxSelections(intro?.max_selections || 0);
      setSelectedItems([]);
      setScreen("intro");
    } catch (err) {
      console.error(err);
    }
  }

  /* -------------------------------------------------------
     LOAD ITEMS
  ------------------------------------------------------- */

  async function loadItems() {
    try {
      const data = await getCategoryItems(
        currentCategory.key,
        sessionId
      );

      setItems(data.items);
      setScreen("items");
    } catch (err) {
      console.error(err);
    }
  }

  /* -------------------------------------------------------
     SELECT ITEM
  ------------------------------------------------------- */

  function toggleItem(key) {
    if (selectedItems.includes(key)) {
      setSelectedItems((prev) =>
        prev.filter((k) => k !== key)
      );
    } else {
      if (
        maxSelections &&
        selectedItems.length >= maxSelections
      ) {
        alert(
          `You can select only ${maxSelections} items`
        );
        return;
      }
      setSelectedItems((prev) => [...prev, key]);
    }
  }

  /* -------------------------------------------------------
     SAVE SELECTION
  ------------------------------------------------------- */

  async function handleSaveSelection() {
    try {
      await saveSelection(
        token,
        sessionId,
        currentCategory.key,
        selectedItems
      );

      setCurrentItemIndex(0);
      loadQuestions(selectedItems[0]);
    } catch (err) {
      console.error(err);
    }
  }

  /* -------------------------------------------------------
     LOAD QUESTIONS
  ------------------------------------------------------- */

  async function loadQuestions(itemKey) {
    try {
      const data = await getItemQuestions(
        token,
        itemKey,
        sessionId
      );

      setQuestions(data.questions);
      setQIndex(0);
      setProgress(0);
      setScreen("questions");
    } catch (err) {
      console.error(err);
    }
  }

  /* -------------------------------------------------------
     SUBMIT ANSWER
  ------------------------------------------------------- */

  async function handleAnswer(optionId) {
    const question = questions[qIndex];

    try {
      await submitAnswer(token, {
        session_id: sessionId,
        item_key: selectedItems[currentItemIndex],
        question_id: question.question_id,
        selected_option_ids: [optionId],
      });

      const nextIndex = qIndex + 1;

      if (nextIndex < questions.length) {
        setQIndex(nextIndex);
        setProgress(
          Math.round(
            ((nextIndex + 1) /
              questions.length) *
              100
          )
        );
      } else {
        moveToNextItem();
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* -------------------------------------------------------
     NEXT ITEM / COMPLETE CATEGORY
  ------------------------------------------------------- */

  async function moveToNextItem() {
    const nextItemIndex = currentItemIndex + 1;

    if (nextItemIndex < selectedItems.length) {
      setCurrentItemIndex(nextItemIndex);
      loadQuestions(selectedItems[nextItemIndex]);
    } else {
      await completeCategory(
        token,
        sessionId,
        currentCategory.key
      );
      moveToNextCategory();
    }
  }

  /* -------------------------------------------------------
     NEXT CATEGORY / COMPLETE QUESTIONNAIRE
  ------------------------------------------------------- */

  async function moveToNextCategory() {
    const nextCategory = categoryIndex + 1;

    if (nextCategory < categories.length) {
      setCategoryIndex(nextCategory);
      setScreen("intro");
    } else {
      await completeQuestionnaire(
        token,
        sessionId
      );
      alert("Questionnaire Completed 🎉");
    }
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  if (screen === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );

  if (screen === "error")
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-black">
        Something went wrong
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">

      {/* INTRO */}
      {screen === "intro" && (
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-bold">
            {categoryIntro?.title}
          </h1>
          <p>{categoryIntro?.description}</p>
          <button
            onClick={loadItems}
            className="w-full py-4 bg-pink-500 rounded-full text-black font-semibold"
          >
            Get Started
          </button>
        </div>
      )}

      {/* ITEMS */}
      {screen === "items" && (
        <div className="max-w-md w-full space-y-4">
          <h2 className="text-xl font-semibold text-center">
            {currentCategory?.name}
          </h2>

          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={`w-full py-3 rounded-lg border ${
                selectedItems.includes(item.key)
                  ? "border-pink-500 bg-pink-500/20"
                  : "border-gray-600"
              }`}
            >
              {item.name}
            </button>
          ))}

          <button
            onClick={handleSaveSelection}
            className="w-full py-4 bg-pink-500 rounded-full text-black font-semibold"
          >
            Continue
          </button>
        </div>
      )}

      {/* QUESTIONS */}
      {screen === "questions" &&
        questions.length > 0 && (
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              {progress}% Completed
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-black">
              {questions[qIndex].question_text}
            </div>

            {questions[qIndex].options.map(
              (opt) => (
                <button
                  key={opt.option_id}
                  onClick={() =>
                    handleAnswer(opt.option_id)
                  }
                  className="w-full py-3 border border-pink-500 rounded-lg"
                >
                  {opt.label}
                </button>
              )
            )}
          </div>
        )}
    </div>
  );
}