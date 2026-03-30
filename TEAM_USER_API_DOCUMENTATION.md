# PLAYMATE Team Module - User API Documentation

## Overview

This document provides complete API documentation for the Team Module user-facing endpoints. All endpoints are prefixed with `/api/v1/teams`.

**Base URL:** `{{base_url}}/api/v1`

---

## Authentication

All endpoints (except health check and public invite resolution) require JWT authentication:

```
Authorization: Bearer <user_jwt_token>
```

The JWT token is obtained from the login API. Include this header in all authenticated requests.

---

## Endpoints Summary

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | GET | `/teams/health` | Health check |
| 2 | POST | `/teams/media/presign` | Generate presigned URL for logo/banner |
| 3 | GET | `/teams/eligibility` | Check team creation eligibility |
| 4 | POST | `/teams` | Create a new team |
| 5 | GET | `/teams` | List/discover public teams |
| 6 | GET | `/teams/:teamId` | Get team profile |
| 7 | PATCH | `/teams/:teamId` | Update team (owner only) |
| 8 | DELETE | `/teams/:teamId` | Archive team (owner only) |
| 9 | GET | `/teams/mine` | Get user's teams (owned + member) |
| 10 | GET | `/teams/mine/created` | Get teams user owns |
| 11 | GET | `/teams/mine/joined` | Get teams user is member of |
| 12 | GET | `/teams/:teamId/membership/preview` | Preview membership details |
| 13 | POST | `/teams/:teamId/membership/initiate` | Initiate membership (Coins Only) |
| 14 | POST | `/teams/:teamId/membership/confirm` | Confirm membership payment |
| 15 | DELETE | `/teams/:teamId/membership` | Leave team |
| 16 | GET | `/teams/:teamId/members` | List team members |
| 17 | GET | `/teams/:teamId/members/pending` | Get pending members (owner) |
| 18 | PATCH | `/teams/:teamId/members/:userId/role` | Update member role |
| 19 | DELETE | `/teams/:teamId/members/:userId` | Remove member |
| 20 | POST | `/teams/:teamId/invites` | Create invite |
| 21 | GET | `/teams/invites/:inviteCode` | Resolve invite code |
| 22 | POST | `/teams/invites/:inviteCode/accept` | Accept invite |
| 23 | POST | `/teams/invites/:inviteCode/decline` | Decline invite |
| 24 | DELETE | `/teams/:teamId/invites/:inviteId` | Revoke invite |
| 25 | GET | `/teams/:teamId/payments` | Get team payments (owner) |
| 26 | GET | `/teams/:teamId/payments/summary` | Get payment summary (owner) |
| 27 | GET | `/teams/slot-packages` | List available slot packages |
| 28 | GET | `/teams/slot-packages/:packageId` | Get slot package detail |
| 29 | POST | `/teams/slots/initiate` | Initiate slot purchase |
| 30 | POST | `/teams/slots/confirm` | Confirm slot purchase |
| 31 | GET | `/teams/slots/mine` | Get user's slot purchases |
| 32 | GET | `/teams/slots/mine/balance` | Get user's slot balance |
| 33 | GET | `/teams/name-reservation/check` | Check name availability |
| 34 | GET | `/teams/name-reservation/pricing` | Get reservation pricing |
| 35 | POST | `/teams/:teamId/name-reservation/initiate` | Initiate name reservation |
| 36 | POST | `/teams/:teamId/name-reservation/confirm` | Confirm name reservation |
| 37 | GET | `/teams/:teamId/name-reservation` | Get reservation status |
| 38 | DELETE | `/teams/:teamId/name-reservation` | Release reservation |
| 39 | POST | `/teams/:teamId/name-reservation/renew` | Renew reservation |

---

## Detailed API Reference

### 1. Health Check

**Endpoint:** `GET /teams/health`

Check if the team module is running.

**Authentication:** Not required

**Response:**
```json
{
  "status": "success",
  "message": "Team module is running"
}
```

---

### 2. Generate Presigned URL

**Endpoint:** `POST /teams/media/presign`

Generate a presigned URL for uploading team logo or banner to Wasabi S3.

**Authentication:** Required (User JWT + PRO/VIP)

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "purpose": "logo" | "banner",
  "file_name": "team-logo.png",
  "mime_type": "image/png"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| purpose | string | Yes | Either "logo" or "banner" |
