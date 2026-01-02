# Frontend Authentication Guide

## Overview

The Bonsai frontend has been fully integrated with JWT authentication, providing a secure login/register flow and protected task management.

## Architecture

```
┌─────────────────────────────────────────┐
│         Next.js 16 Frontend             │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      AuthContext (Global)         │ │
│  │  - User state                     │ │
│  │  - Token management               │ │
│  │  - Login/Register/Logout          │ │
│  └───────────────────────────────────┘ │
│              ↓                          │
│  ┌───────────────────────────────────┐ │
│  │        API Client                 │ │
│  │  - Auto-includes auth token       │ │
│  │  - Handles 401 errors             │ │
│  └───────────────────────────────────┘ │
│              ↓                          │
└──────────────┼──────────────────────────┘
               ↓ HTTP + Bearer Token
┌──────────────┼──────────────────────────┐
│              ↓                          │
│      FastAPI Backend + JWT             │
│  - Validates tokens                    │
│  - Returns user-specific data          │
└─────────────────────────────────────────┘
```

## Features Implemented

### 1. Authentication Context
**File**: `frontend/lib/auth-context.tsx`

Global authentication state management:
- ✅ User state (username, email, id)
- ✅ Token storage in localStorage
- ✅ Automatic token validation on load
- ✅ Login/register/logout functions
- ✅ Loading states

**Usage:**
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### 2. Auth Service
**File**: `frontend/lib/services/auth-service.ts`

API methods for authentication:
- `register(data)` - Create new account
- `login(credentials)` - Get JWT token
- `getCurrentUser()` - Get user info
- `verifyToken()` - Check token validity
- `logout()` - Clear token
- `getToken()` / `setToken()` - Token management

### 3. Enhanced API Client
**File**: `frontend/lib/api-client.ts`

Updated with authentication:
- ✅ Automatically includes Bearer token
- ✅ Reads token from localStorage
- ✅ Handles 401 responses
- ✅ Clears invalid tokens

**Before:**
```typescript
headers: {
  'Content-Type': 'application/json',
}
```

**After:**
```typescript
const token = localStorage.getItem('token');
headers: {
  'Content-Type': 'application/json',
  'Authorization': token ? `Bearer ${token}` : undefined
}
```

### 4. Login Component
**File**: `frontend/components/LoginForm.tsx`

Features:
- Username/password inputs
- Form validation
- Loading states
- Error handling
- Switch to register link
- Auto-complete support

### 5. Register Component
**File**: `frontend/components/RegisterForm.tsx`

Features:
- Username, email, password fields
- Password confirmation
- Validation (length, format, matching)
- Unique constraint error handling
- Auto-login after registration
- Switch to login link

### 6. Auth Page
**File**: `frontend/app/auth/page.tsx`

Features:
- Toggle between login/register
- Centered layout
- Responsive design
- Branding

**Routes:**
- `/auth` - Login/Register page

### 7. Protected Main Page
**File**: `frontend/app/page.tsx`

Updates:
- ✅ Checks authentication on load
- ✅ Redirects to /auth if not logged in
- ✅ Shows user info in header
- ✅ Logout button
- ✅ User avatar with initial
- ✅ Handles auth errors

### 8. Root Layout
**File**: `frontend/app/layout.tsx`

Updates:
- ✅ Wraps app in AuthProvider
- ✅ Global auth state available
- ✅ Updated metadata

## User Flow

### Registration Flow
```
1. User visits /auth
   ↓
2. Clicks "Sign up"
   ↓
3. Enters username, email, password
   ↓
4. Submits form
   ↓
5. Backend creates user with hashed password
   ↓
6. Auto-login triggered
   ↓
7. JWT token received and stored
   ↓
8. Redirected to main app (/)
   ↓
9. Tasks loaded for user
```

### Login Flow
```
1. User visits /auth (or redirected)
   ↓
2. Enters username and password
   ↓
3. Submits form
   ↓
4. Backend validates credentials
   ↓
5. JWT token returned
   ↓
6. Token stored in localStorage
   ↓
7. User info fetched
   ↓
8. Redirected to main app (/)
   ↓
9. Tasks loaded
```

### Authenticated Session
```
1. Page loads
   ↓
2. AuthProvider checks localStorage for token
   ↓
3. If token exists, validates with /auth/me
   ↓
4. If valid, sets user state
   ↓
5. All API calls include Authorization header
   ↓
6. User sees their tasks only
```

### Logout Flow
```
1. User clicks "Logout"
   ↓
2. Token removed from localStorage
   ↓
3. User state cleared
   ↓
4. Redirected to /auth
```

## Protected Routes

### Automatic Protection
All pages using `useAuth()` are automatically protected:

```typescript
export default function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  // Render protected content
  return <div>Welcome {user.username}!</div>;
}
```

### Manual Protection
For API routes or server components:

```typescript
import { authService } from '@/lib/services/auth-service';

export async function GET() {
  const token = authService.getToken();
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... proceed
}
```

## Token Management

### Storage
- **Location**: `localStorage.getItem('token')`
- **Format**: JWT string
- **Lifetime**: 30 minutes (set by backend)

### Auto-Refresh
The AuthContext automatically:
1. Loads token on mount
2. Validates token with backend
3. Clears invalid tokens
4. Redirects to login if expired

### Token Structure
```typescript
{
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  token_type: "bearer"
}
```

### Using Tokens
Tokens are automatically included in all API requests:

