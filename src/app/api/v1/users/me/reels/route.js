import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/v1/users/me/reels
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = searchParams.get("limit") || 20;

    // Get auth token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "UNAUTHORIZED",
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (cursor) queryParams.append("cursor", cursor);
    queryParams.append("limit", limit);

    // Forward request to actual backend API
    const response = await axios.get(
      `${API_BASE_URL}/users/me/reels?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error getting my reels:", error.response?.data || error.message);

    // If backend is not available, return mock response for demo
    if (error.code === "ECONNREFUSED" || error.response?.status === 404) {
      // Get user ID from token or use default
      const mockUserId = "current_user";
      
      // Generate mock reels for demo
      const mockReels = Array.from({ length: 3 }, (_, i) => ({
        _id: `reel_${mockUserId}_${i + 1}`,
        reel_id: `reel_${mockUserId}_${i + 1}`,
        video: {
          url: "https://s3.wasabisys.com/playymate/social/demo/reel/sample.mp4",
          thumbnail_url: "https://s3.wasabisys.com/playymate/social/demo/reel/thumbnail/sample.jpg",
          duration: 30,
          aspect_ratio: "9:16",
        },
        caption: `My reel #${i + 1} #playymate #myself`,
        hashtags: ["playymate", "myself", "demo"],
        likes_count: Math.floor(Math.random() * 100),
        comments_count: Math.floor(Math.random() * 10),
        views_count: Math.floor(Math.random() * 500),
        saves_count: Math.floor(Math.random() * 20),
        author: {
          user_id: mockUserId,
          username: "current_user",
          full_name: "Current User",
          profile_image_url: "https://via.placeholder.com/50",
        },
        created_at: new Date(Date.now() - i * 3600000).toISOString(),
        is_liked: false,
        is_saved: false,
      }));

      return NextResponse.json(
        {
          status: "success",
          data: {
            reels: mockReels,
            items: mockReels,
            next_cursor: null,
            has_more: false,
          },
          error_code: null,
          _demo: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "GET_MY_REELS_ERROR",
        message: error.response?.data?.message || error.message || "Failed to get my reels",
      },
      { status: error.response?.status || 500 }
    );
  }
}
