Playymate Backend API Documentation 
Comprehensive User-Facing API Reference 
This document provides complete API documentation for all user-facing endpoints in the 
Playymate backend. It excludes admin APIs and deprecated endpoints. 
Table of Contents 
1. API Standards 
2. Onboarding 
3. Authentication 
4. User Profile 
5. KYC Verification 
6. Questionnaire 
7. Media Management 
8. State Machine 
9. Error Codes 
1. API Standards 
Base URL 
/api/v1 
Headers Required 
Header 
Value 
Content-Type application/json 
Authorization Bearer 
<access_token> 
Response Format 
Required 
Yes 
For authenticated 
endpoints 
All responses follow this structure: 
{ 
} 
"status": "success" | "error", 
"message": "string", 
"data": {}, 
"error_code": "OPTIONAL_CODE" 
Authentication Flow 
● Access Token: Issued after /auth/complete, expires in configured TTL 
● Refresh Token: Issued with access token, used to get new access tokens 
● Auth Flow ID: Returned after first OTP verification, must be passed to subsequent calls 
3. Authentication 
Endpoints 
3.1 Social Login - Google 
POST /api/v1/auth/social/google 
Auth Required: No 
Request: 
{ 
} 
"id_token": "string (Firebase Google token)", 
"device_id": "string (optional)" 
Response (200): 
{ 
"status": "success", 
"data": { 
"user": { "email_verified": true, "phone_verified": false }, 
"next_required_step": "PHONE_VERIFICATION", 
"auth_flow_id": "af_abc123xyz" 
} 
} 
3.2 Social Login - Facebook 
POST /api/v1/auth/social/facebook 
Auth Required: No 
Request: 
{ 
} 
"id_token": "string (Firebase Facebook token)", 
"access_token": "string (alternative to id_token)", 
"device_id": "string (optional)" 
3.3 Social Login - Apple 
POST /api/v1/auth/social/apple 
Auth Required: No 
Request: 
{ 
} 
"id_token": "string (Apple ID token)", 
"device_id": "string (optional)" 
3.4 Phone OTP - Send 
POST /api/v1/auth/phone/send-otp 
Auth Required: No 
Request: 
{ 
} 
"phone": "+911234567890", 
"auth_flow_id": "string (optional, use if continuing existing flow)" 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "user": { "email_verified": false, "phone_verified": false }, 
    "next_required_step": "PHONE_VERIFICATION", 
    "auth_flow_id": "af_abc123xyz" 
  }, 
  "debug_otp": "123456 (only in debug/test mode)" 
} 
 
3.5 Phone OTP - Verify 
POST /api/v1/auth/phone/verify-otp 
Auth Required: No 
 
Request: 
{ 
  "otp": "123456", 
  "auth_flow_id": "af_abc123xyz", 
  "phone": "+911234567890 (optional)" 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "user": { "email_verified": false, "phone_verified": true }, 
    "next_required_step": "EMAIL_VERIFICATION", 
    "auth_flow_id": "af_abc123xyz" 
  } 
} 
 
3.6 Email OTP - Send 
POST /api/v1/auth/email/send-otp 
Auth Required: No 
 
Request: 
{ 
  "email": "user@example.com", 
  "auth_flow_id": "af_abc123xyz" 
} 
 
3.7 Email OTP - Verify 
POST /api/v1/auth/email/verify-otp 
Auth Required: No 
 
Request: 
{ 
  "otp": "123456", 
  "auth_flow_id": "af_abc123xyz", 
  "email": "user@example.com (optional)" 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "user": { "email_verified": true, "phone_verified": true }, 
    "next_required_step": "NAME_CAPTURE", 
    "auth_flow_id": "af_abc123xyz" 
  } 
} 
 
3.8 Email Password Signup 
POST /api/v1/auth/signup/email-password 
Auth Required: No 
 
Request: 
{ 
  "email": "user@example.com", 
  "password": "SecurePass123!", 
  "confirm_password": "SecurePass123!" 
} 
 
Validation: 
● password: Min 8 chars, must contain: uppercase, lowercase, digit, special char 
3.9 Name Capture 
POST /api/v1/auth/profile/name 
Auth Required: No 
 
Request: 
{ 
  "full_name": "John Doe", 
  "auth_flow_id": "af_abc123xyz (optional)" 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "user": { "email_verified": true, "phone_verified": true }, 
    "next_required_step": "GENDER", 
    "auth_flow_id": "af_abc123xyz" 
  } 
} 
 
3.10 Complete Login (Issue Tokens) 
POST /api/v1/auth/complete 
Auth Required: No 
 
Request: 
{ 
  "auth_flow_id": "af_abc123xyz", 
  "device_info": { 
    "device_id": "string", 
    "user_agent": "string", 
    "platform": "ios/android" 
  } 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "access_token": "eyJhbGc...", 
    "refresh_token": "eyJhbGc...", 
    "expires_in": 3600, 
    "user_state": "BASIC_ACCOUNT_CREATED", 
    "session_id": "session_id", 
    "device_info": {} 
  }, 
  "next_required_step": "GENDER" 
} 
 
