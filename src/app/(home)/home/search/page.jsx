"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Clock,
  TrendingUp,
  User,
  X,
  Loader2,
  Users,
  Target,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import {
  searchUsers,
  getSuggestedUsers,
  followUser,
  unfollowUser,
  searchUsersByInterest,
} from "@/app/user/ProfileSearch";

// Placeholder avatar
const PLACEHOLDER_AVATAR =
  "data:image/png;base64,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";

export default function SearchPage() {
  const { isDark } = useTheme();
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    "football",
    "tennis",
    "yoga",
  ]);
  const [trending, setTrending] = useState([
    "badminton",
    "cricket",
    "swimming",
    "cycling",
    "marathon",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("people"); // people, interests, nearby
  const [error, setError] = useState(null);

  // Fetch suggested users on mount
  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getSuggestedUsers({ limit: 10 });
      if (response.status === "success" && response.data) {
        setSuggestedUsers(response.data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch suggested users:", err);
      // Use mock data as fallback
      setSuggestedUsers([
        {
          user_id: "1",
          full_name: "Sarah Wilson",
          username: "sarah.wilson",
          profile_image_url: null,
          mutual_connections: 5,
          reason: "similar_interests",
        },
        {
          user_id: "2",
          full_name: "Mike Johnson",
          username: "mike_johnson",
          profile_image_url: null,
          mutual_connections: 3,
          reason: "popular_nearby",
        },
        {
          user_id: "3",
          full_name: "Priya Sharma",
          username: "priya_sharma",
          profile_image_url: null,
          mutual_connections: 0,
          reason: "new_user",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await searchUsers(searchQuery, { limit: 20 });
      if (response.status === "success" && response.data) {
        setSearchResults(response.data.items || []);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search. Please try again.");
      // Mock data fallback
      setSearchResults([
        {
          user_id: "mock1",
          full_name: "Test User",
          username: "testuser",
          profile_image_url: null,
          bio: "Sports enthusiast",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch(query);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleFollow = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      // Refresh the list
      if (query.length >= 2) {
        handleSearch(query);
      } else {
        fetchSuggestedUsers();
      }
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
    }
  };

  const handleInterestClick = async (interest) => {
    setQuery(interest);
    try {
      setIsLoading(true);
      const response = await searchUsersByInterest(interest, { limit: 20 });
      if (response.status === "success" && response.data) {
        setSearchResults(response.data.items || []);
      }
    } catch (err) {
      console.error("Search by interest error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToRecentSearches = (item) => {
    if (!recentSearches.includes(item)) {
      setRecentSearches([item, ...recentSearches.slice(0, 4)]);
    }
  };

  const removeFromRecentSearches = (item) => {
    setRecentSearches(recentSearches.filter((s) => s !== item));
  };

  const getProfileImage = (user) => {
    return user.profile_image_url || user.avatar || PLACEHOLDER_AVATAR;
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case "similar_interests":
        return "Similar interests";
      case "popular_nearby":
        return "Popular nearby";
      case "new_user":
        return "New to Playymate";
      case "mutual_connections":
        return "Mutual connections";
      default:
        return "Suggested for you";
    }
  };

  const displayUsers = query.length >= 2 ? searchResults : suggestedUsers;

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className={`rounded-xl p-6 ${
            isDark ? "bg-[#1a1a2e] text-white" : "bg-white shadow"
          }`}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-400 text-sm flex items-center gap-1">
                <Users size={14} />
                Search
              </p>
              <h2 className="text-lg font-semibold">Find People</h2>
            </div>

            <div className="flex gap-3">
              <button
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDark
                    ? "bg-[#252542] hover:bg-[#2d2d52]"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <TrendingUp size={18} />
              </button>

              <button
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDark
                    ? "bg-[#252542] hover:bg-[#2d2d52]"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people by name or username..."
                className={`w-full border rounded-lg px-5 py-3 pl-12 focus:outline-none ${
                  isDark
                    ? "bg-[#252542] border-purple-500/30 text-white"
                    : "bg-gray-100 border-gray-200"
                }`}
              />

              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("people")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                activeTab === "people"
                  ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                  : isDark
                  ? "bg-[#252542] text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <User size={16} />
              People
            </button>
            <button
              onClick={() => setActiveTab("interests")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                activeTab === "interests"
                  ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                  : isDark
                  ? "bg-[#252542] text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Target size={16} />
              Interests
            </button>
            <button
              onClick={() => setActiveTab("nearby")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                activeTab === "nearby"
                  ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                  : isDark
                  ? "bg-[#252542] text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <MapPin size={16} />
              Nearby
            </button>
          </div>

          {/* SEARCH RESULTS OR SUGGESTED */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : query.length >= 2 ? (
            // Search Results
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-400 flex items-center gap-2">
                  <Search size={16} />
                  {searchResults.length} results found
                </p>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No users found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        isDark ? "bg-[#252542]" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 p-[2px]">
                          <img
                            src={getProfileImage(user)}
                            alt={user.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{user.full_name}</p>
                          <p className="text-gray-400 text-sm">
                            @{user.username}
                          </p>
                          {user.bio && (
                            <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleFollow(user.user_id, user.is_following)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          user.is_following
                            ? isDark
                              ? "bg-[#1a1a2e] text-gray-300"
                              : "bg-white text-gray-700"
                            : "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                        }`}
                      >
                        {user.is_following ? "Following" : "Follow"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Default view with recent searches and trending
            <>
              {/* RECENT SEARCHES */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-gray-400 mb-3 text-sm font-medium flex items-center gap-2">
                    <Clock size={14} />
                    Recent Searches
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <span
                        key={item}
                        onClick={() => {
                          setQuery(item);
                          addToRecentSearches(item);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2 ${
                          isDark
                            ? "bg-[#252542] hover:bg-[#2d2d52]"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {item}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromRecentSearches(item);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* TRENDING */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
                  <Sparkles size={14} />
                  Trending Interests
                </h3>

                <div className="flex flex-wrap gap-2">
                  {trending.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => handleInterestClick(tag)}
                      className="px-4 py-2 rounded-lg border border-orange-500/50 text-orange-400 text-sm hover:bg-orange-500/10 cursor-pointer"
                    >
                      🔥 {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* SUGGESTED USERS */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium flex items-center gap-2">
                  <Users size={14} />
                  Suggested for you
                </h3>

                {suggestedUsers.length === 0 ? (
                  <p className="text-gray-400 text-sm">No suggestions available</p>
                ) : (
                  <div className="space-y-3">
                    {suggestedUsers.map((user) => (
                      <div
                        key={user.user_id}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          isDark ? "bg-[#252542]" : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-orange-400 p-[2px]">
                            <img
                              src={getProfileImage(user)}
                              alt={user.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{user.full_name}</p>
                            <p className="text-gray-400 text-sm">
                              @{user.username}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {user.mutual_connections > 0 &&
                                `${user.mutual_connections} mutual connections • `}
                              {getReasonText(user.reason)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleFollow(user.user_id, user.is_following)
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            user.is_following
                              ? isDark
                                ? "bg-[#1a1a2e] text-gray-300"
                                : "bg-white text-gray-700"
                              : "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                          }`}
                        >
                          {user.is_following ? "Following" : "Follow"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
