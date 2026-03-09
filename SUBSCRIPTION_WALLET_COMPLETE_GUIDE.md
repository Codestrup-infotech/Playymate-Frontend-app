# 🎯 PLAYMATE SUBSCRIPTION & WALLET MODULE - COMPLETE END-TO-END GUIDE

## 📋 TABLE OF CONTENTS
1. Core Subscription Flow
2. Wallet System Flow
3. Gold Coins System
4. Diamonds System
5. Payment Resolution Logic
6. User Journey (Detailed)
7. Business Journey (Detailed)
8. Admin Controls
9. Super Admin Controls
10. API Overview
11. Database Design
12. Edge Cases & Failure Scenarios

---

## PART 1: CORE SUBSCRIPTION FLOW

### 1.1 WHAT IS A SUBSCRIPTION?

**Definition:** A subscription is a recurring payment plan that gives users access to platform features and issues digital currency (Gold Coins).

**Key Facts:**
- Subscriptions are **created and managed by Super Admin only**
- Each subscription has: Name, Duration, Price, Features, Coin conversion
- Subscriptions are **NOT mandatory** - users can use the platform for free
- Subscriptions are **MONTHLY or YEARLY** (or both)
- When user purchases subscription → Automatic coin issuance → Coins linked to subscription validity

---

### 1.2 SUBSCRIPTION PLANS (FROM FIGMA UI)

**4 Tiers exist:**

```
┌─────────────────────────────────────────────────────────────┐
│ SUBSCRIPTION PLANS                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FREE              STARTER           PRO (Popular)    VIP   │
│  ₹0/month          ₹99/month         ₹299/month      ₹999   │
│  0 Coins/mo        50 Coins/mo       800 Coins/mo    2000   │
│                                                             │
│  FEATURES:                                                  │
│  • Teams (2)       • Teams (5)       • Teams (∞)      • All  │
│  • Events (3/mo)   • Events (10/mo)  • Events (∞)           │
│  • Basic Profile   • Passport Lite   • Passport PDF   • VIP  │
│  • Basic AI        • Good AI         • Advanced AI    • Top  │
│  • Ads Shown       • Ads Shown       • NO ADS              │
│  • No Support      • Basic Support   • Advanced Chat        │
│                                      • Priority Supp        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

MONTHLY vs YEARLY
(Yearly offers 30% discount)

Monthly:
- Free: ₹0/mo
- Starter: ₹99/mo
- Pro: ₹299/mo
- VIP: ₹999/mo

Yearly (with 30% discount):
- Free: ₹0/yr
- Starter: ₹1,499/yr (≈₹125/mo)
- Pro: ₹2,999/yr (≈₹250/mo)
- VIP: ₹9,999/yr (≈₹833/mo)
```

---

### 1.3 SUBSCRIPTION PURCHASE FLOW (USER SIDE)

**Step 1: User Browses Plans**
```
User opens app → Profile/Menu → "Upgrade" button
↓
See all 4 plans with:
- Plan name
- Price
- Coin/month earned
- Features list
- Compare button
```

**Step 2: User Selects Plan**
```
User clicks "Choose Pro" or "Go Pro" button
↓
Plan comparison page shows:
- Selected plan highlighted
- Features included
- Price breakdown
- Switch between Monthly/Yearly toggle
```

**Step 3: Checkout**
```
Payment page shows:
- Plan name (Pro Plan)
- Billing period (Monthly)
- Price (₹299)
- Gold Coins included (800 coins)
- Subtotal: ₹299
- Tax (if applicable): ₹0-54 (based on region)
- Discount (if promo code): -₹X
- TOTAL: ₹299 + Tax

Payment methods available:
1. UPI (Google Pay, PhonePe, Paytm)
2. Card (Credit/Debit via Razorpay)
3. Wallet (if balance available)
4. NetBanking
```

**Step 4: Payment Processing**
```
User confirms payment
↓
Razorpay processes payment (2-3 seconds)
↓
Payment success → Subscription activated
↓
Backend:
1. Create Subscription record
2. Set expiry date (next billing date)
3. Credit Gold Coins to user
4. Create coin ledger entry
5. Send confirmation email
6. Show success screen
```

**Step 5: Post-Purchase Screen**
```
"Pro Unlocked! 🎉"
- 800 gold coins credited ✓
- "Explore Features" button
- "View Wallet" button
- Subscription details below
```

---

## PART 2: WALLET SYSTEM FLOW

### 2.1 WHAT IS A WALLET?

**Definition:** A wallet is a stored-value account where users can add money and use it for bookings and payments.

**Key Facts:**
- Wallet is **INDEPENDENT** of subscriptions
- User can add money anytime
- Wallet balance is **NOT withdrawable** (unless Super Admin enables)
- Wallet balance carries over (no expiry)
- Wallet is the **3rd priority** in payment resolution (after Diamonds, Gold Coins)

---

### 2.2 WALLET STRUCTURE

```
WALLET
├── Balance (₹X.XX)
├── Transaction History
│   ├── Money Added (Credited)
│   ├── Money Spent (Debited)
│   ├── Refunds Received (Credited)
│   ├── Cashback Earned (Credited)
│   └── Gift Received (Credited)
└── Features
    ├── Add Money
    ├── View Balance
    ├── View Transactions
    └── Auto-reload (optional)
```

---

### 2.3 WALLET USER JOURNEY

**Add Money to Wallet:**
```
User → Profile → Wallet → "Add Money" button
↓
Amount selection:
- Quick add: ₹100, ₹500, ₹1000, ₹2000
- Custom amount: User enters amount
↓
Payment method selection (same as subscription):
- UPI
- Card
- NetBanking
- Razorpay
↓
Payment processed
↓
Money credited instantly to wallet
↓
Notification sent: "₹X added to wallet"
```

**Use Wallet in Booking:**
```
User books activity → Payment step
↓
See available payment methods:
1. Diamonds (₹X available) - Full spend
2. Gold Coins (₹X max 10%) - Capped at 10%
3. Wallet (₹X available) - Full spend OR partial
4. Payment Gateway (Razorpay) - Card/UPI
↓
User selects which to use:
Option A: Only Wallet
Option B: Wallet + Gateway (split)
Option C: Wallet + Coins + Gateway (multiple)
↓
Payment processed based on priority:
1. Diamonds (if selected) = ₹200
2. Gold Coins (10% cap) = ₹30
3. Wallet (if balance) = ₹70
4. Gateway (remaining) = ₹0
↓
Booking confirmed
↓
Ledger entries created for tracking
```

---

## PART 3: GOLD COINS SYSTEM

### 3.1 WHAT ARE GOLD COINS?

**Definition:** Digital currency issued ONLY through subscriptions with strict spending limits.