3.11 Refresh Token 
POST /api/v1/auth/refresh 
Auth Required: No 
 
Request: 
{ 
  "refresh_token": "eyJhbGc..." 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "access_token": "eyJhbGc...", 
    "refresh_token": "eyJhbGc...", 
    "expires_in": 3600 
  } 
} 
 
3.12 Logout 
POST /api/v1/auth/logout 
Auth Required: Yes (Bearer Token) 
 
Request (optional): 
{ 
"refresh_token": "eyJhbGc..." 
} 
Response (200): 
{ 
} 
"status": "success", 
"message": "Logged out successfully", 
"data": null 
3.13 Logout All Sessions 
POST /api/v1/auth/logout-all 
Auth Required: Yes (Bearer Token) 
Response (200): 
{ 
} 
"status": "success", 
"message": "Logged out from all sessions", 
"data": null 
4. User Profile 
4.2 Update Gender 
POST /api/v1/users/profile/gender 
Auth Required: Yes 
Request: 
{ 
} 
"gender": "male" | "female" | "other" | "prefer_not_to_say" 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "gender": "male", 
    "onboarding_state": "GENDER_CAPTURED" 
  }, 
  "next_required_step": "DOB" 
} 
 
4.3 Update Date of Birth 
POST /api/v1/users/profile/dob 
Auth Required: Yes 
 
Request: 
{ 
  "dob": "1995-06-15" 
} 
 
Response (200 - Adult): 
{ 
  "status": "success", 
  "data": { 
    "dob": "1995-06-15T00:00:00.000Z", 
    "age_group": "18_plus", 
    "onboarding_state": "DOB_CAPTURED" 
  }, 
  "consent_required": false, 
  "next_required_step": "LOCATION" 
} 
 
Response (200 - Minor): 
{ 
  "status": "success", 
  "data": { 
    "dob": "2010-06-15T00:00:00.000Z", 
    "age_group": "16_17", 
    "onboarding_state": "PARENT_CONSENT_PENDING", 
    "parent_consent_status": "PENDING" 
  }, 
  "consent_required": true, 
  "next_required_step": "PARENT_CONSENT" 
} 
 
4.4 Parent Consent (Minors Only) 
POST /api/v1/users/parent/consent/give 
Auth Required: Yes 
 
Request: 
{ 
  "accepted": true 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "parent_consent_status": "APPROVED", 
    "onboarding_state": "PARENT_CONSENT_APPROVED" 
  }, 
  "next_required_step": "LOCATION" 
} 
 
4.5 Get Parent Consent Status 
GET /api/v1/users/parent/consent/status 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "status": "APPROVED" | "PENDING" | "REVOKED" | "EXPIRED", 
    "expires_at": "2025-01-01T00:00:00.000Z" 
  } 
} 
 
4.6 Revoke Parent Consent 
POST /api/v1/users/parent/consent/revoke 
Auth Required: Yes 
Request: 
{ 
} 
"reason": "string (optional)" 
4.8.1 Multiple Profile Photos Upload (NEW) 
Overview: Users can upload up to 3 profile photos: 
● 1 required (primary photo with face validation) 
● 2 optional (additional photos without face validation) 
The first photo uploaded becomes the primary photo automatically and requires face 
validation. Additional photos can be added without face validation. 
4.8.1.1 Upload Profile Photo (Supports Multiple) 
Endpoint: POST /api/v1/users/profile-photo 
Auth Required: Yes (Bearer Token) 
Headers Required: 
Authorization: Bearer <access_token> 
Request Body: 
json 
{ 
"image_url": "https://s3.wasabisys.com/bucket/users/.../photo1.jpg", 
"is_primary": false, 
"order": 1 
} 
Note: Use wasabi_url from the /users/media/presign response, not file_url. 
Field Validations: 
Field 
Type Required 
Rules 
image_url string 
is_primary boolea
n 
order 
Yes 
No 
number No 
Upload Flow: 
Valid URL to image 
Set as primary photo (only one primary allowed) 
Photo order (0, 1, 2) 
1. Call /users/media/presign to get upload URL 
2. Upload image directly to Wasabi using upload_url 
3. Use the returned wasabi_url in /users/profile-photo payload 
Note: The response includes both file_url (CDN) and wasabi_url (direct Wasabi). Use 
wasabi_url for profile photos. 
Behavior: 
● First photo (no existing photos): Requires face validation → becomes primary 
automatically 
● Additional photos (2nd, 3rd): No face validation required 
● Maximum 3 photos total 
Success Response (First Photo - with face validation): 
json 
{ 
"status": "success", 
"message": "Primary profile photo accepted", 
"data": { 
"face_detected": true, 
"is_primary": true, 
"total_photos": 1, 
"max_photos": 3, 
"remaining_slots": 2 
}, 
"error_code": null 
} 
Success Response (Additional Photos - no face validation): 
json 
{ 
  "status": "success", 
  "message": "Additional profile photo accepted", 
  "data": { 
    "face_detected": false, 
    "is_primary": false, 
    "total_photos": 2, 
    "max_photos": 3, 
    "remaining_slots": 1 
  }, 
  "error_code": null 
} 
Error Responses: 
Error Code HTTP 
Status 
Message 
USER_NOT_FOUND 404 User not found 
IMAGE_URL_REQUIRED 400 Please provide an image URL 
ONBOARDING_INCOMPLETE 400 Complete location before profile photo 
MAX_PHOTOS_REACHED 400 Maximum 3 profile photos allowed 
PRIMARY_PHOTO_EXISTS 400 Primary photo already exists. Cannot set 
another as primary. 
FACE_NOT_DETECTED 400 No face detected in the image (first photo 
only) 
MULTIPLE_FACES 400 Multiple faces detected (first photo only) 
LOW_FACE_CONFIDENCE 400 Face detection confidence too low (first 
photo only) 
State Transition: LOCATION_CAPTURED → PROFILE_PHOTO_CAPTURED (after first 
photo) 
 
