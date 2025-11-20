require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditRequestsTable() {
    let output = '=== AUDIT OF public.requests TABLE ===\n\n';

    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .limit(1);

    if (error) {
        output += `ERROR: ${error.message}\n`;
        fs.writeFileSync('requests-audit.txt', output);
        console.log(output);
        return;
    }

    if (!data || data.length === 0) {
        output += 'No data in requests table\n';
        fs.writeFileSync('requests-audit.txt', output);
        console.log(output);
        return;
    }

    const columns = Object.keys(data[0]);

    output += `Total columns: ${columns.length}\n\n`;
    output += 'ALL COLUMNS:\n';
    output += '='.repeat(60) + '\n';

    columns.forEach((col, index) => {
        const value = data[0][col];
        const type = value === null ? 'null' : typeof value;
        const displayValue = value === null ? 'NULL' : (typeof value === 'string' ? value.substring(0, 30) : value);
        output += `${(index + 1).toString().padStart(3)}. ${col.padEnd(30)} ${type.padEnd(10)} ${displayValue}\n`;
    });

    output += '\n' + '='.repeat(60) + '\n';
    output += 'USER-RELATED COLUMNS:\n';
    output += '='.repeat(60) + '\n';

    const userColumns = columns.filter(col =>
        col.includes('user') ||
        col.includes('creator') ||
        col.includes('requester') ||
        col.includes('created_by') ||
        col.includes('requested')
    );

    userColumns.forEach(col => {
        const value = data[0][col];
        output += `${col}: ${value}\n`;
    });

    fs.writeFileSync('requests-audit.txt', output);
    console.log(output);
    console.log('\nAudit saved to requests-audit.txt');
}

auditRequestsTable().catch(console.error);
