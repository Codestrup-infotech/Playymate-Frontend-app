Playymate Backend API Documentation
Comprehensive User-Facing API Reference
This document provides complete API documentation for all user-facing endpoints in the Playymate backend. It excludes admin APIs and deprecated endpoints.

Table of Contents
API Standards
Onboarding
Authentication
User Profile & Activity Intent
Profile Role Config System
KYC Verification
Questionnaire
Media Management
State Machine
Error Codes

1. API Standards
Base URL
/api/v1

Headers Required
Header
Value
Required
Content-Type
application/json
Yes
Authorization
Bearer <access_token>
For authenticated endpoints

Response Format
All responses follow this structure:
{
  "status": "success" | "error",
  "message": "string",
  "data": {},
  "error_code": "OPTIONAL_CODE"
}

Authentication Flow
Access Token: Issued after /auth/complete, expires in configured TTL
Refresh Token: Issued with access token, used to get new access tokens
Auth Flow ID: Returned after first OTP verification, must be passed to subsequent calls

2. Onboarding
The user onboarding flow follows these phases:
Authentication Phase: Login/signup with social or email/phone
Profile Phase: Gender, DOB, location, activity intent, profile photo, and profile details
KYC Phase: Identity verification
Physical Profile Phase: Health and physical attributes questionnaire
Questionnaire Phase: Sports, interests, and preferences
Extended Profile Phase: Optional additional information
Final Phase: Complete onboarding and receive rewards

3. Authentication
3.1 Social Login - Google
POST /api/v1/auth/social/google
 Auth Required: No
Request:
{
  "id_token": "string (Firebase Google token)",
  "device_id": "string (optional)"
}

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
  "id_token": "string (Firebase Facebook token)",
  "access_token": "string (alternative to id_token)",
  "device_id": "string (optional)"
}


3.3 Social Login - Apple
POST /api/v1/auth/social/apple
 Auth Required: No
Request:
{
  "id_token": "string (Apple ID token)",
  "device_id": "string (optional)"
}


3.4 Phone OTP - Send
POST /api/v1/auth/phone/send-otp
 Auth Required: No
Request:
{
  "phone": "+911234567890",
 }