4.7 Update Location 
POST /api/v1/users/profile/location 
Auth Required: Yes 
 
Request (using Google Places): 
{ 
  "place_id": "ChIJn2mOD6iWTkERFJDb-IlfWw" 
} 
 
Request (using coordinates): 
{ 
  "lat": 28.6139, 
  "lng": 77.209 
} 
 
Request (direct location): 
{ 
  "location": { 
    "type": "Point", 
    "coordinates": [77.209, 28.6139] 
  }, 
  "address": { 
    "city": "New Delhi", 
    "state": "Delhi", 
    "country": "India", 
    "pincode": "110001" 
  } 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "location": { "type": "Point", "coordinates": [77.209, 28.6139] }, 
    "address": { "city": "New Delhi", "state": "Delhi", "country": "India", "pincode": "110001" }, 
    "onboarding_state": "LOCATION_CAPTURED" 
  }, 
  "next_required_step": "PROFILE_PHOTO" 
} 
 
4.12 Get Activity Intent Roles 
GET /api/v1/users/activity-intent/roles 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "roles": [ 
      { "value": "student", "label": "Student", "description": "I am a student" }, 
      { "value": "working", "label": "Working Professional", "description": "I am employed" }, 
      { "value": "business", "label": "Business Owner", "description": "I run a business" }, 
      { "value": "freelancer", "label": "Freelancer", "description": "I work independently" }, 
      { "value": "other", "label": "Other", "description": "Other activities" } 
    ] 
  } 
} 
 
4.13 Set Activity Intent 
POST /api/v1/users/activity-intent 
Auth Required: Yes 
 
Request: 
{ 
  "activity_type": "student", 
  "details": {} 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "activity_intent": { "type": "student", "details": {}, "set_at": "2024-01-15T10:30:00.000Z" }, 
    "onboarding_state": "ACTIVITY_INTENT_CAPTURED" 
  }, 
  "next_required_step": "PROFILE_DETAILS" 
} 
 
4.14 Get Profile Role Config 
GET /api/v1/users/profile-role-config 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "configs": [ 
      { 
        "role_type": "student", 
        "fields": [ 
          { "key": "college_name", "type": "text", "required": true }, 
          { "key": "course", "type": "text", "required": true } 
        ] 
      } 
    ] 
  } 
} 
 
4.15 Get Profile Role Config by Type 
GET /api/v1/users/profile-role-config/:role_type 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "role_type": "student", 
    "fields": [ 
      { "key": "college_name", "type": "text", "required": true, "label": "College Name" }, 
      { "key": "course", "type": "text", "required": true, "label": "Course" }, 
      { "key": "year_of_study", "type": "select", "required": true, "label": "Year" } 
    ] 
  } 
} 
 
4.16 Save Profile Details 
POST /api/v1/users/profile-details 
Auth Required: Yes 
 
Request (Student): 
{ 
  "role_type": "student", 
  "details": { 
    "college_name": "Delhi University", 
    "course": "Computer Science", 
    "year_of_study": "3", 
    "current_city": "New Delhi" 
  } 
} 
 
Request (Working): 
{ 
  "role_type": "working", 
  "details": { 
    "job_title": "Software Engineer", 
    "company_name": "Tech Corp", 
    "industry": "Information Technology", 
    "experience_level": "mid", 
    "current_city": "Bangalore" 
  } 
} 
 
Request (Business): 
{ 
  "role_type": "business", 
  "details": { 
    "business_name": "My Shop", 
    "business_address": "123 Market St", 
    "business_description": "Retail store", 
    "current_city": "Mumbai" 
  } 
} 
 
Request (Freelancer): 
{ 
  "role_type": "freelancer", 
  "details": { 
    "profession": "Graphic Designer", 
    "current_city": "Pune" 
  } 
} 
 
