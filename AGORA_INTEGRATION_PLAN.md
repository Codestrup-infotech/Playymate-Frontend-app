# Agora Integration Implementation Plan

## Overview
Current implementation uses ZegoCloud exclusively. Need to make it dynamic based on `provider_config.type` from API response (AGORA, ZEGOCLOUD, or WEBRTC_SELFHOSTED).

---

## Task 1: Create Agora RTC Provider Module
**File:** `src/lib/agora-rtc.js` (NEW)
**Status:** ✅ COMPLETED

### Subtasks:
1.1. Create AgoraRTC class wrapper ✅
1.2. Implement methods: ✅
1.3. Export default instance ✅

---

## Task 2: Update Call Page to Support Dynamic Provider
**File:** `src/app/call/[callId]/page.jsx`
**Status:** ✅ COMPLETED

### Subtasks:
2.1. Remove hardcoded ZEGOCLOUD check (line 94-96) ✅
2.2. Add provider detection ✅
2.3. Conditional initialization for AGORA and ZEGOCLOUD ✅
2.4. Update cleanup function to handle both providers ✅
2.5. Update toggleMute/toggleVideo for both providers ✅
2.6. Add provider type indicator in UI ✅

---

## Task 3: Update CallNow.jsx - Remove Provider Restriction
**File:** `src/app/(home)/home/components/CallNow.jsx`
**Status:** ✅ COMPLETED

### Subtasks:
3.1. Remove line 38-40 provider type check ✅
3.2. Keep storing provider_config in session (already works) ✅

---

## Task 4: Update IncomingCall.jsx - Remove Provider Restriction
**File:** `src/app/(home)/home/components/IncomingCall.jsx`
**Status:** ✅ NO CHANGES NEEDED (already handles provider_config correctly)

### Subtasks:
4.1. Verify provider_config is stored correctly ✅
4.2. No changes needed - already stores provider_config ✅

---

## Task 5: Update Notifications Page
**File:** `src/app/(home)/home/notifications/page.jsx`
**Status:** ✅ NO CHANGES NEEDED (already handles accept/decline calls)

### Subtasks:
5.1. No changes needed - already handles accept/decline calls ✅

---

## Task 6: Add Agora SDK Dependency
**File:** `package.json`
**Status:** ✅ ALREADY INSTALLED (agora-rtc-sdk-ng@^4.24.3)

### Subtasks:
6.1. Agora SDK already installed ✅

---

## Task 7: Test Integration

### Subtasks:
7.1. Test ZEGOCLOUD flow (existing - should still work)
7.2. Test AGORA flow:
    - Initiate call from CallNow button
    - Accept incoming call
    - Accept from notifications
7.3. Verify both audio and video calls work

---

## API Response Structure Reference

### AGORA Response:
```json
{
  "token": "agora_token_here",
  "provider_config": {
    "type": "AGORA",
    "app_id": "87d36cee3f164ab3aa92c5cbe57f4d76",
    "channel_name": "06ed530d-9ca4-4fc6-b8fd-2fb4cd098af5",
    "uid": 594345672
  }
}
```

### ZEGOCLOUD Response (existing):
```json
{
  "token": "zego_token_here",
  "provider_config": {
    "type": "ZEGOCLOUD",
    "app_id": 123456789,
    "server_url": "https://webliveroom1.api.zegocloud.com",
    "room_id": "uuid-v4-identifier",
    "user_id": "user_id"
  }
}
```

---

## Key Implementation Notes

1. **Provider Detection**: Use `providerConfig.type` from API response
2. **Session Storage**: Already stores `provider_config` - no changes needed
3. **Backward Compatibility**: ZEGOCLOUD continues to work as before
4. **Dynamic Loading**: Use dynamic imports for SDKs to avoid bundling both
5. **Provider Abstraction**: Create unified interface for both providers

---

## Implementation Order (COMPLETED)

1. ✅ Task 6: Agora SDK already installed
2. ✅ Task 1: Create Agora provider module
3. ✅ Task 3: Update CallNow.jsx
4. ✅ Task 4: Verified IncomingCall.jsx (no changes needed)
5. ✅ Task 2: Update Call page with dynamic provider
6. ✅ Task 5: Verified Notifications page (no changes needed)
7. 🔲 Task 7: Test all flows (PENDING)

---

## Testing Checklist

- [ ] Test ZEGOCLOUD flow (existing - should still work)
- [ ] Test AGORA flow:
  - [ ] Initiate call from CallNow button
  - [ ] Accept incoming call
  - [ ] Accept from notifications
- [ ] Verify both audio and video calls work for both providers
- [ ] Test mute/unmute for both providers
- [ ] Test video on/off for both providers
- [ ] Test call end/leave for both providers