| file_name | string | Yes | Name of the file to upload |
| mime_type | string | Yes | MIME type (image/jpeg, image/png, image/webp) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "presigned_url": "https://s3.wasabisys.com/...",
    "key": "teams/user123/logo/1742890000000-a3f2b1-team-logo.png",
    "expires_in_seconds": 300
  }
}
```

**Error Codes:**
- `400` - Invalid purpose or mime_type
- `403` - User not eligible (not PRO/VIP)

**Screen Flow:**
- **Flutter/Web:** User taps "Upload Logo" or "Upload Banner" on Team Create/Edit screen → App calls this endpoint → Gets presigned URL → Uploads file directly to Wasabi using the URL → Stores the `key` in team creation/update request

---

### 3. Check Team Creation Eligibility

**Endpoint:** `GET /teams/eligibility`

Check if the user is eligible to create teams based on their subscription plan.

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "can_create": true,
    "max_teams_allowed": 5,
    "current_teams_created": 2,
    "teams_remaining": 3,
    "limit_source": "plan_limits",
    "plan_name": "PRO",
    "can_join": true,
    "eligible_categories": ["sports", "hobbies", "additional"]
  }
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| can_create | boolean | Whether user can create a team |
| max_teams_allowed | number | Maximum teams allowed based on plan |
| current_teams_created | number | Number of teams already created |
| teams_remaining | number | Remaining teams user can create |
| limit_source | string | Source of limit (plan_limits, default) |
| plan_name | string | User's subscription plan name |
| can_join | boolean | Whether user can join teams |
| eligible_categories | string[] | Categories user can create teams in |

**Screen Flow:**
- **Flutter/Web:** User navigates to "Create Team" screen → App calls this endpoint → If `can_create: false`, shows "Upgrade Plan" CTA → If `can_create: true`, shows team creation form with eligible categories

---

### 4. Create Team

**Endpoint:** `POST /teams`

Create a new team.

**Authentication:** Required (User JWT + PRO/VIP + Eligible)

**Request Body:**
```json
{
  "name": "Thunder Strikers",
  "category_type": "sports",
  "category_value": "cricket",
  "is_primary_sport": true,
  "description": "A passionate cricket team for weekend warriors",
  "visibility": "public",
  "skill_level": "all_levels",
  "age_group": "18_plus",
  "max_members": 15,
  "location": {
    "city": "Pune",
    "area": "Kothrud"
  },
  "roles_config": {
    "co_captain_enabled": true,
    "manager_enabled": true,
    "coach_enabled": false
  },
  "membership": {
    "is_paid": true,
    "fee_amount": 499,
    "default_duration_type": "YEARLY",
    "allow_duration_choice": true,
    "duration_pricing": {
      "MONTHLY": { "amount": 199 },
      "QUARTERLY": { "amount": 399 },
      "YEARLY": { "amount": 499 }
    },
    "welcome_bonus_coins": 50
  },
  "logo_key": "teams/user123/logo/...",
  "banner_key": "teams/user123/banner/..."
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Team name (max 80 chars) |
| category_type | string | Yes | sports, hobbies, additional, activities, nostalgia |
| category_value | string | Yes | Specific interest (e.g., cricket, swimming) |
| is_primary_sport | boolean | No | Only for sports category |
| description | string | No | Team description (max 500 chars) |
| visibility | string | No | public or private (default: public) |
| skill_level | string | No | all_levels, beginner, intermediate, advanced, pro |
| age_group | string | No | under_18, 18_plus, 25_plus, 35_plus, all_ages |
| max_members | number | No | 2-200, default 15 |
| location | object | No | { city, area } |
| roles_config | object | No | Role enable/disable flags |
| membership | object | No | Join fee configuration |
| logo_key | string | No | From presign endpoint |
| banner_key | string | No | From presign endpoint |

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Thunder Strikers",
    "slug": "thunder-strikers",
    "owner_user_id": "507f1f77bcf86cd799439012",
    "category_type": "sports",
    "category_value": "cricket",
    "visibility": "public",
    "member_count": 1,
    "created_at": "2026-03-26T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Validation error
- `403` - Not eligible to create team
- `409` - Duplicate team exists
- `422` - Category validation failed

**Screen Flow:**
- **Flutter/Web:** User fills team creation form → Taps "Create Team" → App calls this endpoint → On success, navigates to Team Profile screen → On error, shows error message

---

### 5. List/Discover Teams

**Endpoint:** `GET /teams`

Discover public teams with filters.

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| category_type | string | Filter by category (sports, hobbies, additional, activities, nostalgia) |
| category_value | string | Filter by specific interest |
| city | string | Filter by city |
| skill_level | string | Filter by skill level (all_levels, beginner, intermediate, advanced, pro) |
| age_group | string | Filter by age group (under_18, 18_plus, 25_plus, 35_plus, all_ages) |
| has_capacity | boolean | Show only teams with capacity |
| sort | string | Sort: newest, oldest, members_count (default: newest) |
| limit | number | Results per page (default: 20, max: 50) |
| cursor | string | Pagination cursor |

**Example Request:**
```
GET /api/v1/teams?category_type=sports&city=Pune&limit=20
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Thunder Strikers",
      "slug": "thunder-strikers",
      "category_type": "sports",
      "category_value": "cricket",
      "visibility": "public",
      "skill_level": "all_levels",
      "member_count": 12,
      "max_members": 15,
      "location": { "city": "Pune" },
      "logo_url": "https://s3.wasabisys.com/...",
      "banner_url": "https://s3.wasabisys.com/..."
    }
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSJ9",
    "has_more": true
  }
}
```

**Screen Flow:**
- **Flutter/Web:** User opens "Discover Teams" screen → App calls this endpoint with filters → Displays team cards → User taps team card → Navigates to Team Profile

---

### 6. Get Team Profile

**Endpoint:** `GET /teams/:teamId`

Get detailed team profile.

**Authentication:** Optional

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Example Request:**
```
GET /api/v1/teams/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Thunder Strikers",
    "description": "A passionate cricket team",
    "slug": "thunder-strikers",
    "owner_user_id": "507f1f77bcf86cd799439012",
    "category_type": "sports",
    "category_value": "cricket",
    "is_primary_sport": true,
    "visibility": "public",
    "skill_level": "all_levels",
    "age_group": "18_plus",
    "max_members": 15,
    "location": { "city": "Pune", "area": "Kothrud" },
    "roles_config": {
      "co_captain_enabled": true,
      "manager_enabled": true,
      "coach_enabled": false
    },
    "membership": {
      "is_paid": true,
      "fee_amount": 499,
      "default_duration_type": "YEARLY"
    },
    "member_count": 12,
    "total_revenue": 4990,
    "logo_url": "https://s3.wasabisys.com/...",
    "banner_url": "https://s3.wasabisys.com/...",
    "created_at": "2026-03-26T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `404` - Team not found

**Screen Flow:**
- **Flutter/Web:** User taps team card from discovery or my teams → App calls this endpoint → Displays team profile with members, settings, and action buttons (Join, Edit, etc.)

---

### 7. Update Team

**Endpoint:** `PATCH /teams/:teamId`

Update team settings (owner only).

**Authentication:** Required (Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Request Body:**
```json
{
  "name": "Updated Team Name",
  "description": "Updated description",
  "visibility": "public",
  "skill_level": "intermediate",
  "max_members": 20
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Team name (max 80 chars) |
| description | string | No | Team description (max 500 chars) |
| visibility | string | No | public or private |
| skill_level | string | No | all_levels, beginner, intermediate, advanced, pro |
| age_group | string | No | under_18, 18_plus, 25_plus, 35_plus, all_ages |
| max_members | number | No | 2-200 |

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Team Name",
    "slug": "updated-team-name",
    ... // full updated team object
  }
}
```

**Error Codes:**
- `403` - Not the team owner
- `404` - Team not found

**Screen Flow:**
- **Flutter/Web:** Owner taps "Edit Team" → App shows edit form → User updates fields → Taps "Save" → App calls this endpoint → On success, refreshes team profile

---

### 8. Archive Team

**Endpoint:** `DELETE /teams/:teamId`

Archive team (soft delete - owner only).

**Authentication:** Required (Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Response:**
```json
{
  "status": "success",
  "message": "Team archived successfully"
}
```

**Error Codes:**
- `403` - Not the team owner
- `404` - Team not found

**Side Effects:**
- Team status changed to "archived"
- All members are notified
- Active memberships are maintained until expiry

**Screen Flow:**
- **Flutter/Web:** Owner taps "Archive Team" → Shows confirmation dialog → User confirms → App calls this endpoint → On success, navigates to My Teams screen

---

### 9. My Teams

**Endpoints:**
- `GET /teams/mine` - Get all teams (owned + member)
- `GET /teams/mine/created` - Get owned teams
- `GET /teams/mine/joined` - Get joined teams

**Authentication:** Required

#### GET /teams/mine

Get all teams the user is associated with (as owner or member).

**Note:** The `member` array only includes teams where the user is a member (not the owner). Teams where the user is the owner appear only in the `owned` array.

**Response:**
```json
{
  "status": "success",
  "data": {
    "owned": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "My Team 1",
        "slug": "my-team-1",
        "is_owner": true,
        "role": "owner",
        "member_count": 5,
        "visibility": "public",
        "status": "active"
      }
    ],
    "member": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "name": "Joined Team",
        "slug": "joined-team",
        "is_owner": false,
        "role": "member",
        "member_count": 10,
        "visibility": "public",
        "status": "active"
      }
    ]
  }
}
```

#### GET /teams/mine/created

Get teams the user owns.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "My Team 1",
      "slug": "my-team-1",
      "role": "owner",
      "member_count": 5,
      "visibility": "public",
      "status": "active",
      "created_at": "2026-03-26T10:00:00.000Z"
    }
  ]
}
```

