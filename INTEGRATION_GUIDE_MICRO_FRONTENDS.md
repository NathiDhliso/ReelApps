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
Each app should create a branded version:

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
      title="Access [YourApp]"
      subtitle="[Your app description]"
      primaryColor="#[brand-color]"
    />
  );
};
```

### 3. Update Main App Component

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

### 4. Update Main Components
Remove existing authentication logic and use auth store:

```typescript
import React, { useEffect } from 'react';
import { useAuthStore } from '@reelapps/auth';

export const YourMainComponent: React.FC = () => {
  const { user, profile, logout, refreshProfile } = useAuthStore();

  useEffect(() => {
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
- ✅ Session fixation prevention
- ✅ CSRF protection with double submit cookies
- ✅ User enumeration protection
- ✅ Session security validation
- ✅ Audit logging and monitoring

## 🎨 App-Specific Branding

### ReelCV (Green Theme)
```css
.reelCvModal {
  --modal-accent-color: #10b981;
  --modal-accent-hover: #059669;
}
```

### ReelHunter (Blue Theme)
```css
.reelHunterModal {
  --modal-accent-color: #3b82f6;
  --modal-accent-hover: #2563eb;
}
```

### ReelPersona (Purple Theme)
```css
.reelPersonaModal {
  --modal-accent-color: #8b5cf6;
  --modal-accent-hover: #7c3aed;
}
```

### ReelProject (Orange Theme)
```css
.reelProjectModal {
  --modal-accent-color: #f59e0b;
  --modal-accent-hover: #d97706;
}
```

### ReelSkills (Cyan Theme)
```css
.reelSkillsModal {
  --modal-accent-color: #06b6d4;
  --modal-accent-hover: #0891b2;
}
```

## 🚀 Migration Checklist

For each micro-frontend:
- [ ] Install auth and UI packages
- [ ] Create branded AuthModal component
- [ ] Wrap app with AppWrapper
- [ ] Update components to use useAuthStore
- [ ] Remove old authentication routes/logic
- [ ] Apply app-specific styling
- [ ] Test authentication flows
- [ ] Verify security features

## 🔧 Troubleshooting

### Common Issues:
1. **Modal not showing**: Check AppWrapper placement
2. **Auth state not syncing**: Verify package versions
3. **TypeScript errors**: Check type imports
4. **Styling conflicts**: Use CSS modules

### Debug Component:
```typescript
const AuthDebug = () => {
  const authState = useAuthStore();
  return (
    <pre style={{ position: 'fixed', top: 0, right: 0, background: 'white', padding: '10px', fontSize: '12px' }}>
      {JSON.stringify({ 
        user: authState.user?.id,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        profile: authState.profile?.role
      }, null, 2)}
    </pre>
  );
};
```

The modal authentication system is production-ready with enterprise-grade security. Follow this guide for consistent implementation across all ReelApps! 🚀