import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

// Generate unique file key for reels
function generateReelKey(fileName, userId) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${BASE_PATH}/${userId || "anonymous"}/reel/${timestamp}-${randomId}-${sanitizedFileName}`;
}

// Generate unique file key for thumbnails
function generateThumbnailKey(fileName, userId) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${BASE_PATH}/${userId || "anonymous"}/reel/thumbnail/${timestamp}-${randomId}-${sanitizedFileName}`;
}

// POST /api/v1/reels/upload - Upload video/thumbnail directly to S3
export async function POST(request) {
  try {
    // Log configuration being used
    console.log(`[API /reels/upload] 🔧 S3 Config:`, {
      region: REGION,
      endpoint: `https://s3.${REGION}.wasabisys.com`,
      bucket: BUCKET_NAME,
      hasCredentials: !!(process.env.WASABI_ACCESS_KEY_ID && process.env.WASABI_SECRET_ACCESS_KEY)
    });
    
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type") || "video"; // 'video' or 'thumbnail'

    console.log(`[API /reels/upload] 📥 POST request received`, { 
      type, 
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });

    // Validate file
    if (!file) {
      return NextResponse.json(
        {
          status: "error",
          error_code: "MISSING_FILE",
          message: "No file provided",
        },
        { status: 400 }
      );
    }

    // Get user ID from headers (set by auth middleware)
    const userId = request.headers.get("x-user-id") || "anonymous";

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate file key based on type
    let key;
    if (type === "thumbnail") {
      key = generateThumbnailKey(file.name, userId);
    } else {
      key = generateReelKey(file.name, userId);
    }

    // Create S3 client and upload command
    const s3Client = new S3Client(s3Config);
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    // Upload to S3
    await s3Client.send(uploadCommand);

    // Construct direct URL for Wasabi
    const wasabiDirectUrl = `https://s3.${REGION}.wasabisys.com/${BUCKET_NAME}/${key}`;

    console.log(`[API /reels/upload] ✅ File uploaded successfully`, {
      type,
      key,
      url: wasabiDirectUrl
    });

    return NextResponse.json({
      status: "success",
      error_code: null,
      data: {
        file_url: wasabiDirectUrl,
        wasabi_direct_url: wasabiDirectUrl,
        key: key,
        size: file.size,
        content_type: file.type,
      },
    });
  } catch (error) {
    console.error(`[API /reels/upload] ❌ Error:`, error);
    console.error(`[API /reels/upload] ❌ Error name:`, error.name);
    console.error(`[API /reels/upload] ❌ Error stack:`, error.stack);
    
    // Log S3-specific error details
    if (error.$metadata) {
      console.error(`[API /reels/upload] ❌ S3 metadata:`, error.$metadata);
    }
    if (error.Code) {
      console.error(`[API /reels/upload] ❌ S3 Error Code:`, error.Code);
    }
    
    return NextResponse.json(
      {
        status: "error",
        error_code: "UPLOAD_ERROR",
        message: error.message || "Failed to upload file",
        details: error.name || undefined,
      },
      { status: 500 }
    );
  }
}
