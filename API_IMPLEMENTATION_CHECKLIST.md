# 🚀 SUBSCRIPTION & WALLET - API CHECKLIST FOR DEVELOPERS

## QUICK START CHECKLIST

Use this checklist while building your backend APIs. Cross off each as you implement.

---

## SECTION 1: SUBSCRIPTION APIS

### User APIs (Public)
```
ENDPOINT: GET /api/v1/subscriptions/plans
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Get all available subscription plans
├─ Response: Array of plans with pricing, features, coins
├─ No Auth: Public (accessible to guests)
├─ Filters: None
└─ Notes: Should show all active plans

ENDPOINT: POST /api/v1/subscriptions/purchase
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: User purchases subscription
├─ Auth: Required (JWT)
├─ Request Body:
│   {
│     "plan_id": "string",
│     "duration": "MONTHLY" | "YEARLY",
│     "payment_method": "CARD" | "UPI" | "WALLET" | "RAZORPAY"
│   }
├─ Response:
│   {
│     "subscription_id": "string",
│     "status": "ACTIVE",
│     "coins_credited": number,
│     "next_billing_date": "2026-03-01T00:00:00Z",
│     "plan_name": "Pro",
│     "price": 299,
│     "valid_until": "2026-03-01T23:59:59Z"
│   }
├─ Business Logic:
│   1. Verify plan exists & is ACTIVE
│   2. Check if user already has active subscription
│      └─ If YES: Return error or option to upgrade
│   3. Process payment via Razorpay
│   4. On success:
│      ├─ Create subscription record
│      ├─ Calculate coins = price / conversion_rate
│      ├─ Create coin ledger entry
│      ├─ Set expiry date (start_date + duration)
│      ├─ Send confirmation email
│      └─ Return success
│   5. On failure:
│      ├─ Refund if charged
│      └─ Return error
├─ Error Codes:
│   - PLAN_NOT_FOUND (404)
│   - PLAN_INACTIVE (400)
│   - SUBSCRIPTION_ALREADY_ACTIVE (400)
│   - PAYMENT_FAILED (402)
│   - INVALID_DURATION (400)
└─ Logging: Log every successful purchase

ENDPOINT: GET /api/v1/subscriptions/me
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Get current user's active subscription
├─ Auth: Required
├─ Response:
│   {
│     "subscription_id": "string",
│     "plan_name": "Pro",
│     "status": "ACTIVE",
│     "price": 299,
│     "start_date": "2026-02-01T00:00:00Z",
│     "end_date": "2026-03-01T23:59:59Z",
│     "billing_cycle": "MONTHLY",
│     "auto_renew": true,
│     "coins_monthly": 800,
│     "coins_remaining": 750,
│     "features": ["Teams", "Advanced AI", "No Ads"],
│     "payment_method": "CARD",
│     "next_renewal": "2026-03-01T23:59:59Z"
│   }
├─ Edge Case: If no subscription:
│   └─ Return 404 or { "subscription": null }
└─ Caching: Cache for 5 minutes

ENDPOINT: PUT /api/v1/subscriptions/me/cancel
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Cancel user's subscription
├─ Auth: Required
├─ Request Body:
│   {
│     "reason": "string (optional)",
│     "refund_request": boolean
│   }
├─ Response:
│   {
│     "status": "CANCELLED",
│     "cancellation_date": "2026-02-28T15:00:00Z",
│     "refund_eligible": true,
│     "refund_amount": 150,
│     "message": "Subscription cancelled. Refund initiated."
│   }
├─ Business Logic:
│   1. Check user has active subscription
│   2. Mark subscription as CANCELLED
│   3. Calculate refund based on:
│      ├─ Pro-rata if within 30 days
│      ├─ Full if within 7 days
│      └─ Determine refund destination
│   4. Mark coins as EXPIRED immediately
│   5. Process refund (if applicable)
│   6. Send cancellation email
├─ Coin Handling:
│   - Coins DO NOT transfer back
│   - Coins DO NOT get refunded
│   - Coins marked EXPIRED immediately
│   - User loses unused coins
└─ Notifications: Email confirmation

ENDPOINT: GET /api/v1/subscriptions/compare
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Get comparison of all plans
├─ Auth: Not required
├─ Response: Structured comparison table
│   {
│     "plans": [
│       {
│         "id": "plan_free",
│         "name": "Free",
│         "price_monthly": 0,
│         "price_yearly": 0,
│         "coins_monthly": 0,
│         "features": {
│           "teams": 2,
│           "events": 3,
│           "ai_level": "BASIC"
│         }
│       },
│       ...
│     ]
│   }
└─ Use: For plan selection UI
```

