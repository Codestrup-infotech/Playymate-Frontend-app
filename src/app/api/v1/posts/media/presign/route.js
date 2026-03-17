import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Wasabi/S3 Configuration - Use correct regional endpoint
const REGION = process.env.WASABI_SOCIAL_REGION || process.env.WASABI_REGION || "ap-south-1";
const s3Config = {
  region: REGION,
  // Use the standard Wasabi endpoint format: s3.{region}.wasabisys.com
  endpoint: `https://s3.${REGION}.wasabisys.com`,
  forcePathStyle: true, // Required for Wasabi - use path-style instead of virtual-hosted-style
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
  },
};

const BUCKET_NAME = process.env.WASABI_SOCIAL_BUCKET || process.env.WASABI_BUCKET || "playymate-kyc";
const BASE_PATH = "social";

// Generate unique file key
function generateFileKey(type, fileName, userId) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const folder = type === "video" ? "video" : "image";
  return `${BASE_PATH}/${userId || "anonymous"}/${folder}/${timestamp}-${randomId}-${sanitizedFileName}`;
}

// POST /api/v1/posts/media/presign
export async function POST(request) {
  try {
    const body = await request.json();
    const { filename, mime_type, type } = body;

    console.log(`[API /posts/media/presign] 📥 POST request received`, { filename, mime_type, type });

    // Validate required fields
    if (!filename || !mime_type || !type) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "MISSING_REQUIRED_FIELDS",
          message: "Missing required fields: filename, mime_type, type",
        },
        { status: 400 }
      );
    }

    // Validate type
    if (!["image", "video"].includes(type)) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "INVALID_TYPE",
          message: "Type must be 'image' or 'video'",
        },
        { status: 400 }
      );
    }

    // Get user ID from headers (set by auth middleware)
    const userId = request.headers.get("x-user-id") || "anonymous";

    // Generate file key
    const key = generateFileKey(type, filename, userId);
    const fullKey = `${key}`;

    // Create S3 client
    const s3Client = new S3Client(s3Config);

    // Generate presigned URL for upload (expires in 5 minutes = 300 seconds)
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fullKey,
      ContentType: mime_type,
    });

    const uploadUrl = await getSignedUrl(s3Client, uploadCommand, { expiresIn: 300 });

    // Generate presigned URL for viewing (expires in 7 days = 604800 seconds)
    const viewCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fullKey,
    });

    const fileUrl = await getSignedUrl(s3Client, viewCommand, { expiresIn: 604800 });

    // Construct direct URL for Wasabi
    const wasabiDirectUrl = `https://s3.${REGION}.wasabisys.com/${BUCKET_NAME}/${fullKey}`;

    // Build the response
    const responseData = {
      upload_url: uploadUrl,
      file_url: fileUrl,
      wasabi_direct_url: wasabiDirectUrl,
      key: fullKey,
      expires_in: 300,
      url_expires_in: 604800,
    };

    console.log(`[API /posts/media/presign] ✅ Presign generated`, {
      filename,
      mime_type,
      type,
      key: fullKey,
    });

    return NextResponse.json({
      status: "success",
      error_code: null,
      data: responseData,
    });
  } catch (error) {
    console.error(`[API /posts/media/presign] ❌ Error:`, error);
    return NextResponse.json(
      {
        status: "error",
        error_code: "PRESIGN_ERROR",
        message: error.message || "Failed to generate presigned URL",
      },
      { status: 500 }
    );
  }
}
