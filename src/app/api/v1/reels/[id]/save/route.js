import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/v1/reels/:id/save
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
      `${API_BASE_URL}/reels/${id}/save`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error saving reel:", error.response?.data || error.message);

    // Return actual error (no mock fallback)
    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "SAVE_ERROR",
        message: error.response?.data?.message || error.message || "Failed to save reel",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE /api/v1/reels/:id/save
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
    const response = await axios.delete(`${API_BASE_URL}/reels/${id}/save`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error unsaving reel:", error.response?.data || error.message);

    // Return actual error (no mock fallback)
    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "UNSAVE_ERROR",
        message: error.response?.data?.message || error.message || "Failed to unsave reel",
      },
      { status: error.response?.status || 500 }
    );
  }
}
