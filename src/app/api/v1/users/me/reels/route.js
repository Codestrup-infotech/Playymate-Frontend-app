import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/v1/users/me/reels
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = searchParams.get("limit") || 20;

    console.log(`[API /users/me/reels] 📥 GET request received`, { cursor, limit });

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

    // Try to forward request to actual backend API
    try {
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
      console.error(`[API /users/me/reels] ⚠️ Backend unavailable, using local data:`, error.message);

      // Return local mock data when backend is unavailable
      const mockReels = [];

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
          _local: true,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`[API /users/me/reels] ❌ Error:`, error.response?.data || error.message);

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
