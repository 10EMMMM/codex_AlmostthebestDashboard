# Database Schema

Complete database structure and relationships for Almost The Best Dashboard.

## Overview

The database uses PostgreSQL (via Supabase) with Row Level Security (RLS) policies to enforce access control.

### Core Principles
- **RLS Enforcement**: All tables use RLS policies
- **Audit Trails**: Archive tables track deletions
- **Relationships**: Foreign keys maintain data integrity
- **Aggregations**: Nightly cron jobs for KPI tables

---

## Authentication & Users

### `auth.users` (Supabase managed)
Core authentication table.

**Key Fields:**
- `id` (uuid, PK)
- `email` (text)
- `app_metadata` (jsonb) - Contains `is_super_admin` flag
- `user_metadata` (jsonb) - Client-visible metadata

**Security:** Only accessible via Admin API

### `public.profiles`
User profile data.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | uuid (PK, FK) | References `auth.users.id` |
| `display_name` | text | User's display name |
| `full_name` | text | Full legal name |
| `timezone` | text | User's timezone |
| `city_id` | uuid (FK) | References `cities.id` |
| `created_at` | timestamp | Profile creation time |
| `updated_at` | timestamp | Last update time |

**RLS:** Users can read their own profile; super admins can read/write all.

### `public.user_roles`
Role assignments for users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `user_id` | uuid (FK) | References `auth.users.id` |
| `role` | text | Role name (ACCOUNT_MANAGER, BDR, TEAM_LEAD) |
| `assigned_by` | uuid (FK) | Who assigned the role |
| `assigned_at` | timestamp | When role was assigned |

**RLS:** Super admins only

---

## Cities & Locations

### `public.cities`
Available cities for operations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `name` | text | City name |
| `state_code` | text | State/province code |
| `country_code` | text | Country code |
| `is_active` | boolean | Whether city is active |

**RLS:** Read-only for all authenticated users

### `public.account_manager_cities`
City assignments for Account Managers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `user_id` | uuid (FK) | References `auth.users.id` |
| `city_id` | uuid (FK) | References `cities.id` |
| `assigned_at` | timestamp | Assignment time |

**RLS:** AMs can manage their own assignments; super admins can manage all

**Constraint:** `requests_city_assignment_fk` ensures AMs can only create requests for assigned cities

---

## Requests & Assignments

### `public.requests`
Core request records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `request_type` | text | RESTAURANT, EVENT, or CUISINE |
| `title` | text | Request title |
| `description` | text | Detailed description |
| `city_id` | uuid (FK) | References `cities.id` |
| `budget` | numeric | Budget amount |
| `deadline` | date | Due date |
| `status` | text | Current status |
| `created_by` | uuid (FK) | References `auth.users.id` |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

**RLS:** 
- AMs can create/read requests for their cities
- BDRs can read assigned requests
- Super admins have full access

### `public.request_assignments`
Request ownership tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `request_id` | uuid (FK) | References `requests.id` |
| `user_id` | uuid (FK) | References `auth.users.id` |
| `role` | text | Assignment role |
| `assigned_at` | timestamp | Assignment time |
| `assigned_by` | uuid (FK) | Who made the assignment |

**RLS:** Users can read their assignments; super admins can manage all

### `public.request_files`
File attachments for requests.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `request_id` | uuid (FK) | References `requests.id` |
| `file_url` | text | Storage URL |
| `file_name` | text | Original filename |
| `file_type` | text | MIME type |
| `uploaded_by` | uuid (FK) | References `auth.users.id` |
| `uploaded_at` | timestamp | Upload time |

---

## Restaurants & Tasks

### `public.restaurants`
Restaurant onboarding records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `name` | text | Restaurant name |
| `city_id` | uuid (FK) | References `cities.id` |
| `status` | text | Onboarding status |
| `bdr_target_per_week` | integer | Weekly target (default: 4) |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

**RLS:** BDRs can read/update assigned restaurants; super admins have full access

### `public.restaurant_tasks`
BDR task checklist.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `restaurant_id` | uuid (FK) | References `restaurants.id` |
| `task_name` | text | Task description |
| `status` | text | PENDING, IN_PROGRESS, COMPLETED |
| `due_date` | date | Task deadline |
| `assigned_to` | uuid (FK) | References `auth.users.id` |
| `completed_at` | timestamp | Completion time |

**RLS:** Assigned BDRs can update; super admins can manage all

### `public.restaurant_documents`
Supporting documents for restaurants.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `restaurant_id` | uuid (FK) | References `restaurants.id` |
| `document_url` | text | Storage URL |
| `document_type` | text | Document category |
| `uploaded_by` | uuid (FK) | References `auth.users.id` |
| `uploaded_at` | timestamp | Upload time |

### `public.restaurant_notes`
Notes and updates on restaurants.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `restaurant_id` | uuid (FK) | References `restaurants.id` |
| `note_text` | text | Note content |
| `created_by` | uuid (FK) | References `auth.users.id` |
| `created_at` | timestamp | Creation time |

**Trigger:** Automatically sends notifications to request team members

---

## Messaging & Notifications

