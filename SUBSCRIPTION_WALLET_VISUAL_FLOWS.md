# 🎯 SUBSCRIPTION & WALLET - VISUAL FLOW DIAGRAMS

## DIAGRAM 1: SUBSCRIPTION PURCHASE FLOW

```
┌────────────────────────────────────────────────────────────────────┐
│                    USER SUBSCRIPTION JOURNEY                       │
└────────────────────────────────────────────────────────────────────┘

                          USER APP
                              │
                              ↓
                    ┌─────────────────┐
                    │ Upgrade Button  │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────────────────────┐
                    │ See 4 Plans:                    │
                    │ • Free (₹0)                     │
                    │ • Starter (₹99)                 │
                    │ • Pro (₹299) ← Popular          │
                    │ • VIP (₹999)                    │
                    └────────┬────────────────────────┘
                             │
                    User selects "Pro"
                             │
                             ↓
                    ┌─────────────────────────────────┐
                    │ Plan Details:                   │
                    │ Pro Plan - ₹299/month           │
                    │ 800 Gold Coins included         │
                    │ Features: [list]                │
                    │ Monthly/Yearly toggle           │
                    └────────┬────────────────────────┘
                             │
                             ↓
                    ┌─────────────────────────────────┐
                    │ Checkout Page:                  │
                    │ Subtotal: ₹299                  │
                    │ Tax: ₹0-50                      │
                    │ Total: ₹299                     │
                    │ [UPI] [Card] [Wallet]           │
                    └────────┬────────────────────────┘
                             │
                    User pays ₹299
                             │
                             ↓
          ┌──────────────────────────────────────┐
          │    RAZORPAY PAYMENT GATEWAY           │
          │  (2FA, Card auth, etc.)               │
          └──────────────┬───────────────────────┘
                         │
                Payment Success
                         │
                         ↓
          ┌──────────────────────────────────────┐
          │      BACKEND PROCESSING               │
          │                                      │
          │ 1. Verify payment with Razorpay      │
          │ 2. Create Subscription record        │
          │    {                                 │
          │      user_id, plan_id, status:      │
          │      "ACTIVE", end_date: "Mar 1"    │
          │    }                                 │
          │                                      │
          │ 3. Calculate coins:                  │
          │    ₹299 / ₹0.375 = 800 coins        │
          │                                      │
          │ 4. Create Coin Ledger:               │
          │    {                                 │
          │      coin_type: "GOLD",              │
          │      amount: 800,                    │
          │      expires_at: "Mar 1",            │
          │      status: "ACTIVE"                │
          │    }                                 │
          │                                      │
          │ 5. Send notification                 │
          │ 6. Create invoice                    │
          │                                      │
          └──────────────┬───────────────────────┘
                         │
                         ↓
          ┌──────────────────────────────────────┐
          │    SUCCESS SCREEN (USER APP)         │
          │                                      │
          │  "Pro Unlocked! 🎉"                  │
          │  ✅ 800 Gold Coins credited          │
          │  ✅ Valid until March 1, 2026        │
          │                                      │
          │  [Explore Features] [View Wallet]    │
          │                                      │
          │  Payment History:                    │
          │  Paid Feb 1: ₹299                    │
          │                                      │
          └──────────────────────────────────────┘
                         │
                    User can now
                    use coins in
                    bookings (10% cap)
```

---

## DIAGRAM 2: WALLET ADD MONEY FLOW

