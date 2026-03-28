# Bookmarks & Saved Collections API Documentation

## Overview

The Bookmarks API provides endpoints for saving (bookmarking) posts and reels, and organizing them into named collections. Users can bookmark content for later viewing and create custom collections to organize their saved items.

### Base URL
```
/api/v1/bookmarks
```

### Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Feature Gate
- Minimum onboarding state: `COMPLETED` or `ACTIVE_USER`
- Suspended users are blocked

---

## Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Bookmark a post or reel |
| GET | `/` | Get user's bookmarks (paginated) |
| DELETE | `/:id` | Remove a bookmark |
| GET | `/check` | Check if content is bookmarked |
| GET | `/collections` | Get user's collections |
| POST | `/collections` | Create a new collection |
| PUT | `/collections/:id` | Update a collection |
| DELETE | `/collections/:id` | Delete a collection |
| POST | `/collections/:id/add` | Add bookmark to collection |
| DELETE | `/collections/:id/remove` | Remove bookmark from collection |

---

## Endpoints Detail

### 1. Bookmark a Post or Reel

Save a post or reel to bookmarks.

**Endpoint:** `POST /api/v1/bookmarks`

**Request:**
```json
{
  "content_id": "507f1f77bcf86cd799439011",
  "content_type": "post",
  "notes": "Great recipe idea!"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content_id | string | Yes | ID of the post or reel to bookmark |
| content_type | string | Yes | Either `"post"` or `"reel"` |
| notes | string | No | Optional personal note (max 500 chars) |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "65f2a1b3c9e7a1234567890a",
    "bookmark_id": "bm_abc123def456",
    "user_id": "65f2a1b3c9e7a1234567890b",
    "content_id": "507f1f77bcf86cd799439011",
    "content_type": "post",
    "collections": [],
    "notes": "Great recipe idea!",
    "bookmarked_at": "2024-03-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 MISSING_FIELDS` - Missing content_id or content_type
- `400 INVALID_CONTENT_TYPE` - content_type must be "post" or "reel"
- `404 CONTENT_NOT_FOUND` - The post/reel doesn't exist or is deleted
- `409 ALREADY_BOOKMARKED` - User has already bookmarked this content

---

### 2. Get User's Bookmarks

Retrieve all bookmarks for the authenticated user with pagination.

**Endpoint:** `GET /api/v1/bookmarks`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 20 | Number of items (max 50) |
| cursor | string | null | Pagination cursor (base64 encoded) |
| content_type | string | null | Filter by "post" or "reel" |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "_id": "65f2a1b3c9e7a1234567890a",
        "bookmark_id": "bm_abc123def456",
        "user_id": "65f2a1b3c9e7a1234567890b",
        "content_id": "507f1f77bcf86cd799439011",
        "content_type": "post",
        "collections": [
          {
            "collection_id": "65f2a1b3c9e7a1234567890c",
            "added_at": "2024-03-15T10:35:00.000Z"
          }
        ],
        "notes": "Great recipe idea!",
        "bookmarked_at": "2024-03-15T10:30:00.000Z"
      }
    ],
    "next_cursor": "NjVmMmExYjljOWU3YTEyMzQ1Njg5MGE=",
    "has_more": true
  }
}
```

**Notes:**
- Results are sorted by `bookmarked_at` descending (newest first)
- Use `next_cursor` in subsequent requests to paginate

---

### 3. Remove a Bookmark

Delete a bookmark by its ID.

**Endpoint:** `DELETE /api/v1/bookmarks/:id`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The bookmark's `_id` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

**Error Responses:**
- `404 BOOKMARK_NOT_FOUND` - Bookmark doesn't exist or doesn't belong to user

**Side Effects:**
- Decrements `saves_count` on the original content
- Removes bookmark reference from all collections it belonged to

---

### 4. Check if Content is Bookmarked

Check whether the authenticated user has bookmarked specific content.

**Endpoint:** `GET /api/v1/bookmarks/check`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| content_id | string | Yes | ID of the content |
| content_type | string | Yes | Either "post" or "reel" |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "bookmarked": true,
    "bookmark_id": "65f2a1b3c9e7a1234567890a"
  }
}
```

