import { useState, useEffect, useCallback, useRef } from "react";
import { getFeed, getSuggestedFollows, getNearbyVenues, refreshFeedCache, getMyVenues, getUserVenues, getFollowingFeed } from "@/services/feed.service";
import { getUserProfile } from "@/services/profile.service";

/**
 * useFeed — hook for the feed module
 *
 * Returns:
 *   feedItems         – array of feed items (type: "post" | "venue" | "event" | "friend_activity")
 *   followingFeedItems – array of posts/reels from followed users (new API format)
 *   suggestedFollows  – array of suggested users
 *   nearbyVenues      – array of nearby venues
 *   profileCard       – profile_completion_card object from API
 *   loading           – initial load in progress
 *   loadingMore       – loading next page
 *   hasMore           – more pages available
 *   error             – error string or null
 *   loadMore()        – load next page
 *   refresh()         – invalidate cache and reload from scratch
 */
export default function useFeed() {
    const [feedItems, setFeedItems] = useState([]);
    const [followingFeedItems, setFollowingFeedItems] = useState([]);
    const [suggestedFollows, setSuggestedFollows] = useState([]);
    const [nearbyVenues, setNearbyVenues] = useState([]);
    const [profileCard, setProfileCard] = useState(null);
    const [userData, setUserData] = useState({
        username: null,
        profile_main_type: null,
        bio: null,
    });
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(null);
    const cursorRef = useRef(null);
    const followingCursorRef = useRef(null);

    const loadFeed = useCallback(async (reset = false) => {
        try {
            const cursor = reset ? null : cursorRef.current;
            if (reset) setLoading(true);
            else setLoadingMore(true);

            const data = await getFeed(cursor);

            const items = data?.items ?? [];
            setFeedItems(prev => reset ? items : [...prev, ...items]);
            setHasMore(data?.has_more ?? false);
            cursorRef.current = data?.next_cursor ?? null;

            // Log feed data for debugging
            console.log("[useFeed] Feed loaded successfully:", {
                itemCount: items.length,
                hasMore: data?.has_more,
                nextCursor: data?.next_cursor,
                profileCompletionCard: data?.profile_completion_card ? "present" : "not present",
                feedTypes: items.map(item => item.type)
            });

            if (data?.profile_completion_card) {
                setProfileCard(data.profile_completion_card);
                console.log("[useFeed] Profile completion card:", data.profile_completion_card);
            }
        } catch (err) {
            console.error("[useFeed] getFeed error:", err);
            setError(err?.response?.data?.message || err.message || "Failed to load feed");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Load following feed (posts and reels from followed users)
    const loadFollowingFeed = useCallback(async (reset = false) => {
        try {
            const cursor = reset ? null : followingCursorRef.current;
            
            const response = await getFollowingFeed(cursor);
            
            // The new API returns { success: true, data: [...], pagination: {...} }
            const items = response?.data ?? [];
            const pagination = response?.pagination ?? {};
            
            // Transform items to a consistent format with type: "post"
            const transformedItems = items.map(item => ({
                type: "post",
                data: {
                    post_id: item.content_id,
                    content_id: item.content_id,
                    author: item.author,
                    content: item.content,
                    media: item.media,
                    engagement: item.engagement,
                    user_action: item.user_action,
                    created_at: item.created_at,
                    personalization_score: item.personalization_score,
                    content_type: item.content_type,
                }
            }));
            
            setFollowingFeedItems(prev => reset ? transformedItems : [...prev, ...transformedItems]);
            setHasMore(pagination?.has_next ?? false);
            followingCursorRef.current = pagination?.cursor ?? null;

            console.log("[useFeed] Following feed loaded successfully:", {
                itemCount: items.length,
                hasMore: pagination?.has_next,
                cursor: pagination?.cursor
            });
        } catch (err) {
            console.error("[useFeed] getFollowingFeed error:", err);
            // Don't set error for following feed - it's optional
        }
    }, []);

    const loadSuggestedFollows = useCallback(async () => {
        try {
            const items = await getSuggestedFollows();
            setSuggestedFollows(items);
            console.log("[useFeed] Suggested follows loaded:", { count: items.length, users: items.map(u => u.username) });
        } catch (err) {
            console.warn("[useFeed] getSuggestedFollows error:", err.message);
        }
    }, []);

    const loadNearbyVenues = useCallback(async () => {
        try {
            const items = await getNearbyVenues();
            setNearbyVenues(items);
            console.log("[useFeed] Nearby venues loaded:", { count: items.length, venues: items.map(v => v.name) });
        } catch (err) {
            console.warn("[useFeed] getNearbyVenues error:", err.message);
        }
    }, []);

    // Fetch user's own venues/stores
    const fetchMyVenues = useCallback(async () => {
        try {
            const items = await getMyVenues();
            console.log("[useFeed] My venues loaded:", { count: items.length, venues: items.map(v => v.name) });
            return items;
        } catch (err) {
            console.warn("[useFeed] getMyVenues error:", err.message);
            return [];
        }
    }, []);

    // Fetch specific user's venues/stores
    const fetchUserVenues = useCallback(async (userId) => {
        try {
            const items = await getUserVenues(userId);
            console.log("[useFeed] User venues loaded:", { userId, count: items.length });
            return items;
        } catch (err) {
            console.warn("[useFeed] getUserVenues error:", err.message);
            return [];
        }
    }, []);

    // Fetch user profile data for displaying actual values in the profile completion card
    const fetchUserProfile = useCallback(async () => {
        try {
            const userId = localStorage.getItem("user_id");
            if (userId) {
                console.log("[useFeed] Fetching user profile for ID:", userId);
                const profile = await getUserProfile(userId);
                setUserData({
                    username: profile.username || null,
                    profile_main_type: profile.profile_main_type?.value || null,
                    bio: profile.bio || null,
                });
                console.log("[useFeed] User profile loaded:", {
                    username: profile.username,
                    profile_main_type: profile.profile_main_type,
                    bio: profile.bio
                });
            }
        } catch (err) {
            console.warn("[useFeed] getUserProfile error:", err.message);
        }
    }, []);

    // Initial load — all three in parallel
    useEffect(() => {
        setError(null);
        console.log("[useFeed] Starting initial feed load...");
        Promise.all([
            loadFeed(true),
            loadFollowingFeed(true),
            loadSuggestedFollows(),
            loadNearbyVenues(),
        ]).then(() => {
            console.log("[useFeed] Initial feed load completed");
        });
    }, [loadFeed, loadFollowingFeed, loadSuggestedFollows, loadNearbyVenues]);

    // Fetch user profile data when profile card shows pending tasks
    useEffect(() => {
        if (profileCard?.enabled && (profileCard?.tasks?.username || profileCard?.tasks?.bio)) {
            fetchUserProfile();
        }
    }, [profileCard, fetchUserProfile]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) loadFeed(false);
    }, [loadFeed, loadingMore, hasMore]);

    const refresh = useCallback(async () => {
        try {
            console.log("[useFeed] Refreshing feed cache...");
            await refreshFeedCache();
        } catch (_) {
            // cache refresh is best-effort
        }
        cursorRef.current = null;
        followingCursorRef.current = null;
        setError(null);
        console.log("[useFeed] Refreshing all feed data...");
        await Promise.all([
            loadFeed(true),
            loadFollowingFeed(true),
            loadSuggestedFollows(),
            loadNearbyVenues(),
        ]);
        console.log("[useFeed] Feed refresh completed");
    }, [loadFeed, loadFollowingFeed, loadSuggestedFollows, loadNearbyVenues]);

    return {
        feedItems,
        followingFeedItems,
        suggestedFollows,
        nearbyVenues,
        profileCard,
        userData,
        loading,
        loadingMore,
        hasMore,
        error,
        loadMore,
        refresh,
        fetchUserProfile,
        fetchMyVenues,
        fetchUserVenues,
    };
}
