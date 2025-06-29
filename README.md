# ReelApps Shared Packages

This repository contains shared packages for the ReelApps ecosystem. These packages provide common functionality, UI components, authentication, and configuration used across all ReelApps applications.

## 📦 Packages

### `@reelapps/auth`
Authentication and authorization utilities, including Supabase integration and session management.

### `@reelapps/config`
Shared configuration and constants used across applications.

### `@reelapps/supabase`
Supabase client configuration and utilities.

### `@reelapps/types`
TypeScript type definitions shared across applications.

### `@reelapps/ui`
Reusable UI components and styling utilities.

## 🚀 Usage

Install packages in your ReelApps application:

```bash
npm install @reelapps/auth @reelapps/ui @reelapps/config @reelapps/types @reelapps/supabase
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm 8+

### Setup
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Lint all packages
pnpm run lint
```

### Publishing
```bash
# Publish all packages to npm
pnpm run publish:all
```

## 🏗️ Architecture

This is a monorepo using pnpm workspaces. Each package is independently versioned and published to npm under the `@reelapps` scope.

### Package Structure
```
packages/
├── auth/          # Authentication utilities
├── config/        # Shared configuration
├── supabase/      # Supabase client
├── types/         # TypeScript types
└── ui/           # UI components
```

## 🔗 Related Repositories

- [ReelCV](https://github.com/NathiDhliso/ReelCV) - Dynamic candidate profiles
- [ReelHunter](https://github.com/NathiDhliso/ReelHunter) - AI-powered recruitment platform
- [ReelPersona](https://github.com/NathiDhliso/ReelPersona) - Personality assessment tool
- [ReelSkills](https://github.com/NathiDhliso/ReelSkills) - Skills management platform
- [ReelProjects](https://github.com/NathiDhliso/ReelProjects) - Project showcase platform

## 📄 License

MIT License - see LICENSE file for details. 