Playymate Calls User API Documentation
Overview
This document provides comprehensive API documentation for the Calls Module in Playymate. The Calls module enables users to make audio calls, video calls, and group calls with other users on the platform.
Key Features
Audio Calls: Voice-only calls between users
Video Calls: 1-on-1 video calls
Group Calls: Multi-participant calls (up to 9 participants: 1 host + 8 members)
Real-time Notifications: Push notifications for incoming calls
Call History: View past calls with filtering options

Table of Contents
Base URL & Authentication
Call Types & Status
API Endpoints
Initiate Call
Accept Call
Decline Call
Leave Call
End Call
Add Participant
Get Call History
Get Active Call
Get Call By ID
Socket.io Events
Data Models
Error Codes
Integration Guide

Base URL & Authentication
Base URL
https://api.playymate.com/api/v1


Authentication
All calls API endpoints require authentication via JWT access token.
Header:
Authorization: Bearer <access_token>
Content-Type: application/json


Requirements:
User must be authenticated (valid access token)
User must have completed onboarding (COMPLETED or ACTIVE_USER state)
User must not be suspended

Call Types & Status
Call Types
Type
Description
Max Participants
audio
Voice-only call
2
video
1-on-1 video call
2
group
Multi-participant call
9 (1 host + 8 members)

Call Status
Status
Description
ringing
Caller initiated, callee not yet accepted
ongoing
At least one callee accepted
ended
Normal end
missed
No one answered before timeout (45 seconds)
declined
Callee explicitly declined
cancelled
Caller cancelled before answer
failed
Provider/network error

Participant Status
Status
Description
invited
Participant invited to call
ringing
Participant receiving call notification
joined
Participant joined the call
left
Participant left the call
declined
Participant declined the call
missed
Participant did not answer
kicked
Participant was removed by host

Participant Role
Role
Description
initiator
The user who started the call
participant
A user invited to the call


API Endpoints
1. Initiate Call
Start a new audio, video, or group call.
Endpoint: POST /calls/initiate
Request Body:
{
  "call_type": "video",
  "recipient_ids": ["60f1a2b3c4d5e6f7a8b9c0d1"],
  "is_group_call": false,
  "call_id": "optional-custom-call-id"  // Optional custom call ID
}


Parameters:
Parameter
Type
Required
Description
call_type
string
No
Type of call: audio, video, group (default: video)
recipient_ids
array
Yes
Array of recipient user IDs (MongoDB ObjectIds). Min 1 required.
is_group_call
boolean
No
Set to true for group calls (default: false)
call_id
string
No
Custom call ID (optional, must be unique)

Note: The call_id parameter is optional and allows specifying a custom call ID. If not provided, a unique call ID will be generated automatically.
Success Response (201):
{
  "status": "success",
  "message": "Call initiated",
  "data": {
    "call": {
      "_id": "60f1a2b3c4d5e6f7a8b9c0d2",
      "call_id": "CALL_1701234567890_abc123",
      "call_type": "video",
      "initiator_id": "60f1a2b3c4d5e6f7a8b9c0d1",
      "status": "ringing",
      "provider": "ZEGOCLOUD",
      "room_id": "uuid-v4-identifier",
      "is_group_call": false,
      "total_invited": 2,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "token": "zego_rtc_token_here",
    "provider_config": {
      "type": "ZEGOCLOUD",
      "app_id": 123456789,
      "server_url": "https://webliveroom1.api.zegocloud.com",
      "room_id": "uuid-v4-identifier",
      "user_id": "60f1a2b3c4d5e6f7a8b9c0d1"
    }
  }
}


Provider Config by Type:
ZEGOCLOUD:
{
  "type": "ZEGOCLOUD",
  "app_id": 123456789,
  "server_url": "https://webliveroom1.api.zegocloud.com",
  "room_id": "uuid-v4-identifier",
  "user_id": "user_id"
}


AGORA:
{
  "type": "AGORA",
  "app_id": "agora_app_id",
  "channel_name": "channel_name",
  "uid": 12345678
}


WEBRTC_SELFHOSTED:
{
  "type": "WEBRTC_SELFHOSTED",
  "room_id": "uuid-v4-identifier",
  "user_id": "user_id",
  "ws_url": "wss://rtc.playymate.com",
  "turn": {
    "url": "turn:turn.playymate.com:3478",
    "secret": "turn_secret"
  }
}


Error Responses:
400 - Invalid call type or missing recipient_ids
403 - User blocked by recipient or call feature disabled
409 - You already have an active call
429 - Too many requests (rate limited)
Example cURL:
curl -X POST https://api.playymate.com/api/v1/calls/initiate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "call_type": "video",
    "recipient_ids": ["60f1a2b3c4d5e6f7a8b9c0d1"],
    "is_group_call": false
  }'



