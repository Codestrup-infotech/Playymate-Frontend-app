# Playmate Reels & Posts API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Posts API](#posts-api)
4. [Reels API](#reels-api)
5. [Likes API](#likes-api)
6. [Comments API](#comments-api)
7. [Social Feed API](#social-feed-api)
8. [Media Upload API](#media-upload-api)
9. [Error Codes](#error-codes)
10. [Integration Flow](#integration-flow)

---

## Overview

The Playmate Social API provides endpoints for creating, managing, and interacting with posts and reels (short-form videos). All endpoints require authentication via JWT tokens.

### Base URL
```
https://api.playmate.com/api/v1
```

### Common Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <access_token>
```

### Feature Requirements
- Users must complete onboarding (`onboarding_state: 'COMPLETED'`) before accessing social features
- Suspended users are blocked from all social operations

---

## Authentication

All social API endpoints require authentication. See [Auth API Documentation](#) for detailed authentication flow.

### Quick Auth Flow
```bash
# 1. Send OTP
POST /auth/phone/send-otp
{ "phone": "+919045676543" }

# 2. Verify OTP  
POST /auth/phone/verify-otp
{ 
  "auth_flow_id": "<flow_id>",
  "otp": "123456",
  "phone": "+919045676543"
}

# 3. Complete Login
POST /auth/complete
{
  "auth_flow_id": "<flow_id>",
  "device_info": {
    "device_id": "device-001",
    "user_agent": "app"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1...",
    "refresh_token": "eyJhbGciOiJIUzI1...",
    "expires_in": 3600,
    "session_id": "session_xxx"
  }
}
```

---

## Posts API

### Create Post

Create a new text/image post.

```http
POST /posts/create
```

**Request Body:**
```json
{
  "content": {
    "text": "Check out this amazing venue! #sports #badminton",
    "location": "Pune, Maharashtra"
  },
  "media": [
    {
      "type": "image",
      "url": "https://cdn.playmate.com/posts/img_123.jpg",
      "file_key": "posts/user123/img_123.jpg"
    }
  ],
  "visibility": "public",
  "allow_comments": true,
  "allow_shares": true,
  "linked_activity": {
    "type": "booking",
    "activity_id": "booking_123"
  }
}
```

**Validation:**
| Field | Type | Constraints |
|-------|------|-------------|
| content.text | string | Max 500 characters |
| media | array | Max 5 items |
| visibility | string | Enum: `public`, `followers`, `private` |

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "post_id": "post_5f47a1b2c9e1",
    "created_at": "2024-01-15T10:30:00Z",
    "moderation_status": "approved"
  },
  "error_code": null
}
```

---

### Get Post

Retrieve a single post by ID.

```http
GET /posts/:id
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Post ID (post_xxx format) |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "post": {
      "post_id": "post_5f47a1b2c9e1",
      "content": {
        "text": "Check out this amazing venue!",
        "hashtags": ["sports", "badminton"],
        "location": "Pune, Maharashtra"
      },
      "media": [...],
      "visibility": "public",
      "likes_count": 42,
      "comments_count": 5,
      "shares_count": 3,
      "created_at": "2024-01-15T10:30:00Z",
      "allow_comments": true
    },
    "author": {
      "user_id": "user_123",
      "full_name": "John Doe",
      "profile_image_url": "https://cdn.playmate.com/users/avatar.jpg",
      "username": "johndoe",
      "is_verified": true
    }
  },
  "error_code": null
}
```

---

### Update Post

Update post content (owner only).

```http
PUT /posts/:id
```

**Request Body:**
```json
{
  "content": {
    "text": "Updated caption text"
  },
  "visibility": "public",
  "allow_comments": true,
  "allow_shares": true
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "post_id": "post_5f47a1b2c9e1",
    "updated_at": "2024-01-15T12:00:00Z",
    "is_edited": true
  },
  "error_code": null
}
```

---

### Delete Post

Delete a post (owner only). Includes 30-second undo window.

```http
DELETE /posts/:id
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "deleted_at": "2024-01-15T12:00:00Z",
    "undo_until": "2024-01-15T12:00:30Z"
  },
  "error_code": null
}
```

---

### View Post

Increment view count for a post.

```http
POST /posts/:id/view
```

**Request Body:**
```json
{
  "watch_duration_ms": 5000
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "views_count": 156
  },
  "error_code": null
}
```

---

### Get User Posts

Get all posts for a specific user.

```http
GET /users/:id/posts
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Max items (max 50) |
| cursor | string | null | Pagination cursor |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "posts": [
      {
        "post_id": "post_5f47a1b2c9e1",
        "content": { "text": "My post" },
        "media": [...],
        "visibility": "public",
        "likes_count": 42,
        "comments_count": 5,
        "shares_count": 3,
        "created_at": "2024-01-15T10:30:00Z",
        "author": {
          "user_id": "user_123",
          "full_name": "John Doe",
          "profile_image_url": "https://cdn.playmate.com/avatar.jpg"
        }
      }
    ],
    "next_cursor": "YXNkZnNhZGZhc2Rm",
    "has_more": true
  },
  "error_code": null
}
```

---

### Search Posts

Search posts by hashtag.

```http
GET /posts/search?hashtag=sports
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| hashtag | string | Hashtag to search (without #) |
| limit | number | Max items (default 20, max 50) |
| cursor | string | Pagination cursor |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "posts": [...],
    "hashtag": "sports",
    "count": 150,
    "next_cursor": "..."
  },
  "error_code": null
}
```

---

### Get Posts by Location

Get posts near a geographic location.

```http
GET /posts/location?latitude=18.52&longitude=73.85&radius=10
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | number | Yes | Latitude coordinate |
| longitude | number | Yes | Longitude coordinate |
| radius | number | No | Radius in km (default 10) |
| limit | number | No | Max items (default 20) |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "posts": [...]
  },
  "error_code": null
}
```

---


## Reels API

### Generate Presigned Upload URL

Get a temporary upload URL for reel video/thumbnail files.

```http
POST /reels/presign
```

**Request Body:**
```json
{
  "file_name": "my_reel.mp4",
  "mime_type": "video/mp4",
  "size_bytes": 15728640,
  "purpose": "reel"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file_name | string | Yes | Original filename |
| mime_type | string | Yes | MIME type (video/mp4, image/jpeg) |
| size_bytes | number | No | File size in bytes |
| purpose | string | No | `reel` or `thumbnail` (default: reel) |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "upload_url": "https://s3.wasabisys.com/playmate-social/...",
    "file_url": "https://cdn.playmate.com/reels/...",
    "wasabi_url": "https://s3.wasabisys.com/playmate-social/...",
    "key": "reels/user123/reel_abc.mp4",
    "expires_in": 3600,
    "view_url_expires_in": 604800
  },
  "error_code": null
}
```

**Upload Flow:**
1. Call presign endpoint → receive `upload_url`
2. PUT file to `upload_url` with correct Content-Type header
3. Store returned `file_url` or `key` for reel creation

---

### Create Reel

Create a new short-form video reel.

```http
POST /reels/create
```

**Request Body:**
```json
{
  "video_url": "https://cdn.playmate.com/reels/reel_abc.mp4",
  "duration": 30000,
  "thumbnail_url": "https://cdn.playmate.com/thumbnails/thumb_abc.jpg",
  "aspect_ratio": "9:16",
  "caption": "My first reel! #playymate #reels",
  "hashtags": ["playymate", "reels", "fitness"],
  "mentions": ["user_id_1", "user_id_2"],
  "music": "Original Sound - Artist Name",
  "location": "Mumbai, Maharashtra",
  "visibility": "public",
  "allow_comments": true,
  "allow_duets": true,
  "allow_stitches": true,
  "video_file_key": "reels/user123/reel_abc.mp4",
  "thumbnail_file_key": "thumbnails/user123/thumb_abc.jpg"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| video_url | string | Yes | Full URL to video file |
| duration | number | No | Duration in milliseconds |
| thumbnail_url | string | No | Video thumbnail URL |
| aspect_ratio | string | No | Video aspect ratio (default: 9:16) |
| caption | string | No | Reel caption (max 500 chars) |
| hashtags | array | No | Array of hashtags (strings) |
| mentions | array | No | Array of user IDs to mention |
| music | string | No | Music/audio attribution |
| location | string | No | Location tag |
| visibility | string | No | `public`, `followers`, `private` |
| allow_comments | boolean | No | Allow comments (default: true) |
| allow_duets | boolean | No | Allow duets (default: false) |
| allow_stitches | boolean | No | Allow stitches (default: false) |
| video_file_key | string | No | Wasabi object key |
| thumbnail_file_key | string | No | Wasabi thumbnail key |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Reel created successfully",
  "data": {
    "reel_id": "reel_5f47a1b2c9e1",
    "created_at": "2024-01-15T10:30:00Z",
    "moderation_status": "pending"
  },
  "error_code": null
}
```

---

### Get Reel

Get single reel details (auto-tracks view).

```http
GET /reels/:id
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Reel ID |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "reel": {
      "reel_id": "reel_5f47a1b2c9e1",
      "video": {
        "url": "https://cdn.playmate.com/reels/reel_abc.mp4",
        "thumbnail_url": "https://cdn.playmate.com/thumbnails/thumb_abc.jpg",
        "duration": 30000,
        "aspect_ratio": "9:16"
      },
      "caption": "My first reel!",
      "hashtags": ["playymate", "reels"],
      "location": "Mumbai, Maharashtra",
      "visibility": "public",
      "likes_count": 150,
      "comments_count": 25,
      "shares_count": 10,
      "saves_count": 30,
      "views_count": 2500,
      "allow_comments": true,
      "allow_duets": true,
      "allow_stitches": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "author": {
      "user_id": "user_123",
      "full_name": "John Doe",
      "username": "johndoe",
      "profile_image_url": "https://cdn.playmate.com/avatar.jpg",
      "is_verified": true
    },
    "user_action": {
      "is_liked": false,
      "is_saved": false,
      "is_viewed": true
    }
  },
  "error_code": null
}
```

---

### Update Reel

Update reel metadata (owner only).

```http
PUT /reels/:id
```

**Request Body:**
```json
{
  "caption": "Updated caption",
  "hashtags": ["new", "hashtags"],
  "visibility": "public",
  "allow_comments": true
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Reel updated",
  "data": {
    "reel_id": "reel_5f47a1b2c9e1",
    "updated_at": "2024-01-15T12:00:00Z"
  },
  "error_code": null
}
```

---

### Delete Reel

Delete a reel (owner only).

```http
DELETE /reels/:id
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Reel deleted successfully",
  "error_code": null
}
```

---

### Track Reel View

Track a view event with watch duration.

```http
POST /reels/:id/view
```

**Request Body:**
```json
{
  "watch_duration_ms": 15000
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "views_count": 2501,
    "view_recorded": true
  },
  "error_code": null
}
```

---

### Get Explore Feed

Get personalized explore feed of trending reels.

```http
GET /reels/explore?limit=20&cursor=abc123
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Max items (max 50) |
| cursor | string | null | Pagination cursor |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "reels": [...],
    "next_cursor": "xyz789",
    "has_more": true
  },
  "error_code": null
}
```

---

### Get Trending Reels

Get top trending reels (last 7 days).

```http
GET /reels/trending?limit=20
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "reels": [
      {
        "reel_id": "reel_123",
        "caption": "Trending reel",
        "likes_count": 5000,
        "views_count": 50000,
        "rank": 1
      }
    ]
  },
  "error_code": null
}
```

---

### Search Reels

Search reels by text or hashtag.

```http
GET /reels/search?q=fitness
GET /reels/search?hashtag=fitness
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Free-text search in caption |
| hashtag | string | Search by hashtag (without #) |
| limit | number | Max items (default 20) |
| cursor | string | Pagination cursor |

**Note:** At least one of `q` or `hashtag` is required.

---

### Get User Reels

Get all reels for a specific user.

```http
GET /api/v1/users/:id/reels
```

Use `me` as ID to get authenticated user's reels:
```http
GET /api/v1/users/me/reels
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Max items (max 50) |
| cursor | string | null | Pagination cursor |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "reels": [...],
    "next_cursor": "...",
    "has_more": false
  },
  "error_code": null
}
```

---

### Get Reel Analytics

Get analytics for a reel (owner only).

```http
GET /reels/:id/analytics
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "reel_id": "reel_5f47a1b2c9e1",
    "period": "last_7_days",
    "metrics": {
      "views_count": 2500,
      "unique_viewers": 1800,
      "likes_count": 150,
      "comments_count": 25,
      "shares_count": 10,
      "saves_count": 30,
      "avg_watch_duration_ms": 18000,
      "completion_rate": 0.65
    },
    "demographics": {
      "by_age": {...},
      "by_gender": {...},
      "by_location": {...}
    }
  },
  "error_code": null
}
```

---

## Likes API

### Like Content

Like a post, reel, comment, or story.

```http
POST /likes
```

**Request Body:**
```json
{
  "content_type": "reel",
  "content_id": "reel_5f47a1b2c9e1",
  "reaction": "like"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content_type | string | Yes | `post`, `comment`, `reel`, `story` |
| content_id | string | Yes | ID of content to like |
| reaction | string | No | Reaction type: `like`, `love`, `haha`, `wow`, `sad`, `angry` |

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "like_id": "like_abc123",
    "content_type": "reel",
    "content_id": "reel_5f47a1b2c9e1",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "error_code": null
}
```

**Error (409) - Already Liked:**
```json
{
  "status": "error",
  "message": "Already liked",
  "error_code": "ALREADY_LIKED",
  "data": null
}
```

---

### Toggle Like

Toggle like status (like → unlike or unlike → like).

```http
POST /likes/toggle
```

**Request Body:**
```json
{
  "content_type": "reel",
  "content_id": "reel_5f47a1b2c9e1"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "liked": true,
    "like_id": "like_abc123"
  },
  "error_code": null
}
```

---

### Unlike Content

Remove a like by like ID.

```http
DELETE /likes/:id
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Like ID to remove |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "unliked": true
  },
  "error_code": null
}
```

---

### Hide Like

Hide your like from public like list.

```http
POST /likes/:id/hide
```

---

### Show Like

Make a hidden like visible again.

```http
POST /likes/:id/show
```

---

## Comments API

### Create Comment

Add a comment to a post or reel.

```http
POST /posts/:id/comments
POST /reels/:id/comments
```

**Request Body:**
```json
{
  "text": "Great post! 👍",
  "mentions": ["user_id_1"],
  "parent_comment_id": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| text | string | Comment text (max 500 chars) |
| mentions | array | User IDs to mention |
| parent_comment_id | string | For replies (nested, max 2 levels) |

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "comment_id": "comment_abc123",
    "post_id": "post_5f47a1b2c9e1",
    "text": "Great post! 👍",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "error_code": null
}
```

---

### Get Comments

Get comments on a post or reel.

```http
GET /posts/:id/comments
GET /reels/:id/comments
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Max comments |
| cursor | string | null | Pagination cursor |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "comments": [
      {
        "comment_id": "comment_abc123",
        "post_id": "post_5f47a1b2c9e1",
        "author": {
          "user_id": "user_123",
          "full_name": "John Doe",
          "profile_image_url": "https://cdn.playmate.com/avatar.jpg"
        },
        "text": "Great post!",
        "likes_count": 5,
        "replies_count": 2,
        "created_at": "2024-01-15T10:30:00Z",
        "parent_comment_id": null
      }
    ],
    "next_cursor": "...",
    "has_more": true
  },
  "error_code": null
}
```

---

### Reply to Comment

Reply to an existing comment.

```http
POST /comments/:id/reply
```

**Request Body:**
```json
{
  "text": "Thanks for the feedback!"
}
```

---

### Update Comment

Update a comment (owner only).

```http
PUT /comments/:id
```

**Request Body:**
```json
{
  "text": "Updated comment text"
}
```

---

### Delete Comment

Delete a comment (owner only).

```http
DELETE /comments/:id
```

---

### Get Comment Replies

Get replies to a specific comment.

```http
GET /comments/:id/replies
```

---

## Social Feed API

### Get Following Feed

Get personalized feed of posts and reels from followed users.

```http
GET /feed/following?limit=20&cursor=abc123
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Items per page (1-50) |
| cursor | string | null | Pagination cursor |

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "content_id": "post_123",
      "content_type": "post",
      "author": {
        "user_id": "user_123",
        "full_name": "John Doe",
        "profile_image_url": "https://cdn.playmate.com/avatar.jpg"
      },
      "content": {
        "text": "Check this out!",
        "hashtags": ["sports"]
      },
      "engagement": {
        "likes_count": 42,
        "comments_count": 5,
        "shares_count": 3,
        "saves_count": 2
      },
      "user_action": {
        "is_liked": false,
        "is_saved": false
      },
      "created_at": "2024-01-15T10:30:00Z",
      "personalization_score": 0.85
    },
    {
      "content_id": "reel_456",
      "content_type": "reel",
      "video": {
        "url": "https://cdn.playmate.com/reels/reel.mp4",
        "thumbnail_url": "https://cdn.playmate.com/thumb/thumb.jpg"
      },
      "engagement": {...},
      "created_at": "2024-01-15T09:00:00Z",
      "personalization_score": 0.72
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "cursor": "xyz789",
    "has_next": true
  },
  "error_code": null
}
```

---

### Get Explore Feed

Get discovery feed of posts/reels from users you don't follow.

```http
GET /feed/explore?limit=20&cursor=abc123
```

**Response includes `discovery_reason` field:**
```json
{
  "content_id": "reel_456",
  "content_type": "reel",
  "discovery_reason": "interest_match",
  "personalization_score": 0.65
}
```

---

### Get Trending Feed

Get globally trending posts and reels by engagement velocity.

```http
GET /feed/trending?time_period=week&limit=20
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| time_period | string | today | `today`, `week`, `month` |
| limit | number | 20 | Items per page |
| cursor | string | null | Pagination cursor |

