import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, stripe, getPlanFromPrice, normalizePlanName, PLAN_RANK } from '@/lib/stripe-server';
import { generateLicenseKey } from '@/lib/license-keys';
import { sendStripeLicenseEmail, sendAdminNotificationEmail } from '@/lib/email-stripe';
import { sendTelegramAdminNotification } from '@/lib/telegram';
import { getStripeOrderByPaymentIntent, updateStripeOrderByPaymentIntent } from '@/lib/orders-supabase';
import { createLicense, getLicensesForEmail, upgradeLicense, getLicenseByKey } from '@/lib/license-db';
import { getCustomerByEmail, createCustomer } from '@/lib/auth-users';
import { createMagicLinkToken } from '@/lib/auth-tokens';
import { createDownloadToken, getExeFileName } from '@/lib/download-tokens';
import { isR2Enabled } from '@/lib/r2-client';
import { createSubscription, updateSubscriptionStatus, getSubscriptionByStripeId } from '@/lib/subscription-db';
import Stripe from 'stripe';

// Helper to handle post-purchase actions (customer creation, emails)
async function handlePostPurchase(
  email: string,
  fullName: string,
  licenseKey: string,
  plan: string,
  amount: number,
  orderId: string,
  request: NextRequest,
  downloadLinkEnabled: boolean = true,
  options: { country?: string; stripeLink?: string } = {}
) {
  // 1. Check/Create Customer & Magic Link
  let customer = await getCustomerByEmail(email);
  if (!customer) {
    try {
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      customer = await createCustomer({
        email: email,
        password: randomPassword,
        name: fullName,
      });
      console.log("Auto-created customer for email:", email);
    } catch (err: any) {
      console.error("Failed to auto-create customer:", err);
      if (err.code === '23505') {
        customer = await getCustomerByEmail(email);
      }
    }
  }

  let magicLinkUrl = "https://www.signaltradingbots.com/login";
  try {
    const host = request.headers.get("host") || "www.signaltradingbots.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const token = await createMagicLinkToken(email);
    magicLinkUrl = `${protocol}://${host}/api/auth/magic-login?token=${token}`;
  } catch (err) {
    console.error("Failed to generate magic link:", err);
  }

  // 2. Generate Download Link
  let downloadUrl = "";
  if (downloadLinkEnabled && isR2Enabled()) {
    try {
      const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "webhook";
      const userAgent = request.headers.get("user-agent") || "stripe-webhook";
      const downloadToken = await createDownloadToken({
        licenseKey,
        email: email,
        fileName: getExeFileName(),
        ipAddress,
        userAgent,
      });
      const host = request.headers.get("host") || "www.signaltradingbots.com";
      const protocol = host.includes("localhost") ? "http" : "https";
      downloadUrl = `${protocol}://${host}/api/download/${downloadToken.token}`;
    } catch (err) {
      console.error("Failed to generate download link:", err);
    }
  }

  // 3. Send User Email
  try {
    await sendStripeLicenseEmail({
      to: email,
      fullName: fullName,
      licenseKey,
      plan,
      orderId,
      amount,
      magicLinkUrl,
      downloadUrl,
    });
    console.log('License email sent to:', email);
  } catch (error) {
    console.error('Failed to send license email:', error);
  }

  // 4. Send Admin Notification (Email & Telegram)
  try {
    await Promise.allSettled([
      sendAdminNotificationEmail({
        customerEmail: email,
        fullName: fullName,
        licenseKey,
        plan,
        amount,
        orderId,
      }),
      sendTelegramAdminNotification({
        email: email,
        fullName: fullName,
        plan,
        amount,
        orderId,
        country: options.country,
        stripeLink: options.stripeLink,
      })
    ]);
    console.log('Admin notifications sequence completed for:', email);
  } catch (adminErr) {
    console.error('Failed to process admin notifications:', adminErr);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      // ----------------------------------------------------------------------
      // NEW: Subscription Checkout Completed
      // ----------------------------------------------------------------------
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          console.log('Checkout Session (Subscription) completed:', session.id);

          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          const metadata = session.metadata || {};

          const licenseKey = metadata.licenseKey;
          const email = metadata.email;
          const plan = metadata.plan;
          const isUpgrade = metadata.isUpgrade === "true";

          // Verify we have essential data
          if (!licenseKey || !email || !plan) {
            console.error('Missing metadata in checkout session:', session.id);
            break;
          }

          // Handle Upgrade Logic if applicable
          if (isUpgrade) {
            const upgradeKey = metadata.upgradeLicenseKey;
            // If we have a specific key to upgrade, we might want to mark the OLD license as upgraded
            // But for subscriptions, we typically issue a NEW license key that is a subscription license
            // and potentially disable the old one or mark it upgraded.
            // For now, we'll just treat the new subscription as the valid license.
            if (upgradeKey) {
              // Optional: Mark old license as upgraded/replaced if needed
              console.log(`User upgraded from ${upgradeKey} to subscription ${plan}`);
            }
          }

          // 1. Create License Record
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // Default validity, will be updated by subscription sync

          try {
            await createLicense({
              licenseKey,
              email,
              plan,
              expiresAt,
              paymentId: subscriptionId, // Use sub ID as payment ref
              amount: session.amount_total ? session.amount_total / 100 : 0,
              currency: session.currency || 'usd',
              subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              payment_type: 'subscription',
              subscription_status: 'active'
            });
          } catch (err: any) {
            if (err.code === '23505' || err.message?.includes('duplicate key')) {
              console.log(`License ${licenseKey} already exists (Race condition in checkout session). Proceeding...`);
            } else {
              console.error('Failed to create license in checkout session:', err);
              throw err; // Re-throw real errors, but safe to ignore duplicate if we want to proceed to email
            }
          }

          // 2. Create Subscription Record
          // We need to fetch the actual subscription object to get dates
          // For now, we can create with basic data or wait for 'customer.subscription.created'
          // However, 'checkout.session.completed' ensures we have all the metadata

          // It's often better to let 'customer.subscription.updated' handle the details sync,
          // but we want to send the email immediately.

          await handlePostPurchase(
            email,
            metadata.fullName || "Valued Customer",
            licenseKey,
            plan,
            session.amount_total ? session.amount_total / 100 : 0,
            session.id, // Order ID for email
            request,
            true, // downloadLinkEnabled
            {
              country: session.customer_details?.address?.country || undefined,
              stripeLink: `https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}subscriptions/${subscriptionId}`
            }
          );
        }
        break;
      }

      // ----------------------------------------------------------------------
      // NEW: Subscription Updated (Created, Renewed, Canceled, Changed)
      // ----------------------------------------------------------------------
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${event.type}:`, subscription.id);

        const subscriptionId = subscription.id;
        const status = subscription.status;

        // Extract metadata early so we can use it for fallback calculations
        const metadata = subscription.metadata || {};
        console.log("Subscription Metadata:", JSON.stringify(metadata, null, 2));

        const licenseKey = metadata.licenseKey;
        const email = metadata.email;
        const plan = metadata.plan;

        // ---------------------------------------------------------
        // 1. Determine the REAL Plan from Subscription Items (Hoisted)
        // ---------------------------------------------------------
        let derivedPlan: string | undefined;
        let priceItem: Stripe.Price | undefined;

        if (subscription.items && subscription.items.data.length > 0) {
          priceItem = subscription.items.data[0].price;
          derivedPlan = getPlanFromPrice(priceItem);
        }

        // Fallback to metadata if we couldn't derive from price
        // Note: metadata.plan might be stale on upgrades, so derivedPlan takes precedence
        const finalPlan = derivedPlan || plan;

        console.log(`Plan Detection: Derived='${derivedPlan}', Metadata='${plan}', Final='${finalPlan}'`);

        // ---------------------------------------------------------
        // 2. Validate and convert Unix timestamps to Date objects
        // ---------------------------------------------------------
        // Use strong typing from Stripe definition -- Casting to any because TS definition seems to miss these common fields in this version?
        const currentPeriodStartTimestamp = (subscription as any).current_period_start;
        const currentPeriodEndTimestamp = (subscription as any).current_period_end;

        let currentPeriodStart: Date;
        let currentPeriodEnd: Date;

        // Start Date Logic
        if (currentPeriodStartTimestamp) {
          currentPeriodStart = new Date(currentPeriodStartTimestamp * 1000);
        } else {
          const d = (subscription as any).start_date;
          if (d) currentPeriodStart = new Date(d * 1000);
          else currentPeriodStart = new Date();
        }
        if (isNaN(currentPeriodStart.getTime())) currentPeriodStart = new Date();

        // End Date Logic with Interval Fallback (Respecting Status)
        if (currentPeriodEndTimestamp) {
          currentPeriodEnd = new Date(currentPeriodEndTimestamp * 1000);
        } else {
          console.warn('Missing period end timestamp, deriving from interval...');
          // Only extend if Active or Trialing
          if (['active', 'trialing'].includes(status)) {
            const interval = subscription.items?.data[0]?.price?.recurring?.interval;
            currentPeriodEnd = new Date();

            if (interval === 'year') {
              currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
            } else if (subscription.trial_end) {
              currentPeriodEnd = new Date(subscription.trial_end * 1000);
            } else {
              currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
            }
          } else {
            // If canceled/unpaid, assume ended
            if (subscription.ended_at) currentPeriodEnd = new Date(subscription.ended_at * 1000);
            else currentPeriodEnd = new Date(); // Now
          }
        }
        if (isNaN(currentPeriodEnd.getTime())) {
          currentPeriodEnd = new Date();
          currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30); // Default safety? Or dangerous?
          // If we fell through to here, something is wrong.
          // If status was canceled, we don't want +30.
          if (!['active', 'trialing'].includes(status)) currentPeriodEnd = new Date();
        }

        const cancelAtPeriodEnd = subscription.cancel_at_period_end;
        const canceledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null;
        const endedAt = subscription.ended_at ? new Date(subscription.ended_at * 1000) : null;

        // Note: usage of 'metadata' relies on it being copied from Checkout Session to Subscription
        // Ensure 'subscription_data.metadata' was set in Checkout Session creation.

        const client = (await import('@/lib/supabase-storage')).getSupabaseClient();

        // 1. Update License Logic (Robust)
        // First, try to find and update by subscription_id (Most reliable for existing subs)
        const { data: licenseBySub } = await client
          .from('licenses')
          .select('id, license_key, plan')
          .eq('subscription_id', subscriptionId)
          .maybeSingle();

        if (licenseBySub) {
          console.log(`Updating license ${licenseBySub.license_key} for subscription ${subscriptionId} (Status: ${status})`);

          const normalizePlanName = (p: string | undefined | null) => {
            if (!p) return '';
            if (p === 'pro') return 'pro_monthly';
            if (p === 'starter') return 'starter_monthly';
            return p;
          };

          const PLAN_RANK: Record<string, number> = {
            'starter_monthly': 1,
            'starter_yearly': 2,
            'pro_monthly': 3,
            'pro_yearly': 4,
            'lifetime': 5
          };

          const updatedPlan = finalPlan;
          const oldPlan = licenseBySub.plan;

          const normalizedOld = normalizePlanName(oldPlan);
          const normalizedNew = normalizePlanName(updatedPlan);

          const updateData: any = {
            subscription_status: status,
            subscription_current_period_end: currentPeriodEnd.toISOString(),
            subscription_cancel_at_period_end: cancelAtPeriodEnd,
            expires_at: currentPeriodEnd.toISOString(),
            // Ensure we set the normalized plan name if it changed
            plan: normalizedNew || updatedPlan
          };

          // Logic for Plan Change badge
          if (normalizedNew !== normalizedOld) {
            console.log(`Plan change detected: ${normalizedOld} -> ${normalizedNew}`);
            updateData.upgraded_from = normalizedOld;
          } else {
            // Same plan (normalized). E.g. pro -> pro_monthly
            // Ensure existing upgraded_from is NOT touched?
            // Actually, if we are normalizing, we might want to clear it if it was erroneously set?
            // If a user refreshes "pro_monthly", it shouldn't say "Upgraded from pro".
            if (oldPlan === 'pro' && updatedPlan === 'pro_monthly') {
              updateData.upgraded_from = null;
            }
          }


          if (updatedPlan) {
            // Also update Stripe subscription metadata for future webhooks
            if (stripe && updatedPlan !== subscription.metadata?.plan) {
              try {
                // Sync metadata to NEW plan name
                await stripe.subscriptions.update(subscriptionId, {
                  metadata: {
                    ...subscription.metadata,
                    plan: normalizedNew || updatedPlan
                  }
                });
                console.log(`Updated Stripe subscription metadata with plan: ${normalizedNew || updatedPlan}`);
              } catch (err) {
                console.error('Failed to update Stripe subscription metadata:', err);
              }
            }
          }

          await client.from('licenses').update(updateData).eq('id', licenseBySub.id);
        }

        // If not found by sub ID, check if we need to CREATE it using metadata (Fallback/New Logic)
        else if (licenseKey) {
          const { data: existingLicense } = await client
            .from('licenses')
            .select('id, plan')
            .eq('license_key', licenseKey)
            .maybeSingle();

          let targetLicenseForUpdate = existingLicense;

          if (!targetLicenseForUpdate && (status === 'active' || status === 'trialing')) {
            // License missing - CREATE IT
            console.log(`License missing for subscription ${subscriptionId}, creating...`);

            const priceItem = subscription.items.data[0]?.price;
            const amountCents = priceItem?.unit_amount || 0;
            const amountDollars = amountCents / 100;

            try {
              await createLicense({
                licenseKey,
                email: email || '',
                plan: finalPlan || 'pro_monthly',
                expiresAt: currentPeriodEnd,
                paymentId: typeof subscription.latest_invoice === 'string' ? subscription.latest_invoice : subscription.latest_invoice?.id || 'SUB-INV',
                amount: amountDollars,
                currency: priceItem?.currency || 'usd',
                payment_type: 'subscription',
                subscription_id: subscriptionId,
                subscription_status: status
              });

              // Send Emails only if we successfully CREATED (avoid double sending)
              if (email) {
                try {
                  const magicLinkToken = await createMagicLinkToken(email);
                  const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-magic-link?token=${magicLinkToken}`;
                  const fullName = metadata.fullName || 'Valued Customer';

                  let downloadUrl = "";
                  if (isR2Enabled()) {
                    try {
                      const downloadToken = await createDownloadToken({
                        licenseKey,
                        email: email,
                        fileName: getExeFileName(),
                        ipAddress: request.headers.get("x-forwarded-for") || "webhook",
                        userAgent: "stripe-webhook-sub",
                      });
                      downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/download/${downloadToken.token}`;
                    } catch (dtErr) {
                      console.error("Failed to generate download token:", dtErr);
                    }
                  }

                  await sendStripeLicenseEmail({
                    to: email,
                    fullName: fullName,
                    licenseKey: licenseKey,
                    plan: plan || 'Subscription',
                    orderId: typeof subscription.latest_invoice === 'string' ? subscription.latest_invoice : subscription.latest_invoice?.id || 'SUB-INV',
                    amount: amountDollars,
                    magicLinkUrl: magicLinkUrl,
                    downloadUrl: downloadUrl
                  });
                } catch (e) {
                  console.error("Error sending email:", e);
                }
              }
            } catch (err: any) {
              // HANDLE RACE CONDITION: 23505 = Unique Violation (Already exists)
              if (err.code === '23505' || err.message?.includes('duplicate key')) {
                console.log(`Race condition detected: License ${licenseKey} already created. Switching to Update/Link.`);
                // Fetch the license that won the race
                const { data: raceWinner } = await client
                  .from('licenses')
                  .select('id, plan')
                  .eq('license_key', licenseKey)
                  .maybeSingle(); // Use maybeSingle to be safe

                targetLicenseForUpdate = raceWinner;
              } else {
                console.error('Failed to create license:', err);
              }
            }
          }

          // If we found an existing license OR fell back to it from race condition
          if (targetLicenseForUpdate) {
            // This case implies we need to LINK the license to the Subscription
            console.log(`Linking license ${licenseKey} to subscription ${subscriptionId}`);

            const updatedPlan = finalPlan;

            const updateData: any = {
              subscription_id: subscriptionId,
              subscription_status: status,
              subscription_current_period_end: currentPeriodEnd.toISOString(),
              subscription_cancel_at_period_end: cancelAtPeriodEnd,
              expires_at: currentPeriodEnd.toISOString(),
              plan: normalizePlanName(updatedPlan) || updatedPlan
            };

            // Update plan if we have it (important for upgrades/downgrades via Stripe Portal)
            if (updatedPlan) {
              const oldPlan = targetLicenseForUpdate.plan;
              const normalizedOld = normalizePlanName(oldPlan);
              const normalizedNew = normalizePlanName(updatedPlan);

              // Check if plan actually changed (upgrade/downgrade)
              if (normalizedOld !== normalizedNew) {
                // Always store the previous plan so we can show "Upgraded From" or "Downgraded From"
                console.log(`Plan change detected (Linking): ${normalizedOld} -> ${normalizedNew}`);
                updateData.upgraded_from = normalizedOld;

                console.log(`Plan changed from ${oldPlan} to ${updatedPlan} (Normalized: ${normalizedOld} -> ${normalizedNew})`);
              } else if (!oldPlan) {
                updateData.plan = updatedPlan;
              }

              // Also update Stripe subscription metadata for future webhooks
              if (stripe && updatedPlan !== subscription.metadata?.plan) {
                try {
                  await stripe.subscriptions.update(subscriptionId, {
                    metadata: {
                      ...subscription.metadata,
                      plan: updatedPlan
                    }
                  });
                } catch (err) {
                  console.error('Failed to update Stripe subscription metadata:', err);
                }
              }
            }

            await client.from('licenses').update(updateData).eq('license_key', licenseKey);
          }
        }

        // 2. Upsert Subscription Record
        // We first check if it exists
        const existingSub = await getSubscriptionByStripeId(subscriptionId);

        if (existingSub) {
          await updateSubscriptionStatus(subscriptionId, {
            status,
            currentPeriodEnd,
            cancelAtPeriodEnd,
            canceledAt,
            endedAt
          });
        } else if (licenseKey && email && plan && (status === 'active' || status === 'trialing')) {
          // Create if missing (only for active/trialing subscriptions that have licenses)
          try {
            await createSubscription({
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: subscription.customer as string,
              licenseKey,
              email,
              planId: plan,
              status,
              currentPeriodStart,
              currentPeriodEnd
            });
          } catch (err: any) {
            console.error("Failed to create subscription record:", err);
            // Verify if it was FK error
            if (err.code === '23503') {
              console.error("License key still missing despite check!");
            }
          }
        }
        // 3. Sync Order Status (Crucial because we skip payment_intent.succeeded for subscriptions)
        const orderId = metadata.orderId;
        if (orderId && licenseKey && (status === 'active' || status === 'trialing')) {
          console.log(`Syncing order ${orderId} status to paid with license ${licenseKey}`);
          try {
            // Import dynamically to avoid circular dependencies if any, or just use the imported one
            const { updateStripeOrderStatus } = await import('@/lib/orders-supabase');
            await updateStripeOrderStatus(orderId, 'paid', licenseKey);
          } catch (err) {
            console.error(`Failed to sync order status for ${orderId}:`, err);
          }
        }
        break;
      }

      // ----------------------------------------------------------------------
      // NEW: Subscription Deleted (Immediately ended)
      // ----------------------------------------------------------------------
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', subscription.id);

        const endedAt = subscription.ended_at
          ? new Date(subscription.ended_at * 1000)
          : new Date();

        await updateSubscriptionStatus(subscription.id, {
          status: subscription.status,
          endedAt: endedAt
        });

        // Update License to reflect cancellation/expiration
        const client = (await import('@/lib/supabase-storage')).getSupabaseClient();
        await client.from('licenses')
          .update({
            subscription_status: subscription.status,
            expires_at: endedAt.toISOString()
          })
          .eq('subscription_id', subscription.id);

        console.log(`Marked license for subscription ${subscription.id} as ${subscription.status} (Ended: ${endedAt.toISOString()})`);
        break;
      }

      // ----------------------------------------------------------------------
      // NEW: Invoice Payment Succeeded (Renewal)
      // ----------------------------------------------------------------------
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.billing_reason === 'subscription_cycle') {
          console.log('Subscription renewal success:', (invoice as any).subscription);
          // 'customer.subscription.updated' usually fires too and handles dates,
          // but we can send a renewal receipt email here if we want.
        }
        break;
      }

      // ----------------------------------------------------------------------
      // NEW: Invoice Payment Failed
      // ----------------------------------------------------------------------
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          console.warn('Subscription payment failed:', (invoice as any).subscription);
          // Could trigger an email to user warning them
          const client = (await import('@/lib/supabase-storage')).getSupabaseClient();
          await client.from('licenses')
            .update({ subscription_status: 'past_due' })
            .eq('subscription_id', (invoice as any).subscription);
        }
        break;
      }

      // ----------------------------------------------------------------------
      // EXISTING: Payment Intent Succeeded (One-time payments & Upgrades legacy)
      // ----------------------------------------------------------------------
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        console.log('PI Invoice:', (paymentIntent as any).invoice);

        // Ignore if this PI belongs to a subscription invoice (handled by checkout/invoice events)
        if ((paymentIntent as any).invoice || paymentIntent.description?.includes("Subscription")) {
          console.log("Skipping payment_intent.succeeded for subscription payment");
          break;
        }

        const order = await getStripeOrderByPaymentIntent(paymentIntent.id);
        if (!order) {
          return NextResponse.json({ received: true });
        }
        if (order.status === 'paid') {
          return NextResponse.json({ received: true, message: 'Already processed' });
        }

        const isUpgrade = paymentIntent.metadata?.isUpgrade === "true";
        const metaUpgradeLicenseKey = paymentIntent.metadata?.upgradeLicenseKey || "";
        let licenseKey = "";

        if (isUpgrade) {
          // ... (Existing Upgrade Logic for One-Time payments) ...
          const licenses = await getLicensesForEmail(order.email);
          let activeMonthly: any = null;
          if (metaUpgradeLicenseKey) {
            activeMonthly = licenses.find(l => l.license_key === metaUpgradeLicenseKey);
          }
          if (!activeMonthly) {
            activeMonthly = licenses.find(l =>
              l.status === 'active' &&
              !l.plan.toLowerCase().includes('yearly') &&
              l.plan.toLowerCase() !== 'lifetime'
            );
          }

          if (activeMonthly) {
            licenseKey = activeMonthly.license_key;
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);

            await upgradeLicense({
              licenseId: activeMonthly.id,
              newPlan: order.plan,
              newExpiresAt: expiresAt,
              paymentId: paymentIntent.id,
              amount: order.display_price,
              oldPlan: activeMonthly.plan
            });
          }
        }

        if (!licenseKey) {
          // New License Logic
          licenseKey = generateLicenseKey();
          const now = new Date();
          const expiresAt = new Date(now);
          const planLower = order.plan.toLowerCase();

          if (planLower === "lifetime") {
            expiresAt.setFullYear(expiresAt.getFullYear() + 100);
          } else if (planLower.includes("yearly")) {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          } else {
            expiresAt.setDate(expiresAt.getDate() + 30);
          }

          const metaSubscriptionId = paymentIntent.metadata?.subscriptionId;

          await createLicense({
            licenseKey,
            email: order.email,
            plan: order.plan,
            expiresAt,
            paymentId: paymentIntent.id,
            amount: order.display_price,
            currency: "USD",
            payment_type: metaSubscriptionId ? 'subscription' : 'one_time',
            subscription_id: metaSubscriptionId || undefined,
            subscription_status: metaSubscriptionId ? 'active' : undefined
          });
        }

        await updateStripeOrderByPaymentIntent(paymentIntent.id, 'paid', licenseKey);
        await handlePostPurchase(
          order.email,
          order.full_name || "Valued Customer",
          licenseKey,
          order.plan,
          order.display_price,
          paymentIntent.id,
          request,
          true, // downloadLinkEnabled
          {
            country: paymentIntent.shipping?.address?.country || undefined,
            stripeLink: `https://dashboard.stripe.com/${paymentIntent.livemode ? '' : 'test/'}payments/${paymentIntent.id}`
          }
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const order = await getStripeOrderByPaymentIntent(paymentIntent.id);
        if (order) await updateStripeOrderByPaymentIntent(paymentIntent.id, 'failed');
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