Response (200):
{
    "status": "success",
    "user": {
        "email_verified": false,
        "phone_verified": false
    },
    "next_required_step": "PHONE_VERIFICATION",
    "auth_flow_id": "bf9a02ac-4117-481f-89aa-577fb1c2741c",
    "debug_otp": "782326"
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

Response (200):

{
    "status": "success",
    "user": {
        "email_verified": false,
        "phone_verified": true
    },
    "next_required_step": "EMAIL_VERIFICATION",
    "auth_flow_id": "bf9a02ac-4117-481f-89aa-577fb1c2741c",
    "debug_otp": "123456"
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
Password: Min 8 chars, must contain uppercase, lowercase, digit, special char

Response(200)
{
    "status": "success",
    "message": "If this email is registered, an OTP has been sent.",
    "next_step": "EMAIL_OTP"
}


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
    "user": {
        "email_verified": true,
        "phone_verified": true
    },
    "next_required_step": "GENDER",
    "auth_flow_id": "bf9a02ac-4117-481f-89aa-577fb1c2741c"
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
    "platform": "ios|android"
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
 }

Response (200):
{
  "status": "success",
  "message": "Logged out successfully",
  "data": null
}


3.13 Logout All Sessions
POST /api/v1/auth/logout-all
 Auth Required: Yes (Bearer Token)
Response (200):
{
  "status": "success",
  "message": "Logged out from all sessions",
  "data": null
}


4. User Profile
4.1 Update Gender
POST /api/v1/users/profile/gender
 Auth Required: Yes
Request:
{
  "gender": "male" | "female" | "other" | "prefer_not_to_say"
}

Response (200):
{
  "status": "success",
  "data": {
    "gender": "male",
    "onboarding_state": "GENDER_CAPTURED"
  },
  "next_required_step": "DOB"
}


4.2 Update Date of Birth
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


4.3 Parent Consent (Minors Only)
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


4.4 Get Parent Consent Status
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


4.5 Revoke Parent Consent
POST /api/v1/users/parent/consent/revoke
 Auth Required: Yes
Request:
{
  "reason": "string (optional)"
}


4.6 Update Location
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


4.7 Profile Photo Management
4.7.1 Upload Profile Photo (Supports Multiple)
POST /api/v1/users/profile-photo
 Auth Required: Yes
Overview: Users can upload up to 3 profile photos:
1 required (primary photo with face validation)
2 optional (additional photos without face validation)
The first photo uploaded becomes the primary photo automatically and requires face validation. Additional photos can be added without face validation.
Request Body:
{
  "image_url": "https://s3.wasabisys.com/bucket/users/.../photo1.jpg",
  "is_primary": false,
  "order": 1
}

Field Validations:
Field
Type
Required
Rules
image_url
string
Yes
Valid URL to image
is_primary
boolean
No
Set as primary photo (only one primary allowed)
order
number
No
Photo order (0, 1, 2)

Note: Use wasabi_url from the /users/media/presign response, not file_url.
Upload Flow:
Call /users/media/presign to get upload URL
Upload image directly to Wasabi using upload_url
Use the returned wasabi_url in /users/profile-photo payload
Response (First Photo - with face validation):
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

Response (Additional Photos - no face validation):
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
Error Code
HTTP Status
Message
USER_NOT_FOUND
404
User not found
IMAGE_URL_REQUIRED
400
Please provide an image URL
ONBOARDING_INCOMPLETE
400
Complete location before profile photo
MAX_PHOTOS_REACHED
400
Maximum 3 profile photos allowed
PRIMARY_PHOTO_EXISTS
400
Primary photo already exists. Cannot set another as primary.
FACE_NOT_DETECTED
400
No face detected in the image (first photo only)
MULTIPLE_FACES
400
Multiple faces detected (first photo only)
LOW_FACE_CONFIDENCE
400
Face detection confidence too low (first photo only)

State Transition: LOCATION_CAPTURED → PROFILE_PHOTO_CAPTURED (after first photo)

5. Activity Intent & Profile Role Config System
5.1 Overview
The Profile Role Config system manages profile fields that users must fill out based on their selected activity intent (role). It allows admins to configure which fields are required for each role type, including both common fields (shared across all roles) and role-specific fields.
5.2 Database Model
Role Configuration Structure:
{
  role_type: String,              // 'student', 'working', 'business', 'freelancer', 'other'
  role_label: String,             // Human-readable label (e.g., "Student")
  is_active: Boolean,             // Whether this role is available
  is_required: Boolean,           // Whether profile details are required for this role
  common_fields: [{
    key: String,                  // Field identifier (e.g., "current_city")
    name: String,                 // Human-readable name (e.g., "Current City")
    field_type: String,           // 'text', 'number', 'select', 'boolean', 'date'
    required: Boolean,            // Whether field is mandatory
    options: [String],            // Options for select type fields
    placeholder: String           // Placeholder text for input
  }],
  fields: [{
    key: String,                  // Field identifier
    name: String,                 // Human-readable name
    field_type: String,           // 'text', 'number', 'select', 'boolean', 'date'
    required: Boolean,            // Whether field is mandatory
    options: [String],            // Options for select type fields
    placeholder: String           // Placeholder text
  }],
  minor_policy: {
    allowed: Boolean              // Whether minors can select this role
  },
  created_at: Date,
  updated_at: Date
}

5.3 Field Types
Type
Description
Options Format
text
Free text input
N/A
number
Numeric input
N/A
select
Dropdown selection
options: ["Option1", "Option2"]
boolean
Yes/No toggle
N/A
date
Date picker
N/A

5.4 Default Common Fields
The following fields are shared across all roles and configurable by admin:
current_city - User's current city
hometown - User's hometown
qualification - User's educational qualification
5.5 Get Available Activity Intent Roles
GET /api/v1/users/activity-intent/roles
 Auth Required: Yes
Response (200):{
    "status": "success",
    "data": {
        "roles": [
            {
                "_id": "69980791c544121bdf15ff04",
                "label": "Student",
                "value": "student",
                "description": "",
                "order": 1,
                "status": "active",
                "is_default": true,
                "deleted_at": null,
                "updated_by": "699ec526edcded037da2f333",
                "created_by": null,
                "created_at": "2026-02-20T07:04:49.594Z",
                "updated_at": "2026-03-03T05:57:51.958Z",
                "__v": 0,
                "icon": "s"
            },
            {
                "_id": "69980791c544121bdf15ff07",
                "label": "Working Professional",
                "value": "working",
                "description": "",
                "order": 2,
                "status": "active",
                "is_default": true,
                "deleted_at": null,
                "updated_by": "699ec526edcded037da2f333",
                "created_by": null,
                "created_at": "2026-02-20T07:04:49.662Z",
                "updated_at": "2026-03-03T05:58:26.865Z",
                "__v": 0,
                "icon": "w"
            },
            {
                "_id": "69980791c544121bdf15ff0a",
                "label": "Freelancer",
                "value": "freelancer",
                "description": "",
                "order": 3,
                "status": "active",
                "is_default": true,
                "deleted_at": null,
                "updated_by": "699ec526edcded037da2f333",
                "created_by": null,
                "created_at": "2026-02-20T07:04:49.785Z",
                "updated_at": "2026-03-03T05:58:36.180Z",
                "__v": 0,
                "icon": "f"
            },
            {
                "_id": "69980791c544121bdf15ff0d",
                "label": "Business Owner",
                "value": "business",
                "description": "",
                "order": 4,
                "status": "active",
                "is_default": true,
                "deleted_at": null,
                "updated_by": "699ec526edcded037da2f333",
                "created_by": null,
                "created_at": "2026-02-20T07:04:49.842Z",
                "updated_at": "2026-03-03T05:58:41.304Z",
                "__v": 0,
                "icon": "b"
            },
            {
                "_id": "6998360001fe86f72e473b69",
                "label": "Housewife",
                "value": "housewife",
                "icon": "h",
                "description": "housewife can answer ",
                "order": 5,
                "status": "active",
                "is_default": false,
                "deleted_at": null,
                "updated_by": "699ec526edcded037da2f333",
                "created_by": "698daf93a42186fe04bfb5aa",
                "created_at": "2026-02-20T10:22:56.730Z",
                "updated_at": "2026-03-03T05:58:46.765Z",
                "__v": 0
            },
            {
                "_id": "699839de76074c4dbe2bf962",
                "label": "trainer",
                "value": "trainer",
                "icon": "t",
                "description": "trainer",
                "order": 6,
                "status": "active",
                "is_default": false,
                "deleted_at": null,
                "updated_by": "699ec526edcded037da2f333",
                "created_by": "698daf93a42186fe04bfb5aa",
                "created_at": "2026-02-20T10:39:26.416Z",
                "updated_at": "2026-03-03T05:58:51.538Z",
                "__v": 0
            },
            {
                "_id": "6998442b76074c4dbe2bfa2b",
                "label": "other",
                "value": "other",
                "icon": "o",
                "description": "other",
                "order": 7,
                "status": "active",
                "is_default": true,
                "deleted_at": null,
                "updated_by": "699ec526edcded037da2f333",
                "created_by": "698daf93a42186fe04bfb5aa",
                "created_at": "2026-02-20T11:23:24.002Z",
                "updated_at": "2026-03-03T05:58:56.562Z",
                "__v": 0
            }
        ]
    },
    "error_code": null
}



5.6 Set Activity Intent
POST /api/v1/users/activity-intent
 Auth Required: Yes
Request:
{
  "activity_type": "student",
  "details": “ ”
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


5.7 Get Profile Role Config (All Roles)
GET /api/v1/users/profile-role-config
 Auth Required: Yes
Response (200):
{
  "status": "success",
  "data": {
    "configs": [
      {
        "role_type": "student",
        "role_label": "Student",
        "is_required": true,
        "fields": [
          { "key": "college_name", "name": "College Name", "field_type": "text", "required": true },
          { "key": "course", "name": "Course", "field_type": "text", "required": true }
        ]
      }
    ]
  }
}


5.8 Get Profile Role Config by Type
GET /api/v1/users/profile-role-config/:role_type
 Auth Required: Yes
Response (200):
{
    "status": "success",
    "data": {
        "config": {
            "_id": "698ef345ad6ed411cf10c71d",
            "role_type": "student",
            "fields": [
                {
                    "name": "Current City",
                    "key": "current_city",
                    "type": "text",
                    "icon": "📍",
                    "required": true,
                    "min": null,
                    "max": null,
                    "placeholder": null,
                    "help_text": null
                },
                {
                    "name": "Hometown",
                    "key": "hometown",
                    "type": "text",
                    "icon": "🏠",
                    "required": false,
                    "min": null,
                    "max": null,
                    "placeholder": null,
                    "help_text": null
                },
                {
                    "name": "Qualification",
                    "key": "qualification",
                    "type": "text",
                    "icon": "🎓",
                    "required": false,
                    "min": null,
                    "max": null,
                    "placeholder": null,
                    "help_text": null
                },
                {
                    "name": "College Name",
                    "key": "college_name",
                    "type": "text",
                    "icon": "🏫",
                    "required": true,
                    "min": null,
                    "max": null,
                    "placeholder": null,
                    "help_text": null
                },
                {
                    "name": "Course",
                    "key": "course",
                    "type": "text",
                    "icon": "📚",
                    "required": true,
                    "min": null,
                    "max": null,
                    "placeholder": null,
                    "help_text": null
                },
                {
                    "name": "Year of Study",
                    "key": "year_of_study",
                    "type": "select",
                    "icon": "🎓",
                    "required": true,
                    "options": [
                        "1st",
                        "2nd",
                        "3rd",
                        "4th",
                        "5th+"
                    ],
                    "min": null,
                    "max": null,
                    "placeholder": null,
                    "help_text": null
                }
            ],
            "status": "active",
            "version": 5,
            "updated_by": null,
            "created_at": "2026-02-13T09:47:49.977Z",
            "updated_at": "2026-03-02T10:26:40.560Z",
            "__v": 0,
            "activity_intent_required": true,
            "common_fields": [
                {
                    "name": "Current City",
                    "key": "current_city",
                    "type": "text",
                    "icon": "📍",
                    "required": true,
                    "min": null,
                    "max": null,
                    "placeholder": null,
                    "help_text": null
                },
                {
                    "name": "Hometown",
                    "key": "hometown",
                    "type": "text",
                    "icon": "🏠",
                    "required": false,
                    "min": null,
                    "max": null,
                    "placeholder": null,
                    "help_text": null
                },
                {
                    "name": "Qualification",
                    "key": "qualification",
                    "type": "text",
                    "icon": "🎓",
                    "required": false,
                    "min": null,
                    "max": null,
                    "placeholder": null,
                    "help_text": null
                }
            ]
        }
    },
    "error_code": null
}


Key Features:
Response includes both common fields and role-specific fields combined
name field is human-readable label
key is the field identifier (auto-generated from name or provided explicitly)
field_type determines input type and validation
required indicates if field is mandatory
options array for select type fields
placeholder for user guidance

5.9 Save Profile Details
POST /api/v1/users/profile-details
 Auth Required: Yes
Request (Student):
{
  "role_type": "student",
  "details": {
    "college_name": "Delhi University",
    "course": "Computer Science",
    "year_of_study": "3",
    "current_city": "New Delhi",
    "hometown": "Mumbai",
    "qualification": "Bachelor's"
  }
}

Request (Working Professional):
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

Request (Business Owner):
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
      "role_specific": {
        "college_name": "Delhi University",
        "course": "Computer Science",
        "year_of_study": "3"
      },
      "common_fields": {
        "current_city": "New Delhi",
        "hometown": "Mumbai",
        "qualification": "Bachelor's"
      },
      "set_at": "2024-01-15T10:30:00.000Z"
    },
    "onboarding_state": "PROFILE_DETAILS_CAPTURED"
  },
  "next_required_step": "KYC_INFO"
}


