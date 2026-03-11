# AWS Rekognition Face Liveness API Documentation

## Overview

This document provides comprehensive API documentation for the AWS Rekognition Stream-based Face Liveness verification system. This implementation uses real-time video challenge/response for true anti-spoofing.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [API Endpoints](#api-endpoints)
3. [Integration Guide](#integration-guide)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Codes](#error-codes)
6. [Frontend Integration](#frontend-integration)
7. [Configuration](#configuration)

---

## Prerequisites

### 1. Admin Configuration Required

Before using the APIs, configure via admin panel:

1. **Go to:** Admin → Provider Config → LIVENESS
2. **Set:** `active_provider` to `'REKOGNITION'`
3. **Add Credentials:**
   ```json
   {
     "access_key": "AKIAIOSFODNN7EXAMPLE",
     "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
     "region": "ap-south-1",
     "min_confidence": 90
   }
   ```

### 2. Environment Variables (Optional)

```bash
# AWS Credentials (if not using admin panel)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=ap-south-1

# Wasabi (for selfie storage)
WASABI_ACCESS_KEY=your_wasabi_access_key
WASABI_SECRET_KEY=your_wasabi_secret_key
WASABI_BUCKET=your_bucket_name
```

---

## API Endpoints

### 1. Create Liveness Session

Creates an AWS Rekognition face liveness session.

**Endpoint:** `POST /api/v1/kyc/liveness/session`

**Authentication:** Bearer Token (required)

#### Request

```http
POST /api/v1/kyc/liveness/session
Authorization: Bearer <user_access_token>
Content-Type: application/json

{}
```

#### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "sessionId": "abc123-session-id-uuid",
    "expiresIn": 30
  }
}
```

#### Error Responses

**401 - Unauthorized**
```json
{
  "status": "error",
  "message": "Authentication required",
  "error_code": "UNAUTHORIZED"
}
```

**400 - Aadhaar Verification Required**
```json
{
  "status": "error",
  "message": "Complete DigiLocker verification or skip Aadhaar before liveness check",
  "error_code": "AADHAAR_VERIFICATION_REQUIRED"
}
```

**400 - Liveness Not Available**
```json
{
  "status": "error",
  "message": "Face liveness verification is not available at this time",
  "error_code": "LIVENESS_NOT_AVAILABLE"
}
```

**403 - Manual Review Required**
```json
{
  "status": "error",
  "message": "Manual review required",
  "error_code": "MANUAL_REVIEW_REQUIRED"
}
```

**500 - Server Error**
```json
{
  "status": "error",
  "message": "Failed to create liveness session",
  "error_code": "LIVENESS_SESSION_FAILED"
}
```

---

### 2. Verify Liveness Session

Verifies the AWS Rekognition face liveness session after the frontend has completed the video capture challenge.

**Endpoint:** `POST /api/v1/kyc/liveness/verify`

**Authentication:** Bearer Token (required)

#### Request

```http
POST /api/v1/kyc/liveness/verify
Authorization: Bearer <user_access_token>
Content-Type: application/json

{
  "sessionId": "abc123-session-id-uuid"
}
```

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Face liveness check passed. KYC completed.",
  "data": {
    "verification": {
      "liveness": {
        "status": true,
        "verified_at": "2024-01-15T10:30:00.000Z",
        "provider": "AWS_REKOGNITION",
        "confidence": 98.5,
        "selfie_url": "https://s3.wasabisys.com/bucket/kyc/user-id/selfie/1234567890-abc123.jpg"
      }
    },
    "onboarding_state": "KYC_COMPLETED"
  },
  "next_required_step": "PHYSICAL_PROFILE_INTRO"
}
```

#### Partial Verification Response (200)

When Aadhaar was skipped:
```json
{
  "status": "success",
  "message": "Face liveness check passed",
  "data": {
    "verification": {
      "liveness": {
        "status": true,
        "verified_at": "2024-01-15T10:30:00.000Z",
        "provider": "AWS_REKOGNITION",
        "confidence": 98.5,
        "selfie_url": "https://s3.wasabisys.com/bucket/kyc/user-id/selfie/1234567890-abc123.jpg"
      }
    },
    "onboarding_state": "FACE_LIVENESS_PASSED"
  },
  "next_required_step": "PHYSICAL_PROFILE_INTRO"
}
```

#### Error Responses

**400 - Session ID Required**
```json
{
  "status": "error",
  "message": "Session ID is required",
  "error_code": "SESSION_ID_REQUIRED"
}
```

**400 - Session Expired**
```json
{
  "status": "error",
  "message": "Session expired. Please try again.",
  "data": {
    "error": "SESSION_EXPIRED"
  },
  "error_code": "SESSION_EXPIRED"
}
```

**400 - Liveness Failed**
```json
{
  "status": "error",
  "message": "Face liveness check failed. Please try again.",
  "data": {
    "error": "LIVENESS_CHECK_FAILED"
  },
  "error_code": "LIVENESS_FAILED"
}
```

**400 - Low Confidence**
```json
{
  "status": "error",
  "message": "Face not clearly visible. Please try again with better lighting.",
  "data": {
    "error": "LOW_CONFIDENCE",
    "confidence": 75.0,
    "min_confidence": 90
  },
  "error_code": "LOW_CONFIDENCE"
}
```

**500 - Verification Failed**
```json
{
  "status": "error",
  "message": "Face liveness verification failed. Please try again.",
  "error_code": "LIVENESS_VERIFICATION_FAILED"
}
```

---

## Integration Guide

### Step 1: Prerequisites Check

Before starting, ensure:
- ✅ User has completed Aadhaar verification OR skipped it
- ✅ Admin has configured REKOGNITION as the active liveness provider
- ✅ AWS credentials are configured

### Step 2: Create Session

Call the session creation endpoint to get a session ID:

```javascript
// Example: Create Liveness Session
const createSession = async (authToken) => {
  const response = await fetch('/api/v1/kyc/liveness/session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return {
      sessionId: data.data.sessionId,
      expiresIn: data.data.expiresIn
    };
  }
  
  throw new Error(data.message || 'Failed to create session');
};
```

### Step 3: Frontend Video Capture

Use AWS Amplify UI Liveness component to capture the video:

```javascript
// Example: React with AWS Amplify
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import '@aws-amplify/ui-react-liveness/styles.css';

function LivenessCapture({ sessionId, onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <FaceLivenessDetector
      sessionId={sessionId}
      region="ap-south-1"
      onAnalysisComplete={onComplete}
      onError={(error) => console.error('Liveness error:', error)}
    />
  );
}
```

### Step 4: Verify Session

After video capture completes, verify the session:

```javascript
// Example: Verify Liveness Session
const verifySession = async (authToken, sessionId) => {
  const response = await fetch('/api/v1/kyc/liveness/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId })
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return {
      success: true,
      verification: data.data.verification,
      nextStep: data.next_required_step
    };
  }
  
  throw new Error(data.message || 'Liveness verification failed');
};
```

### Complete Integration Flow

```javascript
// Complete Flow Example
async function handleLivenessVerification(authToken) {
  try {
    // Step 1: Create session
    console.log('Creating liveness session...');
    const { sessionId, expiresIn } = await createSession(authToken);
    console.log('Session created:', sessionId, 'expires in', expiresIn, 'seconds');
    
    // Step 2: Show FaceLivenessDetector UI
    // (This is handled by AWS Amplify UI component)
    const videoAnalysisComplete = await showLivenessDetector(sessionId);
    
    // Step 3: Verify session
    console.log('Verifying liveness session...');
    const result = await verifySession(authToken, sessionId);
    
    if (result.success) {
      console.log('✅ Liveness verified!');
      console.log('Confidence:', result.verification.liveness.confidence);
      console.log('Next step:', result.nextStep);
      
      // Proceed to next step in onboarding
      navigateTo(result.nextStep);
    }
    
  } catch (error) {
    console.error('❌ Liveness verification failed:', error.message);
    
    // Handle specific error codes
    switch (error.error_code) {
      case 'SESSION_EXPIRED':
        // Retry from step 1
        break;
      case 'LOW_CONFIDENCE':
        // Ask user to try with better lighting
        break;
      case 'AADHAAR_VERIFICATION_REQUIRED':
        // Redirect to Aadhaar verification
        break;
      default:
        // Generic error handling
        showErrorMessage(error.message);
    }
  }
}
```

---

## Error Codes

| Error Code | HTTP Status | Description | Resolution |
|------------|-------------|--------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated | Redirect to login |
| `AADHAAR_VERIFICATION_REQUIRED` | 400 | Aadhaar verification needed first | Complete or skip Aadhaar |
| `LIVENESS_NOT_AVAILABLE` | 400 | Liveness disabled by admin | Contact support |
| `MANUAL_REVIEW_REQUIRED` | 403 | Too many failed attempts | Contact support |
| `SESSION_ID_REQUIRED` | 400 | Missing session ID | Provide valid session ID |
| `SESSION_EXPIRED` | 400 | Session expired (>30 seconds) | Create new session |
| `INVALID_SESSION` | 400 | Invalid session ID | Create new session |
| `LIVENESS_FAILED` | 400 | Liveness check failed | Retry with better conditions |
| `LOW_CONFIDENCE` | 400 | Face not clearly visible | Retry with better lighting |
| `LIVENESS_VERIFICATION_FAILED` | 500 | Server error | Retry or contact support |
| `LIVENESS_SESSION_FAILED` | 500 | Failed to create session | Check AWS credentials |
| `NO_PROVIDER_CONFIG` | 500 | Provider not configured | Configure via admin panel |
| `NO_PROVIDER_CREDENTIALS` | 500 | AWS credentials missing | Add via admin panel |
| `MISSING_CREDENTIALS` | 500 | AWS credentials not found | Check configuration |

---

## Frontend Integration

### React Example

```jsx
import React, { useState } from 'react';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import '@aws-amplify/ui-react-liveness/styles.css';

export default function LivenessVerification({ authToken, onComplete }) {
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create session on mount
  React.useEffect(() => {
    createSession();
  }, []);

  const createSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/kyc/liveness/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSessionData(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create liveness session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisComplete = async () => {
    try {
      const response = await fetch('/api/v1/kyc/liveness/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId: sessionData.sessionId })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        onComplete?.(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to verify liveness');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={createSession}>Retry</button>
      </div>
    );
  }

  if (!sessionData) {
    return <div>Initializing...</div>;
  }

  return (
    <FaceLivenessDetector
      sessionId={sessionData.sessionId}
      region="ap-south-1"
      onAnalysisComplete={handleAnalysisComplete}
      onError={(err) => setError(err.message)}
    />
  );
}
```

### React Native Example

```javascript
// For React Native, you'll need to use AWS SDK directly
// or a native liveness component that supports your platform

import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function LivenessScreen({ authToken, navigation }) {
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    createSession();
  }, []);

  const createSession = async () => {
    try {
      const response = await fetch('https://api.example.com/api/v1/kyc/liveness/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSessionId(data.data.sessionId);
        // Now open native liveness component
        // You'll need to implement native module integration
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create session');
    }
  };

  const handleLivenessComplete = async (nativeResult) => {
    try {
      const response = await fetch('https://api.example.com/api/v1/kyc/liveness/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        navigation.navigate(data.next_required_step);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Verification failed');
    }
  };

  return (
    <View>
      <Text>Liveness Verification</Text>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title="Retry" onPress={createSession} />
    </View>
  );
}
```

---

## Configuration

### AWS Rekognition Settings

| Parameter | Default | Description |
|-----------|---------|-------------|
| `min_confidence` | 90 | Minimum liveness confidence to pass |
| `region` | us-east-1 | AWS region for Rekognition |
| Session Timeout | 30 seconds | Time to complete the challenge |

### Provider Configuration

The system supports the existing provider configuration framework:

1. **Provider Config** (category: 'LIVENESS')
   - `active_provider`: 'REKOGNITION' (or 'CASHFREE' for legacy)

2. **Provider Credentials** (provider: 'REKOGNITION')
   - `access_key`: AWS access key
   - `secret_key`: AWS secret key
   - `region`: AWS region
   - `min_confidence`: Minimum confidence threshold

### Wasabi Storage

The selfie reference image is stored in Wasabi:
- **Path format:** `kyc/{userId}/selfie/{timestamp}-{nonce}.jpg`
- **Bucket:** Configured via `WASABI_BUCKET` environment variable

---

## Testing

### Using cURL

```bash
# Create session
curl -X POST https://api.example.com/api/v1/kyc/liveness/session \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Verify session
curl -X POST https://api.example.com/api/v1/kyc/liveness/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "your-session-id"}'
```

### Using Test Script

```bash
node scripts/testAwsRekognitionLiveness.js
```

---

## Troubleshooting

### Common Issues

1. **"NO_PROVIDER_CONFIG"**
   - Solution: Configure provider via admin panel

2. **"NO_PROVIDER_CREDENTIALS"**
   - Solution: Add AWS credentials via admin panel

3. **"MISSING_CREDENTIALS"**
   - Solution: Set AWS env vars or configure via admin panel

4. **"SESSION_EXPIRED"**
   - Solution: Create a new session (must complete within 30 seconds)

5. **"LOW_CONFIDENCE"**
   - Solution: Ensure good lighting and clear face visibility

### Support

For additional support, check:
- Server logs for detailed error messages
- AWS CloudWatch for Rekognition API logs
- Wasabi bucket access logs

---

## Migration from Photo-based Liveness

If migrating from the old photo-based flow:

1. **Old Endpoint:** `POST /api/v1/kyc/face-liveness`
2. **New Endpoints:**
   - `POST /api/v1/kyc/liveness/session`
   - `POST /api/v1/kyc/liveness/verify`

The new flow provides better security with real-time video challenge/response instead of static photo verification.
