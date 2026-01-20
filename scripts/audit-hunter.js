const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '../.env' }); // Adjust path as needed

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing URL or Key.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for colored logs
const color = {
    red: (msg) => `\x1b[31m${msg}\x1b[0m`,
    green: (msg) => `\x1b[32m${msg}\x1b[0m`,
    yellow: (msg) => `\x1b[33m${msg}\x1b[0m`,
    cyan: (msg) => `\x1b[36m${msg}\x1b[0m`,
    bold: (msg) => `\x1b[1m${msg}\x1b[0m`,
};

/**
 * 1. DYNAMIC DISCOVERY
 * Fetches the OpenAPI JSON to find ALL tables exposed to the API.
 */
async function discoverSchema() {
    console.log(color.bold('🕵️  PHASE 1: RECONNAISSANCE (Schema Discovery)'));
    try {
        // Supabase/PostgREST exposes the schema at the root URL + /rest/v1/
        const response = await axios.get(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`);
        const definitions = response.data.definitions;
        
        if (!definitions) throw new Error("No definitions found");

        const tables = Object.keys(definitions);
        console.log(`✅ DISCOVERED ${tables.length} EXPOSED ENTITIES via OpenAPI.`);
        return tables;
    } catch (e) {
        console.log(color.yellow(`⚠️  Could not auto-discover schema via OpenAPI (${e.message}).`));
        console.log(`   Falling back to your manual list, but this means introspection is disabled (Good!).`);
        return null;
    }
}

/**
 * 2. TABLE PENETRATION TEST
 */
async function testTableSecurity(tableName) {
    const results = { name: tableName, read: false, insert: false, update: false, delete: false, leaked_count: 0 };
    
    // --- A. READ TEST ---
    const { data: readData, error: readError } = await supabase.from(tableName).select('*').limit(3);
    if (!readError && readData.length > 0) {
        results.read = true;
        results.leaked_count = readData.length;
    } else if (!readError && readData.length === 0) {
        // It's readable, just empty. This is still a "Pass" for access, even if no data leaked.
        // We assume valid access if no error occurred.
        results.read = true; 
    }

    // --- B. INSERT TEST (Heuristic) ---
    // We try to insert an empty object. 
    // Secure: "Permission denied" (401/403)
    // Insecure: "Column X cannot be null" or "201 Created"
    const { error: insertError } = await supabase.from(tableName).insert({});
    if (insertError) {
        // If error is strictly PERMISSION DENIED, it is secure.
        // If error is about schema validation (missing columns), you actually HAVE write access!
        if (!insertError.message.toLowerCase().includes('permission') && !insertError.message.toLowerCase().includes('policy')) {
            results.insert = true; 
        }
    } else {
        results.insert = true; // Success implies write access
    }

    // --- C. UPDATE/DELETE TEST (The Ghost Check) ---
    // We try to update a row with an ID that definitely doesn't exist (UUID 0000...).
    // Secure: "Permission denied" or "new row violates row-level security policy"
    // Insecure: No error (meaning it successfully scanned the table and found 0 rows to update)
    
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    
    // Update Check
    const { error: updateError } = await supabase.from(tableName).update({}).eq('id', fakeUUID);
    if (!updateError) results.update = true; // No error means we are allowed to try updates

    // Delete Check
    const { error: deleteError } = await supabase.from(tableName).delete().eq('id', fakeUUID);
    if (!deleteError) results.delete = true; // No error means we are allowed to try deletes

    return results;
}

/**
 * 3. STORAGE BUCKET TEST
 */
async function testStorage() {
    console.log(color.bold('\n📦 PHASE 3: STORAGE BUCKET ENUMERATION'));
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
        console.log(color.green(`✅ Storage Listing Protected: ${error.message}`));
        return;
    }

    if (!buckets || buckets.length === 0) {
        console.log(color.yellow(`⚠️  Storage accessible but empty.`));
        return;
    }

    console.log(color.red(`❌ PUBLIC BUCKETS FOUND: ${buckets.length}`));
    for (const b of buckets) {
        // Try to list files in the bucket
        const { data: files } = await supabase.storage.from(b.name).list();
        const fileCount = files ? files.length : 0;
        const visibility = b.public ? color.red('PUBLIC') : color.yellow('PRIVATE (but listed)');
        console.log(`   - 🪣 [${b.name}] is ${visibility}. Files exposed: ${fileCount}`);
    }
}

async function runAudit() {
    console.log(`🔒 STARTING INTELLIGENT SECURITY AUDIT`);
    console.log(`🎯 Target: ${supabaseUrl}`);
    console.log('------------------------------------------------');

    // 1. Get List
    let tables = await discoverSchema();
    if (!tables) {
        // Fallback to the list you provided if auto-discovery fails
        tables = ['licenses', 'customers', 'orders', 'stripe_orders', 'subscriptions', 'admins', 
                  'license_sessions', 'license_validation_log', 'conversations', 'messages', 'agents']; 
    }

    console.log(color.bold(`\n💥 PHASE 2: ATTACK SIMULATION (Testing ${tables.length} tables)`));
    console.log(`Format: [READ | INSERT | UPDATE | DELETE]  Table Name`);

    let vulnerableCount = 0;

    for (const table of tables) {
        const res = await testTableSecurity(table);
        
        // Analyze Risk
        const isReadVuln = res.read;
        const isWriteVuln = res.insert || res.update || res.delete;
        
        let output = `[ `;
        output += res.read ? color.red('READ ') : color.green('SAFE ');
        output += res.insert ? color.red('INS ') : color.green('SAFE ');
        output += res.update ? color.red('UPD ') : color.green('SAFE ');
        output += res.delete ? color.red('DEL ') : color.green('SAFE ');
        output += `]  ${table}`;

        if (res.leaked_count > 0) output += color.red(` (LEAKED ${res.leaked_count} records)`);

        console.log(output);

        if (isReadVuln || isWriteVuln) vulnerableCount++;
    }

    await testStorage();

    console.log('\n------------------------------------------------');
    console.log(color.bold('🏁 AUDIT SUMMARY'));
    if (vulnerableCount === 0) {
        console.log(color.green('🎉 SYSTEM SECURE. No public tables found.'));
    } else {
        console.log(color.red(`⚠️  VULNERABILITIES FOUND: ${vulnerableCount} tables have public permissions.`));
        console.log(color.yellow('👉 Note: "READ" is okay for public content (blogs, FAQs).'));
        console.log(color.red('👉 "INS/UPD/DEL" should usually be BLOCKED for Anon users.'));
    }
}

runAudit();