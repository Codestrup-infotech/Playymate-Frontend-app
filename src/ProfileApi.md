User Profile API Documentation
This document provides comprehensive API documentation for all user profile-related endpoints in the Playymate backend. Use this guide for frontend integration.
Base URL: https://api.playymate.com/api/v1
 Authentication: Bearer Token (JWT)

Table of Contents
Core Profile Endpoints
Profile Details
Avatar/Profile Photo
Interests
Privacy Settings
Onboarding
Media Upload
Profile Role & Activity
Username

1. Core Profile Endpoints
1.1 Get Current User's Profile
Get  {{base_url}}/users/me
{
    "status": "success",
    "data": {
        "_id": "69af049dc7fea2ebdae7603f",
        "full_name": "sdsd sdf",
        "email": "asdfgw3@gmail.com",
        "phone": "9045676543",
        "bio": "",
        "profile_image_url": "https://s3.wasabisys.com/users/69af049dc7fea2ebdae7603f/profile/1773077816505-310f35e5-profile_1773077814182_0_closeup-face-portrait-of-pretty-blonde-girl-with-fresh-skin-horizontal-image-free-photo.jpg",
        "profile_photos": [
            {
                "url": "https://s3.wasabisys.com/users/69af049dc7fea2ebdae7603f/profile/1773077816505-310f35e5-profile_1773077814182_0_closeup-face-portrait-of-pretty-blonde-girl-with-fresh-skin-horizontal-image-free-photo.jpg",
                "is_primary": true,
                "face_verified": true
            }
        ],
        "profile_location": {
            "display_text": null,
            "city": null,
            "state": null
        },
        "interests": {
            "sports": [
                "cricket",
                "basketball",
                "pickleball"
            ],
            "hobbies": [
                "zumba",
                "karate",
                "judo"
            ],
            "activities": [
                "karaoke",
                "gigs",
                "night_clubs"
            ],
            "additional": [],
            "nostalgia": [
                "dog_and_bowl",
                "antakshari",
                "lagori"
            ]
        },
        "gender": "female",
        "dob": "2004-07-07T00:00:00.000Z",
        "age_group": "18_plus",
        "onboarding_state": "COMPLETED",
        "activity_intent": {
            "type": "student",
            "details": "",
            "set_at": "2026-03-09T17:37:07.883Z"
        },
        "role_type": "student",
        "profile_details": {
            "role_specific": {
                "college_name": "sdsd",
                "course": "sdsd",
                "year_of_study": "4th"
            },
            "common_fields": {
                "current_city": "mumbai",
                "hometown": "pune",
                "qualification": "djfkdf"
            },
            "set_at": "2026-03-09T17:37:35.891Z"
        },
    
        },
        "preferences_extended": {
            "company_role": null,
            "sports": [],
            "activities": [],
            "categories": [],
            "set_at": null
        },
        "verification": {
            "status": "unverified",
            "phone": {
                "status": true,
                "verified_at": "2026-03-10T05:58:03.505Z",
                "provider": null,
                "aadhaar_number": null,
                "aadhaar_name": null
            },
            "email": {
                "status": true,
                "verified_at": "2026-03-09T17:35:09.317Z",
                "provider": null,
                "aadhaar_number": null,
                "aadhaar_name": null
            },
            "aadhaar": {
                "status": false,
                "verified_at": null,
                "provider": null,
                "aadhaar_number": null,
                "aadhaar_name": null
            },
            "face": {
                "status": false,
                "verified_at": null,
                "provider": null,
                "aadhaar_number": null,
                "aadhaar_name": null
            }
        },
        "kyc": {
            "notification_flags": {
                "day_0": false,
                "day_25": false,
                "day_29": false
            },
            "status": "not_started",
            "aadhaar_status": "not_started",
            "grace_expires_at": null,
            "suspended_at": null,
            "suspension_reason": null,
            "verified_at": null
        },
        "verification_badge": "none",
        "account_type": "USER",
        "account_status": "active",
        "language": "en",
        "created_at": "2026-03-09T17:34:21.899Z",
        "stats": {
            "posts_count": 0,
            "followers_count": 0,
            "following_count": 0,
            "reels_count": 0,
            "events_count": 0,
            "badges_count": 0
        },
        "onboarding_rewards": {
            "total_earned": 0,
            "final_bonus": 0,
            "completed_at": null,
            "category_rewards": []
        },
        "is_own_profile": true,
        "is_private": false,
        "is_following": false,
        "is_followed_by": false,
        "is_mutual_follow": false
    }
}



