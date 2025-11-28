# How to Run the Theme System Migration

The theme system migration needs to be run in your Supabase database. Here are three ways to do it:

## Option 1: Supabase Dashboard (Recommended - Easiest)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `docs/migrations/20251127000000_add_theme_system.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for completion (should take 5-10 seconds)
8. You should see "Success. No rows returned" message

## Option 2: Using psql (Command Line)

If you have PostgreSQL client installed:

```bash
# Get your database connection string from Supabase dashboard
# Settings > Database > Connection string > URI

psql "your-connection-string-here" -f docs/migrations/20251127000000_add_theme_system.sql
```

## Option 3: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project (one-time setup)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Verification

After running the migration, verify it worked:

1. Go to **Table Editor** in Supabase dashboard
2. You should see 3 new tables:
   - `themes` (with 4 rows: Default, Ocean, Forest, Sunset)
   - `user_preferences` (empty)
   - `organization_settings` (with 1 row)

3. Check the `themes` table - you should see:
   - Default (is_system_default: true)
   - Ocean
   - Forest
   - Sunset

## What the Migration Creates

- **3 Tables**: themes, user_preferences, organization_settings
- **RLS Policies**: Security policies for each table
- **Triggers**: Auto-update timestamps
- **Helper Functions**: get_user_theme(), get_theme_usage_stats()
- **4 Default Themes**: Pre-configured with all colors and backgrounds

## Troubleshooting

**Error: "relation already exists"**
- The tables already exist. You can skip this migration or drop the tables first.

**Error: "permission denied"**
- Make sure you're using the service role key or running as a super admin.

**Error: "function already exists"**
- The migration has already been run. Check if themes table exists.

## Next Steps

After successful migration:
1. Refresh your Next.js app
2. The theme system will automatically load
3. You should see 4 themes available in the theme switcher
4. Test switching between themes

---

**Need Help?** Check the Supabase dashboard for any error messages or contact support.
