const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing Supabase URL or Anon Key. Check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// All tables in the database
const SENSITIVE_TABLES = ['licenses', 'customers', 'orders', 'stripe_orders', 'subscriptions', 'admins'];
const INTERNAL_TABLES = ['license_sessions', 'license_validation_log', 'email_verification_codes',
    'download_tokens', 'wallet_rotation_state', 'wallet_order_counts',
    'conversations', 'messages', 'agents'];
const PUBLIC_TABLES = ['faqs', 'kb_documents', 'news_items', 'youtube_help_items', 'promotional_images'];
const SUPPORT_TABLES = ['tickets', 'ticket_events', 'ticket_replies'];
const SPECIAL_TABLES = ['banned_devices'];

async function testTableRead(tableName, expectedAccessible = false) {
    const { data, error } = await supabase.from(tableName).select('*').limit(3);

    if (error) {
        if (expectedAccessible) {
            console.log(`❌ FAIL: [${tableName}] Should be readable but got error: ${error.message}`);
            return false;
        } else {
            console.log(`✅ PASS: [${tableName}] Access Denied (Error).`);
            return true;
        }
    }

    if (data.length === 0) {
        if (expectedAccessible) {
            console.log(`⚠️  WARN: [${tableName}] Accessible but empty (might be OK if table has no data).`);
            return true; // Not a security issue if table is just empty
        } else {
            console.log(`✅ PASS: [${tableName}] Access Denied (No data returned).`);
            return true;
        }
    } else {
        if (expectedAccessible) {
            console.log(`✅ PASS: [${tableName}] Public data accessible (${data.length} records).`);
            return true;
        } else {
            console.log(`❌ FAIL: [${tableName}] SECURITY BREACH! ${data.length} records leaked!`);
            console.log('   Sample:', JSON.stringify(data[0]).substring(0, 100) + '...');
            return false;
        }
    }
}

async function testTableWrite(tableName) {
    const testData = { test_field: 'hacker_attempt' };
    const { error } = await supabase.from(tableName).insert([testData]);

    if (error) {
        console.log(`✅ PASS: [${tableName}] Write Denied: ${error.message.substring(0, 60)}...`);
        return true;
    } else {
        console.log(`❌ FAIL: [${tableName}] WRITE ACCESS GRANTED! Anon can insert data!`);
        return false;
    }
}

async function performComprehensiveSecurityAudit() {
    console.log('🔒 COMPREHENSIVE DATABASE SECURITY AUDIT');
    console.log('==========================================');
    console.log('Simulating Anonymous Attacker with Anon Key\n');

    let totalTests = 0;
    let passedTests = 0;

    // Test 1: Sensitive User Data (Should be BLOCKED)
    console.log('\n📊 Testing SENSITIVE USER DATA (Should be blocked):');
    console.log('─────────────────────────────────────────────────');
    for (const table of SENSITIVE_TABLES) {
        totalTests++;
        if (await testTableRead(table, false)) passedTests++;
    }

    // Test 2: Internal Tables (Should be BLOCKED)
    console.log('\n🔐 Testing INTERNAL TABLES (Should be blocked):');
    console.log('─────────────────────────────────────────────');
    for (const table of INTERNAL_TABLES) {
        totalTests++;
        if (await testTableRead(table, false)) passedTests++;
    }

    // Test 3: Public Content (Should be ACCESSIBLE)
    console.log('\n🌍 Testing PUBLIC CONTENT (Should be accessible):');
    console.log('────────────────────────────────────────────────');
    for (const table of PUBLIC_TABLES) {
        totalTests++;
        if (await testTableRead(table, true)) passedTests++;
    }

    // Test 4: Support Tables (Should be BLOCKED for reads, BLOCKED for writes)
    console.log('\n🎫 Testing SUPPORT TABLES (Should be blocked):');
    console.log('─────────────────────────────────────────────');
    for (const table of SUPPORT_TABLES) {
        totalTests++;
        if (await testTableRead(table, false)) passedTests++;
    }

    // Test 5: Write Attempts (All should FAIL)
    console.log('\n✍️  Testing WRITE ATTEMPTS (All should be denied):');
    console.log('──────────────────────────────────────────────────');
    const writeTables = ['licenses', 'customers', 'orders', 'license_sessions', 'faqs'];
    for (const table of writeTables) {
        totalTests++;
        if (await testTableWrite(table)) passedTests++;
    }

    // Test 6: Special Tables
    console.log('\n🚫 Testing SPECIAL TABLES:');
    console.log('─────────────────────────');
    for (const table of SPECIAL_TABLES) {
        totalTests++;
        if (await testTableRead(table, false)) passedTests++;
    }

    // Final Report
    console.log('\n');
    console.log('═══════════════════════════════════════════════');
    console.log('🏁 SECURITY AUDIT COMPLETE');
    console.log('═══════════════════════════════════════════════');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${totalTests - passedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 PERFECT SCORE! Your database is SECURE! 🔒');
    } else {
        console.log('\n⚠️  WARNING: Security vulnerabilities detected!');
    }
    console.log('═══════════════════════════════════════════════\n');
}

performComprehensiveSecurityAudit();
