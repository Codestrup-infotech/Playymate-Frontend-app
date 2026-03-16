import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/v1/reels/create
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      video_url,
      duration,
      thumbnail_url,
      aspect_ratio,
      title,
      caption,
      hashtags,
      mentions,
      visibility,
      allow_comments,
      allow_duets,
      allow_stitches,
    } = body;

    // Validate required fields
    if (!video_url) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "MISSING_VIDEO_URL",
          message: "video_url is required",
        },
        { status: 400 }
      );
    }

    if (!duration) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "MISSING_DURATION",
          message: "duration is required",
        },
        { status: 400 }
      );
    }

    // Validate duration (max 60 seconds)
    if (duration > 60) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "INVALID_DURATION",
          message: "Duration cannot exceed 60 seconds",
        },
        { status: 400 }
      );
    }

    // Validate caption length
    if (caption && caption.length > 2200) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "INVALID_CAPTION",
          message: "Caption cannot exceed 2200 characters",
        },
        { status: 400 }
      );
    }

    // Validate hashtags count
    if (hashtags && hashtags.length > 30) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "INVALID_HASHTAGS",
          message: "Cannot exceed 30 hashtags",
        },
        { status: 400 }
      );
    }

    // Validate visibility
    const validVisibilities = ["public", "followers_only", "private"];
    if (visibility && !validVisibilities.includes(visibility)) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "INVALID_VISIBILITY",
          message: "Visibility must be: public, followers_only, or private",
        },
        { status: 400 }
      );
    }

    // Get auth token from request headers
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Forward request to actual backend API
    const response = await axios.post(
      `${API_BASE_URL}/reels/create`,
      {
        video_url,
        duration,
        thumbnail_url,
        aspect_ratio: aspect_ratio || "9:16",
        title,
        caption,
        hashtags: hashtags || [],
        mentions: mentions || [],
        visibility: visibility || "public",
        allow_comments: allow_comments !== false,
        allow_duets: allow_duets || false,
        allow_stitches: allow_stitches || false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error creating reel:", error.response?.data || error.message);

    // If backend is not available, return a mock response for demo
    if (error.code === "ECONNREFUSED" || error.response?.status === 404) {
      const body = await request.json();
      
      // Generate mock response for demo purposes
      const mockReelId = `reel_${Date.now()}`;
      
      return NextResponse.json(
        {
          status: "success",
          data: {
            reel_id: mockReelId,
            created_at: new Date().toISOString(),
          },
          error_code: null,
          _demo: true,
          _message: "Demo mode - reel created locally (backend not connected)",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "CREATE_REEL_ERROR",
        message: error.response?.data?.message || error.message || "Failed to create reel",
      },
      { status: error.response?.status || 500 }
    );
  }
}