5.10 Minor Policy
Each role can configure whether minors are allowed to select it:
Age Group
Allowed Roles
under_13
student, other
13_15
student, working, freelancer, other
16_17
student, working, freelancer, other


6. KYC Verification
6.1 Get KYC Status
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


6.2 Get KYC Screen Visibility
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


6.3 Skip Aadhaar (Soft KYC)
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


6.4 DigiLocker Account Check
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


6.5 Create DigiLocker URL
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


6.6 Check DigiLocker Status
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


6.7 Fetch Aadhaar Document
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


6.8 Face Liveness Check
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


6.9 Complete KYC
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


7. Questionnaire

Physical profile intro screen 

Get  /api/v1/onboarding/screens?type=physical_intro&platform=mobile

Response 
{
    "status": "success",
    "message": "Onboarding screens fetched",
    "data": {
        "screens": [
            {
                "_id": "6996e639d0ae2f95c7b0d305",
                "type": "physical_intro",
                "title": "wanna flex your fitness",
                "subtitle": null,
                "image_url": "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGJlNXNpMnN0bzF3ZTd5Nzk4NWhsYmdudTJ3aXg5MGp2aWNwbmgzaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3mJyfDFH0BqgbdghWJ/giphy.gif",
                "cta": null,
                "is_skippable": false,
                "platform": "all",
                "order": 1,
                "status": "active",
                "deleted_at": null,
                "options": [],
                "created_at": "2026-02-19T10:30:17.627Z",
                "updated_at": "2026-02-24T11:01:33.003Z",
                "__v": 0
            }
        ]
    },
    "error_code": null
}

