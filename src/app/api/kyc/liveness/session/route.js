import { NextResponse } from "next/server";
import {
  RekognitionClient,
  CreateFaceLivenessSessionCommand,
} from "@aws-sdk/client-rekognition";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

// Initialize AWS clients
const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

const stsClient = new STSClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

/**
 * POST /api/kyc/liveness/session
 * 
 * Creates a new AWS Rekognition Face Liveness session
 * Returns sessionId and temporary credentials for the frontend
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    console.log("Creating face liveness session for user:", userId || "anonymous");

    // Create the liveness session with AWS Rekognition
    // S3Bucket is optional - if not provided, AWS creates a temporary bucket
    const sessionRequest = {
      Settings: {},
    };
    
    // Only add OutputConfig if S3_BUCKET is explicitly configured
    const s3Bucket = process.env.S3_BUCKET;
    if (s3Bucket) {
      sessionRequest.Settings.OutputConfig = {
        S3Bucket: s3Bucket,
      };
    }
    
    const createSessionCommand = new CreateFaceLivenessSessionCommand(sessionRequest);

    const sessionResponse = await rekognitionClient.send(createSessionCommand);
    const sessionId = sessionResponse.SessionId;

    console.log("Liveness session created:", sessionId);

    // Get temporary credentials for the frontend to use
    // This assumes there's an IAM role that can be assumed for liveness streaming
    const roleArn = process.env.AWS_LIVENESS_ROLE_ARN;

    let credentials = null;

    if (roleArn) {
      try {
        const assumeRoleCommand = new AssumeRoleCommand({
          RoleArn: roleArn,
          RoleSessionName: `liveness-session-${sessionId}`,
          DurationSeconds: 3600, // 1 hour
        });

        const credentialsResponse = await stsClient.send(assumeRoleCommand);
        credentials = {
          accessKeyId: credentialsResponse.Credentials.AccessKeyId,
          secretAccessKey: credentialsResponse.Credentials.SecretAccessKey,
          sessionToken: credentialsResponse.Credentials.SessionToken,
          expiration: credentialsResponse.Credentials.Expiration.toISOString(),
        };

        console.log("Temporary credentials generated for session:", sessionId);
      } catch (credError) {
        console.error("Failed to generate credentials:", credError);
        
        // Fallback: Use direct AWS credentials if role assumption fails
        // This requires the IAM user to have rekognition:* permissions
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
          credentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: null,
            expiration: null,
          };
          console.log("Using fallback direct credentials for session:", sessionId);
        }
      }
    } else {
      // Fallback: Use direct AWS credentials if no role is configured
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        credentials = {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: null,
          expiration: null,
        };
        console.log("Using fallback direct credentials for session:", sessionId);
      }
    }

    return NextResponse.json({
      status: "success",
      data: {
        sessionId,
        expiresIn: 30,
        region: process.env.AWS_REGION || "ap-south-1",
        credentials,
      },
      message: "Liveness session created successfully",
    });

  } catch (error) {
    console.error("Error creating liveness session:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to create liveness session",
        error_code: "LIVENESS_SESSION_CREATE_FAILED",
      },
      { status: 500 }
    );
  }
}