```
┌────────────────────────────────────────────────────────────────────┐
│                  USER WALLET JOURNEY                               │
└────────────────────────────────────────────────────────────────────┘

                          USER APP
                              │
                              ↓
                    ┌─────────────────┐
                    │ Wallet Menu     │
                    │ Balance: ₹0     │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────────────────────┐
                    │ "Add Money" Button              │
                    └────────┬────────────────────────┘
                             │
                             ↓
                    ┌─────────────────────────────────┐
                    │ Amount Selection:               │
                    │ Quick: ₹100 ₹500 ₹1000 ₹2000   │
                    │ Custom: [Enter amount]          │
                    │ Selected: ₹500                  │
                    └────────┬────────────────────────┘
                             │
                             ↓
                    ┌─────────────────────────────────┐
                    │ Payment Method:                 │
                    │ [UPI] [Card] [NetBanking]       │
                    │ Selected: Card                  │
                    └────────┬────────────────────────┘
                             │
                    User pays ₹500
                             │
                             ↓
          ┌──────────────────────────────────────┐
          │    RAZORPAY PROCESSES PAYMENT         │
          └──────────────┬───────────────────────┘
                         │
                Payment Success
                         │
                         ↓
          ┌──────────────────────────────────────┐
          │    BACKEND PROCESSING                 │
          │                                      │
          │ 1. Verify payment success            │
          │ 2. Update Wallet:                    │
          │    balance = 0 + 500 = ₹500         │
          │                                      │
          │ 3. Create Ledger Entry:              │
          │    {                                 │
          │      type: "CREDIT",                 │
          │      amount: 500,                    │
          │      reason: "ADD_MONEY",            │
          │      timestamp: now                  │
          │    }                                 │
          │                                      │
          │ 4. Send notification                 │
          │ 5. Create transaction receipt        │
          │                                      │
          └──────────────┬───────────────────────┘
                         │
                         ↓
          ┌──────────────────────────────────────┐
          │    WALLET UPDATED                    │
          │                                      │
          │  Balance: ₹500 ✅                    │
          │  Last Added: ₹500 on Feb 28         │
          │                                      │
          │  Transaction History:                │
          │  ✅ +₹500 (ADD_MONEY) - Feb 28       │
          │                                      │
          └──────────────────────────────────────┘
                         │
                 Wallet ready to use
                 in next booking
```

---

## DIAGRAM 3: BOOKING PAYMENT RESOLUTION (PRIORITY CHAIN)

```
┌────────────────────────────────────────────────────────────────────┐
│           PAYMENT RESOLUTION - PRIORITY ORDER                      │
└────────────────────────────────────────────────────────────────────┘

SCENARIO: User books ₹1000 activity with:
          • 700 Diamonds available (= ₹700)
          • 500 Gold Coins available (= ₹500)
          • 300 Wallet balance (= ₹300)


                    BOOKING AMOUNT: ₹1000
                            │
                            ↓
        ┌───────────────────────────────────────┐
        │  PRIORITY 1: DIAMONDS (Full spend)    │
        │                                       │
        │  Diamonds available? YES (700)        │
        │  Amount needed: ₹1000                 │
        │  Can use: ₹700 (full balance)         │
        │  Status: DEDUCT ✅                    │
        │                                       │
        │  Deducted: ₹700 from diamonds         │
        │  Diamonds remaining: 0                │
        │  Amount still owed: ₹300              │
        └──────────────┬────────────────────────┘
                       │
                       ↓ (Remaining: ₹300)
        ┌───────────────────────────────────────┐
        │  PRIORITY 2: GOLD COINS (10% CAP!)    │
        │                                       │
        │  Coins available? YES (500)           │
        │  10% of ₹1000 = ₹100 MAX              │
        │  Can use: ₹100 (capped, NOT 500)      │
        │  Status: DEDUCT ✅                    │
        │                                       │
        │  Deducted: ₹100 (~100 coins)          │
        │  Coins remaining: 400                 │
        │  Amount still owed: ₹200              │
        └──────────────┬────────────────────────┘
                       │
                       ↓ (Remaining: ₹200)
        ┌───────────────────────────────────────┐
        │  PRIORITY 3: WALLET (Full spend)      │
        │                                       │
        │  Wallet balance? YES (₹300)           │
        │  Amount needed: ₹200                  │
        │  Can use: ₹200 (partial)              │
        │  Status: DEDUCT ✅                    │
        │                                       │
        │  Deducted: ₹200 from wallet           │
        │  Wallet remaining: ₹100               │
        │  Amount still owed: ₹0                │
        └──────────────┬────────────────────────┘
                       │
                       ↓ (Remaining: ₹0)
        ┌───────────────────────────────────────┐
        │  PRIORITY 4: RAZORPAY (Gateway)       │
        │                                       │
        │  Amount to charge: ₹0                 │
        │  Status: NOT NEEDED ✓                 │
        │  No card charge!                      │
        │                                       │
        └──────────────┬────────────────────────┘
                       │
                       ↓
        ┌───────────────────────────────────────┐
        │  PAYMENT SUMMARY                      │
        │                                       │
        │  Total Booking: ₹1000 ✅             │
        │                                       │
        │  Breakdown:                           │
        │  • Diamonds: ₹700                    │
        │  • Gold Coins: ₹100                  │
        │  • Wallet: ₹200                      │
        │  • Card: ₹0                          │
        │  ─────────────────                   │
        │  Total: ₹1000 ✅                     │
        │                                       │
        │  Final State:                         │
        │  • Diamonds: 0                        │
        │  • Gold Coins: 400                    │
        │  • Wallet: ₹100                       │
        │                                       │
        │  [CONFIRM PAYMENT]                    │
        │                                       │
        └───────────────────────────────────────┘
```