**Key Facts:**
- Issued when user buys subscription
- Cannot be earned through other means (in current scope)
- **MAXIMUM 10% per transaction spending rule** (CRITICAL)
- Cannot be transferred
- Cannot be withdrawn
- **Expires when subscription expires**
- Unused coins are lost when subscription ends

---

### 3.2 GOLD COIN ISSUANCE LOGIC

```
User buys Pro subscription (₹299/month)
↓
Super Admin has configured: ₹1 = 1 Gold Coin (or custom ratio)
↓
Backend calculates:
  Coins to issue = ₹299 / ₹1 = 299 coins? 
  
  NO! Super Admin configured: ₹0.375 per coin
  So: ₹299 × (1/0.375) = 798 coins ≈ 800 coins
  
  (OR Super Admin configured flat rate: Pro = 800 coins)
↓
Create Coin Ledger Entry:
{
  user_id: xyz
  coin_type: "GOLD"
  amount: 800
  reason: "SUBSCRIPTION_PURCHASE"
  subscription_id: abc123
  subscription_validity: "2026-03-01"
  created_at: "2026-02-01T10:00:00Z"
  expires_at: "2026-03-01T23:59:59Z"
  status: "ACTIVE"
}
↓
Send notification to user:
"800 Gold Coins credited! Valid until March 1, 2026"
```

---

### 3.3 GOLD COIN SPENDING RULE (10% CAP)

**THIS IS THE MOST IMPORTANT RULE**

```
Booking Price Calculation:
Subtotal = ₹1000 (activity price)
Tax = ₹180
TOTAL = ₹1180

Maximum Gold Coins allowed:
  10% of ₹1180 = ₹118 worth of coins
  
  If user has 500 coins (₹500 value):
  Can ONLY use ₹118 worth = ~118 coins
  
  Rest (₹382) must be paid from:
  - Wallet
  - Payment gateway
  - Or wallet + gateway combo
```

**Strict Enforcement:**
```
1. System calculates max coin value before checkout
2. If user tries to spend more → Error message shown
3. User must use other payment methods for remainder
4. This rule is IMMUTABLE (cannot be overridden by Admin/Super Admin)
```

---

### 3.4 GOLD COIN EXPIRY

```
When subscription expires:
Subscription status: EXPIRED
↓
All linked Gold Coins status: EXPIRED
↓
User cannot spend expired coins
↓
If user tries to use expired coins:
- System rejects transaction
- Shows message: "Your coins expired on March 1. Renew subscription."
↓
Expired coins are logged in ledger (not deleted)
↓
Super Admin can:
- View expired coins per user
- Configure expiry grace period (if allowed)
- But CANNOT manually extend or restore
```

---

## PART 4: DIAMONDS SYSTEM

### 4.1 WHAT ARE DIAMONDS?

**Definition:** Purchased digital currency with NO spending restrictions.

**Key Facts:**
- Purchased separately via Razorpay (NOT through subscription)
- 100% spendable (no cap like gold coins)
- Can be combined with gold coins and wallet
- Can carry forward (no expiry by default)
- Cannot be transferred
- Cannot be withdrawn
- **Optional expiry** (configurable by Super Admin)

---

### 4.2 DIAMOND PURCHASE FLOW

```
User → Profile/Menu → "Buy Diamonds" button
↓
Diamond Packages shown:
- ₹99 = 100 diamonds
- ₹499 = 600 diamonds
- ₹999 = 1500 diamonds
- ₹1999 = 3500 diamonds
(Larger packs offer better value)
↓
User selects package
↓
Checkout page:
- Package: 600 diamonds
- Price: ₹499
- Bonus: +100 diamonds (10% bonus, configurable)
- Total: 700 diamonds for ₹499
↓
Payment processed via Razorpay
↓
Diamonds credited instantly
↓
Ledger entry created:
{
  user_id: xyz
  coin_type: "DIAMOND"
  amount: 700
  reason: "DIAMOND_PURCHASE"
  payment_ref: "razorpay_xyz123"
  purchased_at: "2026-02-28T12:00:00Z"
  expires_at: null (no expiry by default)
  status: "ACTIVE"
}
↓
Notification: "700 Diamonds added! 💎"
```

---

### 4.3 DIAMOND SPENDING (NO RESTRICTIONS)

```
Booking example same ₹1180 total:

User selects:
"Pay with Diamonds" → Has 700 diamonds (₹700 value)
↓
System allows: Use ALL 700 diamonds
↓
Amount covered by diamonds: ₹700
Remaining: ₹480
↓
User selects "Also use Wallet/Gateway" for remaining
↓
Payment resolved as:
1. Diamonds: ₹700 ✓
2. Wallet: ₹480 (if has balance) ✓
3. Or Gateway: ₹480 ✓
```

**Key Difference from Gold Coins:**
```
GOLD COINS: Max 10% per transaction
DIAMONDS: 100% of transaction (if has enough)
```

---

## PART 5: PAYMENT RESOLUTION PRIORITY (CRITICAL)

### 5.1 THE PAYMENT PRIORITY CHAIN

When user clicks "Pay Now" at checkout, system processes in this ORDER:

```
TOTAL AMOUNT NEEDED: ₹1000

Step 1: Check Diamonds
  User selected Diamonds in payment method?
  Has 700 diamonds (= ₹700)?
  ✓ Deduct ₹700 from diamonds
  REMAINING: ₹300

Step 2: Check Gold Coins (10% CAP ONLY)
  User has 500 coins (= ₹500)?
  But: 10% of ₹1000 = ₹100 max
  ✓ Deduct ₹100 from coins (cap enforced)
  REMAINING: ₹200

Step 3: Check Wallet
  User has ₹300 in wallet?
  User has ₹200 (selected for this booking)?
  ✓ Deduct ₹200 from wallet
  REMAINING: ₹0

Step 4: Razorpay Gateway
  Remaining: ₹0 (already covered!)
  ✗ No gateway charge needed
  
  OR if remaining was ₹50:
  ✓ Process ₹50 via card/UPI
```

**Flow Diagram:**
```
         PAYMENT NEEDED: ₹1000
              ↓
    ┌─────────────────────┐
    │ Diamonds Available? │ → YES: Deduct → Remaining?
    └─────────────────────┘              ↓
              NO ↓                    Still Owed: ₹X
         Skip          ┌──────────────────────────┐
              │        │ Gold Coins Available?    │
              │        │ (10% cap only)           │
              │        └──────────────────────────┘
              │                   ↓ YES
              │            Deduct (capped) → Remaining?
              │                   ↓
              ├──────────────────────────────┐
              │                              ↓
         ┌────────────────────────────┐  Still Owed: ₹Y
         │ Wallet Balance Available?  │
         └────────────────────────────┘
              ↓ YES
         Deduct from wallet → Remaining?
              ↓
         Still Owed: ₹Z
              ↓
         ┌──────────────────────────────┐
         │ Charge via Razorpay Gateway  │
         │ Amount: ₹Z                   │
         └──────────────────────────────┘
```