### Admin APIs
```
ENDPOINT: GET /api/v1/admin/subscriptions/users
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: View all users with subscriptions
├─ Auth: Admin role required
├─ Query Params:
│   - plan_id (filter by plan)
│   - status (ACTIVE/EXPIRED/CANCELLED)
│   - active_only (boolean)
│   - page (pagination)
│   - limit (25 default, 100 max)
├─ Response: Paginated list with:
│   ├─ user_id
│   ├─ username
│   ├─ plan_name
│   ├─ status
│   ├─ renewal_date
│   ├─ coins_balance
│   └─ joined_date
└─ Filtering: Multiple filters applicable

ENDPOINT: GET /api/v1/admin/subscriptions/user/:userId
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: View specific user's subscription details
├─ Auth: Admin required
├─ Response: Full subscription details + payment history
├─ Shows:
│   ├─ Current subscription
│   ├─ Previous subscriptions
│   ├─ Payment history
│   ├─ Coins ledger (last 50 entries)
│   └─ Renewal history
└─ Related Data: Link to wallet view

ENDPOINT: POST /api/v1/admin/subscriptions/extend
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Extend user's subscription (goodwill)
├─ Auth: Admin required
├─ Request:
│   {
│     "user_id": "string",
│     "days": 30,
│     "reason": "Goodwill - Service outage"
│   }
├─ Response: Updated subscription with new expiry
├─ Action Logged: Yes (audit trail)
├─ Notifications: User emailed about extension
└─ Coins: NOT added (extension only, no new coins)

ENDPOINT: POST /api/v1/admin/subscriptions/revoke
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Revoke user's subscription (penalty)
├─ Auth: Admin required
├─ Request:
│   {
│     "user_id": "string",
│     "reason": "Fraud detected"
│   }
├─ Response: Subscription revoked, coins expired
├─ Action Logged: Yes
├─ Coins: Marked EXPIRED immediately
├─ Refund: Auto-process if within grace period
└─ Notifications: Suspension notice emailed
```

### Super Admin APIs
```
ENDPOINT: POST /api/v1/superadmin/subscriptions/create
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Create new subscription plan
├─ Auth: Super Admin required
├─ Request Body:
│   {
│     "name": "Premium",
│     "price_monthly": 499,
│     "price_yearly": 4990,
│     "coins_monthly": 1200,
│     "features": {
│       "teams": 10,
│       "events_monthly": 20,
│       "ai_level": "PRIORITY",
│       "ad_free": true
│     },
│     "status": "ACTIVE"
│   }
├─ Response: Created plan with plan_id
├─ Validation:
│   ├─ Name unique
│   ├─ Price > 0
│   ├─ Coins > 0
│   └─ Features not empty
├─ Logging: Create logged with who, when, why
└─ Broadcasting: Update sent to all clients

ENDPOINT: PUT /api/v1/superadmin/subscriptions/:planId
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Edit subscription plan
├─ Auth: Super Admin required
├─ Request: Partial update allowed (only changed fields)
├─ Changes tracked: Before/after logged
├─ Impact Analysis: Show affected users count
├─ Escalation: Expensive changes may require 2FA
├─ Existing Subscriptions: NOT affected retroactively
│   └─ Only new purchases use new price
└─ Version History: Keep plan versions

ENDPOINT: DELETE /api/v1/superadmin/subscriptions/:planId
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Soft-delete plan (archive)
├─ Auth: Super Admin required
├─ Effect:
│   ├─ Plan marked as INACTIVE
│   ├─ Existing subscriptions unaffected
│   ├─ New purchases not possible
│   └─ Can be reactivated
├─ Affected Users: Count shown
├─ Logging: Deletion logged with reason
└─ Backup: Plan data retained (soft delete)

ENDPOINT: GET /api/v1/superadmin/subscriptions/analytics
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Subscription analytics dashboard
├─ Auth: Super Admin required
├─ Returns:
│   {
│     "total_subscribers": 5000,
│     "subscribers_by_plan": {
│       "Free": 2000,
│       "Starter": 1500,
│       "Pro": 1200,
│       "VIP": 300
│     },
│     "mrr": 250000,
│     "arr": 3000000,
│     "churn_rate": 5.2,
│     "renewal_rate": 94.8,
│     "ltv": 250,
│     "conversion_rate": 8.5,
│     "top_plan": "Pro",
│     "trending": "VIP (↑ 15%)",
│     "monthly_breakdown": [...]
│   }
├─ Time Ranges: Day/Week/Month/Year
├─ Forecasting: Predict MRR for next quarter
└─ Export: CSV/PDF reports
```

