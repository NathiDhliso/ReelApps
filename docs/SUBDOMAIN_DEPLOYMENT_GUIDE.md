# ReelApps Subdomain Deployment & SSO Guide

This guide explains how to deploy all ReelApps to AWS Amplify with subdomain architecture and Single Sign-On (SSO) functionality.

## 🏗️ Architecture Overview

### Domain Structure
- **Main Portal**: `www.reelapps.co.za` - Authentication hub and app launcher
- **ReelCV**: `reelcv.reelapps.co.za` - Candidate profiles (Candidates only)
- **ReelHunter**: `reelhunter.reelapps.co.za` - Recruitment platform (Recruiters only)
- **ReelSkills**: `reelskills.reelapps.co.za` - Skills management (Candidates)
- **ReelPersona**: `reelpersona.reelapps.co.za` - Personality assessment (All roles)
- **ReelProjects**: `reelprojects.reelapps.co.za` - Project showcase (All roles)

### SSO Flow
1. User visits any subdomain (e.g., `reelcv.reelapps.co.za`)
2. If not authenticated, redirect to `www.reelapps.co.za/auth/sso?return_url=...`
3. User authenticates on main domain
4. Session token is generated and user is redirected back to subdomain
5. Subdomain validates token and establishes local session

## 🚀 Deployment Setup

### Prerequisites
1. AWS Account with appropriate permissions
2. Domain `reelapps.co.za` registered and accessible
3. GitHub repository with the workflows
4. Required environment variables configured

### 1. Configure GitHub Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ReelPersona Specific
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# ReelProjects Specific
VITE_AWS_BUCKET=your_s3_bucket_name
```

### 2. Run Domain Setup Script

Execute the domain setup script to create all Amplify apps:

```bash
# Make script executable
chmod +x scripts/deployment/setup-amplify-domains.sh

# Run the setup
./scripts/deployment/setup-amplify-domains.sh
```

This script will:
- Create 6 Amplify apps (main + 5 subdomains)
- Configure domain associations
- Set up redirect rules
- Configure SSL certificates

### 3. Configure DNS

In your DNS provider (e.g., Cloudflare, Route53), add the following records:

```
Type: CNAME
Name: www
Value: [provided by AWS Amplify]

Type: CNAME  
Name: reelcv
Value: [provided by AWS Amplify]

Type: CNAME
Name: reelhunter
Value: [provided by AWS Amplify]

Type: CNAME
Name: reelskills
Value: [provided by AWS Amplify]

Type: CNAME
Name: reelpersona
Value: [provided by AWS Amplify]

Type: CNAME
Name: reelprojects
Value: [provided by AWS Amplify]
```

### 4. Deploy Applications

The CI/CD workflows will automatically deploy when you push to the `main` branch:

- **Main Portal**: `.github/workflows/deploy-main.yml`
- **ReelCV**: `.github/workflows/deploy-reelcv.yml`
- **ReelHunter**: `.github/workflows/deploy-reelhunter.yml`
- **ReelSkills**: `.github/workflows/deploy-reelskills.yml`
- **ReelPersona**: `.github/workflows/deploy-reelpersona.yml`
- **ReelProjects**: `.github/workflows/deploy-reelprojects.yml`

You can also trigger deployments manually:
1. Go to GitHub Actions tab
2. Select the workflow
3. Click "Run workflow"

## 🔐 SSO Implementation Details

### How SSO Works

1. **Token Generation**: Main domain creates base64-encoded session token
2. **Token Validation**: Subdomains validate tokens and establish Supabase sessions
3. **Role-Based Access**: Users only see apps they have permission to access
4. **Session Persistence**: Tokens stored in localStorage for cross-tab support

### Role-Based App Access

```typescript
const roleMapping = {
  'admin': ['reelcv', 'reelhunter', 'reelskills', 'reelpersona', 'reelprojects'],
  'recruiter': ['reelhunter', 'reelpersona', 'reelprojects'],
  'candidate': ['reelcv', 'reelskills', 'reelpersona', 'reelprojects']
};
```

### SSO Security Features

- **Domain Validation**: Only allows redirects to valid ReelApps subdomains
- **Token Expiration**: Tokens automatically expire with the session
- **Role Verification**: Access control enforced on both client and server
- **Clean URLs**: SSO tokens removed from URL after processing

## 🔧 Environment Variables

### Main Portal (`www.reelapps.co.za`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HOME_URL=https://www.reelapps.co.za
VITE_REELCV_URL=https://reelcv.reelapps.co.za
VITE_REELHUNTER_URL=https://reelhunter.reelapps.co.za
VITE_REELSKILLS_URL=https://reelskills.reelapps.co.za
VITE_REELPERSONA_URL=https://reelpersona.reelapps.co.za
VITE_REELPROJECT_URL=https://reelprojects.reelapps.co.za
VITE_SSO_ENABLED=true
VITE_MAIN_DOMAIN=reelapps.co.za
```