---

## PART 6: USER JOURNEY (COMPLETE SCENARIO)

### 6.1 NEW USER JOURNEY

```
DAY 1: User signs up
├─ No subscription (FREE tier)
├─ No wallet balance (₹0)
├─ No gold coins (0)
├─ No diamonds (0)
└─ Can only book if payment method available

DAY 2: User wants to book a ₹500 badminton session
├─ Opens booking
├─ Reaches payment page
├─ Options shown:
│  ├─ Wallet: ₹0 (empty)
│  ├─ Razorpay: Available
│  └─ Can use card/UPI
├─ User pays ₹500 via card
├─ Booking confirmed
└─ Wallet still ₹0, Coins: 0, Diamonds: 0

DAY 5: User decides to buy Pro subscription
├─ Opens menu → "Upgrade"
├─ Sees Pro Plan (₹299/mo, 800 coins)
├─ Clicks "Go Pro"
├─ Checkout page:
│  ├─ Pro Plan
│  ├─ Price: ₹299
│  ├─ Coins: 800 included
│  └─ Wallet balance: ₹0
├─ Selects Card payment
├─ Completes payment
├─ Subscription activated ✓
├─ 800 Gold Coins credited ✓
├─ Valid until March 5
└─ Notifications sent

DAY 6: User has subscription + coins
├─ Wallet: ₹0
├─ Gold Coins: 800 (valid until Mar 5)
├─ Diamonds: 0
├─ Subscription active ✓
└─ Can now use coins in bookings (10% cap)

DAY 8: User books ₹1000 yoga class
├─ Checkout page shows payment options:
│  ├─ Gold Coins: 800 available
│  │  └─ (max 10% = ₹100 can use)
│  ├─ Wallet: ₹0
│  ├─ Razorpay: Available
│  └─ Total needed: ₹1000
├─ User clicks "Use Gold Coins + Card"
├─ System calculates:
│  ├─ Coins to use: ₹100 (10% of ₹1000)
│  ├─ Remaining: ₹900
│  └─ Card charge: ₹900
├─ User confirms
├─ Payment processed:
│  ├─ Gold Coins: -100 (700 remaining)
│  ├─ Card: ₹900 charged
│  └─ Booking: CONFIRMED ✓
└─ Ledgers updated

DAY 10: User adds ₹500 to wallet
├─ Opens wallet → "Add Money"
├─ Selects ₹500
├─ Pays via UPI
├─ ₹500 credited instantly
├─ Now wallet: ₹500
└─ Can use in next booking

DAY 12: User books ₹600 badminton
├─ Payment breakdown:
│  ├─ Gold Coins: ₹60 (10% cap)
│  ├─ Wallet: ₹500 (user has it)
│  └─ So can pay: ₹60 + ₹500 = ₹560
│     But need: ₹600
│     Still short: ₹40
├─ System prompts: "Add ₹40 via card?"
├─ User confirms
├─ Payment processed:
│  ├─ Gold Coins: -60 (640 remaining)
│  ├─ Wallet: -500 (₹0 remaining)
│  ├─ Card: ₹40
│  └─ Booking: CONFIRMED ✓
└─ Wallet now empty

DAY 15: User buys diamonds
├─ Opens menu → "Buy Diamonds"
├─ Selects ₹999 package (1500 diamonds)
├─ Pays via card
├─ 1500 diamonds credited
├─ Now holds:
│  ├─ Gold Coins: 640 (expires Mar 5)
│  ├─ Diamonds: 1500 (no expiry)
│  └─ Wallet: ₹0
└─ Ready for big booking!

DAY 20: User books ₹2000 cricket tournament
├─ Payment method priority:
│  ├─ Diamonds: 1500 available
│  │  └─ Uses: 1500 diamonds = ₹1500
│  ├─ Gold Coins: 640 available
│  │  └─ 10% of ₹2000 = ₹200 max
│  │  └─ Uses: ₹200 (in coins, ~200 coins)
│  ├─ Wallet: ₹0
│  │  └─ Uses: ₹0
│  └─ Razorpay: ₹2000 - ₹1500 - ₹200 = ₹300
├─ Total coverage:
│  ├─ Diamonds: ₹1500
│  ├─ Gold Coins: ₹200
│  ├─ Wallet: ₹0
│  └─ Card: ₹300
├─ Payment processed ✓
├─ Final state:
│  ├─ Diamonds: 0 (used all)
│  ├─ Gold Coins: 440 (used 200)
│  └─ Wallet: ₹0
└─ Booking confirmed!

DAY 25: Subscription expires (Mar 5)
├─ Pro subscription status: EXPIRED ✗
├─ Gold Coins status: EXPIRED ✗
├─ User cannot use coins
├─ Coins can be viewed but greyed out
├─ User sees: "Renew subscription to use coins"
├─ If tries to book with coins:
│  └─ Error: "Gold coins expired. Renew subscription."
└─ Diamonds still usable (no expiry)
```

---

## PART 7: BUSINESS JOURNEY (COMPLETE SCENARIO)

### 7.1 BUSINESS DOESN'T DIRECTLY USE SUBSCRIPTION/WALLET

**Key Point:** Businesses don't have subscriptions or wallets. But they're affected by:

1. **User subscription affecting bookings**
   - Users with coins can pay partially with coins
   - Business gets paid after commission deduction

2. **Payment reconciliation**
   - Commission deducted from total
   - Business gets net amount
   - Coins usage tracked in ledger

---

### 7.2 BUSINESS PAYOUT FLOW (WHEN USERS PAY WITH COINS)

```
USER BOOKS from BUSINESS for ₹1000
├─ Payment breakdown:
│  ├─ Gold Coins: ₹100 (10% cap)
│  ├─ Wallet: ₹500
│  └─ Card: ₹400
├─ Total business receives (gross): ₹1000
└─ (All payment methods count as payment)

COMMISSION DEDUCTION (Admin configurable, e.g., 20%):
├─ Gross amount: ₹1000
├─ Commission rate: 20%
├─ Commission to Playmate: ₹200
├─ Business net: ₹800
└─ Business payout in next cycle: ₹800

LEDGER ENTRIES CREATED:
├─ User coin ledger: -100 coins
├─ User wallet ledger: -500
├─ Business ledger: +1000 gross, -200 commission = +800 net
├─ Playmate ledger: +200 commission
└─ Payment gateway ledger (if card involved): +400 + fees
```