2. Accept Call
Accept an incoming call invitation.
Endpoint: POST /calls/:callId/accept
Path Parameters:
Parameter
Type
Required
Description
callId
string
Yes
The call MongoDB ObjectId

Success Response (200):
{
  "status": "success",
  "message": "Call accepted",
  "data": {
    "token": "zego_rtc_token_here",
    "provider_config": {
      "type": "ZEGOCLOUD",
      "app_id": 123456789,
      "server_url": "https://webliveroom1.api.zegocloud.com",
      "room_id": "uuid-v4-identifier",
      "user_id": "user_id"
    },
    "already_joined": false
  }
}


Response Fields:
Field
Type
Description
token
string
RTC token for the provider (required for ZEGOCLOUD/AGORA)
provider_config
object
Provider-specific configuration
already_joined
boolean
True if user already joined (idempotent response)

Note: If already_joined: true is returned, the user has already joined the call. Use the existing provider_config to rejoin the room without generating a new token (token will be null).
Error Responses:
404 - Call not found
400 - Call is not in ringing state
403 - You are not a participant in this call
Example cURL:
curl -X POST https://api.playymate.com/api/v1/calls/60f1a2b3c4d5e6f7a8b9c0d2/accept \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"



3. Decline Call
Decline an incoming call.
Endpoint: POST /calls/:callId/decline
Path Parameters:
Parameter
Type
Required
Description
callId
string
Yes
The call MongoDB ObjectId

Success Response (200):
{
  "status": "success",
  "message": "Call declined"
}


Error Responses:
404 - Call not found
400 - Call is not active
403 - You are not a participant in this call
Example cURL:
curl -X POST https://api.playymate.com/api/v1/calls/60f1a2b3c4d5e6f7a8b9c0d2/decline \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"



4. Leave Call
Leave an ongoing call (any participant can leave).
Endpoint: POST /calls/:callId/leave
Path Parameters:
Parameter
Type
Required
Description
callId
string
Yes
The call MongoDB ObjectId

Success Response (200):
{
  "status": "success",
  "message": "Left call"
}


Error Responses:
404 - Call not found
400 - Call is not ongoing
403 - You are not a participant in this call
Example cURL:
curl -X POST https://api.playymate.com/api/v1/calls/60f1a2b3c4d5e6f7a8b9c0d2/leave \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"



5. End Call
End a call (only the initiator/host can end the call).
Endpoint: POST /calls/:callId/end
Path Parameters:
Parameter
Type
Required
Description
callId
string
Yes
The call MongoDB ObjectId

Success Response (200):
{
  "status": "success",
  "message": "Call ended"
}


Error Responses:
404 - Call not found
403 - Only the call initiator can end the call
Example cURL:
curl -X POST https://api.playymate.com/api/v1/calls/60f1a2b3c4d5e6f7a8b9c0d2/end \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"



6. Add Participant to Group Call
Add a new participant to an ongoing group call (host only).
Endpoint: POST /calls/:callId/add
Path Parameters:
Parameter
Type
Required
Description
callId
string
Yes
The call MongoDB ObjectId

Request Body:
{
  "user_id": "60f1a2b3c4d5e6f7a8b9c0d3"
}


Parameters:
Parameter
Type
Required
Description
user_id
string
Yes
MongoDB ObjectId of user to add

Success Response (201):
{
  "status": "success",
  "message": "Participant added",
  "data": {
    "call_id": "60f1a2b3c4d5e6f7a8b9c0d2",
    "new_participant_id": "60f1a2b3c4d5e6f7a8b9c0d3"
  }
}


Error Responses:
404 - Call not found
400 - Maximum participants reached (9 max)
403 - Only the call initiator can add participants
Example cURL:
curl -X POST https://api.playymate.com/api/v1/calls/60f1a2b3c4d5e6f7a8b9c0d2/add \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "60f1a2b3c4d5e6f7a8b9c0d3"}'



7. Get Call History
Retrieve the authenticated user's call history with optional filters.
Endpoint: GET /calls/history
Query Parameters:
Parameter
Type
Required
Description
page
number
No
Page number (default: 1)
limit
number
No
Items per page (default: 20, max: 50)
call_type
string
No
Filter by type: audio, video, group
status
string
No
Filter by status: ringing, ongoing, ended, missed, declined, cancelled, failed
from_date
string
No
Start date (ISO 8601 format)
to_date
string
No
End date (ISO 8601 format)

