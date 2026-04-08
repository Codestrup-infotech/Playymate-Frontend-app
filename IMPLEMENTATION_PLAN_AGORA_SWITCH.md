# Implementation Plan: AGORA/ZEGOCLOUD Provider Switching

## Overview
The superadmin can switch the video call provider between AGORA and ZEGOCLOUD via the admin panel. The frontend must automatically detect the provider from the API response and use the appropriate SDK to handle the call.

---

## API Response Analysis

### AGORA Response
```json
{
  "token": "OGFmMjBlNDdkZGU2NDhhYmE5ZTVhNTE2NTEyODA4ODc6MTI4MDJlZTMt...",
  "provider_config": {
    "type": "AGORA",
    "app_id": "8af20e47dde648aba9e5a51651280887",
    "channel_name": "12802ee3-cebc-46f1-bac9-9df4118dba6a",
    "uid": 594345672
  }
}
```

### ZEGOCLOUD Response
```json
{
  "token": "04AAAAAGnWJ9AAEDkzaGFvc211a3B4OWQwZWgAgP6d5TAmQfYsIBTDSRm...",
  "provider_config": {
    "type": "ZEGOCLOUD",
    "app_id": 264124546,
    "server_url": "wss://webliveroom264124546-api.coolzcloud.com/ws",
    "room_id": "fccc3389-1420-416a-9c90-f80d1b4bab31",
    "user_id": "69b1517328c3fc04a36cfec8"
  }
}
```

---

## Key Differences

| Field | AGORA | ZEGOCLOUD |
|-------|-------|-----------|
| provider_config.type | "AGORA" | "ZEGOCLOUD" |
| provider_config.app_id | String (UUID) | Number |
| provider_config.channel_name | Yes (room ID) | No |
| provider_config.room_id | No | Yes |
| provider_config.uid | Yes (number) | No |
| provider_config.server_url | No | Yes (WebSocket) |
| provider_config.user_id | No | Yes |

---

## Implementation Steps

### Step 1: Provider Detection (Already Implemented)
The call page already checks `providerConfig.type`:
```javascript
const type = providerConfig.type;
if (type === "AGORA") {
  await initAgora(providerConfig, token, callType, isMounted);
} else if (type === "ZEGOCLOUD") {
  await initZegoCloud(providerConfig, token, callType, isMounted);
}
```

### Step 2: Ensure Token Handling (Already Fixed)
Both providers return `token` in the same field - no changes needed.

### Step 3: Fix Server URL for ZEGOCLOUD
The ZEGOCLOUD server_url has a leading space: `" wss://..."` 

**Fix needed in `src/app/call/[callId]/page.jsx`:**
```javascript
// Trim whitespace from server_url
let serverUrl = providerConfig.server_url?.trim() || "";
```

---

## Files to Check/Update

### 1. `src/app/(home)/home/components/CallNow.jsx`
- **Status:** ✅ Already handles both providers
- **Token extraction:** Works for both

### 2. `src/app/(home)/home/components/IncomingCall.jsx`
- **Status:** ✅ Already handles both providers
- **Token extraction:** Works for both

### 3. `src/app/(home)/home/notifications/page.jsx`
- **Status:** ✅ Already handles both providers
- **Token extraction:** Works for both

### 4. `src/app/(home)/home/messages/page.jsx`
- **Status:** ✅ Already handles both providers
- **Token extraction:** Works for both

### 5. `src/app/call/[callId]/page.jsx`
- **Status:** ⚠️ Need to fix server_url trimming
- **AGORA init:** Already implemented
- **ZEGOCLOUD init:** Already implemented, needs minor fix

---

## Testing Checklist

### Test 1: Switch to AGORA via admin panel
- [ ] Initiate video call
- [ ] Verify `provider_config.type === "AGORA"`
- [ ] Verify `app_id` is a string
- [ ] Verify AGORA SDK initializes correctly
- [ ] Verify call connects

### Test 2: Switch to ZEGOCLOUD via admin panel
- [ ] Initiate video call
- [ ] Verify `provider_config.type === "ZEGOCLOUD"`
- [ ] Verify `app_id` is a number
- [ ] Verify ZEGOCLOUD SDK initializes correctly
- [ ] Verify call connects

### Test 3: Regression check
- [ ] ZEGOCLOUD still works after changes
- [ ] AGORA now works with the switch

---

## Expected Behavior

1. **Superadmin switches provider in admin panel** → Stored in backend config
2. **User initiates call** → Backend returns provider_config with type
3. **Frontend detects type** → Routes to correct SDK (AGORA or ZEGOCLOUD)
4. **Call connects** → User sees video/audio

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| CallNow.jsx | ✅ Done | Token fallback added |
| IncomingCall.jsx | ✅ Done | Token fallback added |
| notifications/page.jsx | ✅ Done | Token fallback added |
| messages/page.jsx | ✅ Done | Token fallback added |
| call/[callId]/page.jsx | ✅ Done | Server_url trim fixed |
| AGORA SDK init | ✅ Done | Already implemented |
| ZEGOCLOUD SDK init | ✅ Done | Already implemented |

