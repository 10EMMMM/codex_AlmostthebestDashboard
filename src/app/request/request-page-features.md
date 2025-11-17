## Request Page Feature Checklist

- **Request grid** – Loads `public.requests` and enriches them with requester display names and city labels, then renders them as cards with status badges, city, requester, created date, deadline, and truncated description.
- **Filters toolbar** – Status, city, and requester filters (popover commands) slice the in-memory list client-side so users can quickly narrow the grid without re-fetching.
- **Request detail dialog** – Clicking a card opens a dialog that surfaces the full metadata (title, requester, city, created/deadline dates, description, priority, category, budget, and status badge).
- **Account Manager directory (super admins only)** – Super admins can see the directory widget that calls `/api/admin/account-managers` using the current access token to surface all requester options for quick reference.
- **New request dialog** – `CreateRequestForm` enforces core schema fields (title, request type, requester, city, description, priority, category, budget, deadline) and inserts directly into Supabase, showing toast feedback on success/failure.
- **Role-aware requester flow** – Super admins must select request type → requester → city; each step unlocks the next and requester/city pickers are comboboxes that stay hidden until prerequisites are met. Non super admins default to themselves and immediately see their allowed cities.
- **City access logic** – Cities are loaded from `account_manager_cities` for account managers/super admins (per selected requester) and from all `cities` for other roles, and the search field only shows results after typing.
- **Manager-aware city refresh** – Selecting a different requester resets the city selection and query so the options reflect the newly selected account manager’s territory.
- **Request list refresh** – After a request is created, the dialog closes and the grid re-fetches to reflect the new entry; toast messaging provides confirmation.
- **Splash experience** – The page now mirrors the dashboard by displaying `<SplashScreen />` whenever `useAuth` is still loading, preventing UI flashes on tab switches.
