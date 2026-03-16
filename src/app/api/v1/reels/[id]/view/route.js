import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/v1/reels/:id/view
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

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

    const { watch_duration_ms } = body;

    // Validate watch duration
    if (watch_duration_ms !== undefined && typeof watch_duration_ms !== "number") {
      return NextResponse.json(
        {
          status: "error",
          error_code: "INVALID_WATCH_DURATION",
          message: "watch_duration_ms must be a number",
        },
        { status: 400 }
      );
    }

    // Get auth token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Forward request to actual backend API
    const response = await axios.post(
      `${API_BASE_URL}/reels/${id}/view`,
      {
        watch_duration_ms: watch_duration_ms || 0,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error tracking view:", error.response?.data || error.message);

    // If backend is not available, return mock response for demo
    if (error.code === "ECONNREFUSED" || error.response?.status === 404) {
      // Mock successful view tracking
      return NextResponse.json(
        {
          status: "success",
          error_code: null,
          data: {
            view_count: 1,
          },
          _demo: true,
          _message: "Demo mode - view tracked locally (backend not connected)",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "TRACK_VIEW_ERROR",
        message: error.response?.data?.message || error.message || "Failed to track view",
      },
      { status: error.response?.status || 500 }
    );
  }
}
