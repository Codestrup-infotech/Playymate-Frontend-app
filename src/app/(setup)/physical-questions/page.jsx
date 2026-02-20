// "use client";

// import PhysicalQuestionPage from "../../../components/PhysicalQuestionPage";

// import { fetchSportsItems } from "./api/page";

// export default function Page() {
//   return (
//     <PhysicalQuestionPage
//       category="sports"
//       fetchItems={fetchSportsItems}
//     />
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";

// const BASE_URL =
//   "https://api-dev.playymate.com/api/v1/questionnaire/categories";

// const CATEGORY_STYLES = {
//   sports: {
//     gif: "/Gif/sportGif.gif",
//     gradient: "from-blue-500 to-cyan-500",
//     border: "border-blue-400",
//   },
//   hobbies: {
//     gif: "/Gif/hobbiesGif.gif",
//     gradient: "from-orange-500 to-red-500",
//     border: "border-orange-400",
//   },
//   interests: {
//     gif: "/Gif/interestsGif.gif",
//     gradient: "from-green-500 to-emerald-500",
//     border: "border-green-400",
//   },
//   activities: {
//     gif: "/Gif/activitiesGif.gif",
//     gradient: "from-purple-500 to-pink-500",
//     border: "border-purple-400",
//   },
//   nostalgia: {
//     gif: "/Gif/nostalgiaGif.gif",
//     gradient: "from-yellow-500 to-amber-500",
//     border: "border-yellow-400",
//   },
// };

// export default function PhysicalQuestionPage() {
//   const router = useRouter();

//   const [categories, setCategories] = useState([]);
//   const [step, setStep] = useState(0);
//   const [items, setItems] = useState([]);
//   const [completed, setCompleted] = useState([]);
//   const [maxSelection, setMaxSelection] = useState(3);
//   const [title, setTitle] = useState("");
//   const [loading, setLoading] = useState(true);

//   const currentCategory = categories[step];

//   const completedKey = currentCategory
//     ? `completed-${currentCategory.key}`
//     : "";

//   const clickedKey = currentCategory
//     ? `clicked-${currentCategory.key}`
//     : "";

//   // 1️⃣ Fetch Categories (Fully Dynamic)
//   useEffect(() => {
//     async function fetchCategories() {
//       const res = await axios.get(BASE_URL);

//       const prefs =
//         res.data.data.preference_categories
//           .filter((c) => c.category_type === "preference")
//           .sort((a, b) => a.flow_order - b.flow_order);

//       setCategories(prefs);
//     }

//     fetchCategories();
//   }, []);

//   // 2️⃣ Fetch Items Per Category
//   useEffect(() => {
//     if (!currentCategory) return;

//     async function fetchItems() {
//       setLoading(true);

//       const res = await axios.get(
//         `${BASE_URL}/${currentCategory.key}/items`
//       );

//       const data = res.data.data;

//       setItems(data.items || []);
//       setMaxSelection(data.max_selection || 3);
//       setTitle(data.category_title || currentCategory.title);

//       const saved = localStorage.getItem(completedKey);
//       setCompleted(saved ? JSON.parse(saved) : []);

//       setTimeout(() => setLoading(false), 1500);
//     }

//     fetchItems();
//   }, [step, currentCategory]);

//   // 3️⃣ When Coming Back From Question Page
//   useEffect(() => {
//     if (!currentCategory) return;

//     const lastClicked = localStorage.getItem(clickedKey);
//     if (!lastClicked) return;

//     const saved = JSON.parse(localStorage.getItem(completedKey) || "[]");

//     if (!saved.includes(lastClicked)) {
//       const updated = [...saved, lastClicked];
//       localStorage.setItem(completedKey, JSON.stringify(updated));
//       setCompleted(updated);

//       if (updated.length === maxSelection) {
//         if (step < categories.length - 1) {
//           setStep((prev) => prev + 1);
//         } else {
//           router.push("/user/account");
//         }
//       }
//     }

