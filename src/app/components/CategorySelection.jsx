"use client";

import { useEffect, useState } from "react";
import {
  getCategories,
  getCategoryIntro,
  getCategoryItems,
  startQuestionnaireSession,
  getCategoryItems as fetchItems,
} from "@/lib/api/categoryApi";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CategorySelection() {
  const [sessionId, setSessionId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoryIndex, setCategoryIndex] = useState(0);

  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [questions, setQuestions] = useState([]);
  const [currentItemKey, setCurrentItemKey] = useState(null);
  const [qIndex, setQIndex] = useState(0);

  const [screen, setScreen] = useState("loading");
  const [progress, setProgress] = useState(0);

  const currentCategory = categories?.[categoryIndex];

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    try {
      setScreen("loading");

      const session = await startQuestionnaireSession(
        localStorage.getItem("access_token"),
        true
      );

      setSessionId(session.session_id);

      const categoryData = await getCategories("preference");
      setCategories(categoryData);

      setScreen("intro");
    } catch (err) {
      console.error(err);
    }
  }

  /* ---------------- CATEGORY INTRO ---------------- */

  useEffect(() => {
    if (currentCategory && sessionId) {
      loadCategoryIntro(currentCategory.key);
    }
  }, [categoryIndex, sessionId]);

  async function loadCategoryIntro(categoryKey) {
    setScreen("intro");

    await new Promise((resolve) =>
      setTimeout(resolve, 4000)
    );

    const data = await getCategoryItems(
      categoryKey,
      sessionId
    );

    setItems(data.items);
    setScreen("items");
  }

  /* ---------------- ITEM SELECTION ---------------- */

  function toggleItem(key) {
    if (selectedItems.includes(key)) {
      setSelectedItems((prev) =>
        prev.filter((k) => k !== key)
      );
    } else {
      setSelectedItems((prev) => [...prev, key]);
    }
  }

  async function saveSelection() {
    const response = await fetch(
      `${BASE_URL}/questionnaire/selection`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "access_token"
          )}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          category_key: currentCategory.key,
          selected_items: selectedItems,
        }),
      }
    );

    const json = await response.json();

    if (json.status === "success") {
      loadQuestions(selectedItems[0]);
    }
  }

  /* ---------------- QUESTIONS ---------------- */

  async function loadQuestions(itemKey) {
    setCurrentItemKey(itemKey);

    const res = await fetch(
      `${BASE_URL}/questionnaire/items/${itemKey}/questions?session_id=${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "access_token"
          )}`,
        },
      }
    );

    const json = await res.json();

    setQuestions(json.data.questions);
    setQIndex(0);
    setScreen("questions");
  }

  async function submitAnswer(optionId) {
    const question = questions[qIndex];

    await fetch(
      `${BASE_URL}/questionnaire/answer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "access_token"
          )}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          item_key: currentItemKey,
          question_id: question.question_id,
          selected_option_ids: [optionId],
        }),
      }
    );

    if (qIndex < questions.length - 1) {
      setQIndex((prev) => prev + 1);
      setProgress(
        Math.round(
          ((qIndex + 2) / questions.length) * 100
        )
      );
    } else {
      setScreen("items");
    }
  }

  /* ---------------- CATEGORY THEME ---------------- */

  const categoryThemes = {
    sports:
      "bg-gradient-to-r from-pink-500 to-orange-400",
    hobbies:
      "bg-gradient-to-r from-blue-500 to-yellow-400",
    music:
      "bg-gradient-to-r from-purple-500 to-pink-400",
  };

  const theme =
    categoryThemes[currentCategory?.key] ||
    "bg-gradient-to-r from-indigo-500 to-cyan-500";

  /* ---------------- RENDER ---------------- */

  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">

      {/* ITEMS SCREEN */}
      {screen === "items" && (
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-center text-2xl font-semibold">
            {currentCategory?.name}
          </h1>

          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={`w-full py-4 rounded-xl border transition ${
                selectedItems.includes(item.key)
                  ? "border-pink-500 bg-pink-500/10"
                  : "border-gray-600 hover:bg-white/5"
              }`}
            >
              {item.name}
            </button>
          ))}

          <button
            onClick={saveSelection}
            className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-black font-semibold"
          >
            Continue
          </button>
        </div>
      )}

      {/* QUESTIONS SCREEN */}
      {screen === "questions" && questions.length > 0 && (
        <div className="w-full max-w-md space-y-6">

          {/* Progress Circle */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="gray"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="lime"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={220}
                  strokeDashoffset={
                    220 - (220 * progress) / 100
                  }
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {progress}%
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div
            className={`rounded-2xl p-6 text-center ${theme}`}
          >
            <h2 className="text-lg font-semibold mb-4">
              {questions[qIndex].question_text}
            </h2>
          </div>

          {/* Options */}
          {questions[qIndex].options.map((opt) => (
            <button
              key={opt.option_id}
              onClick={() =>
                submitAnswer(opt.option_id)
              }
              className="w-full py-3 rounded-xl border border-pink-500 hover:bg-pink-500/10"
            >
              {opt.label}
            </button>
          ))}

          <button className="w-full mt-6 py-4 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-black font-semibold">
            Continue
          </button>
        </div>
      )}
    </div>
  );
}