Request (Other): 
{ 
  "role_type": "other", 
  "details": { 
    "description": "Looking for opportunities", 
    "current_city": "Chennai" 
  } 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "role_type": "student", 
    "profile_details": { 
      "role_specific": { "college_name": "Delhi University", "course": "Computer Science", 
"year_of_study": "3" }, 
      "common_fields": { "current_city": "New Delhi" }, 
      "set_at": "2024-01-15T10:30:00.000Z" 
    }, 
    "onboarding_state": "PROFILE_DETAILS_CAPTURED" 
  }, 
  "next_required_step": "KYC_INFO" 
} 
 
 
 
 
5. KYC Verification 
5.1 Get KYC Status 
GET /api/v1/kyc/status 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "kyc_status": "pending_verification", 
    "aadhaar_verified": false, 
    "liveness_verified": false, 
    "grace_expires_at": null, 
    "requirements": { 
      "aadhaar": { "required": true }, 
      "liveness": { "required": true } 
    } 
  } 
} 
 
5.2 Get KYC Screen Visibility 
GET /api/v1/kyc/screens 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "screens": { 
      "aadhaar": { "enabled": true }, 
      "liveness": { "enabled": true } 
    } 
  } 
} 
 
5.3 Skip Aadhaar (Soft KYC) 
POST /api/v1/kyc/skip-aadhaar 
Auth Required: Yes 
 
Request: 
{ 
  "skip_reason": "Admin approved skip" 
} 
 
Response (200): 
{ 
  "status": "success", 
  "message": "Aadhaar verification skipped. Complete within grace period.", 
  "data": { 
    "kyc_status": "pending", 
    "aadhaar_status": "skipped", 
    "grace_expires_at": "2026-03-07T00:00:00.000Z", 
    "days_remaining": 7, 
    "verification_badge": "pending" 
  }, 
  "next_required_step": "VERIFICATION_PENDING" 
} 
 
5.4 DigiLocker Account Check 
POST /api/v1/kyc/digilocker/account-check 
Auth Required: Yes 
 
Request: 
{ 
  "verification_id": "string", 
  "mobile_number": "+919999999999" 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { "has_account": true } 
} 
 
5.5 Create DigiLocker URL 
POST /api/v1/kyc/digilocker/create-url 
Auth Required: Yes 
 
Request: 
{ 
  "verification_id": "string", 
  "document_requested": ["AADHAAR"], 
  "redirect_url": "playymate://kyc-callback (optional)", 
  "user_flow": "standard (optional)" 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "consent_url": "https://digilocker.gov.in/...", 
    "verification_id": "string" 
  } 
} 
 
5.6 Check DigiLocker Status 
GET /api/v1/kyc/digilocker/status?verification_id=string 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "status": "verified" | "pending" | "failed", 
    "verification_id": "string" 
  } 
} 
 
5.7 Fetch Aadhaar Document 
GET /api/v1/kyc/digilocker/document/AADHAAR?verification_id=string 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "aadhaar_number": "XXXXXXXX1234", 
    "name": "John Doe", 
    "dob": "1995-06-15", 
    "gender": "M", 
    "address": { "city": "New Delhi", "state": "Delhi" }, 
    "verification_id": "string" 
  } 
} 
 
5.8 Face Liveness Check 
POST /api/v1/kyc/face-liveness 
Auth Required: Yes 
 
Request: 
{ 
  "image_url": "https://cdn.playymate.com/uploads/liveness_selfie.jpg" 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "liveness_verified": true, 
    "face_matched": true, 
    "confidence": 0.95 
  } 
} 
 
5.9 Complete KYC 
POST /api/v1/kyc/complete 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "message": "KYC completed successfully", 
  "data": { 
"kyc_status": "completed", 
"onboarding_state": "KYC_COMPLETED" 
} 
} 
6. Questionnaire 
Phase A: Physical Profile (First - May be configurable) 
Note: The order of Physical Profile and Questionnaire can be configured by admin. 
Some users may see Questionnaire first, others may see Physical Profile first 
based on provider configuration. 
6.1 Physical Profile Consent 
POST /api/v1/questionnaire/physical-profile/consent 
Auth Required: Yes 
Request: 
{ 
} 
"consent_given": true 
Response (200): 
{ 
} 
"status": "success", 
"data": { 
"consent_given": true, 
"onboarding_state": "PHYSICAL_PROFILE_CONSENT" 
}, 
"next_required_step": "PHYSICAL_PROFILE_QUESTIONS" 
6.2 Get Physical Profile Questions 
GET /api/v1/questionnaire/physical-profile/questions?category_key=string&session_id=string 
Auth Required: Yes 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "session_id": "session_id", 
    "questions": [ 
      { 
        "question_id": "q1", 
        "question_key": "height", 
        "question_text": "What is your height?", 
        "question_type": "single_select", 
        "options": [ 
          { "option_id": "opt1", "label": "Under 5 feet", "value": "under_5" }, 
          { "option_id": "opt2", "label": "5 - 5.5 feet", "value": "5_5.5" } 
        ], 
        "required": true, 
        "category_key": "height" 
      } 
    ], 
    "next_action": "ANSWER_QUESTIONS" 
  } 
} 
 