---

## SECTION 2: WALLET APIS

### User APIs
```
ENDPOINT: GET /api/v1/wallet/balance
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Get user's wallet balance
├─ Auth: Required
├─ Response:
│   {
│     "balance": 1500.50,
│     "currency": "INR",
│     "status": "ACTIVE",
│     "last_updated": "2026-02-28T15:00:00Z"
│   }
├─ Caching: Cache 1 minute (high frequency endpoint)
├─ Real-time: Should be nearly real-time
└─ Status Check: Include wallet status (FROZEN, ACTIVE)

ENDPOINT: POST /api/v1/wallet/add-money
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Add money to wallet
├─ Auth: Required
├─ Request:
│   {
│     "amount": 500,
│     "payment_method": "CARD" | "UPI" | "NETBANKING",
│     "razorpay_order_id": "order_xyz123"
│   }
├─ Validation:
│   ├─ Amount > min_add (e.g., ₹100)
│   ├─ Amount < max_single (e.g., ₹100,000)
│   └─ Wallet not FROZEN
├─ Payment Flow:
│   1. Create Razorpay order
│   2. Return order details to frontend
│   3. User completes payment
│   4. Webhook confirms payment
│   5. Credit wallet balance
├─ Response (after payment):
│   {
│     "transaction_id": "txn_xyz123",
│     "new_balance": 2000.50,
│     "amount": 500,
│     "status": "SUCCESS",
│     "timestamp": "2026-02-28T15:05:00Z"
│   }
├─ Error Handling:
│   ├─ Payment PENDING (wait for webhook)
│   ├─ Payment FAILED (refund & retry)
│   └─ Payment TIMEOUT (refund after 24h)
└─ Notifications: SMS + Email + In-app

ENDPOINT: GET /api/v1/wallet/transactions
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Get wallet transaction history
├─ Auth: Required
├─ Query Params:
│   - limit (10-100)
│   - page (pagination)
│   - type (CREDIT/DEBIT/ALL)
│   - date_from (ISO string)
│   - date_to (ISO string)
│   - min_amount
│   - max_amount
├─ Response: Paginated list
│   {
│     "transactions": [
│       {
│         "id": "txn_abc",
│         "type": "DEBIT",
│         "amount": 150,
│         "reason": "BOOKING_PAYMENT",
│         "booking_id": "book_123",
│         "timestamp": "2026-02-28T10:00:00Z"
│       }
│     ],
│     "total": 45,
│     "page": 1,
│     "per_page": 20
│   }
├─ Reasons shown:
│   - ADD_MONEY
│   - BOOKING_PAYMENT
│   - REFUND
│   - CASHBACK
│   - GIFT
│   - ADMIN_ADJUSTMENT
├─ Sorting: By date descending (newest first)
└─ Export: Support CSV export

ENDPOINT: POST /api/v1/wallet/withdraw
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Withdraw from wallet (if enabled)
├─ Auth: Required
├─ Precondition: Feature enabled by Super Admin
├─ Request:
│   {
│     "amount": 500,
│     "bank_account_id": "bank_xyz" (optional)
│   }
├─ Validation:
│   ├─ Withdrawal enabled
│   ├─ User KYC completed
│   ├─ Amount >= min_withdrawal
│   ├─ Amount <= daily_limit
│   └─ Balance sufficient
├─ Response:
│   {
│     "withdrawal_id": "wd_123",
│     "status": "PROCESSING",
│     "amount": 500,
│     "fee": 0,
│     "net_amount": 500,
│     "processing_time": "3-5 business days"
│   }
├─ Process:
│   1. Create withdrawal request
│   2. Deduct amount from wallet (locked)
│   3. Initiate bank transfer
│   4. Track status
│   5. Confirm receipt
├─ Statuses:
│   ├─ PROCESSING
│   ├─ COMPLETED
│   ├─ FAILED
│   └─ PENDING_VERIFICATION
└─ Notifications: Each status change
```

