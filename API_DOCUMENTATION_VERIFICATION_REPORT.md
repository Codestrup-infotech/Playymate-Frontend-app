# API Documentation Verification Report
# Session-Based Face Liveness (AWS Rekognition)

**Date:** March 16, 2026
**Status:** DISCREPANCIES FOUND - Requires Corrections

---

## Executive Summary

The frontend API implementation for AWS Rekognition Session-Based Face Liveness is **partially aligned** with the provided documentation. While the core functionality is implemented, there are several discrepancies in:
1. API endpoint paths (missing `/api/v1/kyc/` prefix)
2. Response structures (missing required fields)
3. Confidence threshold value (80% vs 90%)

---

## Detailed Discrepancy Analysis

### 1. CREATE LIVENESS SESSION Endpoint

**Documented Endpoint:** `POST /api/v1/kyc/liveness/session`

**Actual Implementation:** [`src/app/api/kyc/liveness/session/route.js`](src/app/api/kyc/liveness/session/route.js:1)

| Aspect | Documentation | Implementation | Status |
|--------|---------------|----------------|--------|
| Endpoint Path | `/api/v1/kyc/liveness/session` | `/api/kyc/liveness/session` | ❌ Missing `v1/kyc/` |
| Request Body | `{ userId }` | `{ userId }` | ✅ Match |
| Response - sessionId | ✅ Present | ✅ Present | ✅ Match |
| Response - expiresIn | ✅ Required (30) | ❌ Missing | ❌ Missing |
| Response - region | ✅ Required | ✅ Present | ✅ Match |
| Response - credentials | ✅ Required | ✅ Present | ✅ Match |

**Response Structure Comparison:**

*Documentation Expected:*
```json
{
  "status": "success",
  "data": {
    "sessionId": "abc123-def456-ghi789",
    "expiresIn": 30,
    "region": "ap-south-1",
    "credentials": { ... }
  }
}
```

*Implementation Returns:*
```json
{
  "status": "success",
  "data": {
    "sessionId": "...",
    "userId": "...",
    "region": "ap-south-1",
    "credentials": { ... }
  },
  "message": "Liveness session created successfully"
}
```

**Issues:**
1. Path missing `/api/v1/kyc/` prefix
2. Missing `expiresIn` field in response
3. Extra `userId` in response (not documented)

---

### 2. VERIFY LIVENESS SESSION Endpoint

**Documented Endpoint:** `POST /api/v1/kyc/liveness/verify`

**Actual Implementation:** [`src/app/api/kyc/liveness/verify/route.js`](src/app/api/kyc/liveness/verify/route.js:1)

| Aspect | Documentation | Implementation | Status |
|--------|---------------|----------------|--------|
| Endpoint Path | `/api/v1/kyc/liveness/verify` | `/api/kyc/liveness/verify` | ❌ Missing `v1/kyc/` |
| Request Body | `{ sessionId }` | `{ sessionId, userId }` | ⚠️ Extra userId |
| Confidence Threshold | 90% | 80% | ❌ Wrong value |

**Response Structure Comparison:**

