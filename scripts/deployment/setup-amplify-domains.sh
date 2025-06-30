#!/bin/bash

# Setup script for AWS Amplify domains and subdomains
# This script sets up the domain configuration for all ReelApps

set -e

# Configuration
DOMAIN="reelapps.co.za"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed and configured
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to create or update Amplify app
setup_amplify_app() {
    local app_name=$1
    local description=$2
    local subdomain=$3
    
    print_status "Setting up Amplify app: $app_name"
    
    # Check if app already exists
    APP_ID=$(aws amplify list-apps --query "apps[?name=='$app_name'].appId" --output text 2>/dev/null || echo "")
    
    if [ -z "$APP_ID" ]; then
        print_status "Creating new Amplify app: $app_name"
        
        # Create the app with proper error handling
        if APP_ID=$(aws amplify create-app \
            --name "$app_name" \
            --description "$description" \
            --platform WEB \
            --custom-rules '[
                {
                    "source": "/<*>",
                    "target": "/index.html",
                    "status": "200"
                }
            ]' \
            --query 'app.appId' --output text 2>/dev/null); then
            print_success "Created Amplify app: $app_name (ID: $APP_ID)"
        else
            print_error "Failed to create Amplify app: $app_name"
            return 1
        fi
    else
        print_status "Amplify app already exists: $app_name (ID: $APP_ID)"
    fi
    
    # Create main branch if it doesn't exist
    aws amplify create-branch \
        --app-id "$APP_ID" \
        --branch-name main \
        --description "Main production branch" 2>/dev/null || true
    
    # Set up domain association
    if [ "$subdomain" = "www" ]; then
        print_status "Setting up main domain: $DOMAIN"
        
        # Check if domain association already exists
        EXISTING_DOMAIN=$(aws amplify list-domain-associations --app-id "$APP_ID" --query "domainAssociations[?domainName=='$DOMAIN'].domainName" --output text 2>/dev/null || echo "")
        
        if [ -z "$EXISTING_DOMAIN" ]; then
            aws amplify create-domain-association \
                --app-id "$APP_ID" \
                --domain-name "$DOMAIN" \
                --sub-domain-settings '[
                    {
                        "prefix": "www",
                        "branchName": "main"
                    },
                    {
                        "prefix": "",
                        "branchName": "main"
                    }
                ]' && print_success "Domain association created for $DOMAIN"
        else
            print_warning "Domain association already exists for $DOMAIN"
        fi
    else
        print_status "Setting up subdomain: $subdomain.$DOMAIN"
        
        # Check if domain association already exists for this subdomain
        EXISTING_DOMAIN=$(aws amplify list-domain-associations --app-id "$APP_ID" --query "domainAssociations[?domainName=='$DOMAIN'].domainName" --output text 2>/dev/null || echo "")
        
        if [ -z "$EXISTING_DOMAIN" ]; then
            aws amplify create-domain-association \
                --app-id "$APP_ID" \
                --domain-name "$DOMAIN" \
                --sub-domain-settings '[
                    {
                        "prefix": "'$subdomain'",
                        "branchName": "main"
                    }
                ]' && print_success "Domain association created for $subdomain.$DOMAIN"
        else
            print_warning "Domain association already exists for $subdomain.$DOMAIN"
        fi
    fi
    
    print_success "Completed setup for $app_name"
    echo "  - App ID: $APP_ID"
    echo "  - Domain: https://$subdomain.$DOMAIN"
    echo ""
}

# Main execution
main() {
    print_status "Starting AWS Amplify domain setup for ReelApps"
    echo "Domain: $DOMAIN"
    echo "Region: $AWS_REGION"
    echo ""
    
    check_prerequisites
    
    # Setup main ReelApps portal
    setup_amplify_app "reelapps-main" "ReelApps - Main portal and SSO hub" "www"
    
    # Setup ReelCV
    setup_amplify_app "reelcv-reelapps" "ReelCV - Dynamic candidate profiles" "reelcv"
    
    # Setup ReelHunter
    setup_amplify_app "reelhunter-reelapps" "ReelHunter - AI-powered recruitment platform" "reelhunter"
    
    # Setup ReelSkills
    setup_amplify_app "reelskills-reelapps" "ReelSkills - Skills management platform" "reelskills"
    
    # Setup ReelPersona
    setup_amplify_app "reelpersona-reelapps" "ReelPersona - Personality assessment tool" "reelpersona"
    
    # Setup ReelProjects
    setup_amplify_app "reelprojects-reelapps" "ReelProjects - Project showcase platform" "reelprojects"
    
    print_success "All Amplify apps and domains have been configured!"
    print_status "Next steps:"
    echo "1. Configure your DNS provider to point to AWS Amplify"
    echo "2. Wait for SSL certificates to be provisioned"
    echo "3. Deploy your applications using the GitHub Actions workflows"
    echo ""
    echo "You can check the status of your domains in the AWS Amplify console:"
    echo "https://console.aws.amazon.com/amplify/home?region=$AWS_REGION"
}

# Run main function
main "$@" 