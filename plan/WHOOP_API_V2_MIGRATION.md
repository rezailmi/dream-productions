# WHOOP API v2 Migration - October 2025

## Problem Summary

The WHOOP API was returning 404 errors when attempting to fetch sleep data. This was due to WHOOP deprecating their v1 API on October 1, 2025, and requiring all applications to migrate to v2.

## Root Cause

1. **Outdated Base URL**: Using `https://api.prod.whoop.com/developer/v2` instead of `https://api.whoop.com/developer/v2`
2. **Incorrect Endpoints**: Using v1 endpoints like `/activity/sleep` instead of v2 endpoints like `/sleep`
3. **Missing Date Parameters**: API calls without date ranges were failing
4. **Data Type Changes**: v2 uses UUIDs for resource IDs instead of integers

## Changes Made

### 1. Updated Base URL and OAuth URLs

#### `server/src/services/whoopService.ts`
- Changed base URL from `https://api.prod.whoop.com/developer/v2` to `https://api.whoop.com/developer/v2`
- Made base URL configurable via `WHOOP_API_BASE_URL` environment variable
- Added request/response interceptors for better debugging

```typescript
const baseURL = process.env.WHOOP_API_BASE_URL || 'https://api.whoop.com/developer/v2';
```

#### `server/src/routes/auth.ts`
- Updated OAuth URLs:
  - Authorization: `https://api.whoop.com/oauth/oauth2/auth`
  - Token: `https://api.whoop.com/oauth/oauth2/token`

### 2. Updated API Endpoints

All endpoint paths were updated to match v2 API:

| Old Endpoint (v1) | New Endpoint (v2) |
|-------------------|-------------------|
| `/activity/sleep` | `/sleep` |
| `/activity/sleep/{id}` | `/sleep/{id}` |
| `/cycle/{id}/recovery` | `/recovery/{id}` |

### 3. Added Default Date Parameters

The v2 API appears to require date ranges for sleep queries. Added automatic defaults:

```typescript
// Default to last 30 days if no date range provided
if (!params?.start && !params?.end) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  queryParams.start = thirtyDaysAgo.toISOString();
  queryParams.end = now.toISOString();
}
```

### 4. Updated Data Types

Changed resource ID types from `number` to `string` to support UUIDs:

```typescript
// Old
async getRecoveryByCycle(accessToken: string, cycleId: number)

// New
async getRecoveryByCycle(accessToken: string, cycleId: string)
```

### 5. Enhanced Logging and Error Handling

#### Added Request/Response Interceptors
```typescript
// Request logging
this.client.interceptors.request.use((config) => {
  console.log('WHOOP API Request:', {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL}${config.url}`,
    params: config.params,
    hasAuth: !!config.headers?.Authorization,
  });
  return config;
});

// Response/Error logging
this.client.interceptors.response.use(
  (response) => { /* log success */ },
  (error) => { /* log detailed error info */ }
);
```

#### Enhanced Error Messages

**Backend (`server/src/routes/whoop.ts`)**:
- 404 errors now include troubleshooting information
- 401/403 errors explicitly indicate authentication issues
- All errors include detailed error data from WHOOP API

**Frontend (`contexts/HealthDataContext.tsx`)**:
- Separate handling for 401/403 (token expiration)
- Separate handling for 404 (no data found)
- More informative user-facing error messages

### 6. Updated Configuration and Documentation

#### `server/src/config.ts`
- Added logging of WHOOP API base URL on startup

#### `server/README.md`
- Added troubleshooting section for v2 API migration
- Documented optional `WHOOP_API_BASE_URL` environment variable
- Listed all endpoint changes and migration details

## Files Modified

1. `server/src/services/whoopService.ts` - Core API client updates
2. `server/src/routes/whoop.ts` - Route handling and error messages
3. `server/src/routes/auth.ts` - OAuth URL updates
4. `server/src/config.ts` - Configuration logging
5. `server/README.md` - Documentation updates
6. `contexts/HealthDataContext.tsx` - Client-side error handling

## Migration Checklist

- [x] Update base URL to `https://api.whoop.com/developer/v2`
- [x] Update OAuth URLs to remove `.prod` subdomain
- [x] Change endpoint paths to v2 format
- [x] Update data types (int → UUID for IDs)
- [x] Add default date parameters
- [x] Enhance logging and error handling
- [x] Update documentation
- [x] Make base URL configurable

