# 📋 SUBSCRIPTION & WALLET MODULE - EXECUTIVE SUMMARY

## 🎯 QUICK OVERVIEW

You now have a **COMPLETE, END-TO-END understanding** of the Subscription and Wallet module for Playmate. This document is your "at a glance" summary.

---

## 📚 WHAT YOU HAVE RECEIVED

### Document 1: SUBSCRIPTION_WALLET_COMPLETE_GUIDE.md (15 Parts)
**Length:** ~48 KB | **Read time:** 45 minutes

This is your **BIBLE** for understanding the module. It covers:

1. **Core Subscription Flow** - How users buy plans
2. **Wallet System** - How users store money
3. **Gold Coins System** - Subscription currency with expiry & 10% cap
4. **Diamonds System** - Purchased currency with no restrictions
5. **Payment Resolution Logic** - Priority order: Diamonds → Coins → Wallet → Gateway
6. **User Journey** - Complete day-by-day scenario (25 days of usage)
7. **Business Journey** - How businesses get paid
8. **Admin Controls** - What admins can see & do (operational level)
9. **Super Admin Controls** - Full system authority (strategic level)
10. **API Overview** - All endpoints to build
11. **Database Design** - Schema for 4 tables
12. **Edge Cases** - 15+ failure scenarios
13. **Admin Dashboard** - What admins see
14. **Super Admin Dashboard** - System-wide controls
15. **Complete Flow Summary** - Quick reference

**→ READ THIS FIRST** before building anything

---

### Document 2: SUBSCRIPTION_WALLET_VISUAL_FLOWS.md (8 Diagrams)
**Length:** ~46 KB | **Visual format:** ASCII diagrams

Beautiful visual flows showing:

1. **Subscription Purchase Flow** - Step-by-step diagram
2. **Wallet Add Money Flow** - Full flow with backend logic
3. **Booking Payment Resolution** - How the priority chain works
4. **Admin Dashboard** - What they can see & do
5. **Super Admin Dashboard** - Full system control
6. **Coin Expiry Lifecycle** - 30-day timeline with notifications
7. **Super Admin Emergency Controls** - Kill switches
8. **Admin vs Super Admin** - Permission comparison matrix

**→ USE THESE WHEN** you need visual reference or explaining to teammates

---

### Document 3: API_IMPLEMENTATION_CHECKLIST.md (Multiple sections)
**Length:** ~40 KB | **Format:** Checklist format

Detailed API specifications including:

**Subscription APIs:**
- ✅ Purchase subscription
- ✅ View active subscription
- ✅ Cancel subscription
- ✅ Compare plans
- ✅ Admin: View all users' subscriptions
- ✅ Super Admin: Create/Edit/Delete plans
- ✅ Super Admin: View analytics

**Wallet APIs:**
- ✅ Get balance
- ✅ Add money
- ✅ View transaction history
- ✅ Withdraw (if enabled)
- ✅ Admin: View user wallet
- ✅ Admin: Refund
- ✅ Admin: Freeze/Unfreeze
- ✅ Super Admin: Configure settings
- ✅ Super Admin: Analytics

**Coin APIs:**
- ✅ Get balance
- ✅ View history
- ✅ Admin: Issue coins
- ✅ Admin: Revoke coins
- ✅ Super Admin: Configure system

**Diamond APIs:**
- ✅ Get packages
- ✅ Purchase diamonds
- ✅ Get balance

**Payment Resolution API:**
- ✅ Initiate payment (preview)
- ✅ Confirm payment (actual deduction)

**→ COPY & USE THIS** as your API specification document

---

## 🔑 CORE CONCEPTS (THE MOST IMPORTANT RULES)

### 1️⃣ THE 10% GOLD COIN CAP (IMMUTABLE)
```
This is the MOST IMPORTANT rule. It CANNOT be broken.

Booking: ₹1000
User has: 500 Gold Coins (₹500)

CAN user spend ₹500 coins?
NO! Only 10% = ₹100 max

This is:
- Hardcoded in system
- Cannot be overridden
- Enforced at API level
- Cannot be changed by Admin
- Cannot be changed by Super Admin
```