**Business sees in dashboard:**
```
Revenue: ₹1000 ✓
Commission: ₹200
Net Earnings: ₹800
Payment Method: Mixed (Coins + Wallet + Card)
```

---

## PART 8: ADMIN CONTROLS (WHAT ADMINS CAN DO)

### 8.1 ADMIN CAPABILITIES FOR SUBSCRIPTION/WALLET

**Admins are OPERATIONAL level - day-to-day management**

```
WHAT ADMINS CAN DO:
✓ View user subscriptions
✓ View user wallet balance
✓ View coin balances
✓ View diamond balances
✓ View transaction history
✓ Manually refund users (logged)
✓ Suspend user's wallet (if fraud suspected)
✓ View coin/diamond ledgers
✓ Handle disputes (refunds, reversals)
✓ Approve special refunds (override policies)
✓ Freeze wallet for investigation
✓ View payment transaction logs
✓ View failed payment attempts
✓ Investigate suspicious activity

WHAT ADMINS CANNOT DO:
✗ Change subscription pricing
✗ Change coin conversion rates
✗ Create new subscription plans
✗ Change commission percentages
✗ Disable payment methods globally
✗ Change 10% coin cap rule
✗ Manually issue coins/diamonds
✗ Modify coin expiry rules
✗ Extend expired coins
✗ Withdraw coins cash (convert to cash)
```

### 8.2 ADMIN ACTIONS WITH EXAMPLES

**Scenario 1: User claims payment failed but was charged**

```
Admin → User Management → Find user
├─ View wallet ledger
├─ Check if payment entered twice
├─ Check payment gateway logs
├─ If confirmed: Initiate refund
├─ Refund options:
│  ├─ Refund to original source (card/UPI)
│  ├─ Refund to user wallet (alternative)
│  └─ Manual adjustment
├─ Action logged with reason
└─ User notified of refund
```

**Scenario 2: User wants wallet withdrawal (not policy)**

```
User requests: "Withdraw ₹500 from wallet"
Admin → Wallet Management → User's wallet
├─ View balance: ₹500
├─ Check withdrawal policy: "Disabled by Super Admin"
├─ Admin can:
│  ├─ Deny request (standard)
│  ├─ OR escalate to Super Admin for approval
│  └─ Document request
└─ User informed of policy
```

**Scenario 3: Coin expiry complaint**

```
User claims: "My coins disappeared without warning"
Admin → User's coin ledger
├─ Check expiry date: March 1, 2026 ✓ Confirmed expired
├─ Check notifications sent: Yes, 7 days before ✓
├─ Admin can:
│  ├─ Explain policy to user
│  ├─ Offer goodwill extension (CANNOT - Super Admin only)
│  └─ Document interaction
└─ No action possible (policy is set)
```

---

## PART 9: SUPER ADMIN CONTROLS (COMPLETE SYSTEM AUTHORITY)

### 9.1 SUPER ADMIN CAPABILITIES (FULL CONTROL)

**Super Admins control the ENTIRE SYSTEM - Strategic & Policy level**

```
SUBSCRIPTION CONFIGURATION:
✓ Create new subscription plans
✓ Delete subscription plans
✓ Edit plan pricing
✓ Set plan duration (monthly, quarterly, yearly)
✓ Assign features per plan
✓ Set coin issuance per plan
✓ Set coin conversion rate (global or per-plan)
✓ Configure plan discount (e.g., yearly = 30% off)
✓ Enable/disable plans
✓ Set billing cycle (monthly, quarterly, yearly)
✓ Configure auto-renew behavior
✓ Set subscription trial period (if any)
✓ Configure subscription cancellation rules

GOLD COIN CONFIGURATION:
✓ Set 10% per-transaction cap (immutable rule)
✓ Set coin expiry duration
✓ Configure coin grace period (before expiry)
✓ Set coin conversion rate: ₹1 = X coins
✓ Configure expiry notification timing
✓ Enable/disable coin earning from other sources
✓ Set coin forfeiture rules
✓ Override coin ledger (for corrections)
✓ Create special coin campaigns
✓ Configure coin bonus rules

DIAMOND CONFIGURATION:
✓ Set diamond packages (pricing tiers)
✓ Set bonus % for larger purchases
✓ Configure expiry (default: no expiry)
✓ Set diamond purchase rate: ₹1 = X diamonds
✓ Enable/disable diamond purchases
✓ Configure diamond refund rules
✓ Create promotional campaigns
✓ Set daily/monthly purchase limits (if any)

WALLET CONFIGURATION:
✓ Enable/disable wallet feature
✓ Set minimum add amount (e.g., min ₹100)
✓ Set maximum wallet balance (if any)
✓ Configure wallet withdrawal:
  ├─ Disabled (default)
  ├─ Enabled for all users
  ├─ Enabled for premium users only
  └─ Enabled with restrictions
✓ Set withdrawal limits (daily, monthly)
✓ Set withdrawal fee (if applicable)
✓ Configure wallet cashback rate (1-5%)
✓ Configure auto-reload behavior
✓ Set wallet interest (if applicable)

PAYMENT GATEWAY CONFIGURATION:
✓ Enable/disable payment methods:
  ├─ UPI
  ├─ Cards
  ├─ NetBanking
  ├─ Wallets (Google Pay, PhonePe, Paytm)
  └─ PayLater
✓ Configure payment gateway (Razorpay settings)
✓ Set transaction limits
✓ Configure payment retry logic
✓ Set payment timeout
✓ Configure failed payment notifications
✓ Enable/disable specific banks/card types

REFUND CONFIGURATION:
✓ Set refund policies per category
✓ Configure refund time limits
✓ Set refund processing time (2-7 days)
✓ Configure partial vs full refund rules
✓ Set refund destination priority:
  ├─ Original source
  ├─ Wallet
  └─ Combination
✓ Configure refund fee (if applicable)
✓ Set refund investigation hold period

GLOBAL CONTROLS:
✓ Emergency freeze (all payments paused)
✓ Emergency freeze (all coins disabled)
✓ Emergency freeze (all wallet disabled)
✓ Pause/unpause all bookings
✓ Data backup trigger
✓ Payment gateway failover
✓ Maintenance mode activation
✓ System-wide audit log access
```

### 9.2 SUPER ADMIN CREATION & MANAGEMENT

**Super Admin Panel → Staff & Role Management**

```
Super Admin can:
✓ Create other Super Admin accounts
✓ Define Super Admin permissions
✓ Assign Super Admin roles
✓ Revoke Super Admin access
✓ View Super Admin activity logs
✓ Set IP restrictions for Super Admin access
✓ Enable 2FA for Super Admin (mandatory)
✓ Configure Super Admin session timeout
✓ Require OTP for sensitive operations

Example sensitive operations requiring OTP:
- Changing coin conversion rate
- Enabling wallet withdrawal
- Setting up emergency freeze
- Modifying refund policies
- Creating new Super Admin
```

