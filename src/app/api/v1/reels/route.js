import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/v1/reels
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = searchParams.get("limit") || 20;
    const userId = searchParams.get("user_id");
    const hashtag = searchParams.get("hashtag");

    // Build query string
    const queryParams = new URLSearchParams();
    if (cursor) queryParams.append("cursor", cursor);
    queryParams.append("limit", limit);
    if (userId) queryParams.append("user_id", userId);
    if (hashtag) queryParams.append("hashtag", hashtag);

    // Get auth token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Forward request to actual backend API
    const response = await axios.get(
      `${API_BASE_URL}/reels?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error getting reels:", error.response?.data || error.message);

    // Return actual error (no mock fallback)
    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "GET_REELS_ERROR",
        message: error.response?.data?.message || error.message || "Failed to get reels",
      },
      { status: error.response?.status || 500 }
    );
  }
}
