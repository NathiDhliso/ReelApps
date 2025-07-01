# ReelApps CI/CD and Supabase Configuration Fixes

## Issues Fixed

### 1. CI/CD Workflow Placement Issue
- **Problem**: All deployment workflows were located in ReelApps/.github/workflows/ 
- **Issue**: Each app should have its own workflow in its own repository
- **Solution**: Moved individual app workflows to their respective directories

### 2. Supabase Environment Variables Missing
- **Problem**: ReelApps was throwing Supabase configuration errors on `npm run dev`
- **Issue**: Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables
- **Solution**: Created .env.example and temporary .env files

## Changes Made

### 1. CI/CD Workflow File Organization

**Before:**
```
ReelApps/.github/workflows/
├── deploy-main.yml (✅ Correct - stays here)
├── deploy-reelcv.yml (❌ Wrong location)
├── deploy-reelhunter.yml (❌ Wrong location)
├── deploy-reelskills.yml (❌ Wrong location)
├── deploy-reelpersona.yml (❌ Wrong location)
├── deploy-reelprojects.yml (❌ Wrong location)
├── ci-cd-workspace.yml (✅ Correct - workspace-wide)
└── ci-cd.yml (✅ Correct - main CI/CD)
```

**After:**
```
ReelApps/.github/workflows/
├── deploy-main.yml (✅ Main portal deployment)
├── ci-cd-workspace.yml (✅ Workspace-wide CI/CD)
└── ci-cd.yml (✅ Main CI/CD pipeline)

ReelCV/.github/workflows/
└── deploy-reelcv.yml (✅ ReelCV deployment)

Reelhunter/.github/workflows/
└── deploy-reelhunter.yml (✅ ReelHunter deployment)

ReelSkills/.github/workflows/
└── deploy-reelskills.yml (✅ ReelSkills deployment)

ReelPersona/.github/workflows/
└── deploy-reelpersona.yml (✅ ReelPersona deployment)

ReelProjects/.github/workflows/
└── deploy-reelprojects.yml (✅ ReelProjects deployment)
```

### 2. Environment Configuration

**Created Files:**
- `ReelApps/.env.example` - Template for environment variables
- `ReelApps/.env` - Temporary file with placeholder values

**Required Environment Variables:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=ReelApps
VITE_APP_VERSION=1.0.0

# Domain Configuration (for SSO)
VITE_MAIN_DOMAIN=www.reelapps.co.za
VITE_REELCV_DOMAIN=reelcv.reelapps.co.za
VITE_REELHUNTER_DOMAIN=reelhunter.reelapps.co.za
VITE_REELSKILLS_DOMAIN=reelskills.reelapps.co.za
VITE_REELPERSONA_DOMAIN=reelpersona.reelapps.co.za
VITE_REELPROJECTS_DOMAIN=reelprojects.reelapps.co.za
```

## Why This Structure is Correct

### 1. Repository Independence
Each app (ReelCV, ReelHunter, etc.) has its own GitHub repository:
- `github.com/your-org/ReelCV`
- `github.com/your-org/ReelHunter` 
- `github.com/your-org/ReelSkills`
- `github.com/your-org/ReelPersona`
- `github.com/your-org/ReelProjects`
- `github.com/your-org/ReelApps` (main portal)

### 2. Deployment Workflow Logic
- Each repository needs its own deployment workflow
- Workflows in ReelApps/.github/workflows/ only work for the ReelApps repository
- Individual app workflows must be in their respective app directories

### 3. AWS Amplify App Mapping
```
Repository → AWS Amplify App → Domain
ReelApps → reelapps-main → www.reelapps.co.za
ReelCV → reelcv-reelapps → reelcv.reelapps.co.za
ReelHunter → reelhunter-reelapps → reelhunter.reelapps.co.za
ReelSkills → reelskills-reelapps → reelskills.reelapps.co.za
ReelPersona → reelpersona-reelapps → reelpersona.reelapps.co.za
ReelProjects → reelprojects-reelapps → reelprojects.reelapps.co.za
```

## Setup Instructions

### 1. Environment Variables Setup

For each app, create a `.env` file with the appropriate Supabase credentials:

**ReelApps (.env):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Other Apps:**
Each app (ReelCV, ReelHunter, etc.) may use the same Supabase project or different ones depending on your architecture.

### 2. GitHub Repository Setup

When pushing to individual repositories, ensure each has:
1. Its own `.github/workflows/` directory
2. The correct deployment workflow file
3. Proper environment secrets configured in GitHub

### 3. AWS Amplify Configuration

Each repository should be connected to its corresponding AWS Amplify app:
1. Go to AWS Amplify Console
2. For each app, connect the corresponding GitHub repository
3. Configure build settings using the `amplify.yml` files
4. Set environment variables in Amplify console

## Testing the Fixes

### 1. ReelApps Development Server
```bash
cd ReelApps
npm run dev
```
Should now start without Supabase errors (using placeholder values).

### 2. Individual App Testing
```bash
cd ReelCV
npm run dev

cd ../Reelhunter  
npm run dev

# etc. for other apps
```

### 3. CI/CD Testing
When you push changes to individual repositories, their respective deployment workflows should trigger automatically.

## Common Issues and Solutions

### 1. Supabase Connection Errors
- **Issue**: "Missing Supabase environment variables"
- **Solution**: Ensure `.env` file exists with correct VITE_SUPABASE_* variables

### 2. Workflow Not Triggering
- **Issue**: Deployment workflow doesn't run on push
- **Solution**: Verify workflow file is in correct repository's `.github/workflows/` directory

### 3. Build Failures
- **Issue**: AWS Amplify build fails
- **Solution**: Check `amplify.yml` configuration and environment variables in Amplify console

## Next Steps

1. **Update Environment Variables**: Replace placeholder values with actual Supabase credentials
2. **Test Individual Deployments**: Push changes to each repository to test workflows
3. **Configure Domain SSL**: Ensure SSL certificates are properly configured for all domains
4. **Monitor Deployments**: Check AWS Amplify console for successful deployments

## File Structure Summary

```
ReelsEcosystem/
├── ReelApps/                     # Main portal & SSO
│   ├── .github/workflows/
│   │   ├── deploy-main.yml       # ✅ Main portal deployment
│   │   ├── ci-cd-workspace.yml   # ✅ Workspace CI/CD
│   │   └── ci-cd.yml            # ✅ Main CI/CD
│   ├── .env.example             # ✅ Environment template
│   └── .env                     # ✅ Local environment
├── ReelCV/                      # CV platform
│   └── .github/workflows/
│       └── deploy-reelcv.yml    # ✅ ReelCV deployment
├── Reelhunter/                  # Recruitment platform  
│   └── .github/workflows/
│       └── deploy-reelhunter.yml # ✅ ReelHunter deployment
├── ReelSkills/                  # Skills platform
│   └── .github/workflows/
│       └── deploy-reelskills.yml # ✅ ReelSkills deployment
├── ReelPersona/                 # Personality platform
│   └── .github/workflows/
│       └── deploy-reelpersona.yml # ✅ ReelPersona deployment
└── ReelProjects/                # Projects platform
    └── .github/workflows/
        └── deploy-reelprojects.yml # ✅ ReelProjects deployment
```

The fixes ensure proper CI/CD workflow organization and resolve Supabase configuration issues for smooth development and deployment. 