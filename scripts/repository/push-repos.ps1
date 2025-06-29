Write-Host "🚀 Pushing ReelApps Split Repositories to GitHub" -ForegroundColor Green
Write-Host "================================================"

# Change to the split-repos directory
Set-Location "../split-repos"

# Function to push a repository
function Push-Repo {
    param(
        [string]$RepoDir,
        [string]$RepoName
    )
    
    Write-Host "📤 Pushing $RepoName..." -ForegroundColor Yellow
    Set-Location $RepoDir
    
    # Push to GitHub
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $RepoName pushed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push $RepoName" -ForegroundColor Red
    }
    
    Set-Location ..
    Write-Host ""
}

# Push each repository
Push-Repo -RepoDir "ReelCV" -RepoName "ReelCV"
Push-Repo -RepoDir "ReelHunter" -RepoName "ReelHunter"  
Push-Repo -RepoDir "ReelPersona" -RepoName "ReelPersona"
Push-Repo -RepoDir "ReelSkills" -RepoName "ReelSkills"
Push-Repo -RepoDir "ReelProjects" -RepoName "ReelProjects"

Write-Host "🎉 All repositories have been pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Your repositories are now available at:"
Write-Host "- https://github.com/NathiDhliso/ReelCV" -ForegroundColor Cyan
Write-Host "- https://github.com/NathiDhliso/ReelHunter" -ForegroundColor Cyan
Write-Host "- https://github.com/NathiDhliso/ReelPersona" -ForegroundColor Cyan
Write-Host "- https://github.com/NathiDhliso/ReelSkills" -ForegroundColor Cyan
Write-Host "- https://github.com/NathiDhliso/ReelProjects" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Set up shared packages in the main ReelApps repo" -ForegroundColor Yellow 