# ReelApps Modal Authentication Integration Guide

## 🎯 Overview
This guide helps integrate the modal-based authentication system into all ReelApps micro-frontends for consistent, secure, and accessible authentication.

## 📦 Available Packages

### `@reelapps/auth` - Authentication State Management
- Secure authentication flows with session fixation prevention
- CSRF protection and session security validation
- Cross-app SSO with shared session management
- User enumeration protection

### `@reelapps/ui` - Modal UI Components
- Accessible AuthModal with ARIA compliance
- AppWrapper for three-state rendering (loading → auth → app)
- CSRF-protected request handling
- Focus management and keyboard navigation

## 🔧 Quick Integration Steps

### 1. Install Dependencies

Add to your `package.json`:
```json
{
  "dependencies": {
    "@reelapps/auth": "workspace:*",
    "@reelapps/ui": "workspace:*"
  }
}
```

### 2. Create App-Specific AuthModal

#### For ReelCV (`apps/reelcv/src/components/AuthModal.tsx`):
```typescript
import React from 'react';
import { AuthModal as BaseAuthModal } from '@reelapps/ui';
import { useAuthStore } from '@reelapps/auth';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const { login, signup, sendPasswordResetEmail, isLoading, error } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    onClose();
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, role: 'candidate' | 'recruiter') => {
    await signup(email, password, firstName, lastName, role);
    onClose();
  };

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onPasswordReset={sendPasswordResetEmail}
      isLoading={isLoading}
      error={error}
      title="Access ReelCV"
      subtitle="Showcase your skills through video"
      primaryColor="#10b981" // ReelCV green
    />
  );
};
```

#### For ReelHunter (`apps/reelhunter/src/components/AuthModal.tsx`):
```typescript
import React from 'react';
import { AuthModal as BaseAuthModal } from '@reelapps/ui';
import { useAuthStore } from '@reelapps/auth';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const { login, signup, sendPasswordResetEmail, isLoading, error } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    onClose();
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, role: 'candidate' | 'recruiter') => {
    await signup(email, password, firstName, lastName, role);
    onClose();
  };

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onPasswordReset={sendPasswordResetEmail}
      isLoading={isLoading}
      error={error}
      title="Access ReelHunter"
      subtitle="Find top talent efficiently"
      primaryColor="#3b82f6" // ReelHunter blue
      defaultRole="recruiter" // Set recruiter as default for this app
    />
  );
};
```

#### For ReelPersona (`apps/reelpersona/src/components/AuthModal.tsx`):
```typescript
import React from 'react';
import { AuthModal as BaseAuthModal } from '@reelapps/ui';
import { useAuthStore } from '@reelapps/auth';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const { login, signup, sendPasswordResetEmail, isLoading, error } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    onClose();
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, role: 'candidate' | 'recruiter') => {
    await signup(email, password, firstName, lastName, role);
    onClose();
  };

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onPasswordReset={sendPasswordResetEmail}
      isLoading={isLoading}
      error={error}
      title="Access ReelPersona"
      subtitle="AI-powered candidate insights"
      primaryColor="#8b5cf6" // ReelPersona purple
    />
  );
};
```

#### For ReelProject (`apps/reelproject/src/components/AuthModal.tsx`):
```typescript
import React from 'react';
import { AuthModal as BaseAuthModal } from '@reelapps/ui';
import { useAuthStore } from '@reelapps/auth';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const { login, signup, sendPasswordResetEmail, isLoading, error } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    onClose();
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, role: 'candidate' | 'recruiter') => {
    await signup(email, password, firstName, lastName, role);
    onClose();
  };

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onPasswordReset={sendPasswordResetEmail}
      isLoading={isLoading}
      error={error}
      title="Access ReelProject"
      subtitle="Collaborative project management"
      primaryColor="#f59e0b" // ReelProject orange
    />
  );
};
```

#### For ReelSkills (`apps/reelskills/src/components/AuthModal.tsx`):
```typescript
import React from 'react';
import { AuthModal as BaseAuthModal } from '@reelapps/ui';
import { useAuthStore } from '@reelapps/auth';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ 
  isOpen, 
  onClose 
}) => {
  const { login, signup, sendPasswordResetEmail, isLoading, error } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    onClose();
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, role: 'candidate' | 'recruiter') => {
    await signup(email, password, firstName, lastName, role);
    onClose();
  };

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onPasswordReset={sendPasswordResetEmail}
      isLoading={isLoading}
      error={error}
      title="Access ReelSkills"
      subtitle="Showcase and validate your skills"
      primaryColor="#06b6d4" // ReelSkills cyan
    />
  );
};
```

### 3. Update Main App Components