**Response includes rank and trend_velocity:**
```json
{
  "content_id": "reel_456",
  "content_type": "reel",
  "rank": 1,
  "trend_velocity": "high",
  "engagement": {
    "likes_count": 5000,
    "comments_count": 250,
    "shares_count": 100
  }
}
```

---

### Update Feed Preferences

Update personalization settings.

```http
PUT /feed/preferences
```

**Request Body:**
```json
{
  "follow_suggestions": true,
  "exclude_hashtags": ["politics", "nsfw"],
  "preferred_content_types": ["posts", "reels"],
  "mute_notifications_from": ["user_id_1"],
  "algorithm_opt_in": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| follow_suggestions | boolean | Show follow suggestions |
| exclude_hashtags | array | Hashtags to hide |
| preferred_content_types | array | `posts` and/or `reels` |
| mute_notifications_from | array | User IDs to silence |
| algorithm_opt_in | boolean | Enable personalized ranking |

---

### Refresh Social Feed

Manually clear feed cache to generate fresh content.

```http
POST /feed/social/refresh
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "cleared": true
  },
  "error_code": null
}
```

---

### Get Creator Analytics

Get content performance analytics for your posts/reels (last 7 days).

```http
GET /feed/analytics/performance
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "period": "last_7_days",
    "content_performance": [
      {
        "content_id": "post_123",
        "content_type": "post",
        "impressions": 1500,
        "clicks": 45,
        "saves": 12,
        "shares": 8,
        "ctr": 3.0,
        "engagement_rate": 4.3,
        "reach": 1200,
        "reach_followers": 800,
        "reach_non_followers": 400
      }
    ],
    "follower_activity": {
      "new_followers": 25,
      "engaged_followers": 150,
      "inactive_followers": 45
    },
    "insights": [
      {
        "type": "best_time_to_post",
        "value": "6PM - 9PM",
        "confidence": 0.75
      },
      {
        "type": "best_content_type",
        "value": "reels",
        "confidence": 0.68
      }
    ]
  },
  "error_code": null
}
```

---

## Media Upload API

### Posts Media - Generate Presigned Upload URL

Get upload URL for post media files (images/videos) specifically for posts.

```http
POST /posts/media/presign
```

**Request Body:**
```json
{
  "filename": "photo.jpg",
  "mime_type": "image/jpeg",
  "type": "image"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| filename | string | Yes | Original filename |
| mime_type | string | Yes | MIME type (image/jpeg, image/png, video/mp4) |
| type | string | Yes | `image` or `video` |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "upload_url": "https://s3.wasabisys.com/playmate-social/...",
    "file_key": "posts/user123/photo_abc123.jpg",
    "file_url": "https://cdn.playmate.com/posts/user123/photo_abc123.jpg",
    "wasabi_url": "https://s3.wasabisys.com/playmate-social/posts/user123/photo_abc123.jpg",
    "expires_in": 3600
  },
  "error_code": null
}
```

---

### Posts Media - Confirm Upload

Confirm media upload after file is uploaded to presigned URL.

```http
POST /posts/media/confirm
```

**Request Body:**
```json
{
  "post_id": "post_abc123",
  "file_key": "posts/user123/photo_abc123.jpg",
  "type": "image",
  "width": 1920,
  "height": 1080,
  "original_filename": "photo.jpg",
  "mime_type": "image/jpeg",
  "file_size": 1048576
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| post_id | string | No | Associated post ID |
| file_key | string | Yes | Wasabi object key |
| type | string | Yes | `image` or `video` |
| width | number | No | Image width in pixels |
| height | number | No | Image height in pixels |
| duration | number | No | Video duration in ms |
| original_filename | string | No | Original filename |
| mime_type | string | No | MIME type |
| file_size | number | No | File size in bytes |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "media_id": "media_abc123",
    "file_key": "posts/user123/photo_abc123.jpg",
    "file_url": "https://cdn.playmate.com/posts/user123/photo_abc123.jpg",
    "confirmed": true
  },
  "error_code": null
}
```

---

### Generic Media Upload API

Generate presigned upload URL for general media files (images/videos).

```http
POST /media/presign
```

**Request Body:**
```json
{
  "file_name": "photo.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 1048576,
  "purpose": "post"
}
```

| Field | Type | Required | Description |
|---------|------|----------|-------------|
| file_name | string | Yes | Original filename |
| mime_type | string | Yes | MIME type |
| size_bytes | number | No | File size |
| purpose | string | No | `post`, `reel`, `story`, `avatar` |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "upload_url": "https://s3.wasabisys.com/playmate-social/...",
    "file_url": "https://cdn.playmate.com/...",
    "key": "posts/user123/photo.jpg",
    "expires_in": 3600
  },
  "error_code": null
}
```

