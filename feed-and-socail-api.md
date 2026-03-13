Playymate Social & Feed Module API Documentation
Table of Contents
Overview
Authentication & Authorization
Common Data Types
Common Error Codes
Feed Module
Posts Module
Comments Module
Media Module
Reels Module
Stories Module
Likes Module
Block & Mute Module

Overview
The Playymate Social & Feed Module provides APIs for social interactions including:
Feed: Personalized home feed, suggested follows, nearby venues
Posts: Create, read, update, delete posts with text, media, and location
Comments: Comment on posts, reply to comments
Media: Presigned upload URLs for images/videos
Reels: Short-form video content (permanent)
Stories: 24-hour expiring content with highlights
Likes: Like/react to posts, comments, and reels
Block & Mute: User blocking and muting functionality
Base URL
{{base_url}}/api/v1

Default Headers
Header
Value
Content-Type
application/json
Authorization
Bearer {{access_token}}


Authentication & Authorization
All endpoints require authentication via JWT Bearer token.
Required Middleware
userAuth - Validates JWT token and attaches user to req.user
featureGate - Validates onboarding state:
Posts/Comments/Media/Feed: minOnboardingState: 'COMPLETED'
Reels/Stories/Likes: minOnboardingState: 'ACTIVE_USER', blockSuspended: true
Onboarding States
STARTED - User has begun onboarding
PHYSICAL_PROFILE_COMPLETED - Physical profile completed
COMPLETED - Full onboarding completed
ACTIVE_USER - User is active on the platform

Common Data Types
Pagination Response
{
  "status": "success",
  "data": {
    "items": [...],
    "next_cursor": "base64_encoded_cursor",
    "has_more": true
  }
}

Error Response
{
  "status": "error",
  "message": "Human readable error message",
  "error_code": "ERROR_CODE",
  "data": null
}

User Object
{
  "user_id": "string",
  "full_name": "string",
  "username": "string",
  "profile_image_url": "string",
  "is_verified": boolean
}

Media Item
{
  "type": "image" | "video",
  "url": "string",
  "thumbnail_url": "string | null",
  "duration": "number (seconds)",
  "width": "number",
  "height": "number"
}

Location
{
  "display_text": "string",
  "latitude": "number (-90 to 90)",
  "longitude": "number (-180 to 180)"
}


Common Error Codes
Error Code
HTTP Status
Description
POST_NOT_FOUND
404
Post does not exist
POST_ACCESS_DENIED
403
User not authorized to perform action
COMMENT_NOT_FOUND
404
Comment does not exist
COMMENT_ACCESS_DENIED
403
User not authorized to edit/delete comment
TEXT_TOO_LONG
400
Text exceeds character limit
INVALID_MEDIA
400
Invalid media configuration
POST_COMMENTS_DISABLED
403
Comments disabled on post
EDIT_WINDOW_CLOSED
409
Edit window (5 min) has closed
USER_NOT_FOUND
404
User does not exist
ALREADY_BLOCKED
409
User already blocked
NOT_BLOCKED
404
User is not blocked
ALREADY_MUTED
409
User already muted
NOT_MUTED
404
User is not muted
CANNOT_BLOCK_SELF
400
Cannot block yourself
CANNOT_MUTE_SELF
400
Cannot mute yourself


Feed Module
Base path: /api/v1/feed
Get Home Feed
Get personalized home feed with venues, events, and friend activity
Endpoint
GET /api/v1/feed

Query Parameters
Parameter
Type
Required
Default
Description
limit
integer
No
20
Number of items (max 50)
cursor
string
No
null
Pagination cursor

Success Response (200)
{
  "status": "success",
  "data": {
    "items": [
      {
        "type": "venue" | "event" | "friend_activity" | "post",
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
        }
      ]
    },
    "next_cursor": "abc123",
    "has_more": true
  },
  "error_code": null
}

Error Responses
401 Unauthorized: Missing or invalid token

Get Suggested Follows
Get suggested users to follow based on interests and connections
Endpoint
GET /api/v1/feed/suggested-follows

Success Response (200)
{
  "status": "success",
  "data": {
    "items": [
      {
        "user_id": "string",
        "full_name": "string",
        "username": "string",
        "profile_image_url": "string",
        "mutual_connections": 5,
        "reason": "similar_interests"
      }
    ]
  },
  "error_code": null
}


Get Nearby Venues
Get nearby venues based on user's location
Endpoint
GET /api/v1/feed/nearby-venues

Success Response (200)
{
  "status": "success",
  "data": {
    "items": [
      {
        "venue_id": "string",
        "name": "string",
        "address": "string",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "distance_km": 1.5,
        "activity_types": ["badminton", "tennis"],
        "rating": 4.5,
        "image_url": "string"
      }
    ]
  },
  "error_code": null
}