### Admin APIs
```
ENDPOINT: GET /api/v1/admin/wallet/user/:userId
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: View user's wallet
├─ Auth: Admin required
├─ Response:
│   {
│     "user_id": "user_123",
│     "balance": 1500.50,
│     "status": "ACTIVE",
│     "total_added": 5000,
│     "total_spent": 3500,
│     "transaction_count": 45,
│     "last_activity": "2026-02-28T15:00:00Z",
│     "created_at": "2025-01-01T00:00:00Z"
│   }
├─ Linked Data: Show transactions too
└─ Actions Available: [Refund] [Freeze] [Unfreeze]

ENDPOINT: POST /api/v1/admin/wallet/refund
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Refund money to user's wallet
├─ Auth: Admin required
├─ Request:
│   {
│     "user_id": "user_123",
│     "amount": 500,
│     "reason": "Payment failure - refunding"
│   }
├─ Response: New balance, transaction logged
├─ Ledger Entry:
│   {
│     "type": "CREDIT",
│     "amount": 500,
│     "reason": "ADMIN_REFUND",
│     "admin_id": "admin_456"
│   }
├─ Logging: Admin action logged
├─ Notifications: User notified of refund
└─ Auditable: Can be reviewed later

ENDPOINT: POST /api/v1/admin/wallet/freeze
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Freeze user's wallet (fraud suspect)
├─ Auth: Admin required
├─ Request:
│   {
│     "user_id": "user_123",
│     "reason": "Suspicious activity detected"
│   }
├─ Effect:
│   ├─ Wallet status: FROZEN
│   ├─ Cannot add money
│   ├─ Cannot spend money
│   ├─ Cannot withdraw
│   └─ Balance locked
├─ Logging: Freeze logged with reason
├─ Notifications: User notified
└─ Can be unfrozen anytime

ENDPOINT: POST /api/v1/admin/wallet/unfreeze
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Unfreeze user's wallet
├─ Auth: Admin required
├─ Request:
│   {
│     "user_id": "user_123"
│   }
├─ Effect: Wallet status: ACTIVE
├─ Logging: Unfreeze logged
└─ Notifications: User notified
```

### Super Admin APIs
```
ENDPOINT: PUT /api/v1/superadmin/wallet/settings
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Configure global wallet settings
├─ Auth: Super Admin required
├─ Request:
│   {
│     "enabled": true,
│     "min_add_amount": 100,
│     "max_wallet_balance": 100000,
│     "max_single_add": 50000,
│     "withdrawal_enabled": false,
│     "withdrawal_min": 1000,
│     "withdrawal_max_daily": 50000,
│     "withdrawal_fee_percent": 0,
│     "cashback_percent": 1,
│     "auto_reload_enabled": false
│   }
├─ Validation: Amount fields > 0
├─ Response: Updated settings + change log
├─ Changes Logged: Before/after values
├─ Broadcast: Notify all clients of changes
└─ OTP: May require 2FA for critical changes

ENDPOINT: GET /api/v1/superadmin/wallet/analytics
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Wallet analytics
├─ Auth: Super Admin required
├─ Returns:
│   {
│     "total_balance": 5000000,
│     "total_users_with_wallet": 50000,
│     "avg_balance_per_user": 100,
│     "total_added_lifetime": 50000000,
│     "total_spent_lifetime": 45000000,
│     "usage_growth": "15% MoM",
│     "daily_active_wallets": 15000,
│     "transaction_volume": {
│       "today": 5000,
│       "this_week": 35000,
│       "this_month": 150000
│     },
│     "fraud_flags": 45
│   }
├─ Time Series: Daily/Weekly/Monthly trends
├─ Forecasting: Predict future usage
└─ Export: CSV/PDF available
```

---

## SECTION 3: COIN APIS