//     localStorage.removeItem(clickedKey);
//   }, [currentCategory]);

//   const handleClick = (item) => {
//     if (completed.includes(item.key)) return;

//     localStorage.setItem(clickedKey, item.key);
//     router.push(
//       `/physical-questions/${currentCategory.key}/${item.key}`
//     );
//   };

//   if (!currentCategory || loading) {
//     const style = CATEGORY_STYLES[currentCategory?.key] || {};
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <img
//           src={style.gif}
//           alt="Loading"
//           className="w-[300px] md:w-[420px] object-contain"
//         />
//       </div>
//     );
//   }

//   const style = CATEGORY_STYLES[currentCategory.key] || {};

//   return (
//     <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
//       <div className="w-full max-w-6xl">

//         <div className="text-center mb-10 flex flex-col space-y-5">
//           <h1 className="text-white text-3xl md:text-4xl font-semibold">
//             What {title} Do You Love to{" "}
//             <span
//               className={`bg-gradient-to-r px-2 font-bold ${style.gradient} bg-clip-text text-transparent`}
//             >
//               Play
//             </span>
//           </h1>
//           <p className="text-gray-400">
//             Choose up to {maxSelection}
//           </p>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {items.map((item) => {
//             const isDisabled = completed.includes(item.key);

//             return (
//               <button
//                 key={item.id}
//                 disabled={isDisabled}
//                 onClick={() => handleClick(item)}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
//                   ${
//                     isDisabled
//                       ? `bg-gradient-to-r ${style.gradient} text-white ${style.border} opacity-70 cursor-not-allowed`
//                       : `bg-[#050B14] ${style.border} text-white hover:bg-gradient-to-r hover:${style.gradient}`
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
// import axios from "axios";

// const BASE_URL =
//   "https://api-dev.playymate.com/api/v1/questionnaire/categories";

// const CATEGORY_STYLES = {
//   sports: {
//     gif: "/Gif/sportGif.gif",
//     gradient: "from-blue-500 to-cyan-500",
//     border: "border-blue-400",
//   },
//   hobbies: {
//     gif: "/Gif/hobbiesGif.gif",
//     gradient: "from-orange-500 to-red-500",
//     border: "border-orange-400",
//   },
//   interests: {
//     gif: "/Gif/interestsGif.gif",
//     gradient: "from-green-500 to-emerald-500",
//     border: "border-green-400",
//   },
//   activities: {
//     gif: "/Gif/activitiesGif.gif",
//     gradient: "from-purple-500 to-pink-500",
//     border: "border-purple-400",
//   },
//   nostalgia: {
//     gif: "/Gif/nostalgiaGif.gif",
//     gradient: "from-yellow-500 to-amber-500",
//     border: "border-yellow-400",
//   },
// };

// export default function PhysicalQuestionPage() {
//   const router = useRouter();

//   const [categories, setCategories] = useState([]);
//   const [step, setStep] = useState(0);
//   const [items, setItems] = useState([]);
//   const [completed, setCompleted] = useState([]);
//   const [maxSelection, setMaxSelection] = useState(3);
//   const [title, setTitle] = useState("");
//   const [loading, setLoading] = useState(true);

//   const currentCategory = categories[step];

//   const completedKey = currentCategory
//     ? `completed-${currentCategory.key}`
//     : "";

//   const clickedKey = currentCategory
//     ? `clicked-${currentCategory.key}`
//     : "";

//   // 🔹 Fetch categories
//   useEffect(() => {
//     async function fetchCategories() {
//       const res = await axios.get(BASE_URL);

//       const prefs =
//         res.data.data.preference_categories
//           .filter((c) => c.category_type === "preference")
//           .sort((a, b) => a.flow_order - b.flow_order);

//       setCategories(prefs);
//     }

//     fetchCategories();
//   }, []);

