# Comprehensive testing script for all ReelApps repositories
# Tests: lint, build, TypeScript check, and npm test

Write-Host "🧪 Testing All ReelApps Repositories..." -ForegroundColor Blue
Write-Host "=======================================" -ForegroundColor Blue
Write-Host ""

# Define the apps and their paths
$apps = @(
    @{
        Name = "ReelApps (Main)"
        Path = "../ReelApps"
        HasTests = $false
    },
    @{
        Name = "ReelCV"
        Path = "../ReelCV"
        HasTests = $false
    },
    @{
        Name = "ReelHunter"
        Path = "../Reelhunter"
        HasTests = $false
    },
    @{
        Name = "ReelSkills"
        Path = "../ReelSkills"
        HasTests = $false
    },
    @{
        Name = "ReelPersona"
        Path = "../ReelPersona"
        HasTests = $false
    },
    @{
        Name = "ReelProjects"
        Path = "../ReelProjects"
        HasTests = $false
    }
)

# Initialize results tracking
$results = @()

# Function to test a single repository
function Test-Repository {
    param($app)
    
    Write-Host "📦 Testing $($app.Name)..." -ForegroundColor Yellow
    Write-Host "Path: $($app.Path)" -ForegroundColor Gray
    Write-Host ""
    
    $appResult = @{
        Name = $app.Name
        Path = $app.Path
        Lint = "❌"
        Build = "❌"
        TypeScript = "❌"
        Test = "❌"
        Errors = @()
    }
    
    if (Test-Path $app.Path) {
        Push-Location $app.Path
        
        try {
            # Test 1: Lint
            Write-Host "  🔍 Running lint..." -ForegroundColor Cyan
            try {
                $lintOutput = npm run lint 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $appResult.Lint = "✅"
                    Write-Host "  ✅ Lint passed" -ForegroundColor Green
                } else {
                    $appResult.Lint = "⚠️"
                    $lintErrors = ($lintOutput | Where-Object { $_ -match "error|warning" }) -join "`n"
                    $appResult.Errors += "Lint: $($lintErrors.Substring(0, [Math]::Min(200, $lintErrors.Length)))..."
                    Write-Host "  ⚠️  Lint has issues" -ForegroundColor Yellow
                }
            }
            catch {
                $appResult.Errors += "Lint: $_"
                Write-Host "  ❌ Lint failed: $_" -ForegroundColor Red
            }
            
            # Test 2: Build
            Write-Host "  🔨 Running build..." -ForegroundColor Cyan
            try {
                $buildOutput = npm run build 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $appResult.Build = "✅"
                    Write-Host "  ✅ Build passed" -ForegroundColor Green
                } else {
                    $buildError = ($buildOutput | Select-Object -Last 5) -join "`n"
                    $appResult.Errors += "Build: $($buildError.Substring(0, [Math]::Min(200, $buildError.Length)))..."
                    Write-Host "  ❌ Build failed" -ForegroundColor Red
                }
            }
            catch {
                $appResult.Errors += "Build: $_"
                Write-Host "  ❌ Build failed: $_" -ForegroundColor Red
            }
            
            # Test 3: TypeScript
            Write-Host "  📝 Running TypeScript check..." -ForegroundColor Cyan
            try {
                $tscOutput = npx tsc --noEmit 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $appResult.TypeScript = "✅"
                    Write-Host "  ✅ TypeScript check passed" -ForegroundColor Green
                } else {
                    $tscErrors = ($tscOutput | Where-Object { $_ -match "error" } | Select-Object -First 3) -join "`n"
                    $appResult.Errors += "TypeScript: $($tscErrors.Substring(0, [Math]::Min(200, $tscErrors.Length)))..."
                    Write-Host "  ❌ TypeScript check failed" -ForegroundColor Red
                }
            }
            catch {
                $appResult.Errors += "TypeScript: $_"
                Write-Host "  ❌ TypeScript check failed: $_" -ForegroundColor Red
            }
            
            # Test 4: Tests
            Write-Host "  🧪 Running tests..." -ForegroundColor Cyan
            try {
                $testOutput = npm test 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $appResult.Test = "✅"
                    Write-Host "  ✅ Tests passed" -ForegroundColor Green
                } else {
                    # Check if it's just missing test script
                    if ($testOutput -match "missing script|not found") {
                        $appResult.Test = "➖"
                        Write-Host "  ➖ No test script found" -ForegroundColor Gray
                    } else {
                        $testError = ($testOutput | Select-Object -Last 3) -join "`n"
                        $appResult.Errors += "Test: $($testError.Substring(0, [Math]::Min(200, $testError.Length)))..."
                        Write-Host "  ❌ Tests failed" -ForegroundColor Red
                    }
                }
            }
            catch {
                $appResult.Test = "➖"
                Write-Host "  ➖ No test script found" -ForegroundColor Gray
            }
        }
        catch {
            $appResult.Errors += "General: $_"
            Write-Host "  ❌ General error: $_" -ForegroundColor Red
        }
        finally {
            Pop-Location
        }
    } else {
        $appResult.Errors += "Path not found: $($app.Path)"
        Write-Host "  ❌ Path not found: $($app.Path)" -ForegroundColor Red
    }
    
    Write-Host ""
    return $appResult
}