Refresh Feed Cache
Invalidate feed cache to get fresh content on next request
Endpoint
POST /api/v1/feed/refresh

Success Response (200)
{
  "status": "success",
  "message": "Feed cache invalidated",
  "data": null,
  "error_code": null
}


Posts Module
Base path: /api/v1/posts
Create Post
Create a new post with text, media, visibility settings
Endpoint
POST /api/v1/posts/create

Headers
Header
Value
Content-Type
application/json

Request Body
{
  "content": {
    "text": "Great session at the court today! 🎾",
    "location": {
      "display_text": "HSR Layout, Bangalore",
      "latitude": 12.9716,
      "longitude": 77.5946
    }
  },
  "media": [
    {
      "type": "image",
      "url": "https://...",
      "thumbnail_url": null,
      "duration": null,
      "width": 1920,
      "height": 1080
    }
  ],
  "visibility": "public",
  "allow_comments": true,
  "allow_shares": true,
  "linked_activity": {
    "type": "booking",
    "activity_id": "booking_abc123",
    "activity_details": {
      "name": "Badminton Match",
      "category": "sports",
      "venue_name": "Sports Complex",
      "date": "2025-01-15",
      "duration": "2 hours"
    }
  }
}

Validation Rules
Field
Rules
content.text
Max 500 characters
media
Max 5 items (1 video max)
visibility
public, followers_only, private
linked_activity.type
booking, badge, event, challenge

Success Response (201)
{
  "status": "success",
  "data": {
    "post_id": "post_abc123",
    "created_at": "2025-01-15T10:30:00.000Z",
    "moderation_status": "approved"
  },
  "error_code": null
}

Error Responses
400 Bad Request: Text too long, invalid media count
401 Unauthorized: Not authenticated
403 Forbidden: Onboarding not completed

Get Post by ID
Get a post by ID with author details and engagement counts
Endpoint
GET /api/v1/posts/:id

Path Parameters
Parameter
Type
Description
id
string
Post ID

Success Response (200)
{
  "status": "success",
  "data": {
    "post": {
      "post_id": "post_abc123",
      "content": {
        "text": "Great session at the court today! 🎾",
        "location": null
      },
      "media": [],
      "visibility": "public",
      "likes_count": 42,
      "comments_count": 15,
      "shares_count": 3,
      "created_at": "2025-01-15T10:30:00.000Z",
      "is_auto_generated": false,
      "allow_comments": true
    },
    "author": {
      "user_id": "user_123",
      "full_name": "John Doe",
      "profile_image_url": "https://...",
      "username": "johndoe",
      "is_verified": true
    }
  },
  "error_code": null
}

Error Responses
404 Not Found: Post not found
403 Forbidden: Access denied (private post)

Update Post
Update a post's content and settings (author only)
Endpoint
PUT /api/v1/posts/:id

Request Body
{
  "content": {
    "text": "Updated post content!"
  },
  "visibility": "public",
  "allow_comments": true,
  "allow_shares": true
}

Success Response (200)
{
  "status": "success",
  "data": {
    "post_id": "post_abc123",
    "updated_at": "2025-01-15T12:00:00.000Z",
    "is_edited": true
  },
  "error_code": null
}


Delete Post
Delete a post (author only). Returns undo window info.
Endpoint
DELETE /api/v1/posts/:id

Success Response (200)
{
  "status": "success",
  "data": {
    "deleted_at": "2025-01-15T12:00:00.000Z",
    "undo_until": "2025-01-15T12:05:00.000Z"
  },
  "error_code": null
}


Search Posts by Hashtag
Search posts by hashtag
Endpoint
GET /api/v1/posts/search

