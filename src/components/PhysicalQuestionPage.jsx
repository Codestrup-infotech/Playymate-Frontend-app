// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function PhysicalQuestionPage({ category, fetchItems }) {
//   const router = useRouter();

//   const [items, setItems] = useState([]);
//   const [maxSelection, setMaxSelection] = useState(3);
//   const [selected, setSelected] = useState([]);
//   const [title, setTitle] = useState("Sports");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function load() {
//       try {
//         const data = await fetchItems();
//         setItems(data.items || []);
//         setMaxSelection(data.max_selection || 3);
//         setTitle(data.category_title || "Sports");
//       } catch (err) {
//         console.error("API Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();
//   }, [fetchItems]);

//   const toggleAndGo = (item) => {
//     setSelected((prev) => {
//       if (prev.includes(item.key)) {
//         return prev.filter((s) => s !== item.key);
//       }

//       if (prev.length === maxSelection) {
//         const newArr = [...prev];
//         newArr.pop();
//         return [...newArr, item.key];
//       }

//       return [...prev, item.key];
//     });

//     router.push(`/physical-questions/${category}/${item.key}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <img
//       src="/Gif/sportGif.gif"
//       alt="Hobbies Intro"
//       className="w-[300px] md:w-[420px] object-contain z-10"
//     />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
//       <div className="w-full max-w-6xl">

//         {/* Header */}
//         <div className="text-center mb-10 flex flex-col space-y-5">
//           <h1 className="text-white text-3xl md:text-4xl font-Playfair Display font-semibold">
//             What {title} Do You Love to{" "}
//             <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
//               Play
//             </span>
//           </h1>
//           <p className="text-gray-400 font-Poppins">
//             Choose up to {maxSelection} sports for your profile
//           </p>
//         </div>

//         {/* Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 font-Poppins">
//           {items.map((item) => {
//             const isActive = selected.includes(item.key);

//             return (
//               <button
//                 key={item.id}
//                 onClick={() => toggleAndGo(item)}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
//                   ${
//                     isActive
//                       ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 scale-[1.02]"
//                       : "bg-[#050B14] border-[#003BFF] text-white hover:border-none hover:bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-[1.02]"
//                   }`}
//               >
//                 <span className="text-lg">{item.icon}</span>
//                 <span className="text-sm md:text-base font-medium">
//                   {item.title}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function PhysicalQuestionPage({ category, fetchItems }) {
//   const router = useRouter();

//   const [items, setItems] = useState([]);
//   const [maxSelection, setMaxSelection] = useState(3);
//   const [selected, setSelected] = useState([]);
//   const [title, setTitle] = useState("Sports");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let apiDone = false;
//     let timerDone = false;

//     async function load() {
//       try {
//         const data = await fetchItems();
//         setItems(data.items || []);
//         setMaxSelection(data.max_selection || 3);
//         setTitle(data.category_title || "Sports");
//       } catch (err) {
//         console.error("API Error:", err);
//       } finally {
//         apiDone = true;
//         if (timerDone) setLoading(false);
//       }
//     }

//     load();

//     const timer = setTimeout(() => {
//       timerDone = true;
//       if (apiDone) setLoading(false);
//     }, 4000); // ⏱ 4 seconds loader

//     return () => clearTimeout(timer);
//   }, [fetchItems]);

//   const toggleAndGo = (item) => {
//     setSelected((prev) => {
//       if (prev.includes(item.key)) {
//         return prev.filter((s) => s !== item.key);
//       }

//       if (prev.length === maxSelection) {
//         const newArr = [...prev];
//         newArr.pop();
//         return [...newArr, item.key];
//       }

//       return [...prev, item.key];
//     });

//     router.push(`/physical-questions/${category}/${item.key}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <img
//           src="/Gif/sportGif.gif"
//           alt="Loading"
//           className="w-[300px] md:w-[420px] object-contain z-10"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
//       <div className="w-full max-w-6xl">

//         {/* Header */}
//         <div className="text-center mb-10 flex flex-col space-y-5">
//           <h1 className="text-white text-3xl md:text-4xl font-Playfair Display font-semibold">
//             What {title} Do You Love to{" "}
//             <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
//               Play
//             </span>
//           </h1>
//           <p className="text-gray-400 font-Poppins">
//             Choose up to {maxSelection} sports for your profile
//           </p>
//         </div>

//         {/* Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 font-Poppins">
//           {items.map((item) => {
//             const isActive = selected.includes(item.key);

//             return (
//               <button
//                 key={item.id}
//                 onClick={() => toggleAndGo(item)}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
//                   ${
//                     isActive
//                       ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 scale-[1.02]"
//                       : "bg-[#050B14] border-[#003BFF] text-white hover:border-none hover:bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-[1.02]"
//                   }`}
//               >
//                 <span className="text-lg">{item.icon}</span>
//                 <span className="text-sm md:text-base font-medium">
//                   {item.title}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function PhysicalQuestionPage({ category, fetchItems }) {
//   const router = useRouter();

//   const [items, setItems] = useState([]);
//   const [maxSelection, setMaxSelection] = useState(3);
//   const [completed, setCompleted] = useState([]);
//   const [title, setTitle] = useState("Sports");
//   const [loading, setLoading] = useState(true);

//   const completedKey = `physical-completed-${category}`;
//   const clickedKey = `physical-last-clicked-${category}`;
//   const loaderKey = `physical-loader-shown-${category}`;

