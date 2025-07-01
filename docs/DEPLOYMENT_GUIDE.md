# ReelApps Deployment Guide

> **⚠️ DEPRECATED**: This deployment guide has been replaced with updated documentation.

## Current Deployment Documentation

Please refer to the following updated guides:

### 📋 Primary Documentation
- **[CI/CD and Supabase Fixes](../CI_CD_AND_SUPABASE_FIXES.md)** - Current CI/CD workflow structure and Supabase configuration
- **[Subdomain Deployment Guide](./SUBDOMAIN_DEPLOYMENT_GUIDE.md)** - AWS Amplify subdomain deployment

### 🏗️ Current Architecture

Each ReelApp now has its own repository and deployment workflow:

```
Repository → AWS Amplify App → Domain
ReelApps → reelapps-main → www.reelapps.co.za
ReelCV → reelcv-reelapps → reelcv.reelapps.co.za  
ReelHunter → reelhunter-reelapps → reelhunter.reelapps.co.za
ReelSkills → reelskills-reelapps → reelskills.reelapps.co.za
ReelPersona → reelpersona-reelapps → reelpersona.reelapps.co.za
ReelProjects → reelprojects-reelapps → reelprojects.reelapps.co.za
```

### 🚀 Quick Start

1. **Environment Setup**: Create `.env` file with Supabase credentials in each app
2. **Local Development**: Run `npm run dev` in individual app directories  
3. **Deployment**: Push to respective GitHub repositories to trigger AWS Amplify builds

### 🔧 Deployment Workflows

- Each app has its own `.github/workflows/deploy-[appname].yml`
- Workflows are located in their respective app directories (not in ReelApps)
- AWS Amplify handles automatic deployments on repository pushes

## Migration Notes

The previous modal authentication system has been replaced with:
- Individual app authentication using Supabase
- SSO functionality for cross-app authentication
- Simplified deployment per repository

For specific app setup instructions, see the README.md file in each app directory. 