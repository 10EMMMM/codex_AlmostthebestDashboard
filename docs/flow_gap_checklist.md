# Flow Gap Checklist

- [x] **Account Manager city seeding**
  - Notes: documented in `docs/database_guide.md` (Account Manager section) that super admins seed at least one city and AMs can edit their list during onboarding.

- [x] **City validation on request intake**
  - Notes: `public.requests` now enforces `(requester_id, city_id)` via the `requests_city_assignment_fk` foreign key to `public.account_manager_cities`.

- [x] **Assignments vs tasks consistency**
  - Notes: tasks still default to super admins, but the workflow now requires them to set `public.restaurant_tasks.assigned_to` to the BDR who finished the work before onboarding completes, so ownership stays accurate.

- [x] **Client notification templates**
  - Notes: `docs/database-v1-plan.sql` now defines `public.message_templates` alongside `public.notification_channels` and `public.notification_channel_settings` so templated content plus delivery configs are captured in schema (RLS keeps editing scoped to super admins).

- [x] **System configuration storage**
  - Notes: the plan now includes `public.system_settings`, `public.feature_flags`, and `public.feature_flag_targets` so feature toggles, API keys, and scoped overrides have a canonical home with super-admin-only writes enforced by RLS.

- [x] **KPI population plan**
  - Notes: a nightly Supabase cron job now aggregates `public.task_activity` into `public.monthly_task_metrics`, `public.onboarding_kpis`, and `public.location_performance` so dashboards stay current.

- [ ] **Escalation workflow (future)**
  - Gap: currently removed from scope, but if re-enabled we'll need a table for BDR flags/escalations.
  - Action: revisit later if stakeholders reintroduce that feature.
