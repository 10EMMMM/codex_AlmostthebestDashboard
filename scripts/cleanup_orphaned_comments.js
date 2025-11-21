const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupOrphans() {
    try {
        console.log('--- Cleaning up Orphaned Comments ---');

        // 1. Fetch all active comments that have a parent
        const { data: comments, error: fetchError } = await supabase
            .from('request_comments')
            .select('id, parent_comment_id, content')
            .not('parent_comment_id', 'is', null)
            .is('deleted_at', null);

        if (fetchError) throw fetchError;

        console.log(`Found ${comments.length} active replies to check.`);

        // 2. Check parent status
        let orphanedIds = [];

        // We can optimize this by fetching all parents in one go
        const parentIds = [...new Set(comments.map(c => c.parent_comment_id))];

        const { data: parents, error: parentError } = await supabase
            .from('request_comments')
            .select('id, deleted_at')
            .in('id', parentIds);

        if (parentError) throw parentError;

        const parentMap = new Map();
        parents.forEach(p => parentMap.set(p.id, p));

        // 3. Identify orphans
        comments.forEach(c => {
            const parent = parentMap.get(c.parent_comment_id);
            // If parent is missing (hard deleted) OR parent is soft deleted
            if (!parent || parent.deleted_at) {
                console.log(`Found orphan: [${c.id}] "${c.content.substring(0, 20)}..." (Parent ${c.parent_comment_id} is ${!parent ? 'MISSING' : 'DELETED'})`);
                orphanedIds.push(c.id);
            }
        });

        if (orphanedIds.length === 0) {
            console.log('No orphaned comments found.');
            return;
        }

        console.log(`\nDeleting ${orphanedIds.length} orphaned comments...`);

        // 4. Soft delete orphans
        const { error: deleteError } = await supabase
            .from('request_comments')
            .update({ deleted_at: new Date().toISOString() })
            .in('id', orphanedIds);

        if (deleteError) throw deleteError;

        console.log('Successfully cleaned up orphans.');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

cleanupOrphans();
