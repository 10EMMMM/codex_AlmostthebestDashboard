# Super Admin Guide

This document explains the `is_super_admin` flag, which is used to grant administrative privileges across the application.

## What is `is_super_admin`?

The `is_super_admin` flag is a boolean value (`true` or `false`) that determines whether a user has top-level administrative rights. Users with this flag set to `true` can access protected areas, such as the user creation page at `/admin/users`.

## Where is it Stored?

For security reasons, this flag is **not** stored in a regular database table or in the client-visible `user_metadata`.

It is stored in the `app_metadata` field of a user's record in the Supabase `auth.users` table. Data in `app_metadata` is protected and can only be read or modified from a secure, server-side environment using a Supabase Admin key. It is never exposed to the user's browser.

**Example `app_metadata` structure:**
```json
{
  "is_super_admin": true,
  "provider": "google"
}
```

## How to Set the `is_super_admin` Flag

There are two primary ways to set this flag for a user:

### 1. Using the Admin User Creation Page

The application has a built-in UI for creating new admin users.

*   **Location**: `/admin/users`
*   **Functionality**: When an existing super admin uses this page to create a new user, the secure API route at `/api/admin/create-user` is called. This server-side route uses the Supabase Admin client to create the user and automatically sets their `app_metadata` to include `"is_super_admin": true`.

### 2. Manually via Supabase Studio (for existing users)

You can manually edit an existing user's metadata in the Supabase dashboard.

1.  Navigate to your Supabase project.
2.  Go to the **Authentication** section.
3.  Find the user you want to modify and click on them.
4.  In the **App Metadata** section, add the following:
    ```json
    {
      "is_super_admin": true
    }
    ```
5.  Click **Save**.

## How it is Checked in the Code

The application uses a centralized hook to manage authentication and authorization.

*   **Hook**: `src/hooks/useAuth.tsx`

This hook fetches the currently logged-in user's data and checks their `app_metadata` to determine if they are a super admin.

**Key snippet from `useAuth.tsx`:**
```typescript
// ... inside the fetchUserAndRole function
if (user) {
  // This line securely reads the flag from app_metadata
  setIsSuperAdmin(user.app_metadata?.is_super_admin === true);
}
// ...
```

Components throughout the application, like the admin page at `src/app/admin/users/page.tsx`, then use this hook to protect routes and render admin-only UI elements.
