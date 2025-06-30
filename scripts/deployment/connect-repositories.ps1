# Script to help connect GitHub repositories to AWS Amplify apps
# This script provides instructions and automates what's possible via CLI

Write-Host "🔗 ReelApps Repository Connection Guide" -ForegroundColor Blue
Write-Host "=======================================" -ForegroundColor Blue
Write-Host ""

# App configuration
$apps = @(
    @{name="reelapps-main"; id="d3fs6t44xm7qp0"; repo="NathiDhliso/ReelApps"; url="https://github.com/NathiDhliso/ReelApps"},
    @{name="reelcv-reelapps"; id="d2n8rdprxxalw4"; repo="NathiDhliso/ReelCV"; url="https://github.com/NathiDhliso/ReelCV"},
    @{name="reelhunter-reelapps"; id="d3n96xclgi8hou"; repo="NathiDhliso/ReelHunter"; url="https://github.com/NathiDhliso/ReelHunter"},
    @{name="reelskills-reelapps"; id="d1f1d75sgjvy2g"; repo="NathiDhliso/ReelSkills"; url="https://github.com/NathiDhliso/ReelSkills"},
    @{name="reelpersona-reelapps"; id="d18oyoueahju5z"; repo="NathiDhliso/ReelPersona"; url="https://github.com/NathiDhliso/ReelPersona"},
    @{name="reelprojects-reelapps"; id="d3fq8s4knz33mj"; repo="NathiDhliso/ReelProjects"; url="https://github.com/NathiDhliso/ReelProjects"}
)

Write-Host "📋 Repository Connection Instructions:" -ForegroundColor Cyan
Write-Host ""

$counter = 1
foreach ($app in $apps) {
    Write-Host "$counter. Connect $($app.name)" -ForegroundColor Yellow
    Write-Host "   🌐 AWS Console: https://console.aws.amazon.com/amplify/home#/apps/$($app.id)" -ForegroundColor White
    Write-Host "   📁 GitHub Repo: $($app.url)" -ForegroundColor White
    Write-Host "   ➡️  Click 'Connect repository' → GitHub → Select '$($app.repo)' → main branch" -ForegroundColor Gray
    Write-Host ""
    $counter++
}

Write-Host "🚀 Quick Connect Links:" -ForegroundColor Green
Write-Host "Open these links in your browser to connect each app:" -ForegroundColor White
Write-Host ""

foreach ($app in $apps) {
    Write-Host "• $($app.name): https://console.aws.amazon.com/amplify/home#/apps/$($app.id)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "⚡ After connecting repositories, run this to trigger builds:" -ForegroundColor Yellow
Write-Host "   ./scripts/deployment/trigger-builds.ps1" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Monitor connection status..." -ForegroundColor Blue

# Check if repositories are connected
foreach ($app in $apps) {
    Write-Host "Checking $($app.name)..." -ForegroundColor Yellow
    
    try {
        $appDetails = aws amplify get-app --app-id $app.id --query 'app.repository' --output text 2>$null
        
        if (![string]::IsNullOrEmpty($appDetails) -and $appDetails -ne "None" -and $appDetails -ne "null") {
            Write-Host "✅ $($app.name) is connected to repository" -ForegroundColor Green
        } else {
            Write-Host "❌ $($app.name) needs repository connection" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "⚠️  Could not check $($app.name) status" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "💡 Pro Tips:" -ForegroundColor Cyan
Write-Host "• Use the same GitHub account that owns the repositories" -ForegroundColor White
Write-Host "• Select 'main' branch for all connections" -ForegroundColor White
Write-Host "• Accept default build settings (they're pre-configured)" -ForegroundColor White
Write-Host "• Builds will start automatically after connection" -ForegroundColor White

Write-Host ""
Write-Host "📞 Need help? Check the AWS Amplify documentation:" -ForegroundColor Blue
Write-Host "   https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html" -ForegroundColor White 