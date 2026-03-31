import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createLicense } from '../src/lib/license-db';
import { generateLicenseKey } from '../src/lib/license-keys';

async function main() {
    try {
        const email = "gsahindu@gmail.com";
        const productId = "ORB_BOT"; // Generate ORB_BOT license by default, assuming they want to test new stuff
        const planId = "orb-plan-test";
        const licenseKey = await generateLicenseKey();

        // Expire in 30 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        console.log(`Generating license key for ${email}...`);

        const license = await createLicense({
            licenseKey,
            email,
            plan: planId,
            expiresAt,
            amount: 0,
            currency: 'usd',
            payment_type: 'one-time',
            productId: productId
        });

        console.log("Success! License Data:");
        console.log(JSON.stringify(license, null, 2));

    } catch (e) {
        console.error("Error creating license:", e);
    }
}

main();