### `public.threads`
Message thread containers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `subject` | text | Thread subject |
| `created_by` | uuid (FK) | References `auth.users.id` |
| `created_at` | timestamp | Creation time |

### `public.messages`
Individual messages in threads.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `thread_id` | uuid (FK) | References `threads.id` |
| `sender_id` | uuid (FK) | References `auth.users.id` |
| `message_text` | text | Message content |
| `sent_at` | timestamp | Send time |

### `public.notifications`
User notifications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `user_id` | uuid (FK) | References `auth.users.id` |
| `notification_type` | text | Notification category |
| `title` | text | Notification title |
| `message` | text | Notification content |
| `read_at` | timestamp | When read (null if unread) |
| `created_at` | timestamp | Creation time |

**RLS:** Users can read their own notifications

---

## Analytics & KPIs

### `public.task_activity`
Raw activity log for tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `user_id` | uuid (FK) | References `auth.users.id` |
| `task_id` | uuid (FK) | References `restaurant_tasks.id` |
| `activity_type` | text | Action performed |
| `activity_date` | date | Activity date |
| `created_at` | timestamp | Log time |

### `public.monthly_task_metrics`
Aggregated monthly metrics (populated by cron job).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `user_id` | uuid (FK) | References `auth.users.id` |
| `month` | date | Month (first day) |
| `tasks_completed` | integer | Total completed tasks |
| `avg_completion_time` | interval | Average time to complete |

### `public.onboarding_kpis`
Onboarding performance metrics (populated by cron job).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `user_id` | uuid (FK) | References `auth.users.id` |
| `period` | text | DAY, WEEK, or MONTH |
| `period_start` | date | Period start date |
| `onboards_completed` | integer | Completed onboardings |
| `target_met` | boolean | Whether target was met |

### `public.location_performance`
City-level performance metrics (populated by cron job).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `city_id` | uuid (FK) | References `cities.id` |
| `month` | date | Month (first day) |
| `total_requests` | integer | Requests for city |
| `completed_requests` | integer | Completed requests |
| `avg_completion_days` | numeric | Average days to complete |

---

## Archive Tables

### `public.archived_users`
Soft-deleted user records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `original_user_id` | uuid | Original `auth.users.id` |
| `email` | text | User's email |
| `profile_data` | jsonb | Snapshot of profile |
| `archived_by` | uuid (FK) | Who archived the user |
| `archived_at` | timestamp | Archive time |
| `archive_reason` | text | Reason for archiving |

**RLS:** Super admins only

### `public.user_archive_log`
Audit trail for user archiving/restoration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `user_id` | uuid | Affected user |
| `action` | text | ARCHIVE or RESTORE |
| `performed_by` | uuid (FK) | Who performed action |
| `performed_at` | timestamp | Action time |
| `reason` | text | Reason for action |

**RLS:** Super admins only

---

## System Configuration

### `public.system_settings`
Global configuration key-value store.

| Column | Type | Description |
|--------|------|-------------|
| `key` | text (PK) | Setting key |
| `value` | jsonb | Setting value |
| `updated_by` | uuid (FK) | Last updater |
| `updated_at` | timestamp | Last update time |

**RLS:** Super admins only

### `public.feature_flags`
Feature toggle definitions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `flag_name` | text | Feature flag name |
| `is_enabled` | boolean | Global enable/disable |
| `description` | text | Flag description |

**RLS:** Super admins only

### `public.feature_flag_targets`
User/role-specific feature overrides.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique identifier |
| `flag_id` | uuid (FK) | References `feature_flags.id` |
| `target_type` | text | USER or ROLE |
| `target_id` | text | User ID or role name |
| `is_enabled` | boolean | Override value |

**RLS:** Super admins only

---

## Relationships Diagram

```
auth.users
├── profiles (1:1)
├── user_roles (1:N)
├── account_manager_cities (1:N)
├── requests (1:N as creator)
├── request_assignments (1:N)
└── task_activity (1:N)

cities
├── profiles (1:N)
├── account_manager_cities (1:N)
├── requests (1:N)
├── restaurants (1:N)
└── location_performance (1:N)

requests
├── request_assignments (1:N)
├── request_files (1:N)
└── restaurant_tasks (1:N via restaurant)

restaurants
├── restaurant_tasks (1:N)
├── restaurant_documents (1:N)
└── restaurant_notes (1:N)
```

---

## Seeding Data

### CSV Templates
Located in `docs/templates/`:
- `auth_users.csv` - Sample users
- `profiles.csv` - User profiles
- `account_manager_cities.csv` - City assignments
- `requests.csv` - Sample requests
- `request_assignments.csv` - Request ownership

### SQL Seeds
- `docs/seed_cities.sql` - US cities data
- `docs/generated_seed.sql` - Generated test data

### Usage
```bash
# Import cities
psql -h [host] -U [user] -d [database] -f docs/seed_cities.sql

# Import test data
psql -h [host] -U [user] -d [database] -f docs/generated_seed.sql
```

---

## Related Documentation

- [Development Guide](./development-guide.md) - UI patterns and components
- [API Reference](./api-reference.md) - API routes
- [Database Guide](./database_guide.md) - Detailed data flow documentation
