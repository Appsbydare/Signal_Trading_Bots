const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generate() {
    const crypto = require('crypto');
    const licenseKey = crypto.randomBytes(4).toString('hex').toUpperCase() + '-' +
                       crypto.randomBytes(4).toString('hex').toUpperCase() + '-' +
                       crypto.randomBytes(4).toString('hex').toUpperCase() + '-' +
                       crypto.randomBytes(4).toString('hex').toUpperCase();

    const email = 'gsahindu@gmail.com';
    
    // Set expiry to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { data, error } = await supabase
        .from('licenses')
        .insert({
            license_key: licenseKey,
            email: email,
            plan: 'lifetime', 
            status: 'active',
            product_id: 'ORB_BOT',
            expires_at: expiresAt.toISOString(),
            payment_type: 'one-time'
        })
        .select()
        .single();
        
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('\n✅ License created successfully!\n');
        console.log('Key:', data.license_key);
        console.log('Email:', data.email);
        console.log('Product:', data.product_id);
    }
}

generate();