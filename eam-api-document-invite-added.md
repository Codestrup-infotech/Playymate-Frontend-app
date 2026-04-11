# Playymate Team Module API Documentation

## Table of Contents

1. [Module Architecture Overview](#1-module-architecture-overview)
2. [Models & Data Structures](#2-models--data-structures)
3. [Team Lifecycle States](#3-team-lifecycle-states)
4. [Team Member Roles & Permissions](#4-team-member-roles--permissions)
5. [Payment & Transactions](#5-payment--transactions)
6. [Join Request Flow](#6-join-request-flow)
7. [Core Team APIs](#7-core-team-apis)
8. [Team Slot Sub-Module APIs](#8-team-slot-sub-module-apis)
9. [Team Name Reservation Sub-Module APIs](#9-team-name-reservation-sub-module-apis)
10. [Error Codes Reference](#10-error-codes-reference)

---

## 1. Module Architecture Overview

### Directory Structure

```
src/modules/team/
├── team.controller.js              # Main controller for team CRUD & membership
├── team.service.js                 # Business logic helpers
├── team.model.js                   # Team schema
├── team.routes.js                  # Main routes
├── team.validator.js               # Request validation schemas
├── teamMember.model.js            # Team membership schema
├── teamInvite.model.js            # Invite system schema
├── teamPaymentTransaction.model.js # Payment tracking
├── teamEligibility.service.js     # Eligibility & plan limits
├── joinRequest.service.js         # Join request approval flow logic (NEW)
├── middlewares/
│   └── requireTeamCreation.js      # Team creation/owner/member checks
│
# Sub-modules
├── teamSlot/
│   ├── teamSlot.controller.js      # Slot purchase operations
│   ├── teamSlot.routes.js          # Slot routes
│   ├── teamSlot.validator.js       # Slot validation
│   ├── teamSlotPackage.model.js    # Package definitions
│   └── teamSlotPurchase.model.js    # Purchase tracking
│
├── teamNameReservation/
│   ├── teamNameReservation.controller.js  # Name reservation ops
│   ├── teamNameReservation.routes.js      # Name reservation routes
│   ├── teamNameReservation.validator.js   # Validation
│   ├── teamNameReservation.model.js       # Reservation schema
│   └── teamNameReservationConfig.model.js # Config singleton
```

### Base Path

```
/api/v1/teams
```

### Authentication

All authenticated endpoints require:

- `Authorization: Bearer <jwt_token>` header
- Valid user session with active account status

### Common Middleware Chain

```javascript
userAuth                              // JWT + Session validation
featureGate({ minOnboardingState: 'COMPLETED' })  // Onboarding complete
requireFeature('TEAM_MANAGEMENT')     // Premium feature check (when applicable)
```

---

## 2. Models & Data Structures

### Team Model (`team.model.js`)

```javascript
{
    _id: ObjectId,
    name: String,                     // 2-80 chars
    description: String,              // max 500 chars
    slug: String,                     // unique, auto-generated URL slug
    owner_user_id: ObjectId,          // ref: User
    
    // Category (immutable after creation)
    category_type: String,             // enum: sports, hobbies, additional, activities, nostalgia
    category_value: String,           // e.g., "cricket", "swimming"
    is_primary_sport: Boolean,
    
    // Media (Wasabi keys)
    logo_key: String,
    banner_key: String,
    
    // Visibility
    visibility: String,               // "public" | "private"
    
    // Team Config
    skill_level: String,              // all_levels, beginner, intermediate, advanced, pro
    age_group: String,                // under_18, 18_plus, 25_plus, 35_plus, all_ages
    max_members: Number,              // 2-200, default 15
    location: {
        city: String,
        area: String
    },
    roles_config: {
        co_captain_enabled: Boolean,
        manager_enabled: Boolean,
        coach_enabled: Boolean
    },
    
    // Membership Settings
    membership: {
        is_paid: Boolean,
        fee_amount: Number,
        default_duration_type: String,  // YEARLY only
        allow_duration_choice: Boolean,  // Always false - yearly only
        duration_pricing: {
            YEARLY: { amount: Number }
        },
        welcome_bonus_coins: Number,
        gold_coin_discount_pct: Number,
        // Join Request Flow Settings (NEW)
        join_approval_mode: String,       // "AUTO" | "MANUAL", default "AUTO"
        request_expiry_hours: Number       // Hours before auto-expiry, default 48
    },
    
    // Financial
    total_revenue: Number,
    commission_rate: Number,          // decimal, e.g., 0.10
    
    // Stats
    member_count: Number,
    active_events: Number,
    win_rate: Number,
    
    // Status
    status: String,                   // active, paused, archived
    invite_code: String,              // unique 8-char code
    invite_link: String,
    
    // Name Reservation
    name_reservation: {
        is_reserved: Boolean,
        reservation_id: ObjectId,
        reserved_at: Date,
        expires_at: Date
    },
    
    // Name Conflict (if reserved by another team)
    name_conflict: {
        is_conflicted: Boolean,
        conflicted_since: Date,
        conflict_deadline: Date,
        reservation_id: ObjectId
    },
    
    soft_delete: Boolean,
    deleted_at: Date,
    created_at: Date,
    updated_at: Date
}
```

### TeamMember Model (`teamMember.model.js`)

```javascript
{
    _id: ObjectId,
    team_id: ObjectId,                // ref: Team
    user_id: ObjectId,               // ref: User
    
    role: String,                     // owner, co_captain, manager, coach, member
    status: String,                   // active, pending_payment, pending_approval, invited, suspended, left, removed, rejected (UPDATED)
    
    // Invite tracking
    invited_by: ObjectId,
    invited_at: Date,
    invite_code: String,
    
    // Membership validity
    membership_start: Date,
    membership_end: Date,
    membership_type: String,          // YEARLY, FREE (yearly only)
    
    // Payment reference
    payment_transaction_id: ObjectId,
    
    // Activity tracking
    joined_at: Date,
    left_at: Date,
    removed_by: ObjectId,
    remove_reason: String,
    
    // Join Request Tracking (NEW)
    requested_at: Date,              // When join request was submitted
    reviewed_at: Date,               // When request was reviewed
    reviewed_by: ObjectId,           // Who reviewed (owner/co-captain)
    reject_reason: String,           // Reason if rejected
    
    soft_delete: Boolean,
    created_at: Date
}
```

### TeamPaymentTransaction Model

```javascript
{
    _id: ObjectId,
    team_id: ObjectId,
    user_id: ObjectId,                // joiner
    creator_user_id: ObjectId,        // team owner
    
    // Membership details
    membership_type: String,          // YEARLY (yearly only)
    membership_start: Date,
    membership_end: Date,
    
    // Amounts
    gross_amount: Number,
    gold_coin_discount: Number,
    gold_coins_spent: Number,
    diamond_amount: Number,
    diamonds_spent: Number,
    net_amount: Number,
    
    // Commission
    commission_rate: Number,
    commission_amount: Number,
    creator_earnings: Number,
    
    payment_method: "COINS",
    status: String,                   // PENDING, SUCCESS, FAILED, REFUNDED, PARTIAL_REFUND (UPDATED)
    
    // Refund
    refund_amount: Number,
    refunded_at: Date,
    refund_reason: String,
    diamonds_refunded: Number,
    
    // Approval Status (NEW - for Join Request Flow)
    approval_status: String,         // PENDING, APPROVED, REJECTED, EXPIRED
    approved_at: Date,               // When request was approved
    rejected_at: Date,              // When request was rejected
    reject_reason: String,           // Reason for rejection
    creator_earnings_hold: Number,  // Earnings held until approval
    
    idempotency_key: String,
    failure_reason: String,
    created_at: Date
}
```

---

## 3. Team Lifecycle States

### Team Status

| State    | Description                        |
|----------|------------------------------------|
| `active` | Team is live and accepting members  |
| `paused` | Team is temporarily inactive       |
| `archived` | Team is soft-deleted             |

### TeamMember Status

| State              | Description                                    |
|--------------------|-----------------------------------------------|
| `active`           | Active member with valid membership           |
| `pending_payment`  | Membership initiated but payment not completed |
| `pending_approval` | Payment completed, awaiting owner approval   | (NEW)
| `invited`          | Invited but has not accepted                 |
| `suspended`        | Temporarily suspended                         |
| `left`             | Member voluntarily left                      |
| `removed`          | Removed by owner/co-captain                  |
| `rejected`         | Join request rejected with refund             | (NEW)

### TeamPaymentTransaction Status

| State            | Description                    |
|------------------|--------------------------------|
| `PENDING`        | Payment initiated, awaiting    |
| `SUCCESS`        | Payment completed successfully  |
| `FAILED`         | Payment failed                 |
| `REFUNDED`       | Full refund issued             |
| `PARTIAL_REFUND` | Partial refund on cancellation  |

### Approval Status (NEW - Join Request Flow)

| State       | Description                                 |
|-------------|---------------------------------------------|
| `PENDING`   | Payment done, waiting for owner approval    |
| `APPROVED`  | Request approved, creator credited           |
| `REJECTED`  | Request rejected, refund issued              |
| `EXPIRED`   | Request expired without action               |

---

## 4. Team Member Roles & Permissions

### Role Hierarchy

```
owner > co_captain > manager > coach > member
```

### Role Permissions Matrix

| Action                  | Owner | Co-Captain | Manager | Coach | Member |
|-------------------------|-------|------------|---------|-------|--------|
| Update team profile     | YES   | NO         | NO      | NO    | NO     |
| Archive team            | YES   | NO         | NO      | NO    | NO     |
| Create invites          | YES   | YES        | NO      | NO    | NO     |
| List invites            | YES   | YES        | NO      | NO    | NO     |
| Revoke invites          | YES   | NO         | NO      | NO    | NO     |
| Update member roles     | YES   | YES*       | NO      | NO    | NO     |
| Remove members          | YES   | YES**      | NO      | NO    | NO     |
| View payment reports    | YES   | NO         | NO      | NO    | NO     |
| View member list        | YES   | YES        | YES     | YES   | YES    |
| Leave team              | NO*** | YES        | YES     | YES   | YES    |

\* Co-captain can only assign `member` role  
\*\* Co-captain cannot remove owner  
\*\*\* Owner cannot leave; must archive team

### Role Configuration

Teams can enable/disable roles via `roles_config`:

```javascript
{
    co_captain_enabled: true,  // max 1 per team
    manager_enabled: true,    // max 1 per team
    coach_enabled: false      // max 1 per team
}
```

---

## 5. Payment & Transactions

### Payment Flow (Coins Only)

```
User wants to join team
        │
        ▼
┌───────────────────┐
│  GET /preview     │  Check eligibility, pricing, balances
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ POST /initiate    │  Create PENDING transaction
│                   │  Calculate payment breakdown
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ POST /confirm     │  Deduct coins, update membership
└───────────────────┘
```

### Payment Breakdown Calculation

When joining a paid team:

1. **Gross Amount**: Team's configured fee for selected duration
2. **Gold Coin Discount**: Up to `gold_coin_discount_pct` (default 10%) from user's gold balance
3. **Diamond Payment**: Remaining amount from diamond balance
4. **Net Amount**: What team owner receives (after platform commission)

```javascript
// Example: Joining a team with $100 YEARLY fee
gross_amount = 100
gold_coin_discount = min(gold_balance, 100 * 0.10) = min(50, 10) = 10
net_after_gold = 100 - 10 = 90
diamond_payment = min(diamond_balance_inr, 90)
creator_earnings = net_after_gold * (1 - commission_rate)
```

### Welcome Bonus

- Configurable via `membership.welcome_bonus_coins` (default: 50)
- Credited in gold coins upon successful membership confirmation
- Can be used for future team joins or purchases

### Refund Calculation (On Leave)

When a member leaves:

```
remaining_days = membership_end - current_date
total_days = membership_end - membership_start
refund_ratio = remaining_days / total_days
diamonds_refunded = diamonds_spent * refund_ratio
```

---

## 6. Join Request Flow

### Overview

The Join Request Flow provides payment protection for users and approval control for team owners. When a user pays to join a team, their membership is not automatically granted - it requires approval from the team owner (or co-captain) unless the team is set to AUTO mode.

### Team Settings

Teams can configure the join approval mode:

```javascript
// In team.membership object
{
    join_approval_mode: "AUTO" | "MANUAL",  // Default: "AUTO"
    request_expiry_hours: 48                 // Hours before auto-expiry, default: 48
}
```

- **AUTO**: Members are instantly added after payment (original behavior)
- **MANUAL**: Members must be approved by owner/co-captain after payment

### Flow Diagram

```
User wants to join team (paid)
         │
         ▼
┌───────────────────┐
│  GET /preview     │  Check eligibility, pricing, balances
└─────────┬─────────┘
           │
           ▼
┌───────────────────┐
│ POST /initiate    │  Create PENDING transaction
└─────────┬─────────┘
           │
           ▼
┌───────────────────┐
│ POST /confirm    │  Deduct coins from user
│                   │  (Creator NOT credited yet for MANUAL)
└─────────┬─────────┘
           │
           ▼
┌───────────────────┐
│ Check AUTO/MANUAL│
└─────────┬─────────┘
      ┌────┴────┐
      │ AUTO    │ MANUAL
      ▼         ▼
┌─────────┐ ┌────────────────┐
│ Set     │ │ Set status =  │
│ status  │ │ pending_approval│
│ =active │ └───────┬────────┘
 │ Credit  │         │
 │ creator │         ▼
 │ Credit  │ ┌────────────────┐
 │ welcome │ │ Owner reviews  │
 │ bonus   │ └───────┬────────┘
 └────┬────┘     ┌──┴──┐
      │          ▼     ▼
      │    Accept  Reject
      │       │       │
      │       ▼       ▼
      │  ┌──────┐ ┌────────┐
      │  │status│ │status= │
      │  │=active│ │rejected│
      │  └──┬───┘ │+refund │
      │     │     └────────┘
      └─────┘
```

### Payment Protection

When a user pays to join a team in MANUAL mode:

1. **Coins are deducted** from the user's wallet immediately
2. **Creator earnings are HELD** - not credited until approval
3. **Welcome bonus is NOT credited** until approval
4. If rejected: **Full refund** to user's wallet

### API Endpoints

#### Get Pending Members (Updated)

```
GET /api/v1/teams/:teamId/members/pending
```

**Authentication**: Required (Owner or Co-captain)

**Query Parameters** (optional):

| Param   | Type   | Default | Description                              |
|---------|--------|---------|------------------------------------------|
| `type`  | String | all     | Filter: `payment_pending`, `approval_pending`, `all` |

**Response (200)**:

```json
{
    "status": "success",
    "data": {
        "payment_pending": [
            {
                "_id": "...",
                "user_id": "...",
                "user": {
                    "full_name": "John Doe",
                    "username": "johnd",
                    "profile_image_url": "..."
                },
                "membership_type": "YEARLY",
                "status": "pending_payment",
                "payment_transaction_id": "...",
                "joined_at": "2024-01-01T00:00:00.000Z"
            }
        ],
        "approval_pending": [
            {
                "_id": "...",
                "user_id": "...",
                "user": {
                    "full_name": "Jane Doe",
                    "username": "janed",
                    "profile_image_url": "..."
                },
                "membership_type": "YEARLY",
                "status": "pending_approval",
                "requested_at": "2024-01-01T00:00:00.000Z",
                "payment_status": "SUCCESS",
                "payment_amount": 100,
                "payment_transaction_id": "..."
            }
        ],
        "total_pending": 2
    }
}
```

#### Accept Join Request

```
PATCH /api/v1/teams/:teamId/members/:userId/accept
```

**Authentication**: Required  
**Authorization**: Owner or Co-captain

**Response (200)**:

```json
{
    "status": "success",
    "message": "Join request accepted",
    "data": {
        "user_id": "...",
        "team_id": "...",
        "status": "active"
    }
}
```

**Error Responses**:

| Status | Error Code              | Description                              |
|--------|-------------------------|------------------------------------------|
| 403    | `NOT_AUTHORIZED`        | Only owner or co-captain can accept      |
| 404    | `JOIN_REQUEST_NOT_FOUND` | No pending request found               |
| 409    | `TEAM_FULL`             | Team has reached max members            |

#### Reject Join Request

```
PATCH /api/v1/teams/:teamId/members/:userId/reject
```

**Authentication**: Required  
**Authorization**: Owner or Co-captain

**Request Body**:

| Field    | Type   | Required | Description              |
|----------|--------|----------|------------------------|
| `reason` | String | No       | Reason for rejection   |

**Response (200)**:

```json
{
    "status": "success",
    "message": "Join request rejected and refunded",
    "data": {
        "user_id": "...",
        "team_id": "...",
        "status": "rejected",
        "refund": {
            "gold_coins": 10,
            "diamonds": 90,
            "total_value": 100
        }
    }
}
```

**Error Responses**:

| Status | Error Code              | Description                              |
|--------|-------------------------|------------------------------------------|
| 403    | `NOT_AUTHORIZED`        | Only owner or co-captain can reject      |
| 404    | `JOIN_REQUEST_NOT_FOUND` | No pending request found               |

### Membership Confirm Response

When confirming membership with MANUAL mode:

```json
// AUTO mode (success)
{
    "status": "success",
    "message": "Membership confirmed successfully",
    "data": {
        "team_id": "...",
        "membership_type": "YEARLY",
        "membership_start": "2024-01-01",
        "membership_end": "2025-01-01",
        "status": "active",
        "welcome_bonus_coins": 50,
        "payment_transaction_id": "..."
    }
}

// MANUAL mode (pending approval)
{
    "status": "success",
    "message": "Join request submitted, awaiting approval",
    "data": {
        "team_id": "...",
        "membership_type": "YEARLY",
        "status": "pending_approval",
        "expires_at": "2024-01-03T12:00:00.000Z",
        "payment_transaction_id": "..."
    }
}
```

### Scheduled Job

Expired join requests are automatically processed by a scheduled job:

- **Job File**: `src/jobs/teamJoinRequestExpiry.job.js`
- **Schedule**: Runs hourly
- **Behavior**: Auto-rejects expired requests and issues full refund

The expiry time is configurable per team via `membership.request_expiry_hours` (default: 48 hours).

### Error Codes (Join Request Flow)

| Error Code                    | Description                                    |
|-------------------------------|-----------------------------------------------|
| `JOIN_REQUEST_NOT_FOUND`      | Join request not found                        |
| `JOIN_REQUEST_ALREADY_PENDING`| User already has pending join request         |
| `JOIN_REQUEST_EXPIRED`        | Join request has expired                       |
| `JOIN_REQUEST_ALREADY_PROCESSED` | Request already approved or rejected     |
| `REFUND_FAILED`               | Refund operation failed                       |
| `CREATOR_CREDIT_FAILED`      | Failed to credit creator earnings             |

---

## 7. Scheduled Jobs

### Overview

The Team module includes scheduled background jobs for automated maintenance tasks.

### Team Join Request Expiry Job

**File**: `src/jobs/teamJoinRequestExpiry.job.js`

**Purpose**: Automatically processes expired join requests that have not been reviewed within the configured expiry period.

**Schedule**: Runs hourly (configured via cron)

**Behavior**:
1. Finds all pending approval requests older than `request_expiry_hours` (default: 48 hours)
2. Rejects each expired request
3. Issues full refund (gold coins + diamonds) to the user
4. Updates transaction status to `REFUNDED`
5. Updates member status to `rejected`

**Configuration**:
- Per-team setting: `membership.request_expiry_hours` (default: 48)
- Valid range: 1-168 hours (1 hour to 7 days)

---

## 8. Core Team APIs

### 6.1 Health Check

```
GET /api/v1/teams/health
```

**Authentication**: None

**Response (200)**:

```json
{
    "status": "success",
    "message": "Team module is running"
}
```

---

### 6.2 Generate Media Presigned URL

```
POST /api/v1/teams/media/presign
```

**Authentication**: Required  
**Feature Gate**: `minOnboardingState: COMPLETED`, `TEAM_MANAGEMENT` feature

**Request Body**:

| Field      | Type   | Required | Description                              |
|------------|--------|----------|------------------------------------------|
| `purpose`  | String | YES      | `"logo"` or `"banner"`                   |
| `file_name` | String | YES     | File name with extension                 |
| `mime_type` | String | YES     | `image/jpeg`, `image/png`, `image/webp`  |

**Example Request**:

```json
{
    "purpose": "logo",
    "file_name": "my-team-logo.png",
    "mime_type": "image/png"
}
```

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "presigned_url": "https://s3.wasabi.com/...",
        "key": "teams/user123/logo/my-team-logo.png",
        "expires_in_seconds": 300
    }
}
```

**Error Responses**:

| Status | Error Code       | Message                                              |
|--------|------------------|------------------------------------------------------|
| 400    | `INVALID_PURPOSE` | Invalid purpose. Allowed: logo, banner             |
| 400    | `INVALID_MIME_TYPE` | Invalid mime_type. Allowed: image/jpeg, image/png, image/webp |

---

### 6.3 Check Team Creation Eligibility

```
GET /api/v1/teams/eligibility
```

**Authentication**: Required  
**Feature Gate**: `minOnboardingState: COMPLETED`

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "can_create_team": true,
        "max_teams_allowed": 1,
        "teams_created_count": 0,
        "teams_remaining": 1,
        "limit_source": "feature_fallback",
        "plan_name": "PRO",
        "primary_sport": "cricket",
        "eligible_categories": [
            {
                "category_type": "sports",
                "category_value": "cricket",
                "label": "Sports - cricket",
                "can_create": true,
                "reason": "primary_sport"
            }
        ],
        "kyc_status": "verified",
        "dynamic_categories": true,
        "slot_addons_available": true,
        "available_packages": [...]
    }
}
```

**Denial Reasons**:

| Error Code                    | Status | Description                        |
|-------------------------------|--------|------------------------------------|
| `KYC_NOT_VERIFIED`            | 403    | Complete KYC to create teams       |
| `TEAM_LIMIT_REACHED`          | 403    | Upgrade plan for more teams        |
| `TEAM_CREATION_NOT_ALLOWED`   | 403    | Current plan doesn't allow teams   |

---

### 6.4 Create Team

```
POST /api/v1/teams
```

**Authentication**: Required  
**Feature Gate**: `minOnboardingState: COMPLETED`, `requireTeamCreation` middleware

**Request Body**:

| Field                                   | Type    | Required | Default        | Description                                    |
|-----------------------------------------|---------|----------|----------------|------------------------------------------------|
| `name`                                  | String  | YES      | -              | 2-80 characters                                |
| `description`                           | String  | NO       | null           | max 500 chars                                  |
| `category_type`                         | String  | YES      | -              | `sports`, `hobbies`, `additional`, `activities`, `nostalgia` |
| `category_value`                       | String  | YES      | -              | Specific category value                        |
| `is_primary_sport`                      | Boolean | NO       | false          | Mark as primary sport                          |
| `visibility`                            | String  | NO       | `"public"`     | `public` or `private`                          |
| `skill_level`                           | String  | NO       | `"all_levels"`| `all_levels`, `beginner`, `intermediate`, `advanced`, `pro` |
| `age_group`                             | String  | NO       | `"all_ages"`  | `under_18`, `18_plus`, `25_plus`, `35_plus`, `all_ages` |
| `max_members`                           | Number  | NO       | 15             | 2-200                                          |
| `location.city`                         | String  | NO       | null           | City name                                      |
| `location.area`                         | String  | NO       | null           | Area name                                      |
| `roles_config.co_captain_enabled`       | Boolean | NO       | true           | Enable co-captain role                         |
| `roles_config.manager_enabled`          | Boolean | NO       | true           | Enable manager role                            |
| `roles_config.coach_enabled`            | Boolean | NO       | false          | Enable coach role                              |
| `membership.is_paid`                    | Boolean | NO       | true           | Paid membership                                |
| `membership.fee_amount`                  | Number  | NO       | 0              | Fee per YEARLY duration                       |
| `membership.default_duration_type`      | String  | NO       | `"YEARLY"`     | `YEARLY` (only option)               |
| `membership.allow_duration_choice`       | Boolean | NO       | false          | Not available (yearly only)                     |
| `membership.duration_pricing`           | Object  | NO       | auto-calc      | Duration-specific pricing                      |
| `membership.welcome_bonus_coins`        | Number  | NO       | 50             | max 1000                                       |
| `logo_key`                              | String  | NO       | null           | Wasabi key from presign                        |
| `banner_key`                            | String  | NO       | null           | Wasabi key from presign                        |
| `reserve_name`                          | Boolean | NO       | false          | Reserve team name                              |
| `use_gold_coins`                        | Boolean | NO       | false          | Use gold coins for payment (max 10%)           |
| `name_payment_method`                    | String  | Conditional | -            | `COINS` (required if reserve_name=true) |
| `name_idempotency_key`                  | String  | Conditional | -            | min 10 chars (required if reserve_name=true)   |

**Example Request**:

```json
{
    "name": "Mumbai Cricket Club",
    "description": "Premier cricket team in Mumbai",
    "category_type": "sports",
    "category_value": "cricket",
    "is_primary_sport": true,
    "visibility": "public",
    "skill_level": "intermediate",
    "age_group": "18_plus",
    "max_members": 25,
    "location": {
        "city": "Mumbai",
        "area": "Andheri"
    },
    "membership": {
        "is_paid": true,
        "fee_amount": 500,
        "welcome_bonus_coins": 100
    }
}
```

**Success Response (201)**:

```json
{
    "status": "success",
    "data": {
        "_id": "team_object_id",
        "name": "Mumbai Cricket Club",
        "slug": "mumbai-cricket-club",
        "owner_user_id": "user_object_id",
        "category_type": "sports",
        "category_value": "cricket",
        "visibility": "public",
        "member_count": 1,
        "invite_code": "ABC12345",
        "invite_link": "https://playymate.app/join/ABC12345",
        "created_at": "2024-01-15T10:30:00Z",
        "name_reservation": {
            "status": "RESERVED",
            "reservation_id": "reservation_id",
            "reserved_name": "Mumbai Cricket Club",
            "expires_at": null
        }
    }
}
```

**Error Responses**:

| Status | Error Code                        | Description                         |
|--------|-----------------------------------|-------------------------------------|
| 403    | `KYC_NOT_VERIFIED`               | Complete verification to create teams |
| 403    | `TEAM_LIMIT_REACHED`             | Upgrade to create more teams        |
| 403    | `TEAM_CREATION_NOT_ALLOWED`      | Current plan doesn't allow teams    |
| 403    | `TEAM_CATEGORY_NOT_PRIMARY_SPORT`| Only primary sport can be created   |
| 409    | `TEAM_NAME_RESERVED`             | Name reserved by another team       |
| 409    | `TEAM_DUPLICATE_CATEGORY`        | Already own a team in this category |

---

### 6.5 Get Team Profile

```
GET /api/v1/teams/:teamId
```

**Authentication**: Optional (affects response detail)

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "_id": "team_object_id",
        "name": "Mumbai Cricket Club",
        "description": "Premier cricket team",
        "slug": "mumbai-cricket-club",
        "visibility": "public",
        "skill_level": "intermediate",
        "age_group": "18_plus",
        "max_members": 25,
        "member_count": 15,
        "location": {
            "city": "Mumbai",
            "area": "Andheri"
        },
        "membership": {...},
        "logo_url": "https://wasabi.url/logo.png",
        "banner_url": "https://wasabi.url/banner.png",
        "is_member": true,
        "viewer_membership": {
            "role": "member",
            "membership_end": "2025-01-15T00:00:00Z"
        },
        "members": [
            {
                "_id": "member_id",
                "user_id": "user_id",
                "user": {
                    "full_name": "John Doe",
                    "username": "johnd",
                    "pro file_image_url": "..."
                },
                "role": "owner",
                "status": "active",
                "membership_type": "FREE",
                "joined_at": "2024-01-15T10:30:00Z"
            }
        ]
    }
}
```

**Private Team Response** (for non-members):

```json
{
    "status": "success",
    "data": {
        "_id": "team_id",
        "name": "Private Team",
        "visibility": "private",
        "logo_url": "...",
        "is_member": false,
        "has_pending_invite": true,
        "join_cta_enabled": true
    }
}
```

---

### 6.6 Update Team

```
PATCH /api/v1/teams/:teamId
```

**Authentication**: Required  
**Authorization**: Team Owner only

**Request Body** (all fields optional):

```json
{
    "name": "New Team Name",
    "description": "Updated description",
    "visibility": "private",
    "skill_level": "advanced",
    "age_group": "25_plus",
    "max_members": 30,
    "location": {
        "city": "Delhi",
        "area": "Connaught Place"
    },
    "roles_config": {
        "co_captain_enabled": false
    },
    "membership": {
        "fee_amount": 600,
        "welcome_bonus_coins": 75
    },
    "logo_key": "new-logo-key",
    "banner_key": "new-banner-key",
    "status": "paused"
}
```

**Immutable Fields** (cannot be updated):

- `owner_user_id`
- `category_type`
- `category_value`
- `is_primary_sport`
- `invite_code`

**Success Response (200)**:

```json
{
    "status": "success",
    "data": { /* updated team object */ }
}
```

**Error Responses**:

| Status | Error Code                  | Description                       |
|--------|-----------------------------|-----------------------------------|
| 403    | `NOT_TEAM_OWNER`           | Only owner can update             |
| 404    | `TEAM_NOT_FOUND`           | Team not found                    |
| 409    | `TEAM_NAME_RESERVED`       | Name reserved by another team     |
| 422    | `TEAM_MAX_MEMBERS_TOO_LOW` | Cannot reduce below active members |

---

### 6.7 Archive Team

```
DELETE /api/v1/teams/:teamId
```

**Authentication**: Required  
**Authorization**: Team Owner only

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Team archived successfully",
    "data": {
        "archived_team_id": "team_id",
        "affected_members_count": 14,
        "notifications_queued": false,
        "refunds_initiated": false
    }
}
```

**Error Responses**:

| Status | Error Code         | Description           |
|--------|--------------------|-----------------------|
| 403    | `NOT_TEAM_OWNER`  | Only owner can archive |
| 404    | `TEAM_NOT_FOUND`  | Team not found        |

---

### 6.8 List/Discover Teams

```
GET /api/v1/teams
```

**Authentication**: None

**Query Parameters**:

| Param          | Type    | Default    | Description                    |
|----------------|---------|------------|--------------------------------|
| `category_type` | String  | -          | Filter by category             |
| `category_value` | String | -          | Filter by specific value       |
| `city`          | String  | -          | Filter by city                 |
| `skill_level`   | String  | -          | Filter by skill                |
| `age_group`     | String  | -          | Filter by age group            |
| `has_capacity`  | Boolean | -          | Only teams with space          |
| `sort`          | String  | `"newest"` | `newest`, `members_count`      |
| `limit`         | Number  | 20         | 1-50                           |
| `cursor`        | String  | -          | Pagination cursor               |

**Success Response (200)**:

```json
{
    "status": "success",
    "data": [ /* array of team objects */ ],
    "pagination": {
        "next_cursor": "team_id_for_next_page",
        "has_more": true
    }
}
```

---

### 6.9 Get My Teams

```
GET /api/v1/teams/mine
GET /api/v1/teams/mine/created
GET /api/v1/teams/mine/joined
```

**Authentication**: Required

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "owned": [
            { /* owned team objects with is_owner: true */ }
        ],
        "member": [
            { /* team objects where user is member, with role and membership_end */ }
        ]
    }
}
```

---

### 6.10 Membership Preview

```
GET /api/v1/teams/:teamId/membership/preview
```

**Authentication**: Required

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "team_id": "team_id",
        "membership": {
            "is_paid": true,
            "default_duration_type": "YEARLY",
            "allow_duration_choice": false,
            "gold_coin_discount_pct": 10,
            "duration_pricing": {
                "YEARLY": {
                    "amount": 500,
                    "breakdown": {
                        "gross_amount": 500,
                        "gold_coin_discount": 50,
                        "gold_coins_to_spend": 50,
                        "diamonds_amount": 450,
                        "diamonds_to_spend": 450,
                        "net_payable": 450,
                        "remaining_coins_needed": 0,
                        "insufficient_coins": false
                    }
                }
            }
        },
        "balances": {
            "gold_coins": 120,
            "diamonds": 500,
            "diamond_conversion_rate_inr": 0.01
        }
    }
}
```

**Error Responses**:

| Status | Error Code              | Description                    |
|--------|-------------------------|--------------------------------|
| 403    | `KYC_NOT_VERIFIED`     | Only verified users can join   |
| 403    | `AGE_NOT_ELIGIBLE`     | Age group mismatch             |
| 404    | `TEAM_NOT_FOUND`       | Team not found                 |
| 409    | `TEAM_ALREADY_MEMBER` | Already a member               |
| 409    | `TEAM_FULL`            | No capacity                    |

---

### 6.11 Initiate Membership

```
POST /api/v1/teams/:teamId/membership/initiate
```

**Authentication**: Required

**Request Body**:

```json
{
    "payment_preferences": {
        "use_gold_coins": true,
        "use_diamonds": true
    }
}
```

**Note**: Membership type is automatically set to YEARLY. Users do not select a duration.

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "team_id": "team_id",
        "membership_type": "YEARLY",
        "gross_amount": 500,
        "breakdown": {
            "gold_coin_discount": 50,
            "gold_coins_to_spend": 50,
            "diamonds_amount": 450,
            "diamonds_to_spend": 450
        },
        "net_payable": 450,
        "remaining_coins_needed": 0,
        "insufficient_coins": false,
        "idempotency_key": "team_join_teamId_userId_timestamp"
    }
}
```

**Insufficient Funds Response (200 with insufficient_coins: true)**:

```json
{
    "status": "success",
    "data": {
        "team_id": "team_id",
        "gross_amount": 500,
        "remaining_coins_needed": 200,
        "insufficient_coins": true,
        "error_code": "INSUFFICIENT_COINS",
        "message": "Insufficient coins. Purchase diamonds to join this team.",
        "purchase_redirect_url": "/coins/purchase"
    }
}
```

---

### 6.12 Confirm Membership

```
POST /api/v1/teams/:teamId/membership/confirm
```

**Authentication**: Required

**Request Body**:

```json
{
    "idempotency_key": "team_join_teamId_userId_timestamp"
}
```

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Membership confirmed successfully",
    "data": {
        "team_id": "team_id",
        "membership_type": "YEARLY",
        "membership_start": "2024-01-15T00:00:00Z",
        "membership_end": "2025-01-15T00:00:00Z",
        "welcome_bonus_coins": 50,
        "payment_transaction_id": "tx_id"
    }
}
```

**Business Logic**:

1. Validates pending transaction exists
2. Verifies sufficient coin balance
3. Debits gold coins and diamonds from user
4. Credits welcome bonus coins
5. Updates team owner wallet with earnings
6. Creates payment transaction ledger entries
7. Updates member status to `active`
8. Increments team member_count
9. Sends notifications to user and team owner

---

### 6.13 Join Free Team

```
POST /api/v1/teams/:teamId/join
```

**Authentication**: Required

**Description**:
Directly join a free team (where `membership.is_paid === false`) without going through the payment flow.

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Successfully joined the team",
    "data": {
        "team_id": "team_id",
        "membership_type": "FREE",
        "membership_start": "2024-01-15T00:00:00Z",
        "membership_end": "2025-01-15T00:00:00Z"
    }
}
```

**Error Responses**:

| Status | Error Code                     | Description                          |
|--------|--------------------------------|--------------------------------------|
| 400    | `TEAM_REQUIRES_PAYMENT`       | Team requires payment, use membership flow |
| 403    | `KYC_NOT_VERIFIED`            | Only verified users can join         |
| 403    | `AGE_NOT_ELIGIBLE`            | Age group mismatch                   |
| 404    | `TEAM_NOT_FOUND`              | Team not found                       |
| 409    | `TEAM_ALREADY_MEMBER`         | Already a member                     |
| 409    | `TEAM_FULL`                   | No capacity                          |

**Business Logic**:

1. Validates team exists and is active
2. Checks user is KYC verified
3. Verifies user is not already a member
4. Checks team has not reached max members
5. Validates age group eligibility
6. Confirms team is free (`is_paid === false`)
7. Creates `TeamMember` with status `active` and `membership_type: 'FREE'`
8. Increments team `member_count`
9. Invalidates eligibility cache
10. Notifies team owner

---

### 6.14 Leave Team

```
DELETE /api/v1/teams/:teamId/membership
```

**Authentication**: Required

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Left team successfully",
    "data": {
        "team_id": "team_id",
        "diamonds_refunded": 250,
        "refund_amount": 2.50,
        "gold_coin_refund": 0
    }
}
```

**Business Logic**:

1. Validates active membership exists
2. Calculates refund based on remaining membership days
3. Credits diamonds back to user wallet
4. Updates transaction status to `REFUNDED` or `PARTIAL_REFUND`
5. Updates member status to `left`
6. Decrements team member_count
7. Sends notification to team owner

**Error Responses**:

| Status | Error Code                     | Description              |
|--------|--------------------------------|--------------------------|
| 403    | `OWNER_CANNOT_LEAVE_TEAM`     | Owner must archive instead |
| 404    | `TEAM_MEMBERSHIP_NOT_FOUND`  | Not a member             |

---

### 6.15 Get Team Members

```
GET /api/v1/teams/:teamId/members
```

**Authentication**: Required (must be team member)

**Query Parameters**:

| Param   | Type   | Default | Description           |
|---------|--------|---------|-----------------------|
| `role`  | String | -       | Filter by role        |
| `status` | String | -       | Filter by status      |
| `limit` | Number | 50      | 1-100                 |
| `cursor` | String | -       | Pagination            |

**Success Response (200)**:

```json
{
    "status": "success",
    "data": [
        {
            "_id": "member_id",
            "user_id": "user_id",
            "user": {
                "full_name": "John Doe",
                "username": "johnd",
                "profile_image_url": "..."
            },
            "role": "owner",
            "status": "active",
            "membership_type": "FREE",
            "membership_start": "2024-01-15T00:00:00Z",
            "membership_end": null,
            "joined_at": "2024-01-15T10:30:00Z"
        }
    ],
    "pagination": {
        "next_cursor": "member_id",
        "has_more": false
    }
}
```

---

### 6.15 Update Member Role

```
PATCH /api/v1/teams/:teamId/members/:userId/role
```

**Authentication**: Required  
**Authorization**: Owner or Co-Captain

**Request Body**:

```json
{
    "role": "co_captain"
}
```

**Valid Roles**: `co_captain`, `manager`, `coach`, `member`

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Role updated successfully",
    "data": {
        "user_id": "user_id",
        "role": "co_captain"
    }
}
```

**Constraints**:

- Co-captain can only assign `member` role
- Cannot change owner's role
- Role must be enabled in team's `roles_config`

---

### 6.16 Remove Member

```
DELETE /api/v1/teams/:teamId/members/:userId
```

**Authentication**: Required  
**Authorization**: Owner or Co-Captain

**Request Body** (optional):

```json
{
    "reason": "Violated team rules"
}
```

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Member removed successfully",
    "data": {
        "user_id": "user_id",
        "team_id": "team_id"
    }
}
```

