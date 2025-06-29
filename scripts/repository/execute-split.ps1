Write-Host "🚀 ReelApps Repository Split - Complete Execution" -ForegroundColor Green
Write-Host "================================================"
Write-Host ""
Write-Host "This script will:"
Write-Host "1. Split your monorepo into individual app repositories"
Write-Host "2. Set up shared packages for publishing"  
Write-Host "3. Push all repositories to GitHub"
Write-Host ""

$confirm = Read-Host "Are you ready to proceed? (y/N)"
if ($confirm -notmatch '^[yY]([eE][sS])?$') {
    Write-Host "❌ Operation cancelled" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 Starting the repository split process..." -ForegroundColor Yellow
Write-Host ""

# Step 1: Split the repositories
Write-Host "📦 Step 1: Creating individual app repositories..." -ForegroundColor Cyan
.\scripts\split-repos.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to split repositories" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Step 1 complete: Individual repositories created" -ForegroundColor Green
Write-Host ""

# Step 2: Set up shared packages (manual for now, since it's complex)
Write-Host "📦 Step 2: Setting up shared packages..." -ForegroundColor Cyan
Write-Host "⚠️  Shared packages setup will be done manually after split" -ForegroundColor Yellow
Write-Host ""

# Step 3: Push repositories
Write-Host "📦 Step 3: Pushing repositories to GitHub..." -ForegroundColor Cyan
$pushConfirm = Read-Host "Ready to push all repositories to GitHub? (y/N)"
if ($pushConfirm -match '^[yY]([eE][sS])?$') {
    .\scripts\push-repos.ps1
    Write-Host "✅ Step 3 complete: All repositories pushed to GitHub" -ForegroundColor Green
} else {
    Write-Host "⏭️  Step 3 skipped: You can push manually later using .\scripts\push-repos.ps1" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 REPOSITORY SPLIT COMPLETE!" -ForegroundColor Green
Write-Host "============================="
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "- ✅ 5 individual app repositories created"
Write-Host "- ✅ All repositories ready for deployment"
Write-Host ""
Write-Host "🔗 Your new repositories:" -ForegroundColor Cyan
Write-Host "- ReelCV: https://github.com/NathiDhliso/ReelCV"
Write-Host "- ReelHunter: https://github.com/NathiDhliso/ReelHunter"
Write-Host "- ReelPersona: https://github.com/NathiDhliso/ReelPersona"
Write-Host "- ReelSkills: https://github.com/NathiDhliso/ReelSkills"
Write-Host "- ReelProjects: https://github.com/NathiDhliso/ReelProjects"
Write-Host "- ReelApps (shared): https://github.com/NathiDhliso/ReelApps"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. 🏗️  Update your AWS build configs to point to new repos:"
Write-Host "   - reelcv.reelapp.co.za → ReelCV repo"
Write-Host "   - reelhunter.reelapp.co.za → ReelHunter repo"
Write-Host "   - reelpersona.reelapp.co.za → ReelPersona repo"
Write-Host "   - reelskills.reelapp.co.za → ReelSkills repo"
Write-Host "   - reelprojects.reelapp.co.za → ReelProjects repo"
Write-Host ""
Write-Host "2. 📦 Clean up main ReelApps repo:"
Write-Host "   - Remove apps/ folder"
Write-Host "   - Keep only packages/ folder"
Write-Host "   - Update package.json for shared packages only"
Write-Host ""
Write-Host "3. 🚀 Test each app builds independently:"
Write-Host "   cd ../split-repos/ReelCV; npm install; npm run build"
Write-Host ""
Write-Host "✨ Your micro-frontend architecture is now ready!" -ForegroundColor Green 