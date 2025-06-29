#!/bin/bash

echo "🚀 Starting ReelApps Repository Split Process"
echo "=============================================="

# Create a temporary directory for the split repos
mkdir -p ../split-repos
cd ../split-repos

# Function to create a new repo from an app
create_app_repo() {
    local app_name=$1
    local repo_name=$2
    local github_url=$3
    
    echo "📦 Creating $repo_name repository..."
    
    # Create new directory
    mkdir -p $repo_name
    cd $repo_name
    
    # Initialize git repo
    git init
    
    # Copy app contents
    cp -r ../../ReelApps/apps/$app_name/* .
    
    # Copy shared config files
    cp ../../ReelApps/.gitignore .
    cp ../../ReelApps/.env.example .
    
    # Create new package.json for standalone app
    cat > package.json << EOF
{
  "name": "@reelapps/$app_name",
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
EOF

    # Create README specific to this app
    cat > README.md << EOF
# $repo_name

Part of the ReelApps ecosystem - AI-powered talent acquisition platform.

## About
This is the $app_name application, providing [specific functionality description].

## Development
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build
\`\`\`bash
npm run build
\`\`\`

## Shared Packages
This app uses shared packages from the [@reelapps organization](https://github.com/NathiDhliso/ReelApps):
- @reelapps/auth - Authentication utilities
- @reelapps/ui - Shared UI components  
- @reelapps/config - Configuration management
- @reelapps/types - TypeScript definitions
- @reelapps/supabase - Database client

## License
MIT - Part of ReelApps ecosystem
EOF

    # Add all files
    git add .
    git commit -m "Initial commit: Split $app_name from ReelApps monorepo"
    
    # Add remote and push
    git remote add origin $github_url
    git branch -M main
    
    echo "✅ $repo_name repository created and ready to push"
    
    cd ..
}

# Create individual app repositories
create_app_repo "reelcv" "ReelCV" "https://github.com/NathiDhliso/ReelCV.git"
create_app_repo "reelhunter" "ReelHunter" "https://github.com/NathiDhliso/ReelHunter.git"  
create_app_repo "reelpersona" "ReelPersona" "https://github.com/NathiDhliso/ReelPersona.git"
create_app_repo "reelskills" "ReelSkills" "https://github.com/NathiDhliso/ReelSkills.git"
create_app_repo "reelproject" "ReelProjects" "https://github.com/NathiDhliso/ReelProjects.git"

echo ""
echo "🎉 All repositories have been created!"
echo "📍 Location: ../split-repos/"
echo ""
echo "Next steps:"
echo "1. Review each repository in ../split-repos/"
echo "2. Run the push commands for each repo"
echo "3. Set up shared packages publishing"
echo "4. Update the main ReelApps repo" 