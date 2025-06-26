/// <reference types="vite/client" />

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  roles: ('candidate' | 'recruiter' | 'admin')[];
  icon?: string;
}

export const apps: AppConfig[] = [
  {
    id: 'reelcv',
    name: 'ReelCV',
    description: 'Dynamic candidate profiles that go beyond traditional resumes',
    url: import.meta.env.VITE_APP_REELCV_URL,
    roles: ['candidate'],
    icon: 'User'
  },
  {
    id: 'reelhunter',
    name: 'ReelHunter',
    description: 'AI-powered recruitment platform for modern hiring teams',
    url: import.meta.env.VITE_APP_REELHUNTER_URL,
    roles: ['recruiter'],
    icon: 'Search'
  },
  {
    id: 'reelskills',
    name: 'ReelSkills',
    description: 'Skill verification and development platform',
    url: import.meta.env.VITE_APP_REELSKILLS_URL,
    roles: ['candidate'],
    icon: 'Target'
  }
];

export const getAppsForRole = (role: 'candidate' | 'recruiter' | 'admin'): AppConfig[] => {
  return apps.filter(app => app.roles.includes(role));
}; 