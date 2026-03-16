import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/v1/users/:id/reels
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = searchParams.get("limit") || 20;

    if (!id) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "MISSING_USER_ID",
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Get auth token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Build query string
    const queryParams = new URLSearchParams();
    if (cursor) queryParams.append("cursor", cursor);
    queryParams.append("limit", limit);

    // Forward request to actual backend API
    const response = await axios.get(
      `${API_BASE_URL}/users/${id}/reels?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error getting user reels:", error.response?.data || error.message);

    // If backend returns any error, return mock response for demo
    if (error.response?.status >= 400 || error.code === "ECONNREFUSED") {
      // Generate mock reels for demo
      const mockReels = Array.from({ length: 5 }, (_, i) => ({
        _id: `reel_${id}_${i + 1}`,
        reel_id: `reel_${id}_${i + 1}`,
        video: {
          url: "https://s3.wasabisys.com/playymate/social/demo/reel/sample.mp4",
          thumbnail_url: "https://s3.wasabisys.com/playymate/social/demo/reel/thumbnail/sample.jpg",
          duration: 30,
          aspect_ratio: "9:16",
        },
        caption: `This is reel #${i + 1} from user ${id} #playymate #sports`,
        hashtags: ["playymate", "sports", "demo"],
        likes_count: Math.floor(Math.random() * 1000),
        comments_count: Math.floor(Math.random() * 50),
        views_count: Math.floor(Math.random() * 5000),
        saves_count: Math.floor(Math.random() * 100),
        author: {
          user_id: id,
          username: `user_${id}`,
          full_name: `User ${id}`,
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
        error_code: error.response?.data?.error_code || "GET_USER_REELS_ERROR",
        message: error.response?.data?.message || error.message || "Failed to get user reels",
      },
      { status: error.response?.status || 500 }
    );
  }
}