### User APIs
```
ENDPOINT: GET /api/v1/coins/balance
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Get user's coin balance
├─ Auth: Required
├─ Response:
│   {
│     "gold_coins": {
│       "balance": 800,
│       "status": "ACTIVE",
│       "expires_at": "2026-03-01T23:59:59Z",
│       "days_remaining": 2
│     },
│     "diamonds": {
│       "balance": 500,
│       "status": "ACTIVE",
│       "expires_at": null
│     }
│   }
├─ Shows expiry warning if < 7 days
├─ Caching: Cache 5 minutes
└─ Real-time: High frequency (show in UI)

ENDPOINT: GET /api/v1/coins/history
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Get coin transaction history
├─ Auth: Required
├─ Query Params:
│   - type (GOLD/DIAMOND/ALL)
│   - limit (20 default)
│   - page (pagination)
├─ Response: Ledger entries
│   {
│     "transactions": [
│       {
│         "id": "coin_txn_123",
│         "coin_type": "GOLD",
│         "transaction_type": "DEBIT",
│         "amount": 100,
│         "reason": "BOOKING_PAYMENT",
│         "booking_id": "book_456",
│         "created_at": "2026-02-28T10:00:00Z"
│       }
│     ]
│   }
├─ Reasons shown:
│   - SUBSCRIPTION_PURCHASE (credit)
│   - BOOKING_PAYMENT (debit)
│   - ADMIN_ISSUE (credit)
│   - ADMIN_REVOKE (debit)
│   - REFUND (credit)
└─ Sorting: By date descending
```

### Admin APIs
```
ENDPOINT: GET /api/v1/admin/coins/user/:userId
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: View user's coins
├─ Auth: Admin required
├─ Response:
│   {
│     "user_id": "user_123",
│     "gold_coins": {
│       "balance": 750,
│       "status": "ACTIVE",
│       "expires_at": "2026-03-01T23:59:59Z"
│     },
│     "diamonds": {
│       "balance": 300,
│       "status": "ACTIVE"
│     },
│     "ledger_sample": [...]
│   }
└─ Linked Actions: [Issue] [Revoke]

ENDPOINT: POST /api/v1/admin/coins/issue
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Issue coins (goodwill bonus)
├─ Auth: Admin required
├─ Request:
│   {
│     "user_id": "user_123",
│     "coin_type": "GOLD" | "DIAMOND",
│     "amount": 100,
│     "reason": "Goodwill - service outage"
│   }
├─ Validation:
│   ├─ Amount > 0
│   ├─ User exists
│   └─ Reason not empty
├─ Response: New balance
├─ Logging: Admin action logged
├─ Ledger Entry: Reason = "ADMIN_ISSUE"
└─ Notifications: User notified if > 50 coins

ENDPOINT: POST /api/v1/admin/coins/revoke
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Revoke coins (fraud penalty)
├─ Auth: Admin required
├─ Request:
│   {
│     "user_id": "user_123",
│     "coin_type": "GOLD" | "DIAMOND",
│     "amount": 100,
│     "reason": "Coin abuse detected"
│   }
├─ Validation:
│   ├─ User has enough coins
│   ├─ Reason not empty
│   └─ Reason valid (security reason)
├─ Response: New balance
├─ Logging: Action logged + escalated
└─ Ledger Entry: Reason = "ADMIN_REVOKE"
```

### Super Admin APIs
```
ENDPOINT: PUT /api/v1/superadmin/coins/settings
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Configure coin system
├─ Auth: Super Admin required
├─ Request:
│   {
│     "gold_coin": {
│       "conversion_rate": 1.0,
│       "expiry_days": 30,
│       "grace_period_days": 7,
│       "max_per_transaction_percent": 10,
│       "expiry_notification_days": 7
│     },
│     "diamond": {
│       "conversion_rate": 1.0,
│       "expiry_days": 365,
│       "enabled": true
│     }
│   }
├─ Immutable Rule: 10% cap CANNOT be changed
├─ Changes Logged: Before/after
├─ Broadcasting: Notify all clients
└─ OTP Required: Yes, for critical changes

ENDPOINT: GET /api/v1/superadmin/coins/analytics
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Coin system analytics
├─ Auth: Super Admin required
├─ Returns:
│   {
│     "total_gold_coins_issued": 5000000,
│     "total_gold_coins_redeemed": 3000000,
│     "total_gold_coins_expired": 1500000,
│     "total_diamonds_sold": 1000000,
│     "avg_coins_per_user": 100,
│     "coin_redemption_rate": 60,
│     "expiry_rate": 30,
│     "monthly_trends": {...}
│   }
├─ Time ranges: Day/Week/Month/Year
└─ Forecasting: Predict coin demand
```

---

## SECTION 4: DIAMOND APIS

