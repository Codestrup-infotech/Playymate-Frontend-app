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

    console.log(`[API /users/${id}/reels] 📥 GET request received`, { id, cursor, limit });

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

    console.log(`[API /users/${id}/reels] ✅ Response received`, response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`[API /users/${id}/reels] ⚠️ Backend unavailable, using local data:`, error.message);

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
}