//   // 🔹 Fetch items
//   useEffect(() => {
//     if (!currentCategory) return;

//     async function fetchItems() {
//       setLoading(true);

//       const res = await axios.get(
//         `${BASE_URL}/${currentCategory.key}/items`
//       );

//       const data = res.data.data;

//       setItems(data.items || []);
//       setMaxSelection(data.max_selection || 3);
//       setTitle(data.category_title || currentCategory.title);

//       const saved = localStorage.getItem(completedKey);
//       setCompleted(saved ? JSON.parse(saved) : []);

//       setTimeout(() => setLoading(false), 800);
//     }

//     fetchItems();
//   }, [currentCategory]);

//   // 🔹 Handle return from question page
//   useEffect(() => {
//     if (!currentCategory) return;

//     const lastClicked = localStorage.getItem(clickedKey);
//     if (!lastClicked) return;

//     const saved = JSON.parse(localStorage.getItem(completedKey) || "[]");

//     if (!saved.includes(lastClicked)) {
//       const updated = [...saved, lastClicked];
//       localStorage.setItem(completedKey, JSON.stringify(updated));
//       setCompleted(updated);

//       if (updated.length === maxSelection) {
//         if (step < categories.length - 1) {
//           setStep((prev) => prev + 1);
//         } else {
//           router.push("/user/account");
//         }
//       }
//     }

//     localStorage.removeItem(clickedKey);
//   }, [currentCategory]);

//   const handleClick = (item) => {
//     if (completed.includes(item.key)) return;

//     localStorage.setItem(clickedKey, item.key);

//     router.push(
//       `/physical-questions/${currentCategory.key}/${item.key}`
//     );
//   };

//   if (!currentCategory || loading) {
//     const style = CATEGORY_STYLES[currentCategory?.key] || {};
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <img
//           src={style.gif}
//           alt="Loading"
//           className="w-[300px] md:w-[420px] object-contain"
//         />
//       </div>
//     );
//   }

//   const style = CATEGORY_STYLES[currentCategory.key] || {};

//   return (
//     <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
//       <div className="w-full max-w-6xl">
//         <div className="text-center mb-10 flex flex-col space-y-5">
//           <h1 className="text-white text-3xl md:text-4xl font-semibold">
//             What {title} Do You Love to{" "}
//             <span
//               className={`bg-gradient-to-r px-2 font-bold ${style.gradient} bg-clip-text text-transparent`}
//             >
//               Play
//             </span>
//           </h1>
//           <p className="text-gray-400">
//             Choose up to {maxSelection}
//           </p>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {items.map((item) => {
//             const isDisabled = completed.includes(item.key);

//             return (
//               <button
//                 key={item.id}
//                 disabled={isDisabled}
//                 onClick={() => handleClick(item)}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
//                   ${
//                     isDisabled
//                       ? `bg-gradient-to-r ${style.gradient} text-white ${style.border} opacity-70 cursor-not-allowed`
//                       : `bg-[#050B14] ${style.border} text-white hover:bg-gradient-to-r hover:${style.gradient}`
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
import { useRouter } from "next/navigation";
import axios from "axios";

const BASE_URL =
  "https://api-dev.playymate.com/api/v1/questionnaire/categories";

const CATEGORY_STYLES = {
  sports: {
    gif: "/Gif/sportGif.gif",
    gradient: "from-blue-500 to-cyan-500",
    border: "border-blue-400",
  },
  hobbies: {
    gif: "/Gif/hobbiesGif.gif",
    gradient: "from-orange-500 to-red-500",
    border: "border-orange-400",
  },
  interests: {
    gif: "/Gif/interestsGif.gif",
    gradient: "from-green-500 to-emerald-500",
    border: "border-green-400",
  },
  activities: {
    gif: "/Gif/activitiesGif.gif",
    gradient: "from-purple-500 to-pink-500",
    border: "border-purple-400",
  },
  nostalgia: {
    gif: "/Gif/nostalgiaGif.gif",
    gradient: "from-yellow-500 to-amber-500",
    border: "border-yellow-400",
  },
};