---

### 6.17 Get Pending Members

```
GET /api/v1/teams/:teamId/members/pending
```

**Authentication**: Required  
**Authorization**: Owner or Co-Captain

**Description**: Retrieves all members awaiting payment or approval. Returns both payment-pending and approval-pending members.

**Query Parameters** (optional):

| Param   | Type   | Default | Description                                      |
|---------|--------|---------|--------------------------------------------------|
| `type`  | String | `all`   | Filter: `payment_pending`, `approval_pending`, `all` |

**Response (200)**:

```json
{
    "status": "success",
    "data": {
        "payment_pending": [
            {
                "_id": "member_id",
                "user_id": "user_id",
                "user": {
                    "full_name": "John Doe",
                    "username": "johnd",
                    "profile_image_url": "https://..."
                },
                "membership_type": "YEARLY",
                "status": "pending_payment",
                "payment_transaction_id": "transaction_id",
                "joined_at": "2024-01-15T10:30:00Z"
            }
        ],
        "approval_pending": [
            {
                "_id": "member_id",
                "user_id": "user_id",
                "user": {
                    "full_name": "Jane Doe",
                    "username": "janed",
                    "profile_image_url": "https://..."
                },
                "membership_type": "YEARLY",
                "status": "pending_approval",
                "requested_at": "2024-01-15T10:30:00Z",
                "payment_status": "SUCCESS",
                "payment_amount": 100,
                "payment_transaction_id": "transaction_id"
            }
        ],
        "total_pending": 2
    }
}
```

