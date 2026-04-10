# KYC Integration Implementation Plan for Team Creation

## Current Analysis

### 1. KYC & Teams Pages Analysis

#### Teams Page (`/teams`)
- Location: `src/app/(home)/teams/page.jsx`
- Uses `checkEligibility()` API to check team creation eligibility
- Returns: `can_create_team`, `kyc_status`, `max_teams_allowed`, `teams_created_count`, etc.
- If `kyc_status !== "verified"`, shows KYC modal and redirects to `/home/settings/kyc`

#### Create Team Page (`/teams/create-team`)
- Location: `src/app/(home)/teams/create-team/page.jsx` (line 460)
- Current flow: Shows KYC verification required modal when `eligibility.kyc_status !== "verified"`
- "Complete KYC" button navigates to `/home/settings/kyc` (currently non-existent)

### 2. Current KYC Flow (Working)

| Step | Route | Description |
|------|-------|-------------|
| 1 | `/onboarding/kyc` | DigiLocker Aadhaar verification |
| 2 | `/onboarding/kyc/liveness` | Face liveness verification (AWS Amplify) |
| 3 | `/onboarding/physical` | Physical profile (after KYC completion) |

#### KYC Page (`/onboarding/kyc`)
- Location: `src/app/onboarding/kyc/page.jsx`
- Flow: Intro → DigiLocker redirect → Polling → Fetch document → Route to liveness
- Uses `kycService.digilockerCreateUrl()`, `digilockerStatus()`, `digilockerDocument()`
- After Aadhaar verification, routes to `/onboarding/kyc/liveness` (if liveness enabled)

#### Liveness Page (`/onboarding/kyc/liveness`)
- Location: `src/app/onboarding/kyc/liveness/page.jsx`
- Uses AWS Amplify FaceLivenessDetector
- Flow: Initialize session → Face capture → Verify → Success
- After success, routes to `/onboarding/physical`

### 3. Eligibility API

**Endpoint:** `GET /api/v1/teams/eligibility`

**Response:**
```json
{
  "can_create_team": true/false,
  "kyc_status": "verified"/"pending"/"not_verified"/null,
  "max_teams_allowed": 5,
  "teams_created_count": 2,
  "denial_reason": null
}
```

## Problem Identified

- The button in the KYC modal navigates to `/home/settings/kyc` which **does not exist**
- The actual KYC flow is at `/onboarding/kyc`

## Implementation Plan

### Option 1: Fix the Route (Quick Fix)

**Step 1:** Change the navigation from `/home/settings/kyc` to `/onboarding/kyc`

**Files to modify:**
- `src/app/(home)/teams/create-team/page.jsx` (line 478)
- `src/app/(home)/teams/page.jsx` (line showing KYC modal)

```javascript
// Change from:
onClick={() => router.push('/home/settings/kyc')}

// To:
onClick={() => router.push('/onboarding/kyc')}
```

### Option 2: Create Proper KYC Redirect with Return URL (Recommended)

**Step 1:** Create a new KYC redirect page at `/home/settings/kyc`

**New file:** `src/app/(home)/settings/kyc/page.jsx`

```javascript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { userService } from "@/services/user";

export default function SettingsKycPage() {
  const router = useRouter();

  useEffect(() => {
    const checkKycAndRedirect = async () => {
      try {
        // Check current KYC status
        const response = await userService.getOnboardingStatus();
        const state = response?.data?.data?.onboarding_state;
        
        const completedStates = [
          "KYC_COMPLETED",
          "PHYSICAL_PROFILE_CONSENT",
          "PHYSICAL_PROFILE_COMPLETED",
          "QUESTIONNAIRE_COMPLETE",
          "COMPLETED",
          "ACTIVE",
        ];

        if (completedStates.includes(state)) {
          // Already completed - redirect back to teams
          router.push("/teams");
          return;
        }

        // Not completed - redirect to KYC flow
        router.push("/onboarding/kyc");
      } catch (error) {
        // On error, redirect to KYC
        router.push("/onboarding/kyc");
      }
    };

    checkKycAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
    </div>
  );
}
```

**Step 2:** Optionally pass return URL for after KYC completion

```javascript
// In the KYC redirect page, store return URL
if (typeof window !== 'undefined') {
  localStorage.setItem('kyc_return_url', '/teams/create-team');
}

// After KYC completion in liveness page, check for return URL
const returnUrl = localStorage.getItem('kyc_return_url');
if (returnUrl) {
  localStorage.removeItem('kyc_return_url');
  router.push(returnUrl);
}
```

### Option 3: Full Integration with Real-time Check (Most Complete)

**Step 1:** Modify the eligibility check in create-team page to re-check on modal open

**Step 2:** Add polling or callback to detect KYC completion

**Step 3:** Auto-refresh eligibility after KYC completes

### Recommended Implementation: Option 2

#### Implementation Details:

1. **Create `/home/settings/kyc` page** - Redirects to KYC flow
2. **Pass return URL** - Store in localStorage before redirect
3. **Modify KYC completion** - Check for return URL and redirect back
4. **Re-check eligibility** - After KYC completion, user can create team

#### Files to Create:
- `src/app/(home)/settings/kyc/page.jsx` - New redirect page

#### Files to Modify:
- `src/app/(home)/teams/create-team/page.jsx` - Already correct route, just need the page to exist
- `src/app/(home)/teams/page.jsx` - If there's a KYC modal with navigation
- `src/app/onboarding/kyc/liveness/page.jsx` - Add return URL check after success

#### Step-by-step Flow After Implementation:

```
User clicks "Create Team"
        ↓
Eligibility check: kyc_status !== "verified"
        ↓
Show KYC Modal with "Complete KYC" button
        ↓
User clicks "Complete KYC"
        ↓
Navigate to /home/settings/kyc (new page)
        ↓
Redirect to /onboarding/kyc
        ↓
User completes Aadhaar verification
        ↓
Navigate to /onboarding/kyc/liveness
        ↓
User completes Face Liveness
        ↓
Check for kyc_return_url in localStorage
        ↓
If returnUrl exists → redirect to /teams/create-team
Else → redirect to /onboarding/physical
        ↓
User can now create team (kyc_status = "verified")
```

## Summary

| Item | Details |
|------|---------|
| **Issue** | `/home/settings/kyc` route doesn't exist |
| **Solution** | Create the page as KYC redirector |
| **KYC Flow** | `/onboarding/kyc` → `/onboarding/kyc/liveness` → `/onboarding/physical` |
| **API** | `GET /api/v1/teams/eligibility` |
| **Key Field** | `kyc_status === "verified"` required for team creation |