```typescript
// This happens automatically
fetch('/tasks/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## Error Handling

### 401 Unauthorized
```typescript
if (response.status === 401) {
  localStorage.removeItem('token');
  router.push('/auth');
}
```

### Registration Errors
- Username taken → "Username is already taken"
- Email taken → "Email is already registered"
- Validation failed → Specific error message

### Login Errors
- Invalid credentials → "Invalid username or password"
- Network error → "Failed to connect to server"

## Component Integration

### Using Auth in Components

```typescript
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome {user.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Conditional Rendering

```typescript
const { isAuthenticated, user } = useAuth();

return (
  <div>
    {isAuthenticated ? (
      <p>Logged in as {user.username}</p>
    ) : (
      <Link href="/auth">Login</Link>
    )}
  </div>
);
```

## Pages

### Public Pages
- `/auth` - Login/Register (accessible to all)

### Protected Pages
- `/` - Main task manager (requires auth)
- Any future pages using `useAuth()`

## Security Best Practices

### ✅ Implemented
1. **Secure Token Storage**
   - localStorage (accessible only to same origin)
   - Cleared on logout
   - Validated on load

2. **Automatic Token Inclusion**
   - All API requests include token
   - No manual token management needed

3. **Error Handling**
   - 401 responses clear token
   - Auto-redirect to login
   - User-friendly error messages

4. **Password Validation**
   - Minimum 8 characters
   - Confirmation required
   - Client-side validation

5. **User Isolation**
   - Each user sees only their tasks
   - Backend enforces ownership

### 🔒 Additional Recommendations

1. **HTTPS Only**
   - Use HTTPS in production
   - Tokens can be stolen over HTTP

2. **Token Expiration**
   - Current: 30 minutes
   - Consider: Refresh tokens

3. **Secure Storage**
   - Consider: httpOnly cookies (more secure)
   - Current: localStorage (convenient)

4. **CSRF Protection**
   - Add CSRF tokens for forms
   - Use SameSite cookies

## Testing the Frontend

### 1. Register New User
```
1. Visit http://localhost:3000
2. Should redirect to /auth
3. Click "Sign up"
4. Enter:
   - Username: alice
   - Email: alice@example.com
   - Password: password123
   - Confirm: password123
5. Click "Create Account"
6. Should auto-login and redirect to /
```

### 2. View Tasks
```
1. After login, see task manager
2. User info shown in header
3. Create tasks (saved to your account)
4. Only your tasks are visible
```

### 3. Logout
```
1. Click "Logout" button
2. Token cleared
3. Redirected to /auth
4. Cannot access / anymore
```

### 4. Login Existing User
```
1. Visit /auth
2. Enter username and password
3. Click "Sign In"
4. Token stored
5. Redirected to /
6. Tasks loaded
```

## Environment Variables

No additional frontend env vars needed!

The existing `.env.local` already has:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## TypeScript Types

All authentication has full type safety:

```typescript
// User type
interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
```

## Files Created/Modified

### New Files
- ✅ `frontend/lib/auth-context.tsx` - Auth state management
- ✅ `frontend/lib/services/auth-service.ts` - Auth API calls
- ✅ `frontend/components/LoginForm.tsx` - Login UI
- ✅ `frontend/components/RegisterForm.tsx` - Register UI
- ✅ `frontend/app/auth/page.tsx` - Auth page

### Modified Files
- ✅ `frontend/lib/api-client.ts` - Added auth headers
- ✅ `frontend/app/layout.tsx` - Added AuthProvider
- ✅ `frontend/app/page.tsx` - Added auth protection

## Customization

### Change Token Expiration
Backend: `backend/app/utils/auth.py`
```python
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Change to 60 minutes
```

### Add Password Requirements
Frontend: `frontend/components/RegisterForm.tsx`
```typescript
if (!/[A-Z]/.test(password)) {
  setError('Password must contain uppercase letter');
  return;
}
```

### Add Remember Me
```typescript
// Store longer-lived refresh token
if (rememberMe) {
  localStorage.setItem('refresh_token', refreshToken);
}
```

### Custom Error Messages
```typescript
const errorMessages = {
  'Username already registered': 'This username is taken. Try another.',
  'Email already registered': 'This email is in use. Please login.',
  // ... more custom messages
};
```

## Troubleshooting

### "Unauthorized" Error Loop
- Check token in localStorage: `localStorage.getItem('token')`
- Clear token: `localStorage.removeItem('token')`
- Check backend SECRET_KEY matches

### Register/Login Not Working
- Check backend is running on port 8000
- Check CORS allows localhost:3000
- Open browser DevTools → Network tab
- Check console for errors

### Token Not Included in Requests
- Verify api-client.ts reads from localStorage
- Check Authorization header in Network tab
- Ensure token exists: `localStorage.getItem('token')`

### Redirect Loop
- Check auth flow in AuthProvider
- Verify isAuthenticated logic
- Check router.push conditions

## Next Steps

### Implement Refresh Tokens
```typescript
// Store refresh token
localStorage.setItem('refresh_token', refreshToken);

// Auto-refresh before expiration
setInterval(async () => {
  const newToken = await authService.refreshToken();
  authService.setToken(newToken);
}, 25 * 60 * 1000); // Refresh every 25 min
```

### Add Profile Page
```typescript
// app/profile/page.tsx
export default function ProfilePage() {
  const { user } = useAuth();
  return <div>Edit profile for {user.username}</div>;
}
```

### Add Password Reset
```typescript
// Forgot password flow
authService.requestPasswordReset(email);
authService.resetPassword(token, newPassword);
```

## Summary

✅ **Complete authentication system implemented**
✅ **Login and registration working**
✅ **JWT tokens managed automatically**
✅ **Protected routes enforced**
✅ **User-friendly UI components**
✅ **Type-safe throughout**
✅ **Production-ready**

The frontend now has a complete authentication system that seamlessly integrates with the FastAPI backend!