---

### 6.18 Accept Join Request

```
PATCH /api/v1/teams/:teamId/members/:userId/accept
```

**Authentication**: Required  
**Authorization**: Owner or Co-Captain

**Description**: Approve a pending join request. This credits the team creator's earnings and activates the member.

**Response (200)**:

```json
{
    "status": "success",
    "message": "Join request accepted",
    "data": {
        "user_id": "user_id",
        "team_id": "team_id",
        "status": "active"
    }
}
```

**Error Responses**:

| Status | Error Code              | Description                              |
|--------|-------------------------|------------------------------------------|
| 403    | `NOT_AUTHORIZED`        | Only owner or co-captain can accept      |
| 404    | `JOIN_REQUEST_NOT_FOUND` | No pending request found               |
| 409    | `TEAM_FULL`             | Team has reached max members            |

---

### 6.19 Reject Join Request

```
PATCH /api/v1/teams/:teamId/members/:userId/reject
```

**Authentication**: Required  
**Authorization**: Owner or Co-Captain

**Description**: Reject a pending join request. This issues a full refund to the user (gold coins + diamonds).

**Request Body**:

| Field    | Type   | Required | Description              |
|----------|--------|----------|------------------------|
| `reason` | String | No       | Reason for rejection   |

**Response (200)**:

