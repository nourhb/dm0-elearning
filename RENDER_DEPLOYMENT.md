# Render Deployment Guide for DM0 E-Learning Platform

## 🚀 Quick Setup

### 1. Connect Your Repository
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `https://github.com/nourhb/dm0-elearning`
4. Select the repository and branch (`main`)

### 2. Configure Build Settings
- **Name**: `dm0-elearning` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free` (or your preferred plan)

### 3. Environment Variables Setup

#### Required Environment Variables

Add these environment variables in your Render dashboard under **Environment**:

```env
# Firebase Client Configuration (Already configured in code)
# These are hardcoded in src/lib/firebase.ts

# Firebase Admin SDK (CRITICAL - Add these)
FIREBASE_PROJECT_ID=eduverse-98jdv
FIREBASE_CLIENT_EMAIL=your-service-account-email@eduverse-98jdv.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Alternative: Use service account JSON
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"eduverse-98jdv","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Cloudinary Configuration (Optional but recommended)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-app-name.onrender.com
```

### 4. Get Firebase Admin SDK Credentials

#### Method 1: Service Account JSON (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `eduverse-98jdv`
3. Go to **Project Settings** (gear icon) → **Service accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Copy the entire JSON content and paste it as the value for `FIREBASE_SERVICE_ACCOUNT_JSON`

#### Method 2: Individual Environment Variables
1. From the same service account JSON file, extract:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n)
   - `project_id` → `FIREBASE_PROJECT_ID`

### 5. Deploy
1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Your app will be available at `https://your-app-name.onrender.com`

## 🔧 Troubleshooting

### Common Issues

#### 1. "Application error: a client-side exception has occurred"
**Cause**: Missing Firebase Admin SDK credentials
**Solution**: 
1. Check that `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` are set
2. Test the health endpoint: `https://your-app.onrender.com/api/health`

#### 2. "Failed to retrieve courses" or "Server configuration error"
**Cause**: Firebase Admin SDK not initialized
**Solution**:
1. Verify environment variables are correctly set
2. Check the debug endpoint: `https://your-app.onrender.com/api/debug`

#### 3. Build fails with TypeScript errors
**Cause**: Type checking issues
**Solution**: The build should work now as we've fixed all TypeScript errors

#### 4. "Cloudinary not configured" warnings
**Cause**: Missing Cloudinary credentials
**Solution**: 
1. Set up Cloudinary (optional but recommended for image uploads)
2. Add `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### Testing Your Deployment

#### 1. Health Check
Visit: `https://your-app.onrender.com/api/health`
Expected response:
```json
{
  "status": "healthy",
  "firebase": {
    "status": "initialized",
    "environment_variables": {
      "FIREBASE_PROJECT_ID": true,
      "FIREBASE_CLIENT_EMAIL": true,
      "FIREBASE_PRIVATE_KEY": true
    }
  }
}
```

#### 2. Debug Endpoint
Visit: `https://your-app.onrender.com/api/debug`
This will show detailed Firebase configuration status.

#### 3. Main Application
Visit: `https://your-app.onrender.com`
Should load the login page without errors.

## 📋 Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `FIREBASE_PROJECT_ID=eduverse-98jdv`
- [ ] `FIREBASE_CLIENT_EMAIL=your-service-account-email@eduverse-98jdv.iam.gserviceaccount.com`
- [ ] `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
- [ ] OR `FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}`
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_BASE_URL=https://your-app-name.onrender.com`

## 🚨 Important Notes

1. **Free Tier Limitations**: Render free tier has limitations on build time and monthly usage
2. **Cold Starts**: Free tier apps may have cold starts (first request takes longer)
3. **Environment Variables**: Make sure to add them in Render dashboard, not in your code
4. **Service Account Security**: Never commit Firebase credentials to your repository

## 🔄 Updating Your App

1. Push changes to your GitHub repository
2. Render will automatically detect changes and redeploy
3. Monitor the build logs for any issues
4. Test the health endpoint after deployment

## 📞 Support

If you encounter issues:
1. Check the build logs in Render dashboard
2. Test the health endpoint: `/api/health`
3. Test the debug endpoint: `/api/debug`
4. Check browser console for client-side errors
