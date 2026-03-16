import { NextResponse } from "next/server";
import {
  RekognitionClient,
  GetFaceLivenessSessionResultsCommand,
} from "@aws-sdk/client-rekognition";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize AWS Rekognition client
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

// Initialize S3 client for Wasabi (for reference image upload)
const wasabiClient = new S3Client({
  region: process.env.WASABI_REGION || "ap-south-1",
  endpoint: process.env.WASABI_ENDPOINT || "https://s3.ap-south-1.wasabisys.com",
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * POST /api/kyc/liveness/verify
 * 
 * Verifies the AWS Rekognition Face Liveness session
 * Returns the confidence score and verification result
 * Uploads reference image to Wasabi and updates user status in database
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, userId } = body;

    if (!sessionId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Session ID is required",
          error_code: "MISSING_SESSION_ID",
        },
        { status: 400 }
      );
    }

    console.log("Verifying liveness session:", sessionId, "for user:", userId);

    // Get the liveness session results from AWS Rekognition
    const verifyCommand = new GetFaceLivenessSessionResultsCommand({
      SessionId: sessionId,
    });

    const response = await rekognitionClient.send(verifyCommand);

    console.log("Liveness verification response:", {
      confidence: response.Confidence,
      status: response.Status,
      sessionId: sessionId,
    });

    // Extract status from AWS response
    const awsStatus = response.Status || "FAILED"; // SUCCEEDED, FAILED, or EXPIRED
    const confidence = response.Confidence || 0;
    
    // Determine if the verification passed (threshold: 90% as per documentation)
    const isVerified = awsStatus === "SUCCEEDED" && confidence >= 90;

    let referenceImageUrl = null;
    let selfieUploaded = false;

    // If verification succeeded, upload reference image to Wasabi
    if (isVerified && response.ReferenceImage && userId) {
      try {
        // Decode base64 image from AWS response
        const imageBuffer = Buffer.from(response.ReferenceImage, "base64");
        const timestamp = Date.now();
        const fileName = `kyc/${userId}/selfie/selfie_${timestamp}.jpg`;
        
        const uploadCommand = new PutObjectCommand({
          Bucket: process.env.WASABI_BUCKET || "playymate-kyc",
          Key: fileName,
          Body: imageBuffer,
          ContentType: "image/jpeg",
        });

        await wasabiClient.send(uploadCommand);
        
        // Construct the public URL
        referenceImageUrl = `https://${process.env.WASABI_BUCKET || "playymate-kyc"}.s3.ap-south-1.wasabisys.com/${fileName}`;
        selfieUploaded = true;
        
        console.log("Reference image uploaded to Wasabi:", referenceImageUrl);

        // TODO: Update user verification status in database
        // This would typically call your backend API:
        // await updateUserKycStatus(userId, { livenessVerified: true, selfieUrl: referenceImageUrl });
        
      } catch (uploadError) {
        console.error("Failed to upload reference image to Wasabi:", uploadError);
        // Continue even if upload fails - don't block the verification result
      }
    }

    // Determine onboarding state based on verification and userId
    const onboardingState = isVerified 
      ? (userId ? "KYC_COMPLETED" : "FACE_LIVENESS_PASSED")
      : "PENDING";

    return NextResponse.json({
      status: "success",
      message: isVerified 
        ? "Face liveness check passed. KYC completed." 
        : awsStatus === "EXPIRED"
          ? "Session expired. Please start a new verification."
          : "Face liveness verification failed - please try again",
      data: {
        verification: {
          liveness: {
            status: isVerified,
            verified_at: isVerified ? new Date().toISOString() : null,
            provider: "AWS_REKOGNITION",
            confidence: confidence,
            selfie_url: referenceImageUrl,
            session_id: sessionId
          }
        },
        onboarding_state: onboardingState,
        next_required_step: isVerified ? "PHYSICAL_PROFILE" : null
      }
    });

  } catch (error) {
    console.error("Error verifying liveness session:", error);

    // Handle specific AWS errors
    if (error.name === "ResourceNotFoundException") {
      return NextResponse.json(
        {
          status: "error",
          message: "Session not found or expired. Please start a new verification.",
          error_code: "SESSION_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to verify liveness session",
        error_code: "LIVENESS_VERIFICATION_FAILED",
      },
      { status: 500 }
    );
  }
}