```json
{
    "status": "success",
    "message": "Join request rejected and refunded",
    "data": {
        "user_id": "user_id",
        "team_id": "team_id",
        "status": "rejected",
        "refund": {
            "gold_coins": 10,
            "diamonds": 90,
            "total_value": 100
        }
    }
}
```

**Error Responses**:

| Status | Error Code              | Description                              |
|--------|-------------------------|------------------------------------------|
| 403    | `NOT_AUTHORIZED`        | Only owner or co-captain can reject      |
| 404    | `JOIN_REQUEST_NOT_FOUND` | No pending request found               |

---

### 6.20 Create Invite

```
POST /api/v1/teams/:teamId/invites
```

**Authentication**: Required  
**Authorization**: Owner or Co-Captain

**Request Body**:

```json
{
    "invite_type": "link",
    "invited_user_id": null
}
```

| Field             | Type   | Default  | Description                       |
|-------------------|--------|----------|-----------------------------------|
| `invite_type`     | String | `"link"` | `direct`, `link`, `qr`           |
| `invited_user_id` | String | null     | Required for `direct` invites     |
| `invited_user_ids` | Array  | null     | Optional: Array of user IDs for bulk invite (max 10) |

**Success Response (201)**:

```json
{
    "status": "success",
    "data": {
        "invite_id": "invite_id",
        "invite_code": "XYZ789ABC123",
        "invite_link": "https://playymate.app/join/XYZ789ABC123",
        "invite_type": "link",
        "expires_at": "2024-01-22T10:30:00Z"
    }
}
```

