import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, stripe, getPlanFromPrice, normalizePlanName, PLAN_RANK } from '@/lib/stripe-server';
import { licenseProductIdFromPlan, type LicenseProductId } from '@/lib/license-products';
import { sendStripeLicenseEmail, sendTrialEndingEmail } from '@/lib/email-stripe';
import { createMagicLinkToken } from '@/lib/auth-tokens';
import { createDownloadToken } from '@/lib/download-tokens';
import { getInstallerFileNameForProduct, isR2Enabled } from '@/lib/r2-client';
import { getStripeOrderByPaymentIntent, updateStripeOrderByPaymentIntent } from '@/lib/orders-supabase';
import { createLicense, getLicenseByKey } from '@/lib/license-db';
import { createSubscription, updateSubscriptionStatus, getSubscriptionByStripeId } from '@/lib/subscription-db';
import { handleStripePostPurchase } from '@/lib/stripe-post-purchase';
import { fulfillOneTimePaymentIntent } from '@/lib/stripe-one-time-fulfillment';
import Stripe from 'stripe';

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

          // 1. Fetch the real subscription to get accurate period dates
          let subPeriodEnd = new Date();
          let subPeriodStart = new Date();
          let subStatus = 'active';
          if (stripe) {
            try {
              const sub = await stripe.subscriptions.retrieve(subscriptionId);
              subPeriodStart = new Date((sub as any).current_period_start * 1000);
              subPeriodEnd = new Date((sub as any).current_period_end * 1000);
              subStatus = sub.status;
            } catch (err) {
              // Fallback: yearly plan gets +1 year
              console.warn('Could not fetch subscription for date sync, using fallback');
              subPeriodEnd.setFullYear(subPeriodEnd.getFullYear() + 1);
            }
          } else {
            subPeriodEnd.setFullYear(subPeriodEnd.getFullYear() + 1);
          }

          // 2. Create License Record
          try {
            await createLicense({
              licenseKey,
              productId:
                metadata.product === "orb-bot"
                  ? "ORB_BOT"
                  : licenseProductIdFromPlan(plan),
              email,
              plan,
              expiresAt: subPeriodEnd,
              paymentId: subscriptionId,
              amount: session.amount_total ? session.amount_total / 100 : 0,
              currency: session.currency || 'usd',
              subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              payment_type: 'subscription',
              subscription_status: subStatus,
            });
          } catch (err: any) {
            if (err.code === '23505' || err.message?.includes('duplicate key')) {
              console.log(`License ${licenseKey} already exists (race condition). Proceeding to email...`);
            } else {
              console.error('Failed to create license in checkout session:', err);
              throw err;
            }
          }

          // 3. Create Subscription Record (so portal shows it immediately)
          try {
            await createSubscription({
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              licenseKey,
              email,
              planId: plan,
              status: subStatus,
              currentPeriodStart: subPeriodStart,
              currentPeriodEnd: subPeriodEnd,
            });
          } catch (err: any) {
            if (err.code === '23505' || err.message?.includes('duplicate key')) {
              console.log('Subscription record already exists, skipping create.');
            } else {
              console.error('Failed to create subscription record in checkout session:', err);
            }
          }

          await handleStripePostPurchase(
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
              stripeLink: `https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}subscriptions/${subscriptionId}`,
              licenseProductId:
                metadata.product === "orb-bot"
                  ? "ORB_BOT"
                  : licenseProductIdFromPlan(plan),
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

        // cancel_at_period_end OR cancel_at both mean "pending cancellation"
        const cancelAt = (subscription as any).cancel_at;
        const cancelAtPeriodEnd = subscription.cancel_at_period_end || (cancelAt != null);
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

          // Use the imported normalizePlanName and PLAN_RANK from stripe-server

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
            plan: normalizedNew || updatedPlan,
            stripe_customer_id: subscription.customer as string // ALWAYS sync customer ID
          };

          // Logic for Plan Change badge
          if (normalizedNew && normalizedOld && normalizedNew !== normalizedOld) {
            console.log(`Plan change detected: ${normalizedOld} -> ${normalizedNew}`);
            updateData.upgraded_from = normalizedOld;
          }


          // Only sync metadata to Stripe when the plan name actually changed AND
          // cancel_at_period_end is false (avoid triggering a second webhook that
          // could overwrite the cancel flag we just saved)
          if (updatedPlan && !cancelAtPeriodEnd && normalizedNew && normalizedOld && normalizedNew !== normalizedOld) {
            if (stripe && updatedPlan !== subscription.metadata?.plan) {
              try {
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

          // If Stripe marks the subscription as canceled, expire the license immediately
          if (status === 'canceled') {
            updateData.status = 'expired';
            updateData.subscription_cancel_at_period_end = false;
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
              const subLicProduct: LicenseProductId =
                metadata.product === "orb-bot"
                  ? "ORB_BOT"
                  : licenseProductIdFromPlan(finalPlan || plan || "starter_yearly");

              await createLicense({
                licenseKey,
                productId: subLicProduct,
                email: email || '',
                plan: finalPlan || 'pro_yearly',
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
                        fileName: getInstallerFileNameForProduct(subLicProduct),
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
                    plan: finalPlan || plan || 'starter_yearly',
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
              plan: normalizePlanName(updatedPlan) || updatedPlan,
              stripe_customer_id: subscription.customer as string // ALWAYS sync customer ID when linking
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

            // Also expire license if Stripe marks subscription as canceled
            if (status === 'canceled') {
              updateData.status = 'expired';
              updateData.subscription_cancel_at_period_end = false;
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
      // Subscription Deleted (immediately ended / period-end cancellation completed)
      // ----------------------------------------------------------------------
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', subscription.id);

        const endedAt = subscription.ended_at
          ? new Date(subscription.ended_at * 1000)
          : new Date();

        const canceledAt = subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : endedAt;

        await updateSubscriptionStatus(subscription.id, {
          status: subscription.status,
          endedAt,
          canceledAt,
          cancelAtPeriodEnd: false,
        });

        // Mark license as expired — both status and subscription_status
        const client = (await import('@/lib/supabase-storage')).getSupabaseClient();
        await client.from('licenses')
          .update({
            status: 'expired',
            subscription_status: subscription.status,
            subscription_cancel_at_period_end: false,
            expires_at: endedAt.toISOString(),
          })
          .eq('subscription_id', subscription.id);

        console.log(`License expired for subscription ${subscription.id} (Ended: ${endedAt.toISOString()})`);
        break;
      }

      // ----------------------------------------------------------------------
      // Invoice Payment Succeeded (Renewal) — sync expires_at on annual renewal
      // ----------------------------------------------------------------------
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string | undefined;

        if (invoice.billing_reason === 'subscription_cycle' && subId) {
          console.log('Subscription renewal payment succeeded:', subId);

          // Fetch the subscription to get the updated period end
          if (stripe) {
            try {
              const sub = await stripe.subscriptions.retrieve(subId);
              const newPeriodEnd = new Date((sub as any).current_period_end * 1000);

              const client = (await import('@/lib/supabase-storage')).getSupabaseClient();
              await client.from('licenses')
                .update({
                  expires_at: newPeriodEnd.toISOString(),
                  subscription_status: 'active',
                  subscription_current_period_end: newPeriodEnd.toISOString(),
                })
                .eq('subscription_id', subId);

              await updateSubscriptionStatus(subId, {
                status: 'active',
                currentPeriodEnd: newPeriodEnd,
                cancelAtPeriodEnd: sub.cancel_at_period_end,
              });

              console.log(`License renewed. New expiry: ${newPeriodEnd.toISOString()}`);
            } catch (err) {
              console.error('Failed to sync renewal dates:', err);
            }
          }
        }
        break;
      }

      // ----------------------------------------------------------------------
      // Invoice Payment Failed — mark license as past_due
      // ----------------------------------------------------------------------
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription as string | undefined;
        if (subId) {
          console.warn('Subscription payment failed:', subId);
          const client = (await import('@/lib/supabase-storage')).getSupabaseClient();
          await client.from('licenses')
            .update({ subscription_status: 'past_due' })
            .eq('subscription_id', subId);
          await updateSubscriptionStatus(subId, { status: 'past_due' });
        }
        break;
      }

      // ----------------------------------------------------------------------
      // Trial Ending Soon (fires 3 days before trial ends)
      // ----------------------------------------------------------------------
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const email = subscription.metadata?.email;
        const plan = subscription.metadata?.plan;
        const fullName = subscription.metadata?.fullName || 'Valued Customer';

        if (email && subscription.trial_end) {
          const trialEndDate = new Date(subscription.trial_end * 1000);
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.signaltradingbots.com';
          try {
            await sendTrialEndingEmail({
              to: email,
              fullName,
              plan: plan || 'starter_yearly',
              trialEndDate,
              portalUrl: `${appUrl}/portal`,
            });
            console.log(`Trial ending email sent to ${email}`);
          } catch (err) {
            console.error('Failed to send trial ending email:', err);
          }
        }
        break;
      }

      // ----------------------------------------------------------------------
      // Acknowledged — no action needed
      // ----------------------------------------------------------------------
      case 'invoice.finalized':
      case 'charge.succeeded':
      case 'charge.failed': {
        console.log(`Acknowledged event: ${event.type}`);
        break;
      }

      // ----------------------------------------------------------------------
      // EXISTING: Payment Intent Succeeded (One-time payments & Upgrades legacy)
      // ----------------------------------------------------------------------
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);

        const result = await fulfillOneTimePaymentIntent(paymentIntent, request);
        if (result.outcome === 'skipped') {
          if (result.reason === 'no_order') {
            return NextResponse.json({ received: true });
          }
          if (result.reason !== 'subscription_invoice') {
            console.log('One-time PI fulfillment skipped:', result.reason, paymentIntent.id);
          }
        }
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