### 9.3 SUPER ADMIN AUDIT & TRANSPARENCY

```
Every Super Admin action is logged:
├─ Who: Super Admin ID
├─ What: Action performed
├─ When: Timestamp
├─ Where: Module/Section
├─ Why: Reason provided (mandatory for sensitive actions)
├─ Before: Previous value
├─ After: New value
├─ IP: Requester IP
└─ Status: Success/Failure

Example Log Entry:
{
  actor_id: "SA_001",
  action: "UPDATE_COIN_CONVERSION_RATE",
  old_value: "₹1 = 1 coin",
  new_value: "₹1 = 1.2 coins",
  reason: "Q2 promotional campaign",
  timestamp: "2026-02-28T14:30:00Z",
  ip_address: "203.0.113.42",
  status: "SUCCESS",
  requires_approval: false
}
```

---

## PART 10: ADMIN DASHBOARD VIEWS

### 10.1 ADMIN CAN SEE (READ-ONLY OR LIMITED WRITE)

**Admin Panel → Payments & Financial Control**

```
DASHBOARD WIDGETS:
├─ Total Revenue (Today/Week/Month/Year)
├─ Total Coins Issued (All time, per plan)
├─ Total Diamonds Sold (All time)
├─ Failed Payments (count, reasons)
├─ Pending Refunds (count, amounts)
├─ Open Disputes (count, status)
├─ Wallet Total Balance (all users combined)
├─ Average Transaction Value
├─ Commission Collected
└─ Payout Status

DETAILED VIEWS:
├─ All Transactions (searchable, filterable)
├─ User Wallet Ledger (per user)
├─ User Coin Ledger (per user)
├─ User Diamond Ledger (per user)
├─ Failed Payment Logs
├─ Refund Requests Queue
├─ Dispute Resolution Logs
├─ Payment Gateway Logs
└─ Subscription Ledger
```

### 10.2 ADMIN ACTIONS ON TRANSACTIONS

```
Admin → Payments & Financial Control → All Transactions
├─ View transaction details:
│  ├─ User name
│  ├─ Amount
│  ├─ Payment method
│  ├─ Status (Success/Failed/Pending)
│  ├─ Timestamp
│  ├─ Booking reference
│  └─ Gateway response code
├─ Search/Filter:
│  ├─ By user ID
│  ├─ By date range
│  ├─ By status (success/failed)
│  ├─ By payment method
│  ├─ By amount range
│  └─ By booking ID
├─ Actions available:
│  ├─ View details ✓
│  ├─ Initiate refund ✓
│  ├─ Escalate to Super Admin ✓
│  └─ Mark for investigation ✓
└─ Cannot:
   ├─ Reverse transaction directly ✗
   ├─ Modify transaction ✗
   └─ Hide transaction ✗
```

---

## PART 11: SUPER ADMIN DASHBOARD VIEWS

### 11.1 SUPER ADMIN CAN SEE (FULL CONTROL)

**Super Admin Panel → Monetization Engine**

```
SUBSCRIPTION MANAGEMENT:
├─ All subscription plans with:
│  ├─ Name, duration, price
│  ├─ Features, coin conversion
│  ├─ Active user count per plan
│  ├─ Revenue per plan (monthly/yearly)
│  ├─ Churn rate per plan
│  └─ Edit/Delete/Create actions
├─ Subscription analytics:
│  ├─ MRR (Monthly Recurring Revenue)
│  ├─ Conversion rate (free → paid)
│  ├─ Renewal rate
│  ├─ Lifetime value (LTV)
│  └─ Churn analysis
└─ Can modify:
   ├─ Pricing ✓
   ├─ Duration ✓
   ├─ Features ✓
   ├─ Coin conversion ✓
   └─ Availability ✓

COIN & DIAMOND MANAGEMENT:
├─ Global coin settings:
│  ├─ Conversion rate (edit)
│  ├─ Expiry duration (edit)
│  ├─ 10% cap rule (view - cannot edit)
│  ├─ Grace period (edit)
│  └─ Notification timing (edit)
├─ Diamond packages:
│  ├─ Pricing tiers (edit)
│  ├─ Bonus percentage (edit)
│  ├─ Expiry settings (edit)
│  └─ Purchase limits (edit)
├─ Ledger override:
│  ├─ Manually add coins
│  ├─ Manually add diamonds
│  ├─ Manually deduct coins
│  ├─ Manually deduct diamonds
│  └─ Reason required (logged)
└─ Reports:
   ├─ Coins issued per plan
   ├─ Coins redeemed per month
   ├─ Diamonds sold per month
   ├─ Coin expiry reports
   └─ Top coin users
```

---

## PART 12: API OVERVIEW (WHAT BACKEND NEEDS)

### 12.1 SUBSCRIPTION APIS

```
PUBLIC APIS (Accessible to all authenticated users):

GET /api/v1/subscriptions/plans
  → Returns all available plans
  → Response: [Free, Starter, Pro, VIP plans]

POST /api/v1/subscriptions/purchase
  → User purchases a subscription
  → Request: { plan_id, duration (monthly/yearly), payment_method }
  → Response: { subscription_id, status, coins_credited, next_billing }

GET /api/v1/subscriptions/me
  → Get current user's active subscription
  → Response: { plan, price, renewal_date, coins_balance, features }

PUT /api/v1/subscriptions/me/cancel
  → Cancel active subscription
  → Response: { status, cancellation_date, refund_eligible }

GET /api/v1/subscriptions/compare
  → Compare plans (for UI)
  → Response: Feature comparison table

ADMIN APIS:

GET /api/v1/admin/subscriptions/users
  → View all users and their subscriptions
  → Filters: plan, status, active/inactive
  → Response: [users with subscription details]

GET /api/v1/admin/subscriptions/user/:userId
  → View specific user's subscription

POST /api/v1/admin/subscriptions/extend
  → Extend user's subscription (goodwill)
  → Request: { user_id, days }
  → Response: { new_expiry_date, logged }

POST /api/v1/admin/subscriptions/revoke
  → Revoke user's subscription (penalty)
  → Request: { user_id, reason }
  → Response: { status, refund_initiated }

SUPER ADMIN APIS:

POST /api/v1/superadmin/subscriptions/create
  → Create new subscription plan
  → Request: { name, price, duration, features, coin_conversion }
  → Response: { plan_id, created_at }

PUT /api/v1/superadmin/subscriptions/:planId
  → Edit subscription plan
  → Request: { price, features, coin_conversion, etc }
  → Response: { updated_plan, change_log }

DELETE /api/v1/superadmin/subscriptions/:planId
  → Delete subscription plan
  → Response: { status, affected_users_count }

GET /api/v1/superadmin/subscriptions/analytics
  → MRR, ARR, churn, conversion analytics
  → Response: { metrics, trends, forecasts }
```

