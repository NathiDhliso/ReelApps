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
    url: 'https://reelcv.reelapps.co.za',
    roles: ['candidate'],
    icon: 'User'
  },
  {
    id: 'reelhunter',
    name: 'ReelHunter',
    description: 'AI-powered recruitment platform for modern hiring teams',
    url: 'https://reelhunter.reelapps.co.za',
    roles: ['recruiter'],
    icon: 'Search'
  },
  {
    id: 'reelskills',
    name: 'ReelSkills',
    description: 'Skill verification and development platform',
    url: 'https://reelskills.reelapps.co.za',
    roles: ['candidate'],
    icon: 'Target'
  }
];

export const getAppsForRole = (role: 'candidate' | 'recruiter' | 'admin'): AppConfig[] => {
  return apps.filter(app => app.roles.includes(role));
}; 