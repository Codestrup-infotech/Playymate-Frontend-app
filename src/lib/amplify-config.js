"use client";

import { Amplify } from "aws-amplify";

const amplifyConfig = {
  Auth: {
    Cognito: {
      identityPoolId:
        process.env.NEXT_PUBLIC_AWS_IDENTITY_POOL_ID ||
        "ap-south-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
    },
  },

  AWSRekognitionStreaming: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
  },
};

Amplify.configure({
  ...amplifyConfig,
  ssr: true,
});

export default amplifyConfig;