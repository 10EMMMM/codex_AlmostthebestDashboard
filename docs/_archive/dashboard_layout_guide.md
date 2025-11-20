# Dashboard Layout Guide

This document explains how to use the dynamic, multi-column "Masonry-style" card layout that is featured on the main dashboard. This layout is ideal for displaying multiple pieces of information in a visually appealing and responsive way.

## Core Concepts

The layout is achieved through a combination of a CSS grid container, wrapper classes for the cards, and dynamic component loading.

### 1. The Grid Container (`dashboard-grid`)

The foundation of the layout is a `div` with the `dashboard-grid` class. This class, defined in `src/app/globals.css`, uses the `column-count` CSS property to automatically arrange its direct children into columns.

- **Responsiveness**: The number of columns automatically adjusts based on screen size (1 for mobile, 2 for tablet, 3 for desktop).
- **Usage**:
  ```tsx
  <div className="dashboard-grid">
    {/* All your cards (widgets) go here */}
  </div>
  ```

### 2. The Widget Wrapper (`widget`)

Each individual card or component that you want to place on the grid **must** be wrapped in a `div` with the `widget` class.

- **Functionality**: This class uses `break-inside: avoid;` to ensure that a single card is never split across two columns.
- **Usage**:
  ```tsx
s
  <div className="widget">
    <Card>
      {/* Card content */}
    </Card>
  </div>
  ```

### 3. Dynamic Loading (`next/dynamic`)

For the best performance and to achieve the staggered loading effect, each widget should be loaded as a dynamic component with Server-Side Rendering (SSR) disabled.

- **Implementation**: Use `next/dynamic` to import your component.
- **Usage**:
  ```tsx
  import dynamic from 'next/dynamic';

  const MyAwesomeWidget = dynamic(() => Promise.resolve(() => (
    <div className="widget">
      <Card>
        {/* ... */}
      </Card>
    </div>
  )), { ssr: false });
  ```

## Example Implementation

Here is a complete example from the `/admin/users` page, which displays a user list and a placeholder widget side-by-side.

**File**: `src/app/admin/users/page.tsx`

```tsx
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/components/dashboard-layout';
// ... other imports

// 1. Define the UserListCard as a dynamic component
const UserListCard = dynamic(() => Promise.resolve(({ users, usersLoading }) => (
  <div className="widget">
    <Card>
      {/* ... Table component to display users */}
    </Card>
  </div>
)), { ssr: false });

// 2. Define another widget (optional)
const PlaceholderWidget = dynamic(() => Promise.resolve(() => (
    <div className="widget">
        <Card>
            {/* ... */}
        </Card>
    </div>
)), { ssr: false });


export default function AdminUsersPage() {
  // ... state and data fetching logic

  return (
    <DashboardLayout title="Admin - Manage Users">
      {/* 3. Use the dashboard-grid container */}
      <div className="dashboard-grid">
        {/* 4. Render the dynamic widgets */}
        <UserListCard users={users} usersLoading={usersLoading} />
        <PlaceholderWidget />
      </div>
    </DashboardLayout>
  );
}
```

By following these steps, you can easily create new pages that share the same professional and responsive layout as the main dashboard.
