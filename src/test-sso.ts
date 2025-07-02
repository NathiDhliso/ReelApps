// Test SSO functionality to verify fixes

export const testSSO = () => {
  console.log('🧪 Testing SSO functionality...');
  
  // Test domain detection
  const currentDomain = window.location.hostname;
  const isSubdomain = currentDomain !== 'reelapps.co.za' && 
                     currentDomain !== 'www.reelapps.co.za' &&
                     currentDomain.endsWith('.reelapps.co.za');
  
  console.log('🌍 Domain analysis:', {
    currentDomain,
    isSubdomain,
    shouldInitializeSSO: isSubdomain
  });
  
  // Test SSO state
  console.log('🔄 SSO Manager state:', {
    config: {
      mainDomain: 'reelapps.co.za',
      allowedSubdomains: ['reelcv', 'reelhunter', 'reelskills', 'reelpersona', 'reelproject']
    }
  });
  
  // Check for existing SSO tokens
  const ssoToken = localStorage.getItem('ssoToken');
  const sessionCookie = document.cookie.includes('reelapps-session');
  
  console.log('🍪 Token status:', {
    localStorageToken: !!ssoToken,
    sessionCookie,
    urlParams: new URLSearchParams(window.location.search).has('ssoToken')
  });
  
  return {
    currentDomain,
    isSubdomain,
    hasTokens: !!ssoToken || sessionCookie
  };
};

// Export for console testing
(window as any).testSSO = testSSO; 