#### Template for any app (`src/App.tsx`):
```typescript
import React from 'react';
import { AppWrapper } from '@reelapps/ui';
import { AuthModal } from './components/AuthModal';
import { YourMainComponent } from './components/YourMainComponent';

const App: React.FC = () => {
  return (
    <AppWrapper
      renderAuthModal={(isOpen, onClose) => (
        <AuthModal isOpen={isOpen} onClose={onClose} />
      )}
      loadingComponent={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <YourMainComponent />
    </AppWrapper>
  );
};

export default App;
```

### 4. Update Your Main Components

Remove any existing authentication logic and use the auth store:

```typescript
import React, { useEffect } from 'react';
import { useAuthStore } from '@reelapps/auth';

export const YourMainComponent: React.FC = () => {
  const { user, profile, logout, refreshProfile, isLoading } = useAuthStore();

  useEffect(() => {
    // Refresh profile when component mounts
    if (user && !profile) {
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // AppWrapper ensures user is authenticated, but good to have fallback
  if (!user) {
    return <div>Please log in to continue</div>;
  }

  return (
    <div>
      <header>
        <h1>Your App</h1>
        <div>
          <span>Welcome, {profile?.first_name || user.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <main>
        {/* Your app content */}
      </main>
    </div>
  );
};
```

## 🔒 Security Features (Automatic)

All these security features are automatically enabled:

### ✅ Session Fixation Prevention
- Sessions are regenerated on login
- Old session tokens are invalidated

### ✅ CSRF Protection
- Double Submit Cookie pattern
- Automatic token generation and validation
- Request interception for security headers

### ✅ User Enumeration Protection
- Generic password reset responses
- Consistent error messaging

### ✅ Session Security Validation
- User agent mismatch detection
- Session expiration monitoring
- Automatic security cleanup

### ✅ Audit Logging
- Security events tracked in database
- Session activity monitoring
- Suspicious activity detection

## 🎨 Customization Options

### AuthModal Props
```typescript
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, firstName: string, lastName: string, role: 'candidate' | 'recruiter') => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  defaultRole?: 'candidate' | 'recruiter';
  className?: string;
  allowRoleSelection?: boolean;
}
```

### Custom Styling
Create CSS modules for app-specific styling:
```css
/* AuthModal.module.css */
.customModal {
  --auth-modal-primary: #your-brand-color;
  --auth-modal-primary-hover: #your-brand-color-hover;
}

.customModal .modal-header {
  background: linear-gradient(135deg, var(--auth-modal-primary) 0%, var(--auth-modal-primary-hover) 100%);
}
```

## 🧪 Testing Integration

### 1. Authentication Flow Test
```typescript
// Add to your component tests
test('shows modal when user not authenticated', () => {
  // Mock unauthenticated state
  // Render component
  // Verify modal is shown
});

test('shows app content when user authenticated', () => {
  // Mock authenticated state
  // Render component
  // Verify app content is shown
});
```

### 2. Security Feature Test
```typescript
test('CSRF token is included in requests', () => {
  // Mock authenticated state
  // Make API request
  // Verify CSRF header is present
});
```

## 🚀 Migration Checklist

For each micro-frontend:

- [ ] **Dependencies**: Install @reelapps/auth and @reelapps/ui packages
- [ ] **AuthModal**: Create app-specific AuthModal component with branding
- [ ] **App.tsx**: Wrap main app with AppWrapper
- [ ] **Components**: Update components to use useAuthStore
- [ ] **Routing**: Remove authentication-related routes
- [ ] **Styling**: Apply app-specific theming to modal
- [ ] **Testing**: Test authentication flows and security features
- [ ] **Cleanup**: Remove old authentication code
- [ ] **Documentation**: Update app-specific documentation

## 🔧 Troubleshooting

### Common Issues:

1. **"AuthModal not showing"**
   - Ensure AppWrapper is at the root level
   - Check that isOpen prop is properly passed

2. **"Auth state not syncing across apps"**
   - Verify localStorage and BroadcastChannel are working
   - Check that all apps use the same @reelapps/auth version

3. **"TypeScript errors with auth store"**
   - Ensure proper types are imported
   - Check that auth store is properly initialized

4. **"Styling conflicts"**
   - Use CSS modules for scoped styling
   - Check CSS specificity and load order

### Debug Tools:

Add this component for debugging auth state:
```typescript
const AuthDebug = () => {
  const authState = useAuthStore();
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, background: 'white', padding: '10px', fontSize: '12px' }}>
      <pre>{JSON.stringify({ 
        user: authState.user?.id,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        profile: authState.profile?.role
      }, null, 2)}</pre>
    </div>
  );
};
```

## 📞 Support

- **Reference Implementation**: Check `apps/home/src/AppWithModalAuth.tsx`
- **Documentation**: `MODAL_AUTH_IMPLEMENTATION_STATUS.md`
- **Security Questions**: Review security enhancement documentation
- **Integration Issues**: Follow the step-by-step checklist above

The modal authentication system is production-ready with enterprise-grade security. Follow this guide for consistent implementation across all ReelApps micro-frontends! 🚀 