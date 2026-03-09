"use client";

import { useState } from "react";
import { X, Check, Sparkles, MessageSquare, Edit3, Loader2 } from "lucide-react";
import { generateAIBio, updateUserProfile, getCurrentUserId } from "@/services/profile.service";

export default function BioPopup({ onClose, onSave, initialBio }) {
  const [activeTab, setActiveTab] = useState(initialBio ? "manual" : "ai");
  const [bio, setBio] = useState(initialBio || "");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedBio, setGeneratedBio] = useState("");
  const [error, setError] = useState(null);

  // Generate AI bio from profile data
  const generateAIBioHandler = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Call API with ai_generate: true to generate from profile
      const generated = await generateAIBio(null);
      setGeneratedBio(generated);
      setBio(generated);
    } catch (err) {
      console.error("AI bio generation failed:", err);
      if (err.response?.status === 429) {
        setError("Rate limit exceeded. Please try again later.");
      } else if (err.response?.status === 503) {
        setError("AI service is currently unavailable. Try manual entry.");
      } else {
        setError("Failed to generate bio. Please try again or write manually.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate bio from custom prompt
  const generatePromptBioHandler = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Call API with custom prompt
      const generated = await generateAIBio(prompt);
      setGeneratedBio(generated);
      setBio(generated);
    } catch (err) {
      console.error("Prompt bio generation failed:", err);
      if (err.response?.status === 429) {
        setError("Rate limit exceeded. Please try again later.");
      } else {
        setError("Failed to generate bio from prompt. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!bio.trim()) {
      setError("Please enter a bio or generate one with AI");
      return;
    }

    if (bio.length > 200) {
      setError("Bio must be 200 characters or less");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not found");
      }

      await updateUserProfile(userId, { bio: bio });
      onSave(bio);
    } catch (err) {
      console.error("Failed to save bio:", err);
      if (err.response?.status === 400) {
        if (err.response.data?.error_code === "BIO_CONTENT_BLOCKED") {
          setError("Bio contains blocked content (phone, email, or URL)");
        } else {
          setError(err.response.data?.message || "Invalid bio content");
        }
      } else {
        setError("Failed to save bio. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[480px] bg-[#0f1021] rounded-2xl shadow-xl animate-fadeIn overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-[#0f1021] z-10">
          <div>
            <h2 className="text-white font-semibold text-lg">Add Bio</h2>
            <p className="text-gray-400 text-sm">
              Tell people about yourself and what activities you enjoy.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => handleTabChange("ai")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "ai"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles size={16} />
            AI Generated
          </button>
          <button
            onClick={() => handleTabChange("prompt")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "prompt"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <MessageSquare size={16} />
            Prompt Generated
          </button>
          <button
            onClick={() => handleTabChange("manual")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === "manual"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Edit3 size={16} />
            Manual
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* AI Generated Tab */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                AI generates a bio based on your profile main type and interests.
              </p>

              <button
                onClick={generateAIBioHandler}
                disabled={isGenerating}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-orange-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Bio with AI
                  </>
                )}
              </button>

              {generatedBio && (
                <div className="bg-[#1b1d3a] rounded-lg p-4">
                  <p className="text-white">{generatedBio}</p>
                </div>
              )}
            </div>
          )}

          {/* Prompt Generated Tab */}
          {activeTab === "prompt" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Enter a prompt and AI will generate a bio for you.
              </p>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a fun bio for someone who loves cricket and travelling"
                className="w-full p-3 rounded-lg bg-[#1b1d3a] text-white outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
              />

              <button
                onClick={generatePromptBioHandler}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-orange-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquare size={20} />
                    Generate from Prompt
                  </>
                )}
              </button>

              {generatedBio && (
                <div className="bg-[#1b1d3a] rounded-lg p-4">
                  <p className="text-white">{generatedBio}</p>
                </div>
              )}
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === "manual" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Write your bio manually.
              </p>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g., Weekend cricket player. Love travelling and outdoor sports."
                className="w-full p-3 rounded-lg bg-[#1b1d3a] text-white outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
              />

              <p className="text-gray-500 text-xs">{bio.length}/200 characters</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!bio.trim() || saving}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-orange-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                Save Bio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