Phase A: Physical Profile
Note: The order of Physical Profile and Questionnaire can be configured by admin. Some users may see Questionnaire first, others may see Physical Profile first based on provider configuration.
7.1 Physical Profile Consent


User-Facing API: Physical Profile Consent Screen
GET /api/v1/questionnaire/physical-profile/consent-screen
No authentication required

Request:
curl -X GET {{base_url}}/questionnaire/physical-profile/consent-screen

Response (Success - 200):
{
  "success": true,
  "data": {
    "screen_key": "physical_activity_preferences",
    "title": "Physical Activity Preferences",
    "description": "We'll ask a few questions to understand your fitness level and activity interests. This helps us recommend activities that are safer and more suitable for you.",
    "privacy_assurance": "Your information is secure and never shared.",
    "consent_checkbox_text": "I understand and agree to answer questions about my physical activity preferences",
    "terms_notice": "By continuing, you agree to Playmate's Term & Privacy Policy.",
    "terms_url": null,
    "privacy_policy_url": null,
    "cta_text": "Continue",
    "title_gradient_start": "#FF6B6B",
    "title_gradient_end": "#FFA726",
    "card_background": "#1A1A2E",
    "card_border_gradient": "#4A47A3",
    "media_type": null,
    "media_url": null,
    "version": 1
  }
}


POST /api/v1/questionnaire/physical-profile/consent
 Auth Required: Yes
Request:
{
  "consent_given": true
}

Response (200):
{
  "status": "success",
  "data": {
    "consent_given": true,
    "onboarding_state": "PHYSICAL_PROFILE_CONSENT"
  },
  "next_required_step": "PHYSICAL_PROFILE_QUESTIONS"
}


7.2 Get Physical Profile Questions
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


7.3 Submit Physical Profile Answer
POST /api/v1/questionnaire/physical-profile/answer
 Auth Required: Yes
Request:
{
  "question_id": "height",
  "answer_number": 175,
  "selected_option_ids": [],       // for single_choice/multi_choice
  "answer_text": null,             // for text type
  "answer_boolean": null           // for boolean type
}


Response (200 - In Progress):
{
    "success": true,
    "data": {
        "answer_saved": true,
        "question_id": "height",
        "profile_completed": false,
        "basic_metrics_completed": false,
        "medical_completed": true,
        "fitness_completed": false,
        "next_question_id": "blood_group",
        "next_action": "CONTINUE",
        "reward": null
    }
}

Response (200 - Profile Complete):
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
Field
Description
reward.accumulated
Whether coins were accumulated for this answer
reward.category_key
Category key (always "physical_profile")
reward.pending_coins
Current pending coins for this category
reward.pending_coins_micro
Pending coins in micro-units (1000x precision)
reward.per_question_coins
Coins earned per question

Coin Distribution: Physical profile questions earn coins from the total onboarding reward pool. With 500 total coins distributed equally among 7 active categories and 8 physical profile questions:
Per category: floor(500 / 7) = 71 coins
Per question: 71 / 8 = 8.875 coins (8875 micro-coins)
Coins are held as "pending" until onboarding is complete, then credited to wallet.

Phase B: Sports & Interest Questionnaire
7.4 Get Questionnaire Categories
GET /api/v1/questionnaire/categories?category_type=preference
 Auth Required: No
Query Parameters:
Parameter
Type
Required
Description
category_type
string
No
preference, extended

Response (200):
{
  "status": "success",
  "data": {
    "categories": [
      { "key": "sports", "name": "Sports", "description": "Cricket, Football, Tennis...", "icon": "url", "item_count": 15 },
      { "key": "music", "name": "Music", "description": "Rock, Pop, Classical...", "icon": "url", "item_count": 20 }
    ]
  }
}


7.5 Get Category Intro
GET /api/v1/questionnaire/categories/:categoryKey/intro
 Auth Required: No
Response (200):
{
  "status": "success",
  "data": {
    "category_key": "sports",
    "intro": { "title": "Sports", "description": "Select the sports you're interested in", "max_selections": 10 }
  }
}


7.6 Get Category Items
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


7.7 Start Questionnaire Session
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


7.8 Get Session Status
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


7.9 Save Selection
POST /api/v1/questionnaire/selection
 Auth Required: Yes
Request:
{
  "session_id": "{{session_id}}",
  "category_key": "sports",
  "selected_item_keys": ["cricket"]
}


Response (200):

{
    "success": true,
    "data": {
        "category_key": "sports",
        "current_item_key": "cricket",
        "completed_items": [],
        "selected_count": 1,
        "remaining_slots": 2,
        "category_complete": false,
        "next_action": "ANSWER_QUESTIONS",
        "next_item_key": "cricket"
    }
}



7.10 Get Item Questions
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


7.11 Submit Answer
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


