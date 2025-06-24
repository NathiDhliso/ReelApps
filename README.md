# ReelApps - The Future of Talent Acquisition

ReelApps is a comprehensive AI-powered talent acquisition ecosystem that revolutionizes how candidates showcase their skills and how recruiters discover talent. The platform consists of three core products: **ReelCV** (dynamic candidate profiles), **ReelSkills** (skills management), and **ReelHunter** (AI-powered recruitment platform).

## 🌟 Key Features

### ReelCV - Dynamic Candidate Profiles
- **Uneditable Showcase Pages**: Clean, professional candidate profiles optimized for recruiter viewing
- **Comprehensive Data Display**: Skills, projects, persona analysis, and peer reviews
- **Public Sharing**: Direct URL access for easy sharing with potential employers
- **Responsive Design**: Optimized viewing experience across all devices
- **Profile Completion Tracking**: Automated scoring system to encourage complete profiles

### ReelSkills - Advanced Skills Management
- **5-Level Proficiency System**: Beginner to Master skill assessment
- **Categorized Skills**: Technical, soft skills, languages, and certifications
- **Experience Tracking**: Years of experience per skill with verification options
- **Peer Endorsements**: Community-driven skill validation
- **Video Demonstrations**: Optional skill showcases for enhanced credibility

### ReelHunter - AI-Powered Recruitment Platform
- **Intelligent Job Analysis**: Real-time feedback on job description quality
  - Clarity scoring (0-100)
  - Realism assessment for requirements
  - Inclusivity analysis to reduce bias
  - Actionable improvement suggestions
- **Smart Candidate Matching**: ML-powered ranking system
  - Skills Match (40% weight): TF-IDF vectorization with cosine similarity
  - Experience Match (30% weight): Years of experience alignment
  - Culture Match (30% weight): Persona analysis correlation
- **Advanced Filtering**: Location, availability, and skill-based candidate filtering
- **Comprehensive Analytics**: Hiring metrics and performance insights

## 🏗️ Architecture Overview

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom design system
- **Zustand** for lightweight state management
- **React Router** for client-side routing
- **Lucide React** for consistent iconography

### Backend Infrastructure
- **Supabase** for database, authentication, and real-time features
- **PostgreSQL** with Row Level Security (RLS) for data protection
- **Supabase Edge Functions** (TypeScript/Deno) for serverless API endpoints
- **Python FastAPI Service** for AI processing and machine learning

### AI & Machine Learning
- **Google Gemini API** for natural language processing and job analysis
- **Scikit-learn** for text analysis and similarity calculations
- **Custom Matching Algorithms** for candidate-job compatibility scoring
- **Bias Detection & Mitigation** tools for fair hiring practices

### Cross-Platform Support
- **React Native** mobile application (iOS/Android)
- **Electron** desktop application (Windows/macOS/Linux)
- **Shared TypeScript types** and business logic across platforms

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following core tables:

### Core Tables
- **profiles**: Extended user profiles with role-based access (candidates/recruiters)
- **skills**: Individual skill entries with proficiency levels and verification
- **projects**: Portfolio projects with technologies, impact metrics, and media
- **persona_analyses**: AI-generated personality and work style assessments
- **reviews**: Peer and manager reviews with relationship context
- **job_postings**: Recruiter job listings with AI analysis scores
- **candidate_matches**: AI-generated candidate-job matches with detailed reasoning

### Security Features
- **Row Level Security (RLS)** on all tables
- **Role-based access control** (candidates vs recruiters vs admins)
- **Data validation constraints** and performance indexes
- **Automated triggers** for completion scoring and timestamps

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+ (for AI services)
- Supabase account
- Google Gemini API key

### Environment Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Environment configuration**:
   ```bash
   cp .env.example .env
   # Add your Supabase credentials and API keys
   ```

3. **Database setup**:
   - Connect to Supabase using the "Connect to Supabase" button
   - Database migrations will be applied automatically

### Development

1. **Start the web application**:
   ```bash
   npm run dev
   ```

2. **Start the Python AI service**:
   ```bash
   cd python_core
   pip install -r requirements.txt
   python main.py
   ```

3. **Mobile development**:
   ```bash
   cd mobile
   npm install
   npm run ios    # or npm run android
   ```

4. **Desktop development**:
   ```bash
   cd desktop
   npm install
   npm start
   ```

## 🧪 Testing

