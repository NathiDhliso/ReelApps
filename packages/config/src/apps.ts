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

/**
 * Gets the applications available for a specific user role.
 * @param role The role of the user ('candidate', 'recruiter', or 'admin').
 * @returns An array of AppConfig objects. Admins get all apps.
 */
export const getAppsForRole = (role: 'candidate' | 'recruiter' | 'admin'): AppConfig[] => {
  console.log('🔍 DEBUG: getAppsForRole called with role:', role);
  console.log('🔍 DEBUG: getAppsForRole - all apps:', apps);
  
  // Database-driven approach should be preferred, but this is a fallback
  // The actual app access should be determined by calling fetchUserAppsFromDatabase
  
  // --- UPDATED: Role-based filtering according to database schema ---
  const roleAppMapping: Record<string, string[]> = {
    'candidate': ['reel-cv', 'reel-skills', 'reel-persona', 'reel-project'],
    'recruiter': ['reel-hunter', 'reel-persona', 'reel-project'],
    'admin': ['reel-cv', 'reel-hunter', 'reel-skills', 'reel-persona', 'reel-project'] // Admin gets all apps
  };
  
  const allowedAppIds = roleAppMapping[role] || [];
  const filteredApps = apps.filter(app => allowedAppIds.includes(app.id));
  
  console.log('🔍 DEBUG: getAppsForRole - filtered apps for role', role, ':', filteredApps);
  
  return filteredApps;
};

// --- ADDED: Helper function to get main app URL ---
export const getMainAppUrl = (): string => {
  return getEnv('VITE_HOME_URL', 'https://www.reelapps.co.za');
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
      reelcv: getEnv('VITE_REELCV_URL', 'https://reelcv.reelapps.co.za'),
      reelhunter: getEnv('VITE_REELHUNTER_URL', 'https://reelhunter.reelapps.co.za'),
      reelskills: getEnv('VITE_REELSKILLS_URL', 'https://reelskills.reelapps.co.za'),
      reelpersona: getEnv('VITE_REELPERSONA_URL', 'https://reelpersona.reelapps.co.za'),
      reelproject: getEnv('VITE_REELPROJECT_URL', 'https://reelprojects.reelapps.co.za')
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
