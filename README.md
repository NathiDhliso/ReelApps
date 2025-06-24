# ReelApps - The Future of Talent Acquisition

ReelApps is a comprehensive talent acquisition ecosystem consisting of ReelCV (candidate profiles) and ReelHunter (recruiter platform), powered by AI-driven matching and analysis.

## Architecture Overview

### Phase 1: Backend Core (✅ Complete)
- **Supabase Database**: Complete schema with profiles, skills, projects, persona analysis, job postings, and candidate matches
- **Authentication**: Supabase Auth with role-based access control
- **Row Level Security**: Comprehensive RLS policies for data protection

### Phase 2: Frontend Experiences (🔄 In Progress)
- **Web Application**: React + TypeScript + Vite + Tailwind CSS
- **ReelCV Showcase**: Uneditable, navigation-free candidate profiles
- **ReelSkills**: Skills management interface
- **ReelHunter**: Recruiter dashboard and candidate matching
- **Mobile App**: React Native foundation
- **Desktop App**: Electron wrapper

### Phase 3: AI Core (🆕 Implemented)
- **Python FastAPI Service**: Job analysis and candidate matching
- **Supabase Edge Functions**: Intelligent gateway layer
- **AI Integration**: Google Gemini API for job description analysis

## Project Structure

```
reelApps/
├── src/                          # Web application
│   ├── components/
│   │   ├── ReelCV/              # Candidate showcase components
│   │   ├── ReelHunter/          # Recruiter platform components
│   │   ├── ReelApps/            # Skills management components
│   │   └── ...
│   ├── store/                   # Zustand state management
│   ├── types/                   # TypeScript definitions
│   └── styles/                  # Global CSS and design system
├── python_core/                 # AI microservice
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile              # Container configuration
├── supabase/
│   ├── migrations/              # Database schema
│   └── functions/               # Edge functions
├── mobile/                      # React Native app
└── desktop/                     # Electron app
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account
- Google Gemini API key (for AI features)

### Web Application Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### Python AI Service Setup

1. **Navigate to Python core**:
   ```bash
   cd python_core
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment setup**:
   ```bash
   cp .env.example .env
   # Add your Gemini API key
   ```

4. **Start the service**:
   ```bash
   python main.py
   ```

### Mobile App Setup

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run on iOS/Android**:
   ```bash
   npm run ios    # or
   npm run android
   ```

### Desktop App Setup

1. **Navigate to desktop directory**:
   ```bash
   cd desktop
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start desktop app**:
   ```bash
   npm start
   ```

## Key Features

### ReelCV Showcase
- **Uneditable Profile Display**: Clean, professional candidate profiles
- **No Navigation**: Focused, distraction-free viewing experience
- **Comprehensive Data**: Skills, projects, persona analysis, and reviews
- **Responsive Design**: Optimized for all devices
- **Public Sharing**: Direct URL access for recruiters

### ReelHunter Platform
- **AI Job Analysis**: Real-time feedback on job descriptions
- **Smart Candidate Matching**: ML-powered candidate ranking
- **Advanced Filtering**: Location, availability, and skill-based filters
- **Recruiter Dashboard**: Comprehensive hiring analytics

### ReelSkills Management
- **Skill Proficiency Tracking**: 5-level proficiency system
- **Category Organization**: Technical, soft skills, languages, certifications
- **Experience Tracking**: Years of experience per skill
- **Video Demonstrations**: Optional skill showcases

## AI-Powered Features

### Job Description Analyzer
- **Clarity Scoring**: Evaluates job description clarity (0-100)
- **Realism Assessment**: Checks requirement feasibility
- **Inclusivity Analysis**: Identifies potentially exclusionary language
- **Improvement Suggestions**: Actionable recommendations

### Candidate Matching Algorithm
- **Skills Match (40%)**: TF-IDF vectorization and cosine similarity
- **Experience Match (30%)**: Years of experience alignment
- **Culture Match (30%)**: Persona analysis correlation
- **Weighted Scoring**: Comprehensive candidate ranking

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** with CSS Modules
- **Zustand** for state management
- **React Router** for navigation

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Supabase Edge Functions** (TypeScript/Deno)

### AI Service
- **Python FastAPI** for ML processing
- **Scikit-learn** for text analysis
- **Pandas** for data manipulation
- **Google Gemini API** for AI analysis

### Cross-Platform
- **React Native** for mobile
- **Electron** for desktop
- **Shared TypeScript types** and business logic

## Deployment

### Web Application
```bash
npm run build
# Deploy to Vercel, Netlify, or similar
```

### Python AI Service
```bash
cd python_core
docker build -t reelapps-ai .
docker run -p 8000:8000 reelapps-ai
```

### Mobile Apps
```bash
cd mobile
npm run build:android  # or build:ios
```

### Desktop Apps
```bash
cd desktop
npm run build          # Cross-platform
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@reelapps.com
- Documentation: https://docs.reelapps.com
- Issues: GitHub Issues tab