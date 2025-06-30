# Script to recreate ReelHunter app with proper repository connection

Write-Host "🔄 Recreating ReelHunter App..." -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

$oldAppId = "d3n96xclgi8hou"
$appName = "reelhunter-reelapps"
$repoUrl = "https://github.com/NathiDhliso/ReelHunter"
$domain = "reelhunter.reelapps.co.za"

# Step 1: Delete the old app
Write-Host "🗑️  Deleting old app..." -ForegroundColor Yellow
try {
    aws amplify delete-app --app-id $oldAppId
    Write-Host "✅ Old app deleted successfully" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Could not delete old app: $_" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Create new app with repository connection
Write-Host "🆕 Creating new app with repository connection..." -ForegroundColor Yellow

$createAppCommand = @"
aws amplify create-app \
  --name "$appName" \
  --description "ReelHunter - AI-powered recruitment platform" \
  --repository "$repoUrl" \
  --platform "WEB" \
  --oauth-token "YOUR_GITHUB_TOKEN_HERE" \
  --query 'app.appId' \
  --output text
"@

Write-Host "⚠️  MANUAL STEP REQUIRED:" -ForegroundColor Red
Write-Host "You need to create the app manually with repository connection:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to: https://console.aws.amazon.com/amplify/home" -ForegroundColor Cyan
Write-Host "2. Click 'New app' → 'Host web app'" -ForegroundColor White
Write-Host "3. Select 'GitHub' → 'NathiDhliso/ReelHunter' → 'main' branch" -ForegroundColor White
Write-Host "4. App name: $appName" -ForegroundColor White
Write-Host "5. Accept default build settings (amplify.yml will be used)" -ForegroundColor White
Write-Host "6. Click 'Save and deploy'" -ForegroundColor White
Write-Host ""
Write-Host "7. After creation, note the new App ID and update domain:" -ForegroundColor White
Write-Host "   aws amplify create-domain-association --app-id NEW_APP_ID --domain-name reelapps.co.za --sub-domain reelhunter" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 This will ensure proper repository connection and resolve the build error." -ForegroundColor Green 