# Database Guide

This guide describes the end-to-end data flow that powers Almost The Best Dashboard. Treat it as the onboarding doc for anyone wiring UI widgets into Supabase.

## Super Admin Feature Set
1. **Global user management** - Create new accounts, reset passwords, assign/remove roles, impersonate users for troubleshooting, and archive/restore/delete accounts with full audit trails. In the earliest setup you can visit `/admin/setup` (server-only) to auto-provision the canonical super admin account and confirm the database connection before the rest of the UI is live.
2. **Request oversight** - Reassign requests, merge duplicates, bulk-update statuses/deadlines, lock completed requests, and ensure SLAs are met across Restaurant/Event/Cuisine workflows.
   Every new request automatically creates a public.request_assignments row for the creating super admin so ownership is captured before BDR handoff.
3. **Onboarding controls** - Approve/reject restaurant onboarding entries, edit onboarding checklists, run CSV imports, and flag or clean up problematic data.
4. **System configuration** - Toggle feature flags, manage API keys/service accounts, schedule maintenance windows, and customize dashboard widgets/layouts for the organization.
   - Schema-wise, `public.system_settings` stores durable switches/secret blobs while `public.feature_flags` plus `public.feature_flag_targets` capture scoped toggles and overrides, keeping all writes behind super-admin RLS.
5. **Monitoring & analytics** - Access platform-wide dashboards (request volume, onboarding velocity, user activity), download reports, and configure alerts for anomalies.
6. **Messaging & notifications** - Broadcast announcements, override notification settings when critical, and review/clear sensitive message threads.
   - Templated copy, delivery transports, and city/team-specific channel overrides now live in `public.message_templates`, `public.notification_channels`, and `public.notification_channel_settings`, so every emission can be audited and routed via the same schema.

## Plain User Feature Plan
A public view of all requests (without assignment details) will be available so every user can see what is underway at a glance, while individual editing rights remain scoped by role.
Plain users encompass Account Managers (request creators tied to their cities) and BDRs (fulfillment owners on assigned tasks). Both share the baseline capabilities below in addition to their role-specific flows described later in this guide.
1. **Self-service profile & preferences** - Users can edit their own profile info (avatar, contact data, timezone) and personalize dashboard widgets, but cannot change other users or global settings.
2. **Request participation** - They edit requests assigned to them, adding notes/attachments and updating permissible fields; full reassignment or deletion remains exclusive to super admins.
3. **Assignment handling** - They view the tasks assigned to them, acknowledge or hand-off within policy limits, and mark work complete so dashboards stay accurate.
4. **Onboarding contributions** - They upload restaurant documents, notes, and status updates for records they are assigned to, while super admins still approve or archive entries.
5. **Notifications & messaging** - They receive broadcasts, configure personal notification preferences, and collaborate within request/restaurant threads they follow.
6. **Limited analytics** - They see dashboards scoped to their own work ("my requests", "my onboarding tasks"), while super admins retain organization-wide analytics.

## Role-Specific Feature Proposals (Pending Approval)
### Account Manager (request owners)
Account Managers act purely as requestors for Restaurant, Event, and Cuisine workstreams. They may edit the details of the requests they created and are the only ones allowed to archive their own open requests; other status changes stay with super admins.  They can submit requests only for the cities mapped to them in account_manager_cities. Super admins seed those rows during user creation, while AMs may add or remove their own city assignments later; they do not adjust downstream fulfillment data once a request is handed off.
1. **City-scoped intake** - Launch forms that lock the selected city to an allowed assignment and capture request_type, budgets, deadlines, contact details, and kickoff notes for the new public.requests row.
2. **Submission context** - Attach client briefs, menus, or other starter files so the request lands with assets already linked in public.request_files.
3. **City coverage self-service** - Manage their own account_manager_cities entries (add or remove cities) so intake coverage stays accurate without routing through super admins for every change.
4. **Request visibility** - Review a read-only board of the requests they opened, filtered by city or status, so they can confirm work is progressing without editing the core record.
5. **Client-facing package prep** - Generate summary bundles (PDF or email) from the captured data to share with stakeholders or confirm submission details.
6. **Notification triggers** - Once the request is created, AMs fire a templated notification to every user tied to that request (stakeholders, assigned BDRs, and subscribed followers) so everyone knows the work kicked off; the send metadata is logged alongside the request.

### BDR (execution-focused)
BDRs handle fulfillment on the tasks and requests they are assigned to via public.request_assignments and public.restaurant_tasks. RLS ensures they can update only the rows tied to their user_id while still collaborating with AMs inside each request.
1. **Assigned workboard** - Prioritized board of open assignments grouped by SLA date and request_type, fed from request_assignments plus restaurant_tasks.
2. **Task execution** - Work the public.restaurant_tasks checklist (status changes, due dates), drop supporting files/photos into public.restaurant_documents, log field notes in public.restaurant_notes, and push updates back to public.requests so the broader team sees progress.
3. **Collaboration threads** - Post updates in public.messages or public.request_notes; only the super admin, the request creator (Account Manager), and the assigned BDRs can write notes on a given request, keeping the history focused on the responsible team. Each note also triggers a lightweight notification so every user in the request stays aware of new context.
4. **Local onboarding support** - Complete city-specific data capture (site visits, compliance docs, readiness flags) directly on the restaurant-related tables so super admins can approve onboarding.
5. **BDR targets** - Each restaurant onboarding starts with a default `bdr_target_per_week` of 4 (stored on `public.restaurants`), but assigned BDRs can adjust that figure from the onboarding page to reflect their current throughput.
6. **Performance snapshots** - View personal KPIs (completed tasks, weekly onboards, SLA compliance) derived from task_activity aggregates scoped to auth.uid().
Super admins record the final owner by updating each restaurant task's assigned_to field once they confirm which BDR carried it across the finish line.
6. **KPI aggregation** - A nightly Supabase cron job aggregates public.task_activity into monthly and snapshot tables (public.monthly_task_metrics, public.onboarding_kpis, public.location_performance) so dashboard cards stay current without hitting raw activity tables at runtime. The same job also pivots activity per BDR (day/week/month completions and onboards) so personal KPIs load instantly.

## System Flow Overview
1. **Authentication** - Users sign in through Supabase Auth (Google OAuth today). Successful sessions trigger an edge function or onboarding script that inserts a row into `profiles` so the UI always has display data.
2. **Authorization** - Super admins are all-powerful...
   ... (rest of document unchanged) ...