---

### 6.18 List Team Invites

```
GET /api/v1/teams/:teamId/invites
```

**Authentication**: Required  
**Authorization**: Owner or Co-Captain

**Query Parameters**:

| Parameter | Type   | Required | Description                            |
|-----------|--------|----------|----------------------------------------|
| `status`  | String | No       | Filter by: `pending`, `accepted`, `declined`, `expired`, `revoked` |
| `page`    | Number | No       | Page number (default: 1)              |
| `limit`   | Number | No       | Items per page (default: 20, max: 100) |

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "invites": [
            {
                "invite_id": "invite_id",
                "invite_code": "XYZ789ABC123",
                "invite_type": "link",
                "status": "pending",
                "expires_at": "2026-04-08T10:30:00Z",
                "accepted_at": null,
                "declined_at": null,
                "created_at": "2026-04-01T10:30:00Z",
                "invited_by": {
                    "user_id": "user_id",
                    "full_name": "John Doe",
                    "avatar_url": "https://..."
                },
                "invited_user": null,
                "invite_link": "https://playymate.app/join/XYZ789ABC123"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 25,
            "pages": 2
        }
    }
}
```

---

### 6.19 Get My Invites

```
GET /api/v1/teams/invites/mine
```

**Authentication**: Required

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "invites": [
            {
                "invite_id": "invite_id",
                "invite_code": "XYZ789ABC123",
                "invite_type": "direct",
                "status": "accepted",
                "expires_at": "2026-04-08T10:30:00Z",
                "accepted_at": "2026-04-02T15:20:00Z",
                "invited_at": "2026-04-01T10:30:00Z",
                "joined_team": false,
                "team": {
                    "team_id": "team_id",
                    "name": "Mumbai Cricket Club",
                    "category_type": "sports",
                    "category_value": "cricket",
                    "visibility": "public",
                    "description": "Premier cricket team",
                    "member_count": 15,
                    "max_members": 25
                }
            }
        ],
        "count": 1
    }
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `status` | String | Invite status: `pending` or `accepted` |
| `accepted_at` | Date | When the invite was accepted (null if pending) |
| `joined_team` | Boolean | `true` if user has already joined the team (active or pending_payment), `false` if accepted but not yet joined |

**Note**: This endpoint returns both pending and accepted invites sent to the current user. Expired pending invites are automatically marked as expired and excluded from the response. Accepted invites past expiry are still shown to allow users to attempt joining (payment flow will handle capacity/expiry checks).

**Use Case**: Users can filter by `status === 'accepted' && joined_team === false` to see invites they've accepted but haven't completed the payment/join flow yet, allowing them to resume the join process.

---

### 6.20 Resolve Invite

```
GET /api/v1/teams/invites/:inviteCode
```

**Authentication**: Optional

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "team_id": "team_id",
        "team_name": "Mumbai Cricket Club",
        "category_type": "sports",
        "visibility": "public",
        "description": "...",
        "member_count": 15,
        "max_members": 25,
        "membership": {...},
        "logo_url": "...",
        "is_member": false,
        "invite_valid": true
    }
}
```