6.3 Submit Physical Profile Answer 
POST /api/v1/questionnaire/physical-profile/answer 
Auth Required: Yes 
 
Request: 
{ 
  "session_id": "session_id", 
  "question_id": "q1", 
  "selected_option_ids": ["opt2"] 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "session_id": "session_id", 
    "answered_question_id": "q1", 
    "next_action": "CONTINUE_ITEM", 
    "remaining_questions": 4, 
    "profile_completed": false, 
    "reward": { 
      "accumulated": true, 
      "category_key": "physical_profile", 
      "pending_coins": 8.875, 
      "pending_coins_micro": 8875, 
      "per_question_coins": 8.875 
    } 
  } 
} 
 
When profile is complete: 
{ 
  "status": "success", 
  "data": { 
    "session_id": "session_id", 
    "answered_question_id": "medication_details", 
    "next_action": "PHYSICAL_PROFILE_COMPLETE", 
    "remaining_questions": 0, 
    "profile_completed": true, 
    "reward": { 
      "accumulated": true, 
      "category_key": "physical_profile", 
      "pending_coins": 71, 
      "pending_coins_micro": 71000, 
      "per_question_coins": 8.875 
    } 
  } 
} 
 
Coin Reward Details: 
Field Description 
reward.accumulated Whether coins were accumulated for this 
answer 
reward.category_key Category key (always "physical_profile") 
reward.pending_coins 
Current pending coins for this category 
reward.pending_coins_micro Pending coins in micro-units (1000x precision) 
reward.per_question_coins 
Coins earned per question 
Coin Distribution: Physical profile questions now earn coins from the total onboarding reward 
pool. The 500 coins are distributed equally among all active categories (including 
physical_profile). With 7 active categories and 8 physical profile questions: 
● Per category: floor(500 / 7) = 71 coins 
● Per question: 71 / 8 = 8.875 coins (8875 micro-coins) 
● Coins are held as "pending" until onboarding is complete, then credited to wallet 
Note: After completing Physical Profile and all Questionnaire categories, call 
/questionnaire/onboarding/complete to receive all accumulated coins (total: 500 
coins). 
Phase B: Sports & Interest Questionnaire (Second) 
6.4 Get Questionnaire Categories 
GET /api/v1/questionnaire/categories?category_type=preference 
Auth Required: No 
Query Parameters: 
Parameter 
category_typ
e 
Response (200): 
{ 
Type Required 
string No 
"status": "success", 
"data": { 
"categories": [ 
Description 
preference, 
extended 
{ "key": "sports", "name": "Sports", "description": "Cricket, Football, Tennis...", "icon": "url", 
"item_count": 15 }, 
{ "key": "music", "name": "Music", "description": "Rock, Pop, Classical...", "icon": "url", 
"item_count": 20 } 
] 
} 
} 
 
6.5 Get Category Intro 
GET /api/v1/questionnaire/categories/:categoryKey/intro 
Auth Required: No 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "category_key": "sports", 
    "intro": { "title": "Sports", "description": "Select the sports you're interested in", 
"max_selections": 10 } 
  } 
} 
 
6.6 Get Category Items 
GET /api/v1/questionnaire/categories/:categoryKey/items?session_id=string 
Auth Required: No 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "category_key": "sports", 
    "items": [ 
      { "key": "cricket", "name": "Cricket", "image_url": "url", "selected": false }, 
      { "key": "football", "name": "Football", "image_url": "url", "selected": false } 
    ], 
    "selected_count": 0, 
    "remaining_slots": 10 
  } 
} 
 
6.7 Start Questionnaire Session 
POST /api/v1/questionnaire/session/start 
Auth Required: Yes 
 
Request: 
{ 
  "loop_mode": false 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "session_id": "session_id", 
    "loop_mode": false, 
    "started_at": "2024-01-15T10:30:00.000Z", 
    "selected_count": 0, 
    "remaining_slots": 10 
  } 
} 
 
6.8 Get Session Status 
GET /api/v1/questionnaire/session/status?session_id=string 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "session_id": "session_id", 
    "loop_mode": false, 
    "started_at": "2024-01-15T10:30:00.000Z", 
    "selected_items": ["cricket"], 
    "selected_count": 1, 
    "remaining_slots": 9, 
    "completed_categories": [], 
    "next_action": "ANSWER_QUESTIONS" 
  } 
} 
 
6.9 Save Selection 
POST /api/v1/questionnaire/selection 
Auth Required: Yes 
 
Request: 
{ 
  "session_id": "session_id", 
  "category_key": "sports", 
  "selected_items": ["cricket", "football"] 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "session_id": "session_id", 
    "category_key": "sports", 
    "selected_items": ["cricket", "football"], 
    "selected_count": 2, 
    "remaining_slots": 8, 
    "next_action": "ANSWER_QUESTIONS" 
  } 
} 
 
