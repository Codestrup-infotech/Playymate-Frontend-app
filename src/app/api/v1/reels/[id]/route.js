export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/v1/reels/:id
export async function GET(request, { params }) {
  try {
    const { id } = params;

    console.log(`[API /reels/${id}] 📥 GET request received`, { id });

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
    const response = await axios.get(`${API_BASE_URL}/reels/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`[API /reels/${id}] ❌ GET Error:`, error.response?.data || error.message);

    // Return actual error (no mock fallback)
    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "GET_REEL_ERROR",
        message: error.response?.data?.message || error.message || "Failed to get reel",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// PUT /api/v1/reels/:id
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    console.log(`[API /reels/${id}] 📥 PUT request received`, { id, body });

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

    const { caption, hashtags, visibility, allow_comments } = body;

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
    const response = await axios.put(
      `${API_BASE_URL}/reels/${id}`,
      {
        caption,
        hashtags,
        visibility,
        allow_comments,
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
    console.error(`[API /reels/${id}] ❌ PUT Error:`, error.response?.data || error.message);

    // Return actual error (no mock fallback)
    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "UPDATE_REEL_ERROR",
        message: error.response?.data?.message || error.message || "Failed to update reel",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// DELETE /api/v1/reels/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    console.log(`[API /reels/${id}] 📥 DELETE request received`, { id });

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
    const response = await axios.delete(`${API_BASE_URL}/reels/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(`[API /reels/${id}] ❌ DELETE Error:`, error.response?.data || error.message);

    // Return actual error (no mock fallback)
    return NextResponse.json(
      {
        status: "error",
        error_code: error.response?.data?.error_code || "DELETE_REEL_ERROR",
        message: error.response?.data?.message || error.message || "Failed to delete reel",
      },
      { status: error.response?.status || 500 }
    );
  }
}