# Test all repositories
foreach ($app in $apps) {
    $result = Test-Repository -app $app
    $results += $result
}

# Display summary
Write-Host "📊 TESTING SUMMARY" -ForegroundColor Blue
Write-Host "==================" -ForegroundColor Blue
Write-Host ""

$headerFormat = "{0,-20} {1,-6} {2,-6} {3,-12} {4,-6}"
$rowFormat = "{0,-20} {1,-6} {2,-6} {3,-12} {4,-6}"

Write-Host ($headerFormat -f "App", "Lint", "Build", "TypeScript", "Test") -ForegroundColor White
Write-Host ($headerFormat -f "---", "----", "-----", "----------", "----") -ForegroundColor Gray

foreach ($result in $results) {
    Write-Host ($rowFormat -f $result.Name, $result.Lint, $result.Build, $result.TypeScript, $result.Test)
}

Write-Host ""

# Show detailed errors
$appsWithErrors = $results | Where-Object { $_.Errors.Count -gt 0 }
if ($appsWithErrors.Count -gt 0) {
    Write-Host "🚨 DETAILED ERRORS" -ForegroundColor Red
    Write-Host "==================" -ForegroundColor Red
    Write-Host ""
    
    foreach ($app in $appsWithErrors) {
        Write-Host "$($app.Name):" -ForegroundColor Yellow
        foreach ($error in $app.Errors) {
            Write-Host "  • $error" -ForegroundColor Red
        }
        Write-Host ""
    }
}

# Calculate success rates
$totalTests = $results.Count * 4  # 4 tests per app
$passedTests = 0
foreach ($result in $results) {
    if ($result.Lint -eq "✅") { $passedTests++ }
    if ($result.Build -eq "✅") { $passedTests++ }
    if ($result.TypeScript -eq "✅") { $passedTests++ }
    if ($result.Test -eq "✅" -or $result.Test -eq "➖") { $passedTests++ }
}

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "🎯 OVERALL RESULTS" -ForegroundColor Blue
Write-Host "==================" -ForegroundColor Blue
Write-Host "Success Rate: $successRate% ($passedTests/$totalTests tests passed)" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })
Write-Host ""

if ($successRate -ge 80) {
    Write-Host "🎉 Great job! Most tests are passing." -ForegroundColor Green
} elseif ($successRate -ge 60) {
    Write-Host "⚠️  Some issues need attention, but overall progress is good." -ForegroundColor Yellow
} else {
    Write-Host "🚨 Multiple issues need to be addressed before deployment." -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Fix linting issues (mostly unused variables and missing types)" -ForegroundColor White
Write-Host "2. Resolve TypeScript errors (JSX types and import issues)" -ForegroundColor White
Write-Host "3. Fix build failures (missing dependencies or configuration)" -ForegroundColor White
Write-Host "4. Add test scripts where needed" -ForegroundColor White 