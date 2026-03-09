# Frontend Onboarding Flow Guide

This guide provides frontend developers with the necessary information to handle the user onboarding flow correctly, based on the current backend implementation.

---

## Table of Contents

1. [Onboarding States Overview](#onboarding-states-overview)
2. [Login Response Handling](#login-response-handling)
3. [Onboarding State Redirect Logic](#onboarding-state-redirect-logic)
4. [Questionnaire Completion Flow](#questionnaire-completion-flow)
5. [Extended Profile Flow](#extended-profile-flow)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [API Endpoints Summary](#api-endpoints-summary)

---

## Onboarding States Overview

The backend uses the following onboarding states (in order):

```
INIT 
→ PHONE_VERIFIED 
→ EMAIL_VERIFIED 
→ BASIC_ACCOUNT_CREATED 
→ GENDER_CAPTURED 
→ DOB_CAPTURED 
→ PARENT_CONSENT_PENDING (minors only)
→ LOCATION_CAPTURED 
→ PROFILE_PHOTO_CAPTURED 
→ ACTIVITY_INTENT_CAPTURED 
→ PROFILE_DETAILS_CAPTURED 
→ AADHAAR_VERIFIED / VERIFICATION_PENDING 
→ FACE_LIVENESS_PASSED 
→ KYC_COMPLETED 
→ PHYSICAL_PROFILE_CONSENT 
→ PHYSICAL_PROFILE_COMPLETED 
→ QUESTIONNAIRE_STARTED 
→ QUESTIONNAIRE_COMPLETED 
→ EXTENDED_PROFILE_INTRO 
→ EXTENDED_PROFILE_PENDING 
→ EXTENDED_PROFILE_COMPLETED 
→ COMPLETED / ACTIVE_USER
```

### Key States for Frontend Redirects

| State | Frontend Route | Description |
|-------|---------------|-------------|
| `INIT` - `PROFILE_DETAILS_CAPTURED` | `/onboarding/profile` | Profile setup |
| `AADHAAR_VERIFIED` | `/onboarding/kyc/aadhaar` | KYC verification |
| `FACE_LIVENESS_PASSED` | `/onboarding/kyc/liveness` | Face verification |
| `KYC_COMPLETED` | `/onboarding/physical` | Physical profile |
| `PHYSICAL_PROFILE_CONSENT` | `/onboarding/physical/consent` | Physical profile consent |
| `PHYSICAL_PROFILE_COMPLETED` | `/onboarding/questionnaire` | Questionnaire intro |
| `QUESTIONNAIRE_STARTED` | `/onboarding/questionnaire` | Questionnaire |
| `QUESTIONNAIRE_COMPLETED` | `/onboarding/extended-profile-intro` | Extended profile intro |
| `EXTENDED_PROFILE_INTRO` | `/onboarding/experience` | Extended profile |
| `EXTENDED_PROFILE_COMPLETED` | `/home` | Main app |
| `COMPLETED` / `ACTIVE_USER` | `/home` | Main app |

---

## Login Response Handling

When the user logs in, the backend returns a `next_required_step` field that tells the frontend where to redirect the user.

### Login Response Structure

```json
{
  "status": "success",
  "user": {
    "email_verified": true,
    "phone_verified": true
  },
  "next_required_step": "EXTENDED_PROFILE_INTRO"
}
```

### Frontend Implementation

```javascript
// Handle login response
const handleLoginResponse = (response) => {
  const { next_required_step, tokens } = response;
  
  // Store tokens
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  
  // Redirect based on next required step
  switch (next_required_step) {
    case 'EMAIL_VERIFICATION':
      navigate('/onboarding/email-verification');
      break;
    case 'PHONE_VERIFICATION':
      navigate('/onboarding/phone-verification');
      break;
    case 'NAME_CAPTURE':
      navigate('/onboarding/name');
      break;
    case 'PROFILE_SETUP':
      navigate('/onboarding/profile');
      break;
    case 'KYC_AADHAAR':
      navigate('/onboarding/kyc/aadhaar');
      break;
    case 'KYC_LIVENESS':
      navigate('/onboarding/kyc/liveness');
      break;
    case 'PHYSICAL_PROFILE':
      navigate('/onboarding/physical');
      break;
    case 'PHYSICAL_PROFILE_CONSENT':
      navigate('/onboarding/physical/consent');
      break;
    case 'QUESTIONNAIRE':
      navigate('/onboarding/questionnaire');
      break;
    case 'EXTENDED_PROFILE_INTRO':
    case 'EXTENDED_PROFILE':
      navigate('/onboarding/experience');
      break;
    case 'MAIN_APP':
      navigate('/home');
      break;
    default:
      navigate('/home');
  }
};
```

---

## Onboarding State Redirect Logic

The frontend should maintain a list of "completed" states that redirect to home, and handle intermediate states appropriately.

### Completed States (Redirect to Home)

```javascript
const COMPLETED_STATES = ['COMPLETED', 'ACTIVE_USER'];
```

### Redirect Logic

```javascript
const getRedirectPath = (onboardingState) => {
  // Final states - redirect to home
  if (COMPLETED_STATES.includes(onboardingState)) {
    return '/home';
  }
  
  // Questionnaire completed but extended profile not done
  if (onboardingState === 'QUESTIONNAIRE_COMPLETED') {
    return '/onboarding/experience'; // Extended profile intro
  }
  
  // Extended profile intro - redirect to experience
  if (onboardingState === 'EXTENDED_PROFILE_INTRO') {
    return '/onboarding/experience';
  }
  
  // Extended profile pending - also redirect to experience
  if (onboardingState === 'EXTENDED_PROFILE_PENDING') {
    return '/onboarding/experience';
  }
  
  // Physical profile states
  if (onboardingState === 'PHYSICAL_PROFILE_CONSENT') {
    return '/onboarding/physical/consent';
  }
  
  if (onboardingState === 'PHYSICAL_PROFILE_COMPLETED') {
    return '/onboarding/questionnaire';
  }
  
  // Questionnaire started but not completed
  if (onboardingState === 'QUESTIONNAIRE_STARTED') {
    return '/onboarding/questionnaire';
  }
  
  // KYC states
  if (onboardingState === 'AADHAAR_VERIFIED' || onboardingState === 'VERIFICATION_PENDING') {
    return '/onboarding/kyc/aadhaar';
  }
  
  if (onboardingState === 'FACE_LIVENESS_PASSED') {
    return '/onboarding/kyc/liveness';
  }
  
  if (onboardingState === 'KYC_COMPLETED') {
    return '/onboarding/physical';
  }
  
  // Default: profile setup
  return '/onboarding/profile';
};
```

### On App Load Check

```javascript
// Check onboarding state on app load
const checkOnboardingStatus = async () => {
  try {
    const response = await api.get('/auth/me');
    const { onboarding_state, next_required_step } = response.data;
    
    const redirectPath = getRedirectPath(onboarding_state);
    
    // Only redirect if not already on the correct page
    const currentPath = window.location.pathname;
    if (currentPath !== redirectPath && currentPath !== '/home') {
      // Check if trying to access home without completing onboarding
      if (redirectPath === '/home') {
        // Already completed, allow access
        return;
      }
      // Redirect to correct onboarding step
      navigate(redirectPath);
    }
  } catch (error) {
    // Handle error - redirect to login
    navigate('/login');
  }
};
```

---

## Questionnaire Completion Flow

### Complete Questionnaire API

```javascript
// POST /api/v1/questionnaire/complete
const completeQuestionnaire = async (sessionId) => {
  try {
    const response = await api.post('/questionnaire/complete', {
      session_id: sessionId
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to complete questionnaire:', error);
    throw error;
  }
};
```

### Response Handling

```javascript
const handleQuestionnaireComplete = async (sessionId) => {
  try {
    const result = await completeQuestionnaire(sessionId);
    
    if (result.success) {
      // The backend returns redirect_to: 'main_app' but this is misleading
      // The actual next step is EXTENDED_PROFILE_INTRO
      
      // Navigate to extended profile intro
      navigate('/onboarding/experience');
      
      // Optionally show success message
      showToast('Questionnaire completed successfully!');
    }
  } catch (error) {
    showError('Failed to complete questionnaire. Please try again.');
  }
};
```

**Important Note:** The backend returns `redirect_to: 'main_app'` but this is incorrect for users who haven't completed the extended profile. The frontend should always redirect to `/onboarding/experience` after questionnaire completion.

---

## Extended Profile Flow

### Extended Profile Intro

```javascript
// GET /api/v1/questionnaire/extended-profile
const getExtendedProfileIntro = async () => {
  const response = await api.get('/questionnaire/extended-profile');
  return response.data;
};
```

### Skip Extended Profile

```javascript
// POST /api/v1/questionnaire/skip-extended
const skipExtendedProfile = async () => {
  const response = await api.post('/questionnaire/skip-extended');
  return response.data;
};
```

### Complete Extended Profile

```javascript
// POST /api/v1/questionnaire/extended-profile/complete
const completeExtendedProfile = async (data) => {
  const response = await api.post('/questionnaire/extended-profile/complete', data);
  return response.data;
};
```

### Extended Profile Flow

```javascript
const handleExtendedProfileFlow = async () => {
  // 1. Get extended profile intro
  const intro = await getExtendedProfileIntro();
  
  if (intro.show_intro) {
    // Show intro screen first
    navigate('/onboarding/experience-intro');
  }
  
  // 2. User can skip or complete
  const handleSkip = async () => {
    await skipExtendedProfile();
    navigate('/home'); // Now they can go to main app
  };
  
  const handleComplete = async (data) => {
    await completeExtendedProfile(data);
    navigate('/home'); // Now they can go to main app
  };
};
```

---

## Common Issues and Solutions

### Issue 1: User Stuck at Questionnaire

**Symptoms:** 
- User completes questionnaire but gets redirected back to questionnaire
- Admin shows user at "questionnaire" state

**Solution:**
1. Ensure frontend calls `/questionnaire/complete` endpoint after all questionnaire categories are completed
2. Check that the API call is successful before redirecting
3. Verify the session_id is passed correctly

```javascript
// Correct implementation
const completeQuestionnaireFlow = async (sessionId) => {
  try {
    // Call the complete endpoint
    const result = await api.post('/questionnaire/complete', {
      session_id: sessionId
    });
    
    // Only redirect after successful response
    if (result.data.success) {
      // Redirect to extended profile, NOT home
      navigate('/onboarding/experience');
    }
  } catch (error) {
    console.error('Error:', error);
    // Show error message
  }
};
```

### Issue 2: User Stuck at Extended Profile Intro

**Symptoms:**
- User sees extended profile intro screen repeatedly
- Can't proceed to main app

**Solution:**
1. After completing questionnaire, user should go to `/onboarding/experience`
2. From there, they can either skip or complete extended profile
3. Only after EXTENDED_PROFILE_COMPLETED can they go to home

### Issue 3: Redirect Loop

**Symptoms:**
- User gets stuck in a loop between login and onboarding pages

**Solution:**
```javascript
// Implement proper redirect logic
const shouldRedirectToOnboarding = (onboardingState) => {
  const completedStates = ['COMPLETED', 'ACTIVE_USER'];
  return !completedStates.includes(onboardingState);
};

// In your auth check
useEffect(() => {
  const checkAuth = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const { onboarding_state } = await getUserProfile();
    
    if (shouldRedirectToOnboarding(onboarding_state)) {
      const path = getRedirectPath(onboarding_state);
      navigate(path);
    } else if (currentPath !== '/home') {
      navigate('/home');
    }
  };
  
  checkAuth();
}, [isAuthenticated]);
```

### Issue 4: State Mismatch After API Call

**Symptoms:**
- API returns success but state doesn't update
- User has to refresh page

**Solution:**
1. After any state-changing API call, refetch the user profile
2. Use the new state to determine redirect

```javascript
const handleStateUpdate = async () => {
  // Make the API call
  await someStateUpdateApi();
  
  // Refetch user profile to get updated state
  const updatedProfile = await getUserProfile();
  
  // Use updated state for redirect
  const redirectPath = getRedirectPath(updatedProfile.onboarding_state);
  navigate(redirectPath);
};
```

---

## API Endpoints Summary

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | Login with OTP |
| `/api/v1/auth/verify-otp` | POST | Verify OTP and get tokens |
| `/api/v1/auth/me` | GET | Get current user info |

### Questionnaire

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/questionnaire/categories` | GET | Get questionnaire categories |
| `/api/v1/questionnaire/session/start` | POST | Start questionnaire session |
| `/api/v1/questionnaire/session/:id/answers` | POST | Save answers |
| `/api/v1/questionnaire/complete` | POST | Complete questionnaire |
| `/api/v1/questionnaire/extended-profile` | GET | Get extended profile data |
| `/api/v1/questionnaire/skip-extended` | POST | Skip extended profile |
| `/api/v1/questionnaire/extended-profile/complete` | POST | Complete extended profile |

### Onboarding Progress

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/onboarding/progress` | GET | Get onboarding progress |
| `/api/v1/onboarding/step/:step` | POST | Complete an onboarding step |

---

## Testing Checklist

- [ ] User can login and is redirected to correct onboarding step
- [ ] User completes profile setup and progresses through KYC
- [ ] User completes physical profile
- [ ] User completes questionnaire and is redirected to extended profile
- [ ] User can skip extended profile and go to main app
- [ ] User can complete extended profile and go to main app
- [ ] Logged in user with COMPLETED state goes directly to home
- [ ] Refreshing page maintains correct onboarding state

---

## Backend State Updates (Reference)

The backend updates user state at these points:

1. **Phone Verification** → `PHONE_VERIFIED`
2. **Email Verification** → `EMAIL_VERIFIED`
3. **Profile Details** → `PROFILE_DETAILS_CAPTURED`
4. **Aadhaar Verification** → `AADHAAR_VERIFIED` or `VERIFICATION_PENDING`
5. **Face Liveness** → `FACE_LIVENESS_PASSED`
6. **KYC Complete** → `KYC_COMPLETED`
7. **Physical Profile Consent** → `PHYSICAL_PROFILE_CONSENT`
8. **Physical Profile Complete** → `PHYSICAL_PROFILE_COMPLETED`
9. **Questionnaire Complete** → `QUESTIONNAIRE_COMPLETED`
10. **Extended Profile Intro Viewed** → `EXTENDED_PROFILE_INTRO`
11. **Extended Profile Complete** → `EXTENDED_PROFILE_COMPLETED`
12. **Final Completion** → `COMPLETED` / `ACTIVE_USER`

---

*Last Updated: 2026-03-09*
*Based on Backend Code Analysis*
