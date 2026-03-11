# Profile Completion Card API Documentation

## Overview

The Profile Completion Card feature helps new users complete their profile by prompting them to add:
- **Username** (Mandatory) - Unique handle for discovery
- **Profile Main Type** (Mandatory) - Primary activity/sport category  
- **Bio** (Optional) - Short description about themselves

---

## API Endpoints

### 1. Update Profile (Username/Bio)

Update user profile including username and bio.

**Endpoint:** `PATCH /api/v1/users/:id`

**Authentication:** Bearer Token (required)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User ID |

**Request Body:**
```json
{
  "username": "john_cricket",
  "bio": "Weekend cricket enthusiast"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-------------|
| username | string | No | 3-30 chars, lowercase letters, numbers, underscores only |
| bio | string | No | Max 200 characters, no phone numbers, emails, or URLs |
| full_name | string | No | Min 2 characters |
| profile_location | object | No | Location details |

**Response (Success):**
```json
{
  "status": "success",
  "message": "Profile updated",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "full_name": "John Doe",
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
```

**Error Responses:**
- `400` - Validation error (invalid format, too long)
- `401` - Unauthorized
- `403` - Not your profile
- `409` - Username already taken

---

### 2. Get Username Suggestions

Generate username suggestions based on user's name and profile type.

**Endpoint:** `GET /api/v1/users/username/suggestions`

**Authentication:** Bearer Token (required)

**Response (Success):**
```json
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
```

---

### 3. Update Profile Main Type

Set the user's primary activity/sport category.

**Endpoint:** `POST /api/v1/users/profile-main-type`

**Authentication:** Bearer Token (required)

**Request Body:**
```json
{
  "main_type": "cricket",
  "category": "sports"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-------------|
| main_type | string | Yes | Must be in user's selected interests |
| category | string | Yes | Must be: sports, hobbies, activities, additional, nostalgia |

**Response (Success):**
```json
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
```

**Error Responses:**
- `400` - Validation error (invalid category, main_type not in interests)
- `401` - Unauthorized

---

### 4. AI Generate Bio

Generate a bio using AI based on user profile or custom prompt.

**Endpoint:** `POST /api/v1/ai/generate-bio`

**Authentication:** Bearer Token (required)

**Rate Limit:** 5 requests per hour per user

**Request Body (AI Generated):**
```json
{
  "ai_generate": true
}
```

**Request Body (Prompt Based):**
```json
{
  "prompt": "Create a fun bio for someone who loves cricket and travelling"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ai_generate | boolean | No | Generate bio from profile data |
| prompt | string | No | Custom prompt for bio generation |

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "bio": "Weekend cricket enthusiast and travel lover. Always up for an adventure!"
  },
  "error_code": null
}
```

**Error Responses:**
- `400` - Invalid request (must provide ai_generate or prompt)
- `401` - Unauthorized
- `429` - Rate limit exceeded
- `503` - AI service not configured

---

### 5. Get Home Feed

Get personalized home feed with profile completion card.

**Endpoint:** `GET /api/v1/feed`

**Authentication:** Bearer Token (required)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cursor | string | null | Pagination cursor |
| limit | number | 20 | Items per page (max 50) |

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "type": "venue",
        "data": { ... }
      },
      {
        "type": "event", 
        "data": { ... }
      }
    ],
    "profile_completion_card": {
      "enabled": true,
      "tasks": {
        "username": false,
        "profile_main_type": false,
        "bio": false
      },
      "tiles": [
        {
          "id": "username",
          "title": "Create Username",
          "description": "Your username helps friends find and follow you.",
          "action": "add_username",
          "required": true,
          "status": "pending"
        },
        {
          "id": "profile_main_type",
          "title": "Select Main Profile Type",
          "description": "Choose the activity that best represents your profile.",
          "action": "select_type",
          "required": true,
          "status": "pending"
        },
        {
          "id": "bio",
          "title": "Add Bio",
          "description": "Tell people about yourself.",
          "action": "write_bio",
          "required": false,
          "status": "pending"
        }
      ]
    },
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

**Profile Completion Card Logic:**
- `enabled: true` - Show card if username OR profile_main_type is missing
- `enabled: false` - Hide card when both username AND profile_main_type are set
- Bio is always marked as `required: false` (optional field)

---

## Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `feed.profile_completion_card_enabled` | true | Enable/disable profile completion card in feed |

---

## Cache Invalidation

Feed cache is automatically invalidated when:
- Username is updated
- Profile main type is updated
- Bio is updated

Cache pattern: `feed:v1:user:{userId}:*`

---

## Usage Flow

### Flow 1: New User Completes Profile

```
1. User registers → GET /api/v1/feed
   → Response includes profile_completion_card (enabled: true)

2. User gets username suggestions → GET /api/v1/users/username/suggestions
   → Returns 5 suggestions based on name + interests

3. User sets username → PATCH /api/v1/users/:id
   → Body: { "username": "john_cricket" }
   → Feed cache invalidated
    
4. User sets profile type → POST /api/v1/users/profile-main-type
   → Body: { "main_type": "cricket", "category": "sports" }
   → Feed cache invalidated

5. (Optional) User adds bio → PATCH /api/v1/users/:id
   → Body: { "bio": "Weekend cricket player" }
   → Feed cache invalidated

6. User visits feed again → GET /api/v1/feed
   → profile_completion_card.enabled: false (hidden)
```

### Flow 2: AI Bio Generation

```
1. User wants AI help with bio → POST /api/v1/ai/generate-bio
   → Body: { "ai_generate": true }
   → Returns AI-generated bio based on profile

   OR

   → Body: { "prompt": "Create a fun bio for cricket lovers" }
   → Returns AI-generated bio from custom prompt

2. User saves bio → PATCH /api/v1/users/:id
   → Body: { "bio": "<generated bio>" }
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid input format or length |
| `USERNAME_INVALID_FORMAT` | Username doesn't match pattern |
| `USERNAME_TAKEN` | Username already exists |
| `BIO_CONTENT_BLOCKED` | Bio contains phone/email/URL |
| `INVALID_CATEGORY` | Invalid category value |
| `INVALID_MAIN_TYPE` | main_type not in user's interests |
| `RATE_LIMITED` | Too many AI requests |
| `SERVICE_UNAVAILABLE` | AI service not configured |

---

## Related Files

- [`src/modules/user/user.model.js`](src/modules/user/user.model.js) - User schema
- [`src/modules/user/profile/profile.controller.js`](src/modules/user/profile/profile.controller.js) - Profile controller
- [`src/modules/user/profile/profile.routes.js`](src/modules/user/profile/profile.routes.js) - Profile routes
- [`src/modules/feed/feed.service.js`](src/modules/feed/feed.service.js) - Feed service
- [`src/modules/ai/bioGeneration.service.js`](src/modules/ai/bioGeneration.service.js) - AI bio service
- [`src/modules/system/featureFlagConfig.service.js`](src/modules/system/featureFlagConfig.service.js) - Feature flags