### All Subdomains
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HOME_URL=https://www.reelapps.co.za
VITE_APP_URL=https://[subdomain].reelapps.co.za
VITE_SSO_ENABLED=true
VITE_MAIN_DOMAIN=reelapps.co.za
```

## 🚦 Testing the Deployment

### 1. Test Main Portal
```bash
curl -f https://www.reelapps.co.za
```

### 2. Test SSO Flow
1. Visit `https://reelcv.reelapps.co.za` (while logged out)
2. Should redirect to `https://www.reelapps.co.za/auth/sso?return_url=...`
3. Login on main portal
4. Should redirect back to ReelCV with working session

### 3. Test Role-Based Access
1. Login as different user roles
2. Verify navigation only shows accessible apps
3. Test direct URL access to restricted apps

## 📋 Workflow Triggers

Each workflow triggers on:
- **Push to main branch** with relevant path changes
- **Manual workflow dispatch** (GitHub Actions UI)
- **Changes to shared packages** (affects all apps)

### Path-Based Deployment
- `ReelCV/**` → Triggers ReelCV deployment
- `Reelhunter/**` → Triggers ReelHunter deployment
- `ReelSkills/**` → Triggers ReelSkills deployment
- `ReelPersona/**` → Triggers ReelPersona deployment
- `ReelProjects/**` → Triggers ReelProjects deployment
- `src/**` → Triggers Main portal deployment
- `packages/**` → Triggers all deployments

## 🔍 Troubleshooting

### Common Issues

1. **DNS Propagation**: Wait 24-48 hours for DNS changes to propagate globally
2. **SSL Certificate**: AWS Amplify automatically provisions SSL, but this can take time
3. **CORS Errors**: Ensure all domains are properly configured in Supabase
4. **SSO Redirects**: Check browser console for detailed error messages

### Debug Commands

```bash
# Check Amplify app status
aws amplify list-apps

# Get domain status
aws amplify get-domain-association --app-id YOUR_APP_ID --domain-name reelapps.co.za

# Check deployment status
aws amplify list-jobs --app-id YOUR_APP_ID --branch-name main
```

### Logs and Monitoring

- **AWS Amplify Console**: Real-time build and deployment logs
- **Browser Console**: SSO flow debugging information
- **GitHub Actions**: CI/CD pipeline logs and artifacts

## 🔄 Maintenance

### Regular Tasks
1. **Monitor SSL certificates** (auto-renewed by AWS)
2. **Update environment variables** as needed
3. **Review access logs** in AWS Amplify
4. **Test SSO flow** regularly across all apps

### Updates and Releases
1. Push changes to main branch
2. Workflows automatically deploy affected apps
3. Monitor deployment status in GitHub Actions
4. Verify functionality across all subdomains

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Review AWS Amplify console
3. Verify DNS configuration
4. Test SSO flow manually

---

This architecture provides a scalable, secure, and user-friendly multi-app ecosystem with centralized authentication and role-based access control. 