#### GET /teams/mine/joined

Get teams the user has joined as a member (excluding teams they own).

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Joined Team",
      "slug": "joined-team",
      "role": "member",
      "member_count": 10,
      "visibility": "public",
      "status": "active",
      "joined_at": "2026-03-25T10:00:00.000Z"
    }
  ]
}
```

**Screen Flow:**
- **Flutter/Web:** User opens "My Teams" screen → App calls `/teams/mine` → Shows tabs for "Owned" and "Joined" → User taps team → Navigates to Team Profile

---

### 10. Membership - Join Team

#### 10.1 Preview Membership

**Endpoint:** `GET /teams/:teamId/membership/preview`

Get membership fee details and payment breakdown before joining.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Query Parameters (Optional):**

| Parameter | Type | Description |
|-----------|------|-------------|
| membership_type | string | Preview specific duration (MONTHLY, QUARTERLY, YEARLY) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "team_id": "507f1f77bcf86cd799439011",
    "membership_options": {
      "MONTHLY": { "amount": 199, "available": true },
      "QUARTERLY": { "amount": 399, "available": true },
      "YEARLY": { "amount": 499, "available": true }
    },
    "user_balances": {
      "gold_coins": 100,
      "diamonds": 500
    },
    "payment_breakdown": {
      "YEARLY": {
        "gross_amount": 499,
        "gold_coin_discount": 49,
        "diamonds_amount": 450,
        "diamonds_to_spend": 225
      }
    }
  }
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| team_id | string | Team ID |
| membership_options | object | Available membership durations with amounts |
| user_balances | object | User's current gold coins and diamonds |
| payment_breakdown | object | Payment breakdown by duration type |

**Screen Flow:**
- **Flutter/Web:** User taps "Join Team" → App calls this endpoint → Shows payment breakdown modal → User selects duration → Taps "Proceed to Pay"

#### 10.2 Initiate Membership

**Endpoint:** `POST /teams/:teamId/membership/initiate`

Initiate team membership (Coins Only - NO gateway).

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Request Body:**
```json
{
  "membership_type": "YEARLY",
  "payment_preferences": {
    "use_gold_coins": true,
    "use_diamonds": true
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| membership_type | string | Yes | MONTHLY, QUARTERLY, or YEARLY |
| payment_preferences | object | No | Payment preference options |
| use_gold_coins | boolean | No | Use gold coins for payment (default: true) |
| use_diamonds | boolean | No | Use diamonds for payment (default: true) |

**Response:**
```json
{
  "status": "success",
  "data": {
    "team_id": "507f1f77bcf86cd799439011",
    "membership_type": "YEARLY",
    "gross_amount": 499,
    "breakdown": {
      "gold_coin_discount": 49,
      "gold_coins_to_spend": 49,
      "diamonds_amount": 450,
      "diamonds_to_spend": 225
    },
    "net_payable": 450,
    "insufficient_coins": false,
    "idempotency_key": "team_join_507f1f77bcf86cd799439011_user_507f1f77bcf86cd799439012"
  }
}
```

**Insufficient Coins Response:**
```json
{
  "status": "success",
  "data": {
    "insufficient_coins": true,
    "remaining_coins_needed": 200,
    "purchase_redirect_url": "/coins/purchase"
  }
}
```

**Error Codes:**
- `400` - Validation error
- `403` - User already a member
- `404` - Team not found
- `409` - Team at capacity

**Screen Flow:**
- **Flutter/Web:** User selects membership type → Taps "Confirm" → App calls this endpoint → If `insufficient_coins: true`, redirects to coin purchase → If success, calls confirm endpoint

#### 10.3 Confirm Membership

**Endpoint:** `POST /teams/:teamId/membership/confirm`

Confirm membership payment (Coins Only).

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Request Body:**
```json
{
  "idempotency_key": "team_join_507f1f77bcf86cd799439011_user_507f1f77bcf86cd799439012"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| idempotency_key | string | Yes | Key from initiate response |

**Response:**
```json
{
  "status": "success",
  "message": "Membership confirmed",
  "data": {
    "team_id": "507f1f77bcf86cd799439011",
    "membership_type": "YEARLY",
    "membership_start": "2026-03-26T10:00:00.000Z",
    "membership_end": "2027-03-26T10:00:00.000Z",
    "welcome_bonus_earned": 50
  }
}
```

**Error Codes:**
- `400` - Invalid idempotency key
- `403` - Already a member
- `404` - Team not found
- `409` - Team at capacity

**Screen Flow:**
- **Flutter/Web:** After initiate success → App calls this endpoint → Shows success screen with welcome bonus → Navigates to Team Profile

#### 10.4 Leave Team

**Endpoint:** `DELETE /teams/:teamId/membership`

Leave team (prorated diamond refund).

**Authentication:** Required (Member)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Response:**
```json
{
  "status": "success",
  "message": "You have left the team",
  "data": {
    "refund_amount": 150,
    "refund_type": "prorated_diamonds"
  }
}
```

**Side Effects:**
- Prorated diamonds refunded to user's wallet
- Member record status changed to "left"
- Team owner notified

**Screen Flow:**
- **Flutter/Web:** User taps "Leave Team" → Shows confirmation with refund info → User confirms → App calls this endpoint → Shows refund confirmation → Navigates to My Teams

---

### 11. Members Management

#### 11.1 Get Team Members

**Endpoint:** `GET /teams/:teamId/members`

List team members.

**Authentication:** Required (team member)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (active, pending_payment, left, removed) |
| role | string | Filter by role (owner, co_captain, manager, coach, member) |
| limit | number | Results per page (default: 20) |
| page | number | Page number (default: 1) |

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "user_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "username": "johnd",
      "avatar_url": "https://s3.wasabisys.com/...",
      "role": "owner",
      "membership_type": "YEARLY",
      "status": "active",
      "joined_at": "2026-03-26T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

**Screen Flow:**
- **Flutter/Web:** User opens Team Profile → Taps "Members" tab → App calls this endpoint → Shows member list with roles

#### 11.2 Get Pending Members

**Endpoint:** `GET /teams/:teamId/members/pending`

Get pending members (owner only).

**Authentication:** Required (Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "user_id": "507f1f77bcf86cd799439020",
      "name": "Jane Smith",
      "username": "janes",
      "avatar_url": "https://s3.wasabisys.com/...",
      "membership_type": "YEARLY",
      "invited_at": "2026-03-25T10:00:00.000Z"
    }
  ]
}
```

**Screen Flow:**
- **Flutter/Web:** Owner opens Team Profile → Taps "Pending Members" → App calls this endpoint → Shows pending list with approve/reject options

#### 11.3 Update Member Role

**Endpoint:** `PATCH /teams/:teamId/members/:userId/role`

Update member role (owner only).

**Authentication:** Required (Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |
| userId | string | User ID to update |

**Request Body:**
```json
{
  "role": "co_captain" | "manager" | "coach" | "member"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Member role updated",
  "data": {
    "user_id": "507f1f77bcf86cd799439020",
    "role": "co_captain"
  }
}
```

**Error Codes:**
- `403` - Not the team owner
- `404` - Member not found

**Screen Flow:**
- **Flutter/Web:** Owner taps member → Selects "Change Role" → Chooses new role → App calls this endpoint → Shows success message

#### 11.4 Remove Member

**Endpoint:** `DELETE /teams/:teamId/members/:userId`

Remove member from team (owner only).

**Authentication:** Required (Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |
| userId | string | User ID to remove |

**Response:**
```json
{
  "status": "success",
  "message": "Member removed from team"
}
```

**Error Codes:**
- `403` - Not the team owner or cannot remove
- `404` - Member not found

**Screen Flow:**
- **Flutter/Web:** Owner taps member → Selects "Remove" → Shows confirmation → App calls this endpoint → Removes member from list

---

### 12. Invite System

#### 12.1 Create Invite

**Endpoint:** `POST /teams/:teamId/invites`

Create team invite.

**Authentication:** Required (Owner/Co-captain/Manager)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Request Body:**
```json
{
  "invite_type": "link" | "direct",
  "invited_user_id": "507f1f77bcf86cd799439025" // for direct invite (optional)
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| invite_type | string | Yes | "link" for invite link, "direct" for specific user |
| invited_user_id | string | Required for direct | User ID to invite directly |

**Response:**
```json
{
  "status": "success",
  "data": {
    "invite_id": "507f1f77bcf86cd799439030",
    "invite_code": "ABC123XYZ",
    "invite_link": "https://playymate.com/join/ABC123XYZ",
    "expires_at": "2026-04-02T10:00:00.000Z",
    "invite_type": "link"
  }
}
```

**Screen Flow:**
- **Flutter/Web:** Owner taps "Invite Members" → Selects invite type → App calls this endpoint → Shows invite link or sends direct invite notification

#### 12.2 Resolve Invite Code

**Endpoint:** `GET /teams/invites/:inviteCode`

Resolve invite code (public endpoint).

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| inviteCode | string | Invite code to resolve |

**Example Request:**
```
GET /api/v1/teams/invites/ABC123XYZ
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "team": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Thunder Strikers",
      "slug": "thunder-strikers",
      "logo_url": "https://s3.wasabisys.com/..."
    },
    "membership": {
      "is_paid": true,
      "fee_amount": 499,
      "default_duration_type": "YEARLY"
    },
    "can_join": true,
    "invite_status": "valid"
  }
}
```

**Error Codes:**
- `404` - Invite not found or expired
- `410` - Invite expired

**Screen Flow:**
- **Flutter/Web:** User opens invite link → App calls this endpoint → Shows team preview with join option → User taps "Join" → Redirects to membership flow

#### 12.3 Accept Invite

**Endpoint:** `POST /teams/invites/:inviteCode/accept`

Accept team invite.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| inviteCode | string | Invite code |

**Response:**
```json
{
  "status": "success",
  "data": {
    "redirect_to": "/teams/507f1f77bcf86cd799439011/membership/initiate"
  }
}
```

**Screen Flow:**
- **Flutter/Web:** User taps "Accept Invite" → App calls this endpoint → Redirects to membership initiation flow

#### 12.4 Decline Invite

**Endpoint:** `POST /teams/invites/:inviteCode/decline`

Decline team invite.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| inviteCode | string | Invite code |

**Response:**
```json
{
  "status": "success",
  "message": "Invite declined"
}
```

**Screen Flow:**
- **Flutter/Web:** User taps "Decline Invite" → App calls this endpoint → Shows confirmation message

#### 12.5 Revoke Invite

**Endpoint:** `DELETE /teams/:teamId/invites/:inviteId`

Revoke invite (owner only).

**Authentication:** Required (Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |
| inviteId | string | Invite ID to revoke |

**Response:**
```json
{
  "status": "success",
  "message": "Invite revoked"
}
```

**Screen Flow:**
- **Flutter/Web:** Owner taps invite → Selects "Revoke" → App calls this endpoint → Removes invite from list

---

### 13. Payments Dashboard

#### 13.1 Get Team Payments

**Endpoint:** `GET /teams/:teamId/payments`

Get payment transactions (owner only).

**Authentication:** Required (Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter: PENDING, SUCCESS, FAILED, REFUNDED, PARTIAL_REFUND |
| start_date | date | Start date filter (YYYY-MM-DD) |
| end_date | date | End date filter (YYYY-MM-DD) |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20, max: 50) |

**Example Request:**
```
GET /api/v1/teams/507f1f77bcf86cd799439011/payments?status=SUCCESS&limit=20
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "user_id": "507f1f77bcf86cd799439022",
      "user_name": "Jane Smith",
      "user_username": "janes",
      "membership_type": "YEARLY",
      "gold_coins_spent": 49,
      "diamonds_spent": 450,
      "gross_amount": 499,
      "creator_earnings": 424.15,
      "platform_commission": 74.85,
      "status": "SUCCESS",
      "created_at": "2026-03-26T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

**Screen Flow:**
- **Flutter/Web:** Owner opens Team Profile → Taps "Payments" tab → App calls this endpoint → Shows payment list with filters

#### 13.2 Get Payment Summary

**Endpoint:** `GET /teams/:teamId/payments/summary`

Get payment summary with trends (owner only).

**Authentication:** Required (Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| period | number | Number of days (default: 30, max: 365) |

**Example Request:**
```
GET /api/v1/teams/507f1f77bcf86cd799439011/payments/summary?period=30
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "period_days": 30,
    "summary": {
      "total_collected": 4990,
      "total_creator_earnings": 4241.5,
      "total_platform_commission": 748.5,
      "total_transactions": 10,
      "pending_payments": 1
    },
    "wallet_balance": {
      "available": 4241.5,
      "pending": 0,
      "diamonds": 0
    },
    "trend": [
      { "date": "2026-03-01", "amount": 499, "count": 1 },
      { "date": "2026-03-15", "amount": 499, "count": 1 }
    ]
  }
}
```

**Screen Flow:**
- **Flutter/Web:** Owner opens Payments tab → App calls this endpoint → Shows summary cards with earnings, commission, and trend chart

---

### 14. Team Slot Add-On Packs

#### 14.1 List Slot Packages

**Endpoint:** `GET /teams/slot-packages`

List available slot packages for purchase.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: ACTIVE, INACTIVE, ARCHIVED (default: ACTIVE) |
| limit | number | Results per page (default: 20, max: 100) |
| cursor | string | Pagination cursor |

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "name": "Starter Pack",
      "description": "5 additional team slots",
      "slot_count": 5,
      "price_coins": 500,
      "price_inr": null,
      "duration_days": null,
      "is_active": true,
      "created_at": "2026-03-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTA1MCJ9",
    "has_more": false
  }
}
```

**Screen Flow:**
- **Flutter/Web:** User navigates to "Buy Team Slots" screen → App calls this endpoint → Displays available packages with pricing → User selects package → Proceeds to purchase

#### 14.2 Get Slot Package Detail

**Endpoint:** `GET /teams/slot-packages/:packageId`

Get detailed information about a specific slot package.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| packageId | string | Package ID |

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "name": "Starter Pack",
    "description": "5 additional team slots",
    "slot_count": 5,
    "price_coins": 500,
    "price_inr": null,
    "duration_days": null,
    "is_active": true,
    "created_at": "2026-03-20T10:00:00.000Z",
    "updated_at": "2026-03-20T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `404` - Package not found

**Screen Flow:**
- **Flutter/Web:** User taps on package card → App calls this endpoint → Shows package details with purchase button

#### 14.3 Initiate Slot Purchase

**Endpoint:** `POST /teams/slots/initiate`

Initiate a slot package purchase.

**Authentication:** Required

**Request Body:**
```json
{
  "package_id": "507f1f77bcf86cd799439050",
  "idempotency_key": "slot_purchase_user123_pkg50_timestamp"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| package_id | string | Yes | ID of the slot package to purchase |
| idempotency_key | string | Yes | Unique key to prevent duplicate purchases |

**Response:**
```json
{
  "status": "success",
  "data": {
    "purchase_id": "507f1f77bcf86cd799439060",
    "package_id": "507f1f77bcf86cd799439050",
    "slot_count": 5,
    "price_coins": 500,
    "status": "PENDING",
    "idempotency_key": "slot_purchase_user123_pkg50_timestamp",
    "created_at": "2026-03-26T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Validation error
- `402` - Insufficient coins
- `404` - Package not found or inactive
- `409` - Duplicate purchase (idempotency key already used)

**Screen Flow:**
- **Flutter/Web:** User taps "Buy Now" on package → App calls this endpoint → Creates pending purchase → Proceeds to confirmation

#### 14.4 Confirm Slot Purchase

**Endpoint:** `POST /teams/slots/confirm`

Confirm a pending slot purchase and deduct coins.

**Authentication:** Required

**Request Body:**
```json
{
  "idempotency_key": "slot_purchase_user123_pkg50_timestamp"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| idempotency_key | string | Yes | Idempotency key from initiate response |

**Response:**
```json
{
  "status": "success",
  "data": {
    "purchase_id": "507f1f77bcf86cd799439060",
    "slot_count": 5,
    "coins_deducted": 500,
    "new_balance": 1500,
    "status": "ACTIVE",
    "expires_at": null,
    "confirmed_at": "2026-03-26T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Invalid idempotency key
- `402` - Insufficient coins
- `404` - Purchase not found
- `409` - Purchase already confirmed

**Screen Flow:**
- **Flutter/Web:** User confirms purchase → App calls this endpoint → Deducts coins → Shows success screen with new slot balance → Updates eligibility

#### 14.5 Get My Slot Purchases

**Endpoint:** `GET /teams/slots/mine`

Get user's slot purchase history.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: PENDING, ACTIVE, EXPIRED, REFUNDED |
| limit | number | Results per page (default: 20, max: 100) |
| cursor | string | Pagination cursor |

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439060",
      "package_id": "507f1f77bcf86cd799439050",
      "package_name": "Starter Pack",
      "slot_count": 5,
      "price_coins": 500,
      "status": "ACTIVE",
      "expires_at": null,
      "created_at": "2026-03-26T10:00:00.000Z"
    }
  ],
  "pagination": {
    "next_cursor": "eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTA2MCJ9",
    "has_more": false
  }
}
```

**Screen Flow:**
- **Flutter/Web:** User navigates to "My Slot Purchases" → App calls this endpoint → Shows purchase history with status

#### 14.6 Get My Slot Balance

**Endpoint:** `GET /teams/slots/mine/balance`

Get user's total available slot balance.

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_slots_purchased": 10,
    "total_slots_used": 3,
    "available_slots": 7,
    "active_purchases": [
      {
        "purchase_id": "507f1f77bcf86cd799439060",
        "package_name": "Starter Pack",
        "slot_count": 5,
        "slots_used": 2,
        "slots_remaining": 3,
        "expires_at": null
      }
    ]
  }
}
```

**Screen Flow:**
- **Flutter/Web:** User opens "My Slots" screen → App calls this endpoint → Shows total available slots and breakdown by purchase

---

### 15. Team Name Reservation

#### 15.1 Check Name Availability

**Endpoint:** `GET /teams/name-reservation/check`

Check if a team name is available for reservation.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Team name to check |

**Example Request:**
```
GET /api/v1/teams/name-reservation/check?name=Thunder%20Strikers
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "name": "Thunder Strikers",
    "normalized_name": "thunderstrikers",
    "is_available": true,
    "is_reserved": false,
    "reserved_by_team_id": null,
    "reserved_until": null
  }
}
```

**Reserved Name Response:**
```json
{
  "status": "success",
  "data": {
    "name": "Thunder Strikers",
    "normalized_name": "thunderstrikers",
    "is_available": false,
    "is_reserved": true,
    "reserved_by_team_id": "507f1f77bcf86cd799439011",
    "reserved_until": "2027-03-26T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Name parameter missing

**Screen Flow:**
- **Flutter/Web:** User types team name in create/edit form → App calls this endpoint on debounce → Shows availability indicator (green checkmark or red X) → If reserved, shows "Name already taken" message

#### 15.2 Get Reservation Pricing

**Endpoint:** `GET /teams/name-reservation/pricing`

Get current pricing for name reservation.

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "price_coins": 1000,
    "price_inr": null,
    "duration_days": 365,
    "is_enabled": true
  }
}
```

**Screen Flow:**
- **Flutter/Web:** User views name reservation option → App calls this endpoint → Shows pricing information → User decides to proceed with reservation

#### 15.3 Initiate Name Reservation

**Endpoint:** `POST /teams/:teamId/name-reservation/initiate`

Initiate a name reservation for a team.

**Authentication:** Required (Team Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Request Body:**
```json
{
  "idempotency_key": "name_res_team123_timestamp"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| idempotency_key | string | Yes | Unique key to prevent duplicate reservations |

**Response:**
```json
{
  "status": "success",
  "data": {
    "reservation_id": "507f1f77bcf86cd799439070",
    "team_id": "507f1f77bcf86cd799439011",
    "name": "Thunder Strikers",
    "normalized_name": "thunderstrikers",
    "price_coins": 1000,
    "status": "PENDING",
    "idempotency_key": "name_res_team123_timestamp",
    "created_at": "2026-03-26T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Validation error
- `402` - Insufficient coins
- `403` - Not team owner
- `404` - Team not found
- `409` - Name already reserved by another team

**Screen Flow:**
- **Flutter/Web:** Owner taps "Reserve Name" → App calls this endpoint → Creates pending reservation → Proceeds to confirmation

#### 15.4 Confirm Name Reservation

**Endpoint:** `POST /teams/:teamId/name-reservation/confirm`

Confirm a pending name reservation and deduct coins.

**Authentication:** Required (Team Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Request Body:**
```json
{
  "idempotency_key": "name_res_team123_timestamp"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| idempotency_key | string | Yes | Idempotency key from initiate response |

**Response:**
```json
{
  "status": "success",
  "data": {
    "reservation_id": "507f1f77bcf86cd799439070",
    "team_id": "507f1f77bcf86cd799439011",
    "name": "Thunder Strikers",
    "normalized_name": "thunderstrikers",
    "coins_deducted": 1000,
    "new_balance": 500,
    "status": "ACTIVE",
    "expires_at": "2027-03-26T10:00:00.000Z",
    "confirmed_at": "2026-03-26T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Invalid idempotency key
- `402` - Insufficient coins
- `403` - Not team owner
- `404` - Reservation not found
- `409` - Reservation already confirmed

**Screen Flow:**
- **Flutter/Web:** Owner confirms reservation → App calls this endpoint → Deducts coins → Shows success screen with expiry date → Team name now shows reserved badge

#### 15.5 Get Reservation Status

**Endpoint:** `GET /teams/:teamId/name-reservation`

Get current name reservation status for a team.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Response:**
```json
{
  "status": "success",
  "data": {
    "is_reserved": true,
    "reservation_id": "507f1f77bcf86cd799439070",
    "name": "Thunder Strikers",
    "normalized_name": "thunderstrikers",
    "status": "ACTIVE",
    "expires_at": "2027-03-26T10:00:00.000Z",
    "created_at": "2026-03-26T10:00:00.000Z"
  }
}
```

**Not Reserved Response:**
```json
{
  "status": "success",
  "data": {
    "is_reserved": false,
    "reservation_id": null,
    "name": null,
    "normalized_name": null,
    "status": null,
    "expires_at": null,
    "created_at": null
  }
}
```

**Screen Flow:**
- **Flutter/Web:** User views team settings → App calls this endpoint → Shows reservation status with expiry date → If active, shows "Release" option → If expiring soon, shows "Renew" option

#### 15.6 Release Reservation

**Endpoint:** `DELETE /teams/:teamId/name-reservation`

Release a name reservation (team owner only).

**Authentication:** Required (Team Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Response:**
```json
{
  "status": "success",
  "message": "Name reservation released successfully"
}
```

**Error Codes:**
- `403` - Not team owner
- `404` - Team or reservation not found

**Side Effects:**
- Name becomes available for other teams to reserve
- No refund is issued

**Screen Flow:**
- **Flutter/Web:** Owner taps "Release Name" → Shows confirmation dialog → User confirms → App calls this endpoint → Shows success message → Name reservation badge removed

#### 15.7 Renew Reservation

**Endpoint:** `POST /teams/:teamId/name-reservation/renew`

Renew an expiring name reservation.

**Authentication:** Required (Team Owner)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| teamId | string | Team ID |

**Request Body:**
```json
{
  "idempotency_key": "name_renew_team123_timestamp"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| idempotency_key | string | Yes | Unique key to prevent duplicate renewals |

**Response:**
```json
{
  "status": "success",
  "data": {
    "reservation_id": "507f1f77bcf86cd799439070",
    "team_id": "507f1f77bcf86cd799439011",
    "name": "Thunder Strikers",
    "coins_deducted": 1000,
    "new_balance": 500,
    "status": "ACTIVE",
    "new_expires_at": "2028-03-26T10:00:00.000Z",
    "renewed_at": "2026-03-26T10:00:00.000Z"
  }
}
```

**Error Codes:**
- `400` - Validation error or reservation not expiring
- `402` - Insufficient coins
- `403` - Not team owner
- `404` - Reservation not found

**Screen Flow:**
- **Flutter/Web:** Owner taps "Renew Name" → Shows renewal confirmation with pricing → User confirms → App calls this endpoint → Deducts coins → Shows success with new expiry date

---

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Validation error - invalid request parameters |
| `401` | Unauthorized - invalid or missing token |
| `403` | Forbidden - insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict - duplicate or already exists |
| `410` | Gone - invite expired |
| `422` | Unprocessable - business rule violation |
| `500` | Internal server error |

---

## Notes

1. **Coins Only:** Team join payments accept ONLY Gold Coins and Diamond Coins. No Razorpay/gateway for team transactions.

2. **Gold Coin Cap:** Gold coins can cover at most 10% of the fee (e.g., ₹49.9 for ₹499 fee).

3. **Fresh URLs:** Media URLs are regenerated on every request - never store them.

4. **Idempotency:** Use idempotency keys to prevent duplicate payments. The key format is: `team_join_{teamId}_user_{userId}`

5. **Dynamic Limits:** Team creation limits come from subscription plan's `max_teams_creatable` field.

6. **Categories:** Team categories must match user's selected interests for the team to be created.

7. **Invite Links:** Invite links expire after 7 days by default.

8. **Prorated Refunds:** When leaving a team, diamonds are refunded proportionally based on remaining membership days.

9. **Slot Add-Ons:** Slot packages allow users to purchase additional team creation slots beyond their plan limit.

10. **Name Reservation:** Reserved names are unique across the platform and prevent other teams from using the same name.