---

### Confirm Generic Upload

Confirm media upload after file is uploaded to presigned URL.

```http
POST /media/confirm
```

**Request Body:**
```json
{
  "key": "posts/user123/photo.jpg",
  "file_url": "https://cdn.playmate.com/photo.jpg",
  "purpose": "post"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "media_id": "media_abc123",
    "confirmed": true
  },
  "error_code": null
}
```

---

## Error Codes

### Common Error Response Format
```json
{
  "status": "error",
  "message": "Human readable error message",
  "error_code": "ERROR_CODE_NAME",
  "data": null
}
```

### Posts & Reels Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| POST_NOT_FOUND | 404 | Post does not exist |
| POST_ACCESS_DENIED | 403 | Not authorized to access post |
| REEL_NOT_FOUND | 404 | Reel does not exist |
| REEL_DELETED | 410 | Reel has been deleted |
| REEL_ACCESS_DENIED | 403 | Not authorized to modify reel |
| TEXT_TOO_LONG | 400 | Text exceeds character limit |
| INVALID_MEDIA | 400 | Invalid media format or count |
| MISSING_VIDEO_URL | 400 | Video URL required for reel |
| MISSING_FIELDS | 400 | Required fields missing |
| INVALID_PURPOSE | 400 | Invalid upload purpose |
| PRESIGN_FAILED | 500 | Failed to generate upload URL |
| MEDIA_CONFIG_MISSING | 500 | Media storage not configured |
| POST_CREATION_FAILED | 500 | Internal error creating post |
| POST_UPDATE_FAILED | 500 | Internal error updating post |
| POST_DELETE_FAILED | 500 | Internal error deleting post |
| REEL_CREATION_FAILED | 500 | Internal error creating reel |
| INTERNAL_ERROR | 500 | Generic server error |