1.2 Get User Profile by ID
Endpoint: GET /users/:id
 Auth Required: Yes
 Tags: User Profile
Request
GET /api/v1/users/:id
Authorization: Bearer <token>

Parameters
Name
Type
Required
Description
id
string
Yes
User ID

Response (200 OK)
{
  "status": "success",
  "data": {
    "_id": "69a01c8ef8820cf3fd427bb5",
    "full_name": "Test User Aditya",
    "username": "testuseraditya",
    "bio": "Sports enthusiast and provider",
    "profile_main_type": {
      "type": "sports",
      "value": "football",
      "set_at": "2026-03-07T10:00:00.000Z"
    },
    "profile_image_url": "https://cdn.playymate.com/users/69a01c8ef8820cf3fd427bb5/avatar.jpg",
    "profile_location": {
      "display_text": "Pune, Maharashtra",
      "city": "Pune",
      "state": "Maharashtra"
    },
    "interests": {
      "sports": ["football"],
      "hobbies": []
    },
    "is_own_profile": false,
    "is_private": false,
    "is_following": false,
    "is_followed_by": false,
    "is_mutual_follow": false,
    "stats": {
      "posts_count": 0,
      "followers_count": 0,
      "following_count": 0,
      "reels_count": 0,
      "events_count": 0,
      "badges_count": 0
    },
    "created_at": "2026-02-26T10:12:31.036Z"
  },
  "error_code": null
}

Error Responses
401 Unauthorized: Invalid or missing token
403 Forbidden: User suspended
404 Not Found: User not found

1.3 Update User Profile
Endpoint: PATCH /users/:id
 Auth Required: Yes
 Tags: User Profile
Request
PATCH /api/v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body
{
  "full_name": "Test User Aditya",
  "bio": "Sports enthusiast and provider",
  "username": "testuseraditya",
  "profile_location": {
    "display_text": "Pune, Maharashtra",
    "city": "Pune",
    "state": "Maharashtra"
  }
}

Field Descriptions
Field
Type
Required
Constraints
Description
full_name
string
No
Min 2 chars
User's full name
bio
string
No
Max 200 chars
User biography (no phone/email/URL)
username
string
No
3-30 chars, lowercase, numbers, underscores
Unique username
profile_location
object
No
-
User's location

Response (200 OK)
{
  "status": "success",
  "message": "Profile updated",
  "data": {
    "user": {
      "_id": "69a01c8ef8820cf3fd427bb5",
      "full_name": "Test User Aditya",
      "username": "testuseraditya",
      "bio": "Sports enthusiast and provider",
      "profile_main_type": {
        "type": "sports",
        "value": "football",
        "set_at": "2026-03-07T10:00:00.000Z"
      },
      "profile_image_url": "https://cdn.playymate.com/users/69a01c8ef8820cf3fd427bb5/avatar.jpg",
      "profile_location": {
        "display_text": "Pune, Maharashtra",
        "city": "Pune",
        "state": "Maharashtra"
      }
    }
  },
  "error_code": null
}

Error Responses
400 Validation Error:
"Name must be at least 2 characters"
"Username must be 3-30 characters, lowercase letters, numbers, and underscores only"
"Bio must be 200 characters or less"
"Bio cannot contain phone numbers, email addresses, or URLs"
403 Forbidden: "You can only update your own profile"
409 Conflict: "Username is already taken"

1.4 Get User Stats
Endpoint: GET /users/:id/stats
 Auth Required: Yes
 Tags: User Profile
Request
GET /api/v1/users/:id/stats
Authorization: Bearer <token>

Response (200 OK)
{
  "status": "success",
  "data": {
    "posts_count": 0,
    "followers_count": 0,
    "following_count": 0,
    "reels_count": 0,
    "events_count": 0,
    "badges_count": 0
  },
  "error_code": null
}


1.5 Update User Location
Endpoint: PATCH /users/:id/location
 Auth Required: Yes
 Tags: User Profile
Request
PATCH /api/v1/users/:id/location
Authorization: Bearer <token>
Content-Type: application/json

Request Body
{
  "display_text": "Mumbai, Maharashtra",
  "city": "Mumbai",
  "state": "Maharashtra"
}

