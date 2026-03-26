# Frontend Guide: How to Add Close Friends

## Issue Identified

The API is returning `404 (Not Found)` with error `USER_NOT_FOUND` because the frontend is calling:

```
POST /close-friends/undefined
```

The `:username` parameter is being passed as `undefined`.

## Backend API Details

The backend expects:

```
POST /api/v1/close-friends/:username
```

Where `:username` is the **username** of the user you want to add as a close friend.

### Example:
If you want to add user with username "john_doe" to your close friends:

```
POST /api/v1/close-friends/john_doe
```

## Correct API Usage

### Add Close Friend
```javascript
// CORRECT - Pass the username in the URL path
POST /api/v1/close-friends/{username}

const response = await axios.post('/api/v1/close-friends/john_doe');
```

### Remove Close Friend
```javascript
// CORRECT - Pass the username in the URL path
DELETE /api/v1/close-friends/{username}

const response = await axios.delete('/api/v1/close-friends/john_doe');
```

### Get Close Friends List
```javascript
// CORRECT - No parameter needed
GET /api/v1/close-friends

const response = await axios.get('/api/v1/close-friends');
```

## Common Mistakes to Avoid

### ❌ Wrong - Using undefined or passing ID in body
```javascript
// WRONG - username is undefined
axios.post('/api/v1/close-friends', { userId: '123' });

// WRONG - undefined in URL
axios.post('/api/v1/close-friends/undefined');
```

### ✅ Correct - Use username in URL path
```javascript
// CORRECT - username in URL path
axios.post('/api/v1/close-friends/john_doe');
```

## Important Requirements

1. **The user must follow you** - You can only add someone as a close friend if they follow you
2. **Use username** - Pass the username (not user ID) in the URL path
3. **Authentication required** - Include the auth token in the request header

## Example Implementation

```javascript
// In your close-friend.jsx or api.js

// Add a user to close friends
export const addToCloseFriends = async (username) => {
  const response = await axios.post(`/api/v1/close-friends/${username}`);
  return response.data;
};

// Remove a user from close friends  
export const removeFromCloseFriends = async (username) => {
  const response = await axios.delete(`/api/v1/close-friends/${username}`);
  return response.data;
};

// Get all close friends
export const getCloseFriends = async () => {
  const response = await axios.get('/api/v1/close-friends');
  return response.data;
};
```

## Debugging Tips

If you get `USER_NOT_FOUND` error after fixing the URL:
1. Make sure the username exists in the system
2. Verify the user follows you (required by backend)
3. Check spelling/casing of username

If you get `USER_NOT_A_FOLLOWER` error:
- The user must follow you before you can add them as a close friend