**Example Response (not bookmarked):**
```json
{
  "success": true,
  "data": {
    "bookmarked": false,
    "bookmark_id": null
  }
}
```

---

### 5. Get User's Collections

Retrieve all bookmark collections for the authenticated user.

**Endpoint:** `GET /api/v1/bookmarks/collections`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "collections": [
      {
        "_id": "65f2a1b3c9e7a1234567890c",
        "collection_id": "col_abc123def456",
        "user_id": "65f2a1b3c9e7a1234567890b",
        "collection_name": "Recipes to Try",
        "description": "Healthy meal ideas",
        "collection_cover": "https://cdn.example.com/image.jpg",
        "bookmark_count": 15,
        "visibility": "private",
        "is_deleted": false,
        "created_at": "2024-03-10T08:00:00.000Z",
        "updated_at": "2024-03-15T12:00:00.000Z"
      }
    ]
  }
}
```

**Notes:**
- Results are sorted by `created_at` descending
- Only returns non-deleted collections

---

### 6. Create a Collection

Create a new bookmark collection to organize saved items.

**Endpoint:** `POST /api/v1/bookmarks/collections`

**Request:**
```json
{
  "collection_name": "My Favorite Reels",
  "description": " reels I love",
  "visibility": "private"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| collection_name | string | Yes | Name of the collection (max 100 chars) |
| description | string | No | Description (max 300 chars) |
| visibility | string | No | `"private"` (default), `"followers_only"`, or `"public"` |

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "65f2a1b3c9e7a1234567890c",
    "collection_id": "col_abc123def456",
    "user_id": "65f2a1b3c9e7a1234567890b",
    "collection_name": "My Favorite Reels",
    "description": " reels I love",
    "collection_cover": null,
    "bookmark_count": 0,
    "visibility": "private",
    "is_deleted": false,
    "created_at": "2024-03-15T14:00:00.000Z",
    "updated_at": "2024-03-15T14:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 COLLECTION_NAME_REQUIRED` - collection_name is required or empty

---

### 7. Update a Collection

Update a collection's name, description, or visibility.

**Endpoint:** `PUT /api/v1/bookmarks/collections/:id`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The collection's `_id` |

**Request:**
```json
{
  "collection_name": "Updated Name",
  "description": "Updated description",
  "visibility": "followers_only"
}
```

**Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| collection_name | string | New name (max 100 chars) |
| description | string | New description (max 300 chars) |
| visibility | string | `"private"`, `"followers_only"`, or `"public"` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f2a1b3c9e7a1234567890c",
    "collection_id": "col_abc123def456",
    "user_id": "65f2a1b3c9e7a1234567890b",
    "collection_name": "Updated Name",
    "description": "Updated description",
    "collection_cover": null,
    "bookmark_count": 5,
    "visibility": "followers_only",
    "is_deleted": false,
    "created_at": "2024-03-10T08:00:00.000Z",
    "updated_at": "2024-03-15T15:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 COLLECTION_NOT_FOUND` - Collection doesn't exist or doesn't belong to user

---

### 8. Delete a Collection

Delete a collection (soft delete). The bookmarks themselves are not deleted.

**Endpoint:** `DELETE /api/v1/bookmarks/collections/:id`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The collection's `_id` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

**Error Responses:**
- `404 COLLECTION_NOT_FOUND` - Collection doesn't exist or doesn't belong to user

**Side Effects:**
- Removes collection reference from all bookmarks in the collection
- Collection count is decremented for each bookmark

---

### 9. Add Bookmark to Collection

Add an existing bookmark to a collection.

**Endpoint:** `POST /api/v1/bookmarks/collections/:id/add`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The collection's `_id` |

**Request:**
```json
{
  "bookmark_id": "65f2a1b3c9e7a1234567890a"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bookmark_id | string | Yes | The bookmark's `_id` to add |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "added": true
  }
}
```

**Error Responses:**
- `400 MISSING_FIELDS` - bookmark_id is required
- `404 COLLECTION_NOT_FOUND` - Collection doesn't exist or doesn't belong to user
- `404 BOOKMARK_NOT_FOUND` - Bookmark doesn't exist or doesn't belong to user
- `409 ALREADY_IN_COLLECTION` - Bookmark is already in this collection

---

### 10. Remove Bookmark from Collection

Remove a bookmark from a collection without deleting the bookmark itself.

**Endpoint:** `DELETE /api/v1/bookmarks/collections/:id/remove`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The collection's `_id` |

**Request:**
```json
{
  "bookmark_id": "65f2a1b3c9e7a1234567890a"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| bookmark_id | string | Yes | The bookmark's `_id` to remove |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

**Error Responses:**
- `400 MISSING_FIELDS` - bookmark_id is required
- `404 COLLECTION_NOT_FOUND` - Collection doesn't exist or doesn't belong to user
- `404 BOOKMARK_NOT_FOUND` - Bookmark doesn't exist or doesn't belong to user

---

## Data Models

### Bookmark

```javascript
{
  _id: ObjectId,
  bookmark_id: String,        // Unique identifier (e.g., "bm_abc123...")
  user_id: ObjectId,          // Reference to User
  content_id: String,         // ID of the bookmarked content
  content_type: String,       // "post" or "reel"
  collections: Array,         // Array of collection references
  notes: String,              // Optional personal note
  bookmarked_at: Date         // Creation timestamp
}
```

### BookmarkCollection

```javascript
{
  _id: ObjectId,
  collection_id: String,       // Unique identifier (e.g., "col_abc123...")
  user_id: ObjectId,           // Reference to User
  collection_name: String,    // Name of the collection
  description: String,        // Optional description
  collection_cover: String,   // URL of cover image
  bookmark_count: Number,     // Denormalized count
  visibility: String,         // "private", "followers_only", or "public"
  is_deleted: Boolean,        // Soft delete flag
  created_at: Date,
  updated_at: Date
}
```

---

## Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| MISSING_FIELDS | 400 | Required fields are missing |
| INVALID_CONTENT_TYPE | 400 | Invalid content_type value |
| CONTENT_NOT_FOUND | 404 | Content doesn't exist or is deleted |
| ALREADY_BOOKMARKED | 409 | User already bookmarked this content |
| BOOKMARK_NOT_FOUND | 404 | Bookmark doesn't exist |
| COLLECTION_NAME_REQUIRED | 400 | Collection name is required |
| COLLECTION_NOT_FOUND | 404 | Collection doesn't exist |
| ALREADY_IN_COLLECTION | 409 | Bookmark already in collection |
| INTERNAL_ERROR | 500 | Server error |

---

## Example Usage

### Bookmark a post while creating:
```bash
curl -X POST https://api.example.com/api/v1/bookmarks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "507f1f77bcf86cd799439011",
    "content_type": "post",
    "notes": "Want to try this later"
  }'
```

### Get all bookmarks:
```bash
curl -X GET "https://api.example.com/api/v1/bookmarks?limit=20" \
  -H "Authorization: Bearer <token>"
```

### Create a collection:
```bash
curl -X POST https://api.example.com/api/v1/bookmarks/collections \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "collection_name": "Travel Inspiration",
    "description": "Places I want to visit"
  }'
```

### Add bookmark to collection:
```bash
curl -X POST https://api.example.com/api/v1/bookmarks/collections/65f2a1b3c9e7a1234567890c/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookmark_id": "65f2a1b3c9e7a1234567890a"
  }'
```

---

## Notes

1. **Atomic Updates**: The `saves_count` on posts/reels is incremented/decremented atomically when bookmarks are added/removed.

2. **Compound Index**: A unique compound index on `(user_id, content_id, content_type)` prevents duplicate bookmarks.

3. **Soft Delete**: Collections use soft delete (`is_deleted` flag) to preserve data integrity.

4. **Pagination**: Bookmarks use cursor-based pagination with base64-encoded `_id` values.

5. **Content Types**: Currently supports `post` and `reel` content types.

6. **Visibility**: Collections can be `private` (default), `followers_only`, or `public` (future feature for sharing).