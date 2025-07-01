# ReelApps - Main Portal

The central authentication hub and app launcher for the ReelApps ecosystem.

## 🌟 Features

### 🔐 Authentication Hub
- **Single Sign-On (SSO)** - Centralized authentication for all ReelApps
- **Role-Based Access Control** - Admin, Recruiter, and Candidate roles
- **Secure Session Management** - Cross-domain session handling
- **Password Reset & Recovery** - Self-service password management

### 🚀 App Launcher
- **Unified Dashboard** - Access all ReelApps from one place
- **Role-Based Navigation** - Only see apps you have permission to use
- **Seamless App Switching** - No re-authentication required
- **Quick Access Links** - Direct navigation to frequently used features

### 👥 User Management
- **Profile Management** - Update personal information and preferences
- **Role Assignment** - Admin can assign roles to users
- **User Directory** - Browse and search registered users
- **Activity Tracking** - View recent app usage and activity

### 🎨 Modern UI/UX
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - User preference-based theming
- **Accessibility** - WCAG 2.1 compliant interface
- **Fast Loading** - Optimized performance and caching

## 🏗️ Architecture

### Domain Structure
```
www.reelapps.co.za (Main Portal)
├── reelcv.reelapps.co.za (Candidate Profiles)
├── reelhunter.reelapps.co.za (Recruitment Platform)
├── reelskills.reelapps.co.za (Skills Management)
├── reelpersona.reelapps.co.za (Personality Assessment)
└── reelprojects.reelapps.co.za (Project Showcase)
```

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS + CSS Modules
- **Deployment**: AWS Amplify
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation
```bash
git clone https://github.com/your-org/reelapps-main.git
cd reelapps-main
npm install
```

### Environment Setup
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HOME_URL=http://localhost:5175
VITE_REELCV_URL=http://localhost:5176
VITE_REELHUNTER_URL=http://localhost:5177
VITE_REELSKILLS_URL=http://localhost:5178
VITE_REELPERSONA_URL=http://localhost:5179
VITE_REELPROJECT_URL=http://localhost:5180
```

### Development
```bash
npm run dev
# App runs on http://localhost:5175
```

## 🔧 Configuration

### Role-Based Access
```typescript
const roleMapping = {
  'admin': ['reelcv', 'reelhunter', 'reelskills', 'reelpersona', 'reelprojects'],
  'recruiter': ['reelhunter', 'reelpersona', 'reelprojects'],
  'candidate': ['reelcv', 'reelskills', 'reelpersona', 'reelprojects']
};
```

### SSO Configuration
- **Token Expiration**: 24 hours
- **Allowed Domains**: *.reelapps.co.za
- **Session Storage**: localStorage + Supabase session

## 📱 User Roles

### 👑 Admin
- Access to all ReelApps
- User management capabilities
- System configuration access
- Analytics and reporting

### 🎯 Recruiter
- ReelHunter (recruitment platform)
- ReelPersona (personality assessment)
- ReelProjects (project showcase)
- Candidate search and evaluation

### 👤 Candidate
- ReelCV (profile management)
- ReelSkills (skills showcase)
- ReelPersona (personality assessment)
- ReelProjects (project portfolio)

## 🔗 Related Apps

- **[ReelCV](https://github.com/your-org/reelcv-reelapps)** - Dynamic candidate profiles
- **[ReelHunter](https://github.com/your-org/reelhunter-reelapps)** - AI-powered recruitment
- **[ReelSkills](https://github.com/your-org/reelskills-reelapps)** - Skills management
- **[ReelPersona](https://github.com/your-org/reelpersona-reelapps)** - Personality assessment
- **[ReelProjects](https://github.com/your-org/reelprojects-reelapps)** - Project showcase

## 📚 Documentation

- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [SSO Implementation](./docs/SUBDOMAIN_DEPLOYMENT_GUIDE.md)
- [CI/CD Setup](./CI_CD_AND_SUPABASE_FIXES.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved. 