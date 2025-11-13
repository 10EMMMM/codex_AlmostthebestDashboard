# Authentication Guide

This document outlines key authentication features, including the centralized logout functionality.

## Logout Functionality

The logout button is a global component that is active and available on every page that uses the main `DashboardLayout`.

### Location of the Code

The logic for the logout button is centralized in the `DashboardLayout` component.

*   **File**: `src/components/dashboard-layout.tsx`

### How It Works

1.  **UI Component**: A `Button` with a `LogOut` icon is rendered in the header of the layout.
2.  **Event Handler**: The button has an `onClick` event that triggers the `handleSignOut` function within the component.
3.  **Execution**: The `handleSignOut` function performs two actions:
    *   It calls `supabase.auth.signOut()`. This is the official Supabase function to invalidate the user's current session and clear their local authentication token.
    *   After successfully signing out, it uses the Next.js `useRouter` to redirect the user to the homepage (`/`).

**Key snippet from `dashboard-layout.tsx`:**
```typescript
// ...
const supabase = getSupabaseClient();
const router = useRouter();
// ...

const handleSignOut = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

// ... in the JSX return
<Button
  // ... styling
  onClick={handleSignOut}
>
  <LogOut className="h-4 w-4" />
</Button>
// ...
```

### Future Pages

Because this logic is part of the shared `DashboardLayout`, any new page created that is wrapped with this layout will automatically inherit the active logout button without any additional setup.
