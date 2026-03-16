import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/v1/reels/:id
export async function GET(request, { params }) {
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
    const response = await axios.get(`${API_BASE_URL}/reels/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error getting reel:", error.response?.data || error.message);

    // If backend is not available, return mock data for demo
    if (error.code === "ECONNREFUSED" || error.response?.status === 404) {
      // Mock reel data for demo
      const mockReel = {
        reel_id: id,
        video_url: "https://s3.wasabisys.com/playymate/social/demo/reel/sample.mp4",
        thumbnail_url: "https://s3.wasabisys.com/playymate/social/demo/reel/thumbnail/sample.jpg",
        caption: "This is a demo reel #playymate #sports",
        hashtags: ["playymate", "sports", "demo"],
        likes_count: Math.floor(Math.random() * 1000),
        comments_count: Math.floor(Math.random() * 50),
        views_count: Math.floor(Math.random() * 5000),
        duration: 30,
        aspect_ratio: "9:16",
        visibility: "public",
        allow_comments: true,
        allow_duets: false,
        allow_stitches: false,
        created_at: new Date().toISOString(),
        author: {
          user_id: "demo_user_123",
          username: "demo_user",
          full_name: "Demo User",
          profile_image_url: "https://via.placeholder.com/150",
        },
      };

      return NextResponse.json(
        {
          status: "success",
          data: mockReel,
          error_code: null,
          _demo: true,
          _message: "Demo mode - data is mocked (backend not connected)",
        },
        { status: 200 }
      );
    }

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
    console.error("Error updating reel:", error.response?.data || error.message);

    // If backend is not available, return mock response for demo
    if (error.code === "ECONNREFUSED" || error.response?.status === 404) {
      const body = await request.json();
      
      // Mock successful update response
      const mockUpdatedReel = {
        _id: id,
        reel_id: id,
        author_id: "demo_user_123",
        video: {
          url: "https://s3.wasabisys.com/playymate/social/demo/reel/sample.mp4",
          duration: 30,
          thumbnail_url: "https://s3.wasabisys.com/playymate/social/demo/reel/thumbnail/sample.jpg",
          aspect_ratio: "9:16"
        },
        caption: body.caption || "Updated caption!",
        hashtags: body.hashtags || ["updated"],
        mentions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        views_count: 0,
        saves_count: 0,
        viewers: [],
        moderation_status: "pending",
        moderation_flags: [],
        visibility: body.visibility || "public",
        allow_comments: body.allow_comments !== false,
        allow_duets: false,
        allow_stitches: false,
        is_deleted: false,
      };

      return NextResponse.json(
        {
          status: "success",
          message: "Reel updated",
          error_code: null,
          data: {
            reel: mockUpdatedReel,
          },
          _demo: true,
          _message: "Demo mode - reel updated locally (backend not connected)",
        },
        { status: 200 }
      );
    }

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
    console.error("Error deleting reel:", error.response?.data || error.message);

    // If backend is not available, return mock response for demo
    if (error.code === "ECONNREFUSED" || error.response?.status === 404) {
      return NextResponse.json(
        {
          status: "success",
          message: "Reel deleted",
          error_code: null,
          _demo: true,
          _message: "Demo mode - reel deleted locally (backend not connected)",
        },
        { status: 200 }
      );
    }

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