### Likes Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| ALREADY_LIKED | 409 | Content already liked |
| NOT_LIKED | 400 | Cannot unlike - not liked |
| CONTENT_NOT_FOUND | 404 | Target content not found |

### Comments Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| COMMENT_NOT_FOUND | 404 | Comment not found |
| INVALID_NESTING | 400 | Cannot reply to reply (max 2 levels) |
| COMMENT_TOO_LONG | 400 | Comment exceeds 500 chars |

### Feed Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| MISSING_SEARCH_QUERY | 400 | Search query required |
| INVALID_TIME_PERIOD | 400 | Invalid trending time period |

### Auth Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| AUTH_REQUIRED | 401 | Authentication required |
| TOKEN_EXPIRED | 401 | JWT token expired |
| INVALID_TOKEN | 401 | Invalid JWT token |
| ONBOARDING_INCOMPLETE | 403 | User hasn't completed onboarding |
| USER_SUSPENDED | 403 | User account suspended |

---

## Integration Flow

### Complete Integration Flow for Creating and Viewing a Reel

#### Step 1: Authenticate User
```bash
# 1.1 Send OTP
curl -X POST https://api.playmate.com/api/v1/auth/phone/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919045676543"}'

# Response: { "auth_flow_id": "flow_xxx", "debug_otp": "123456" }

# 1.2 Verify OTP
curl -X POST https://api.playmate.com/api/v1/auth/phone/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"auth_flow_id": "flow_xxx", "otp": "123456", "phone": "+919045676543"}'

# Response: { "auth_flow_id": "flow_xxx", "verified": true }

# 1.3 Complete Login
curl -X POST https://api.playmate.com/api/v1/auth/complete \
  -H "Content-Type: application/json" \
  -d '{"auth_flow_id": "flow_xxx", "device_info": {"device_id": "device-001"}}'

# Response: { "data": { "access_token": "eyJ...", "refresh_token": "..." } }
```

