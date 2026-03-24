# Share to DM - Message Requests API Documentation

## Playymate Backend API

---

## Overview

This document describes the API endpoints for the Share to DM feature with Instagram-style message requests. The system enables users to share posts, reels, and stories to direct messages with proper privacy controls.

### Features

- Share content to followers (direct delivery)
- Share content to strangers (message request)
- Accept/Decline/Block incoming requests
- Privacy settings to control who can message you
- Rate limiting to prevent spam
- Real-time Socket.IO notifications

---

## Table of Contents

1. [Message Requests API](#message-requests-api)
2. [Share Recipients API](#share-recipients-api)
3. [Privacy Settings API](#privacy-settings-api)
4. [Share Content API](#share-content-api)
5. [Socket Events](#socket-events)
6. [Error Codes](#error-codes)

---

## Message Requests API

### Get Pending Message Requests

Retrieve all pending message requests for the authenticated user.

```http
GET /api/v1/messages/requests
```

**Headers:**
| Header | Value |
|--------|-------|
| Authorization | Bearer {token} |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cursor | string | null | Pagination cursor |
| limit | integer | 20 | Number of results (max 50) |

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "requests": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "conversation_type": "request",
        "request_status": "pending",
        "initiated_by": "share",
        "shared_content": {
          "content_id": "post_123",
          "content_type": "post",
          "preview_url": "https://...",
          "caption": "Check this out!"
        },
        "participants": [
          {
            "user_id": {
              "_id": "507f1f77bcf86cd799439012",
              "full_name": "John Doe",
              "username": "johndoe",
              "profile_image_url": "https://..."
            }
          },
          {
            "user_id": {
              "_id": "507f1f77bcf86cd799439013",
              "full_name": "Jane Smith",
              "username": "janesmith"
            }
          }
        ],
        "created_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "next_cursor": null,
    "has_more": false
  },
  "error_code": null
}
```

---

### Accept Message Request

Accept a pending message request and start a conversation.

```http
POST /api/v1/messages/requests/{conversationId}/accept
```

**Headers:**
| Header | Value |
|--------|-------|
| Authorization | Bearer {token} |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| conversationId | string | The conversation ID |

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "conversation_type": "direct",
    "request_status": "accepted",
    "participants": [...],
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "error_code": null
}
```

**Error Responses:**
- 404: Conversation not found
- 403: Not authorized
- 400: Not a message request
- 400: Request already processed

---

### Decline Message Request

Decline a pending message request.

```http
POST /api/v1/messages/requests/{conversationId}/decline
```

**Headers:**
| Header | Value |
|--------|-------|
| Authorization | Bearer {token} |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| conversationId | string | The conversation ID |

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "success": true
  },
  "error_code": null
}
```

**Error Responses:**
- 404: Conversation not found
- 403: Not authorized
- 400: Not a message request

---

### Block User from Requests

Block the user and decline their message request.

```http
POST /api/v1/messages/requests/{conversationId}/block
```

**Headers:**
| Header | Value |
|--------|-------|
| Authorization | Bearer {token} |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| conversationId | string | The conversation ID |

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "success": true
  },
  "error_code": null
}
```

---

## Share Recipients API

### Get Share Recipients

Get list of users who can receive shared content (followers/following).

```http
GET /api/v1/messages/share-recipients
```

**Headers:**
| Header | Value |
|--------|-------|
| Authorization | Bearer {token} |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| type | string | "all" | Filter: "all", "followers", "following", "global", "search" |
| search | string | null | Search by username or name (works with all types) |
| limit | integer | 20 | Number of results (max 50) |

**Type Options:**
| Type | Description |
|------|-------------|
| all | Get followers + following (default) |
| followers | Get users who follow you |
| following | Get users you follow |
| global | Search ALL users in system |
| search | Search ALL users in system (alias for global) |

> **Note:** When sharing to users you don't follow (global type), a message request will be created instead of a direct conversation.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "recipients": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "full_name": "John Doe",
        "username": "johndoe",
        "profile_image_url": "https://..."
      }
    ],
    "total": 1
  },
  "error_code": null
}
```

---

## Privacy Settings API

### Get Message Privacy Settings

Retrieve current message privacy settings.

```http
GET /api/v1/users/{userId}/privacy/messages
```

**Headers:**
| Header | Value |
|--------|-------|
| Authorization | Bearer {token} |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "message_privacy": {
      "type": "everyone",
      "allow_follow_requests_message": true,
      "silent_mode": false
    }
  },
  "error_code": null
}
```