### 12.2 WALLET APIS

```
PUBLIC APIS:

GET /api/v1/wallet/balance
  → Get user's wallet balance
  → Response: { balance: ₹X.XX, updated_at }

POST /api/v1/wallet/add-money
  → Add money to wallet
  → Request: { amount, payment_method }
  → Response: { new_balance, transaction_id, status }

GET /api/v1/wallet/transactions
  → Get wallet transaction history
  → Filters: date range, type (credit/debit)
  → Response: [ { amount, type, reason, timestamp } ]

POST /api/v1/wallet/withdraw
  → Withdraw from wallet (if enabled)
  → Request: { amount, reason }
  → Response: { status, processing_time, reference }

ADMIN APIS:

GET /api/v1/admin/wallet/user/:userId
  → View user's wallet details
  → Response: { balance, transaction_count, last_activity }

POST /api/v1/admin/wallet/refund
  → Refund money to user's wallet
  → Request: { user_id, amount, reason }
  → Response: { new_balance, transaction_logged }

POST /api/v1/admin/wallet/freeze
  → Freeze user's wallet (suspected fraud)
  → Request: { user_id, reason }
  → Response: { status, user_notified }

POST /api/v1/admin/wallet/unfreeze
  → Unfreeze user's wallet
  → Request: { user_id }
  → Response: { status, user_notified }

SUPER ADMIN APIS:

PUT /api/v1/superadmin/wallet/settings
  → Configure global wallet settings
  → Request: { min_add, max_balance, withdrawal_enabled, etc }
  → Response: { updated_settings }

GET /api/v1/superadmin/wallet/analytics
  → Wallet usage analytics
  → Response: { total_balance, avg_balance_per_user, usage_trends }
```

### 12.3 COIN APIS

```
PUBLIC APIS:

GET /api/v1/coins/balance
  → Get user's coin balance
  → Response: { gold_coins, diamonds, expiry_dates }

GET /api/v1/coins/history
  → Get coin transaction history
  → Response: [ { amount, reason, earned_at, expires_at } ]

ADMIN APIS:

GET /api/v1/admin/coins/user/:userId
  → View user's coin balance and history
  → Response: { gold_coins, diamonds, ledger_entries }

POST /api/v1/admin/coins/issue
  → Issue coins to user (goodwill bonus)
  → Request: { user_id, amount, reason }
  → Response: { new_balance, logged }

POST /api/v1/admin/coins/revoke
  → Revoke coins (fraud penalty)
  → Request: { user_id, amount, reason }
  → Response: { new_balance, logged }

SUPER ADMIN APIS:

PUT /api/v1/superadmin/coins/settings
  → Configure coin system
  → Request: { conversion_rate, expiry_days, cap_percentage }
  → Response: { updated_settings }

PUT /api/v1/superadmin/coins/:userId/extend-expiry
  → Extend coin expiry (special case)
  → Request: { new_expiry_date, reason }
  → Response: { updated_coins }

GET /api/v1/superadmin/coins/analytics
  → Coin analytics (issued, redeemed, expired)
  → Response: { metrics, trends, ledger_summary }
```

### 12.4 DIAMOND APIS

```
Similar to coins but with different rules (no cap, no mandatory expiry)

GET /api/v1/diamonds/packages
  → Get available diamond packages

POST /api/v1/diamonds/purchase
  → Purchase diamonds
  → Request: { package_id, payment_method }
  → Response: { diamonds_credited, new_balance }

GET /api/v1/diamonds/balance
  → Get user's diamond balance

ADMIN/SUPER ADMIN:
Same pattern as coins
```

---

## PART 13: DATABASE DESIGN

### 13.1 SUBSCRIPTION TABLE

```
subscriptions collection
{
  _id: ObjectId,
  user_id: ObjectId (ref to users),
  plan_id: ObjectId (ref to subscription_plans),
  start_date: ISODate,
  end_date: ISODate,
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAUSED",
  billing_cycle: "MONTHLY" | "QUARTERLY" | "YEARLY",
  payment_method: "CARD" | "UPI" | "WALLET" | "RAZORPAY",
  payment_ref: String,
  amount_paid: Decimal,
  auto_renew: Boolean,
  cancellation_date: ISODate (optional),
  cancellation_reason: String (optional),
  refund_amount: Decimal (optional),
  refund_status: "PENDING" | "COMPLETED" | "FAILED" (optional),
  created_at: ISODate,
  updated_at: ISODate,
  soft_delete: Boolean
}

subscription_plans collection
{
  _id: ObjectId,
  name: "Free" | "Starter" | "Pro" | "VIP",
  price_monthly: Decimal,
  price_yearly: Decimal,
  duration_months: Number,
  features: [
    {
      feature_name: String,
      limit: Number | null (null = unlimited)
    }
  ],
  coin_conversion: {
    monthly_amount: Decimal,
    coin_amount: Number
  },
  status: "ACTIVE" | "INACTIVE",
  created_at: ISODate,
  updated_at: ISODate
}
```

### 13.2 WALLET TABLE

```
wallets collection
{
  _id: ObjectId,
  user_id: ObjectId (ref to users),
  balance: Decimal,
  currency: "INR",
  status: "ACTIVE" | "FROZEN",
  frozen_reason: String (optional),
  last_updated: ISODate,
  created_at: ISODate
}

wallet_ledger collection
{
  _id: ObjectId,
  wallet_id: ObjectId (ref to wallets),
  user_id: ObjectId,
  transaction_type: "CREDIT" | "DEBIT",
  amount: Decimal,
  reason: "ADD_MONEY" | "BOOKING_PAYMENT" | "REFUND" | "CASHBACK" | "GIFT",
  booking_id: ObjectId (optional),
  payment_ref: String (optional),
  ip_address: String,
  created_at: ISODate,
  soft_delete: Boolean
}
```

### 13.3 COIN LEDGER TABLE

```
coin_ledger collection
{
  _id: ObjectId,
  user_id: ObjectId (ref to users),
  coin_type: "GOLD" | "DIAMOND",
  transaction_type: "CREDIT" | "DEBIT",
  amount: Number (number of coins),
  reason: "SUBSCRIPTION_PURCHASE" | "BOOKING_PAYMENT" | 
           "REFUND" | "BONUS" | "ADMIN_ISSUE" | "ADMIN_REVOKE",
  subscription_id: ObjectId (if from subscription),
  booking_id: ObjectId (if from booking),
  issued_at: ISODate,
  expires_at: ISODate (optional),
  status: "ACTIVE" | "EXPIRED" | "REVOKED",
  ip_address: String,
  created_at: ISODate,
  soft_delete: Boolean
}

coin_settings collection (Super Admin configurable)
{
  _id: ObjectId,
  coin_type: "GOLD" | "DIAMOND",
  conversion_rate: Decimal (₹ per coin),
  expiry_days: Number,
  grace_period_days: Number,
  max_per_transaction_percent: Number (for GOLD only, default 10),
  expiry_notification_days: Number,
  created_at: ISODate,
  updated_at: ISODate
}
```

