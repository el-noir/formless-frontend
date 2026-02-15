# Zustand State Management Implementation

## Overview
This project uses [Zustand](https://github.com/pmndrs/zustand) for centralized state management. The implementation is designed to be extensible and scalable for future features.

## Architecture

### Store Structure
```
src/stores/
├── index.ts           # Central export for all stores
└── authStore.ts       # Authentication state management
```

### Auth Store Features
- **Persistent State**: Uses `localStorage` via Zustand's persist middleware
- **Automatic Rehydration**: State is restored on app load
- **Reactive Updates**: All components automatically re-render when state changes
- **Type-Safe**: Full TypeScript support

## State Management

### Auth Store (`authStore.ts`)

#### State Properties
```typescript
{
  user: User | null                    // Current user data
  accessToken: string | null           // JWT access token
  refreshToken: string | null          // JWT refresh token
  isAuthenticated: boolean              // Authentication status
  isLoading: boolean                    // Rehydration loading state
}
```

#### Actions
- `setAuth(user, tokens)` - Set complete auth data (used on login/register)
- `updateUser(userData)` - Update user information partially
- `setTokens(tokens)` - Update tokens (for refresh flows)
- `clearAuth()` - Clear all auth state (logout)
- `setLoading(loading)` - Control loading state
- `initialize()` - Initialize auth state from storage

## Usage Examples

### 1. Using Auth Store in Components

```typescript
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.firstName}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### 2. Updating Auth State

```typescript
// Login
const response = await loginUser(credentials);
useAuthStore.getState().setAuth(response.user, {
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
});

// Logout
useAuthStore.getState().clearAuth();

// Update user profile
useAuthStore.getState().updateUser({ firstName: 'John' });
```

### 3. Accessing Store Outside Components

```typescript
// In API functions or utilities
import { useAuthStore } from '@/stores/authStore';

function getToken() {
  return useAuthStore.getState().accessToken;
}

function isUserAdmin() {
  const user = useAuthStore.getState().user;
  return user?.role === 'admin';
}
```

## Authentication Flow

### 1. Registration/Login
```
User submits form → API call → Success → setAuth() → Redirect to dashboard
                                      ↓
                         Store updates → All components re-render
```

### 2. Page Load
```
App loads → Store rehydrates from localStorage → isLoading: false → Components render
```

### 3. Logout
```
User clicks logout → clearAuth() → Store clears → Redirect to home
                                 ↓
                    localStorage cleared → All components update
```

## Protected Routes

### Using `useAuth` Hook
Redirects authenticated users away from auth pages:
```typescript
function SignIn() {
  const { isLoading } = useAuth('/dashboard');
  
  if (isLoading) return <Loading />;
  // Regular sign-in form
}
```

### Using `useRequireAuth` Hook
Protects routes by redirecting unauthenticated users:
```typescript
function Dashboard() {
  const { isLoading } = useRequireAuth('/sign-in');
  
  if (isLoading) return <Loading />;
  // Protected dashboard content
}
```

## Extending the Store

### Adding New Stores

1. Create a new store file in `src/stores/`:
```typescript
// src/stores/formStore.ts
import { create } from 'zustand';

interface FormState {
  forms: Form[];
  currentForm: Form | null;
  addForm: (form: Form) => void;
  deleteForm: (id: string) => void;
}

export const useFormStore = create<FormState>((set) => ({
  forms: [],
  currentForm: null,
  addForm: (form) => set((state) => ({ forms: [...state.forms, form] })),
  deleteForm: (id) => set((state) => ({ 
    forms: state.forms.filter(f => f.id !== id) 
  })),
}));
```

2. Export from `src/stores/index.ts`:
```typescript
export { useAuthStore } from './authStore';
export { useFormStore } from './formStore';
```

3. Use in components:
```typescript
import { useFormStore } from '@/stores';

function FormList() {
  const { forms, addForm } = useFormStore();
  // Component logic
}
```

## Best Practices

### 1. Keep Actions in the Store
```typescript
// ✅ Good - Action in store
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// ❌ Bad - Logic outside store
function MyComponent() {
  const [user, setUser] = useState(null);
  // Manual state management
}
```

### 2. Use Selectors for Performance
```typescript
// ✅ Good - Only re-renders when user.name changes
const userName = useAuthStore((state) => state.user?.firstName);

// ❌ Less optimal - Re-renders on any auth state change
const { user } = useAuthStore();
const userName = user?.firstName;
```

### 3. Persist Only What's Needed
```typescript
partialize: (state) => ({
  user: state.user,
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  // Don't persist temporary UI state
})
```

## Migration Benefits

### Before (localStorage directly)
- ❌ No reactivity - components don't auto-update
- ❌ Repetitive code - each component checks localStorage
- ❌ Manual sync - need to manually update UI after changes
- ❌ Hard to test - localStorage mocking required

### After (Zustand)
- ✅ Automatic reactivity - all components update instantly
- ✅ Centralized logic - single source of truth
- ✅ Easy testing - mock store instead of localStorage
- ✅ Better DX - TypeScript autocompletion and type safety
- ✅ Extensible - easy to add new stores for forms, UI state, etc.

## Future Store Ideas

As the application grows, consider adding:
- **`useFormStore`** - Form creation, editing, templates
- **`useUIStore`** - Theme, sidebar state, notifications
- **`useUserPreferencesStore`** - User settings, preferences
- **`useAnalyticsStore`** - Usage tracking, metrics
- **`useCollaborationStore`** - Real-time collaboration state

## Resources
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
