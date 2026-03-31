# Follow Request API Documentation

## Overview

The Follow Request System enables private account functionality similar to Instagram. When a user tries to follow a private account, a follow request is created instead of an immediate follow relationship. The account owner can then accept or reject the request.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Follow Request Endpoints](#follow-request-endpoints)
   - [Send Follow Request](#1-send-follow-request)
   - [Accept Follow Request](#2-accept-follow-request)
   - [Reject Follow Request](#3-reject-follow-request)
   - [Cancel Follow Request](#4-cancel-follow-request)
   - [Get Pending Requests](#5-get-pending-requests)
   - [Get Sent Requests](#6-get-sent-requests)
   - [Check Follow Request Status](#7-check-follow-request-status)
3. [Privacy Settings Endpoints](#privacy-settings-endpoints)
   - [Get Account Privacy](#8-get-account-privacy)
   - [Update Account Privacy](#9-update-account-privacy)
4. [Profile Integration](#profile-integration)
5. [Error Codes](#error-codes)
6. [Data Models](#data-models)

---

## Authentication

All endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

---

## Follow Request Endpoints

### 1. Send Follow Request

Send a follow request to a private account. For public accounts, this creates an immediate follow relationship.

**Endpoint:** `POST /api/v1/users/:id/follow`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Hey! I'd like to follow you."  // Optional, max 200 chars
}
```

**Response (202 - Private Account):**
```json
{
  "status": "success",
  "message": "Follow request sent",
  "data": {
    "request_id": "507f1f77bcf86cd799439011",
    "status": "pending",
    "created_at": "2026-03-27T10:30:00.000Z"
  },
  "error_code": null
}
```

**Response (201 - Public Account):**
```json
{
  "status": "success",
  "message": "Following",
  "data": {
    "follow_id": "507f1f77bcf86cd799439011",
    "following": true
  },
  "error_code": null
}
```

**Error Responses:**
| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `CANNOT_FOLLOW_SELF` | Cannot follow yourself |
| 404 | `USER_NOT_FOUND` | Target user not found |
| 409 | `ALREADY_FOLLOWING` | Already following this user |
| 409 | `FOLLOW_REQUEST_ALREADY_SENT` | Request already pending |

---

### 2. Accept Follow Request

Accept a pending follow request. Only the target user (request recipient) can accept.

**Endpoint:** `POST /api/v1/follow-requests/:requestId/accept`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Follow request accepted",
  "data": {
    "request_id": "507f1f77bcf86cd799439011",
    "status": "accepted",
    "responded_at": "2026-03-27T10:35:00.000Z"
  },
  "error_code": null
}
```

**Error Responses:**
| Status | Error Code | Description |
|--------|------------|-------------|
| 404 | `NOT_FOUND` | Follow request not found |
| 403 | `FORBIDDEN` | You can only accept requests sent to you |
| 400 | `VALIDATION_ERROR` | Invalid request ID format |

---

### 3. Reject Follow Request

Reject a pending follow request. Only the target user can reject.

**Endpoint:** `POST /api/v1/follow-requests/:requestId/reject`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Follow request rejected",
  "data": {
    "request_id": "507f1f77bcf86cd799439011",
    "status": "rejected",
    "responded_at": "2026-03-27T10:35:00.000Z"
  },
  "error_code": null
}
```

**Error Responses:**
| Status | Error Code | Description |
|--------|------------|-------------|
| 404 | `NOT_FOUND` | Follow request not found |
| 403 | `FORBIDDEN` | You can only reject requests sent to you |

---

### 4. Cancel Follow Request

Cancel a pending follow request. Only the requester can cancel.

**Endpoint:** `DELETE /api/v1/follow-requests/:requestId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Follow request cancelled",
  "data": {
    "request_id": "507f1f77bcf86cd799439011",
    "status": "cancelled"
  },
  "error_code": null
}
```

**Error Responses:**
| Status | Error Code | Description |
|--------|------------|-------------|
| 404 | `NOT_FOUND` | Follow request not found |
| 403 | `FORBIDDEN` | You can only cancel requests you sent |

---

### 5. Get Pending Requests

Get all pending follow requests received by the authenticated user.

**Endpoint:** `GET /api/v1/follow-requests/pending`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of results per page (max 50) |
| `cursor` | string | null | Pagination cursor from previous response |

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "requests": [
      {
        "request_id": "507f1f77bcf86cd799439011",
        "requester": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "johndoe",
          "full_name": "John Doe",
          "profile_image_url": "https://cdn.playymate.com/profiles/johndoe.jpg"
        },
        "message": "Hey! I'd like to follow you.",
        "status": "pending",
        "created_at": "2026-03-27T10:30:00.000Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "has_more": false,
      "next_cursor": null
    }
  },
  "error_code": null
}
```

---

### 6. Get Sent Requests

Get all follow requests sent by the authenticated user.

**Endpoint:** `GET /api/v1/follow-requests/sent`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of results per page (max 50) |
| `cursor` | string | null | Pagination cursor from previous response |

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "requests": [
      {
        "request_id": "507f1f77bcf86cd799439011",
        "target": {
          "_id": "507f1f77bcf86cd799439013",
          "username": "janedoe",
          "full_name": "Jane Doe",
          "profile_image_url": "https://cdn.playymate.com/profiles/janedoe.jpg"
        },
        "message": "Hey! I'd like to follow you.",
        "status": "pending",
        "created_at": "2026-03-27T10:30:00.000Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "has_more": false,
      "next_cursor": null
    }
  },
  "error_code": null
}
```

---

### 2. Accept Follow Request

Accept a pending follow request. Only the target user (request recipient) can accept.

**Endpoint:** `POST /api/v1/follow-requests/:requestId/accept`

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `requestId` | string | The follow request ID |

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Follow request accepted",
  "data": {
    "request_id": "507f1f77bcf86cd799439011",
    "status": "accepted",
    "responded_at": "2026-03-27T10:35:00.000Z"
  },
  "error_code": null
}
```

**Error Responses:**
| Status | Error Code | Description |
|--------|------------|-------------|
| 404 | `NOT_FOUND` | Follow request not found |
| 403 | `FORBIDDEN` | User is not the request recipient |
| 409 | `ALREADY_ACCEPTED` | Request already accepted |

---

### 3. Reject Follow Request

Reject a pending follow request. Only the target user can reject.

**Endpoint:** `POST /api/v1/follow-requests/:requestId/reject`

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `requestId` | string | The follow request ID |

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Follow request rejected",
  "data": {
    "request_id": "507f1f77bcf86cd799439011",
    "status": "rejected",
    "responded_at": "2026-03-27T10:35:00.000Z"
  },
  "error_code": null
}
```

---

### 4. Cancel Follow Request

Cancel a pending follow request. Only the requester can cancel their own request.

**Endpoint:** `DELETE /api/v1/follow-requests/:requestId`

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `requestId` | string | The follow request ID |

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Follow request cancelled",
  "data": {
    "request_id": "507f1f77bcf86cd799439011",
    "status": "cancelled"
  },
  "error_code": null
}
```

---

### 5. Get Pending Requests

Get all pending follow requests received by the authenticated user.

**Endpoint:** `GET /api/v1/follow-requests/pending`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of requests to return (max: 50) |
| `cursor` | string | null | Pagination cursor from previous response |

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "requests": [
      {
        "request_id": "507f1f77bcf86cd799439011",
        "requester": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "johndoe",
          "full_name": "John Doe",
          "profile_image_url": "https://cdn.playymate.com/profiles/johndoe.jpg"
        },
        "message": "Hey! I'd like to follow you.",
        "status": "pending",
        "created_at": "2026-03-27T10:30:00.000Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "has_more": false,
      "next_cursor": null
    }
  },
  "error_code": null
}
```

---

### 6. Get Sent Requests

Get all follow requests sent by the authenticated user.

**Endpoint:** `GET /api/v1/follow-requests/sent`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of requests to return (max: 50) |
| `cursor` | string | null | Pagination cursor from previous response |

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "requests": [
      {
        "request_id": "507f1f77bcf86cd799439011",
        "target": {
          "_id": "507f1f77bcf86cd799439013",
          "username": "janedoe",
          "full_name": "Jane Doe",
          "profile_image_url": "https://cdn.playymate.com/profiles/janedoe.jpg"
        },
        "message": "Hey! I'd like to follow you.",
        "status": "pending",
        "created_at": "2026-03-27T10:30:00.000Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "has_more": false,
      "next_cursor": null
    }
  },
  "error_code": null
}
```

---

### 7. Check Follow Request Status

Check the follow request status with a specific user.

**Endpoint:** `GET /api/v1/users/:id/follow-request-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Target user ID |

**Response (200 OK) - Pending Request:**
```json
{
  "status": "success",
  "data": {
    "request_id": "507f1f77bcf86cd799439011",
    "status": "pending",
    "is_requester": true,
    "created_at": "2026-03-27T10:30:00.000Z"
  },
  "error_code": null
}
```

**Response (200 OK) - No Request:**
```json
{
  "status": "success",
  "data": {
    "request_id": null,
    "status": "none",
    "is_requester": false,
    "created_at": null
  },
  "error_code": null
}
```

**Response (200 OK) - Already Following:**
```json
{
  "status": "success",
  "data": {
    "request_id": null,
    "status": "following",
    "is_requester": false,
    "created_at": null
  },
  "error_code": null
}
```

---

## Privacy Settings Endpoints

### 8. Get Account Privacy

Get the authenticated user's account privacy settings.

**Endpoint:** `GET /api/v1/users/me/privacy/account`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "is_private": false,
    "pending_follow_requests_count": 5
  },
  "error_code": null
}
```

---

### 9. Update Account Privacy

Toggle account privacy between public and private.

**Endpoint:** `PATCH /api/v1/users/me/privacy/account`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "is_private": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Account privacy updated",
  "data": {
    "is_private": true,
    "pending_follow_requests_count": 5
  },
  "error_code": null
}
```

**Important Notes:**
- When changing from **private to public**, all pending follow requests are **automatically accepted**
- FollowRelation records are created for each accepted request
- Notifications are sent to requesters about acceptance

---

## Profile Integration

When fetching a user profile, the response now includes follow request status:

**Endpoint:** `GET /api/v1/users/:id`

**Response includes:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "username": "janedoe",
    "full_name": "Jane Doe",
    "is_private": true,
    "is_following": false,
    "is_followed_by": false,
    "follow_request_status": "pending",
    "followers_count": 150,
    "following_count": 200,
    "posts_count": 45
  }
}
```

**`follow_request_status` values:**
| Value | Description |
|-------|-------------|
| `none` | No follow relationship or request exists |
| `pending` | Follow request is pending approval |
| `accepted` | Follow request was accepted (user is now following) |
| `rejected` | Follow request was rejected |
| `following` | User is already following (for public accounts) |

---

## Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | User doesn't have permission for this action |
| `NOT_FOUND` | 404 | Follow request or user not found |
| `ALREADY_FOLLOWING` | 409 | Already following this user |
| `ALREADY_REQUESTED` | 409 | Follow request already sent |
| `CANNOT_FOLLOW_SELF` | 400 | Cannot send follow request to yourself |
| `USER_BLOCKED` | 403 | Cannot follow a blocked user |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |

---

## Data Models

### FollowRequest Schema

```javascript
{
  requester_id: ObjectId,      // User who sent the request
  target_id: ObjectId,         // User who receives the request
  status: String,              // 'pending' | 'accepted' | 'rejected' | 'cancelled'
  message: String,             // Optional message (max 200 chars)
  created_at: Date,            // When request was sent
  updated_at: Date,            // Last update time
  responded_at: Date           // When request was accepted/rejected
}
```

**Indexes:**
- Unique compound index on `(requester_id, target_id)`
- Index on `(target_id, status, created_at)` for pending requests lookup
- Index on `(requester_id, status, created_at)` for sent requests lookup

### User Schema Updates

```javascript
{
  is_private: Boolean,                    // Account privacy setting
  pending_follow_requests_count: Number   // Count of pending requests
}
```

---

## Flow Diagrams

### Follow Request Flow (Private Account)

```
User A (public) → Follow User B (private)
    │
    ├─→ Check if B is private → YES
    │
    ├─→ Create FollowRequest(status: 'pending')
    │
    ├─→ Increment B.pending_follow_requests_count
    │
    ├─→ Send notification to B
    │
    └─→ Return 202 { request_id, status: 'pending' }
```

### Accept Flow

```
User B → Accept Request
    │
    ├─→ Validate request exists & is pending
    │
    ├─→ Update FollowRequest(status: 'accepted')
    │
    ├─→ Create FollowRelation(A → B)
    │
    ├─→ Increment A.following_count, B.followers_count
    │
    ├─→ Decrement B.pending_follow_requests_count
    │
    ├─→ Send notification to A
    │
    └─→ Return 200 { status: 'accepted' }
```

### Privacy Toggle Flow (Private → Public)

```
User B → Set is_private = false
    │
    ├─→ Find all pending FollowRequests(target_id: B)
    │
    ├─→ For each request:
    │   ├─→ Create FollowRelation
    │   ├─→ Update FollowRequest(status: 'accepted')
    │   └─→ Send notification to requester
    │
    ├─→ Reset B.pending_follow_requests_count = 0
    │
    └─→ Return 200 { is_private: false }
```

---

## Rate Limiting

- Follow requests: 50 requests per hour per user
- Accept/Reject actions: 100 actions per hour per user
- Pending requests list: 60 requests per minute per user

---

## Notes

1. **Public accounts**: Following is immediate (no request needed)
2. **Private accounts**: Follow request required, owner must accept/reject
3. **Auto-accept**: When switching from private to public, all pending requests are auto-accepted
4. **Notifications**: Push notifications sent for request received, accepted, and rejected
5. **Feed visibility**: Only accepted follows appear in the following feed
6. **Search**: Private accounts don't appear in public search results unless followed
