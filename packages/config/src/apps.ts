const getEnv = (key: string, defaultValue: string): string => {
  return (import.meta as any).env?.[key] || defaultValue;
};

export interface AppConfig {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  roles: ('candidate' | 'recruiter' | 'admin')[];
  mainNav: boolean;
}

// Export the apps configuration
export const apps: AppConfig[] = [
  {
    id: 'reel-cv',
    name: 'ReelCV',
    url: getEnv('VITE_REELCV_URL', 'http://localhost:5174'),
    description: 'Create and manage your video-based CV.',
    icon: '📄',
    roles: ['candidate'],
    mainNav: true
  },
  {
    id: 'reel-hunter',
    name: 'ReelHunter',
    url: getEnv('VITE_REELHUNTER_URL', 'http://localhost:5175'),
    description: 'Find and hire top talent with video insights.',
    icon: '🎯',
    roles: ['recruiter', 'admin'],
    mainNav: true
  },
  {
    id: 'reel-skills',
    name: 'ReelSkills',
    url: getEnv('VITE_REELSKILLS_URL', 'http://localhost:5176'),
    description: 'Showcase and verify your professional skills.',
    icon: '🛠️',
    roles: ['candidate', 'admin'],
    mainNav: true
  },
  {
    id: 'reel-persona',
    name: 'ReelPersona',
    url: getEnv('VITE_REELPERSONA_URL', 'http://localhost:5177'),
    description: 'Analyze and understand candidate personalities.',
    icon: '🧠',
    roles: ['recruiter', 'admin', 'candidate'],
    mainNav: true
  },
  {
    id: 'reel-project',
    name: 'ReelProject',
    url: getEnv('VITE_REELPROJECT_URL', 'http://localhost:5178'),
    description: 'Manage and collaborate on projects.',
    icon: '🚀',
    roles: ['admin', 'recruiter', 'candidate'],
    mainNav: true
  },
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
  return getEnv('VITE_HOME_URL', 'http://localhost:5173');
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
    const envUrls = {
      reelcv: getEnv('VITE_REELCV_URL', 'http://localhost:5174'),
      reelhunter: getEnv('VITE_REELHUNTER_URL', 'http://localhost:5175'),
      reelskills: getEnv('VITE_REELSKILLS_URL', 'http://localhost:5176'),
      reelpersona: getEnv('VITE_REELPERSONA_URL', 'http://localhost:5177'),
      reelproject: getEnv('VITE_REELPROJECT_URL', 'http://localhost:5178')
    };
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
    'reelcv': '📄',
    'reelhunter': '🎯',
    'reelskills': '🛠️',
    'reelpersona': '🧠',
    'reelproject': '🚀'
  };
  return iconMap[appId] || '📄';
};