---

### Update Message Privacy Settings

Update message privacy settings.

```http
PATCH /api/v1/users/{userId}/privacy/messages
```

**Headers:**
| Header | Value |
|--------|-------|
| Authorization | Bearer {token} |
| Content-Type | application/json |

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User ID |

**Request Body:**
```json
{
  "type": "followers",
  "allow_follow_requests_message": true,
  "silent_mode": false,
  "max_requests_per_day": 10
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| type | string | Who can send messages: "everyone", "followers", "followers_of_followers", "no_one" |
| allow_follow_requests_message | boolean | Allow users you follow to send messages (default: true) |
| silent_mode | boolean | Don't notify for message requests (default: false) |
| max_requests_per_day | integer | Rate limit (1-50, default: 5) |

**Response (200):**
```json
{
  "status": "success",
  "message": "Message privacy settings updated",
  "data": {
    "message_privacy": {
      "type": "followers",
      "allow_follow_requests_message": true,
      "silent_mode": false
    },
    "message_request_limits": {
      "max_requests_per_day": 10,
      "requests_sent_today": 0
    }
  },
  "error_code": null
}
```

**Error Responses:**
- 403: Not your profile
- 400: Invalid type value
- 400: max_requests_per_day must be between 1 and 50

---

## Share Content API

### Share Content to DM

Share a post, reel, or story to a direct message.

```http
POST /api/v1/shares
```

**Headers:**
| Header | Value |
|--------|-------|
| Authorization | Bearer {token} |
| Content-Type | application/json |

**Request Body:**
```json
{
  "content_id": "507f1f77bcf86cd799439011",
  "content_type": "post",
  "shared_to": "direct_message",
  "recipient_id": "507f1f77bcf86cd799439012",
  "message": "Check this out!"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content_id | string | Yes | ID of the content to share |
| content_type | string | Yes | "post", "reel", or "story" |
| shared_to | string | Yes | "direct_message" |
| recipient_id | string | Yes | User ID of recipient |
| message | string | No | Optional message |

**Response - Direct Message (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "sharer_id": "507f1f77bcf86cd799439011",
    "content_id": "post_123",
    "content_type": "post",
    "shared_to": "direct_message",
    "conversation_id": "507f1f77bcf86cd799439030",
    "message": "Check this out!",
    "requires_acceptance": false,
    "conversation_type": "direct",
    "signed_urls": {
      "media": [...],
      "thumbnail": "https://..."
    }
  },
  "error_code": null
}
```

**Response - Message Request (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "sharer_id": "507f1f77bcf86cd799439011",
    "content_id": "post_123",
    "content_type": "post",
    "shared_to": "direct_message",
    "conversation_id": "507f1f77bcf86cd799439030",
    "requires_acceptance": true,
    "conversation_type": "request"
  },
  "error_code": null
}
```

**Error Responses:**
- 400: Invalid content type
- 400: Recipient required
- 403: User blocked
- 429: Rate limit exceeded

---

## Socket Events

### Connection

```javascript
const socket = io('https://api.playymate.com', {
  auth: { token: 'USER_ACCESS_TOKEN' }
});

socket.on('connected', (data) => {
  console.log('Connected:', data);
});
```

### request:new

Emitted when a new message request is received.

```javascript
socket.on('request:new', (data) => {
  // New message request received
  console.log(data);
});
```