Response (200 OK)
{
  "status": "success",
  "data": {
    "profile_location": {
      "display_text": "Mumbai, Maharashtra",
      "city": "Mumbai",
      "state": "Maharashtra"
    }
  },
  "error_code": null
}


3. Avatar/Profile Photo
3.1 Get Presigned URL for Avatar Upload
Endpoint: POST /users/:id/avatar/presign
 Auth Required: Yes
 Tags: User Profile
Request
POST /api/v1/users/:id/avatar/presign
Authorization: Bearer <token>
Content-Type: application/json

Request Body
{
  "file_name": "avatar.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 204800
}

Response (200 OK)
{
  "status": "success",
  "data": {
    "upload_url": "https://wasabi.com/bucket/users/69a01c8ef8820cf3fd427bb5/avatar.jpg?signature...",
    "file_url": "https://cdn.playymate.com/users/69a01c8ef8820cf3fd427bb5/avatar.jpg",
    "file_key": "users/69a01c8ef8820cf3fd427bb5/avatar.jpg"
  },
  "error_code": null
}

Usage Flow
Call this endpoint to get upload_url
Upload file directly to upload_url using PUT method
Call confirm endpoint with the file_url

3.2 Confirm Avatar Upload
Endpoint: POST /users/:id/avatar/confirm
 Auth Required: Yes
 Tags: User Profile
Request
POST /api/v1/users/:id/avatar/confirm
Authorization: Bearer <token>
Content-Type: application/json

Request Body
{
  "file_url": "https://cdn.playymate.com/users/69a01c8ef8820cf3fd427bb5/avatar.jpg"
}

Response (200 OK)
{
  "status": "success",
  "message": "Avatar updated successfully",
  "data": {
    "profile_image_url": "https://cdn.playymate.com/users/69a01c8ef8820cf3fd427bb5/avatar.jpg"
  },
  "error_code": null
}


3.3 Delete Avatar
Endpoint: DELETE /users/:id/avatar
 Auth Required: Yes
 Tags: User Profile
Request
DELETE /api/v1/users/:id/avatar
Authorization: Bearer <token>

Response (200 OK)
{
  "status": "success",
  "message": "Avatar deleted successfully",
  "data": {
    "profile_image_url": null
  },
  "error_code": null
}


Error Responses
400 - FACE_NOT_DETECTED: "No face detected in the image. Please upload a clear photo."
400 - MULTIPLE_FACES: "Multiple faces detected. Please upload a photo with only one person."
400 - LOW_FACE_CONFIDENCE: "Face detection confidence too low. Please try a clearer photo."

3.5 Get All Profile Photos
Endpoint: GET /users/profile-photos
 Auth Required: Yes
 Tags: User
Request
GET /api/v1/users/profile-photos
Authorization: Bearer <token>


3.6 Delete Profile Photo
Endpoint: DELETE /users/profile-photos/:photoIndex
 Auth Required: Yes
 Tags: User
Request
DELETE /api/v1/users/profile-photos/0
Authorization: Bearer <token>


3.7 Set Primary Photo
Endpoint: PUT /users/profile-photos/:photoIndex/set-primary
 Auth Required: Yes
 Tags: User
Request
PUT /api/v1/users/profile-photos/1/set-primary
Authorization: Bearer <token>


4. Interests
4.1 Get User Interests
Endpoint: GET /users/:id/interests
 Auth Required: Yes
 Tags: User Profile
Request
GET /api/v1/users/:id/interests
Authorization: Bearer <token>

Response (200 OK)
{
    "status": "success",
    "data": {
        "interests": {
            "sports": [
                "cricket",
                "basketball",
                "pickleball"
            ],
            "hobbies": [
                "zumba",
                "karate",
                "judo"
            ],
            "activities": [
                "karaoke",
                "gigs",
                "night_clubs"
            ],
            "additional": [],
            "nostalgia": [
                "dog_and_bowl",
                "antakshari",
                "lagori"
            ]
        }
    },
    "error_code": null
}



4.2 Update User Interests
Endpoint: PATCH /users/:id/interests
 Auth Required: Yes
 Tags: User Profile
Request
PATCH /api/v1/users/:id/interests
Authorization: Bearer <token>
Content-Type: application/json

Request Body
{
  "interests": {
    "sports": ["football", "cricket"],
    "hobbies": ["photography"],
    "additional": ["food"],
    "activities": ["hiking"],
    "nostalgia": []
  }
}