export default function PhysicalQuestionPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [maxSelection, setMaxSelection] = useState(3);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const currentCategory = categories[step];

  // 🔹 Fetch categories dynamically
  useEffect(() => {
    async function fetchCategories() {
      const res = await axios.get(BASE_URL);

      const prefs =
        res.data.data.preference_categories
          .filter((c) => c.category_type === "preference")
          .sort((a, b) => a.flow_order - b.flow_order);

      setCategories(prefs);

      // restore saved step
      const savedStep = localStorage.getItem("pq_step");
      if (savedStep) {
        setStep(Number(savedStep));
      }
    }

    fetchCategories();
  }, []);

  // 🔹 Save step persistently
  useEffect(() => {
    localStorage.setItem("pq_step", step);
  }, [step]);

  // 🔹 Fetch items for current step
  useEffect(() => {
    if (!currentCategory) return;

    async function fetchItems() {
      setLoading(true);

      const res = await axios.get(
        `${BASE_URL}/${currentCategory.key}/items`
      );

      const data = res.data.data;

      setItems(data.items || []);
      setMaxSelection(data.max_selection || 3);
      setTitle(data.category_title || currentCategory.title);

      const saved = localStorage.getItem(
        `completed-${currentCategory.key}`
      );

      setCompleted(saved ? JSON.parse(saved) : []);

      setTimeout(() => setLoading(false), 800);
    }

    fetchItems();
  }, [currentCategory]);

  // 🔹 Handle return from question page
  useEffect(() => {
    if (!currentCategory) return;

    const lastClicked = localStorage.getItem(
      `clicked-${currentCategory.key}`
    );

    if (!lastClicked) return;

    const saved = JSON.parse(
      localStorage.getItem(`completed-${currentCategory.key}`) || "[]"
    );

    if (!saved.includes(lastClicked)) {
      const updated = [...saved, lastClicked];

      localStorage.setItem(
        `completed-${currentCategory.key}`,
        JSON.stringify(updated)
      );

      setCompleted(updated);

      if (updated.length === maxSelection) {
        if (step < categories.length - 1) {
          setStep(step + 1);
        } else {
          localStorage.removeItem("pq_step");
          router.push("/user/account");
        }
      }
    }

    localStorage.removeItem(`clicked-${currentCategory.key}`);
  }, [currentCategory]);

  const handleClick = (item) => {
    if (completed.includes(item.key)) return;

    localStorage.setItem(
      `clicked-${currentCategory.key}`,
      item.key
    );

    router.push(
      `/physical-questions/${currentCategory.key}/${item.key}`
    );
  };

  if (!currentCategory || loading) {
    const style = CATEGORY_STYLES[currentCategory?.key] || {};
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <img
          src={style.gif}
          alt="Loading"
          className="w-[300px] md:w-[420px] object-contain"
        />
      </div>
    );
  }

  const style = CATEGORY_STYLES[currentCategory.key] || {};

  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-center px-4">
      <div className="w-full max-w-6xl">

        <div className="text-center mb-10 flex flex-col space-y-5">
          <h1 className="text-white text-3xl md:text-4xl font-semibold">
            What {title} Do You Love to{" "}
            <span
              className={`bg-gradient-to-r px-2 font-bold ${style.gradient} bg-clip-text text-transparent`}
            >
              Play
            </span>
          </h1>
          <p className="text-gray-400">
            Choose up to {maxSelection}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const isDisabled = completed.includes(item.key);

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => handleClick(item)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                  ${
                    isDisabled
                      ? `bg-gradient-to-r ${style.gradient} text-white ${style.border} opacity-70 cursor-not-allowed`
                      : `bg-[#050B14] ${style.border} text-white hover:bg-gradient-to-r hover:${style.gradient}`
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