### 2️⃣ PAYMENT PRIORITY CHAIN (IMMUTABLE ORDER)
```
User has:
- 500 Diamonds (₹500)
- 400 Gold Coins (₹400)
- 300 Wallet (₹300)

Booking: ₹1000

System charges in this ORDER (always):
1. Diamonds: ₹500 ✓
2. Gold Coins: ₹100 (10% cap, not 400) ✓
3. Wallet: ₹300 ✓
4. Gateway: ₹100 (only remaining) ✓

CANNOT be changed by anyone.
```

### 3️⃣ COIN EXPIRY (AUTOMATIC & FINAL)
```
User buys subscription Feb 1
Coins issued: 800
Valid until: Mar 1, 11:59:59 PM

Mar 1, 11:59:59 PM: LAST SECOND to use coins
Mar 2, 12:00:00 AM: AUTO-EXPIRED (all coins marked expired)

User cannot:
- Use expired coins
- Get refund for expired coins
- Recover expired coins
- Transfer expired coins
- Extend expired coins (except Super Admin in rare cases)

Expired coins are LOST FOREVER.
```

### 4️⃣ WALLET IS NOT MANDATORY
```
Users can:
- Use bookings with card only (no wallet needed)
- Use bookings with coins only (no wallet needed)
- Use bookings with diamonds only (no wallet needed)

Wallet is OPTIONAL but helpful for:
- Saving money for later
- Splitting payments
- Getting cashback
```

### 5️⃣ SUBSCRIPTION vs WALLET vs COINS vs DIAMONDS
```
SUBSCRIPTION:
- Monthly/Yearly recurring payment
- Issues coins upon purchase
- Coins expire with subscription

WALLET:
- Independent stored value
- No expiry
- Optional (not mandatory)
- Can withdraw (if Super Admin enables)

GOLD COINS:
- Issued via subscription only
- 10% cap per transaction
- Expires with subscription
- Cannot be withdrawn

DIAMONDS:
- Purchased separately (not via subscription)
- 100% spendable (no cap)
- No expiry by default
- Cannot be withdrawn
```

---

## 🎮 PAYMENT FLOW (SIMPLIFIED)

### User Perspective
```
User books → Sees 4 payment options:
├─ Option 1: "Use Diamonds"
├─ Option 2: "Use Coins (10% max)"
├─ Option 3: "Use Wallet"
├─ Option 4: "Use Card"

User selects (e.g., "Use all available")

System auto-calculates:
├─ Diamonds: ₹X (full)
├─ Coins: ₹Y (but max 10%)
├─ Wallet: ₹Z (remaining if available)
├─ Card: ₹Remaining (if any left)

User confirms → Payment deducted in order → Booking confirmed
```

### Backend Perspective
```
1. LOCK the booking (prevent double booking)
2. GET user balances (diamonds, coins, wallet)
3. CALCULATE payment breakdown:
   - Step 1: Diamonds (full spend allowed)
   - Step 2: Coins (10% cap enforced)
   - Step 3: Wallet (full spend allowed)
   - Step 4: Gateway (remaining)
4. VALIDATE all amounts OK
5. DEDUCT in order:
   - Deduct diamonds
   - Deduct coins (capped)
   - Deduct wallet
   - Charge gateway
6. CREATE ledger entries (all)
7. UNLOCK booking
8. RETURN success

If ANY step fails → ROLLBACK all (atomic transaction)
```

---

## 👨‍💼 ADMIN vs 👨‍💼 SUPER ADMIN (CLEAR SEPARATION)

### ADMIN (Operational Level - Day-to-Day)
```
Can DO:
✅ View user subscriptions & wallet
✅ View coin/diamond balances
✅ Process refunds
✅ Freeze wallets (fraud)
✅ Handle disputes
✅ View payment logs
✅ View transaction history
✅ Escalate to Super Admin

Cannot DO:
❌ Change pricing
❌ Change coin conversion
❌ Change commission %
❌ Enable/disable payment methods
❌ Create subscription plans
❌ Configure coin expiry
❌ Emergency shutdown
❌ View Super Admin logs
```

### SUPER ADMIN (Strategic Level - System Authority)
```
Can DO:
✅ Create/Edit/Delete subscription plans
✅ Change pricing
✅ Change coin conversion rate
✅ Change diamond packages
✅ Configure wallet settings
✅ Enable/disable payment methods
✅ Set commission rates
✅ Emergency freeze (all payments/coins/wallet)
✅ Extend coin expiry (rare)
✅ View all analytics
✅ Configure global settings
✅ View full audit trail

All actions logged + OTP required for sensitive operations
```