6.10 Get Item Questions 
GET /api/v1/questionnaire/items/:itemKey/questions?session_id=string 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "session_id": "session_id", 
    "item_key": "cricket", 
    "questions": [ 
      { 
        "question_id": "q_cricket_1", 
        "question_text": "How often do you play cricket?", 
        "question_type": "single_select", 
        "options": [ 
          { "option_id": "opt1", "label": "Weekly", "value": "weekly" }, 
          { "option_id": "opt2", "label": "Monthly", "value": "monthly" } 
        ], 
        "required": true 
      } 
    ], 
    "next_action": "ANSWER_QUESTIONS" 
  } 
} 
 
6.11 Submit Answer 
POST /api/v1/questionnaire/answer 
Auth Required: Yes 
 
Request: 
{ 
  "session_id": "session_id", 
  "item_key": "cricket", 
  "question_id": "q_cricket_1", 
  "selected_option_ids": ["opt1"] 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "session_id": "session_id", 
    "item_key": "cricket", 
    "answered_question_id": "q_cricket_1", 
    "next_action": "CONTINUE_ITEM", 
    "remaining_questions": 2 
  } 
} 
 
6.12 Complete Category (with coin reward) 
POST /api/v1/questionnaire/category/complete 
Auth Required: Yes 
 
Request: 
{ 
  "session_id": "session_id", 
  "category_key": "sports" 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "category_key": "sports", 
    "coins_earned": 50, 
    "coins_pending": 50, 
    "total_coins_till_now": 150, 
    "wallet_balance": 0, 
    "message": "Coins will be credited to wallet upon onboarding completion" 
  } 
} 
 
Coin Reward Details: 
Field Description 
coins_earned Coins earned for completing this category 
coins_pending Coins pending (not yet credited to wallet) 
total_coins_till_now Total coins accumulated across all categories 
wallet_balance Current wallet balance (still 0 until onboarding completes) 
Note: Coins are accumulated as "pending" as categories are completed. All pending coins are 
credited to the user's wallet when they complete the entire onboarding flow via 
/questionnaire/onboarding/complete. The total onboarding reward is 500 coins. 
6.13 Complete Questionnaire 
POST /api/v1/questionnaire/complete 
Auth Required: Yes 
 
Request: 
{ 
  "session_id": "session_id (optional)" 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "completed": true, 
    "onboarding_state": "QUESTIONNAIRE_COMPLETED", 
    "summary": {  
      "total_items_selected": 15,  
      "categories_completed": 3  
    }, 
    "coins_summary": { 
      "total_coins_accumulated": 350, 
      "coins_pending": 350, 
      "wallet_balance": 0, 
      "final_bonus": 150, 
      "total_onboarding_coins": 500 
    }, 
    "next_action": "EXTENDED_PROFILE" 
  } 
} 
 
Coin Reward Summary: 
Field Description 
total_coins_accumulate
d 
Total coins earned from all 
categories 
coins_pending Coins waiting to be credited to wallet 
wallet_balance Current wallet balance (still 0) 
final_bonus Bonus coins to reach total of 500 
total_onboarding_coins Total onboarding reward (500 coins) 
Note: Call /questionnaire/onboarding/complete to receive all pending coins in your 
wallet. 
Phase C: Rewards (After Questionnaire) 
6.14 Get Reward Status 
GET /api/v1/questionnaire/reward-status 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "total_earned": 350, 
    "expected_total": 500, 
    "category_rewards": [ 
      { "category_key": "sports", "coins_earned": 150, "questions_completed": 5 }, 
      { "category_key": "music", "coins_earned": 100, "questions_completed": 3 }, 
      { "category_key": "hobbies", "coins_earned": 100, "questions_completed": 4 } 
    ], 
    "coins_pending": 350, 
    "wallet_balance": 0, 
    "completed": false, 
    "final_bonus": 150 
  } 
} 
 
Response Fields: 
Field Description 
total_earned Total coins accumulated from categories 
expected_total Total onboarding reward (500 coins) 
category_reward
s 
Array of category-wise coin earnings 
coins_pending Coins waiting to be credited to wallet 
wallet_balance Current wallet balance (0 until onboarding completes) 
completed Whether onboarding is fully complete 
final_bonus Bonus coins to reach total of 500 
Note: Call /questionnaire/onboarding/complete to credit all pending coins to wallet. 
6.15 Get Onboarding Ledger 
GET /api/v1/questionnaire/wallet/gold-coins/onboarding-ledger?page=1&limit=20 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "transactions": [ 
      { "id": "tx1", "coins": 50, "reason": "Completed Sports category", "timestamp": 
"2024-01-15T10:30:00.000Z" } 
    ], 
    "pagination": { "page": 1, "limit": 20, "total": 1 } 
  } 
} 
 
Phase D: Extended Profile (Optional - After Questionnaire) 
6.16 Get Extended Profile Screens 
GET /api/v1/questionnaire/extended-profile/screens 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "screens": [ 
      { "type": "political", "title": "Political Interests", "questions": [...] }, 
      { "type": "relationship", "title": "Relationship Status", "questions": [...] }, 
      { "type": "community", "title": "Communities", "questions": [...] } 
    ] 
  } 
} 
 
