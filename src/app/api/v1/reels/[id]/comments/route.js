import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/v1/reels/:id/comments
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
          error_code: "MISSING_REEL_ID",
          message: "Reel ID is required",
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
      `${API_BASE_URL}/reels/${id}/comments?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error getting comments:", error.response?.data || error.message);

    // Return actual error (no mock fallback)
    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "GET_COMMENTS_ERROR",
        message: error.response?.data?.message || error.message || "Failed to get comments",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// POST /api/v1/reels/:id/comments
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { text, mentions } = body;

    if (!id) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "MISSING_REEL_ID",
          message: "Reel ID is required",
        },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "MISSING_TEXT",
          message: "Comment text is required",
        },
        { status: 400 }
      );
    }

    // Get auth token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Forward request to actual backend API
    const response = await axios.post(
      `${API_BASE_URL}/reels/${id}/comments`,
      { text, mentions: mentions || [] },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error.response?.data || error.message);

    // Return actual error (no mock fallback)
    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "ADD_COMMENT_ERROR",
        message: error.response?.data?.message || error.message || "Failed to add comment",
      },
      { status: error.response?.status || 500 }
    );
  }
}
