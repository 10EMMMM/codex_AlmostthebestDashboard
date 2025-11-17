# Database Summary

## Core Data Model
- People & roles: `public.profiles`, `public.user_roles`, and `public.account_manager_cities` track every person, their role, and for Account Managers the cities they are allowed to cover. Teams, membership tables, and archive logs keep historical records intact.
- Restaurants & onboarding: `public.cities`, `public.cuisines`, and the restaurant tables (contacts, tasks, documents, notes) represent onboarding work plus supporting documents and readiness checkpoints.
- Requests & fulfillment: `public.requests` anchors each Restaurant/Event/Cuisine intake. Assignments, status history, notes, files, and archive tables manage ownership, lifecycle changes, and compliance snapshots.
- Collaboration & communications: `public.messages`, `public.request_notes`, and `public.notifications` keep Account Managers, BDRs, and super admins aligned without leaving the platform.
- Analytics & personalization: `public.task_activity`, KPI tables, and `public.dashboard_settings` support dashboards ranging from "my work" to organization-wide views.

## End-to-End Flow
0. Read-only request index shows every request without assignment data so all users know what's in flight.
1. Supabase Auth signs users in, triggers profile hydration, and enforces RLS so each user touches only their own rows.
2. Super admins assign Account Managers to cities via `public.account_manager_cities`, enabling city-scoped request intake.
3. Account Managers submit Restaurant/Event/Cuisine requests with client context and attachments, scoped to one of their cities, and the system automatically assigns the creating super admin via `public.request_assignments` so there is always an initial owner.
4. Operations/Super admins assign BDRs and teams through the assignment tables. BDRs execute tasks, upload documents/photos, update request statuses, and the super admin records who finished each restaurant task by setting its `assigned_to` field before onboarding is marked complete.
5. Messaging, notes, and notifications keep everyone informed while audit tables capture archives and lifecycle events; every note also fires a notification so the people tied to a request stay aligned.
6. Task activity rolls into KPI tables via a nightly Supabase cron job (including day/week/month rollups per BDR) so dashboards and personal scoreboards stay current.

## Role Capabilities
- **Super admins**: full user lifecycle control, city assignments, request oversight, onboarding approvals, messaging, analytics, and future system configuration.
- **Account Managers** (plain users): manage their city list, create city-scoped requests, edit their own request details, archive their open requests when needed, attach client packages, trigger request-notification templates to every involved user right after creation, monitor submissions, and send acknowledgments.
- **BDRs** (plain users): work assigned requests/tasks via prioritized boards, update checklists in `public.restaurant_tasks`, upload documents/photos to `public.restaurant_documents`, log notes in `public.restaurant_notes` (each note triggers a notification to super admins, the request creator, and assignees), adjust the restaurant’s `bdr_target_per_week` (default 4) as needed, collaborate in request threads (only with super admins and the request creator), capture onboarding data, and review personal KPIs.

Pending enhancements include a system-configuration table for feature flags/API keys and optional escalation logging once those workflows are approved.
