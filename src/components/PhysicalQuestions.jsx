"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchItemQuestions, getCategoryTheme, submitAnswer } from "@/lib/categoryApi";

/**
 * PhysicalQuestions - A reusable component for displaying and handling questionnaire questions
 * @param {Object} props
 * @param {string} props.category - The category slug
 * @param {string} props.itemId - The item ID to fetch questions for
 * @param {string} props.itemTitle - Title of the selected item
 * @param {string} props.sessionId - Session ID (defaults to a stored one)
 */
export default function PhysicalQuestions({
  category,
  itemId,
  itemTitle,
  sessionId: propSessionId,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questionsData, setQuestionsData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [token, setToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const theme = getCategoryTheme(category);
  const sessionId = propSessionId || "88035460-95cb-47ed-8634-dff2e9d2f856"; // Default session or prop

  // Get token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch questions data
  useEffect(() => {
    if (!token || !itemId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchItemQuestions(category, itemId, sessionId, token);
        setQuestionsData(data);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, itemId, sessionId, token]);

  // Handle answer selection
  const handleSelect = useCallback((questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  // Navigate to next question
  const handleNext = useCallback(async () => {
    if (!questionsData) return;

    // Submit current answer if needed
    const currentQuestion = questionsData.questions[currentStep];
    if (answers[currentQuestion.question_id] && token) {
      try {
        await submitAnswer(
          currentQuestion.question_id,
          answers[currentQuestion.question_id],
          sessionId,
          token
        );
      } catch (err) {
        console.error("Error submitting answer:", err);
      }
    }

    if (currentStep < questionsData.questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // All questions answered - complete
      handleComplete();
    }
  }, [currentStep, questionsData, answers, token, sessionId]);

  // Navigate to previous question
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Complete the questionnaire
  const handleComplete = useCallback(async () => {
    setSubmitting(true);
    try {
      // Final submission if needed
      if (token) {
        await submitAnswer(
          questionsData?.questions[currentStep]?.question_id,
          answers[questionsData?.questions[currentStep]?.question_id],
          sessionId,
          token
        );
      }
      
      // Navigate back to category
      router.push(`/physical-questions/${category}`);
    } catch (err) {
      console.error("Error completing questionnaire:", err);
      // Still navigate back on error
      router.push(`/physical-questions/${category}`);
    } finally {
      setSubmitting(false);
    }
  }, [token, sessionId, category, router, currentStep, questionsData, answers]);

  // Calculate progress
  const progress = questionsData
    ? Math.round(((currentStep + 1) / questionsData.questions.length) * 100)
    : 0;

  // Loading state
  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <p className="text-white/60">Checking session...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4" />
          <p className="text-white/60">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/physical-questions/${category}`)}
            className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!questionsData || questionsData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">No questions available</p>
          <button
            onClick={() => router.push(`/physical-questions/${category}`)}
            className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questionsData.questions[currentStep];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800">
        <div
          className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-md mx-auto p-6 pt-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wider text-white/60 mb-2">
            {itemTitle || questionsData.item_title}
          </p>
          <h1 className="text-2xl font-bold">
            {currentQuestion.question_text}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Question {currentStep + 1} of {questionsData.questions.length}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const active = answers[currentQuestion.question_id] === opt.value;

            return (
              <button
                key={opt.option_id || opt.value}
                onClick={() => handleSelect(currentQuestion.question_id, opt.value)}
                className={`
                  w-full text-left px-5 py-4 rounded-xl border transition-all duration-200
                  ${
                    active
                      ? `border-transparent bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
                      : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40"
                  }
                `}
              >
                <span className="font-medium">{opt.label || opt.value}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-medium hover:bg-white/10 transition"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.question_id] || submitting}
            className={`
              flex-1 py-3 rounded-xl font-semibold transition-all
              ${
                answers[currentQuestion.question_id] && !submitting
                  ? `bg-gradient-to-r ${theme.gradient} text-white`
                  : "bg-white/20 text-white/40 cursor-not-allowed"
              }
            `}
          >
            {submitting
              ? "Saving..."
              : currentStep === questionsData.questions.length - 1
              ? "Complete"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