### User APIs
```
ENDPOINT: GET /api/v1/diamonds/packages
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Get available diamond packages
├─ Auth: Not required
├─ Response:
│   {
│     "packages": [
│       {
│         "id": "pkg_1",
│         "price": 99,
│         "diamonds": 100,
│         "bonus_percent": 0,
│         "value_per_diamond": 0.99
│       },
│       {
│         "id": "pkg_2",
│         "price": 999,
│         "diamonds": 1500,
│         "bonus_percent": 20,
│         "value_per_diamond": 0.67
│       }
│     ]
│   }
├─ Best Value: Show which package gives most diamonds/rupee
└─ Caching: Cache 24 hours

ENDPOINT: POST /api/v1/diamonds/purchase
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Purchase diamonds
├─ Auth: Required
├─ Request:
│   {
│     "package_id": "pkg_2",
│     "payment_method": "CARD" | "UPI"
│   }
├─ Response: Diamonds credited + order details
├─ Payment: Via Razorpay
├─ Ledger Entry:
│   {
│     "coin_type": "DIAMOND",
│     "amount": 1500 (+ bonus),
│     "reason": "DIAMOND_PURCHASE"
│   }
├─ Notifications: Email receipt
└─ No Expiry: Diamonds don't expire by default

ENDPOINT: GET /api/v1/diamonds/balance
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Get diamond balance
├─ Auth: Required
├─ Response: Simple number or detailed
│   {
│     "balance": 1500,
│     "status": "ACTIVE"
│   }
├─ Caching: Cache 5 minutes
└─ High frequency endpoint
```

---

## SECTION 5: PAYMENT RESOLUTION API

```
ENDPOINT: POST /api/v1/payments/initiate
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Start booking payment
├─ Auth: Required
├─ Request:
│   {
│     "booking_id": "book_123",
│     "total_amount": 1000,
│     "payment_method_preference": {
│       "use_diamonds": true,
│       "use_coins": true,
│       "use_wallet": true,
│       "use_gateway": true
│     }
│   }
├─ Response: Payment breakdown preview
│   {
│     "total_needed": 1000,
│     "breakdown": {
│       "diamonds": 700,
│       "gold_coins": 100,
│       "wallet": 200,
│       "gateway": 0
│     },
│     "validation": "SUCCESS"
│   }
├─ Business Logic:
│   1. Get user's balances
│   2. Calculate 10% coin cap
│   3. Simulate payment resolution
│   4. Return breakdown (no actual deduction yet)
│   5. User confirms → proceed to next step
├─ Validations:
│   ├─ Coin cap never exceeded
│   ├─ Balances sufficient
│   └─ User not FROZEN
└─ No Actual Deduction: This is preview only

ENDPOINT: POST /api/v1/payments/confirm
├─ Status: [ ] NOT STARTED [ ] IN PROGRESS [ ] COMPLETE
├─ Description: Confirm payment & deduct
├─ Auth: Required
├─ Request: booking_id + payment confirmation
├─ Business Logic:
│   1. Lock booking (no double bookings)
│   2. Deduct diamonds (if any)
│   3. Deduct coins (10% cap enforced)
│   4. Deduct wallet (if any)
│   5. Charge gateway (remaining)
│   6. Create ledger entries (all)
│   7. Return success
├─ Atomicity: ALL-OR-NOTHING
│   └─ If any step fails, ROLLBACK all deductions
├─ Error Handling:
│   ├─ Coin cap violation: Reject
│   ├─ Insufficient balance: Reject
│   ├─ Gateway failure: Rollback and retry
│   └─ Network error: Retry logic
├─ Response:
│   {
│     "booking_id": "book_123",
│     "status": "CONFIRMED",
│     "payment_ref": "pay_xyz",
│     "invoice_url": "..."
│   }
└─ Notifications: Confirmation email + in-app
```

---

## SECTION 6: ERROR HANDLING CHECKLIST

### Subscription Errors
```
[ ] PLAN_NOT_FOUND (404)
[ ] PLAN_INACTIVE (400)
[ ] SUBSCRIPTION_ALREADY_ACTIVE (400)
[ ] PAYMENT_FAILED (402)
[ ] INVALID_DURATION (400)
[ ] COINS_NOT_CREDITED (500) - Alert Super Admin
[ ] SUBSCRIPTION_CREATION_FAILED (500)
```

### Wallet Errors
```
[ ] WALLET_FROZEN (403)
[ ] INSUFFICIENT_BALANCE (400)
[ ] AMOUNT_TOO_SMALL (400)
[ ] AMOUNT_TOO_LARGE (400)
[ ] PAYMENT_TIMEOUT (408)
[ ] WITHDRAWAL_NOT_ENABLED (403)
[ ] WITHDRAWAL_LIMIT_EXCEEDED (400)
```