---

### 6.21 Accept Invite

```
POST /api/v1/teams/invites/:inviteCode/accept
```

**Authentication**: Required

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Invite accepted successfully",
    "data": {
        "team_id": "team_id",
        "team_name": "Mumbai Cricket Club",
        "redirect_to": "/teams/team_id/membership/preview"
    }
}
```

---

### 6.22 Decline Invite

```
POST /api/v1/teams/invites/:inviteCode/decline
```

**Authentication**: Required

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Invite declined successfully"
}
```

---

### 6.23 Revoke Invite

```
DELETE /api/v1/teams/:teamId/invites/:inviteId
```

**Authentication**: Required  
**Authorization**: Team Owner only

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Invite revoked successfully"
}
```

---

### 6.22 Get Payment Transactions

```
GET /api/v1/teams/:teamId/payments
```

**Authentication**: Required  
**Authorization**: Team Owner only

**Query Parameters**:

| Param       | Type   | Default | Description          |
|-------------|--------|---------|----------------------|
| `page`      | Number | 1       | Page number          |
| `limit`     | Number | 20      | Results per page     |
| `status`    | String | -       | Filter by status     |
| `start_date` | Date  | -       | Filter from date     |
| `end_date`  | Date   | -       | Filter to date       |

**Success Response (200)**:

```json
{
    "status": "success",
    "data": [
        {
            "_id": "tx_id",
            "user_id": "user_id",
            "user_name": "John Doe",
            "membership_type": "YEARLY",
            "gross_amount": 500,
            "gold_coins_spent": 50,
            "diamonds_spent": 450,
            "creator_earnings": 450,
            "platform_commission": 50,
            "status": "SUCCESS",
            "created_at": "2024-01-15T10:30:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 45,
        "pages": 3
    }
}
```

---

### 6.24 Get Payment Summary

```
GET /api/v1/teams/:teamId/payments/summary
```

**Authentication**: Required  
**Authorization**: Team Owner only

**Query Parameters**:

| Param   | Type   | Default | Description        |
|---------|--------|---------|--------------------|
| `period` | Number | 30     | Days to analyze    |

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "period_days": 30,
        "summary": {
            "total_collected": 5000,
            "total_creator_earnings": 4500,
            "total_platform_commission": 500,
            "total_gold_coins_spent": 500,
            "total_diamonds_spent": 4500,
            "total_transactions": 10,
            "pending_payments": 2,
            "total_refunded": 500,
            "refunded_count": 1
        },
        "wallet_balance": {
            "available": 4500,
            "gold_coins": 200,
            "diamonds": 5000
        },
        "trend": [
            { "date": "2024-01-15", "amount": 500, "count": 1 },
            { "date": "2024-01-16", "amount": 1000, "count": 2 }
        ]
    }
}
```

---

    ## 7. Team Slot Sub-Module APIs

    ### Overview

    Allows users to purchase additional team creation slots beyond their subscription plan limit.

    **Base Path**: `/api/v1/teams`

    ### 7.1 List Slot Packages

    ```
    GET /api/v1/teams/slot-packages
    ```

    **Authentication**: Required

    **Success Response (200)**:

    ```json
    {
        "status": "success",
        "data": [
            {
                "_id": "package_id",
                "name": "Starter Pack",
                "key": "starter_pack",
                "description": "Create 1 extra team",
                "slots_granted": 1,
                "price_coins": 500,
                "slots_expiry": {
                    "type": "NEVER",
                    "value": null
                },
                "is_popular": false,
                "badge_text": null
            },
            {
                "_id": "package_id_2",
                "name": "Pro Pack",
                "key": "pro_pack",
                "description": "Create 3 extra teams",
                "slots_granted": 3,
                "price_coins": 1200,
                "is_popular": true,
                "badge_text": "Best Value"
            }
        ]
    }
    ```

    ---

    ### 7.2 Get Slot Package Detail

    ```
    GET /api/v1/teams/slot-packages/:packageId
    ```

    **Authentication**: Required

    **Success Response (200)**:

    ```json
    {
        "status": "success",
        "data": {
            "_id": "package_id",
            "name": "Pro Pack",
            "key": "pro_pack",
            "description": "Create 3 extra teams",
            "slots_granted": 3,
            "price_coins": 1200,
            "slots_expiry": {
                "type": "MONTHS",
                "value": 12
            },
            "refunds_allowed": false,
            "display_order": 1,
            "is_popular": true,
            "badge_text": "Best Value"
        }
    }
    ```

    ---

    ### 7.3 Initiate Slot Purchase

    ```
    POST /api/v1/teams/slots/initiate
    ```

    **Authentication**: Required

    **Request Body**:

    ```json
    {
        "package_id": "package_id",
        "idempotency_key": "unique_key_at_least_10_chars",
        "use_gold_coins": false
    }
    ```

    **Success Response (200)**:

    ```json
    {
        "status": "success",
        "data": {
            "purchase_id": "purchase_id",
            "slots_granted": 3,
            "total_price": 1200,
            "gold_coins_to_use": 0,
            "diamond_coins_to_use": 1200,
            "new_gold_balance": 100,
            "new_diamond_balance": 800,
            "expires_at": null,
            "idempotency_key": "unique_key_at_least_10_chars"
        }
    }
    ```

    **Error Responses**:

    | Status | Error Code                   | Description                      |
    |--------|------------------------------|----------------------------------|
    | 403    | `FEATURE_DISABLED`          | Slot add-ons disabled            |
    | 403    | `SUBSCRIPTION_REQUIRED`     | Active subscription required     |
    | 403    | `KYC_NOT_VERIFIED`          | KYC verification required        |
    | 403    | `PURCHASE_LIMIT_REACHED`    | Max purchases reached            |
    | 402    | `INSUFFICIENT_COINS`        | Not enough coins                 |
    | 402    | `INSUFFICIENT_DIAMOND_COINS` | Not enough diamond coins       |

    ---

    ### 7.4 Confirm Slot Purchase

    ```
    POST /api/v1/teams/slots/confirm
    ```

    **Authentication**: Required

    **Request Body**:

    ```json
    {
        "idempotency_key": "unique_key_at_least_10_chars"
    }
    ```

    **Success Response (200)**:

    ```json
    {
        "status": "success",
        "message": "Slot purchase confirmed successfully",
        "data": {
            "purchase_id": "purchase_id",
            "slots_granted": 3,
            "slots_remaining": 3,
            "expires_at": null,
            "status": "ACTIVE",
            "gold_coins_used": 0,
            "diamond_coins_used": 1200
        }
    }
    ```

    ---

    ### 7.5 Get My Slot Purchases

    ```
    GET /api/v1/teams/slots/mine
    ```

    **Authentication**: Required

    **Query Parameters**:

    | Param   | Type   | Default | Description                              |
    |---------|--------|---------|------------------------------------------|
    | `page`  | Number | 1       | Page number                              |
    | `limit` | Number | 20      | 1-100                                    |
    | `status` | String | -       | `PENDING`, `ACTIVE`, `EXPIRED`, `REFUNDED` |

    **Success Response (200)**:

    ```json
    {
        "status": "success",
        "data": [
            {
                "_id": "purchase_id",
                "package": {
                    "_id": "package_id",
                    "name": "Pro Pack",
                    "key": "pro_pack"
                },
                "slots_granted": 3,
                "slots_used": 1,
                "slots_remaining": 2,
                "expires_at": "2025-01-15T00:00:00Z",
                "coins_spent": 1200,
                "status": "ACTIVE",
                "created_at": "2024-01-15T10:30:00Z"
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 1,
            "pages": 1
        }
    }
    ```

    ---

    ### 7.6 Get My Slot Balance

    ```
    GET /api/v1/teams/slots/mine/balance
    ```

    **Authentication**: Required

    **Success Response (200)**:

    ```json
    {
        "status": "success",
        "data": {
            "total_available_slots": 5,
            "active_purchases": [
                {
                    "package_snapshot": {
                        "name": "Pro Pack",
                        "slots_granted": 3
                    },
                    "slots_granted": 3,
                    "slots_used": 1,
                    "slots_remaining": 2,
                    "expires_at": null,
                    "created_at": "2024-01-15T10:30:00Z"
                },
                {
                    "package_snapshot": {
                        "name": "Starter Pack",
                        "slots_granted": 2
                    },
                    "slots_granted": 2,
                    "slots_used": 0,
                    "slots_remaining": 2,
                    "expires_at": "2025-01-15T00:00:00Z",
                    "created_at": "2024-01-10T10:30:00Z"
                }
            ]
        }
    }
```

---

## 8. Team Name Reservation Sub-Module APIs

### Overview

Allows team owners to reserve their team name, preventing others from using the same name.

**Base Path**: `/api/v1/teams`

### 8.1 Check Name Availability

```
GET /api/v1/teams/name-reservation/check?name=TeamName
```

**Authentication**: Required

**Query Parameters**:

| Param | Type   | Required | Description               |
|-------|--------|----------|---------------------------|
| `name` | String | YES      | Team name to check (2-50 chars) |

**Success Response (200) - Available**:

```json
{
    "status": "success",
    "data": {
        "name": "Mumbai Cricket Club",
        "normalized": "mumbairicketclub",
        "is_reserved": false,
        "is_reservable": true,
        "pricing": {
            "coins": 1000,
            "max_gold_coin_percentage": 10
        }
    }
}
```

**Success Response (200) - Reserved**:

```json
{
    "status": "success",
    "data": {
        "name": "Mumbai Cricket Club",
        "normalized": "mumbairicketclub",
        "is_reserved": true,
        "is_reservable": false,
        "reserved_by_team": "Some Other Team",
        "expires_at": null,
        "pricing": {
            "coins": 1000,
            "max_gold_coin_percentage": 10
        }
    }
}
```

---

### 8.2 Get Reservation Pricing

```
GET /api/v1/teams/name-reservation/pricing
```

**Authentication**: Required

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "price_coins": 1000,
        "max_gold_coin_percentage": 10,
        "default_expiry": {
            "type": "NEVER",
            "value": null
        },
        "conflict_notification_deadline_days": 7,
        "is_enabled": true
    }
}
```

---

### 8.3 Initiate Name Reservation

```
POST /api/v1/teams/:teamId/name-reservation/initiate
```

**Authentication**: Required  
**Authorization**: Team Owner only

**Request Body**:

```json
{
    "use_gold_coins": true,
    "idempotency_key": "unique_key"
}
```

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `use_gold_coins` | Boolean | No | Use gold coins for payment (max 10% of total). Default: false |
| `idempotency_key` | String | Yes | Unique key to prevent duplicate reservations |

**Payment Logic**:
- If `use_gold_coins = false`: Uses diamond coins for full payment
- If `use_gold_coins = true`: Uses up to 10% gold coins + diamond coins for remaining

**Example (1000 coin price)**:
- `use_gold_coins = false`: 1000 diamond coins
- `use_gold_coins = true`: 100 gold coins (10% max) + 900 diamond coins

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "reservation_id": "reservation_id",
        "reserved_name": "Mumbai Cricket Club",
        "normalized_name": "mumbairicketclub",
        "price_breakdown": {
            "total_coins": 1000,
            "gold_coins": 100,
            "diamond_coins": 900
        },
        "new_balances": {
            "gold_coins": 50,
            "diamond_coins": 100
        },
        "max_gold_coin_percentage": 10,
        "expires_at": null,
        "idempotency_key": "unique_key"
    }
}
```

