# Environment Setup and Admin Access Guide

This document explains how to configure ReelApps for different environments and resolve admin access issues.

## Quick Fix Summary

### 1. Environment-Based URL Routing ✅

**Problem**: Apps were hardcoded to production URLs even in development.

**Solution**: 
- Created environment-aware URL configuration in `packages/config/src/apps.ts`
- URLs automatically switch between localhost (dev) and production domains (prod)
- Added helper scripts for easy environment setup

### 2. Admin Access Control ✅

**Problem**: Admin users were getting "Access Denied" errors when trying to access apps.

**Solution**:
- Updated all app access checks to allow admin users
- Modified role validation in `apps/home/src/App.tsx` and all individual apps
- Admin users now have access to all applications regardless of the intended user role

## Environment Configuration

### Development Environment

Run this command to set up development URLs (localhost):

```bash
npm run setup:dev
```

This configures:
- Main App: `http://localhost:5173`
- ReelCV: `http://localhost:5174`
- ReelPersona: `http://localhost:5175`
- ReelHunter: `http://localhost:5176`
- ReelProject: `http://localhost:5177`
- ReelSkills: `http://localhost:5176`

### Production Environment

Run this command to set up production URLs:

```bash
npm run setup:prod
```

This configures:
- Main App: `https://www.reelapps.co.za`
- ReelCV: `https://www.reelcv.co.za`
- ReelPersona: `https://www.reelpersona.co.za`
- ReelHunter: `https://www.reelhunter.co.za`
- ReelProject: `https://www.reelprojects.co.za`
- ReelSkills: `https://www.reelskills.co.za`

## Development Workflow

1. **Set up development environment**:
   ```bash
   npm run setup:dev
   ```

2. **Start the main app**:
   ```bash
   cd apps/home
   npm run dev
   ```

3. **Start individual apps** (in separate terminals):
   ```bash
   # ReelCV
   pnpm --filter @reelapps/reelcv dev

   # ReelHunter  
   pnpm --filter @reelapps/reelhunter dev

   # ReelPersona
   pnpm --filter @reelapps/reelpersona dev

   # ReelProject
   pnpm --filter @reelapps/reelproject dev

   # ReelSkills
   pnpm --filter @reelapps/reelskills dev
   ```

4. **Access the main app**: Navigate to `http://localhost:5173`

## Admin Access Testing

### Creating an Admin User

1. Sign up for a new account in the application
2. In your Supabase dashboard, go to the `profiles` table
3. Find your user record and change the `role` field from `candidate` or `recruiter` to `admin`
4. Save the changes

### Testing Admin Access

Admin users should now have access to:
- ✅ All applications (ReelCV, ReelHunter, ReelPersona, ReelProject, ReelSkills)
- ✅ Both candidate-specific apps (ReelCV, ReelSkills)
- ✅ Both recruiter-specific apps (ReelHunter)
- ✅ Mixed-access apps (ReelPersona, ReelProject)

### Verifying the Fix

1. Log in as an admin user
2. Navigate to the dashboard
3. Try clicking on each app link
4. You should now be able to access all apps without "Access Denied" errors
5. The navigation header should show your role as "(admin)"

## Technical Details

### Updated Files

1. **`packages/config/src/apps.ts`**:
   - Added environment-aware URL generation
   - Added `admin` role to all app configurations
   - Created `getMainAppUrl()` helper function

2. **`apps/home/src/App.tsx`**:
   - Updated `AppWrapper` component to allow admin access
   - Added role display in navigation header
   - Uses environment-based URLs

3. **Individual App Files**:
   - `apps/reelcv/src/App.tsx`
   - `apps/reelhunter/src/App.tsx`
   - `apps/reelpersona/src/App.tsx`
   - `apps/reelproject/src/App.tsx`
   - `apps/reelskills/src/App.tsx`
   
   All updated to:
   - Use `getMainAppUrl()` for environment-aware routing
   - Allow admin access alongside intended user roles
   - Display user role in navigation

4. **Package Dependencies**:
   - Added `@reelapps/config` dependency to all app packages

5. **Scripts**:
   - Created `scripts/setup-env.js` for environment configuration
   - Added npm scripts: `setup:dev` and `setup:prod`

### Environment Detection Logic

The system detects the environment using:
```javascript
const isDev = process.env.NODE_ENV === 'development' || 
              (typeof window !== 'undefined' && window.location.hostname === 'localhost');
```

This ensures:
- Development: Uses localhost URLs
- Production: Uses production domain URLs
- Works in both server-side and client-side contexts

## Troubleshooting

### Port Conflicts
If you get port conflicts, update the port numbers in:
- Individual app `vite.config.ts` files
- `scripts/setup-env.js` development configuration

### Admin Access Still Denied
1. Verify the user's role in the database is exactly `admin` (case-sensitive)
2. Clear browser cache and localStorage
3. Log out and log back in
4. Check browser developer tools for any console errors

### Environment Variables Not Applied
1. Restart your development servers after running setup scripts
2. Check that `.env` file in the root directory contains the correct URLs
3. Ensure `NODE_ENV` is set correctly

## Production Deployment

Before deploying to production:

1. Run the production setup:
   ```bash
   npm run setup:prod
   ```

2. Verify all environment variables are correct
3. Test admin access in the production environment
4. Check that all inter-app navigation works correctly

## Additional Notes

- Admin users can access all apps regardless of their intended user base
- The role-based access control is now properly implemented
- Environment-specific routing eliminates hardcoded URLs
- The setup is backwards compatible with existing deployments 