*Documentation Expected:*
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
        "selfie_url": "https://s3.wasabisys.com/bucket/..."
      }
    },
    "onboarding_state": "KYC_COMPLETED"
  },
  "next_required_step": "PHYSICAL_PROFILE"
}
```

*Implementation Returns:*
```json
{
  "status": "success",
  "data": {
    "sessionId": "...",
    "status": "SUCCEEDED",
    "confidence": 95.5,
    "isVerified": true,
    "referenceImage": "https://...",
    "selfieUploaded": true
  },
  "message": "Face liveness verification successful"
}
```

**Issues:**
1. Path missing `/api/v1/kyc/` prefix
2. Request body contains extra `userId` (not in docs)
3. Response completely different structure - missing `verification.liveness` object
4. Missing `onboarding_state` field
5. Missing `next_required_step` field
6. Confidence threshold is 80% instead of 90%
7. Reference image URL field named differently (`referenceImage` vs `selfie_url`)

---

### 3. FRONTEND SERVICE LAYER

**File:** [`src/services/kyc.js`](src/services/kyc.js:250)

The frontend service correctly calls the local Next.js API routes:

```javascript
createLivenessSession: async (userId) => {
  const response = await fetch("/api/kyc/liveness/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  return { data };
},

verifyLivenessSession: async (sessionId, userId) => {
  const response = await fetch("/api/kyc/liveness/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, userId }),
  });
  const data = await response.json();
  return { data };
},
```

**Status:** ✅ The service layer correctly handles the responses and works with the current API implementation.

---

### 4. FRONTEND COMPONENTS

#### FaceLivenessModal
**File:** [`src/app/(home)/home/components/FaceLivenessModal.jsx`](src/app/(home)/home/components/FaceLivenessModal.jsx:1)

- ✅ Correctly initializes liveness session on modal open
- ✅ Uses AWS Amplify FaceLivenessDetector component
- ✅ Properly passes credentials from session response
- ✅ Handles onAnalysisComplete callback
- ✅ Updates UI states (initializing, ready, verifying, success, error)

#### Liveness Page (Onboarding)
**File:** [`src/app/onboarding/kyc/liveness/page.jsx`](src/app/onboarding/kyc/liveness/page.jsx:1)

- ✅ Same implementation as modal
- ✅ Handles navigation based on `next_required_step`
- ⚠️ But `next_required_step` is not returned by verify endpoint

---

### 5. AWS CONFIGURATION

**File:** [`.env.local`](.env.local:1)

```bash
# AWS Backend Configuration for Rekognition Face Liveness
AWS_REGION=ap-south-1

AWS_ACCESS_KEY_ID = YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY = YOUR_AWS_SECRET_KEY
S3_BUCKET=rekognition-face-bucket-01
AWS_LIVENESS_ROLE_ARN=arn:aws:iam::624234316887:role/PlayymateRekognitionLiveness

# Wasabi Storage Configuration
WASABI_REGION=ap-south-1
WASABI_ENDPOINT=https://s3.ap-south-1.wasabisys.com
WASABI_BUCKET=playymate-kyc
```

**Status:** ✅ Configuration matches documentation requirements

---

## Required Fixes

### Fix 1: Update Session Endpoint Path and Response

**File:** [`src/app/api/kyc/liveness/session/route.js`](src/app/api/kyc/liveness/session/route.js:102)

Add `expiresIn` to response:
```javascript
return NextResponse.json({
  status: "success",
  data: {
    sessionId,
    expiresIn: 30,  // ADD THIS
    region: process.env.AWS_REGION || "ap-south-1",
    credentials,
  },
});
```

### Fix 2: Update Verify Endpoint Path, Request, and Response

**File:** [`src/app/api/kyc/liveness/verify/route.js`](src/app/api/kyc/liveness/verify/route.js:33)

1. Change confidence threshold to 90%:
```javascript
const isVerified = awsStatus === "SUCCEEDED" && confidence >= 90; // Changed from 80
```

2. Update response structure to match documentation:
```javascript
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
        verified_at: new Date().toISOString(),
        provider: "AWS_REKOGNITION",
        confidence: confidence,
        selfie_url: referenceImageUrl
      }
    },
    onboarding_state: isVerified ? "FACE_LIVENESS_PASSED" : "PENDING"
  },
  next_required_step: isVerified ? "PHYSICAL_PROFILE" : null
});
```

3. Make `userId` optional in request (line 33):
```javascript
const { sessionId, userId } = body; // userId is optional
```

---

## Component Compatibility Notes

The current frontend components ([`FaceLivenessModal.jsx`](src/app/(home)/home/components/FaceLivenessModal.jsx:104) and [`liveness/page.jsx`](src/app/onboarding/kyc/liveness/page.jsx:103)) expect the current response format. After making the above fixes:

1. Components expect `response.data.status` - still valid ✅
2. Components use `response.data.next_required_step` - needs to match new structure ✅
3. Navigation logic in `liveness/page.jsx` line 111 uses `next_required_step` - will work with fix ✅

---

## Conclusion

The core implementation is functional but needs alignment with the documented API specification. The main issues are:

1. **API Path Prefix**: Routes should be prefixed with `/api/v1/kyc/` to match documentation
2. **Missing Fields**: `expiresIn` missing from session response
3. **Wrong Threshold**: Confidence threshold should be 90% not 80%
4. **Response Structure**: Verify endpoint needs complete restructuring to match documentation

The frontend components are well-implemented and will work correctly once the backend API is aligned with the documentation.
