import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe-server';
import { generateLicenseKey } from '@/lib/license-keys';
import { sendStripeLicenseEmail } from '@/lib/email-stripe';
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
  downloadLinkEnabled: boolean = true
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

  // 3. Send Email
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

          await createLicense({
            licenseKey,
            email,
            plan,
            expiresAt,
            paymentId: subscriptionId, // Use sub ID as payment ref
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'usd',
            subscription_id: subscriptionId,
            payment_type: 'subscription',
            subscription_status: 'active'
          });

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
            request
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

        // Validate and convert Unix timestamps to Date objects
        const currentPeriodStartTimestamp = (subscription as any).current_period_start;
        const currentPeriodEndTimestamp = (subscription as any).current_period_end;

        if (!currentPeriodStartTimestamp || !currentPeriodEndTimestamp) {
          console.error('Missing period timestamps in subscription:', subscriptionId);
          return NextResponse.json({ received: true, skipped: 'missing_timestamps' });
        }

        const currentPeriodStart = new Date(currentPeriodStartTimestamp * 1000);
        const currentPeriodEnd = new Date(currentPeriodEndTimestamp * 1000);

        // Validate that dates are valid
        if (isNaN(currentPeriodStart.getTime()) || isNaN(currentPeriodEnd.getTime())) {
          console.error('Invalid period dates in subscription:', subscriptionId);
          return NextResponse.json({ received: true, skipped: 'invalid_dates' });
        }

        const cancelAtPeriodEnd = subscription.cancel_at_period_end;
        const canceledAt = subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null;
        const endedAt = subscription.ended_at ? new Date(subscription.ended_at * 1000) : null;

        const metadata = subscription.metadata || {};
        const licenseKey = metadata.licenseKey;
        const email = metadata.email;
        const plan = metadata.plan;

        // Note: usage of 'metadata' relies on it being copied from Checkout Session to Subscription
        // Ensure 'subscription_data.metadata' was set in Checkout Session creation.

        // Upsert Subscription Record
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
        } else if (licenseKey && email && plan) {
          // Create if missing (e.g. if webhook arrived before checkout session ?)
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
        }

        // Update License Expiration & Status
        // Finding license by key (if we have it) or by subscription_id
        if (existingSub || licenseKey) {
          const client = (await import('@/lib/supabase-storage')).getSupabaseClient();

          // If active, extend license expiry to period end
          if (status === 'active' || status === 'trialing') {
            const updateData: any = {
              subscription_status: status,
              subscription_current_period_end: currentPeriodEnd.toISOString(),
              subscription_cancel_at_period_end: cancelAtPeriodEnd,
              expires_at: currentPeriodEnd.toISOString() // Sync license expiry with sub period
            };

            if (licenseKey) {
              // Check if license exists
              const { data: existingLicense } = await client
                .from('licenses')
                .select('id')
                .eq('license_key', licenseKey)
                .maybeSingle();

              if (existingLicense) {
                await client.from('licenses').update(updateData).eq('license_key', licenseKey);
              } else {
                // License missing (e.g. Standard Flow where PI event was skipped) - CREATE IT
                console.log(`License missing for active subscription ${subscriptionId}, creating...`);

                // Get price from subscription items
                const priceItem = subscription.items.data[0]?.price;
                const amountCents = priceItem?.unit_amount || 0;
                const amountDollars = amountCents / 100;
                const fullName = metadata.fullName || 'Valued Customer';

                await createLicense({
                  licenseKey,
                  email: email || '',
                  plan: plan || 'pro_monthly', // fallback
                  expiresAt: currentPeriodEnd,
                  paymentId: subscription.latest_invoice as string, // Link to invoice
                  amount: amountDollars,
                  currency: priceItem?.currency || 'usd',
                  payment_type: 'subscription',
                  subscription_id: subscriptionId,
                  subscription_status: status
                });

                if (email) {
                  // Generate a magic link for easy login
                  const magicLinkToken = await createMagicLinkToken(email);
                  const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-magic-link?token=${magicLinkToken}`;

                  await sendStripeLicenseEmail({
                    to: email,
                    fullName: fullName,
                    licenseKey: licenseKey,
                    plan: plan || 'Subscription',
                    orderId: typeof subscription.latest_invoice === 'string' ? subscription.latest_invoice : subscription.latest_invoice?.id || 'SUB-INV',
                    amount: amountDollars,
                    magicLinkUrl: magicLinkUrl
                  });
                }
              }

            } else {
              // No license key in metadata? Try to find by subscription_id
              await client.from('licenses').update(updateData).eq('subscription_id', subscriptionId);
            }
          } else {
            // Past due, canceled, unpaid
            await client.from('licenses').update({
              subscription_status: status,
              subscription_cancel_at_period_end: cancelAtPeriodEnd
            }).eq('subscription_id', subscriptionId);
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

        await updateSubscriptionStatus(subscription.id, {
          status: subscription.status,
          endedAt: new Date()
        });

        // Mark license as expired/canceled?
        // Usually we keep the expiry date as is, but if it was immediate cancel, we might need to check.
        // For now, just updating status is enough.
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

        // Ignore if this PI belongs to a subscription invoice (handled by checkout/invoice events)
        if ((paymentIntent as any).invoice) {
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
          order.full_name,
          licenseKey,
          order.plan,
          order.display_price,
          order.order_id,
          request
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