Query Parameters
Parameter
Type
Required
Description
hashtag
string
Yes
Hashtag to search (without #)
limit
integer
No
Max results (default 20, max 50)
cursor
string
No
Pagination cursor

Success Response (200)
{
  "status": "success",
  "data": {
    "posts": [
      {
        "post_id": "post_abc123",
        "content": { "text": "..." },
        "media": [],
        "likes_count": 42,
        "comments_count": 15,
        "created_at": "2025-01-15T10:30:00.000Z",
        "author": {
          "user_id": "user_123",
          "full_name": "John Doe",
          "profile_image_url": "https://..."
        }
      }
    ],
    "hashtag": "badminton",
    "count": 150,
    "next_cursor": "abc123"
  },
  "error_code": null
}


Get Posts by Location
Get posts within a certain radius of a location
Endpoint
GET /api/v1/posts/location

Query Parameters
Parameter
Type
Required
Description
latitude
number
Yes
Latitude (-90 to 90)
longitude
number
Yes
Longitude (-180 to 180)
radius
number
No
Radius in km (default 10, max 100)
limit
integer
No
Max results (default 20, max 50)

Success Response (200)
{
  "status": "success",
  "data": {
    "posts": [
      {
        "post_id": "post_abc123",
        "content": { "text": "..." },
        "media": [],
        "likes_count": 42,
        "comments_count": 15,
        "created_at": "2025-01-15T10:30:00.000Z",
        "author": { ... }
      }
    ]
  },
  "error_code": null
}


Get User Posts
Get posts by a specific user
Endpoint
GET /api/v1/users/:id/posts

Path Parameters
Parameter
Type
Description
id
string
User ID

Query Parameters
Parameter
Type
Required
Default
limit
integer
No
20
cursor
string
No
null

Success Response (200)
{
  "status": "success",
  "data": {
    "posts": [...],
    "next_cursor": "abc123",
    "has_more": true
  },
  "error_code": null
}


Accept Auto-Generated Post
Accept an AI-generated post suggestion
Endpoint
POST /api/v1/posts/:id/accept-auto

Success Response (200)
{
  "status": "success",
  "data": {
    "post_id": "post_abc123",
    "user_accepted": true
  },
  "error_code": null
}


Decline Auto-Generated Post
Decline/remove an AI-generated post suggestion
Endpoint
DELETE /api/v1/posts/:id/decline-auto

Success Response (200)
{
  "status": "success",
  "data": {
    "declined": true
  },
  "error_code": null
}


Comments Module
Base path: /api/v1/comments or /api/v1/posts/:postId/comments
Create Comment on Post
Create a comment on a post
Endpoint
POST /api/v1/posts/:postId/comments

Request Body
{
  "text": "Great shot! 🔥",
  "mention_tags": [
    {
      "user_id": "user_123",
      "username": "johndoe",
      "display_name": "John"
    }
  ]
}

Validation Rules
Field
Rules
text
Required, 1-300 characters
mention_tags
Max 10 items

Success Response (201)
{
  "status": "success",
  "data": {
    "comment_id": "comment_abc123",
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  "error_code": null
}

Error Responses
400 Bad Request: Empty text, text too long
404 Not Found: Post not found
403 Forbidden: Comments disabled on post

Get Post Comments
Get comments on a post
Endpoint
GET /api/v1/posts/:postId/comments

Query Parameters
Parameter
Type
Required
Default
Description
limit
integer
No
20
Max results (max 50)
cursor
string
No
null
Pagination cursor
sort_by
string
No
recent
Sort: recent, most_liked

Success Response (200)
{
  "status": "success",
  "data": {
    "comments": [
      {
        "comment_id": "comment_abc123",
        "text": "Great shot! 🔥",
        "author": {
          "user_id": "user_123",
          "full_name": "John Doe",
          "profile_image_url": "https://...",
          "username": "johndoe"
        },
        "likes_count": 5,
        "replies_count": 2,
        "created_at": "2025-01-15T10:30:00.000Z",
        "edited_at": null,
        "is_pinned": false,
        "replies": [
          {
            "comment_id": "reply_abc123",
            "text": "Thanks!",
            "author": { ... },
            "likes_count": 1,
            "created_at": "2025-01-15T10:35:00.000Z"
          }
        ]
      }
    ],
    "total_count": 42,
    "next_cursor": "abc123"
  },
  "error_code": null
}


Reply to Comment
Reply to a comment (cannot reply to a reply)
Endpoint
POST /api/v1/comments/:commentId/reply

Request Body
{
  "text": "Thanks for the feedback!"
}

Success Response (201)
{
  "status": "success",
  "data": {
    "comment_id": "reply_abc123",
    "created_at": "2025-01-15T10:35:00.000Z"
  },
  "error_code": null
}

Error Responses
400 Bad Request: Cannot reply to a reply

Update Comment
Update a comment (edit window: 5 minutes)
Endpoint
PUT /api/v1/comments/:commentId

Request Body
{
  "text": "Updated comment text"
}

Success Response (200)
{
  "status": "success",
  "data": {
    "comment_id": "comment_abc123",
    "updated_at": "2025-01-15T10:40:00.000Z",
    "is_edited": true
  },
  "error_code": null
}

Error Responses
409 Conflict: Edit window has closed (5 minutes)

Delete Comment
Delete a comment (author or post owner can delete)
Endpoint
DELETE /api/v1/comments/:commentId

Success Response (200)
{
  "status": "success",
  "data": {
    "deleted": true
  },
  "error_code": null
}


Get Comment Replies
Get replies to a comment
Endpoint
GET /api/v1/comments/:commentId/replies

Query Parameters
Parameter
Type
Required
Default
limit
integer
No
10
cursor
string
No
null

Success Response (200)
{
  "status": "success",
  "data": {
    "comments": [
      {
        "comment_id": "reply_abc123",
        "text": "Thanks!",
        "author": { ... },
        "likes_count": 1,
        "created_at": "2025-01-15T10:35:00.000Z"
      }
    ],
    "next_cursor": "abc123"
  },
  "error_code": null
}


Media Module
Base path: /api/v1/posts/media
Presign Media Upload
Generate presigned URL for uploading media (images/videos)
Endpoint
POST /api/v1/posts/media/presign

Request Body
{
  "filename": "post_image.jpg",
  "mime_type": "image/jpeg",
  "type": "image"
}

Validation Rules
Field
Required
Description
filename
Yes
Original file name
mime_type
Yes
MIME type (image/jpeg, video/mp4, etc.)
type
Yes
image or video

Success Response (200)
{
  "status": "success",
  "data": {
    "upload_url": "https://wasabi.../put URL",
    "file_url": "https://wasabi.../get URL (7-day)",
    "wasabi_url": "https://wasabi.../direct URL",
    "key": "media/user123/timestamp_filename.jpg",
    "expires_in": 300,
    "view_url_expires_in": 604800
  },
  "error_code": null
}

Upload Flow
Request presign URL
Upload file directly to upload_url using PUT method
Use returned file_url when creating post

Confirm Media Upload
Confirm media upload after file is uploaded to storage
Endpoint
POST /api/v1/posts/media/confirm

Request Body
{
  "post_id": "post_abc123",
  "file_key": "media/user123/timestamp_filename.jpg",
  "type": "image",
  "width": 1920,
  "height": 1080,
  "duration": null,
  "original_filename": "post_image.jpg",
  "mime_type": "image/jpeg",
  "file_size": 204800
}

Success Response (200)
{
  "status": "success",
  "data": {
    "media_id": "media_abc123",
    "file_key": "media/user123/timestamp_filename.jpg",
    "url": "https://wasabi.../get URL",
    "type": "image"
  },
  "error_code": null
}


Reels Module
Base path: /api/v1/reels
Presign Reel Upload
Generate presigned upload URL for reel video or thumbnail
Endpoint
POST /api/v1/reels/presign

Request Body (Video)
{
  "file_name": "my_reel.mp4",
  "mime_type": "video/mp4",
  "size_bytes": 10485760,
  "purpose": "reel"
}

Request Body (Thumbnail)
{
  "file_name": "thumb.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 204800,
  "purpose": "thumbnail"
}

Validation
purpose: reel | thumbnail (default: reel)
URL valid for 5 minutes
View URL valid for 7 days
Success Response (200)
{
  "status": "success",
  "data": {
    "upload_url": "https://wasabi.../put URL",
    "file_url": "https://wasabi.../7-day signed GET URL",
    "wasabi_url": "https://wasabi.../direct URL",
    "key": "reels/user123/timestamp_my_reel.mp4",
    "expires_in": 300,
    "view_url_expires_in": 604800
  },
  "error_code": null
}


Create Reel
Create a new reel with video URL from presign
Endpoint
POST /api/v1/reels/create

Request Body
{
  "video_url": "https://wasabi.../file_url_from_presign",
  "duration": 30,
  "thumbnail_url": "https://wasabi.../thumbnail_url",
  "aspect_ratio": "9:16",
  "title": "Epic Badminton Shot",
  "caption": "Smash of the century! #badminton #sports",
  "hashtags": ["badminton", "sports", "playymate"],
  "mentions": ["user_123"],
  "visibility": "public",
  "allow_comments": true,
  "allow_duets": false,
  "allow_stitches": false
}

Validation Rules
Field
Rules
video_url
Required, valid URL from presign
duration
Required, max 60 seconds
caption
Max 2200 characters
hashtags
Max 30 hashtags
visibility
public, followers_only, private

Success Response (201)
{
  "status": "success",
  "data": {
    "reel_id": "reel_abc123",
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  "error_code": null
}


Get Reel by ID
Get reel details (auto-tracks view on first view)
Endpoint
GET /api/v1/reels/:id

Success Response (200)
{
  "status": "success",
  "data": {
    "reel_id": "reel_abc123",
    "video_url": "https://...",
    "thumbnail_url": "https://...",
    "caption": "Smash of the century! #badminton #sports",
    "hashtags": ["badminton", "sports", "playymate"],
    "likes_count": 1000,
    "comments_count": 50,
    "views_count": 5000,
    "duration": 30,
    "aspect_ratio": "9:16",
    "visibility": "public",
    "allow_comments": true,
    "allow_duets": false,
    "allow_stitches": false,
    "created_at": "2025-01-15T10:30:00.000Z",
    "author": { ... }
  },
  "error_code": null
}


Update Reel
Update reel metadata (caption, hashtags)
Endpoint
PUT /api/v1/reels/:id

Request Body
{
  "caption": "Updated caption! #badminton #epic",
  "hashtags": ["badminton", "epic"],
  "visibility": "public",
  "allow_comments": true
}

Success Response (200)
{
  "status": "success",
  "data": {
    "reel_id": "reel_abc123",
    "updated_at": "2025-01-15T12:00:00.000Z"
  },
  "error_code": null
}


Track View (with watch duration)
Track a view event with watch duration
Endpoint
POST /api/v1/reels/:id/view

Request Body
{
  "watch_duration_ms": 15000
}

Success Response (200)
{
  "status": "success",
  "data": {
    "view_recorded": true
  },
  "error_code": null
}


Get Reel Analytics
Get reel analytics (owner only)
Endpoint
GET /api/v1/reels/:id/analytics

Success Response (200)
{
  "status": "success",
  "data": {
    "reel_id": "reel_abc123",
    "likes_count": 1000,
    "comments_count": 50,
    "views_count": 5000,
    "avg_watch_time_percent": 75,
    "engagement_rate": 8.5
  },
  "error_code": null
}


Explore Feed (Personalized)
Get personalized explore feed
Endpoint
GET /api/v1/reels/explore

Query Parameters
Parameter
Type
Required
Default
limit
integer
No
20
cursor
string
No
null

Success Response (200)
{
  "status": "success",
  "data": {
    "reels": [...],
    "next_cursor": "abc123",
    "has_more": true
  },
  "error_code": null
}


Trending Reels
Get top trending reels (last 7 days)
Endpoint
GET /api/v1/reels/trending

Query Parameters
Parameter
Type
Required
Default
limit
integer
No
20

Success Response (200)
{
  "status": "success",
  "data": {
    "reels": [...]
  },
  "error_code": null
}


Search Reels
Search reels by text or hashtag
Endpoint
GET /api/v1/reels/search

Query Parameters
Parameter
Type
Description
q
string
Free-text search in caption
hashtag
string
Search by hashtag (without #)
limit
integer
Max results (default 20)

Examples
GET /api/v1/reels/search?q=badminton
GET /api/v1/reels/search?hashtag=sports


Delete Reel
Delete a reel (owner only, soft-delete)
Endpoint
DELETE /api/v1/reels/:id

Success Response (200)
{
  "status": "success",
  "data": {
    "deleted": true
  },
  "error_code": null
}


Stories Module
Base path: /api/v1/stories
Presign Story Upload
Generate presigned upload URL for story image/video or thumbnail
Endpoint
POST /api/v1/stories/presign

Request Body
{
  "file_name": "my_story.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 512000,
  "purpose": "story"
}

Purpose Values
story - Main story media
story_thumbnail - Video thumbnail
Success Response (200)
{
  "status": "success",
  "data": {
    "upload_url": "https://wasabi.../put URL",
    "file_url": "https://wasabi.../7-day signed GET URL",
    "wasabi_url": "https://wasabi.../direct URL",
    "key": "stories/user123/timestamp_my_story.jpg",
    "expires_in": 300,
    "view_url_expires_in": 604800
  },
  "error_code": null
}


Create Story
Create a new story (expires in 24 hours)
Endpoint
POST /api/v1/stories/create

Request Body
{
  "media_url": "https://wasabi.../file_url",
  "media_type": "image",
  "duration": null,
  "thumbnail_url": null,
  "caption": "Morning session at the court!",
  "visibility": "public",
  "overlays": [
    {
      "type": "text",
      "content": "Let's play!",
      "position": { "x": 50, "y": 80 },
      "font_size": 24,
      "color": "#FFFFFF"
    }
  ],
  "music_track_id": "track_001",
  "activity_link": "booking_abc123"
}

Overlay Types
text - Text overlay
location - Location tag
sticker - Emoji/sticker
mention - User mention
Visibility Options
public - Everyone
followers_only - Followers only
close_friends - Close friends list
Success Response (201)
{
  "status": "success",
  "data": {
    "story_id": "story_abc123",
    "expires_at": "2025-01-16T10:30:00.000Z",
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  "error_code": null
}


Get Story Feed
Get story feed from followed users
Endpoint
GET /api/v1/stories/feed

Query Parameters
Parameter
Type
Required
Default
limit
integer
No
20
cursor
string
No
null

Success Response (200)
{
  "status": "success",
  "data": {
    "stories": [
      {
        "story_id": "story_abc123",
        "media_url": "https://...",
        "media_type": "image",
        "caption": "Morning session!",
        "created_at": "2025-01-15T10:30:00.000Z",
        "expires_at": "2025-01-16T10:30:00.000Z",
        "author": { ... },
        "viewers_count": 10,
        "has_been_viewed": false
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  },
  "error_code": null
}


Get Story by ID
Get a single story (marks as viewed)
Endpoint
GET /api/v1/stories/:id

Success Response (200)
{
  "status": "success",
  "data": {
    "story_id": "story_abc123",
    "media_url": "https://...",
    "media_type": "image",
    "caption": "Morning session!",
    "overlays": [...],
    "created_at": "2025-01-15T10:30:00.000Z",
    "expires_at": "2025-01-16T10:30:00.000Z",
    "author": { ... },
    "has_been_viewed": true
  },
  "error_code": null
}


Mark Story as Viewed
Explicitly mark a story as viewed
Endpoint
POST /api/v1/stories/:id/view

Request Body
{}

Success Response (200)
{
  "status": "success",
  "data": {
    "view_recorded": true
  },
  "error_code": null
}


Get Story Viewers
Get viewer list for a story (owner only)
Endpoint
GET /api/v1/stories/:id/viewers

Query Parameters
Parameter
Type
Required
Default
limit
integer
No
20

Success Response (200)
{
  "status": "success",
  "data": {
    "viewers": [
      {
        "user_id": "user_123",
        "full_name": "John Doe",
        "username": "johndoe",
        "profile_image_url": "https://...",
        "viewed_at": "2025-01-15T10:35:00.000Z"
      }
    ]
  },
  "error_code": null
}


Delete Story
Delete a story (owner only)
Endpoint
DELETE /api/v1/stories/:id

Success Response (200)
{
  "status": "success",
  "data": {
    "deleted": true
  },
  "error_code": null
}


Highlights (Stories Sub-Module)
Base path: /api/v1/highlights
Create Highlight Collection
Create a new highlight collection
Endpoint
POST /api/v1/highlights/create

Request Body
{
  "name": "Summer Matches 2025",
  "stories": []
}

Success Response (201)
{
  "status": "success",
  "data": {
    "highlight_id": "highlight_abc123",
    "name": "Summer Matches 2025",
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  "error_code": null
}


Get My Highlights
Get current user's highlights
Endpoint
GET /api/v1/users/me/highlights

Success Response (200)
{
  "status": "success",
  "data": {
    "highlights": [
      {
        "highlight_id": "highlight_abc123",
        "name": "Summer Matches 2025",
        "cover_story": { ... },
        "stories_count": 5,
        "created_at": "2025-01-15T10:30:00.000Z"
      }
    ]
  },
  "error_code": null
}


Save Story to Highlight
Save a story to a highlight
Endpoint
POST /api/v1/stories/:storyId/highlight

Request Body
{
  "highlight_id": "highlight_abc123"
}

Success Response (200)
{
  "status": "success",
  "data": {
    "added": true
  },
  "error_code": null
}


Add Story to Highlight
Add a story to an existing highlight (by highlight ID)
Endpoint
POST /api/v1/highlights/:highlightId/stories

Request Body
{
  "story_id": "story_abc123"
}


Remove Story from Highlight
Remove a story from a highlight
Endpoint
DELETE /api/v1/stories/:storyId/highlight

Request Body
{
  "highlight_id": "highlight_abc123"
}


Delete Highlight Collection
Delete a highlight collection
Endpoint
DELETE /api/v1/highlights/:highlightId

Success Response (200)
{
  "status": "success",
  "data": {
    "deleted": true
  },
  "error_code": null
}


Likes Module
Base path: /api/v1/likes
Like Content
Like a post, comment, or reel
Endpoint
POST /api/v1/likes

Request Body
{
  "content_type": "post",
  "content_id": "post_abc123",
  "reaction": "like"
}

Parameters
Parameter
Required
Description
content_type
Yes
post, comment, or reel
content_id
Yes
ID of the content to like
reaction
Yes
like, love, haha, wow, sad, angry

Success Response (201)
{
  "status": "success",
  "data": {
    "like_id": "like_abc123",
    "liked": true,
    "reaction": "like"
  },
  "error_code": null
}

Error Responses
409 Conflict: Already liked

Toggle Like
Toggle like (like → unlike or unlike → like)
Endpoint
POST /api/v1/likes/toggle

Request Body
{
  "content_type": "post",
  "content_id": "post_abc123",
  "reaction": "love"
}

Success Response (200)
{
  "status": "success",
  "data": {
    "liked": true,
    "reaction": "love"
  },
  "error_code": null
}


Unlike (by like_id)
Remove a like by like_id
Endpoint
DELETE /api/v1/likes/:likeId

Success Response (200)
{
  "status": "success",
  "data": {
    "unliked": true
  },
  "error_code": null
}


Hide Like from Public List
Hide your like from public like list
Endpoint
POST /api/v1/likes/:likeId/hide

Request Body
{}

Success Response (200)
{
  "status": "success",
  "data": {
    "hidden": true
  },
  "error_code": null
}


Show Hidden Like Again
Make a hidden like visible again
Endpoint
POST /api/v1/likes/:likeId/show

Request Body
{}

Success Response (200)
{
  "status": "success",
  "data": {
    "visible": true
  },
  "error_code": null
}


Get Likes for Content
Get likes for a post, comment, or reel
Endpoints
GET /api/v1/posts/:content_id/likes
GET /api/v1/comments/:content_id/likes
GET /api/v1/reels/:content_id/likes

Query Parameters
Parameter
Type
Required
Default
limit
integer
No
20
cursor
string
No
null

Success Response (200)
{
  "status": "success",
  "data": {
    "likes": [
      {
        "like_id": "like_abc123",
        "user": {
          "user_id": "user_123",
          "full_name": "John Doe",
          "username": "johndoe",
          "profile_image_url": "https://..."
        },
        "reaction": "like",
        "created_at": "2025-01-15T10:30:00.000Z"
      }
    ],
    "total_count": 42,
    "next_cursor": "abc123",
    "has_more": true
  },
  "error_code": null
}


Check If User Liked Content
Check if the current user has liked a post, comment, or reel
Endpoints
GET /api/v1/posts/:content_id/like-check
GET /api/v1/comments/:content_id/like-check
GET /api/v1/reels/:content_id/like-check

Success Response (200)
{
  "status": "success",
  "data": {
    "liked": true,
    "like_id": "like_abc123",
    "reaction": "like"
  },
  "error_code": null
}


Block & Mute Module
Block a User
Block a user (bidirectional blocks)
Endpoint
POST /api/v1/users/:userId/block

Request Body
{
  "reason": "Spam behavior"
}

Side Effects
Creates BlockRelation document
Removes follow relationships in both directions
Decrements follow counts accordingly
Success Response (200)
{
  "status": "success",
  "data": {
    "blocked": true,
    "blocked_at": "2025-01-15T10:30:00.000Z",
    "follows_removed": {
      "blocker_was_following": true,
      "blocked_was_following": false
    }
  },
  "error_code": null
}

Error Responses
400 Bad Request: Cannot block yourself
404 Not Found: User not found
409 Conflict: Already blocked

Unblock a User
Unblock a user
Endpoint
DELETE /api/v1/users/:userId/block

Success Response (200)
{
  "status": "success",
  "data": {
    "unblocked": true
  },
  "error_code": null
}

Error Responses
404 Not Found: User is not blocked

Mute a User
Mute a user (selectively mute posts, stories, reels, notifications)
Endpoint
POST /api/v1/users/:userId/mute

Request Body
{
  "mute_posts": true,
  "mute_stories": true,
  "mute_reels": false,
  "mute_notifications": false
}

Default Values
mute_posts: true (if not specified)
mute_stories: false
mute_reels: false
mute_notifications: false
Success Response (200)
{
  "status": "success",
  "data": {
    "muted": true,
    "muted_at": "2025-01-15T10:30:00.000Z",
    "options": {
      "mute_posts": true,
      "mute_stories": true,
      "mute_reels": false,
      "mute_notifications": false
    }
  },
  "error_code": null
}

Error Responses
400 Bad Request: Cannot mute yourself
404 Not Found: User not found
409 Conflict: Already muted

Unmute a User
Unmute a user
Endpoint
DELETE /api/v1/users/:userId/mute

Success Response (200)
{
  "status": "success",
  "data": {
    "unmuted": true
  },
  "error_code": null
}


Get Blocked Users List
Get list of blocked users
Endpoint
GET /api/v1/users/blocked

Query Parameters
Parameter
Type
Required
Default
limit
integer
No
20
cursor
string
No
null

Success Response (200)
{
  "status": "success",
  "data": {
    "blocked_users": [
      {
        "user": {
          "_id": "user_123",
          "full_name": "John Doe",
          "username": "johndoe",
          "profile_image_url": "https://..."
        },
        "blocked_at": "2025-01-15T10:30:00.000Z",
        "reason": "Spam behavior"
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  },
  "error_code": null
}


Get Muted Users List
Get list of muted users
Endpoint
GET /api/v1/users/muted

Query Parameters
Parameter
Type
Required
Default
limit
integer
No
20
cursor
string
No
null

Success Response (200)
{
  "status": "success",
  "data": {
    "muted_users": [
      {
        "user": {
          "_id": "user_123",
          "full_name": "John Doe",
          "username": "johndoe",
          "profile_image_url": "https://..."
        },
        "muted_at": "2025-01-15T10:30:00.000Z",
        "options": {
          "mute_posts": true,
          "mute_stories": true,
          "mute_reels": false,
          "mute_notifications": false
        }
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  },
  "error_code": null
}


Check Block Status
Check if you have blocked or been blocked by a user
Endpoint
GET /api/v1/users/:userId/blocked-check

Success Response (200)
{
  "status": "success",
  "data": {
    "you_blocked_them": true,
    "they_blocked_you": false,
    "mutually_blocked": false
  },
  "error_code": null
}


End-to-End Flow Examples
Complete Post Lifecycle
Step 1: Create Post
curl -X POST "{{base_url}}/api/v1/posts/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{access_token}}" \
  -d '{
    "content": { "text": "E2E test post #e2e" },
    "visibility": "public",
    "allow_comments": true
  }'

Step 2: Get Post
curl -X GET "{{base_url}}/api/v1/posts/{{post_id}}" \
  -H "Authorization: Bearer {{access_token}}"

Step 3: Add Comment
curl -X POST "{{base_url}}/api/v1/posts/{{post_id}}/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{access_token}}" \
  -d '{ "text": "Great post!" }'

Step 4: Like the Post
curl -X POST "{{base_url}}/api/v1/likes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{access_token}}" \
  -d '{
    "content_type": "post",
    "content_id": "{{post_id}}",
    "reaction": "like"
  }'

Step 5: Get Comments
curl -X GET "{{base_url}}/api/v1/posts/{{post_id}}/comments" \
  -H "Authorization: Bearer {{access_token}}"

Step 6: Delete Post
curl -X DELETE "{{base_url}}/api/v1/posts/{{post_id}}" \
  -H "Authorization: Bearer {{access_token}}"


Reel Upload Flow
Step 1: Presign Video Upload
curl -X POST "{{base_url}}/api/v1/reels/presign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{access_token}}" \
  -d '{
    "file_name": "my_reel.mp4",
    "mime_type": "video/mp4",
    "size_bytes": 10485760,
    "purpose": "reel"
  }'

Step 2: Upload Video to Wasabi (Client-side)
curl -X PUT "{{reel_upload_url}}" \
  -H "Content-Type: video/mp4" \
  --data-binary @my_reel.mp4

Step 3: (Optional) Presign Thumbnail
curl -X POST "{{base_url}}/api/v1/reels/presign" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{access_token}}" \
  -d '{
    "file_name": "thumb.jpg",
    "mime_type": "image/jpeg",
    "size_bytes": 204800,
    "purpose": "thumbnail"
  }'

Step 4: Create Reel
curl -X POST "{{base_url}}/api/v1/reels/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {{access_token}}" \
  -d '{
    "video_url": "{{reel_file_url}}",
    "duration": 30,
    "thumbnail_url": "{{reel_thumb_url}}",
    "aspect_ratio": "9:16",
    "title": "Epic Shot",
    "caption": "#badminton #sports",
    "hashtags": ["badminton", "sports"],
    "visibility": "public",
    "allow_comments": true
  }'


Appendix
Response Status Values
Status
Description
success
Request completed successfully
error
An error occurred

Visibility Levels
Value
Description
public
Visible to everyone
followers_only
Visible to followers only
private
Visible only to user
close_friends
Visible to close friends (Stories)

Reaction Types
Value
Display
like
👍
love
❤️
haha
😂
wow
😮
sad
😢
angry
😠

Pagination
All list endpoints support cursor-based pagination:
limit: Number of items to return (default varies by endpoint, max 50)
cursor: Base64-encoded ID from previous response's next_cursor
has_more: Boolean indicating if more pages exist
Rate Limiting
Feed endpoints: 100 requests/minute
Post creation: 10 posts/minute
Comment creation: 30 comments/minute
Like actions: 60 actions/minute
Notes
All timestamps are in ISO 8601 format (UTC)
All IDs are strings (not numeric)
Media URLs expire after 7 days for view access
Upload URLs expire after 5 minutes
Story expiration: 24 hours from creation
Comment edit window: 5 minutes
Post delete undo window: 5 minutes