### Coin Errors
```
[ ] COIN_CAP_EXCEEDED (400)
[ ] COINS_EXPIRED (400)
[ ] INSUFFICIENT_COINS (400)
[ ] COINS_NOT_FOUND (404)
[ ] INVALID_COIN_TYPE (400)
```

### Payment Errors
```
[ ] PAYMENT_DECLINED (402)
[ ] INVALID_PAYMENT_METHOD (400)
[ ] GATEWAY_ERROR (503)
[ ] IDEMPOTENCY_KEY_REQUIRED (400)
[ ] TRANSACTION_ALREADY_PROCESSED (409)
[ ] BOOKING_LOCKED (409)
```

---

## SECTION 7: VALIDATION RULES

```
SUBSCRIPTION:
[ ] Price must be >= 0
[ ] Coin amount must be > 0
[ ] Name must not be empty
[ ] Duration must be MONTHLY or YEARLY
[ ] Plan unique by name

WALLET:
[ ] Balance must be >= 0
[ ] Amount added must be > min_add
[ ] Amount must not exceed max_single_add
[ ] User must not be FROZEN
[ ] Withdrawal requires KYC

COINS:
[ ] Coin amount must be > 0
[ ] Reason must not be empty
[ ] Expiry date >= today
[ ] 10% cap must ALWAYS be enforced
[ ] Expired coins cannot be used

PAYMENTS:
[ ] Total amount > 0
[ ] All balances checked before deduction
[ ] Breakdown matches total
[ ] At least one payment method available
[ ] Rollback capability if fails
```

---

## SECTION 8: LOGGING REQUIREMENTS

```
MUST LOG:
[ ] Every subscription purchase (who, when, amount, plan, coins)
[ ] Every subscription cancellation (who, when, reason, refund)
[ ] Every wallet add/deduct (user, amount, reason, timestamp)
[ ] Every coin issue/revoke (admin, user, amount, reason)
[ ] Every payment transaction (user, amount, breakdown, status)
[ ] Every admin action (admin, action, target, reason, timestamp)
[ ] Every Super Admin change (what changed, before, after, why)
[ ] All failures + retries (error, attempts, resolution)
[ ] All refunds (reason, amount, destination, approval)

AUDIT TRAIL:
[ ] Immutable ledger (cannot be deleted)
[ ] All critical actions logged
[ ] Admin actions must have reason
[ ] Super Admin OTP requirement for sensitive operations
[ ] Timestamp + IP + Device logged
```

---

## SECTION 9: TESTING CHECKLIST

```
UNIT TESTS:
[ ] Payment resolution priority logic
[ ] 10% coin cap enforcement
[ ] Coin expiry logic
[ ] Subscription expiry logic
[ ] Wallet balance calculations
[ ] Refund calculations
[ ] Admin permission checks
[ ] Super Admin permission checks

INTEGRATION TESTS:
[ ] Subscription → Coins → Booking flow
[ ] Wallet → Payment → Booking flow
[ ] Payment failure → Rollback
[ ] Coin expiry during payment
[ ] Multiple payment methods in sequence
[ ] Admin/Super Admin actions logged correctly

EDGE CASES:
[ ] Payment with 0 coins
[ ] Payment with 0 wallet
[ ] Coin expires during payment
[ ] Subscription expires during booking
[ ] Wallet FROZEN during payment
[ ] Concurrent payments (race condition)
[ ] Partial payment failures
[ ] Webhook delays (payment confirmed later)
[ ] Razorpay gateway down (fallback)
```

---

## FINAL CHECKLIST

```
BEFORE LAUNCH:
[ ] All endpoints implemented
[ ] All error handling in place
[ ] All validations working
[ ] Audit logging functional
[ ] Notifications sending
[ ] Database optimized
[ ] API documented (Swagger)
[ ] Load testing passed
[ ] Security audit passed
[ ] Admin panel tested
[ ] Super Admin panel tested
[ ] Payment gateway integration tested
[ ] Email/SMS notifications tested
[ ] Rollback procedures tested
[ ] Monitoring/alerts configured
```

---

**USE THIS CHECKLIST AS YOU BUILD - CHECK OFF EACH ITEM AS YOU COMPLETE IT**

Good luck with implementation! 🚀
