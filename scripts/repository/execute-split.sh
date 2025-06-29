#!/bin/bash

echo "🚀 ReelApps Repository Split - Complete Execution"
echo "================================================"
echo ""
echo "This script will:"
echo "1. Split your monorepo into individual app repositories"
echo "2. Set up shared packages for publishing"
echo "3. Push all repositories to GitHub"
echo ""

read -p "Are you ready to proceed? (y/N): " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🎯 Starting the repository split process..."
echo ""

# Make scripts executable
chmod +x scripts/split-repos.sh
chmod +x scripts/push-repos.sh  
chmod +x scripts/setup-shared-packages.sh

# Step 1: Split the repositories
echo "📦 Step 1: Creating individual app repositories..."
./scripts/split-repos.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to split repositories"
    exit 1
fi

echo ""
echo "✅ Step 1 complete: Individual repositories created"
echo ""

# Step 2: Set up shared packages
echo "📦 Step 2: Setting up shared packages for publishing..."
./scripts/setup-shared-packages.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to set up shared packages"
    exit 1
fi

echo ""
echo "✅ Step 2 complete: Shared packages configured"
echo ""

# Step 3: Push repositories
echo "📦 Step 3: Pushing repositories to GitHub..."
read -p "Ready to push all repositories to GitHub? (y/N): " push_confirm
if [[ $push_confirm == [yY] || $push_confirm == [yY][eE][sS] ]]; then
    ./scripts/push-repos.sh
    echo "✅ Step 3 complete: All repositories pushed to GitHub"
else
    echo "⏭️  Step 3 skipped: You can push manually later using ./scripts/push-repos.sh"
fi

echo ""
echo "🎉 REPOSITORY SPLIT COMPLETE!"
echo "============================="
echo ""
echo "📊 Summary:"
echo "- ✅ 5 individual app repositories created"
echo "- ✅ Shared packages configured for publishing"
echo "- ✅ All repositories ready for deployment"
echo ""
echo "🔗 Your new repositories:"
echo "- ReelCV: https://github.com/NathiDhliso/ReelCV"
echo "- ReelHunter: https://github.com/NathiDhliso/ReelHunter"  
echo "- ReelPersona: https://github.com/NathiDhliso/ReelPersona"
echo "- ReelSkills: https://github.com/NathiDhliso/ReelSkills"
echo "- ReelProjects: https://github.com/NathiDhliso/ReelProjects"
echo "- ReelApps (shared): https://github.com/NathiDhliso/ReelApps"
echo ""
echo "📋 Next Steps:"
echo "1. 🏗️  Update your AWS build configs to point to new repos:"
echo "   - reelcv.reelapp.co.za → ReelCV repo"
echo "   - reelhunter.reelapp.co.za → ReelHunter repo" 
echo "   - reelpersona.reelapp.co.za → ReelPersona repo"
echo "   - reelskills.reelapp.co.za → ReelSkills repo"
echo "   - reelprojects.reelapp.co.za → ReelProjects repo"
echo ""
echo "2. 📦 Publish shared packages:"
echo "   cd [main ReelApps repo]"
echo "   pnpm install"
echo "   pnpm build"
echo "   pnpm changeset"
echo "   pnpm version-packages"
echo "   pnpm release"
echo ""
echo "3. 🔧 Update each app's dependencies once packages are published:"
echo "   npm install @reelapps/auth@latest @reelapps/ui@latest"
echo ""
echo "4. 🚀 Deploy and test each app independently"
echo ""
echo "✨ Your micro-frontend architecture is now ready!" 