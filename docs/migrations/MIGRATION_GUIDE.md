# Database Migration Guide - Comments Feature
## Using Existing `request_notes` Table

## 🎯 Quick Start

### Step 1: Pre-Migration Setup (Optional but Recommended)

Run this first to ensure prerequisites exist:

**File:** `docs/migrations/00_pre_migration_setup.sql`

This will:
- ✅ Create `user_feature_flags` table if needed
- ✅ Grant you super_admin access
- ✅ Verify required tables exist

### Step 2: Rename and Upgrade Migration

Run the main migration:

**File:** `docs/migrations/20251121180000_rename_notes_to_comments.sql`

This will:
- ✅ Rename `request_notes` → `request_comments`
- ✅ Add new columns (parent_comment_id, is_edited, deleted_at)
- ✅ Create `comment_mentions` table
- ✅ Create `comment_reactions` table
- ✅ Set up all RLS policies
- ✅ Create indexes for performance
- ✅ Add triggers for auto-updates

---

## 📋 Detailed Instructions

### Option A: Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to your Supabase project
   - Click **SQL Editor** in left sidebar

2. **Run Pre-Migration Setup**
   - Copy all contents of `00_pre_migration_setup.sql`
   - Paste into SQL Editor
   - Click **Run**
   - Wait for success message

3. **Run Main Migration**
   - Copy all contents of `20251121180000_rename_notes_to_comments.sql`
   - Paste into SQL Editor
   - Click **Run**
   - Look for "✓ Migration successful!" message

4. **Verify**
   - You should see confirmation that 3 tables exist
   - Check that `request_notes` is now `request_comments`

### Option B: Supabase CLI

```bash
# Navigate to project directory
cd g:/00_Dashboard/00_codex_almostthebestdashboard/gemini_AlmostthebestDashboard

# Run pre-migration
supabase db execute --file docs/migrations/00_pre_migration_setup.sql

# Run main migration
supabase db execute --file docs/migrations/20251121180000_rename_notes_to_comments.sql
```

---

## 🔍 What This Migration Does

### Table Rename
```
request_notes → request_comments
```

### New Columns Added to `request_comments`
- `parent_comment_id` - For threaded replies
- `is_edited` - Track if comment was edited
- `deleted_at` - Soft delete timestamp
- `updated_at` - Last update timestamp (if not exists)

- ✅ Fast threaded comment queries
- ✅ Efficient mention searches

---

## ⚠️ Important Notes

### Data Preservation
- ✅ **All existing data is preserved**
- ✅ No data loss during rename
- ✅ All foreign keys automatically updated
- ✅ Existing RLS policies replaced with new ones

### Breaking Changes
- ⚠️ Old RLS policies on `request_notes` will be dropped
- ⚠️ New policies will be created with our naming
- ⚠️ If you have code referencing `request_notes`, it will break (but we don't)

### Rollback Plan
If you need to undo this migration:

```sql
-- Rename back
ALTER TABLE request_comments RENAME TO request_notes;

-- Drop new tables
DROP TABLE IF EXISTS comment_reactions CASCADE;
DROP TABLE IF EXISTS comment_mentions CASCADE;

-- Remove new columns (optional)
ALTER TABLE request_notes DROP COLUMN IF EXISTS parent_comment_id;
ALTER TABLE request_notes DROP COLUMN IF EXISTS is_edited;
ALTER TABLE request_notes DROP COLUMN IF EXISTS deleted_at;
```

---

## ✅ Post-Migration Checklist

### 1. Verify Tables Exist

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('request_comments', 'comment_mentions', 'comment_reactions');
```

Expected result: 3 rows

### 2. Check Data Migrated

```sql
-- Count records in renamed table
SELECT COUNT(*) as total_comments FROM request_comments;

-- Verify columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'request_comments'
ORDER BY ordinal_position;
```

### 3. Test in Application

1. Open your app
2. Navigate to a request detail
3. Try adding a comment
4. Verify it appears in the UI
5. Try @mentioning someone
6. Try adding a reaction

### 4. Enable Realtime (Important!)

For real-time updates to work:

1. Go to **Database** → **Replication** in Supabase
2. Find `request_comments` table
3. Toggle **Enable** for replication
4. Do the same for `comment_mentions` and `comment_reactions`

---

## 🐛 Troubleshooting

### Error: "relation request_notes does not exist"
**Cause:** Table was already renamed or doesn't exist
**Solution:** Check if `request_comments` already exists. If so, skip the rename step.

### Error: "column already exists"
**Cause:** Columns were already added
**Solution:** The migration uses `IF NOT EXISTS` checks, so this shouldn't happen. If it does, the migration will skip that column.

### Error: "permission denied"
**Cause:** Not enough privileges
**Solution:** Run as service role or database owner in Supabase.

### Comments not visible in UI
**Cause:** Missing permissions
**Solution:** 
```sql
-- Grant yourself ADMIN
INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'ADMIN')
ON CONFLICT DO NOTHING;
```

### Real-time not working
**Cause:** Replication not enabled
**Solution:** Enable replication in Supabase Dashboard → Database → Replication

---

## 📊 Migration Summary

| Action | Status |
|--------|--------|
| Rename `request_notes` → `request_comments` | ✅ |
| Add threading support | ✅ |
| Add edit tracking | ✅ |
| Add soft delete | ✅ |
| Create mentions table | ✅ |
| Create reactions table | ✅ |
| Set up RLS policies | ✅ |
| Create indexes | ✅ |
| Add triggers | ✅ |

---

## 🚀 Next Steps

After successful migration:

1. ✅ Refresh your application
2. ✅ Test creating comments
3. ✅ Test @mentions autocomplete
4. ✅ Test emoji reactions
5. ✅ Test threaded replies
6. ✅ Test edit/delete
7. ✅ Enable Realtime replication
8. ✅ Test real-time updates (open 2 tabs)

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Verify RLS policies: Dashboard → Authentication → Policies
3. Check table structure: Run `inspect_request_notes.sql`
4. Review error messages carefully

The migration is designed to be **safe and reversible**. All existing data is preserved! 🎉
