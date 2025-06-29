Write-Host "🚀 Starting ReelApps Repository Split Process" -ForegroundColor Green
Write-Host "=============================================="

# Create a temporary directory for the split repos
$splitReposPath = "../split-repos"
if (!(Test-Path $splitReposPath)) {
    New-Item -ItemType Directory -Path $splitReposPath
}
Set-Location $splitReposPath

# Function to create a new repo from an app
function Create-AppRepo {
    param(
        [string]$AppName,
        [string]$RepoName,
        [string]$GitHubUrl
    )
    
    Write-Host "📦 Creating $RepoName repository..." -ForegroundColor Yellow
    
    # Create new directory
    if (!(Test-Path $RepoName)) {
        New-Item -ItemType Directory -Path $RepoName
    }
    Set-Location $RepoName
    
    # Initialize git repo
    git init
    
    # Copy app contents
    Copy-Item -Path "../../ReelApps/apps/$AppName/*" -Destination . -Recurse -Force
    
    # Copy shared config files
    Copy-Item -Path "../../ReelApps/.gitignore" -Destination . -Force
    if (Test-Path "../../ReelApps/.env.example") {
        Copy-Item -Path "../../ReelApps/.env.example" -Destination . -Force
    }
    
    # Create new package.json for standalone app
    $packageJson = @"
{
  "name": "@reelapps/$($AppName.ToLower())",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest"
  },
  "dependencies": {
    "@reelapps/auth": "^1.0.0",
    "@reelapps/config": "^1.0.0",
    "@reelapps/supabase": "^1.0.0",
    "@reelapps/types": "^1.0.0",
    "@reelapps/ui": "^1.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "zustand": "^4.4.7",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
"@
    
    $packageJson | Out-File -FilePath "package.json" -Encoding utf8
    
    # Create README specific to this app
    $readme = @"
# $RepoName

Part of the ReelApps ecosystem - AI-powered talent acquisition platform.

## About
This is the $AppName application, providing [specific functionality description].

## Development
``````bash
npm install
npm run dev
``````

## Build
``````bash
npm run build
``````

## Shared Packages
This app uses shared packages from the [@reelapps organization](https://github.com/NathiDhliso/ReelApps):
- @reelapps/auth - Authentication utilities
- @reelapps/ui - Shared UI components  
- @reelapps/config - Configuration management
- @reelapps/types - TypeScript definitions
- @reelapps/supabase - Database client

## License
MIT - Part of ReelApps ecosystem
"@
    
    $readme | Out-File -FilePath "README.md" -Encoding utf8
    
    # Add all files
    git add .
    git commit -m "Initial commit: Split $AppName from ReelApps monorepo"
    
    # Add remote and set branch
    git remote add origin $GitHubUrl
    git branch -M main
    
    Write-Host "✅ $RepoName repository created and ready to push" -ForegroundColor Green
    
    Set-Location ..
}

# Create individual app repositories
Create-AppRepo -AppName "reelcv" -RepoName "ReelCV" -GitHubUrl "https://github.com/NathiDhliso/ReelCV.git"
Create-AppRepo -AppName "reelhunter" -RepoName "ReelHunter" -GitHubUrl "https://github.com/NathiDhliso/ReelHunter.git"
Create-AppRepo -AppName "reelpersona" -RepoName "ReelPersona" -GitHubUrl "https://github.com/NathiDhliso/ReelPersona.git"
Create-AppRepo -AppName "reelskills" -RepoName "ReelSkills" -GitHubUrl "https://github.com/NathiDhliso/ReelSkills.git"
Create-AppRepo -AppName "reelproject" -RepoName "ReelProjects" -GitHubUrl "https://github.com/NathiDhliso/ReelProjects.git"

Write-Host ""
Write-Host "🎉 All repositories have been created!" -ForegroundColor Green
Write-Host "📍 Location: ../split-repos/"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Review each repository in ../split-repos/"
Write-Host "2. Run the push commands for each repo"
Write-Host "3. Set up shared packages publishing"
Write-Host "4. Update the main ReelApps repo" 