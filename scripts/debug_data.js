const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugData() {
    try {
        console.log('--- Debugging Data for Comment Visibility ---');

        // 1. Fetch requests with comments
        const { data: requests, error: reqError } = await supabase
            .from('requests')
            .select('id, title, created_by, requester_id, request_comments(count)')
            .not('request_comments', 'is', null);

        if (reqError) throw reqError;

        // Filter for requests that match the title 'Indiano' ONLY
        const activeRequests = requests.filter(r => r.title.includes('Indiano'));

        console.log(`Found ${activeRequests.length} requests with comments.`);

        for (const req of activeRequests) {
            console.log(`\nRequest: "${req.title}" (ID: ${req.id})`);
            console.log(`- Created By: ${req.created_by}`);
            console.log(`- Requester: ${req.requester_id}`);

            // 2. Fetch the comments for this request
            const { data: comments, error: commError } = await supabase
                .from('request_comments')
                .select('id, user_id, content, deleted_at')
                .eq('request_id', req.id);

            if (commError) {
                console.error(`  Error fetching comments: ${commError.message}`);
                continue;
            }

            console.log(`  Comments (${comments.length}):`);
            const commentMap = new Map();
            comments.forEach(c => commentMap.set(c.id, c));

            comments.forEach(c => {
                let status = c.deleted_at ? 'DELETED' : 'ACTIVE';
                let parentInfo = '';
                if (c.parent_comment_id) {
                    const parent = commentMap.get(c.parent_comment_id); // Note: this only finds parent if it's in the fetched list
                    // We need to fetch all comments (even deleted) to check parent status properly, 
                    // but this script does fetch all for the request.
                    if (!parent) {
                        parentInfo = ` | Parent: ${c.parent_comment_id} (MISSING/DELETED?)`;
                    } else if (parent.deleted_at) {
                        parentInfo = ` | Parent: ${parent.content.substring(0, 10)}... (DELETED)`;
                    } else {
                        parentInfo = ` | Parent: ${parent.content.substring(0, 10)}... (ACTIVE)`;
                    }
                } else {
                    parentInfo = ' | ROOT';
                }
                console.log(`  - [${c.id}] User: ${c.user_id} | ${status} | Content: "${c.content.substring(0, 20)}..."${parentInfo}`);
            });

            // 3. Check User Details (Email & Roles)
            const userIds = [req.created_by, req.requester_id].filter(Boolean);
            if (userIds.length > 0) {
                console.log('  User Details:');
                for (const uid of userIds) {
                    // Get Email
                    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(uid);
                    const email = userData?.user?.email || 'Unknown Email';

                    // Get Roles
                    const { data: roles } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', uid);

                    const roleNames = roles ? roles.map(r => r.role).join(', ') : 'No Roles';

                    console.log(`  - User ID: ${uid}`);
                    console.log(`    Email: ${email}`);
                    console.log(`    Roles: ${roleNames}`);
                    console.log(`    Is Creator? ${uid === req.created_by}`);
                    console.log(`    Is Requester? ${uid === req.requester_id}`);
                }
            }

            // 4. Check Assignments for this Request
            const { data: assignments, error: assignError } = await supabase
                .from('request_assignments')
                .select('user_id, role')
                .eq('request_id', req.id);

            if (assignError) console.error(`  Error fetching assignments: ${assignError.message}`);
            else {
                console.log(`  Assignments:`);
                assignments.forEach(a => console.log(`  - User ${a.user_id}: ${a.role}`));
            }
        }

    } catch (error) {
        console.error('Unexpected Error:', error.message);
    }
}

debugData();