Success Response (200):
{
  "status": "success",
  "data": [
    {
      "_id": "60f1a2b3c4d5e6f7a8b9c0d2",
      "call_id": "CALL_1701234567890_abc123",
      "call_type": "video",
      "initiator_id": "60f1a2b3c4d5e6f7a8b9c0d1",
      "status": "ended",
      "provider": "AGORA",
      "room_id": "uuid-v4-identifier",
      "started_at": "2024-01-15T10:30:00Z",
      "ended_at": "2024-01-15T10:35:00Z",
      "duration_seconds": 300,
      "participant_count": 2,
      "total_invited": 2,
      "is_group_call": false,
      "end_reason": "host_ended",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}


Example cURL:
curl -X GET "https://api.playymate.com/api/v1/calls/history?page=1&limit=20&call_type=video" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"



8. Get Active Call
Get the current active call for the authenticated user (if any).
Endpoint: GET /calls/active
Success Response (200):
{
  "status": "success",
  "data": {
    "_id": "60f1a2b3c4d5e6f7a8b9c0d2",
    "call_id": "CALL_1701234567890_abc123",
    "call_type": "video",
    "initiator_id": "60f1a2b3c4d5e6f7a8b9c0d1",
    "status": "ongoing",
    "provider": "AGORA",
    "room_id": "uuid-v4-identifier",
    "started_at": "2024-01-15T10:30:00Z",
    "is_group_call": false,
    "total_invited": 2,
    "created_at": "2024-01-15T10:30:00Z"
  }
}


No Active Call Response (200):
{
  "status": "success",
  "data": null,
  "message": "No active call"
}


Example cURL:
curl -X GET https://api.playymate.com/api/v1/calls/active \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"



9. Get Call By ID
Get detailed information about a specific call.
Endpoint: GET /calls/:callId
Path Parameters:
Parameter
Type
Required
Description
callId
string
Yes
The call MongoDB ObjectId

Success Response (200):
{
  "status": "success",
  "data": {
    "_id": "60f1a2b3c4d5e6f7a8b9c0d2",
    "call_id": "CALL_1701234567890_abc123",
    "call_type": "video",
    "initiator_id": "60f1a2b3c4d5e6f7a8b9c0d1",
    "status": "ended",
    "provider": "AGORA",
    "room_id": "uuid-v4-identifier",
    "provider_room_id": "agora_channel_id",
    "started_at": "2024-01-15T10:30:00Z",
    "ended_at": "2024-01-15T10:35:00Z",
    "duration_seconds": 300,
    "participant_count": 2,
    "total_invited": 2,
    "is_group_call": false,
    "ended_by": "60f1a2b3c4d5e6f7a8b9c0d1",
    "end_reason": "host_ended",
    "recording_blocked": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:35:00Z"
  }
}


Error Responses:
404 - Call not found
Example cURL:
curl -X GET https://api.playymate.com/api/v1/calls/60f1a2b3c4d5e6f7a8b9c0d2 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"



Socket.io Events
The Calls module provides real-time communication via Socket.io. Connect to the default namespace and then join the /calls namespace.
Connection
Correct Connection (Flutter/JavaScript):
// Step 1: Connect to main Socket.io with path
const socket = io('https://api.playymate.com', {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  auth: {
    token: '<access_token>'
  }
});

// Step 2: Join the calls namespace
const callsSocket = socket.io('/calls');

// Now use callsSocket for call events
callsSocket.on('call:incoming', (data) => {
  console.log('Incoming call:', data);
});


Alternative (Direct namespace connection):
const callsSocket = io('https://api.playymate.com/calls', {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  auth: {
    token: '<access_token>'
  }
});


Important:
The Socket.io path is /socket.io/ (not /calls/socket.io/)
Join the /calls namespace after connecting to the main Socket.io
Required transports: websocket (primary) with polling (fallback)
Events
Incoming Call
socket.on('call:incoming', (data) => {
  // {
  //   call_id: "60f1a2b3c4d5e6f7a8b9c0d2",
  //   added: false  // true if added to existing group call
  // }
});


Call Accepted
socket.on('call:accepted', (data) => {
  // {
  //   user_id: "60f1a2b3c4d5e6f7a8b9c0d1",
  //   joined_at: "2024-01-15T10:30:05Z"
  // }
});


Call Declined
socket.on('call:declined', (data) => {
  // {
  //   user_id: "60f1a2b3c4d5e6f7a8b9c0d1"
  // }
});


Participant Left
socket.on('call:participant_left', (data) => {
  // {
  //   user_id: "60f1a2b3c4d5e6f7a8b9c0d1",
  //   left_at: "2024-01-15T10:35:00Z",
  //   disconnected: true  // true if disconnected unexpectedly
  // }
});


Call Ended
socket.on('call:ended', (data) => {
  // {
  //   ended_by: "60f1a2b3c4d5e6f7a8b9c0d1"
  // }
});


Member Added (Group Call)
socket.on('call:member_added', (data) => {
  // {
  //   new_user_id: "60f1a2b3c4d5e6f7a8b9c0d3",
  //   added_by: "60f1a2b3c4d5e6f7a8b9c0d1"
  // }
});


Mute State Changed
socket.on('call:mute_state', (data) => {
  // {
  //   user_id: "60f1a2b3c4d5e6f7a8b9c0d1",
  //   is_audio_muted: true
  // }
});


Video State Changed
socket.on('call:video_state', (data) => {
  // {
  //   user_id: "60f1a2b3c4d5e6f7a8b9c0d1",
  //   is_video_off: true
  // }
});


Emit Events
Accept Call (via Socket)
socket.emit('call:accept', { call_id: '60f1a2b3c4d5e6f7a8b9c0d2' }, (response) => {
  // { success: true, token: '...', provider_config: {...} }
});


Decline Call (via Socket)
socket.emit('call:decline', { call_id: '60f1a2b3c4d5e6f7a8b9c0d2' }, (response) => {
  // { success: true }
});


Leave Call (via Socket)
socket.emit('call:leave', { call_id: '60f1a2b3c4d5e6f7a8b9c0d2' }, (response) => {
  // { success: true }
});


End Call (via Socket)
socket.emit('call:end', { call_id: '60f1a2b3c4d5e6f7a8b9c0d2' }, (response) => {
  // { success: true }
});


Add Member (Group Call)
socket.emit('call:add_member', { 
  call_id: '60f1a2b3c4d5e6f7a8b9c0d2',
  user_id: '60f1a2b3c4d5e6f7a8b9c0d3'
}, (response) => {
  // { success: true }
});


Toggle Mute
socket.emit('call:mute', { 
  call_id: '60f1a2b3c4d5e6f7a8b9c0d2',
  muted: true
}, (response) => {
  // { success: true }
});


Toggle Video
socket.emit('call:video_toggle', { 
  call_id: '60f1a2b3c4d5e6f7a8b9c0d2',
  video_off: true
}, (response) => {
  // { success: true }
});


Ping (Heartbeat)
socket.emit('call:ping', { 
  call_id: '60f1a2b3c4d5e6f7a8b9c0d2'
}, (response) => {
  // { success: true, timestamp: 1701234567890 }
});



Data Models
Call Model (rtc_calls)
Field
Type
Description
_id
ObjectId
MongoDB document ID
call_id
String
Human-readable unique ID (e.g., CALL_1701234567890_abc123)
call_type
String
audio, video, or group
initiator_id
ObjectId
User ID of the caller
status
String
Current call status
provider
String
RTC provider: AGORA, ZEGOCLOUD, WEBRTC_SELFHOSTED
provider_room_id
String
Provider's internal room/channel ID
provider_meta
Object
Provider-specific data
room_id
String
Internal room identifier (UUID)
started_at
Date
When call started (first participant joined)
ended_at
Date
When call ended
duration_seconds
Number
Total call duration in seconds
participant_count
Number
Peak concurrent participants
total_invited
Number
Total number of invited participants
is_group_call
Boolean
Whether this is a group call
ended_by
ObjectId
User ID who ended the call
end_reason
String
Reason for ending: host_ended, all_left, timeout, error, all_declined
recording_blocked
Boolean
Always true - recording is blocked
created_at
Date
Timestamp when call was created
updated_at
Date
Last update timestamp

Call Participant Model (rtc_participants)
Field
Type
Description
_id
ObjectId
MongoDB document ID
call_id
ObjectId
Reference to the call
user_id
ObjectId
Reference to the user
status
String
Participant status
role
String
initiator or participant
invited_at
Date
When participant was invited
joined_at
Date
When participant joined the call
left_at
Date
When participant left the call
duration_seconds
Number
How long participant was in call
is_audio_muted
Boolean
Whether participant is muted
is_video_off
Boolean
Whether participant's video is off
provider_uid
Number
Provider-specific user ID
device_info
Object
Device information (platform, os_version, app_version)

Call Event Model (rtc_events)
Field
Type
Description
_id
ObjectId
MongoDB document ID
call_id
ObjectId
Reference to the call
user_id
ObjectId
User who triggered the event
event_type
String
Type of event
meta
Object
Additional event data
is_deleted
Boolean
Soft delete flag


Error Codes
Error Code
HTTP Status
Description
CALL_NOT_FOUND
404
Call not found
NOT_AUTHORIZED
403
Not authorized to perform this action
CALL_ALREADY_ACTIVE
409
You already have an active call
CALL_NOT_ACTIVE
400
Call is not active
MAX_PARTICIPANTS_REACHED
400
Maximum participants reached (9 max)
USER_BLOCKED
403
You cannot call this user
PROVIDER_ERROR
502
Provider error occurred
CALL_FEATURE_DISABLED
403
Call feature is currently disabled
INVALID_CALL_TYPE
400
Invalid call type specified
PARTICIPANT_NOT_FOUND
404
Participant not found in this call
NOT_PARTICIPANT
403
You are not a participant in this call
NOT_INITIATOR
403
Only the call initiator can perform this action
CALL_ENDED
400
This call has ended
INVALID_STATE
400
Invalid call state for this operation

Additional Accept Error Codes:
Error Code
HTTP Status
Description
CALL_ENDED
400
Call has already ended (new)
ALREADY_JOINED
200
Already joined (idempotent - check already_joined flag)

Error Response Format
{
  "status": "error",
  "message": "Error description",
  "error_code": "ERROR_CODE"
}



Integration Guide
Step 1: Initialize a Call
User selects recipient(s) and call type
Call POST /calls/initiate with recipient IDs
Receive call object, RTC token, and provider config
Use provider config to initialize RTC engine (Agora/ZegoCloud/WebRTC)
Step 2: Handle Incoming Call (Callee)
Receive push notification or Socket.io call:incoming event
Show incoming call UI
User can accept or decline
Call POST /calls/:callId/accept or POST /calls/:callId/decline
If accepted, receive token and join RTC room
Step 3: During Call
Use Socket.io events for real-time updates
Handle participant join/leave events
Implement mute/unmute and video toggle
Send periodic pings to maintain presence
Step 4: End Call
Any participant can leave via POST /calls/:callId/leave
Only initiator can end via POST /calls/:callId/end
Call automatically ends when all participants leave
Call timeout job handles missed calls (45 seconds)
Sample Integration (JavaScript)
// Initiate a call
async function initiateCall(callType, recipientIds) {
  const response = await fetch('/api/v1/calls/initiate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      call_type: callType,
      recipient_ids: recipientIds,
      is_group_call: recipientIds.length > 1
    })
  });
  
  const { data } = await response.json();
  return data;
}

