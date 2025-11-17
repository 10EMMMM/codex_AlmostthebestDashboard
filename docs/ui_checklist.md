# UI Checklist Aligned with Database Schema

1. **Auth & Profiles**
   - [ ] Login/logout flows wired to Supabase Auth.
   - [ ] Profile drawer pulls `public.profiles` + timezone/prefs so team-level UI respects timezones.
   - [ ] Super admin badge if `auth.users.app_metadata.is_super_admin`.

2. **Super Admin Controls – User Creation**
   - [ ] User creation screen writes `auth.users`, populates `public.profiles`, sets `raw_app_meta.is_super_admin`, and assigns roles/allowed cities via `public.user_roles` + `public.account_manager_cities`.
   - [x] Archive/delete pipelines log entries into `public.archived_users` and `public.user_archive_log` (restore UI pending).
   - [ ] Feature flag/config placeholders for future `public.system_settings`.
   - [x] Admin – Manage Users cards match dashboard styling; each card opens a modal that upserts `public.profiles`/`public.account_manager_cities`.
   - [x] BDR dashboard widgets share the same card style (total BDRs, active profiles) and data sources.

3. **City & AM Coverage**
   - [ ] City selector only shows `public.cities` rows.
   - [ ] Account Manager dashboard filters requests by `public.account_manager_cities`.
   - [ ] AMs can manage their own city list (add/remove) without touching other users’ assignments.

4. **Request Intake**
   - [ ] Create request form uses `public.requests` columns (type, title, description, budget, deadline).
   - [ ] City dropdown limited to AM’s allowed cities; cascading lookup from `public.account_manager_cities`.
   - [ ] Trigger notification sender once form submits (no extra data required, just broadcast info).

5. **Assignments & Ownership**
   - [ ] Request detail pulls `public.request_assignments` to show owner(s)/BDRs.
   - [ ] Super admins can reassign/arch requests via same tables.
   - [ ] Help text explains “tasks default to super admin then reassign” when editing assignments.

6. **Restaurant & Tasks**
   - [ ] Restaurant view surfaces `public.restaurants` data (name, status, bdr_target_per_week, contacts).
   - [ ] Task board reads/writes `public.restaurant_tasks`, and uploads feed into `public.restaurant_documents`.
   - [ ] Notes component writes to `public.restaurant_notes` and triggers notification to request team members.
   - [ ] KPI widget reads `public.task_activity` + aggregated tables, shows BDR day/week/month counts.

7. **Messaging & Notifications**
   - [ ] Message threads tied to `public.threads`; `public.messages` shows subject, participants, attachments.
   - [ ] Notifications read from `public.notifications`; sending triggered when notes/messages created.

8. **Analytics & Dashboard**
   - [ ] Dashboard cards consume `public.monthly_task_metrics`, `public.onboarding_kpis`, `public.location_performance`.
   - [ ] Calendar card uses `public.task_activity` per day + `public.onboarding_kpis`.
   - [ ] Personal status cards pull per-BDR KPIs (daily/weekly/monthly) from aggregated job.

9. **Admin Config**
   - [ ] Feature flag/ui control placeholders for future `public.system_settings` entries.

10. **Data Integrity**
   - [ ] Every mutation respects the `requests_city_assignment_fk` constraint (UI block when requester's city not assigned).
   - [ ] Archiving and status toggles only available where RLS allows (super admin vs. AM).

11. **Seeds & Templates**
   - [ ] Use provided CSV templates + `docs/generated_seed.sql` to seed when developing locally.
   - [ ] Keep `docs/cities.txt` and `docs/templates/*.csv` in sync with UI pick lists.