#### Step 2: Upload Video File
```bash
# 2.1 Get presigned upload URL
curl -X POST https://api.playmate.com/api/v1/reels/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"file_name": "my_reel.mp4", "mime_type": "video/mp4", "size_bytes": 15728640, "purpose": "reel"}'

# Response: { "data": { "upload_url": "https://...", "key": "reels/user/reel.mp4" } }

# 2.2 Upload file to presigned URL
curl -X PUT "https://s3.wasabisys.com/..." \
  -H "Content-Type: video/mp4" \
  --data-binary @my_reel.mp4

# 2.3 (Optional) Upload thumbnail
curl -X POST https://api.playmate.com/api/v1/reels/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"file_name": "thumb.jpg", "mime_type": "image/jpeg", "purpose": "thumbnail"}'
```

#### Step 3: Create Reel
```bash
curl -X POST https://api.playmate.com/api/v1/reels/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "video_url": "https://cdn.playmate.com/reels/reel.mp4",
    "duration": 30000,
    "thumbnail_url": "https://cdn.playmate.com/thumbnails/thumb.jpg",
    "caption": "My first reel! #playymate",
    "hashtags": ["playymate", "reels"],
    "visibility": "public",
    "allow_comments": true
  }'

# Response: { "data": { "reel_id": "reel_xxx", "moderation_status": "pending" } }
```

