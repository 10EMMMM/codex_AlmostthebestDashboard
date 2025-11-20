# User Management

Complete guide to user creation, role assignment, and management features.

## Overview

The user management system allows super admins to create, update, archive, and delete users with various roles and permissions.

## User Roles

### Super Admin
- **Access**: Full system access
- **Capabilities**:
  - Create/edit/delete all users
  - Manage all requests and assignments
  - Access system configuration
  - View all analytics
- **Flag**: `is_super_admin: true` in `app_metadata`

### Account Manager
- **Access**: City-scoped request creation
- **Capabilities**:
  - Create requests for assigned cities
  - View own requests
  - Manage own city assignments
  - Archive own requests
- **Table**: `account_manager_cities`

### BDR (Business Development Representative)
- **Access**: Task execution
- **Capabilities**:
  - Complete assigned tasks
  - Update restaurant data
  - Upload documents
  - View personal KPIs
- **Table**: `request_assignments`, `restaurant_tasks`

### Team Lead
- **Access**: Team oversight
- **Capabilities**:
  - View team performance
  - Assist with task assignments
  - Monitor SLAs
- **Table**: `user_roles`

---

## Creating Users

### Via UI (`/create-user`)

1. **Navigate** to the Create User page
2. **Fill in** user details:
   - Email (required)
   - Password (required, or generate)
   - Display Name
   - Roles (select one or more)
3. **For Account Managers**: Select assigned cities
4. **Click** "Save" to create

### Via API

```typescript
const response = await fetch('/api/admin/create-user', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    roles: ['ACCOUNT_MANAGER'],
    display_name: 'John Doe',
    timezone: 'America/New_York',
    city_ids: ['city-uuid-1', 'city-uuid-2']
  })
});
```

### What Happens
1. User created in `auth.users`
2. Profile created in `public.profiles`
3. Roles assigned in `public.user_roles`
4. Cities assigned in `public.account_manager_cities` (if AM)
5. Confirmation email sent (if configured)

---

## Managing Users

### Viewing Users
Navigate to `/create-user` to see all users displayed as cards.

**Card Information:**
- Avatar (initials)
- Display name / email
- Role badges
- City assignments (for AMs)
- Quick stats (onboards, requests)

### Editing Users
Click on a user card to open the edit modal:

1. **Update** profile information
2. **Add/remove** roles
3. **Manage** city assignments (for AMs)
4. **Save** changes

### Archiving Users
Soft-delete users (can be restored):

1. Click **overflow menu** (⋯) on user card
2. Select **"Archive user"**
3. **Optionally** provide a reason
4. **Confirm** action

**What Happens:**
- User moved to `archived_users` table
- Profile data preserved
- Login disabled
- Can be restored later

### Deleting Users
Permanently remove users:

1. Click **overflow menu** (⋯) on user card
2. Select **"Delete permanently"**
3. **Provide** a reason
4. **Confirm** action (irreversible)

**Warning:** This action cannot be undone!

---

## Role Management

### Assigning Roles

**Via UI:**
1. Open user edit modal
2. Click role badges to toggle
3. Save changes

**Via API:**
```typescript
await fetch('/api/admin/assign-role', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user-uuid',
    role: 'BDR'
  })
});
```

### Removing Roles

**Via UI:**
1. Open user edit modal
2. Click active role badge to deselect
3. Save changes

**Via API:**
```typescript
await fetch('/api/admin/remove-role', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user-uuid',
    role: 'BDR'
  })
});
```

---

## City Assignments

### For Account Managers
Account Managers can only create requests for cities they're assigned to.

### Managing Assignments

**Via UI:**
1. Open AM user edit modal
2. Use city search/picker
3. Add or remove cities
4. Save changes

**Via API:**
```typescript
await fetch('/api/admin/account-manager-cities', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user-uuid',
    city_ids: ['city-1', 'city-2', 'city-3']
  })
});
```

**Note:** This replaces all existing assignments.

### Self-Service
Account Managers can manage their own city assignments without super admin intervention.

---

## Password Management

### Setting Initial Password
When creating a user, you can:
- **Enter** a custom password
- **Generate** a random secure password

### Password Reset
Users can reset their password via Supabase Auth:
1. Click "Forgot Password" on login
2. Receive reset email
3. Follow link to set new password

### Admin Password Reset
Super admins can reset user passwords:
```typescript
// Via Supabase Admin API
await supabaseAdmin.auth.admin.updateUserById(userId, {
  password: 'NewSecurePass123!'
});
```

---

## User Profile

### Profile Fields
- `display_name` - User's display name
- `full_name` - Full legal name
- `timezone` - User's timezone
- `city_id` - Home city (optional)

### Updating Profiles

**Via UI:**
1. Open user edit modal
2. Update profile fields
3. Save changes

**Via API:**
```typescript
await fetch('/api/admin/update-profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user-uuid',
    display_name: 'Jane Smith',
    timezone: 'America/Los_Angeles'
  })
});
```

---

## Audit Trail

### Archive Log
All archive/restore actions are logged in `user_archive_log`:

```sql
SELECT 
  action,
  performed_by,
  performed_at,
  reason
FROM user_archive_log
WHERE user_id = 'user-uuid'
ORDER BY performed_at DESC;
```

### Viewing Logs
Super admins can view audit trails to track:
- Who archived/restored users
- When actions occurred
- Reasons provided

---

## Best Practices

### User Creation
- ✅ Use strong passwords or generate random ones
- ✅ Assign appropriate roles based on job function
- ✅ Set timezone for accurate date/time displays
- ✅ For AMs, assign cities before they create requests

### Role Assignment
- ✅ Users can have multiple roles
- ✅ Review role combinations for conflicts
- ✅ Document why specific roles were assigned

### Archiving vs Deleting
- ✅ **Archive** when user may return (leave of absence, etc.)
- ✅ **Delete** only when permanently removing data
- ✅ Always provide a reason for audit purposes

### City Assignments
- ✅ Keep assignments up to date
- ✅ Remove cities when coverage changes
- ✅ Allow AMs to self-manage their coverage

---

## Troubleshooting

### User Can't Login
- Verify email is correct
- Check if user is archived
- Confirm password is set
- Review Supabase Auth logs

### Missing Permissions
- Verify roles are assigned in `user_roles`
- Check `is_super_admin` flag in `app_metadata`
- Ensure RLS policies allow access

### City Assignment Issues
- Confirm user has ACCOUNT_MANAGER role
- Verify cities exist in `cities` table
- Check `account_manager_cities` table

---

## Related Documentation

- [API Reference](../api-reference.md) - User management API endpoints
- [Database Schema](../database-schema.md) - User-related tables
- [Super Admin Guide](../super_admin_guide.md) - Super admin flag details