7.12 Complete Category (with coin reward)
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
Field
Description
coins_earned
Coins earned for completing this category
coins_pending
Coins pending (not yet credited to wallet)
total_coins_till_now
Total coins accumulated across all categories
wallet_balance
Current wallet balance (still 0 until onboarding completes)

Note: Coins are accumulated as "pending" as categories are completed. All pending coins are credited to the user's wallet when they complete the entire onboarding flow via /questionnaire/onboarding/complete. The total onboarding reward is 500 coins.

7.12 User API - Get Category Completion screen
Endpoint: GET /api/v1/questionnaire/categories/:categoryKey/completion

Authentication: Required (Bearer token)

Query Parameters:

Parameter	Type	Required	Description
categoryKey	string	Yes	Category identifier (path param)
session_id	string	No	Questionnaire session ID
Success Response (200)
{
  "success": true,
  "data": {
    "category_key": "sports",
    "show_completion": true,
    "completion": {
      "title_text": "Great job! Your preferences are saved",
      "subtitle_text": "You earned 50 coins",
      "media_type": "image",
      "media_url": "https://example.com/complete.gif",
      "cta_text": "Continue",
      "show_coins": true
    },
    "coins_earned": 50,
    "total_coins_till_now": 150,
    "version": 1
  }
}
When No Completion Config Exists (200)
{
  "success": true,
  "data": {
    "category_key": "sports",
    "show_completion": false,
    "completion": null,
    "version": null
  }
}
Error Responses
401 - Authentication required
400 - Invalid session
404 - Category not found


7.13 Complete Questionnaire
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
Field
Description
total_coins_accumulated
Total coins earned from all categories
coins_pending
Coins waiting to be credited to wallet
wallet_balance
Current wallet balance (still 0)
final_bonus
Bonus coins to reach total of 500
total_onboarding_coins
Total onboarding reward (500 coins)


Phase C: Rewards (After Questionnaire)
7.14 Get Reward Status
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
Field
Description
total_earned
Total coins accumulated from categories
expected_total
Total onboarding reward (500 coins)
category_rewards
Array of category-wise coin earnings
coins_pending
Coins waiting to be credited to wallet
wallet_balance
Current wallet balance (0 until onboarding completes)
completed
Whether onboarding is fully complete
final_bonus
Bonus coins to reach total of 500


7.15 Get Onboarding Ledger
GET /api/v1/questionnaire/wallet/gold-coins/onboarding-ledger?page=1&limit=20
 Auth Required: Yes
Response (200):
{
  "status": "success",
  "data": {
    "transactions": [
      { "id": "tx1", "coins": 50, "reason": "Completed Sports category", "timestamp": "2024-01-15T10:30:00.000Z" }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1 }
  }
}


Phase D: Extended Profile (Optional - After Questionnaire)
7.16 Get Extended Profile Screens
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

{{base_url}}/questionnaire/extended-profile/screens