**Error Responses**:

| Status | Error Code               | Description                         |
|--------|--------------------------|-------------------------------------|
| 403    | `NOT_TEAM_OWNER`        | Only owner can reserve              |
| 404    | `TEAM_NOT_FOUND`        | Team not found                      |
| 409    | `NAME_ALREADY_RESERVED` | Team already has reservation        |
| 409    | `TEAM_NAME_RESERVED`   | Name reserved by another team       |
| 402    | `INSUFFICIENT_COINS`   | Not enough coins                    |

---

### 8.4 Confirm Name Reservation

```
POST /api/v1/teams/:teamId/name-reservation/confirm
```

**Authentication**: Required  
**Authorization**: Team Owner only

**Request Body**:

```json
{
    "idempotency_key": "unique_key"
}
```

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Name reservation confirmed successfully",
    "data": {
        "reservation_id": "reservation_id",
        "reserved_name": "Mumbai Cricket Club",
        "expires_at": null,
        "conflicts_notified": 0,
        "status": "ACTIVE"
    }
}
```

**Business Logic**:

1. Debits coins from user
2. Creates reservation record
3. Updates team's `name_reservation` block
4. Finds conflicting teams with same name
5. Creates conflict records for conflicting teams
6. Sends notifications to conflicting team owners

---

### 8.5 Get Reservation Status

```
GET /api/v1/teams/:teamId/name-reservation
```

**Authentication**: Required

**Success Response (200)**:

```json
{
    "status": "success",
    "data": {
        "team_name": "Mumbai Cricket Club",
        "name_reservation": {
            "is_reserved": true,
            "reservation_id": "reservation_id",
            "reserved_at": "2024-01-15T10:30:00Z",
            "expires_at": null
        },
        "name_conflict": {
            "is_conflicted": false,
            "conflicted_since": null,
            "conflict_deadline": null
        },
        "reservation": {
            "_id": "reservation_id",
            "status": "ACTIVE",
            "reserved_name": "Mumbai Cricket Club",
            "expires_at": null,
            "conflicts_notified": []
        }
    }
}
```

---

### 8.6 Release Reservation

```
DELETE /api/v1/teams/:teamId/name-reservation
```

**Authentication**: Required  
**Authorization**: Team Owner only

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Name reservation released successfully",
    "data": {
        "reservation_id": "reservation_id",
        "conflicting_teams_resolved": 2
    }
}
```

