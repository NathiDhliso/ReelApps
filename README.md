ReelApps - The Future of Talent Acquisition
ReelApps is a comprehensive AI-powered talent acquisition ecosystem that revolutionizes how candidates showcase their skills and how recruiters discover talent. The platform consists of three core products: ReelCV (dynamic candidate profiles), ReelSkills (skills management), and ReelHunter (AI-powered recruitment platform).

🌟 Key Features
ReelCV - Dynamic Candidate Profiles
Uneditable Showcase Pages: Clean, professional candidate profiles optimized for recruiter viewing.

Comprehensive Data Display: Skills, projects, persona analysis, and peer reviews.

Public Sharing: Direct URL access for easy sharing with potential employers.

Responsive Design: Optimized viewing experience across all devices.

Profile Completion Tracking: Automated scoring system to encourage complete profiles.

ReelSkills - Advanced Skills Management
5-Level Proficiency System: Beginner to Master skill assessment.

Categorized Skills: Technical, soft skills, languages, and certifications.

Experience Tracking: Years of experience per skill with verification options.

Peer Endorsements: Community-driven skill validation.

Video Demonstrations: Optional skill showcases for enhanced credibility.

ReelHunter - AI-Powered Recruitment Platform
Intelligent Job Analysis: Real-time feedback on job description quality.

Clarity scoring (0-100)

Realism assessment for requirements

Inclusivity analysis to reduce bias

Actionable improvement suggestions

Smart Candidate Matching: ML-powered ranking system.

Skills Match (40% weight): TF-IDF vectorization with cosine similarity

Experience Match (30% weight): Years of experience alignment

Culture Match (30% weight): Persona analysis correlation

Advanced Filtering: Location, availability, and skill-based candidate filtering.

Comprehensive Analytics: Hiring metrics and performance insights.

🏗️ Architecture Overview
Technology Stack
Frontend: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Lucide React.

Backend: Supabase, PostgreSQL with RLS, Supabase Edge Functions (Deno).

AI & Machine Learning: Python FastAPI Service, Google Gemini API, Scikit-learn, Pandas.

Cross-Platform: React Native (Mobile), Electron (Desktop) with shared TypeScript types.

Project Structure
reelApps/
├── src/                  # Web application (React, Vite)
│   ├── components/
│   │   ├── ReelCV/       # Candidate showcase components
│   │   ├── ReelHunter/   # Recruiter platform components
│   │   ├── ReelSkills/   # Skills management components
│   │   └── ...
│   ├── store/            # Zustand state management
│   ├── types/            # Shared TypeScript definitions
│   └── styles/           # Global CSS and design system
├── python_core/          # AI microservice (FastAPI)
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Container configuration
├── supabase/
│   ├── migrations/       # Database schema
│   └── functions/        # Edge functions (Deno)
├── mobile/               # React Native app
└── desktop/              # Electron app
📊 Database Schema
The application uses a comprehensive PostgreSQL schema with RLS on all tables. Core tables include profiles, skills, projects, persona_analyses, job_postings, and candidate_matches.

🚀 Getting Started
Prerequisites
Node.js 18+

Python 3.10+

Supabase account & API credentials

Google Gemini API key

Installation & Setup
Clone the repo and install web dependencies:

Bash

git clone <repository_url>
cd reelApps
npm install
Configure environment variables:

Bash

cp .env.example .env
# Add your Supabase credentials and Google Gemini API key
Running the Development Servers
Start the Web Application:

Bash

npm run dev
Start the Python AI Service:

Bash

cd python_core
pip install -r requirements.txt
python main.py
Run the Mobile App:

Bash

cd mobile
npm install
npm run ios   # or npm run android
Run the Desktop App:

Bash

cd desktop
npm install
npm start
🧪 Testing
Unit & Integration Tests: Vitest for components and stores.

End-to-End Tests: Playwright for complete user journeys.

Mobile Tests: React Native Testing Library.

Test Coverage: Minimum 80% coverage required.

Running Tests
Bash

# Run web app unit and integration tests
npm test
npm run test:coverage

# Run web app end-to-end tests
npm run test:e2e

# Run mobile app tests
cd mobile && npm test
🚢 Deployment
Web Application
Bash

npm run build
# Deploy the 'dist' folder to Vercel, Netlify, or a similar platform.
Python AI Service
Bash

cd python_core
docker build -t reelapps-ai .
docker run -p 8000:8000 reelapps-ai
Mobile & Desktop Applications
Bash

# Mobile
cd mobile
npm run build:android  # or build:ios

# Desktop
cd desktop
npm run build        # Cross-platform
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
🎨 Design System & 🔐 Security
The platform uses a consistent design system based on the Inter font, an 8px spacing grid, and a defined color palette. Security is paramount, with Row Level Security on the database, JWT-based authentication, input sanitization, and rate limiting on all public-facing APIs.

🤝 Contributing
Contributions are welcome! Please follow the workflow:

Fork the repository and create a new feature branch.

Implement changes, ensuring they are covered by tests.

Adhere to code standards (ESLint, Prettier, Conventional Commits).

Submit a pull request for review.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🆘 Support
For support, documentation, and questions, please refer to the resources below:

GitHub Issues: For bug reports and feature requests.

Contact Email: support@reelapps.com

Project Website: https://reelapps.com

ReelApps - Connecting authentic talent with forward-thinking employers through AI-powered insights.