6.17 Save Extended Profile 
POST /api/v1/questionnaire/extended-profile 
Auth Required: Yes 
 
Request: 
{ 
  "political_interest": "string", 
  "follows_political_news": "yes|no|sometimes", 
  "relationship_status": "string", 
  "lifestyle_stage": "string", 
  "part_of_communities": ["community1"], 
  "volunteering": "yes|no", 
  "skip_all": false 
} 
 
6.18 Skip Extended Profile 
POST /api/v1/questionnaire/extended-profile/skip 
Auth Required: Yes 
 
6.19 Complete Onboarding (After Extended Profile) 
POST /api/v1/questionnaire/onboarding/complete 
Auth Required: Yes 
 
Response (200): 
{ 
  "status": "success", 
  "message": "Onboarding completed successfully", 
  "data": {  
    "onboarding_state": "COMPLETED", 
    "rewards": { 
      "success": true, 
      "total_coins_earned": 500, 
      "category_coins_credited": 350, 
      "bonus_credited": 150, 
      "wallet_balance": 500 
    } 
  } 
} 
 
Reward Credit Details: 
Field 
Description 
total_coins_earned 
category_coins_credite
d 
bonus_credited 
wallet_balance 
Total onboarding reward (500 coins) 
Coins from completed categories 
Final bonus to reach 500 total 
New wallet balance after credit 
Note: This is the final step that credits all pending coins to the user's wallet. After this call, the 
wallet balance will include all 500 onboarding coins. 
7. Media Management 
7.1 Presign Upload URL 
POST /api/v1/users/media/presign 
Auth Required: Yes 
Request: 
{ 
} 
"file_name": "selfie.jpg", 
"mime_type": "image/jpeg", 
"size_bytes": 734003, 
"purpose": "profile" | "kyc" 
Response (200): 
{ 
} 
"status": "success", 
"data": { 
"upload_url": "https://s3.wasabisys.com/...signed-url", 
"file_url": "https://cdn.playymate.com/users/user_id/profile/1234567890-selfie.jpg", 
"wasabi_url": "https://s3.wasabisys.com/bucket/...", 
"expires_in": 300 
} 
7.2 Generate Preview URL 
POST /api/v1/users/media/preview 
Auth Required: Yes 
 
Request: 
{ 
  "file_key": "users/{userId}/{purpose}/{filename}", 
  "expires_in": 900 
} 
 
