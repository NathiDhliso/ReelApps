# ReelApps Workspace Structure

This repository has been restructured as a pnpm workspace to support multiple applications and shared packages.

## Structure

```
ReelApps/
├── apps/                    # Individual applications
│   ├── home/               # Main landing page and app launcher
│   ├── reelcv/             # Candidate profile application
│   └── reelhunter/         # Recruiter application
├── packages/               # Shared packages
│   ├── ui/                # Shared UI components
│   ├── auth/              # Shared authentication logic
│   └── config/            # Shared configuration
├── pnpm-workspace.yaml    # Workspace configuration
└── package.json           # Root package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 9+

### Installation

```bash
# Install pnpm globally
npm install -g pnpm

# Install all dependencies
pnpm install

# Build all packages
pnpm run build
```

### Development

```bash
# Run all apps in development mode
pnpm run dev

# Run specific app
pnpm --filter @reelapps/home dev
pnpm --filter @reelapps/reelcv dev
pnpm --filter @reelapps/reelhunter dev

# Build specific package
pnpm --filter @reelapps/ui build
pnpm --filter @reelapps/auth build
pnpm --filter @reelapps/config build
```

## Applications

### Home App (`apps/home`)
- Main landing page
- App launcher for all ReelApps applications
- URL: https://reelapps.co.za

### ReelCV App (`apps/reelcv`)
- Dynamic candidate profiles
- Video introductions and skill demonstrations
- URL: https://reelcv.reelapps.co.za

### ReelHunter App (`apps/reelhunter`)
- AI-powered recruitment platform
- Job posting and candidate matching
- URL: https://reelhunter.reelapps.co.za

## Shared Packages

### UI Package (`packages/ui`)
- Shared React components (Button, Card, etc.)
- Consistent styling across all apps
- Import: `import { Button, Card } from '@reelapps/ui'`

### Auth Package (`packages/auth`)
- Centralized Supabase client
- Shared authentication store (Zustand)
- Single Sign-On functionality
- Import: `import { useAuthStore, initializeSupabase } from '@reelapps/auth'`

### Config Package (`packages/config`)
- Application configuration
- External URLs for each app
- Import: `import { apps, getAppsForRole } from '@reelapps/config'`

## Adding a New App

1. Create new app directory:
   ```bash
   mkdir apps/newapp
   cd apps/newapp
   npm init -y
   ```

2. Update `package.json`:
   ```json
   {
     "name": "@reelapps/newapp",
     "private": true,
     "dependencies": {
       "@reelapps/ui": "workspace:*",
       "@reelapps/auth": "workspace:*",
       "@reelapps/config": "workspace:*"
     }
   }
   ```

3. Add to CI/CD workflow in `.github/workflows/ci-cd-workspace.yml`

4. Update config package with new app details

## CI/CD

The workspace uses GitHub Actions with:
- Change detection to only build/deploy modified apps
- Parallel builds for efficiency
- Separate deployment jobs for each app
- Environment-specific deployments (staging/production)

See `.github/workflows/ci-cd-workspace.yml` for details.

## Environment Variables

Each app requires:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set these in:
- `.env.local` for local development
- GitHub Secrets for CI/CD
- Deployment platform environment variables 