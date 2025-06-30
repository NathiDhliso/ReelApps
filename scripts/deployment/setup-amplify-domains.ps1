# Setup script for AWS Amplify domains and subdomains (PowerShell version)
# This script sets up the domain configuration for all ReelApps

# Configuration
$DOMAIN = "reelapps.co.za"
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if AWS CLI is installed and configured
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    try {
        $null = Get-Command aws -ErrorAction Stop
    }
    catch {
        Write-Error "AWS CLI is not installed. Please install it first."
        exit 1
    }
    
    try {
        $null = aws sts get-caller-identity 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "AWS CLI not configured"
        }
    }
    catch {
        Write-Error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Function to create or update Amplify app
function Setup-AmplifyApp {
    param(
        [string]$AppName,
        [string]$Description,
        [string]$Subdomain
    )
    
    Write-Status "Setting up Amplify app: $AppName"
    
    # Check if app already exists
    $AppId = aws amplify list-apps --query "apps[?name=='$AppName'].appId" --output text 2>$null
    
    if ([string]::IsNullOrEmpty($AppId) -or $AppId -eq "None") {
        Write-Status "Creating new Amplify app: $AppName"
        
        # Create the app with proper error handling
        $customRules = @'
[
    {
        "source": "/<*>",
        "target": "/index.html",
        "status": "200"
    }
]
'@
        
        try {
            $AppId = aws amplify create-app `
                --name "$AppName" `
                --description "$Description" `
                --platform WEB `
                --custom-rules $customRules `
                --query 'app.appId' --output text 2>$null
            
            if ($LASTEXITCODE -eq 0 -and ![string]::IsNullOrEmpty($AppId)) {
                Write-Success "Created Amplify app: $AppName (ID: $AppId)"
            } else {
                Write-Error "Failed to create Amplify app: $AppName"
                return $false
            }
        }
        catch {
            Write-Error "Failed to create Amplify app: $AppName - $_"
            return $false
        }
    } else {
        Write-Status "Amplify app already exists: $AppName (ID: $AppId)"
    }
    
    # Create main branch if it doesn't exist
    try {
        aws amplify create-branch `
            --app-id "$AppId" `
            --branch-name main `
            --description "Main production branch" 2>$null
    }
    catch {
        # Branch might already exist, continue
    }
    
    # Set up domain association
    if ($Subdomain -eq "www") {
        Write-Status "Setting up main domain: $DOMAIN"
        
        # Check if domain association already exists
        $ExistingDomain = aws amplify list-domain-associations --app-id "$AppId" --query "domainAssociations[?domainName=='$DOMAIN'].domainName" --output text 2>$null
        
        if ([string]::IsNullOrEmpty($ExistingDomain) -or $ExistingDomain -eq "None") {
            $subDomainSettings = @'
[
    {
        "prefix": "www",
        "branchName": "main"
    },
    {
        "prefix": "",
        "branchName": "main"
    }
]
'@
            try {
                aws amplify create-domain-association `
                    --app-id "$AppId" `
                    --domain-name "$DOMAIN" `
                    --sub-domain-settings $subDomainSettings 2>$null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Domain association created for $DOMAIN"
                }
            }
            catch {
                Write-Warning "Could not create domain association for $DOMAIN"
            }
        } else {
            Write-Warning "Domain association already exists for $DOMAIN"
        }
    } else {
        Write-Status "Setting up subdomain: $Subdomain.$DOMAIN"
        
        # Check if domain association already exists for this subdomain
        $ExistingDomain = aws amplify list-domain-associations --app-id "$AppId" --query "domainAssociations[?domainName=='$DOMAIN'].domainName" --output text 2>$null
        
        if ([string]::IsNullOrEmpty($ExistingDomain) -or $ExistingDomain -eq "None") {
            $subDomainSettings = @"
[
    {
        "prefix": "$Subdomain",
        "branchName": "main"
    }
]
"@
            try {
                aws amplify create-domain-association `
                    --app-id "$AppId" `
                    --domain-name "$DOMAIN" `
                    --sub-domain-settings $subDomainSettings 2>$null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Domain association created for $Subdomain.$DOMAIN"
                }
            }
            catch {
                Write-Warning "Could not create domain association for $Subdomain.$DOMAIN"
            }
        } else {
            Write-Warning "Domain association already exists for $Subdomain.$DOMAIN"
        }
    }
    
    Write-Success "Completed setup for $AppName"
    Write-Host "  - App ID: $AppId"
    Write-Host "  - Domain: https://$Subdomain.$DOMAIN"
    Write-Host ""
    
    return $true
}

# Main execution
function Main {
    Write-Status "Starting AWS Amplify domain setup for ReelApps"
    Write-Host "Domain: $DOMAIN"
    Write-Host "Region: $AWS_REGION"
    Write-Host ""
    
    Test-Prerequisites
    
    # Setup main ReelApps portal
    Setup-AmplifyApp "reelapps-main" "ReelApps - Main portal and SSO hub" "www"
    
    # Setup ReelCV
    Setup-AmplifyApp "reelcv-reelapps" "ReelCV - Dynamic candidate profiles" "reelcv"
    
    # Setup ReelHunter
    Setup-AmplifyApp "reelhunter-reelapps" "ReelHunter - AI-powered recruitment platform" "reelhunter"
    
    # Setup ReelSkills
    Setup-AmplifyApp "reelskills-reelapps" "ReelSkills - Skills management platform" "reelskills"
    
    # Setup ReelPersona
    Setup-AmplifyApp "reelpersona-reelapps" "ReelPersona - Personality assessment tool" "reelpersona"
    
    # Setup ReelProjects
    Setup-AmplifyApp "reelprojects-reelapps" "ReelProjects - Project showcase platform" "reelprojects"
    
    Write-Success "All Amplify apps and domains have been configured!"
    Write-Status "Next steps:"
    Write-Host "1. Configure your DNS provider to point to AWS Amplify"
    Write-Host "2. Wait for SSL certificates to be provisioned"
    Write-Host "3. Deploy your applications using the GitHub Actions workflows"
    Write-Host ""
    Write-Host "You can check the status of your domains in the AWS Amplify console:"
    Write-Host "https://console.aws.amazon.com/amplify/home?region=$AWS_REGION"
}

# Run main function
Main 