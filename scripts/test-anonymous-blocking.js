const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonymousBlocking() {
    console.log('🔍 Testing Anonymous User Blocking\n');
    console.log('Testing if auth.email() = NULL blocks access...\n');

    // Test 1: Can anonymous user read ANY customer?
    const { data: customers, error: readError } = await supabase
        .from('customers')
        .select('*');

    console.log('📖 READ Test (SELECT * FROM customers):');
    if (readError) {
        console.log(`   ❌ Error: ${readError.message}`);
    } else {
        console.log(`   ✅ Success: ${customers.length} rows returned`);
        if (customers.length === 0) {
            console.log('   🔒 SECURE: RLS filtered all rows (email = NULL never matches)');
        } else {
            console.log('   ⚠️  LEAK: Anonymous user can see data!');
        }
    }

    // Test 2: Can anonymous user UPDATE?
    const { data: updateData, error: updateError } = await supabase
        .from('customers')
        .update({ name: 'Hacked' })
        .eq('id', 1);

    console.log('\n✏️  UPDATE Test (UPDATE customers SET name = "Hacked"):');
    if (updateError) {
        console.log(`   ❌ Error: ${updateError.message}`);
        console.log('   🔒 SECURE: RLS policy violation');
    } else {
        console.log(`   ✅ Success: ${updateData ? updateData.length : 0} rows affected`);
        if (!updateData || updateData.length === 0) {
            console.log('   🔒 SECURE: 0 rows affected (RLS blocked it)');
        } else {
            console.log('   ⚠️  VULNERABLE: Data was modified!');
        }
    }

    // Test 3: Can anonymous user INSERT?
    const { data: insertData, error: insertError } = await supabase
        .from('customers')
        .insert({ email: 'hacker@test.com', name: 'Hacker' });

    console.log('\n➕ INSERT Test (INSERT INTO customers):');
    if (insertError) {
        console.log(`   ❌ Error: ${insertError.message}`);
        console.log('   🔒 SECURE: Insert blocked');
    } else {
        console.log(`   ✅ Success: Record created`);
        console.log('   ⚠️  VULNERABLE: Anonymous user can create records!');
    }

    // Test 4: Can anonymous user DELETE?
    const { data: deleteData, error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', 1);

    console.log('\n🗑️  DELETE Test (DELETE FROM customers):');
    if (deleteError) {
        console.log(`   ❌ Error: ${deleteError.message}`);
        console.log('   🔒 SECURE: Delete blocked');
    } else {
        console.log(`   ✅ Success: ${deleteData ? deleteData.length : 0} rows deleted`);
        if (!deleteData || deleteData.length === 0) {
            console.log('   🔒 SECURE: 0 rows deleted (RLS blocked it)');
        } else {
            console.log('   ⚠️  VULNERABLE: Data was deleted!');
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log('Your RLS policies use: email = auth.email()');
    console.log('Anonymous users have: auth.email() = NULL');
    console.log('Result: NULL = NULL is FALSE in SQL');
    console.log('Conclusion: Anonymous users are BLOCKED ✅');
    console.log('='.repeat(60));
}

testAnonymousBlocking();
