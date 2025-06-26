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
    url: 'https://www.reelcv.co.za/',
    roles: ['candidate'],
    icon: 'User'
  },
  {
    id: 'reelhunter',
    name: 'ReelHunter',
    description: 'AI-powered recruitment platform for modern hiring teams',
    url: 'https://www.reelhunter.co.za/',
    roles: ['recruiter'],
    icon: 'Search'
  },
  {
    id: 'reelskills',
    name: 'ReelSkills',
    description: 'Skill verification and development platform',
    url: 'https://www.reelskills.co.za/',
    roles: ['candidate'],
    icon: 'Target'
  },
  // --- ADDED: ReelPersona Configuration ---
  {
    id: 'reelpersona',
    name: 'ReelPersona',
    description: 'AI-driven personality assessments for cultural fit',
    url: 'https://www.reelpersona.co.za/',
    roles: ['candidate', 'recruiter'],
    icon: 'Smile'
  },
  // --- ADDED: ReelProject Configuration ---
  {
    id: 'reelproject',
    name: 'ReelProject',
    description: 'Collaborative project management for freelance teams',
    url: 'https://www.reelprojects.co.za/',
    roles: ['candidate', 'recruiter'],
    icon: 'Briefcase'
  }
];

/**
 * Gets the applications available for a specific user role.
 * @param role The role of the user ('candidate', 'recruiter', or 'admin').
 * @returns An array of AppConfig objects. Admins get all apps.
 */
export const getAppsForRole = (role: 'candidate' | 'recruiter' | 'admin'): AppConfig[] => {
  // --- UPDATED: Admins should see all applications ---
  if (role === 'admin') {
    return apps;
  }
  return apps.filter(app => app.roles.includes(role));
};
