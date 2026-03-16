import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/v1/reels/:id/like
export async function POST(request, { params }) {
  try {
    const { id } = params;

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

    // Forward request to actual backend API
    const response = await axios.post(
      `${API_BASE_URL}/reels/${id}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error liking reel:", error.response?.data || error.message);

    // If backend is not available, return mock response for demo
    if (error.code === "ECONNREFUSED" || error.response?.status === 404) {
      return NextResponse.json(
        {
          status: "success",
          message: "Reel liked",
          error_code: null,
          data: {
            liked: true,
          },
          _demo: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "LIKE_ERROR",
        message: error.response?.data?.message || error.message || "Failed to like reel",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE /api/v1/reels/:id/like
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

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

    // Forward request to actual backend API
    const response = await axios.delete(`${API_BASE_URL}/reels/${id}/like`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error unliking reel:", error.response?.data || error.message);

    // If backend is not available, return mock response for demo
    if (error.code === "ECONNREFUSED" || error.response?.status === 404) {
      return NextResponse.json(
        {
          status: "success",
          message: "Reel unliked",
          error_code: null,
          data: {
            liked: false,
          },
          _demo: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "UNLIKE_ERROR",
        message: error.response?.data?.message || error.message || "Failed to unlike reel",
      },
      { status: error.response?.status || 500 }
    );
  }
}