---

## Changes Made

### 1. Server URL Trimming (Fixed)
Added `.trim()` to remove leading/trailing whitespace from ZEGOCLOUD server_url:
```javascript
const serverUrl = (providerConfig.server_url || "").trim();
```

### 2. Token Handling (Already Fixed)
All call handling files now support fallback token fields:
- `apiData.token`
- `apiData.rtc_token`
- `apiData.zego_token`

---

## Testing Results

| Provider | Status | Notes |
|----------|--------|-------|
| ZEGOCLOUD | ✅ Working | Camera/mic working |
| AGORA | 🔄 Test Now | Switch from admin panel and test |

---

## How the Flow Works

### Current Flow (Working):
```
1. Admin switches provider in admin panel (AGORA or ZEGOCLOUD)
2. User initiates call → POST /api/v1/calls/initiate
3. Backend returns:
   - provider_config.type = "AGORA" OR "ZEGOCLOUD"
   - provider_config.app_id (string for AGORA, number for ZEGOCLOUD)
   - token for the RTC
4. Frontend reads provider_config.type:
   - if "AGORA" → calls initAgora()
   - if "ZEGOCLOUD" → calls initZegoCloud()
5. Call connects using the appropriate SDK
```

### Key Points:
- Frontend automatically detects provider type from API response
- No code changes needed when switching providers
- Both SDKs are already imported and configured
- Token handling works for both providers

---

## To Test AGORA:
1. Switch provider to AGORA in admin panel
2. Verify backend logs show: `[CallProvider] resolveProvider - Active provider: AGORA`
3. Make a video call
4. Check console logs:
   - Should see `[Agora] Full providerConfig:`
   - Should see `[Agora] appId:` with string app_id
   - Should see `[Agora] channel:` with channel name

---

## BACKEND TEAM: Required Changes

### Issue 1: Provider Not Switching
**Problem:** Backend always returns ZEGOCLOUD even when AGORA is selected in admin panel.

**Solution:**
1. Check the admin panel provider setting
2. Make sure `resolveProvider` reads from the correct config
3. When AGORA is selected:
   - Return `provider_config.type = "AGORA"`
   - Return `provider_config.app_id` (AGORA App ID string)
   - Return `provider_config.channel_name` (room ID)
   - Return `provider_config.uid` (number)
   - Generate AGORA RTC token

### Issue 2: Token Generation
**Problem:** Token not being generated for the selected provider.

**Solution:**
- For AGORA: Use Agora Token Generator with your App ID and Certificate
- For ZEGOCLOUD: Use ZegoCloud Server API with your App ID and Server Secret

### Expected Backend Response for AGORA:
```json
{
  "status": "success",
  "data": {
    "call": {
      "_id": "...",
      "provider": "AGORA",
      "room_id": "uuid-here"
    },
    "token": "AGORA_RTC_TOKEN_HERE",
    "provider_config": {
      "type": "AGORA",
      "app_id": "YOUR_AGORA_APP_ID",  // String (UUID)
      "channel_name": "room-uuid",
      "uid": 12345678  // Number
    }
  }
}
```

### Expected Backend Response for ZEGOCLOUD:
```json
{
  "status": "success",
  "data": {
    "call": {
      "_id": "...",
      "provider": "ZEGOCLOUD",
      "room_id": "uuid-here"
    },
    "token": "ZEGOCLOUD_RTC_TOKEN_HERE",
    "provider_config": {
      "type": "ZEGOCLOUD",
      "app_id": 123456789,  // Number
      "server_url": "wss://webliveroomXXX-api.coolzcloud.com/ws",
      "room_id": "room-uuid",
      "user_id": "user-id"
    }
  }
}
```

### Backend Code Checks:
1. Read provider from admin config
2. Generate correct token based on provider
3. Return correct provider_config fields for each provider
4. Ensure `provider_config.type` matches the provider name exactly ("AGORA" or "ZEGOCLOUD")

---

## Testing Checklist for Backend:

- [ ] When admin selects AGORA, `resolveProvider` returns AGORA
- [ ] `/calls/initiate` returns `provider_config.type = "AGORA"`
- [ ] `/calls/initiate` returns valid AGORA token
- [ ] `/calls/initiate` returns `app_id` as string (AGORA format)
- [ ] `/calls/initiate` returns `channel_name` and `uid` for AGORA
- [ ] When admin selects ZEGOCLOUD, `resolveProvider` returns ZEGOCLOUD
- [ ] `/calls/initiate` returns `provider_config.type = "ZEGOCLOUD"`
- [ ] `/calls/initiate` returns valid ZEGOCLOUD token
- [ ] `/calls/initiate` returns `app_id` as number for ZEGOCLOUD
