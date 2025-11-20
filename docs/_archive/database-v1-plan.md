# Database Schema v1 (Reference)

This file documents the intent behind the SQL model that lives in [`docs/database-v1-plan.sql`](./database-v1-plan.sql). Run that SQL file to create the exact tables, triggers, and RLS scaffolding. This Markdown version keeps a human-readable overview of each area and highlights the custom logic in the background.

## 1. Domain types
- `role_type`, `request_status`, `request_type`, `restaurant_status`, and `task_status` define the enums used by users, requests, restaurants, and tasks. These are created at the top of the SQL file.

## 2. People & roles
- `public.profiles` mirrors `auth.users` with timezone, avatar, phone, and city pointers.
- `public.user_roles` keeps track of every role assignment (`ADMIN`, `BDR`, `ACCOUNT_MANAGER`, `TEAM_LEAD`).
- `public.account_manager_cities` binds each AM to their allowed cities; it is referenced by the `requests_city_assignment_fk` constraint to guarantee AMs cannot file requests for cities they do not own.
- `public.archived_users`/`public.user_archive_log` keep snapshots for compliance/audit.

## 3. Restaurants & onboarding
- `public.restaurants` is the source of truth for each onboarding, including the new `bdr_target_per_week` column (default 4) that BDRs adjust while they run the checklist.
- Contacts, notes, documents, tasks, and task assignments (`public.restaurant_contacts`, `public.restaurant_notes`, `public.restaurant_documents`, `public.restaurant_tasks`, `public.restaurant_assignments`) capture every onboarding touchpoint. Task assignments now require a `role_type`.
- History tables such as `public.restaurant_status_history` and `public.restaurant_tasks` track lifecycle changes for reporting.

## 4. Requests & fulfillment
- `public.requests` stores all Restaurant/Event/Cuisine intake rows. A `requests_city_assignment_fk` foreign key enforces that the submitting AM belongs to the chosen city.
- `public.request_assignments`, `public.request_status_history`, `public.request_notes`, `public.request_files`, `public.request_followers`, and `public.request_archive_log` record the full lifecycle, assets, and watchers for each request.
- A trigger named `assign_request_creator` automatically inserts a `public.request_assignments` row for the creator (typically the super admin) whenever a request is inserted, so the handoff always has a recorded owner.

## 5. Messaging & notifications
- `public.threads` groups conversations, `public.messages` stores threaded posts, and `public.notifications` holds per-user alerts. Messages reference threads, restaurants, and requests so the UI can display context.

## 6. Analytics & personalization
- `public.task_activity` records every completed task for KPI rollups.
- Aggregates such as `public.monthly_task_metrics`, `public.onboarding_kpis`, and `public.location_performance` are populated by the nightly cron job documented elsewhere.
- `public.dashboard_settings` stores each user’s hidden widgets/preferences.

## 7. RLS & governance
- The SQL file ends with an explicit list of `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` calls for every table that contains user-specific data: profiles, roles, cities, restaurants, requests, tasks, notes, files, messages, notifications, and archive tables.
- When you implement this in Supabase, add policies that connect `auth.uid()` plus `public.request_assignments`/`public.restaurant_assignments` to enforce the flows described in the UI checklist.

> Apply `docs/database-v1-plan.sql` via Supabase CLI/migrations, then seed `docs/seed_cities.sql` (and other CSV templates) before wiring the React pages to Supabase queries.