**Payload:**
```json
{
  "conversation_id": "507f1f77bcf86cd799439011",
  "sender_id": "507f1f77bcf86cd799439012",
  "shared_content": {
    "content_id": "post_123",
    "content_type": "post",
    "preview_url": "https://...",
    "caption": "Check this out!"
  },
  "initiated_by": "share",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### request:accepted

Emitted when your message request is accepted.

```javascript
socket.on('request:accepted', (data) => {
  // Request was accepted
  console.log(data);
});
```

**Payload:**
```json
{
  "conversation_id": "507f1f77bcf86cd799439011",
  "accepted_by": "507f1f77bcf86cd799439013",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

### request:declined

Emitted when your message request is declined.

```javascript
socket.on('request:declined', (data) => {
  // Request was declined
  console.log(data);
});
```

**Payload:**
```json
{
  "conversation_id": "507f1f77bcf86cd799439011",
  "declined_by": "507f1f77bcf86cd799439013",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

### request:blocked

Emitted when you are blocked by a user.

```javascript
socket.on('request:blocked', (data) => {
  // You have been blocked
  console.log(data);
});
```

**Payload:**
```json
{
  "conversation_id": "507f1f77bcf86cd799439011",
  "blocked_by": "507f1f77bcf86cd799439013",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| BLOCKED | 403 | Cannot contact this user |
| USER_BLOCKED | 403 | User has blocked you |
| REQUEST_REQUIRED | 400 | Must send message request |
| RATE_LIMIT_EXCEEDED | 429 | Daily request limit reached |
| REQUEST_PREVIOUSLY_DECLINED | 400 | Cannot re-initiate conversation |
| NOT_A_REQUEST | 400 | Not a pending request |
| REQUEST_NOT_PENDING | 400 | Request already processed |
| NOT_PARTICIPANT | 403 | Not part of this conversation |
| CONVERSATION_NOT_FOUND | 404 | Conversation not found |
| NOT_YOUR_PROFILE | 403 | Can only modify your own settings |
| VALIDATION_ERROR | 400 | Invalid parameter value |
| GET_REQUESTS_FAILED | 500 | Internal server error |
| ACCEPT_FAILED | 500 | Internal server error |
| DECLINE_FAILED | 500 | Internal server error |
| BLOCK_FAILED | 500 | Internal server error |

---

## Privacy Flow Diagram

```
User A shares to User B
         │
         ▼
┌─────────────────────────────────┐
│ Check Relationship              │
│ • Is A blocked by B?            │
│ • Does A follow B?              │
│ • Does B follow A?              │
│ • What's B's privacy setting?   │
└─────────────────────────────────┘
         │
         ▼
    ┌────┴────┐
    │         │
 YES │         │ NO
    ▼         ▼
┌─────────┐  ┌──────────────────┐
│ Mutual/ │  │ Check Privacy   │
│ Follow  │  │ Settings        │
└─────────┘  └──────────────────┘
    │               │
    │               ▼
    │        ┌──────┴──────┐
    │        │             │
    ▼        ▼             ▼
┌────────┐ ┌────────┐  ┌─────────┐
│ Direct │ │ Request│  │ Blocked │
│ DM     │ │        │  │         │
└────────┘ └────────┘  └─────────┘
    │          │            
    ▼          ▼            
┌────────┐  ┌──────────────┐
│Message │  │Request       │
│Delivered│ │Sent to B's  │
│         │ │Inbox        │
└────────┘  └──────────────┘
```

---

## Rate Limiting

- Default: 5 message requests per day
- Configurable: 1-50 requests per day
- Resets at midnight (user's local time)
- Blocks spam abuse from strangers

---

## Privacy Options Explained

| Setting | Description |
|---------|-------------|
| **everyone** | Anyone can send you messages. Non-followers send message requests. |
| **followers** | Only users who follow you can send direct messages. Others send requests. |
| **followers_of_followers** | Followers and mutual connections can send direct messages. |
| **no_one** | No one can send you messages. All attempts are blocked. |

---

## Version History

- v1.0 (2024-01-15): Initial release
- Features: Message requests, privacy settings, rate limiting, Socket.IO events
