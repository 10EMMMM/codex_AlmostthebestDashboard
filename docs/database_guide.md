# Database Guide

This guide describes the end-to-end data flow that powers Almost The Best Dashboard. Treat it as the onboarding doc for anyone wiring UI widgets into Supabase.

## Super Admin Feature Set
1. **Global user management** - Create new accounts, reset passwords, assign/remove roles, impersonate users for troubleshooting, and archive/restore/delete accounts with full audit trails.
2. **Request oversight** - Reassign requests, merge duplicates, bulk-update statuses/deadlines, lock completed requests, and ensure SLAs are met across Restaurant/Event/Cuisine workflows.
3. **Onboarding controls** - Approve/reject restaurant onboarding entries, edit onboarding checklists, run CSV imports, and flag or clean up problematic data.
4. **System configuration** - Toggle feature flags, manage API keys/service accounts, schedule maintenance windows, and customize dashboard widgets/layouts for the organization.
5. **Monitoring & analytics** - Access platform-wide dashboards (request volume, onboarding velocity, user activity), download reports, and configure alerts for anomalies.
6. **Messaging & notifications** - Broadcast announcements, override notification settings when critical, and review/clear sensitive message threads.

## Plain User Feature Plan
1. **Self-service profile & preferences** - Users can edit their own profile info (avatar, contact data, timezone) and personalize dashboard widgets, but cannot change other users or global settings.
2. **Request participation** - They edit requests assigned to them, adding notes/attachments and updating permissible fields; full reassignment or deletion remains exclusive to super admins.
3. **Assignment handling** - They view the tasks assigned to them, acknowledge or hand-off within policy limits, and mark work complete so dashboards stay accurate.
4. **Onboarding contributions** - They upload restaurant documents, notes, and status updates for records they are assigned to, while super admins still approve or archive entries.
5. **Notifications & messaging** - They receive broadcasts, configure personal notification preferences, and collaborate within request/restaurant threads they follow.
6. **Limited analytics** - They see dashboards scoped to their own work ("my requests", "my onboarding tasks"), while super admins retain organization-wide analytics.

## Role-Specific Feature Proposals (Pending Approval)
### Account Manager (request owners)
1. **Request creation & intake** - Open new Restaurant/Event/Cuisine requests, capture requester info, deadlines, budgets, and initial notes/files.
2. **Client communication log** - Track meetings/calls tied to each request with follow-up tasks and decisions.
3. **Assignment orchestration** - Add/remove BDRs or teammates as assignees, tag stakeholders, and set priority/SLAs.
4. **Status stewardship** - Move requests through lifecycle stages, approve deliverables, and escalate when deadlines slip.
5. **Portfolio dashboard** - Monitor “My Accounts” metrics: open requests per client, onboarding progress, post-launch health.
6. **Document/package library** - Maintain client-facing assets (menus, contracts) with latest approved versions.
7. **Client notifications** - Send templated updates to clients once milestones are hit (emails/SMS) using the messaging system.

### BDR (execution-focused)
1. **Assigned workboard** - View all assigned requests/tasks sorted by deadline/SLA.
2. **Task execution** - Update checklists, log outreach attempts, attach field reports/photos.
3. **Collaboration threads** - Comment on requests, @-mention AMs, raise blockers, manage thread subscriptions.
4. **Local onboarding support** - Fill restaurant details, upload documents, schedule site visits, flag readiness for approval.
5. **Performance snapshots** - Personal KPIs (tasks completed, onboards this week, SLA compliance) without org-wide data.
6. **Escalation tools** - Submit “needs attention” flags or reassign suggestions when bandwidth is exceeded.

## System Flow Overview
1. **Authentication** - Users sign in through Supabase Auth (Google OAuth today). Successful sessions trigger an edge function or onboarding script that inserts a row into `profiles` so the UI always has display data.
2. **Authorization** - Super admins are all-powerful...
   ... (rest of document unchanged) ...