---

## DIAGRAM 4: ADMIN DASHBOARD - WHAT THEY CAN SEE & DO

```
┌────────────────────────────────────────────────────────────────────┐
│                     ADMIN PANEL                                    │
│            (Operational Level - Day-to-Day Control)                │
└────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│  USER MANAGEMENT     │       │ WALLET MANAGEMENT    │
├──────────────────────┤       ├──────────────────────┤
│ ✅ View all users    │       │ ✅ View balance      │
│ ✅ View their subs   │       │ ✅ View history      │
│ ✅ View coins/diams  │       │ ✅ Refund money      │
│ ✅ View wallet bal   │       │ ✅ Freeze wallet     │
│ ✅ Suspend user      │       │ ✅ Unfreeze wallet   │
│ ✅ View booking hist │       │ ✅ View ledger       │
│ ✅ Handle disputes   │       │ ❌ Enable withdrawal │
│ ❌ Issue coins       │       │ ❌ Change settings   │
│ ❌ Change pricing    │       │ ❌ Change fees       │
└──────────────────────┘       └──────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│ PAYMENT MANAGEMENT   │       │  REPORTING           │
├──────────────────────┤       ├──────────────────────┤
│ ✅ View transactions │       │ ✅ Daily revenue     │
│ ✅ View failures     │       │ ✅ Failed payments   │
│ ✅ View refunds      │       │ ✅ Coin reports      │
│ ✅ Process refunds   │       │ ✅ Diamond reports   │
│ ✅ View disputes     │       │ ✅ User reports      │
│ ✅ View gateway logs │       │ ✅ Export to CSV     │
│ ✅ Investigate       │       │ ✅ Date range filter │
│ ❌ Reverse payment   │       │ ❌ Modify reports    │
│ ❌ Override fees     │       │ ❌ Delete reports    │
└──────────────────────┘       └──────────────────────┘

┌──────────────────────────────────────────────────────┐
│             ADMIN ACTIONS FLOW                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Scenario: User reports payment charged but no coin │
│                                                      │
│ Step 1: Admin searches user in dashboard            │
│         → Finds: "User123"                          │
│                                                      │
│ Step 2: Admin views transaction history             │
│         → Finds: "₹299 charged on Feb 28, 11:00 AM" │
│         → Finds: "Payment status: SUCCESS"          │
│                                                      │
│ Step 3: Admin checks coin ledger                    │
│         → Finds: "No coin entry for Feb 28"         │
│         → Bug confirmed!                            │
│                                                      │
│ Step 4: Admin initiates refund                      │
│         → Selects: "Refund" action                  │
│         → Reason: "Coins not credited - Bug"        │
│         → Confirms                                  │
│                                                      │
│ Step 5: System processes refund                     │
│         → Refunds ₹299 to user's original source    │
│         → Creates ledger: "REFUND" entry            │
│         → Logs admin action                         │
│                                                      │
│ Step 6: User notified                               │
│         → SMS: "Refund of ₹299 initiated"           │
│         → Email: "Refund details"                   │
│         → In-app notification                       │
│                                                      │
│ Step 7: Admin documents investigation               │
│         → Escalates to Super Admin if needed        │
│         → Ticket closed                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## DIAGRAM 5: SUPER ADMIN DASHBOARD - FULL SYSTEM CONTROL

```
┌────────────────────────────────────────────────────────────────────┐
│                  SUPER ADMIN PANEL                                 │
│      (Strategic Level - System-wide Configuration)                 │
└────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│ SUBSCRIPTION MANAGEMENT      │
├──────────────────────────────┤
│ ✅ Create plans              │
│ ✅ Edit pricing              │
│ ✅ Set coin conversion       │
│ ✅ Delete plans              │
│ ✅ Configure auto-renew      │
│ ✅ Set billing cycles        │
│ ✅ Enable/disable plans      │
│ ✅ View MRR/ARR              │
│ ✅ Churn analysis            │
│ ✅ Feature unlock settings   │
└──────────────────────────────┘

