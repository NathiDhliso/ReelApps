export interface AppConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  roles: ('candidate' | 'recruiter' | 'admin')[];
  icon?: string;
}

// Environment-specific URL configuration
const getEnvironmentUrls = () => {
  const isDev = process.env.NODE_ENV === 'development' || 
                 (typeof window !== 'undefined' && window.location.hostname === 'localhost');
  
  return {
    main: isDev ? 'http://localhost:5173' : 'https://www.reelapps.co.za',
    reelcv: isDev ? 'http://localhost:5174' : 'https://www.reelcv.co.za',
    reelhunter: isDev ? 'http://localhost:5176' : 'https://www.reelhunter.co.za',
    reelpersona: isDev ? 'http://localhost:5177' : 'https://www.reelpersona.co.za',
    reelproject: isDev ? 'http://localhost:5178' : 'https://www.reelprojects.co.za',
    reelskills: isDev ? 'http://localhost:5179' : 'https://www.reelskills.co.za'
  };
};

export const apps: AppConfig[] = [
  {
    id: 'reelcv',
    name: 'ReelCV',
    description: 'Dynamic candidate profiles that go beyond traditional resumes',
    url: getEnvironmentUrls().reelcv,
    roles: ['candidate', 'admin'],
    icon: 'User'
  },
  {
    id: 'reelhunter',
    name: 'ReelHunter',
    description: 'AI-powered recruitment platform for modern hiring teams',
    url: getEnvironmentUrls().reelhunter,
    roles: ['recruiter', 'admin'],
    icon: 'Search'
  },
  {
    id: 'reelskills',
    name: 'ReelSkills',
    description: 'Skill verification and development platform',
    url: getEnvironmentUrls().reelskills,
    roles: ['candidate', 'admin'],
    icon: 'Target'
  },
  // --- ADDED: ReelPersona Configuration ---
  {
    id: 'reelpersona',
    name: 'ReelPersona',
    description: 'AI-driven personality assessments for cultural fit',
    url: getEnvironmentUrls().reelpersona,
    roles: ['candidate', 'recruiter', 'admin'],
    icon: 'Smile'
  },
  // --- ADDED: ReelProject Configuration ---
  {
    id: 'reelproject',
    name: 'ReelProject',
    description: 'Collaborative project management for freelance teams',
    url: getEnvironmentUrls().reelproject,
    roles: ['candidate', 'recruiter', 'admin'],
    icon: 'Briefcase'
  }
];

/**
 * Gets the applications available for a specific user role.
 * @param role The role of the user ('candidate', 'recruiter', or 'admin').
 * @returns An array of AppConfig objects. Admins get all apps.
 */
export const getAppsForRole = (role: 'candidate' | 'recruiter' | 'admin'): AppConfig[] => {
  console.log('🔍 DEBUG: getAppsForRole called with role:', role);
  console.log('🔍 DEBUG: getAppsForRole - all apps:', apps);
  
  // --- UPDATED: Admins should see all applications ---
  if (role === 'admin') {
    console.log('🔍 DEBUG: getAppsForRole - admin role, returning all apps:', apps);
    return apps;
  }
  
  const filteredApps = apps.filter(app => app.roles.includes(role));
  console.log('🔍 DEBUG: getAppsForRole - filtered apps for role', role, ':', filteredApps);
  
  return filteredApps;
};

// --- ADDED: Helper function to get main app URL ---
export const getMainAppUrl = (): string => {
  return getEnvironmentUrls().main;
};

/**
 * Fetch user-specific apps from the database (for future implementation)
 * This will replace the static configuration once the database migration is applied
 */
export const fetchUserAppsFromDatabase = async (supabase: any): Promise<AppConfig[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_my_apps');
    
    if (error) {
      console.error('Error fetching user apps:', error);
      // Fall back to role-based apps
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single();
      
      return profile ? getAppsForRole(profile.role) : [];
    }
    
    // Map database results to AppConfig format with environment-specific URLs
    const envUrls = getEnvironmentUrls();
    return data.map((app: any) => ({
      id: app.app_id,
      name: app.app_name,
      description: app.app_description,
      url: envUrls[app.app_id as keyof typeof envUrls] || app.app_url,
      roles: [], // Not needed when fetching from DB
      icon: getIconForApp(app.app_id)
    }));
  } catch (error) {
    console.error('Error in fetchUserAppsFromDatabase:', error);
    return [];
  }
};

/**
 * Get icon name for an app ID
 */
const getIconForApp = (appId: string): string => {
  const iconMap: Record<string, string> = {
    'reelcv': 'User',
    'reelhunter': 'Search',
    'reelskills': 'Target',
    'reelpersona': 'Smile',
    'reelproject': 'Briefcase'
  };
  return iconMap[appId] || 'User';
};
