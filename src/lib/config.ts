// Configuration utilities for ReelApps

// Helper function to get main app URL
export const getMainAppUrl = (): string => {
  return import.meta.env.VITE_HOME_URL || 'https://www.reelapps.co.za';
};

// Get environment variable with fallback
export const getEnv = (key: string, defaultValue: string): string => {
  return import.meta.env[key] || defaultValue;
};

// App configuration interface
export interface AppConfig {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  roles: ('candidate' | 'recruiter' | 'admin')[];
  mainNav: boolean;
}

// Export the apps configuration (you can expand this as needed)
export const apps: AppConfig[] = [
  {
    id: 'reel-cv',
    name: 'ReelCV',
    url: getEnv('VITE_REELCV_URL', 'https://reelcv.reelapps.co.za'),
    description: 'Create and manage your video-based CV.',
    icon: '📄',
    roles: ['candidate'],
    mainNav: true
  },
  {
    id: 'reel-hunter',
    name: 'ReelHunter',
    url: getEnv('VITE_REELHUNTER_URL', 'https://reelhunter.reelapps.co.za'),
    description: 'Find and hire top talent with video insights.',
    icon: '🎯',
    roles: ['recruiter', 'admin'],
    mainNav: true
  },
  {
    id: 'reel-skills',
    name: 'ReelSkills',
    url: getEnv('VITE_REELSKILLS_URL', 'https://reelskills.reelapps.co.za'),
    description: 'Showcase and verify your professional skills.',
    icon: '🛠️',
    roles: ['candidate', 'admin'],
    mainNav: true
  },
  {
    id: 'reel-persona',
    name: 'ReelPersona',
    url: getEnv('VITE_REELPERSONA_URL', 'https://reelpersona.reelapps.co.za'),
    description: 'Analyze and understand candidate personalities.',
    icon: '🧠',
    roles: ['recruiter', 'admin', 'candidate'],
    mainNav: true
  },
  {
    id: 'reel-project',
    name: 'ReelProject',
    url: getEnv('VITE_REELPROJECT_URL', 'https://reelprojects.reelapps.co.za'),
    description: 'Manage and collaborate on projects.',
    icon: '🚀',
    roles: ['admin', 'recruiter', 'candidate'],
    mainNav: true
  },
]; 