#### Step 4: Interact with Reel
```bash
# 4.1 Like the reel
curl -X POST https://api.playmate.com/api/v1/likes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"content_type": "reel", "content_id": "reel_xxx", "reaction": "love"}'

# 4.2 Add comment
curl -X POST https://api.playmate.com/api/v1/reels/reel_xxx/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"text": "Amazing content!"}'

# 4.3 View the reel (tracks view)
curl -X POST https://api.playmate.com/api/v1/reels/reel_xxx/view \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"watch_duration_ms": 15000}'
```

#### Step 5: Get Feed
```bash
# 5.1 Get following feed
curl -X GET "https://api.playmate.com/api/v1/feed/following?limit=20" \
  -H "Authorization: Bearer <access_token>"

# 5.2 Get explore feed
curl -X GET "https://api.playmate.com/api/v1/feed/explore?limit=20" \
  -H "Authorization: Bearer <access_token>"

# 5.3 Get trending
curl -X GET "https://api.playmate.com/api/v1/feed/trending?time_period=week" \
  -H "Authorization: Bearer <access_token>"
```

---

### Complete Integration Flow for Creating a Post

#### Step 1: Authenticate (same as above)

#### Step 2: Upload Media (optional)
```bash
# Get presigned URL
curl -X POST https://api.playmate.com/api/v1/media/presign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"file_name": "photo.jpg", "mime_type": "image/jpeg", "purpose": "post"}'

# Upload file
curl -X PUT "<upload_url>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @photo.jpg

# Confirm upload
curl -X POST https://api.playmate.com/api/v1/media/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"key": "posts/user/photo.jpg", "file_url": "https://cdn.playmate.com/photo.jpg", "purpose": "post"}'
```