┌──────────────────────────────┐
│ GOLD COIN CONFIGURATION      │
├──────────────────────────────┤
│ ✅ Set conversion rate       │
│ ✅ Set expiry duration       │
│ ✅ Set grace period          │
│ ✅ Configure cap (view 10%)   │
│ ✅ Set expiry notifications  │
│ ✅ Override ledger           │
│ ✅ Create campaigns          │
│ ✅ View analytics            │
│ ✅ Extend coin expiry        │
│ (Rare case)                  │
└──────────────────────────────┘

┌──────────────────────────────┐
│ DIAMOND MANAGEMENT           │
├──────────────────────────────┤
│ ✅ Set packages              │
│ ✅ Set pricing               │
│ ✅ Set bonus %               │
│ ✅ Configure expiry          │
│ ✅ Create campaigns          │
│ ✅ Set purchase limits       │
│ ✅ Promotion setup           │
│ ✅ View sales analytics      │
└──────────────────────────────┘

┌──────────────────────────────┐
│ WALLET CONFIGURATION         │
├──────────────────────────────┤
│ ✅ Enable/disable            │
│ ✅ Set min add amount        │
│ ✅ Set max balance           │
│ ✅ Enable withdrawal         │
│ ✅ Set withdrawal limits     │
│ ✅ Configure cashback %      │
│ ✅ Auto-reload settings      │
│ ✅ View analytics            │
└──────────────────────────────┘

┌──────────────────────────────┐
│ PAYMENT GATEWAY              │
├──────────────────────────────┤
│ ✅ Enable/disable methods    │
│ ✅ Configure Razorpay        │
│ ✅ Set transaction limits    │
│ ✅ Payment retry logic       │
│ ✅ Failover setup            │
│ ✅ Fee configuration         │
│ ✅ Bank restrictions         │
│ ✅ Card type restrictions    │
└──────────────────────────────┘

┌──────────────────────────────┐
│ GLOBAL CONTROLS              │
├──────────────────────────────┤
│ ✅ Emergency freeze (all)    │
│ ✅ Pause all bookings        │
│ ✅ Disable wallet            │
│ ✅ Disable coins             │
│ ✅ Maintenance mode          │
│ ✅ Data backup trigger       │
│ ✅ System health check       │
│ ✅ Full audit logs           │
└──────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│        SUPER ADMIN CONFIGURATION SCENARIO            │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Q2 PROMOTIONAL CAMPAIGN SETUP:                      │
│                                                      │
│ Step 1: Create new subscription plan               │
│   Name: "Q2 Special"                                │
│   Price: ₹249/month (was ₹299)                      │
│   Coins: 900 (was 800) - 12% bonus                  │
│   Duration: March 1 - May 31 only                   │
│   Status: ACTIVE ✓                                  │
│                                                      │
│ Step 2: Configure diamond bonus                     │
│   Purchase ₹999 = 1500 diamonds                     │
│   + 20% bonus = +300 diamonds (total 1800)          │
│   Campaign period: March 1 - May 31                 │
│                                                      │
│ Step 3: Set wallet incentive                        │
│   Cashback: 3% on all wallet transactions           │
│   (from 1% normally)                                │
│   Duration: March 1 - May 31                        │
│                                                      │
│ Step 4: Update coin conversion rate                 │
│   Temporary: ₹1 = 1.2 coins (from ₹1 = 1 coin)      │
│   Duration: March 1 - May 31                        │
│                                                      │
│ Step 5: View impact (real-time)                     │
│   MRR projection: ₹5M → ₹7M                         │
│   Coin issuance: 50K/day → 70K/day                  │
│   User conversion: 15% → 22%                        │
│                                                      │
│ Step 6: End campaign                                │
│   May 31, 11:59 PM: Auto-disable special plan       │
│   Existing subscribers continue (no change)         │
│   New purchases revert to regular plans             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## DIAGRAM 6: COIN EXPIRY LIFECYCLE

