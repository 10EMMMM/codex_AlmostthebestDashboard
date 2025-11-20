# Almost The Best Dashboard - Documentation

Welcome to the Almost The Best Dashboard documentation. This guide will help you understand the project structure, features, and how to work with the codebase.

## 📚 Documentation Structure

### Core Guides
- **[Getting Started](#getting-started)** - Quick setup and first steps
- **[Architecture Overview](#architecture-overview)** - System design and data flow
- **[Development Guide](./development-guide.md)** - UI patterns, components, and best practices
- **[Database Schema](./database-schema.md)** - Complete database structure and relationships
- **[API Reference](./api-reference.md)** - API routes and authentication

### Feature Guides
- **[User Management](./features/user-management.md)** - Creating and managing users, roles, and permissions
- **[Request System](./features/request-system.md)** - Request intake, assignments, and workflows
- **[Restaurant Onboarding](./features/restaurant-onboarding.md)** - Onboarding process and BDR tasks

### Reference
- **[UI Checklist](./ui_checklist.md)** - Implementation checklist aligned with database schema
- **[Data Templates](./templates/)** - CSV templates for seeding data

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Environment variables configured (see `.env.local.example`)

### Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Navigate to `http://localhost:3000`
   - Login with your Supabase credentials

---

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts

### Key Concepts

#### 1. Authentication & Authorization
- **Supabase Auth** handles user authentication (Google OAuth)
- **Super Admin** flag stored in `app_metadata` (server-side only)
- **Role-based access** via `user_roles` table
- See [Authentication Guide](./authentication.md) for details

#### 2. User Roles
- **Super Admin**: Full system access, user management, global oversight
- **Account Manager**: Request creation, city-scoped intake
- **BDR**: Task execution, restaurant onboarding

#### 3. Data Flow
```
User Login → Supabase Auth → Profile Creation → Role Assignment → Dashboard Access
```

#### 4. Component Structure
```
src/
├── app/                    # Next.js pages (App Router)
├── components/
│   ├── layout/            # Layout components (DashboardLayout)
│   ├── features/          # Feature-specific components
│   ├── ui/                # shadcn/ui components
│   └── patterns/          # Kibo UI patterns
├── hooks/                 # Custom React hooks (useAuth, etc.)
└── lib/                   # Utilities and helpers
```

---

## Key Features

### Dashboard Layout
- **Masonry-style grid** with responsive columns
- **Dynamic widgets** loaded with `next/dynamic`
- **Consistent styling** with glassmorphism effects
- See [Dashboard Layout Guide](./dashboard_layout_guide.md)

### User Management
- Create users with roles and city assignments
- Archive/restore/delete with audit trails
- Profile management and preferences
- See [Super Admin Guide](./super_admin_guide.md)

### Request System
- City-scoped request intake
- Assignment tracking
- Status management and notifications
- See [Database Guide](./database_guide.md)

---

## Development Workflow

### Creating a New Page

1. **Create the page file**
   ```tsx
   // src/app/my-page/page.tsx
   "use client";
   
   import { DashboardLayout } from '@/components/layout/dashboard-layout';
   
   export default function MyPage() {
     return (
       <DashboardLayout title="My Page">
         <div className="dashboard-grid">
           {/* Your widgets here */}
         </div>
       </DashboardLayout>
     );
   }
   ```

2. **Add navigation** in `DashboardLayout` toolbar

3. **Follow design guidelines** (see [Design Guidelines](./design_guidelines.md))

### UI Patterns

#### Widget Card
```tsx
<div className="widget">
  <Card className="border border-white/15">
    {/* Card content */}
  </Card>
</div>
```

#### Loading State
```tsx
{loading ? (
  <Skeleton className="h-20 w-full" />
) : (
  <div>{data}</div>
)}
```

#### Toast Notifications
```tsx
toast({
  title: "Success",
  description: "Action completed",
  variant: "success"
});
```

---

## Database Schema

### Core Tables
- `profiles` - User profile data
- `user_roles` - Role assignments
- `account_manager_cities` - City assignments for AMs
- `requests` - Request records
- `request_assignments` - Request ownership
- `restaurants` - Restaurant data
- `restaurant_tasks` - BDR tasks

See [Database Schema](./database-schema.md) for complete details.

---

## API Routes

### Admin Routes
- `POST /api/admin/create-user` - Create new user
- `POST /api/admin/archive-user` - Archive user
- `POST /api/admin/delete-user` - Delete user permanently
- `GET /api/admin/get-users` - List all users

### Authentication
All admin routes require:
- Valid Supabase session
- `is_super_admin: true` in `app_metadata`

See [API Reference](./api-reference.md) for complete documentation.

---

## Troubleshooting

### Build Errors
- Check that all imports use correct paths
- Ensure `tsconfig.json` excludes archived files
- Run `npm run build` to verify

### Authentication Issues
- Verify `.env.local` has correct Supabase credentials
- Check `app_metadata` for super admin flag
- Clear browser cache and re-login

### Database Issues
- Verify RLS policies are enabled
- Check that user has required roles
- Review Supabase logs for errors

---

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Add JSDoc comments for complex functions
- Run `npm run lint` before committing

### Documentation
- Update relevant docs when adding features
- Include code examples
- Keep README.md up to date

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## License

[Your License Here]
