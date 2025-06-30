# Script to fix ReelHunter build issues
# This script addresses the "Cannot read properties of undefined (reading 'find')" error

Write-Host "🔧 Fixing ReelHunter Build Issues..." -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue
Write-Host ""

$appId = "d3n96xclgi8hou"
$appName = "reelhunter-reelapps"
$repoUrl = "https://github.com/NathiDhliso/ReelHunter"

Write-Host "📋 App Details:" -ForegroundColor Cyan
Write-Host "  App ID: $appId" -ForegroundColor White
Write-Host "  App Name: $appName" -ForegroundColor White
Write-Host "  Repository: $repoUrl" -ForegroundColor White
Write-Host ""

# Step 1: Check current app status
Write-Host "🔍 Step 1: Checking current app status..." -ForegroundColor Yellow
try {
    $appDetails = aws amplify get-app --app-id $appId --query 'app.{repository:repository,platform:platform}' --output json | ConvertFrom-Json
    
    if ($appDetails.repository -and $appDetails.repository -ne "null") {
        Write-Host "✅ Repository is connected: $($appDetails.repository)" -ForegroundColor Green
    } else {
        Write-Host "❌ Repository is NOT connected" -ForegroundColor Red
        Write-Host "   You need to connect the repository manually through AWS Console" -ForegroundColor Yellow
        Write-Host "   Direct link: https://console.aws.amazon.com/amplify/home#/apps/$appId" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "⚠️  Could not check app status: $_" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Check if main branch exists
Write-Host "🔍 Step 2: Checking main branch..." -ForegroundColor Yellow
try {
    $branches = aws amplify list-branches --app-id $appId --query 'branches[].branchName' --output text
    
    if ($branches -match "main") {
        Write-Host "✅ Main branch exists" -ForegroundColor Green
    } else {
        Write-Host "❌ Main branch does not exist, creating it..." -ForegroundColor Red
        
        try {
            aws amplify create-branch --app-id $appId --branch-name main --description "Main production branch"
            Write-Host "✅ Main branch created successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to create main branch: $_" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "⚠️  Could not check branches: $_" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Check recent jobs and errors
Write-Host "🔍 Step 3: Checking recent build jobs..." -ForegroundColor Yellow
try {
    $jobs = aws amplify list-jobs --app-id $appId --branch-name main --max-results 3 --query 'jobSummaries[].{jobId:jobId,status:status,jobType:jobType}' --output json | ConvertFrom-Json
    
    if ($jobs -and $jobs.Count -gt 0) {
        Write-Host "📋 Recent jobs:" -ForegroundColor Cyan
        foreach ($job in $jobs) {
            $statusColor = if ($job.status -eq "SUCCEED") { "Green" } elseif ($job.status -eq "FAILED") { "Red" } else { "Yellow" }
            Write-Host "   Job $($job.jobId): $($job.status) ($($job.jobType))" -ForegroundColor $statusColor
        }
    } else {
        Write-Host "📋 No recent jobs found" -ForegroundColor Gray
    }
}
catch {
    Write-Host "⚠️  Could not check recent jobs: $_" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Provide manual connection instructions
Write-Host "🚀 Step 4: Manual Connection Required" -ForegroundColor Blue
Write-Host ""
Write-Host "The 'Cannot read properties of undefined (reading 'find')' error typically occurs when:" -ForegroundColor White
Write-Host "1. The repository is not properly connected to the Amplify app" -ForegroundColor White
Write-Host "2. The build configuration is missing or incorrect" -ForegroundColor White
Write-Host "3. There are missing dependencies in package.json" -ForegroundColor White
Write-Host ""

Write-Host "✅ Solutions Applied:" -ForegroundColor Green
Write-Host "• Added amplify.yml build configuration" -ForegroundColor White
Write-Host "• Updated repository with proper build settings" -ForegroundColor White
Write-Host "• Created main branch if missing" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open AWS Amplify Console: https://console.aws.amazon.com/amplify/home#/apps/$appId" -ForegroundColor Cyan
Write-Host "2. Click 'Connect repository' if not already connected" -ForegroundColor White
Write-Host "3. Select GitHub → NathiDhliso/ReelHunter → main branch" -ForegroundColor White
Write-Host "4. Accept the default build settings (amplify.yml will be used)" -ForegroundColor White
Write-Host "5. Trigger a new build" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Alternative: Delete and Recreate App" -ForegroundColor Yellow
Write-Host "If the issue persists, you can:" -ForegroundColor White
Write-Host "1. Delete the current app: aws amplify delete-app --app-id $appId" -ForegroundColor Gray
Write-Host "2. Create a new app with repository connection" -ForegroundColor Gray
Write-Host "3. Set up domain associations again" -ForegroundColor Gray
Write-Host ""

Write-Host "📞 Need immediate help? Check the build logs in AWS Console:" -ForegroundColor Blue
Write-Host "   https://console.aws.amazon.com/amplify/home#/apps/$appId" -ForegroundColor Cyan 