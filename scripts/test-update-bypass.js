const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdateBypass() {
    console.log('🔍 Testing if hackers can UPDATE by guessing IDs...\n');

    // First, let's try to read a customer to get a real ID
    const { data: customers } = await supabase.from('customers').select('id, email').limit(1);

    if (!customers || customers.length === 0) {
        console.log('✅ SECURE: Cannot even read customer IDs to attempt update.');
        return;
    }

    const targetId = customers[0].id;
    console.log(`Found customer ID: ${targetId}`);
    console.log(`Attempting to UPDATE this customer's data...\n`);

    // Try to update that customer's email
    const { data, error } = await supabase
        .from('customers')
        .update({ email: 'hacker@evil.com' })
        .eq('id', targetId);

    if (error) {
        console.log('✅ SECURE: Update blocked!');
        console.log(`   Error: ${error.message}`);
    } else {
        console.log('❌ VULNERABLE: Update succeeded!');
        console.log('   Data:', data);
    }

    // Try with a guessed ID
    console.log('\n🎲 Trying with a random guessed ID (999999)...\n');
    const { error: error2 } = await supabase
        .from('customers')
        .update({ email: 'hacker2@evil.com' })
        .eq('id', 999999);

    if (error2) {
        console.log('✅ SECURE: Update blocked even with guessed ID!');
        console.log(`   Error: ${error2.message}`);
    } else {
        console.log('❌ VULNERABLE: Update succeeded with guessed ID!');
    }
}

testUpdateBypass();
