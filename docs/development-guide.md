# Development Guide

This guide covers UI patterns, component architecture, and best practices for developing features in Almost The Best Dashboard.

## Table of Contents
- [Dashboard Shell & Layout](#dashboard-shell--layout)
- [Widget Styling](#widget-styling)
- [Component Patterns](#component-patterns)
- [CRUD Interactions](#crud-interactions)
- [Authentication](#authentication)
- [Best Practices](#best-practices)

---

## Dashboard Shell & Layout

### Main Card Structure
All dashboard pages use a consistent glassmorphism card design:

```tsx
<div className="w-[80vw] h-[80vh] rounded-[12px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
  {/* Content */}
</div>
```

**Key Properties:**
- `overflow-visible` - Prevents tooltip clipping
- `rounded-[12px]` - Consistent border radius
- `backdrop-blur-xl` - Glassmorphism effect

### Toolbar/Menu
Slim macOS-style navigation bar:

```tsx
<div className="bg-white/10 border-b border-white/10 rounded-t-[12px]">
  {/* Traffic light buttons + navigation icons */}
</div>
```

**Navigation Rule:** Every new page MUST add a corresponding menu icon linking to that route. Only functional pages should appear in the toolbar.

### Page Wordmark
Every page renders a fixed title that stays visible while scrolling:

```tsx
<div className="pointer-events-none fixed left-4 bottom-0 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 opacity-50">
  Dashboard
</div>
```

Adjust label, position, and size per page, keeping opacity subtle (`text-white/20-35`).

---

## Masonry Grid Layout

### The Grid Container
Foundation using CSS `column-count` for automatic multi-column arrangement:

```tsx
<div className="dashboard-grid">
  {/* All widgets go here */}
</div>
```

**Responsive Behavior:**
- Mobile: 1 column
- Tablet: 2 columns  
- Desktop: 3 columns

### Widget Wrapper
Each card MUST be wrapped to prevent column breaks:

```tsx
<div className="widget">
  <Card>
    {/* Card content */}
  </Card>
</div>
```

Uses `break-inside: avoid` to keep cards intact.

### Dynamic Loading
For best performance and staggered loading:

```tsx
import dynamic from 'next/dynamic';

const MyWidget = dynamic(() => Promise.resolve(() => (
  <div className="widget">
    <Card>
      {/* Content */}
    </Card>
  </div>
)), { ssr: false });
```

### Complete Example

```tsx
"use client";

import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

const UserListCard = dynamic(() => Promise.resolve(({ users }) => (
  <div className="widget">
    <Card>
      {/* User list */}
    </Card>
  </div>
)), { ssr: false });

const StatsCard = dynamic(() => Promise.resolve(() => (
  <div className="widget">
    <Card>
      {/* Stats */}
    </Card>
  </div>
)), { ssr: false });

export default function UsersPage() {
  return (
    <DashboardLayout title="Users">
      <div className="dashboard-grid">
        <UserListCard users={users} />
        <StatsCard />
      </div>
    </DashboardLayout>
  );
}
```

---

## Widget Styling

### Card Border
All widgets use consistent border styling:

```tsx
<Card className="border border-white/15">
  {/* Content */}
</Card>
```

### Greeting Card Pattern
Random gradient background with centered content:

```tsx
<Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
  <div className="text-center">
    <h2 className="text-2xl font-bold">{userName}</h2>
    <p className="truncate">{message}</p>
  </div>
</Card>
```

User name priority: `full_name` → `display_name` → `email`

### Admin Highlight Card
Blue gradient for admin-specific widgets:

```tsx
<Card className="bg-gradient-to-br from-blue-500 to-cyan-500">
  {/* Admin content */}
</Card>
```

---

## Component Patterns

### Loading States
Show skeleton placeholders while data loads:

```tsx
{loading ? (
  <div className="space-y-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ))}
  </div>
) : (
  <div>{data}</div>
)}
```

### Toast Notifications
Consistent feedback for user actions:

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success
toast({
  title: "Success",
  description: "User created successfully",
  variant: "success"
});

// Error
toast({
  title: "Error",
  description: "Failed to save changes",
  variant: "destructive"
});

// Warning
toast({
  title: "Warning",
  description: "Session will expire soon",
  variant: "warning"
});

// Info
toast({
  title: "Info",
  description: "New features available",
  variant: "info"
});
```

### Modal Dialogs
macOS-style rounded modals:

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="rounded-[24px] backdrop-blur-xl">
    <DialogHeader>
      <DialogTitle>Edit User</DialogTitle>
    </DialogHeader>
    {/* Form content */}
  </DialogContent>
</Dialog>
```

---

## CRUD Interactions

### Card Grid UX
Present records as dashboard widgets with overflow menus:

```tsx
<div className="dashboard-grid">
  {users.map(user => (
    <div key={user.id} className="widget">
      <Card 
        className="cursor-pointer hover:border-primary/40"
        onClick={() => handleEdit(user)}
      >
        {/* User info */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleArchive(user)}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-rose-600"
              onClick={() => handleDelete(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    </div>
  ))}
</div>
```

### Destructive Actions
Always confirm before destructive operations:

```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the user.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirm}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Data Refresh
Re-fetch after mutations to stay in sync:

```tsx
const handleCreate = async (data) => {
  try {
    await createUser(data);
    toast({ title: "Success", variant: "success" });
    await loadUsers(); // Re-fetch to sync with database
  } catch (error) {
    toast({ 
      title: "Error", 
      description: error.message,
      variant: "destructive" 
    });
  }
};
```

---

## Authentication

### Logout Functionality
Centralized in `DashboardLayout`:

```tsx
const handleSignOut = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

<Button onClick={handleSignOut}>
  <LogOut className="h-4 w-4" />
</Button>
```

**Location:** `src/components/layout/dashboard-layout.tsx`

Any page using `DashboardLayout` automatically inherits the logout button.

### Protected Routes
Use `useAuth` hook for authorization:

```tsx
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const { user, isSuperAdmin, loading } = useAuth();

  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/" />;
  if (!isSuperAdmin) return <ErrorSplashScreen message="Access denied" />;

  return <div>Admin content</div>;
}
```

### RLS Awareness
All CRUD calls include user's access token:

```tsx
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch('/api/admin/create-user', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify(userData)
});
```

Server routes enforce super admin checks before mutations.

---

## Best Practices

### Creating New Pages

1. **Wrap in DashboardLayout**
   ```tsx
   <DashboardLayout title="Page Title">
     {/* Content */}
   </DashboardLayout>
   ```

2. **Add page wordmark** for visual consistency

3. **Use dashboard-grid** for widget layout

4. **Add toolbar icon** for navigation

5. **Follow gradient patterns** for highlight cards

### City Assignment Support
For Account Manager features:

- Support selecting multiple cities
- Show clear UI for managing coverage list
- Validate against `account_manager_cities` table

### Scroll Behavior
- Let main card handle vertical scrolling (`overflow-y-auto`)
- Avoid nested scroll areas unless intentionally needed
- Keep fixed elements (wordmark, toolbar) outside scroll container

### Performance
- Use `next/dynamic` for widgets
- Implement loading skeletons
- Debounce search inputs
- Paginate large lists

### Accessibility
- Include `aria-label` for icon buttons
- Use semantic HTML elements
- Ensure keyboard navigation works
- Maintain sufficient color contrast

---

## Code Examples

### Complete Page Template

```tsx
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const DataCard = dynamic(() => Promise.resolve(({ data }) => (
  <div className="widget">
    <Card className="border border-white/15 p-6">
      <h3 className="text-lg font-semibold mb-4">Data</h3>
      {/* Render data */}
    </Card>
  </div>
)), { ssr: false });

export default function MyPage() {
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch data
      setData(result);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Page">
      {/* Page wordmark */}
      <div className="pointer-events-none fixed left-4 bottom-0 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 opacity-50">
        My Page
      </div>

      {/* Content */}
      <div className="dashboard-grid">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataCard data={data} />
        )}
      </div>
    </DashboardLayout>
  );
}
```

---

## Related Documentation

- [Database Schema](./database-schema.md) - Table structures and relationships
- [API Reference](./api-reference.md) - API routes and authentication
- [UI Checklist](./ui_checklist.md) - Implementation checklist