## Testing Instructions

### 1. Reconnect WHOOP Account

Since OAuth URLs have changed, users need to reconnect:

1. Open the app and go to Profile tab
2. If already connected, disconnect WHOOP
3. Tap "Connect WHOOP"
4. Complete OAuth flow (should now use new URLs)
5. Verify connection status shows as active

### 2. Test Sleep Data Fetching

```bash
# Start backend server
cd server
npm run dev

# Watch logs for:
# - "WHOOP API Base URL: https://api.whoop.com/developer/v2 (default)"
# - Request logs showing correct endpoints
```

In the app:
1. Go to Home tab
2. Tap to fetch sleep data
3. Should see recent sleep sessions (last 30 days)

### 3. Verify Logs

Server logs should show:
```
WHOOP API Request: { method: 'GET', url: 'https://api.whoop.com/developer/v2/sleep', ... }
WHOOP API Response: { status: 200, dataSize: ... }
```

### 4. Test Error Scenarios

**No Sleep Data**:
- User with no recent sleep data should see helpful 404 message

**Expired Token**:
- Wait for token to expire (1 hour)
- Attempt to fetch data
- Should see "WHOOP Connection Expired" message

## Environment Variables

### Required
No changes to required variables.

### New Optional Variable
```bash
# Optional: Override default WHOOP API base URL
WHOOP_API_BASE_URL=https://api.whoop.com/developer/v2
```

Only needed if:
- Testing against a different API version
- Using a staging/development API
- Debugging with a proxy

## Breaking Changes

### For Users
- Must reconnect WHOOP account (OAuth URLs changed)
- Old tokens may not work with new endpoints

### For Developers
- `cycleId` parameter changed from `number` to `string`
- Endpoint paths changed (see table above)
- Base URL changed (update any hardcoded references)

## Rollback Plan

If issues arise, can temporarily use old v1 endpoints by setting:

```bash
WHOOP_API_BASE_URL=https://api.prod.whoop.com/developer/v1
```

And reverting endpoint changes. However, v1 is deprecated and will eventually stop working.

## Future Considerations

### Token Refresh
Current implementation doesn't handle refresh tokens. Consider adding:

1. Store refresh token securely
2. Check token expiration before API calls
3. Automatically refresh when expired
4. Update stored access token

### Webhook Migration
If webhooks are added later, ensure they're configured for v2:
- Webhook model version must be set to v2
- Resource IDs in webhook payloads will be UUIDs
- Event structure may differ from v1

### Rate Limiting
Monitor for rate limit changes in v2. May need to add:
- Backoff strategy
- Request queuing
- Rate limit headers handling

## References

- [WHOOP API v1 to v2 Migration Guide](https://developer.whoop.com/docs/developing/v1-v2-migration)
- [WHOOP Developer Portal](https://developer.whoop.com/)
- [WHOOP API v2 Documentation](https://developer.whoop.com/api)

## Summary

The migration from v1 to v2 required:
1. Updating all API URLs (base URL and OAuth)
2. Changing endpoint paths
3. Adding default date parameters
4. Updating data types for UUIDs
5. Enhancing error handling and logging

The fixes are backward-compatible through environment variables, and the implementation includes comprehensive logging to help diagnose any future issues.

---

**Migration Date**: October 18, 2025  
**API Deprecation Date**: October 1, 2025  
**Status**: ✅ Complete