```
┌────────────────────────────────────────────────────────────────────┐
│                    GOLD COIN LIFECYCLE                             │
└────────────────────────────────────────────────────────────────────┘

USER PURCHASES SUBSCRIPTION: Pro (₹299)
├─ Date: February 1, 2026
├─ Coins issued: 800
├─ Status: ACTIVE
├─ Valid until: March 1, 2026 (30 days)
└─ Expiry: March 1, 2026 at 11:59:59 PM


TIMELINE:

Feb 1 ──────────────────────────────────────────────── Mar 1
│                                                        │
Coins                   DAY 22                      Last day
issued                  (7 days before              of validity
                        expiry)

├─ DAY 1-21: ACTIVE ✓
│   User can spend coins (10% cap)
│   Coins fully usable

├─ DAY 22: 7-DAY WARNING NOTIFICATION
│   System sends: "Your coins expire in 7 days"
│   In-app notification: "800 coins expiring Mar 1"
│   Email notification: "Use or lose them!"
│   SMS (optional): "Coins expiring soon"
│   Status: ACTIVE (still usable)

├─ DAY 23-29: USER HAS CHOICE
│   • Use coins in bookings (if wants)
│   • Let them expire (if doesn't use)
│   • Status: ACTIVE (countable)

├─ DAY 30: LAST DAY
│   Mar 1, 11:59:59 PM: Final second to spend
│   Any transaction started before midnight: OK
│   After midnight: CANNOT start new transaction
│   Status: ACTIVE until 11:59:59 PM

├─ MAR 2, 12:00:00 AM: AUTOMATIC EXPIRY
│   All 800 coins automatically marked: EXPIRED
│   Cannot be used
│   Cannot be refunded
│   Cannot be extended
│   Cannot be transferred
│   User notified: "Your coins expired on Mar 1"
│   Status: EXPIRED (immutable)

└─ AFTER EXPIRY: PERMANENT STATE
    • Coins show in ledger (for audit)
    • Cannot be spent
    • Cannot be recovered
    • If user tried to use:
      → Error: "Coins expired. Renew subscription."
    • User can renew subscription to get new coins
    • Previous coins are NOT carried forward


RENEWAL SCENARIO:

Mar 10: User renews subscription (new cycle)
├─ Previous coins: 0 (expired Mar 1)
├─ New coins: 800 (issued Mar 10)
├─ New validity: April 10
├─ Fresh start (old coins gone forever)
└─ Notification: "New subscription active. 800 coins issued."


COIN USAGE SCENARIO (Before Expiry):

Mar 1, 11:50 PM: User books ₹1000 activity
├─ Has 500 coins remaining (from 800)
├─ 10% of ₹1000 = ₹100 max allowed
├─ Transaction starts: PROCESSING
├─ Time check: 11:50 PM < 11:59:59 PM ✓ Valid
├─ Coins deducted: ₹100 (~100 coins)
├─ Coins remaining: 400
├─ Booking: CONFIRMED ✓
└─ Coins still valid

Mar 1, 11:59:45 PM: User books ₹500 activity
├─ Has 400 coins remaining
├─ Transaction starts: PROCESSING
├─ Time check: 11:59:45 PM < 11:59:59 PM ✓ Still valid
├─ Coins deducted: ₹50 (~50 coins, 10% cap)
├─ Coins remaining: 350
├─ Booking: CONFIRMED ✓
└─ Coins still valid (within grace period)

Mar 2, 12:00:00 AM: EXPIRY MOMENT
├─ Remaining 350 coins: AUTO-EXPIRED
├─ Status: EXPIRED (cannot use)
├─ User cannot spend remaining 350 coins
└─ Lost forever


ANTI-GAMING: Cannot trick system

Scenario: User tries to do last-minute massive spend
Mar 1, 11:55 PM: User initiates ₹100,000 booking
├─ Has 400 coins (₹400)
├─ 10% cap: ₹10,000 max allowed anyway
├─ Transaction processes
├─ System enforces CAP: Only ₹10,000 in coins
├─ Remaining ₹90,000: Must pay with other methods
└─ Result: Cannot abuse end-of-day

```

