# Firebase Authentication Setup for Admin Portal

## Prerequisites
1. A Firebase project with Authentication enabled
2. At least one user account in Firebase Authentication
3. Firebase project service account key

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"

# Firebase Client SDK Configuration (for browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id

# Session Configuration
FIREBASE_AUTH_COOKIE_NAME=__session
FIREBASE_AUTH_COOKIE_SIGNATURE_KEY_CURRENT=your-secret-key-32-chars-min
FIREBASE_AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS=your-previous-secret-key-32-chars-min
```

## Getting Firebase Configuration Values

### 1. Firebase Project Settings
Go to Firebase Console → Project Settings → General tab:
- **Project ID**: Copy the "Project ID" value
- **Web API Key**: Copy from "Web API Key" in the web app configuration

### 2. Service Account Key
Go to Firebase Console → Project Settings → Service Accounts tab:
1. Click "Generate new private key"
2. Download the JSON file
3. Extract the following values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and escape sequences)

### 3. Generate Session Keys
Generate secure random strings for cookie signing:
```bash
# Generate 32-character random strings
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Initial Admin User Setup

### Option 1: Using the Setup Script
```bash
# Create first admin user
node scripts/setup-admin.js setup user@example.com

# Remove admin access
node scripts/setup-admin.js remove user@example.com

# List all admin users
node scripts/setup-admin.js list
```

### Option 2: Manual Setup via Firebase Console
1. Go to Firebase Console → Authentication → Users
2. Find your user and note their UID
3. Go to Firebase Console → Authentication → Custom Claims
4. Add custom claim: `{"admin": true, "role": "admin"}`

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Service Account Key**: Keep the private key secure and rotate regularly
3. **Session Cookies**: Use secure, HTTP-only cookies (already configured)
4. **HTTPS**: Always use HTTPS in production
5. **Role Validation**: Middleware validates admin claims on every request

## Testing the Authentication Flow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Access Admin Portal**:
   - Go to `http://localhost:3000/admin`
   - You should be redirected to `/admin/login`

3. **Login Process**:
   - Enter admin user credentials
   - System validates Firebase auth + admin claims
   - Redirects to admin dashboard on success

4. **Session Management**:
   - Sessions last 5 days by default
   - Automatic logout on session expiry
   - Secure cookie-based session storage

## Troubleshooting

### "Service account object must contain project_id"
- Check that `FIREBASE_PROJECT_ID` is set correctly
- Verify the service account JSON has the `project_id` field

### "Invalid credentials" during login
- Verify user exists in Firebase Authentication
- Check that user has admin custom claims
- Ensure Firebase client config is correct

### "Unauthorized" after login
- Verify admin custom claims are set: `{"admin": true, "role": "admin"}`
- Check middleware is properly configured
- Ensure session API route is working

### Build/Development Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Check all environment variables are set

## Deployment Notes

For production deployment:
1. Set all environment variables in your hosting platform
2. Ensure HTTPS is enabled
3. Update Firebase project settings for production domain
4. Monitor Firebase usage and billing
5. Set up proper error logging and monitoring

## API Routes

The admin authentication system includes these API routes:
- `POST /api/admin/auth/session` - Create admin session
- `POST /api/admin/auth/logout` - Destroy session
- `POST /api/admin/auth/claims` - Manage admin claims (for setup script)

All admin routes are protected by middleware that validates Firebase sessions and admin claims.