### 13.4 PAYMENT TRANSACTION TABLE

```
payment_transactions collection
{
  _id: ObjectId,
  user_id: ObjectId,
  booking_id: ObjectId (optional),
  subscription_id: ObjectId (optional),
  total_amount: Decimal,
  breakdown: {
    diamonds: {
      amount: Decimal,
      coins_used: Number
    },
    gold_coins: {
      amount: Decimal,
      coins_used: Number
    },
    wallet: {
      amount: Decimal
    },
    payment_gateway: {
      amount: Decimal,
      method: "CARD" | "UPI" | "NETBANKING" | "WALLET",
      gateway_ref: String,
      gateway_fee: Decimal
    }
  },
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED",
  payment_gateway_response: Object,
  ip_address: String,
  device_id: String,
  created_at: ISODate,
  updated_at: ISODate,
  soft_delete: Boolean
}
```

---

## PART 14: EDGE CASES & FAILURE SCENARIOS

### 14.1 SUBSCRIPTION EDGE CASES

**Case 1: User has active subscription but tries to purchase another**

```
Solution:
├─ Check existing subscription status
├─ If ACTIVE:
│  ├─ Show option: "Cancel current and upgrade?"
│  ├─ OR show option: "Renew will be on [date]"
│  └─ Prevent duplicate purchase
├─ If EXPIRED:
│  ├─ Allow new purchase
│  └─ Previous coins are lost (not carried forward)
└─ If CANCELLED:
   ├─ Allow new purchase
   └─ Fresh start
```

**Case 2: Subscription expires mid-cycle**

```
If subscription expires (e.g., March 1):
├─ User's status changes ACTIVE → EXPIRED
├─ All coins linked to that subscription EXPIRE
├─ If user has next payment scheduled:
│  ├─ Auto-renewal attempts (if enabled)
│  ├─ If payment fails: Subscription remains EXPIRED
│  └─ Notify user: "Subscription renewal failed. Renew manually?"
├─ User still has diamonds (no expiry)
├─ User wallet unaffected
└─ User can manually renew anytime
```

**Case 3: User tries to use coins after subscription expires**

```
Flow:
├─ User tries to book with expired coins
├─ System validates coin status: EXPIRED ✗
├─ Error shown: "Your Gold Coins expired on March 1, 2026"
├─ Cannot proceed with coin payment
├─ Options:
│  ├─ Use diamonds instead
│  ├─ Use wallet instead
│  ├─ Use card instead
│  └─ OR renew subscription to get new coins
└─ Booking can be completed without coins
```

---

### 14.2 WALLET EDGE CASES

**Case 1: User adds money but payment fails**

```
Transaction: ADD_MONEY for ₹500
├─ User initiates payment
├─ Razorpay processing...
├─ Network error OR User closes app before confirmation
├─ Backend status: PENDING (uncertain)
│
Solution (auto retry logic):
├─ Check with Razorpay: Was payment charged?
├─ If YES:
│  ├─ Credit wallet
│  ├─ Send notification
│  └─ Booking can proceed
├─ If NO:
│  ├─ Don't credit wallet
│  ├─ Show: "Payment failed. Try again?"
│  └─ User tries again
├─ If UNCERTAIN (no response from gateway):
│  ├─ Refund user immediately (safe side)
│  ├─ Ask to try again
│  └─ Logged for investigation
└─ Webhook from Razorpay confirms final state
```

**Case 2: User's wallet balance goes negative (bug scenario)**

```
Safeguard: Immutable ledger
├─ Should NEVER happen
├─ Each debit checked BEFORE processing
├─ If somehow negative:
│  ├─ Admin detects via ledger audit
│  ├─ Investigate source
│  ├─ Correct via manual adjustment (logged)
│  └─ Compensate user
└─ Backend code prevents: if (wallet.balance >= amount_to_spend) { proceed }
```

---

### 14.3 COIN EDGE CASES

**Case 1: User has ₹100 worth of coins, tries to spend ₹50 worth but transaction is ₹1000**

```
Booking amount: ₹1000
User's coins: 100 coins (₹100 value)
10% cap: ₹100 (₹1000 × 10%)

Can user spend coins?
├─ Coins available: ₹100 ✓
├─ 10% cap allows: ₹100 ✓
├─ Amount to spend: ₹100 ✓
├─ Remaining: ₹900
└─ Can proceed: YES ✓

Payment breakdown:
├─ Coins: ₹100 (100 coins consumed)
├─ Wallet/Gateway: ₹900
└─ User must pay remaining ₹900
```

**Case 2: Coin expiry during payment**

```
Timeline:
- User has 500 coins expiring March 1 at 11:59 PM
- User books on March 1 at 11:50 PM
- Process starts

During payment processing:
├─ Time check: Are coins still valid?
├─ If YES (11:50 < 11:59): Allow coin usage
├─ If NO (clock ticked to 12:00 AM): Reject coins
├─ Payment retries with other methods
└─ Ledger shows coin as "NOT USED" (still expired)
```

**Case 3: System tries to charge more coins than 10% cap**

```
Example fraud/bug attempt:
├─ Backend validation:
│  ├─ Calculate: 10% of ₹1000 = ₹100
│  ├─ Check user request: "Spend ₹200 in coins"
│  ├─ Comparison: ₹200 > ₹100? YES (violation)
│  └─ REJECT with error
├─ Response: "Can only use ₹100 in coins for this booking"
├─ Transaction FAILS (safe)
└─ User must adjust payment method
```

---

### 14.4 DIAMOND EDGE CASES

**Case 1: User buys diamonds but payment fails**

```
Similar to wallet case
├─ Payment fails
├─ Diamonds NOT credited
├─ Money NOT charged
├─ Auto-retry logic
└─ User can try again or use other method
```

**Case 2: Diamond expiry (if configured)**

```
Super Admin configured: Diamonds expire in 1 year

If user has 100 diamonds purchased Feb 28, 2024:
├─ March 1, 2025: Auto-expire 100 diamonds
├─ User cannot spend them
├─ Notification sent
├─ User can only use new/fresh diamonds
└─ Expired ledger entry created (immutable)
```

---

### 14.5 PAYMENT RESOLUTION EDGE CASES

**Case 1: All payment methods fail**

