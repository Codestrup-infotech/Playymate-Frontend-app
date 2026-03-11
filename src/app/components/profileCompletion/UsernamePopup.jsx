"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { getUsernameSuggestions, updateUserProfile, getCurrentUserId } from "@/services/profile.service";

export default function UsernamePopup({ onClose, onSave, initialUsername }) {
  const [username, setUsername] = useState(initialUsername || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(initialUsername || "");
  const [error, setError] = useState(null);

  // Fetch suggestions from API when username changes (debounced)
  const fetchSuggestions = useCallback(async (input) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // The API returns suggestions based on user's name and interests
      const data = await getUsernameSuggestions();
      // Filter suggestions to match input prefix for better UX
      const filtered = data?.filter(s => s.toLowerCase().startsWith(input.toLowerCase())) || [];
      setSuggestions(filtered.length > 0 ? filtered : data || []);
    } catch (err) {
      console.error("Failed to get suggestions:", err);
      setError("Failed to load suggestions");
      // Fallback to local generation if API fails
      generateLocalSuggestions(input);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fallback local suggestion generation
  const generateLocalSuggestions = (baseName) => {
    if (baseName.length < 2) {
      setSuggestions([]);
      return;
    }

    const base = baseName.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setSuggestions([
      `${base}`,
      `${base}_play`,
      `${base}_sports`,
      `${base}_${Math.floor(Math.random() * 99)}`,
      `${base}city`,
    ]);
  };

  // Debounced effect for fetching suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, fetchSuggestions]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow lowercase letters, numbers, and underscores
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(sanitized);
    setSelected("");
  };

  const handleSelectSuggestion = (suggestion) => {
    setSelected(suggestion);
    setUsername(suggestion);
  };

  const handleSave = async () => {
    const finalUsername = selected || username;
    if (finalUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error("User not found");
      }

      await updateUserProfile(userId, { username: finalUsername });
      onSave(finalUsername);
    } catch (err) {
      console.error("Failed to save username:", err);
      // Handle specific error codes
      if (err.response?.status === 409) {
        setError("Username is already taken. Please try another.");
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || "Invalid username format");
      } else {
        setError("Failed to save username. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[480px] bg-[#0f1021] rounded-2xl shadow-xl animate-fadeIn overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-white font-semibold text-lg">Create Username</h2>
            <p className="text-gray-400 text-sm">
              Your username helps friends find and follow you on Playymate.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Input */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
              <input
                type="text"
                value={username}
                onChange={handleInputChange}
                placeholder="Enter username"
                className="w-full p-3 pl-8 rounded-lg bg-[#1b1d3a] text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">3-20 characters, lowercase letters, numbers, and underscores only</p>
          </div>

          {/* Suggestions */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              <span className="ml-2 text-gray-400">Loading suggestions...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              <p className="text-gray-400 text-sm mb-3">Suggested usernames</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selected === suggestion || username === suggestion
                        ? "bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                        : "bg-[#1b1d3a] text-gray-300 hover:bg-purple-500/50"
                    }`}
                  >
                    @{suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Example */}
          <div className="bg-[#1b1d3a] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Example</p>
            <p className="text-white font-mono">@rush_cricket</p>
          </div>
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
            disabled={username.length < 3 || saving}
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
                Save Username
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
