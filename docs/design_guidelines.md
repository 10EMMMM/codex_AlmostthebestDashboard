# Design Guidelines

## Dashboard Shell Styles
1. **Main Card**: Use w-[80vw] h-[80vh], ounded-[12px], g-white/10, ackdrop-blur-xl, order border-white/20, and shadow-[0_30px_80px_rgba(0,0,0,0.45)]. Keep overflow-visible so tooltips don't clip.
2. **Toolbar/Menu**: Slim macOS-style strip with traffic-light buttons (red closes/logs out). Icon buttons are h-7 w-7, rounded, and use hover:bg-white/15. The bar should have g-white/10, order-b border-white/10, and ounded-t-[12px].
   - **Navigation Rule**: Every new page must add a corresponding menu icon linking to that route. Only functional pages should appear in the toolbar.
3. **Scroll Behavior**: Let the card handle vertical scrolling (overflow-y-auto). Avoid nested scroll areas unless intentionally needed.
4. **Page Wordmark / Title**: Every page renders its title as a ixed element outside the scroll container so it never moves. Example:
   `	sx
   <div className="pointer-events-none fixed left-4 bottom-0 translate-y-1 text-[clamp(1rem,4vw,3rem)] font-black tracking-[0.12em] text-white/35 opacity-50">
     Dashboard
   </div>
   `
   Adjust the label, position, and size per page, but keep the opacity subtle (	ext-white/20-35).

## Widget Styling
- **Card Border**: All widgets use order: 1px solid rgba(255, 255, 255, 0.08) for a thin outline.
- **Greeting Card**: Gradient background from a random palette, white text, user name from ull_name -> display_name -> email, and the message is a single truncated line centered in the card.
- **Optional Admin Card**: When needed, reuse the blue gradient block for quick recognition.

## Instructions for New Pages
1. Wrap content in DashboardLayout to inherit the shell.
2. Add the page wordmark (see above) so the title stays visible while scrolling.
3. Keep content inside the dashboard-grid or follow the gradient patterns if you need highlight cards.
4. Use the gradient welcome card pattern for onboarding/welcome states when applicable.
5. Add a matching toolbar icon for the new page (per the navigation rule above).
6. If a page handles Account Manager city assignments, support selecting multiple cities and clearly show that AMs can manage their coverage list.

## CRUD Interaction Pattern (Create User Reference)
1. **Card Grid UX**: Present records inside dashboard-style widgets with overflow menus for secondary actions. Primary click opens the edit modal; destructive actions live inside a dropdown on the card to avoid accidental triggers.
2. **Loading State**: Show six shimmering skeleton cards (avatar + lines + badges) whenever the dataset is loading so the layout stays stable.
3. **Modals & Confirmations**: Reuse the macOS dialog (rounded 24px, blurred background). Destructive steps (archive/delete) always prompt for confirmation and optional reason before sending mutations.
4. **Toasts**: Success → green (`variant: "success"`), destructive errors → red (`"destructive"`), warnings (session expired, blockers) → amber (`"warning"`), informational states → blue (`"info"`). Always include a short description.
5. **Data Refresh**: After any create/update/delete/archive action, re-fetch the list (e.g., `loadUsers()`) so cards stay in sync with Supabase rather than relying on optimistic guesses.
6. **RLS Awareness**: All CRUD calls include the user’s access token in the Authorization header and the server routes enforce super_admin checks before touching auth.users or archive tables.
