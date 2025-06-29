#!/bin/bash

# Setup script for ReelApps shared packages

echo "🚀 Setting up ReelApps Shared Packages..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build all packages
echo "🔨 Building all packages..."
pnpm run build

# Run tests
echo "🧪 Running tests..."
pnpm run test

# Lint all packages
echo "🔍 Linting packages..."
pnpm run lint

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Login to npm: npm login"
echo "2. Publish packages: pnpm run publish:all"
echo "3. Update individual app repositories to use published packages"
echo ""
echo "🔗 Package URLs will be:"
echo "  - @reelapps/auth"
echo "  - @reelapps/config"
echo "  - @reelapps/supabase"
echo "  - @reelapps/types"
echo "  - @reelapps/ui" 