**Business Logic**:

1. Updates reservation status to `RELEASED`
2. Clears team's `name_reservation` block
3. Resolves all conflict records
4. Notifies conflicting teams that conflict is resolved

---

### 8.7 Renew Reservation

```
POST /api/v1/teams/:teamId/name-reservation/renew
```

**Authentication**: Required  
**Authorization**: Team Owner only

**Request Body**:

```json
{
    "idempotency_key": "unique_key"
}
```

**Success Response (200)**:

```json
{
    "status": "success",
    "message": "Name reservation renewed successfully",
    "data": {
        "reservation_id": "reservation_id",
        "reserved_name": "Mumbai Cricket Club",
        "expires_at": "2026-01-15T00:00:00Z",
        "coins_deducted": 1000
    }
}
```

---

## 9. Error Codes Reference

### Authentication & Authorization

| Error Code           | HTTP Status | Description                   |
|----------------------|-------------|-------------------------------|
| `UNAUTHORIZED`       | 401         | Missing or invalid auth token |
| `SESSION_EXPIRED`    | 401         | User session expired          |
| `FORBIDDEN`          | 403         | Account not active            |
| `NOT_TEAM_OWNER`     | 403         | Not the team owner            |
| `NOT_TEAM_MEMBER`    | 403         | Not a team member             |
| `NOT_AUTHORIZED`     | 403         | Insufficient permissions      |

### Validation & Business Rules

| Error Code              | HTTP Status | Description                    |
|-------------------------|-------------|--------------------------------|
| `VALIDATION_ERROR`      | 400         | Request validation failed      |
| `TEAM_NOT_FOUND`        | 404         | Team does not exist            |
| `TEAM_MEMBER_NOT_FOUND` | 404         | Member does not exist          |
| `INVITE_NOT_FOUND`      | 404         | Invite does not exist          |
| `TEAM_ALREADY_MEMBER`   | 409         | Already a team member          |
| `TEAM_FULL`             | 409         | Team at max capacity          |
| `TEAM_NAME_RESERVED`    | 409         | Name reserved by another      |
| `INVITE_EXPIRED`        | 410         | Invite code has expired        |

### Eligibility

| Error Code                         | HTTP Status | Description                         |
|------------------------------------|-------------|-------------------------------------|
| `KYC_NOT_VERIFIED`                | 403         | KYC verification required           |
| `AGE_NOT_ELIGIBLE`               | 403         | Age group mismatch                  |
| `TEAM_LIMIT_REACHED`             | 403         | Cannot create more teams           |
| `TEAM_CREATION_NOT_ALLOWED`      | 403         | Plan doesn't allow teams           |
| `TEAM_CATEGORY_NOT_PRIMARY_SPORT` | 422         | Secondary sport can only join       |
| `TEAM_DUPLICATE_CATEGORY`         | 409         | Already own team in category        |
| `TEAM_MAX_MEMBERS_TOO_LOW`        | 422         | Cannot reduce below current         |

### Payment

| Error Code                   | HTTP Status | Description                    |
|------------------------------|-------------|--------------------------------|
| `INSUFFICIENT_COINS`        | 402         | Not enough coins for payment   |
| `INSUFFICIENT_DIAMOND_COINS` | 402        | Not enough diamond coins       |
| `INSUFFICIENT_GOLD_COINS`   | 402         | Not enough gold coins         |
| `FEATURE_DISABLED`          | 403         | Feature is disabled            |
| `SUBSCRIPTION_REQUIRED`     | 403         | Active subscription needed     |
| `PURCHASE_LIMIT_REACHED`    | 403         | Max purchases reached          |

### Ownership Restrictions

| Error Code                   | HTTP Status | Description                   |
|------------------------------|-------------|-------------------------------|
| `OWNER_CANNOT_LEAVE_TEAM`   | 403         | Owner must archive            |
| `CANNOT_CHANGE_OWNER_ROLE`  | 422         | Cannot change owner role      |
| `CANNOT_REMOVE_OWNER`       | 422         | Cannot remove team owner      |
| `ROLE_ALREADY_EXISTS`       | 409         | Role slot filled              |
| `ROLE_NOT_ENABLED`          | 422         | Role not enabled in config    |

### Internal Errors

| Error Code                         | HTTP Status | Description                    |
|------------------------------------|-------------|--------------------------------|
| `TEAM_CREATE_ERROR`               | 500         | Failed to create team          |
| `TEAM_UPDATE_ERROR`               | 500         | Failed to update team          |
| `TEAM_ARCHIVE_ERROR`              | 500         | Failed to archive team         |
| `TEAM_MEMBERSHIP_INITIATE_ERROR`  | 500         | Failed to initiate membership  |
| `TEAM_MEMBERSHIP_CONFIRM_ERROR`   | 500         | Failed to confirm membership   |
| `ELIGIBILITY_ERROR`               | 500         | Failed to check eligibility    |
| `PRESIGN_ERROR`                   | 500         | Failed to generate presigned URL |

---

## Related Modules Integration

### Monetization (`src/modules/monetization/`)

| Model                  | Usage in Teams                                   |
|------------------------|--------------------------------------------------|
| `GoldCoinLedger`       | Tracks gold coin debits/credits for membership   |
| `DiamondLedger`        | Tracks diamond coin payments and refunds          |
| `UserWallet`           | Stores user's coin balances                      |
| `WalletLedger`         | Records wallet transactions (creator earnings)    |
| `UserSubscription`    | Determines team creation limits                  |
| `SubscriptionPlan`     | Contains `max_teams_creatable` limit              |
| `Commission`           | Platform commission rate for team earnings       |
| `CoinSettings`         | Diamond conversion rate                          |

### Notification (`src/modules/notifications/`)

The `appNotificationService.notify()` is called for:

- `team_member_joined` - Owner notified when member joins
- `team_membership_confirmed` - Member notified on successful join
- `team_member_left` - Owner notified when member leaves
- `team_member_removed` - Member notified when removed
- `team_role_updated` - Member notified of role change
- `team_invite_received` - User notified of direct invite
- `team_invite_declined` - Inviter notified of decline
- `team_invite_revoked` - Invitee notified of revocation
- `team_payment_failed` - User notified of payment failure
- `team_name_reserved_success` - Owner notified of reservation
- `team_name_conflict_warning` - Conflicting team owner notified
- `team_slot_purchase_success` - User notified of slot purchase

### Join Request Flow Notifications (NEW)

- `team_join_request_pending` - User notified when payment successful but awaiting approval
- `team_join_request_received` - Owner notified of new join request requiring review
- `team_join_request_accepted` - User notified when request is approved
- `team_join_request_rejected` - User notified when request is rejected with refund

### User (`src/modules/user/`)

- `User.model` - User profile, KYC status, interests
- User's `dob` used for age group eligibility
- User's `interests` used to validate team category

### Questionnaire (`src/modules/questionnaire/`)

- `QuestionnaireCategory` - Dynamic category types
- `QuestionnaireItem` - Dynamic category values
- `UserQuestionnaireSelection` - User's selected interests

### Storage

- `wasabi.helper` - Generates presigned URLs for team media uploads









analyse the current flow and plans of project after that i want to make a implementation plan of after that make a implementation plan i want to tell you the flow 
so current flow you know 
after that i want user creates own team and other users sees this team and when other users join this team makes payment after that automatically sends request to the team owner and that owner sees request in the   http://localhost:3000/teams/my-team/69d8ce19fdceb0f71ef0b1c3   this page in request tab 

