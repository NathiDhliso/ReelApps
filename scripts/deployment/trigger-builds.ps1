# Script to trigger builds for all ReelApps after GitHub repositories are connected
# Run this after connecting repositories through the AWS Amplify console

# App configuration with IDs
$apps = @(
    @{name="reelapps-main"; id="d3fs6t44xm7qp0"; repo="ReelApps"},
    @{name="reelcv-reelapps"; id="d2n8rdprxxalw4"; repo="ReelCV"},
    @{name="reelhunter-reelapps"; id="d3n96xclgi8hou"; repo="ReelHunter"},
    @{name="reelskills-reelapps"; id="d1f1d75sgjvy2g"; repo="ReelSkills"},
    @{name="reelpersona-reelapps"; id="d18oyoueahju5z"; repo="ReelPersona"},
    @{name="reelprojects-reelapps"; id="d3fq8s4knz33mj"; repo="ReelProjects"}
)

Write-Host "🚀 Triggering builds for all ReelApps..." -ForegroundColor Blue
Write-Host ""

foreach ($app in $apps) {
    Write-Host "Triggering build for $($app.name) ($($app.repo))..." -ForegroundColor Yellow
    
    try {
        $result = aws amplify start-job --app-id $app.id --branch-name main --job-type RELEASE --query 'jobSummary.jobId' --output text 2>$null
        
        if ($LASTEXITCODE -eq 0 -and ![string]::IsNullOrEmpty($result)) {
            Write-Host "✅ Build started for $($app.name) - Job ID: $result" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Could not start build for $($app.name) - Repository may not be connected yet" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Failed to start build for $($app.name) - $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "📋 Build Status Summary:" -ForegroundColor Cyan
Write-Host "To check build status for each app, run:" -ForegroundColor White
foreach ($app in $apps) {
    Write-Host "  aws amplify list-jobs --app-id $($app.id) --branch-name main --max-results 5" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🌐 Once builds complete, your apps will be available at:" -ForegroundColor Cyan
Write-Host "  • https://www.reelapps.co.za (Main portal)" -ForegroundColor White
Write-Host "  • https://reelcv.reelapps.co.za (ReelCV)" -ForegroundColor White
Write-Host "  • https://reelhunter.reelapps.co.za (ReelHunter)" -ForegroundColor White
Write-Host "  • https://reelskills.reelapps.co.za (ReelSkills)" -ForegroundColor White
Write-Host "  • https://reelpersona.reelapps.co.za (ReelPersona)" -ForegroundColor White
Write-Host "  • https://reelprojects.reelapps.co.za (ReelProjects)" -ForegroundColor White

Write-Host ""
Write-Host "ℹ️  Note: If builds fail, make sure to:" -ForegroundColor Blue
Write-Host "  1. Connect GitHub repositories through AWS Amplify console" -ForegroundColor White
Write-Host "  2. Configure build settings for each app" -ForegroundColor White
Write-Host "  3. Set up environment variables if needed" -ForegroundColor White 