// Accept a call
async function acceptCall(callId) {
  const response = await fetch(`/api/v1/calls/${callId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const { data } = await response.json();
  return data;
}

// Get call history
async function getCallHistory(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/v1/calls/history?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return await response.json();
}


Push Notifications
The system sends push notifications for:
Incoming Call: When someone calls you
Missed Call: When you miss a call
Group Call Invite: When added to a group call
Call Declined: When someone declines your call
Notification payload includes:
content_id: Call ID
content_type: call
preview_text: Call preview text

Configuration
Default Settings (Configurable by Admin)
Ringing Timeout: 45 seconds (after which call is marked as missed)
Max Group Participants: 9 (1 host + 8 members)
Max Call Duration: 60 minutes
Call History TTL: 90 days
Supported Providers
Agora: Default provider with App ID/Certificate
ZegoCloud: Alternative provider with App ID/Server Secret
WebRTC Self-hosted: Self-hosted RTC server

Rate Limiting
Initiate Call: 10 requests per minute
Accept/Decline/Leave/End: 30 requests per minute
Get History: 60 requests per minute

Changelog
Version
Date
Changes
1.0.0
2024-01-15
Initial release
1.1.0
2024-02-01
Added group call support
1.2.0
2024-03-01
Added Socket.io real-time events
1.3.0
2026-04-06
Fixed provider_config to include room_id, user_id, server_url; Added idempotent accept response; Updated Socket.io connection guide


Support
For API issues or questions, contact: api-support@playymate.com