Interest Categories & Limits
Category
Max Items
Example Values
sports
5
football, cricket, basketball, tennis, badminton, swimming, gym, yoga, boxing, martial_arts
hobbies
5
photography, travel, music, reading, gaming, cooking, painting, gardening
additional
3
food, fashion, technology, entertainment, news, science, art
activities
3
hiking, cycling, running, swimming, team_sports, individual_sports
nostalgia
3
90s_music, retro_games, classic_movies, vintage_fashion, old_memories

Response (200 OK)
{
  "status": "success",
  "data": {
    "interests": {
      "sports": ["football", "cricket"],
      "hobbies": ["photography"],
      "additional": ["food"],
      "activities": ["hiking"],
      "nostalgia": []
    }
  },
  "error_code": null
}

Error Responses
400 - INVALID_INTEREST: Interest value not in catalog
400 - INTEREST_LIMIT_EXceeded: More than max items selected

4.4 Update Profile Main Type
Endpoint: POST /users/profile-main-type
 Auth Required: Yes
 Tags: User Profile
Request
POST /api/v1/users/profile-main-type
Authorization: Bearer <token>
Content-Type: application/json

Request Body
{
  "main_type": "cricket",
  "category": "sports"
}

Response (200 OK)
{
  "status": "success",
  "message": "Profile main type updated",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_cricket",
      "bio": "Weekend cricket enthusiast",
      "profile_main_type": {
        "type": "sports",
        "value": "cricket",
        "set_at": "2026-03-07T10:00:00.000Z"
      }
    }
  },
  "error_code": null
}

Error Responses
400 - INVALID_CATEGORY: Invalid category value
400 - INVALID_MAIN_TYPE: main_type must be in user's selected interests

5. Privacy Settings
5.1 Get Privacy Settings
Endpoint: GET /users/:id/privacy
 Auth Required: Yes
 Tags: Privacy
Request
GET /api/v1/users/:id/privacy
Authorization: Bearer <token>


5.2 Update Privacy Settings
Endpoint: PATCH /users/:id/privacy
 Auth Required: Yes
 Tags: Privacy
Request
PATCH /api/v1/users/:id/privacy
Authorization: Bearer <token>
Content-Type: application/json

Request Body
{
  "profile_visibility": "public",
  "performance_visibility": "friends_only",
  "social_visibility": "public"
}

Visibility Options
Setting
Options
Description
profile_visibility
public, friends_only, private
Who can view profile
performance_visibility
public, friends_only, private
Who can view performance data
social_visibility
public, friends_only, private
Who can view social activity


9. Username
9.1 Get Username Suggestions
Endpoint: GET /users/username/suggestions
 Auth Required: Yes
 Tags: User Profile
Request
GET /api/v1/users/username/suggestions
Authorization: Bearer <token>

Response (200 OK)
{
  "status": "success",
  "data": {
    "suggestions": [
      "john_cricket",
      "john_sports",
      "john_play",
      "john_42",
      "john_85"
    ]
  },
  "error_code": null
}


Common Error Codes
Error Code
Description
VALIDATION_ERROR
Request validation failed
AUTH_ERROR
Authentication required
NOT_YOUR_PROFILE
Can only modify your own profile
USERNAME_TAKEN
Username already exists
USERNAME_INVALID_FORMAT
Invalid username format
BIO_CONTENT_BLOCKED
Bio contains blocked content
FACE_NOT_DETECTED
No face detected in photo
MULTIPLE_FACES
Multiple faces detected
LOW_FACE_CONFIDENCE
Face confidence too low
INVALID_INTEREST
Interest not in catalog
INTEREST_LIMIT_EXCEEDED
Too many interests selected
INVALID_MAIN_TYPE
Main type not in interests
ACCESS_DENIED
Cannot access this resource


Notes for Frontend Integration
Authentication: All endpoints (except /users/language) require Bearer token authentication
Profile Photo: Uses AWS Rekognition for face detection - requires exactly one face with 90%+ confidence
Interests: Must be validated against the interest catalog before submission
Username: Must be 3-30 characters, lowercase letters, numbers, and underscores only
Bio: Maximum 200 characters, no phone numbers, emails, or URLs allowed
Avatar Upload Flow:
Step 1: Call presign endpoint → get upload_url
Step 2: Upload file to upload_url (PUT request)
Step 3: Call confirm endpoint with file_url

Generated on: 2026-03-07 API Version: v1