#### Step 3: Create Post
```bash
curl -X POST https://api.playmate.com/api/v1/posts/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "content": {
      "text": "Check out this venue! #badminton #sports",
      "location": "Pune, Maharashtra"
    },
    "media": [
      {
        "type": "image",
        "url": "https://cdn.playmate.com/photo.jpg",
        "file_key": "posts/user/photo.jpg"
      }
    ],
    "visibility": "public",
    "allow_comments": true,
    "allow_shares": true
  }'

# Response: { "data": { "post_id": "post_xxx", "moderation_status": "approved" } }
```

---

### Pagination

All list endpoints support cursor-based pagination:

```bash
# First request
GET /feed/following?limit=20
# Response: { "data": [...], "pagination": { "cursor": "abc123", "has_next": true } }

# Next page
GET /feed/following?limit=20&cursor=abc123
```

---

### WebSocket Events (Optional Real-time)

For real-time updates, subscribe to these events:

| Event | Description |
|-------|-------------|
| `new_post` | New post from followed user |
| `new_reel` | New reel from followed user |
| `like_added` | Someone liked your content |
| `comment_added` | New comment on your content |
| `follow` | New follower |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST /posts/create | 10/minute |
| POST /reels/create | 10/minute |
| POST /likes | 60/minute |
| GET /feed/* | 60/minute |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial release |
| 1.1.0 | 2024-02-01 | Added trending feed, analytics |
| 1.2.0 | 2024-03-01 | Added reel duets/stitches support |

---

## Support

- API Support: api-support@playmate.com
- Documentation: docs.playmate.com
- Status Page: status.playmate.com