---

## DIAGRAM 7: SUPER ADMIN EMERGENCY CONTROLS

```
┌────────────────────────────────────────────────────────────────────┐
│          SUPER ADMIN EMERGENCY KILL SWITCHES                       │
└────────────────────────────────────────────────────────────────────┘

SUPER ADMIN PANEL → EMERGENCY CONTROL CENTER

┌─────────────────────────────────────────────────────┐
│  ALL CONTROLS REQUIRE: OTP Confirmation (2FA)       │
│  All actions MUST be logged with reason             │
└─────────────────────────────────────────────────────┘

STATUS: 🟢 SYSTEM NORMAL

AVAILABLE CONTROLS:

┌─────────────────────────────────────────────────────┐
│ 🟢 DISABLE ALL BOOKINGS                             │
├─────────────────────────────────────────────────────┤
│ Current: ✅ Enabled                                 │
│ Action: Click to disable                            │
│ Effect:                                             │
│   • No new bookings accepted                        │
│   • Existing bookings unaffected                    │
│   • Users see: "Bookings temporarily unavailable"   │
│   • Reason required before action                   │
│   • Auto-alert sent to all users                    │
│   • Can be re-enabled anytime                       │
│                                                      │
│ Use case: Server maintenance, security issue, etc.  │
│                                                      │
│                          [DISABLE] ← Click OTP      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🟢 DISABLE ALL PAYMENTS                             │
├─────────────────────────────────────────────────────┤
│ Current: ✅ Enabled                                 │
│ Action: Click to disable                            │
│ Effect:                                             │
│   • No payments processed                           │
│   • Razorpay disabled                               │
│   • Wallet transfers disabled                       │
│   • Users cannot complete any purchase              │
│   • Existing pending payments: Auto-reversed        │
│   • All users notified                              │
│   • Reason required                                 │
│                                                      │
│ Use case: Payment fraud detected, gateway issue    │
│                                                      │
│                          [DISABLE] ← Click OTP      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🟢 DISABLE ALL COINS                                │
├─────────────────────────────────────────────────────┤
│ Current: ✅ Enabled                                 │
│ Action: Click to disable                            │
│ Effect:                                             │
│   • Gold coins cannot be spent                      │
│   • Diamonds cannot be spent                        │
│   • Coin earning paused                             │
│   • Payment resolution skips coin step              │
│   • Users notified                                  │
│   • Reason required                                 │
│                                                      │
│ Use case: Coin system bug, exploit detected        │
│                                                      │
│                          [DISABLE] ← Click OTP      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🟢 DISABLE ALL WALLETS                              │
├─────────────────────────────────────────────────────┤
│ Current: ✅ Enabled                                 │
│ Action: Click to disable                            │
│ Effect:                                             │
│   • Wallet cannot add money                         │
│   • Wallet cannot be spent                          │
│   • Payment resolution skips wallet step            │
│   • Existing balance locked (not lost)              │
│   • Users can only use coins/gateway                │
│   • Reason required                                 │
│                                                      │
│ Use case: Wallet system exploit, fraud issue       │
│                                                      │
│                          [DISABLE] ← Click OTP      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🟢 FORCE GLOBAL LOGOUT                              │
├─────────────────────────────────────────────────────┤
│ Current: No forced logout                           │
│ Action: Click to logout all users                   │
│ Effect:                                             │
│   • ALL logged-in users logged out                  │
│   • All sessions invalidated                        │
│   • Users must log in again                         │
│   • Reason displayed to users                       │
│   • Anti-fraud feature                              │
│                                                      │
│ Use case: Security breach, suspicious activity     │
│                                                      │
│                    [FORCE LOGOUT ALL] ← Click OTP   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🟢 MAINTENANCE MODE                                 │
├─────────────────────────────────────────────────────┤
│ Current: ✅ Normal operation                        │
│ Action: Click to enable maintenance                 │
│ Effect:                                             │
│   • Platform in read-only mode                      │
│   • Users can view only (no actions)                │
│   • Booking: Disabled                               │
│   • Payment: Disabled                               │
│   • Social: Read-only                               │
│   • Maintenance message shown to users              │
│   • Estimated duration: [Enter hours]               │
│                                                      │
│ Use case: Server updates, database migration       │
│                                                      │
│                    [ENTER MAINTENANCE] ← Click OTP  │
└─────────────────────────────────────────────────────┘

AFTER EMERGENCY:

Steps to resume:
1. Fix underlying issue
2. Re-enable controls one by one (if needed)
3. Test with test users
4. Monitor for 1 hour
5. Announce normalcy to users
6. Log all actions in audit trail
```

