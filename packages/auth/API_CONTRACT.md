# AuthStore API Contract

## Overview
The `@packages/auth` authStore is a shared, stable public API for managing authentication state across all ReelApps micro-frontends. This store acts as a passive state reporter, providing authentication status without controlling navigation.

## Version
Current Version: 1.0.0

## API Contract

### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | The authenticated Supabase user object |
| `profile` | `Profile \| null` | The user's profile data from the database |
| `isLoading` | `boolean` | Indicates if an auth operation is in progress |
| `isInitializing` | `boolean` | Indicates if the auth store is initializing |
| `error` | `string \| null` | Error message from the last operation |
| `isAuthenticated` | `boolean` | Whether the user is currently authenticated |

### Public Methods

#### `initialize(): Promise<void>`
Initializes the auth store by checking for existing sessions.
- **Behavior**: Checks for session in URL hash or existing session, updates state accordingly
- **Side Effects**: May sync session across apps, starts session cleanup service
- **Navigation**: None - only updates state

#### `login(email: string, password: string): Promise<void>`
Authenticates a user with email and password.
- **Parameters**: 
  - `email`: User's email address
  - `password`: User's password
- **Side Effects**: Syncs session across apps, fetches user profile
- **Throws**: Error if authentication fails

#### `signup(email: string, password: string, firstName: string, lastName: string, role?: 'candidate' | 'recruiter'): Promise<void>`
Creates a new user account.
- **Parameters**:
  - `email`: User's email address
  - `password`: User's password
  - `firstName`: User's first name
  - `lastName`: User's last name
  - `role`: User role (defaults to 'candidate')
- **Side Effects**: Creates user profile in database
- **Throws**: Error if signup fails

#### `logout(): Promise<void>`
Signs out the current user.
- **Side Effects**: Clears shared session storage, broadcasts logout event

#### `refreshProfile(): Promise<void>`
Fetches or refreshes the current user's profile from the database.
- **Side Effects**: May create profile if it doesn't exist

#### `sendPasswordResetEmail(email: string): Promise<void>`
Sends a password reset email to the specified address.
- **Parameters**:
  - `email`: Email address to send reset link to

### Helper Functions

#### `setupAuthListener(): void`
Sets up Supabase auth state change listener.
- **Side Effects**: Automatically updates store state on auth events

#### `startSessionWatcher(): void`
Starts a background service to refresh tokens before expiry.
- **Side Effects**: Refreshes session every 50 minutes

### Data Types

```typescript
interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'candidate' | 'recruiter' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitializing?: boolean;
  error?: string | null;
  isAuthenticated: boolean;
  // ... methods
}
```

## Usage Guidelines

1. **State Reading**: Components should use the store's state variables to determine authentication status
2. **Navigation Control**: Navigation decisions based on auth state should be made by UI components, not the auth store
3. **Error Handling**: Always handle potential errors from async methods
4. **Session Management**: The store handles session synchronization automatically

## Version Management

### Semantic Versioning
This API follows semantic versioning:
- **Major**: Breaking changes to the API contract
- **Minor**: New features that are backward compatible
- **Patch**: Bug fixes and internal improvements

### Breaking Changes Policy
- Breaking changes will be announced at least 30 days in advance
- Migration guides will be provided for all breaking changes
- Old versions will be supported for at least 60 days after a major release

## Migration Notes
Version 1.0.0 removes navigation control from the auth store. Components must now handle their own navigation based on auth state. 