//   // Load API + Completed
//   useEffect(() => {
//     async function load() {
//       try {
//         const data = await fetchItems();
//         setItems(data.items || []);
//         setMaxSelection(data.max_selection || 3);
//         setTitle(data.category_title || "Sports");
//       } catch (err) {
//         console.error("API Error:", err);
//       }

//       const saved = localStorage.getItem(completedKey);
//       if (saved) setCompleted(JSON.parse(saved));

//       // GIF only first time
//       const loaderShown = localStorage.getItem(loaderKey);
//       if (!loaderShown) {
//         setTimeout(() => {
//           setLoading(false);
//           localStorage.setItem(loaderKey, "true");
//         }, 4000);
//       } else {
//         setLoading(false);
//       }
//     }

//     load();
//   }, [fetchItems]);

//   // When coming back from question page
//   useEffect(() => {
//     const lastClicked = localStorage.getItem(clickedKey);

//     if (lastClicked) {
//       const saved = JSON.parse(localStorage.getItem(completedKey) || "[]");

//       if (!saved.includes(lastClicked)) {
//         const updated = [...saved, lastClicked];
//         setCompleted(updated);
//         localStorage.setItem(completedKey, JSON.stringify(updated));

//         if (updated.length === maxSelection) {
//           router.push("/physical-questions/hobbies");
//         }
//       }

//       localStorage.removeItem(clickedKey);
//     }
//   }, [maxSelection, router]);

//   const toggleAndGo = (item) => {
//     if (completed.includes(item.key)) return;

//     localStorage.setItem(clickedKey, item.key);
//     router.push(`/physical-questions/${category}/${item.key}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <img
//           src="/Gif/sportGif.gif"
//           alt="Loading"
//           className="w-[300px] md:w-[420px] object-contain z-10"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
//       <div className="w-full max-w-6xl">

//         <div className="text-center mb-10 flex flex-col space-y-5">
//           <h1 className="text-white text-3xl md:text-4xl font-Playfair Display font-semibold">
//             What {title} Do You Love to{" "}
//             <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
//               Play
//             </span>
//           </h1>
//           <p className="text-gray-400 font-Poppins">
//             Choose up to {maxSelection} sports for your profile
//           </p>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 font-Poppins">
//           {items.map((item) => {
//             const isDisabled = completed.includes(item.key);

//             return (
//               <button
//                 key={item.id}
//                 disabled={isDisabled}
//                 onClick={() => toggleAndGo(item)}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
//                   ${
//                     isDisabled
//                       ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 opacity-60 cursor-not-allowed"
//                       : "bg-[#050B14] border-[#003BFF] text-white hover:border-none hover:bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-[1.02]"
//                   }`}
//               >
//                 <span className="text-lg">{item.icon}</span>
//                 <span className="text-sm md:text-base font-medium">
//                   {item.title}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import axios from "axios";

/*
  Fully Dynamic Preference Flow
  - Fetch categories dynamically
  - Use only preference_categories
  - Sort by flow_order
  - Auto-fetch items per category
  - Auto move to next after max_selection
  - No hardcoded categories
*/

const BASE_URL =
  "https://api-dev.playymate.com/api/v1/questionnaire/categories";

export default function PhysicalQuestionPage() {
  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [maxSelection, setMaxSelection] = useState(3);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch categories once
  useEffect(() => {
    async function fetchCategories() {
      const res = await axios.get(BASE_URL);
      const preferenceCategories =
        res.data.data.preference_categories || [];

      const sorted = preferenceCategories
        .filter((cat) => cat.category_type === "preference")
        .sort((a, b) => a.flow_order - b.flow_order);

      setCategories(sorted);
    }

    fetchCategories();
  }, []);

  // Fetch items when step changes
  useEffect(() => {
    if (!categories.length) return;

    async function fetchItems() {
      setLoading(true);
      setSelected([]);

      const currentCategory = categories[step];

      const res = await axios.get(
        `${BASE_URL}/${currentCategory.key}/items`
      );

      const data = res.data.data;

      setItems(data.items || []);
      setMaxSelection(data.max_selection || 3);
      setTitle(data.category_title || currentCategory.title);

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }

    fetchItems();
  }, [step, categories]);

  // Auto move to next category
  useEffect(() => {
    if (selected.length === maxSelection && categories.length) {
      if (step < categories.length - 1) {
        setStep((prev) => prev + 1);
      } else {
        console.log("Preference Flow Completed");
      }
    }
  }, [selected, maxSelection, categories, step]);

  const handleSelect = (item) => {
    if (selected.includes(item.key)) return;

    if (selected.length < maxSelection) {
      setSelected((prev) => [...prev, item.key]);
    }
  };

  if (loading || !categories.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <img
          src="/Gif/sportGif.gif"
          alt="Loading"
          className="w-[300px] md:w-[420px] object-contain"
        />
      </div>
    );
  }

  const currentCategory = categories[step];

  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
      <div className="w-full max-w-6xl">

        <div className="text-center mb-10 flex flex-col space-y-5">
          <h1 className="text-white text-3xl md:text-4xl font-semibold">
            What {title} Do You Love to{" "}
            <span className="bg-gradient-to-r px-2 font-bold from-pink-400 to-orange-400 bg-clip-text text-transparent">
              Choose
            </span>
          </h1>
          <p className="text-gray-400">
            Choose up to {maxSelection}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const isActive = selected.includes(item.key);

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                disabled={isActive}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 scale-[1.02] opacity-80"
                      : "bg-[#050B14] border-[#003BFF] text-white hover:border-none hover:bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-[1.02]"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm md:text-base font-medium">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