```
Booking amount: ₹1000
Available:
├─ Diamonds: 0
├─ Coins: 0
├─ Wallet: 0
└─ Payment gateway: Card payment fails

Flow:
├─ Attempt: Gateway transaction
├─ Status: FAILED (card declined)
├─ Retry: Ask user for other card
├─ If still fails: Offer alternative methods
├─ Max retries: 3-5 (configurable)
├─ Finally: Show "Payment failed. Try again later."
└─ Booking NOT created
```

**Case 2: Partial payment from wallet + card**

```
Amount: ₹1000
User selects: "Use wallet + card"
├─ Wallet has: ₹600
├─ Charges wallet: ₹600 (success)
├─ Remaining: ₹400
├─ Attempts card: Fails
├─ Status: PARTIAL PAYMENT (dangerous!)
│
Solution:
├─ ROLLBACK wallet charge
├─ Return ₹600 to wallet
├─ Show error: "Card payment failed. Please try again."
├─ User either:
│  ├─ Tries different card
│  ├─ Uses full wallet payment (if enough)
│  └─ Selects different booking
└─ Atomic transaction (all-or-nothing)
```

---

## PART 15: COMPLETE FLOW SUMMARY (QUICK REFERENCE)

### 15.1 USER SPENDS MONEY (BOOKING)

```
1. USER INITIATES BOOKING
   ├─ Selects activity
   ├─ Chooses date/time/duration
   └─ Reaches payment screen

2. PAYMENT METHOD SELECTION
   User sees available:
   ├─ Diamonds: X available
   ├─ Gold Coins: Y available (10% cap shown)
   ├─ Wallet: ₹Z available
   └─ Razorpay: Card/UPI available

3. USER SELECTS PAYMENT METHOD(S)
   Options:
   ├─ Option 1: "Use Diamonds only"
   ├─ Option 2: "Use Coins + Razorpay"
   ├─ Option 3: "Use Wallet + Card"
   ├─ Option 4: "Use All (auto split)"
   └─ Option 5: "Use Card only"

4. SYSTEM VALIDATES & CALCULATES
   ├─ Check coin cap: 10% rule enforced
   ├─ Check diamond balance
   ├─ Check wallet balance
   ├─ Calculate remaining to charge
   └─ Show final breakdown

5. PAYMENT PROCESSED IN PRIORITY ORDER
   Priority chain:
   1. Diamonds (₹X)
   2. Gold Coins (₹Y, capped at 10%)
   3. Wallet (₹Z)
   4. Razorpay (Remaining)

6. BOOKING CONFIRMED
   ├─ Ledger entries created
   ├─ Notification sent
   ├─ Coins/Diamonds/Wallet updated
   └─ Business receives payment (net of commission)
```

### 15.2 ADMIN ACTIONS SUMMARY

```
ADMIN PANEL:
├─ View all transactions ✓
├─ View all users' wallets ✓
├─ View all users' coins ✓
├─ Initiate refunds ✓
├─ Freeze wallets ✓
├─ Issue goodwill coins (escalate to SA) ✓
├─ View subscription details ✓
├─ Handle disputes ✓
├─ View payment logs ✓
└─ CANNOT:
   ├─ Change pricing ✗
   ├─ Change conversion rates ✗
   ├─ Modify coin cap rule ✗
   ├─ Enable wallet withdrawal ✗
   └─ Issue coins directly ✗
```

### 15.3 SUPER ADMIN ACTIONS SUMMARY

```
SUPER ADMIN PANEL:
├─ Create/Edit/Delete subscription plans ✓
├─ Configure coin conversion rate ✓
├─ Configure diamond packages ✓
├─ Configure wallet settings ✓
├─ Enable/Disable payment methods ✓
├─ Set coin expiry duration ✓
├─ Configure refund policies ✓
├─ Emergency freeze (all payments) ✓
├─ View all analytics ✓
├─ Audit all actions ✓
└─ Issue special overrides ✓
```

---

## PART 16: IMPORTANT RULES (NON-NEGOTIABLE)

```
1. ✅ GOLD COIN 10% CAP
   - Enforced automatically
   - Cannot be overridden
   - System rejects if exceeded
   - User notified immediately

2. ✅ COIN EXPIRY
   - Tied to subscription validity
   - Auto-expired when subscription expires
   - Cannot be extended (except Super Admin special case)
   - Users lose unused coins

3. ✅ IMMUTABLE LEDGER
   - All transactions logged permanently
   - Cannot be deleted
   - Can only append (audit trail)
   - Soft delete used (marked, not erased)

4. ✅ PAYMENT ATOMICITY
   - All-or-nothing approach
   - If partial payment fails → Entire transaction rolls back
   - User's wallet/coins/diamonds not affected
   - Can retry anytime

5. ✅ COMMISSION DEDUCTION
   - Deducted automatically
   - Cannot be avoided
   - Business receives NET (after commission)
   - Configurable per category (Super Admin)

6. ✅ NO CASH WITHDRAWAL
   - Users cannot withdraw coins/diamonds
   - Wallet withdrawal disabled by default
   - Super Admin can enable (rare)
   - Designed to keep money in platform

7. ✅ REFUND POLICY
   - Based on cancellation policy per listing
   - Calculated automatically
   - Refunded to original source (priority)
   - Audit logged
```

---

## QUICK START CHECKLIST FOR DEVELOPERS

```
✅ ENTITIES TO CREATE:
1. Subscription
2. SubscriptionPlan
3. Wallet
4. WalletLedger
5. CoinLedger
6. CoinSettings
7. PaymentTransaction

✅ APIS TO IMPLEMENT:
- Subscription: Purchase, View, Cancel, Compare
- Wallet: AddMoney, GetBalance, GetHistory, Withdraw
- Coins: GetBalance, GetHistory
- Diamonds: Purchase, GetBalance
- Admin: All view endpoints + manual adjustment endpoints
- SuperAdmin: All config endpoints

✅ BUSINESS LOGIC TO IMPLEMENT:
- Payment resolution priority (Diamonds → Coins → Wallet → Gateway)
- 10% coin cap enforcement
- Coin expiry on subscription expiry
- Atomic payment transactions
- Ledger immutability
- Commission deduction

✅ VALIDATIONS TO ADD:
- Coin spending cap (10%)
- Subscription uniqueness per user
- Coin expiry validation
- Wallet balance check
- Payment gateway error handling
- Refund eligibility check

✅ NOTIFICATIONS TO SEND:
- Subscription purchase confirmed
- Coins credited + expiry date
- Coins about to expire (7 days notice)
- Coins expired
- Wallet money added
- Refund initiated
- Refund completed
```

---

**END OF COMPREHENSIVE GUIDE**

This document covers every aspect of Subscription & Wallet module end-to-end!