{
    "success": true,
    "data": {
        "screens": [
            {
                "screen_key": "community_social",
                "title": "Community & Social Participation",
                "icon": "🤝",
                "icon_color": "green",
                "description": "Share your community involvement",
                "is_skippable": true,
                "questions": [
                    {
                        "question_key": "part_of_communities",
                        "question_text": "Are you part of any communities or groups?",
                        "question_type": "multi_choice",
                        "options": [
                            {
                                "label": "Sports clubs",
                                "value": "sports_clubs",
                                "_id": "69a84ac9a6850ece0f596e5d"
                            },
                            {
                                "label": "Fitness groups",
                                "value": "fitness_groups",
                                "_id": "69a84ac9a6850ece0f596e5e"
                            },
                            {
                                "label": "Professional communities",
                                "value": "professional_communities",
                                "_id": "69a84ac9a6850ece0f596e5f"
                            },
                            {
                                "label": "College alumni groups",
                                "value": "college_alumni_groups",
                                "_id": "69a84ac9a6850ece0f596e60"
                            },
                            {
                                "label": "Local society / housing groups",
                                "value": "local_society",
                                "_id": "69a84ac9a6850ece0f596e61"
                            },
                            {
                                "label": "Online communities",
                                "value": "online_communities",
                                "_id": "69a84ac9a6850ece0f596e62"
                            },
                            {
                                "label": "Other",
                                "value": "other",
                                "_id": "69a84ac9a6850ece0f596e63"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "volunteering",
                        "question_text": "Are you involved in volunteering or social work?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Yes, regularly",
                                "value": "yes_regularly",
                                "_id": "69a84ac9a6850ece0f596e65"
                            },
                            {
                                "label": "Occasionally",
                                "value": "occasionally",
                                "_id": "69a84ac9a6850ece0f596e66"
                            },
                            {
                                "label": "Interested but not active",
                                "value": "interested",
                                "_id": "69a84ac9a6850ece0f596e67"
                            },
                            {
                                "label": "Not currently",
                                "value": "not_currently",
                                "_id": "69a84ac9a6850ece0f596e68"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "community_activities_interest",
                        "question_text": "What kind of community or social activities interest you?",
                        "question_type": "multi_choice",
                        "options": [
                            {
                                "label": "Sports & fitness",
                                "value": "sports_fitness",
                                "_id": "69a84ac9a6850ece0f596e6a"
                            },
                            {
                                "label": "Cultural events",
                                "value": "cultural_events",
                                "_id": "69a84ac9a6850ece0f596e6b"
                            },
                            {
                                "label": "Educational workshops",
                                "value": "educational_workshops",
                                "_id": "69a84ac9a6850ece0f596e6c"
                            },
                            {
                                "label": "Social service",
                                "value": "social_service",
                                "_id": "69a84ac9a6850ece0f596e6d"
                            },
                            {
                                "label": "Environmental activities",
                                "value": "environmental_activities",
                                "_id": "69a84ac9a6850ece0f596e6e"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "community_participation_frequency",
                        "question_text": "How often do you participate in community or group activities?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Very often",
                                "value": "very_often",
                                "_id": "69a84ac9a6850ece0f596e70"
                            },
                            {
                                "label": "Sometimes",
                                "value": "sometimes",
                                "_id": "69a84ac9a6850ece0f596e71"
                            },
                            {
                                "label": "Rarely",
                                "value": "rarely",
                                "_id": "69a84ac9a6850ece0f596e72"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "enjoys_cultural_events",
                        "question_text": "Do you enjoy regional or cultural events?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Yes",
                                "value": "yes",
                                "_id": "69a84ac9a6850ece0f596e74"
                            },
                            {
                                "label": "Sometimes",
                                "value": "sometimes",
                                "_id": "69a84ac9a6850ece0f596e75"
                            },
                            {
                                "label": "Not Much",
                                "value": "not_much",
                                "_id": "69a84ac9a6850ece0f596e76"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    }
                ]
            },
            {
                "screen_key": "personal_life_stage",
                "title": "Personal & Life Stage",
                "icon": "🧍",
                "icon_color": "blue",
                "description": "Tell us about your current life phase",
                "is_skippable": true,
                "questions": [
                    {
                        "question_key": "relationship_status",
                        "question_text": "What is your relationship status?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Single",
                                "value": "single",
                                "_id": "69a84ac9a6850ece0f596e79"
                            },
                            {
                                "label": "Married",
                                "value": "married",
                                "_id": "69a84ac9a6850ece0f596e7a"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "lifestyle_stage",
                        "question_text": "How would you describe your current lifestyle stage?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Student life",
                                "value": "student_life",
                                "_id": "69a84ac9a6850ece0f596e7c"
                            },
                            {
                                "label": "Early career",
                                "value": "early_career",
                                "_id": "69a84ac9a6850ece0f596e7d"
                            },
                            {
                                "label": "Established professional",
                                "value": "established_professional",
                                "_id": "69a84ac9a6850ece0f596e7e"
                            },
                            {
                                "label": "Business-focused",
                                "value": "business_focused",
                                "_id": "69a84ac9a6850ece0f596e7f"
                            },
                            {
                                "label": "Family-focused",
                                "value": "family_focused",
                                "_id": "69a84ac9a6850ece0f596e80"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "drinks_alcohol",
                        "question_text": "Do you drink alcohol?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "No",
                                "value": "no",
                                "_id": "69a84ac9a6850ece0f596e82"
                            },
                            {
                                "label": "Occasionally",
                                "value": "occasionally",
                                "_id": "69a84ac9a6850ece0f596e83"
                            },
                            {
                                "label": "Yes",
                                "value": "yes",
                                "_id": "69a84ac9a6850ece0f596e84"
                            },
                            {
                                "label": "Prefer not to say",
                                "value": "prefer_not_to_say",
                                "_id": "69a84ac9a6850ece0f596e85"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "smokes",
                        "question_text": "Do you Smoke?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "No",
                                "value": "no",
                                "_id": "69a84ac9a6850ece0f596e87"
                            },
                            {
                                "label": "Occasionally",
                                "value": "occasionally",
                                "_id": "69a84ac9a6850ece0f596e88"
                            },
                            {
                                "label": "Yes",
                                "value": "yes",
                                "_id": "69a84ac9a6850ece0f596e89"
                            },
                            {
                                "label": "Prefer not to say",
                                "value": "prefer_not_to_say",
                                "_id": "69a84ac9a6850ece0f596e8a"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "physical_activity_importance",
                        "question_text": "How important is physical activity in your life?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Very important",
                                "value": "very_important",
                                "_id": "69a84ac9a6850ece0f596e8c"
                            },
                            {
                                "label": "Somewhat important",
                                "value": "somewhat_important",
                                "_id": "69a84ac9a6850ece0f596e8d"
                            },
                            {
                                "label": "Not a priority",
                                "value": "not_a_priority",
                                "_id": "69a84ac9a6850ece0f596e8e"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "preferred_activity_intensity",
                        "question_text": "Preferred activity intensity",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Light",
                                "value": "light",
                                "_id": "69a84ac9a6850ece0f596e90"
                            },
                            {
                                "label": "Moderate",
                                "value": "moderate",
                                "_id": "69a84ac9a6850ece0f596e91"
                            },
                            {
                                "label": "High",
                                "value": "high",
                                "_id": "69a84ac9a6850ece0f596e92"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "activity_participation_frequency",
                        "question_text": "How often do you like to participate in activities?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Daily",
                                "value": "daily",
                                "_id": "69a84ac9a6850ece0f596e94"
                            },
                            {
                                "label": "Weekly",
                                "value": "weekly",
                                "_id": "69a84ac9a6850ece0f596e95"
                            },
                            {
                                "label": "Occasionally",
                                "value": "occasionally",
                                "_id": "69a84ac9a6850ece0f596e96"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "activity_join_preference",
                        "question_text": "How do you usually prefer to join activities?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Solo",
                                "value": "solo",
                                "_id": "69a84ac9a6850ece0f596e98"
                            },
                            {
                                "label": "Group",
                                "value": "group",
                                "_id": "69a84ac9a6850ece0f596e99"
                            },
                            {
                                "label": "Both",
                                "value": "both",
                                "_id": "69a84ac9a6850ece0f596e9a"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    }
                ]
            },
            {
                "screen_key": "political_social",
                "title": "Political & Social Awareness",
                "icon": "🧠",
                "icon_color": "orange",
                "description": "Help us understand your civic engagement interests",
                "is_skippable": true,
                "questions": [
                    {
                        "question_key": "political_interest",
                        "question_text": "Are you interested in political or civic discussions?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Yes",
                                "value": "yes",
                                "_id": "69a84ac9a6850ece0f596e9d"
                            },
                            {
                                "label": "Sometimes",
                                "value": "sometimes",
                                "_id": "69a84ac9a6850ece0f596e9e"
                            },
                            {
                                "label": "Not interested",
                                "value": "not_interested",
                                "_id": "69a84ac9a6850ece0f596e9f"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "follows_political_news",
                        "question_text": "How closely do you follow political or social news?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Actively follow",
                                "value": "actively",
                                "_id": "69a84ac9a6850ece0f596ea1"
                            },
                            {
                                "label": "Occasionally follow",
                                "value": "occasionally",
                                "_id": "69a84ac9a6850ece0f596ea2"
                            },
                            {
                                "label": "Rarely follow",
                                "value": "rarely",
                                "_id": "69a84ac9a6850ece0f596ea3"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "wants_political_content",
                        "question_text": "Would you like to see political or civic-related content in the app?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Yes",
                                "value": "yes",
                                "_id": "69a84ac9a6850ece0f596ea5"
                            },
                            {
                                "label": "Sometimes",
                                "value": "sometimes",
                                "_id": "69a84ac9a6850ece0f596ea6"
                            },
                            {
                                "label": "No",
                                "value": "no",
                                "_id": "69a84ac9a6850ece0f596ea7"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "comfortable_with_public_discussions",
                        "question_text": "Are you comfortable participating in discussions on social or public issues?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Yes",
                                "value": "yes",
                                "_id": "69a84ac9a6850ece0f596ea9"
                            },
                            {
                                "label": "Occasionally",
                                "value": "occasionally",
                                "_id": "69a84ac9a6850ece0f596eaa"
                            },
                            {
                                "label": "Prefer Not to say",
                                "value": "prefer_not_to_say",
                                "_id": "69a84ac9a6850ece0f596eab"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    },
                    {
                        "question_key": "comfortable_meeting_new_people",
                        "question_text": "Are you comfortable meeting new people through activities or events?",
                        "question_type": "single_choice",
                        "options": [
                            {
                                "label": "Yes",
                                "value": "yes",
                                "_id": "69a84ac9a6850ece0f596ead"
                            },
                            {
                                "label": "Maybe",
                                "value": "maybe",
                                "_id": "69a84ac9a6850ece0f596eae"
                            },
                            {
                                "label": "Not Sure",
                                "value": "not_sure",
                                "_id": "69a84ac9a6850ece0f596eaf"
                            }
                        ],
                        "is_required": false,
                        "saved_value": null
                    }
                ]
            }
        ],
        "total_screens": 3,
        "all_skippable": true,
        "source": "database"
    }
}


7.17 Save Extended Profile
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


7.18 Skip Extended Profile
POST /api/v1/questionnaire/extended-profile/skip
 Auth Required: Yes

7.19 Complete Onboarding (Final Step)
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
Total onboarding reward (500 coins)
category_coins_credited
Coins from completed categories
bonus_credited
Final bonus to reach 500 total
wallet_balance
New wallet balance after credit

Note: This is the final step that credits all pending coins to the user's wallet. After this call, the wallet balance will include all 500 onboarding coins.

8. Media Management
8.1 Presign Upload URL
POST /api/v1/users/media/presign
 Auth Required: Yes
Request:
{
  "file_name": "selfie.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 734003,
  "purpose": "profile" | "kyc"
}

Response (200):
{
  "status": "success",
  "data": {
    "upload_url": "https://s3.wasabisys.com/...signed-url",
    "file_url": "https://cdn.playymate.com/users/user_id/profile/1234567890-selfie.jpg",
    "wasabi_url": "https://s3.wasabisys.com/bucket/...",
    "expires_in": 300
  }
}


8.2 Generate Preview URL
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


9. State Machine
Onboarding States
State
Description
Phase
INIT
Initial state
Auth
PHONE_VERIFIED
Phone OTP verified
Auth
EMAIL_VERIFIED
Email OTP verified
Auth
BASIC_ACCOUNT_CREATED
Name captured, account created
Auth
GENDER_CAPTURED
Gender selected
Profile
DOB_CAPTURED
Date of birth captured
Profile
PARENT_CONSENT_PENDING
Minor waiting for parent consent
Profile
PARENT_CONSENT_APPROVED
Parent consent given
Profile
LOCATION_CAPTURED
Location captured
Profile
PROFILE_PHOTO_CAPTURED
Profile photo verified
Profile
ACTIVITY_INTENT_CAPTURED
Activity intent selected
Profile
PROFILE_DETAILS_CAPTURED
Profile details saved
Profile
AADHAAR_VERIFIED
Aadhaar verified via DigiLocker
KYC
VERIFICATION_PENDING
KYC skipped (grace period)
KYC
FACE_LIVENESS_PASSED
Face liveness verified
KYC
KYC_COMPLETED
All KYC steps complete
KYC
PHYSICAL_PROFILE_CONSENT
Physical profile consent given
Physical
PHYSICAL_PROFILE_COMPLETED
Physical profile completed
Physical
QUESTIONNAIRE_STARTED
Questionnaire session started
Questionnaire
QUESTIONNAIRE_COMPLETED
Questionnaire completed
Questionnaire
EXTENDED_PROFILE_INTRO
Extended profile intro shown
Extended
EXTENDED_PROFILE_PENDING
Extended profile in progress
Extended
EXTENDED_PROFILE_COMPLETED
Extended profile completed
Extended
COMPLETED
All onboarding complete
Final
ACTIVE_USER
User is active in app
Final


Allowed State Transitions
Current State
Allowed Next States
INIT
PHONE_VERIFIED
PHONE_VERIFIED
EMAIL_VERIFIED
EMAIL_VERIFIED
BASIC_ACCOUNT_CREATED
BASIC_ACCOUNT_CREATED
GENDER_CAPTURED
GENDER_CAPTURED
DOB_CAPTURED, PARENT_CONSENT_PENDING
DOB_CAPTURED
PARENT_CONSENT_PENDING, LOCATION_CAPTURED
PARENT_CONSENT_PENDING
PARENT_CONSENT_APPROVED
PARENT_CONSENT_APPROVED
LOCATION_CAPTURED
LOCATION_CAPTURED
PROFILE_PHOTO_CAPTURED
PROFILE_PHOTO_CAPTURED
ACTIVITY_INTENT_CAPTURED
ACTIVITY_INTENT_CAPTURED
PROFILE_DETAILS_CAPTURED
PROFILE_DETAILS_CAPTURED
AADHAAR_VERIFIED, VERIFICATION_PENDING
AADHAAR_VERIFIED
FACE_LIVENESS_PASSED
VERIFICATION_PENDING
FACE_LIVENESS_PASSED, KYC_COMPLETED, PHYSICAL_PROFILE_CONSENT
FACE_LIVENESS_PASSED
KYC_COMPLETED
KYC_COMPLETED
PHYSICAL_PROFILE_CONSENT
PHYSICAL_PROFILE_CONSENT
PHYSICAL_PROFILE_COMPLETED
PHYSICAL_PROFILE_COMPLETED
QUESTIONNAIRE_STARTED
QUESTIONNAIRE_STARTED
QUESTIONNAIRE_COMPLETED
QUESTIONNAIRE_COMPLETED
EXTENDED_PROFILE_INTRO
EXTENDED_PROFILE_INTRO
EXTENDED_PROFILE_PENDING, EXTENDED_PROFILE_COMPLETED
EXTENDED_PROFILE_PENDING
EXTENDED_PROFILE_COMPLETED
EXTENDED_PROFILE_COMPLETED
COMPLETED
COMPLETED
ACTIVE_USER


10. Error Codes
Authentication Errors
Code
Description
AUTH_FLOW_REQUIRED
auth_flow_id is required
INVALID_AUTH_FLOW
Invalid or expired auth flow
GOOGLE_TOKEN_INVALID
Google token verification failed
FACEBOOK_TOKEN_INVALID
Facebook token verification failed
APPLE_TOKEN_INVALID
Apple token verification failed
FIREBASE_TOKEN_REQUIRED
Firebase token required
OTP_LOCKED
Too many OTP attempts
OTP_RATE_LIMIT
OTP rate limit exceeded
OTP_EXPIRED
OTP has expired
INVALID_OTP
OTP is invalid
INVALID_REFRESH_TOKEN
Refresh token is invalid


Validation Errors
Code
Description
VALIDATION_ERROR
Request validation failed
MISSING_REQUIRED_FIELDS
Required fields are missing
INVALID_ROLE
Invalid role type
INVALID_DOB
Invalid date of birth
IMAGE_URL_REQUIRED
Image URL is required
LOCATION_MISSING
Location data is missing
MEDIA_CONFIG_MISSING
Media storage not configured


Onboarding Errors
Code
Description
ONBOARDING_INCOMPLETE
Previous onboarding step not complete
INVALID_ONBOARDING_STATE
Invalid state transition
CONSENT_REQUIRED
Consent is required
KYC_INCOMPLETE
KYC not complete
PHYSICAL_PROFILE_REQUIRED
Physical profile required
AADHAAR_REQUIRED
Aadhaar verification required
LIVENESS_REQUIRED
Face liveness required
ACTIVITY_INTENT_REQUIRED
Activity intent required
PROFILE_DETAILS_NOT_REQUIRED
Profile details step not required
ROLE_NOT_ALLOWED_FOR_MINOR
Role not allowed for minor users


Face Detection Errors
Code
Description
FACE_NOT_DETECTED
No face detected in image
MULTIPLE_FACES
Multiple faces detected
LOW_FACE_CONFIDENCE
Face confidence too low
FACE_PROVIDER_CREDENTIALS_MISSING
Face provider not configured
FACE_VALIDATION_FAILED
Face validation failed


KYC Errors
Code
Description
KYC_ALREADY_COMPLETED
KYC already completed
DIGILOCKER_CONFIG_MISSING
DigiLocker not configured
LIVENESS_FAILED
Liveness check failed
LIVENESS_PROVIDER_ERROR
Liveness provider error
AADHAAR_ALREADY_PROCESSED
Aadhaar verification already processed
KYC_SKIP_NOT_ALLOWED
KYC skip is not allowed by admin


Questionnaire Errors
Code
Description
INVALID_SESSION
Invalid or expired session
QUESTION_NOT_FOUND
Question not found
INVALID_ANSWER
Invalid answer format
CATEGORY_COMPLETE
Category already completed


Profile Role Config Errors
Code
Description
INVALID_ROLE_TYPE
Invalid role type provided
ROLE_CONFIG_NOT_FOUND
Role configuration not found
REQUIRED_FIELDS_MISSING
Required profile fields are missing
FIELD_VALIDATION_FAILED
Field value validation failed
MINOR_NOT_ALLOWED_FOR_ROLE
Minors cannot select this role


Document Information
Version: 2.1
Last Updated: 2026-02-28
API Base URL: /api/v1
Integration: Profile Role Config System Analysis integrated into Section 5