---

## DIAGRAM 8: ADMIN vs SUPER ADMIN COMPARISON

```
┌────────────────────────────────────────────────────────────────────┐
│          ADMIN vs SUPER ADMIN - PERMISSION MATRIX                  │
└────────────────────────────────────────────────────────────────────┘

ACTION                              │ ADMIN  │ SUPER ADMIN
────────────────────────────────────┼────────┼──────────────
View user subscriptions             │   ✅   │     ✅
View user wallet balance            │   ✅   │     ✅
View user coin balance              │   ✅   │     ✅
View transaction history            │   ✅   │     ✅
View payment logs                   │   ✅   │     ✅
                                    │        │
Process refunds (user request)       │   ✅   │     ✅
Freeze user wallet (fraud)           │   ✅   │     ✅
Suspend user account                │   ✅   │     ✅
Initiate refund (goodwill)          │   ✅   │     ✅
Handle disputes                     │   ✅   │     ✅
                                    │        │
View detailed analytics             │   ✅   │     ✅
Export reports (CSV/PDF)            │   ✅   │     ✅
Search transactions                 │   ✅   │     ✅
Investigate issues                  │   ✅   │     ✅
                                    │        │
─────────────────────────────────────────────────────────
                                    │        │
Create subscription plans           │   ❌   │     ✅
Edit subscription pricing           │   ❌   │     ✅
Delete subscription plans           │   ❌   │     ✅
Configure coin conversion rate      │   ❌   │     ✅
Set coin expiry duration            │   ❌   │     ✅
                                    │        │
Configure diamond packages          │   ❌   │     ✅
Set payment methods                 │   ❌   │     ✅
Enable wallet withdrawal            │   ❌   │     ✅
Configure commission rates          │   ❌   │     ✅
                                    │        │
Emergency disable payments          │   ❌   │     ✅
Emergency disable coins             │   ❌   │     ✅
Global force logout                 │   ❌   │     ✅
Maintenance mode                    │   ❌   │     ✅
Data backup trigger                 │   ❌   │     ✅
                                    │        │
Manually issue coins (special)       │   ❌   │     ✅
Manually revoke coins (special)      │   ❌   │     ✅
Override coin ledger                │   ❌   │     ✅
Extend coin expiry (rare)            │   ❌   │     ✅
Create Super Admin account          │   ❌   │     ✅
                                    │        │
View Super Admin logs               │   ❌   │     ✅
View full audit trail               │   ❌   │     ✅
Configure alert thresholds          │   ❌   │     ✅
Modify platform rules               │   ❌   │     ✅
```

---

**END OF VISUAL DIAGRAMS**

All flows are now visually documented!