Response (200): 
{ 
  "status": "success", 
  "data": { 
    "preview_url": "https://s3.wasabisys.com/...signed-url", 
    "file_key": "users/abc123/profile/filename.jpg", 
    "expires_in": 900 
  } 
} 
 
 
8. State Machine 
Onboarding States 
State Description Phase 
INIT Initial state Auth 
PHONE_VERIFIED Phone OTP verified Auth 
EMAIL_VERIFIED Email OTP verified Auth 
BASIC_ACCOUNT_CREATED Name captured, account created Auth 
GENDER_CAPTURED Gender selected Profile 
DOB_CAPTURED Date of birth captured Profile 
PARENT_CONSENT_PENDING Minor waiting for parent consent Profile 
PARENT_CONSENT_APPROVED 
Parent consent given 
Profile 
LOCATION_CAPTURED 
PROFILE_PHOTO_CAPTURED 
ACTIVITY_INTENT_CAPTURED 
PROFILE_DETAILS_CAPTURED 
AADHAAR_VERIFIED 
VERIFICATION_PENDING 
FACE_LIVENESS_PASSED 
KYC_COMPLETED 
PHYSICAL_PROFILE_CONSENT 
PHYSICAL_PROFILE_COMPLETED 
QUESTIONNAIRE_STARTED 
QUESTIONNAIRE_COMPLETED 
EXTENDED_PROFILE_INTRO 
EXTENDED_PROFILE_PENDING 
Location captured 
Profile photo verified 
Activity intent selected 
Profile details saved 
Aadhaar verified via DigiLocker 
KYC skipped (grace period) 
Face liveness verified 
All KYC steps complete 
Physical profile consent given 
Physical profile completed 
Questionnaire session started 
Questionnaire completed 
Extended profile intro shown 
Extended profile in progress 
EXTENDED_PROFILE_COMPLETED Extended profile completed 
COMPLETED 
ACTIVE_USER 
Allowed State Transitions 
Current State 
All onboarding complete 
User is active in app 
Profile 
Profile 
Profile 
Profile 
KYC 
KYC 
KYC 
KYC 
Physical 
Physical 
Questionnair
e 
Questionnair
e 
Extended 
Extended 
Extended 
Final 
Final 
Allowed Next States 
INIT 
PHONE_VERIFIED 
EMAIL_VERIFIED 
BASIC_ACCOUNT_CREATED 
PHONE_VERIFIED 
EMAIL_VERIFIED 
BASIC_ACCOUNT_CREATED 
GENDER_CAPTURED 
GENDER_CAPTURED 
DOB_CAPTURED, 
PARENT_CONSENT_PENDING 
DOB_CAPTURED 
PARENT_CONSENT_PENDING 
PARENT_CONSENT_APPROVED 
LOCATION_CAPTURED 
PROFILE_PHOTO_CAPTURED 
ACTIVITY_INTENT_CAPTURED 
PROFILE_DETAILS_CAPTURED 
AADHAAR_VERIFIED 
VERIFICATION_PENDING 
FACE_LIVENESS_PASSED 
KYC_COMPLETED 
PHYSICAL_PROFILE_CONSENT 
PHYSICAL_PROFILE_COMPLETED 
QUESTIONNAIRE_STARTED 
QUESTIONNAIRE_COMPLETED 
EXTENDED_PROFILE_INTRO 
EXTENDED_PROFILE_PENDING 
PARENT_CONSENT_PENDING, 
LOCATION_CAPTURED 
PARENT_CONSENT_APPROVED 
LOCATION_CAPTURED 
PROFILE_PHOTO_CAPTURED 
ACTIVITY_INTENT_CAPTURED 
PROFILE_DETAILS_CAPTURED 
AADHAAR_VERIFIED, 
VERIFICATION_PENDING 
FACE_LIVENESS_PASSED 
FACE_LIVENESS_PASSED, 
KYC_COMPLETED, 
PHYSICAL_PROFILE_CONSENT 
KYC_COMPLETED 
PHYSICAL_PROFILE_CONSENT 
PHYSICAL_PROFILE_COMPLETED 
QUESTIONNAIRE_STARTED 
QUESTIONNAIRE_COMPLETED 
EXTENDED_PROFILE_INTRO 
EXTENDED_PROFILE_PENDING, 
EXTENDED_PROFILE_COMPLETED 
EXTENDED_PROFILE_COMPLETED 
EXTENDED_PROFILE_COMPLETED COMPLETED 
COMPLETED 
ACTIVE_USER 
9. Error Codes 
Authentication Errors 
Code 
AUTH_FLOW_REQUIRED 
INVALID_AUTH_FLOW 
GOOGLE_TOKEN_INVALID 
FACEBOOK_TOKEN_INVALID 
APPLE_TOKEN_INVALID 
Description 
auth_flow_id is required 
Invalid or expired auth flow 
Google token verification failed 
Facebook token verification failed 
Apple token verification failed 
FIREBASE_TOKEN_REQUIRED Firebase token required 
OTP_LOCKED 
OTP_RATE_LIMIT 
OTP_EXPIRED 
INVALID_OTP 
INVALID_REFRESH_TOKEN 
Validation Errors 
Code 
VALIDATION_ERROR 
Too many OTP attempts 
OTP rate limit exceeded 
OTP has expired 
OTP is invalid 
Refresh token is invalid 
Description 
Request validation failed 
MISSING_REQUIRED_FIELDS Required fields are missing 
INVALID_ROLE 
INVALID_DOB 
IMAGE_URL_REQUIRED 
LOCATION_MISSING 
MEDIA_CONFIG_MISSING 
Onboarding Errors 
Code 
Invalid role type 
Invalid date of birth 
Image URL is required 
Location data is missing 
Media storage not configured 
Description 
ONBOARDING_INCOMPLETE 
Previous onboarding step not 
complete 
INVALID_ONBOARDING_STATE 
CONSENT_REQUIRED 
KYC_INCOMPLETE 
PHYSICAL_PROFILE_REQUIRED 
AADHAAR_REQUIRED 
LIVENESS_REQUIRED 
ACTIVITY_INTENT_REQUIRED 
PROFILE_DETAILS_NOT_REQUIRED 
ROLE_NOT_ALLOWED_FOR_MINOR 
Face Detection Errors 
Code 
FACE_NOT_DETECTED 
MULTIPLE_FACES 
LOW_FACE_CONFIDENCE 
Invalid state transition 
Consent is required 
KYC not complete 
Physical profile required 
Aadhaar verification required 
Face liveness required 
Activity intent required 
Profile details step not required 
Role not allowed for minor users 
Description 
No face detected in image 
Multiple faces detected 
Face confidence too low 
FACE_PROVIDER_CREDENTIALS_MISSING 
FACE_VALIDATION_FAILED 
KYC Errors 
Code 
KYC_ALREADY_COMPLETED 
Face provider not configured 
Face validation failed 
Description 
KYC already completed 
DIGILOCKER_CONFIG_MISSING 
LIVENESS_FAILED 
LIVENESS_PROVIDER_ERROR 
DigiLocker not configured 
Liveness check failed 
Liveness provider error 
AADHAAR_ALREADY_PROCESSED 
Aadhaar verification already 
processed 
KYC_SKIP_NOT_ALLOWED 
Questionnaire Errors 
Code 
INVALID_SESSION 
KYC skip is not allowed by admin 
Description 
Invalid or expired session 
QUESTION_NOT_FOUND Question not found 
INVALID_ANSWER 
Invalid answer format 
CATEGORY_COMPLETE Category already 
completed 
Document Version: 2.0 Last Updated: 2026-02-28 API Base URL: /api/v1 