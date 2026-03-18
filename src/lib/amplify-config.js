import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
    },
  },
});
/**
 * AWS Amplify Configuration
 * 
 * Configures AWS Amplify for Face Liveness functionality.
 * Credentials are loaded from environment variables.
 * 
 * Get credentials from: Admin → Provider Config → LIVENESS
 */

const amplifyConfig = {
  Auth: {
    Cognito: {
      // Required for Face Liveness Detector (@aws-amplify/ui-react-liveness)
      identityPoolId: process.env.NEXT_PUBLIC_AWS_IDENTITY_POOL_ID || "ap-south-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
    },
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  AWSRekognitionStreaming: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
  },
};

// Only configure if running in browser and credentials are provided
if (typeof window !== 'undefined') {
  try {
    Amplify.configure({
      ...amplifyConfig,
      ssr: true,
    });
    console.log('AWS Amplify configured for Face Liveness');
  } catch (error) {
    console.error('Failed to configure AWS Amplify:', error);
  }
}

export default amplifyConfig;
