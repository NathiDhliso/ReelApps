# Simple testing script for all ReelApps repositories

Write-Host "Testing All ReelApps Repositories..." -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue
Write-Host ""

$apps = @("ReelApps", "ReelCV", "Reelhunter", "ReelSkills", "ReelPersona", "ReelProjects")
$paths = @(".", "../ReelCV", "../Reelhunter", "../ReelSkills", "../ReelPersona", "../ReelProjects")

for ($i = 0; $i -lt $apps.Length; $i++) {
    $appName = $apps[$i]
    $appPath = $paths[$i]
    
    Write-Host "Testing $appName..." -ForegroundColor Yellow
    Write-Host "Path: $appPath" -ForegroundColor Gray
    
    if (Test-Path $appPath) {
        Push-Location $appPath
        
        # Test Lint
        Write-Host "  Running lint..." -ForegroundColor Cyan
        try {
            npm run lint > $null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  LINT: PASS" -ForegroundColor Green
            } else {
                Write-Host "  LINT: FAIL" -ForegroundColor Red
            }
        } catch {
            Write-Host "  LINT: ERROR" -ForegroundColor Red
        }
        
        # Test Build
        Write-Host "  Running build..." -ForegroundColor Cyan
        try {
            npm run build > $null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  BUILD: PASS" -ForegroundColor Green
            } else {
                Write-Host "  BUILD: FAIL" -ForegroundColor Red
            }
        } catch {
            Write-Host "  BUILD: ERROR" -ForegroundColor Red
        }
        
        # Test TypeScript
        Write-Host "  Running TypeScript check..." -ForegroundColor Cyan
        try {
            npx tsc --noEmit > $null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  TYPESCRIPT: PASS" -ForegroundColor Green
            } else {
                Write-Host "  TYPESCRIPT: FAIL" -ForegroundColor Red
            }
        } catch {
            Write-Host "  TYPESCRIPT: ERROR" -ForegroundColor Red
        }
        
        # Test npm test
        Write-Host "  Running tests..." -ForegroundColor Cyan
        try {
            npm test > $null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  TESTS: PASS" -ForegroundColor Green
            } else {
                Write-Host "  TESTS: NO SCRIPT OR FAIL" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  TESTS: NO SCRIPT" -ForegroundColor Yellow
        }
        
        Pop-Location
    } else {
        Write-Host "  PATH NOT FOUND" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "Testing completed!" -ForegroundColor Blue 