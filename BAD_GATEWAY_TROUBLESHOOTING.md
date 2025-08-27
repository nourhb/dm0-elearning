# Bad Gateway Troubleshooting Guide

## Issue Description
You're experiencing a "Bad Gateway" error on Render after implementing the new authentication system.

## Root Cause
The Bad Gateway error is likely caused by:
1. **Authentication System Complexity**: The new `TokenManager` and `useAuthRefresh` system may be causing initialization issues
2. **Firebase Admin SDK Initialization**: The authentication system depends on Firebase Admin SDK which may not be properly configured
3. **API Route Errors**: The dashboard overview API may be throwing unhandled errors

## Immediate Solutions

### 1. Test the Health Check Endpoint
First, test if the basic application is working:
```
https://your-app-name.onrender.com/api/health
```

### 2. Test the Simplified Dashboard API
Try the simplified dashboard endpoint:
```
https://your-app-name.onrender.com/api/dashboard/overview-simple
```

### 3. Use Demo Login
Navigate to the demo login page to test authentication:
```
https://your-app-name.onrender.com/demo-login
```

## Environment Variables Check
Ensure these environment variables are set in Render:

### Required Firebase Variables:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (or `FIREBASE_PRIVATE_KEY_B64`)

### Optional Variables:
- `NODE_ENV=production`
- `DEMO_USER_ID` (for fallback authentication)
- `DEMO_USER_ROLE` (for fallback authentication)

## Render Dashboard Steps

### 1. Check Build Logs
1. Go to your Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for any error messages during build or runtime

### 2. Check Environment Variables
1. Go to your service settings
2. Click "Environment"
3. Verify all Firebase variables are set correctly

### 3. Manual Redeploy
1. Go to your service
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"

## Alternative Solutions

### Option 1: Disable Complex Authentication Temporarily
If the issue persists, we can temporarily disable the complex authentication system and use a simpler approach.

### Option 2: Use Static Export
If the API routes are causing issues, we can configure the app for static export.

### Option 3: Switch to Vercel
Vercel often handles Next.js applications better than Render.

## Testing Steps

### 1. Test Basic Functionality
```bash
# Test health endpoint
curl https://your-app-name.onrender.com/api/health

# Test simplified dashboard
curl https://your-app-name.onrender.com/api/dashboard/overview-simple
```

### 2. Test Demo Authentication
1. Visit `/demo-login`
2. Click "Admin Dashboard"
3. Check if the dashboard loads

### 3. Check Browser Console
1. Open browser developer tools
2. Go to Console tab
3. Look for any JavaScript errors

## Common Error Messages and Solutions

### "Firebase Admin SDK not initialized"
- Check Firebase environment variables
- Ensure `FIREBASE_PROJECT_ID` is correct

### "Token verification failed"
- This is expected if no valid token is present
- Use demo login to test

### "Connection timeout"
- Render may be having temporary issues
- Wait a few minutes and try again

## Next Steps

1. **Test the health endpoint** to verify basic functionality
2. **Check Render logs** for specific error messages
3. **Verify environment variables** are correctly set
4. **Try demo login** to test authentication flow
5. **Contact Render support** if the issue persists

## Emergency Rollback
If needed, we can quickly rollback to a simpler authentication system that was working before.

---

**Status**: The application builds successfully locally, but deployment issues need to be resolved on Render's side.
