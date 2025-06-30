# ReelApps CI/CD and SSO Setup - Complete Summary

## ✅ What Has Been Created

### 🔄 CI/CD Workflows (6 GitHub Actions)

1. **`.github/workflows/deploy-main.yml`**
   - Deploys main ReelApps portal to `www.reelapps.co.za`
   - Triggers on changes to `src/**`, `packages/**`, main config files
   - Sets up AWS Amplify with main domain and www subdomain

2. **`.github/workflows/deploy-reelcv.yml`**
   - Deploys ReelCV to `reelcv.reelapps.co.za`
   - Triggers on changes to `ReelCV/**` and shared packages
   - Configured for candidate-focused application

3. **`.github/workflows/deploy-reelhunter.yml`**
   - Deploys ReelHunter to `reelhunter.reelapps.co.za`
   - Triggers on changes to `Reelhunter/**` and shared packages
   - Configured for recruiter-focused application

4. **`.github/workflows/deploy-reelskills.yml`**
   - Deploys ReelSkills to `reelskills.reelapps.co.za`
   - Triggers on changes to `ReelSkills/**` and shared packages
   - Note: Uses `ReelSkills/project` directory structure

5. **`.github/workflows/deploy-reelpersona.yml`**
   - Deploys ReelPersona to `reelpersona.reelapps.co.za`
   - Triggers on changes to `ReelPersona/**` and shared packages
   - Includes AI API keys (Gemini, ElevenLabs)

6. **`.github/workflows/deploy-reelprojects.yml`**
   - Deploys ReelProjects to `reelprojects.reelapps.co.za`
   - Triggers on changes to `ReelProjects/**` and shared packages
   - Includes AWS S3 configuration

### 🔐 SSO Implementation

1. **`packages/auth/src/sso.ts`**
   - Complete SSO manager with token generation/validation
   - Cross-domain session sharing
   - Role-based access control
   - Secure token handling with expiration

2. **`src/pages/SSOPage.tsx`**
   - SSO authentication page for main portal
   - Handles authentication redirects from subdomains
   - Role validation and access control
   - User-friendly error handling

3. **Updated Navigation & Configuration**
   - Enhanced `src/lib/config.ts` with HTTPS subdomain URLs
   - Added SSO route to main App.tsx routing
   - Role-based app visibility in navigation

### 🛠️ Deployment Tools

1. **`scripts/deployment/setup-amplify-domains.sh`**
   - Automated AWS Amplify app creation
   - Domain association setup
   - SSL certificate provisioning
   - Comprehensive error handling and logging

2. **`docs/SUBDOMAIN_DEPLOYMENT_GUIDE.md`**
   - Complete deployment documentation
   - Step-by-step setup instructions
   - Troubleshooting guide
   - Maintenance procedures

## 🏗️ Architecture Overview

### Domain Structure
```
www.reelapps.co.za      → Main portal & SSO hub
reelcv.reelapps.co.za   → Candidate profiles
reelhunter.reelapps.co.za → Recruitment platform  
reelskills.reelapps.co.za → Skills management
reelpersona.reelapps.co.za → Personality assessment
reelprojects.reelapps.co.za → Project showcase
```

### SSO Flow
```
1. User visits subdomain → 2. Redirect to main if not authenticated
3. Login on main portal → 4. Generate SSO token
5. Redirect back with token → 6. Validate & establish session
```

### Role-Based Access
```typescript
{
  'admin': ['all apps'],
  'recruiter': ['reelhunter', 'reelpersona', 'reelprojects'],
  'candidate': ['reelcv', 'reelskills', 'reelpersona', 'reelprojects']
}
```

## 🚀 Next Steps to Deploy

### 1. Configure GitHub Secrets
Add these to your repository secrets:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY  
AWS_REGION
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
VITE_ELEVENLABS_API_KEY
VITE_AWS_BUCKET
```

### 2. Run Domain Setup
```bash
# Set up AWS Amplify apps and domains
./scripts/deployment/setup-amplify-domains.sh
```

### 3. Configure DNS
Point your domain records to AWS Amplify:
- www.reelapps.co.za
- reelcv.reelapps.co.za
- reelhunter.reelapps.co.za
- reelskills.reelapps.co.za
- reelpersona.reelapps.co.za
- reelprojects.reelapps.co.za

### 4. Deploy
Push to main branch or trigger workflows manually in GitHub Actions.

## 📋 Key Features

### ✅ Automated Deployment
- Path-based triggers (only affected apps deploy)
- Manual workflow dispatch available
- Environment variable injection
- Build artifact management

### ✅ Secure SSO
- Cross-domain authentication
- Role-based access control
- Token expiration handling
- Clean URL management

### ✅ Production Ready
- HTTPS with SSL certificates
- Custom domain configuration
- Redirect rules for SPAs
- Error handling and monitoring

### ✅ Scalable Architecture
- Independent app deployments
- Shared package system
- Centralized authentication
- Modular CI/CD workflows

## 🔧 Environment Variables by App

### All Apps (Common)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HOME_URL=https://www.reelapps.co.za
VITE_SSO_ENABLED=true
VITE_MAIN_DOMAIN=reelapps.co.za
```

### App-Specific
- **ReelPersona**: `VITE_GEMINI_API_KEY`, `VITE_ELEVENLABS_API_KEY`
- **ReelProjects**: `VITE_AWS_*` variables for S3 integration
- **Each App**: `VITE_APP_URL` with respective subdomain

## 📊 Monitoring & Maintenance

### Available Monitoring
- GitHub Actions workflow logs
- AWS Amplify deployment logs
- Browser console SSO debugging
- Real-time build status

### Regular Maintenance
- Monitor SSL certificate renewal (automatic)
- Review access logs
- Test SSO flow across apps
- Update environment variables as needed

## 🎯 Benefits Achieved

1. **Independent Scaling**: Each app can be developed/deployed separately
2. **Single Sign-On**: Seamless user experience across all apps
3. **Role-Based Security**: Users only access authorized applications
4. **Automated Deployment**: Zero-touch deployment from git push
5. **Professional Domains**: Clean subdomain structure
6. **SSL/HTTPS**: Secure connections across all apps
7. **Error Handling**: Comprehensive error states and recovery

---

This setup provides a complete, production-ready deployment system with enterprise-grade SSO functionality. All components are ready to deploy once AWS credentials and domain configuration are complete. 