### Test Suites
- **Unit Tests**: Vitest for component and store testing
- **Integration Tests**: Store interactions and API endpoints
- **End-to-End Tests**: Playwright for complete user journeys
- **Mobile Tests**: React Native Testing Library

### Running Tests
```bash
# Unit and integration tests
npm test
npm run test:coverage

# End-to-end tests
npm run test:e2e
npm run test:e2e:ui

# Mobile tests
cd mobile && npm test
```

### Test Coverage
- Minimum 80% coverage requirement
- Comprehensive user journey testing
- Authentication flow validation
- Data persistence verification

## 🔧 AI Services

### Job Description Analyzer
The AI service analyzes job postings across three dimensions:

1. **Clarity (0-100)**: Evaluates structure and requirement definition
2. **Realism (0-100)**: Assesses requirement feasibility for experience level
3. **Inclusivity (0-100)**: Identifies potentially exclusionary language
4. **Suggestions**: Provides actionable improvement recommendations

### Candidate Matching Algorithm
The matching system uses a weighted scoring approach:

- **Skills Analysis**: TF-IDF vectorization with cosine similarity
- **Experience Evaluation**: Years of experience vs. job requirements
- **Cultural Compatibility**: Persona analysis correlation
- **Comprehensive Reasoning**: Detailed explanations for each match

### Rate Limiting & Security
- **Request throttling**: Prevents API abuse
- **Input validation**: Sanitizes all user inputs
- **Error handling**: Graceful degradation with fallback responses
- **Monitoring**: Comprehensive logging and health checks

## 🚢 Deployment

### Web Application
```bash
npm run build
# Deploy to Vercel, Netlify, or similar platform
```

### Python AI Service
```bash
cd python_core
docker build -t reelapps-ai .
docker run -p 8000:8000 reelapps-ai
```

### Mobile Applications
```bash
cd mobile
npm run build:android  # Android APK
npm run build:ios      # iOS build
```

### Desktop Applications
```bash
cd desktop
npm run build          # Cross-platform
npm run build:win      # Windows installer
npm run build:mac      # macOS app
npm run build:linux    # Linux AppImage
```

## 🎨 Design System

### Color Palette
- **Brand Colors**: Deep Ocean (#0A2540), Turquoise (#38B2AC)
- **Accent Colors**: Green (#38A169), Purple (#805AD5), Yellow (#D69E2E), Red (#E53E3E)
- **Neutral Tones**: Multiple shades for proper hierarchical application

### Typography
- **Font Family**: Inter with fallbacks
- **Line Spacing**: 150% for body text, 120% for headings
- **Weight System**: 3 weights maximum (400, 500, 600)

### Component System
- **8px spacing system** for consistent layouts
- **Responsive breakpoints** for mobile-first design
- **Micro-interactions** and hover states for enhanced UX
- **Glass morphism effects** and gradient overlays

## 🔐 Security & Privacy

### Data Protection
- **Row Level Security** ensures users only access their own data
- **Role-based permissions** separate candidate and recruiter access
- **Input sanitization** prevents injection attacks
- **Rate limiting** protects against abuse

### Authentication
- **Supabase Auth** with email/password authentication
- **JWT tokens** for secure session management
- **Profile creation triggers** for seamless onboarding
- **Password requirements** and validation

## 📈 Performance

### Optimization Features
- **Code splitting** for faster initial loads
- **Image optimization** with lazy loading
- **Database indexing** for query performance
- **Caching strategies** for frequently accessed data
- **Bundle analysis** and optimization

### Monitoring
- **Error tracking** with detailed logging
- **Performance metrics** and health checks
- **User analytics** for feature usage insights
- **System status dashboard** for service monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Code review and merge

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Conventional commits** for clear history

### Testing Requirements
- Unit tests for new components
- Integration tests for store changes
- E2E tests for user flows
- Minimum 80% code coverage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- **API Documentation**: Comprehensive endpoint documentation
- **Component Library**: Storybook for UI components
- **Database Schema**: ERD and relationship documentation

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community Q&A and feature discussions
- **Contributing Guide**: Detailed contribution instructions

### Contact
- **Email**: support@reelapps.com
- **Website**: https://reelapps.com
- **Documentation**: https://docs.reelapps.com

---

**ReelApps** - Connecting authentic talent with forward-thinking employers through AI-powered insights and comprehensive candidate profiles.