---

## 📊 KEY NUMBERS TO REMEMBER

```
SUBSCRIPTION PLANS (4 tiers):
┌─────────────────────────────────────┐
│ FREE:     ₹0/mo  →  0 coins/mo     │
│ STARTER:  ₹99/mo →  50 coins/mo    │
│ PRO:      ₹299/mo → 800 coins/mo   │
│ VIP:      ₹999/mo → 2000 coins/mo  │
└─────────────────────────────────────┘

COIN CAP (immutable):
├─ Gold Coins: Max 10% per transaction (HARDCODED)
└─ Diamonds: 100% per transaction (no cap)

COIN VALIDITY:
├─ Gold Coins: Expires with subscription (e.g., 30 days)
└─ Diamonds: No expiry by default

WALLET:
├─ Min add: ₹100 (configurable)
├─ Max balance: ₹100,000 (configurable)
└─ Withdrawal: Disabled by default (Super Admin enables)

PAYMENT PRIORITY:
1. Diamonds (full)
2. Gold Coins (10% cap)
3. Wallet (full)
4. Razorpay (remaining)
```

---

## 🔴 CRITICAL BUSINESS RULES (DON'T MISS THESE)

```
1. Users cannot withdraw coins or diamonds
   └─ They are PLATFORM ONLY currency

2. Users cannot transfer coins/diamonds to other users
   └─ No peer-to-peer transfers

3. Admin cannot override 10% coin cap
   └─ It's a hardcoded business rule

4. Expired coins are lost forever
   └─ No recovery, no extension (except Super Admin special case)

5. Coins expire automatically on subscription expiry
   └─ No manual intervention needed

6. Payment is all-or-nothing (atomic)
   └─ If payment fails partway, ALL deductions rolled back

7. Commission is deducted automatically
   └─ Business receives NET amount (after commission)

8. Wallet balance is locked until payment completes
   └─ Prevents race condition of double-spending

9. Every transaction must be logged
   └─ Immutable audit trail for compliance

10. Super Admin OTP required for critical changes
    └─ Coin rate change, wallet withdrawal enable, etc.
```

---

## 🚀 IMPLEMENTATION ROADMAP (SUGGESTED ORDER)

```
WEEK 1: Core Infrastructure
├─ Database schema (all 4 tables)
├─ User authentication (JWT)
├─ Admin/Super Admin role setup
└─ Razorpay integration (test mode)

WEEK 2: Subscription System
├─ GET /subscriptions/plans
├─ POST /subscriptions/purchase
├─ GET /subscriptions/me
├─ PUT /subscriptions/cancel
├─ Coin issuance logic
└─ Coin expiry logic (background job)

WEEK 3: Wallet System
├─ GET /wallet/balance
├─ POST /wallet/add-money
├─ GET /wallet/transactions
├─ Admin wallet view
└─ Admin freeze/unfreeze

WEEK 4: Coin & Diamond Systems
├─ GET /coins/balance & /diamonds/balance
├─ GET /coins/history
├─ POST /diamonds/purchase
├─ Admin issue/revoke
└─ All ledger entries

WEEK 5: Payment Resolution
├─ POST /payments/initiate (preview)
├─ POST /payments/confirm (actual)
├─ 10% cap enforcement
├─ Priority order logic
└─ Atomic transaction handling

WEEK 6: Admin & Super Admin
├─ All read endpoints
├─ All action endpoints
├─ Logging for all actions
├─ OTP verification
└─ Audit trail

WEEK 7: Testing & Edge Cases
├─ Unit tests
├─ Integration tests
├─ Edge case testing
├─ Load testing
└─ Security testing

WEEK 8: Documentation & Launch
├─ Swagger documentation
├─ Deployment to staging
├─ UAT with admins
├─ Production deployment
└─ Monitoring setup
```

---

## 📞 QUICK QUESTIONS & ANSWERS

### Q1: User has 500 coins, booking is ₹1000. How much coins can they spend?
```
A: Maximum 10% of ₹1000 = ₹100 worth of coins
   NOT ₹500 (even though they have it)
   This is HARDCODED and CANNOT be changed
```

