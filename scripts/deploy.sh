#!/bin/bash

# ReelApps Deployment Script
set -e

# Configuration
ENVIRONMENT=${1:-staging}
PYTHON_SERVICE_IMAGE="reelapps-ai"
FRONTEND_BUILD_DIR="dist"

echo "🚀 Starting deployment to $ENVIRONMENT environment..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Build Python service
echo "🐍 Building Python service..."
cd python_core
docker build -t $PYTHON_SERVICE_IMAGE:$ENVIRONMENT .
cd ..

# Deploy based on environment
case $ENVIRONMENT in
  "staging")
    echo "🔧 Deploying to staging..."
    # Deploy frontend to staging
    netlify deploy --dir=$FRONTEND_BUILD_DIR --site=$NETLIFY_STAGING_SITE_ID
    
    # Deploy Python service to staging
    # Add your staging deployment commands here
    echo "Python service deployment to staging completed"
    ;;
    
  "production")
    echo "🚀 Deploying to production..."
    # Deploy frontend to production
    netlify deploy --prod --dir=$FRONTEND_BUILD_DIR --site=$NETLIFY_PRODUCTION_SITE_ID
    
    # Deploy Python service to production
    # Add your production deployment commands here
    echo "Python service deployment to production completed"
    ;;
    
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "✅ Deployment to $ENVIRONMENT completed successfully!"