### Q2: User buys subscription on Feb 1, when do coins expire?
```
A: Subscription validity = 1 month
   Coins issued: Feb 1
   Coins expire: Mar 1, 11:59:59 PM
   Cannot use after: Mar 2, 12:00:00 AM
```

### Q3: Can Admin override the 10% coin cap?
```
A: NO! It's immutable.
   Only Super Admin has authority, but even Super Admin
   should NOT override it (it's a platform rule).
```

### Q4: What happens if user's wallet is FROZEN?
```
A: User cannot:
   ✗ Add money to wallet
   ✗ Spend from wallet
   ✗ Withdraw from wallet
   
   User can still use:
   ✓ Coins
   ✓ Diamonds
   ✓ Card payment
```

### Q5: User tries to spend ₹500 coins on ₹1000 booking. What happens?
```
A: System rejects transaction with error:
   "Can only use ₹100 in coins (10% limit). Use wallet/card for ₹900."
```

### Q6: What's the difference between Admin and Super Admin in this module?
```
A: Admin = Day-to-day operations (view, refund, handle disputes)
   Super Admin = System configuration (pricing, coin rates, payment methods)
```

### Q7: Can users withdraw coins?
```
A: NO! Coins are platform-only currency.
   Users can ONLY use them for bookings.
   Diamonds also cannot be withdrawn.
```

### Q8: What if payment gateway fails mid-transaction?
```
A: System ROLLBACKS all deductions:
   - Coins returned
   - Wallet money returned
   - Diamonds returned
   - User sees error + retry option
```

### Q9: Can expired coins be redeemed?
```
A: NO! Coins automatically expire.
   User must renew subscription to get NEW coins.
   Old coins are gone forever.
```

### Q10: Who can issue coins to a user?
```
A: Admin: Can issue coins (logged action)
   Super Admin: Can issue coins
   User: Cannot issue themselves
   
   All coins issued by Admin are logged.
```

---

## ✅ FINAL CHECKLIST BEFORE BUILDING

```
Understanding:
[ ] I understand the 10% coin cap is immutable
[ ] I understand the payment priority order
[ ] I understand coin expiry logic
[ ] I understand Admin vs Super Admin roles
[ ] I understand wallet is optional
[ ] I understand coins expire with subscription
[ ] I understand diamonds have no cap
[ ] I understand atomic transaction rollback
[ ] I understand audit logging requirements
[ ] I understand Super Admin OTP requirements

Database:
[ ] Subscription schema planned
[ ] Coin ledger schema planned
[ ] Wallet schema planned
[ ] Payment transaction schema planned

APIs:
[ ] Subscription APIs list finalized
[ ] Wallet APIs list finalized
[ ] Coin APIs list finalized
[ ] Payment resolution APIs finalized
[ ] Admin APIs finalized
[ ] Super Admin APIs finalized

Validations:
[ ] Coin cap validation logic finalized
[ ] Payment breakdown validation finalized
[ ] Subscription uniqueness planned
[ ] Wallet balance check planned
[ ] Coin expiry check planned

Logging:
[ ] Audit trail format planned
[ ] Admin action logging planned
[ ] Super Admin action logging planned
[ ] Payment ledger logging planned
[ ] Error logging planned

Testing:
[ ] Test data prepared
[ ] Test scenarios defined
[ ] Edge cases identified
[ ] Failure scenarios planned
```

---

## 🎯 FINAL WORDS

You now have **COMPLETE understanding** of:

1. ✅ How subscriptions work
2. ✅ How wallets work
3. ✅ How coins work
4. ✅ How diamonds work
5. ✅ How payment resolution works
6. ✅ What admins can do
7. ✅ What super admins can do
8. ✅ All edge cases
9. ✅ All business rules
10. ✅ All APIs to build

**You are ready to start building.**

Start with Document 1 (Complete Guide) to refresh anytime.
Use Document 2 (Visual Flows) for quick visual reference.
Use Document 3 (API Checklist) as your implementation guide.

Good luck! 🚀

---

**Last Updated:** February 28, 2026
**Version:** 1.0 - Complete & Final
**Confidence Level:** 100% (Reviewed against master document + Figma designs)
