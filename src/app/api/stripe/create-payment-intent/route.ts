import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, isStripeEnabled, getOrCreateStripeCustomer, createSubscription, stripe } from '@/lib/stripe-server';
import { createStripeOrder } from '@/lib/orders-supabase';
import { getPlanConfig, isSubscriptionPlan } from '@/lib/stripe-products';
import { generateLicenseKey } from '@/lib/license-keys';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeEnabled()) {
      return NextResponse.json(
        {
          error: 'Payment system is not configured. Please contact support.',
          details: 'Stripe payment processing is currently unavailable.'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { plan, email, fullName, country, isUpgrade, creditAmount, upgradeLicenseKey } = body;

    // Validate required fields
    if (!plan || !email || !fullName || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Construct valid plan key for API
    let apiPlanKey = plan;
    if (plan === "starter" || plan === "pro") {
      apiPlanKey = `${plan}_monthly`;
    }

    const planConfig = getPlanConfig(apiPlanKey);
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer({
      email,
      name: fullName,
      metadata: { country },
    });

    // Generate license key upfront
    const licenseKey = generateLicenseKey();
    const orderId = `ORD-STRIPE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let clientSecret: string | null = null;
    let subscriptionId: string | undefined;

    if (isSubscriptionPlan(apiPlanKey)) {
      // Check for existing incomplete subscription for this customer and plan
      // If one exists, we cancel it and create a new one to ensure we get a fresh 
      // confirmation_secret/payment_intent which are only available on creation/update.
      const existingSubscriptions = await stripe!.subscriptions.list({
        customer: customerId,
        price: planConfig.priceId,
        status: 'incomplete',
        limit: 1,
      });

      if (existingSubscriptions.data.length > 0) {
        const oldSub = existingSubscriptions.data[0];
        console.log('Canceling old incomplete subscription to create a fresh one:', oldSub.id);
        try {
          await stripe!.subscriptions.cancel(oldSub.id);
        } catch (err) {
          console.error('Error canceling old subscription:', err);
        }
      }

      // Create NEW Subscription (always fresh)
      const subscription = await createSubscription({
        customerId,
        priceId: planConfig.priceId,
        metadata: {
          plan: apiPlanKey,
          email,
          fullName,
          country,
          licenseKey,
          isUpgrade: isUpgrade ? "true" : "false",
          upgradeLicenseKey: upgradeLicenseKey || "",
          orderId,
        }
      });

      subscriptionId = subscription.id;

      let latestInvoice = subscription.latest_invoice;

      // Handle string invoice ID
      if (typeof latestInvoice === 'string') {
        latestInvoice = await stripe!.invoices.retrieve(latestInvoice, {
          expand: ['payment_intent']
        });
      }

      if (!latestInvoice || typeof latestInvoice === 'string') {
        console.error('Failed to retrieve invoice from subscription. Value:', latestInvoice);
        throw new Error('Failed to retrieve invoice from subscription');
      }

      console.log('Invoice retrieved:', latestInvoice.id, 'Status:', latestInvoice.status);
      console.log('Invoice collection_method:', latestInvoice.collection_method);
      console.log('Invoice PaymentIntent field:', (latestInvoice as any).payment_intent);
      console.log('Invoice confirmation_secret:', (latestInvoice as any).confirmation_secret);

      let paymentIntent = (latestInvoice as any).payment_intent;
      let confirmationSecret = (latestInvoice as any).confirmation_secret;

      // Handle string PaymentIntent ID
      if (typeof paymentIntent === 'string') {
        paymentIntent = await stripe!.paymentIntents.retrieve(paymentIntent);
      }

      // If we have a confirmation_secret, use it to get the client_secret
      if (confirmationSecret && confirmationSecret.client_secret) {
        console.log("Using confirmation_secret for client_secret");
        clientSecret = confirmationSecret.client_secret;

        // We still need the PaymentIntent for order tracking
        if (!paymentIntent) {
          if (confirmationSecret.payment_intent) {
            // If confirmation_secret has payment_intent field
            if (typeof confirmationSecret.payment_intent === 'string') {
              paymentIntent = await stripe!.paymentIntents.retrieve(confirmationSecret.payment_intent);
            } else {
              paymentIntent = confirmationSecret.payment_intent;
            }
          } else {
            // Extract PaymentIntent ID from client_secret (format: pi_xxx_secret_yyy)
            const piMatch = confirmationSecret.client_secret.match(/^(pi_[^_]+)/);
            if (piMatch) {
              const piId = piMatch[1];
              console.log("Extracting PaymentIntent ID from client_secret:", piId);
              try {
                paymentIntent = await stripe!.paymentIntents.retrieve(piId);
              } catch (err) {
                console.error("Failed to retrieve PI from client_secret:", err);
              }
            }
          }
        }
      } else if (paymentIntent) {
        // Use traditional payment_intent.client_secret
        clientSecret = paymentIntent.client_secret;
      }

      // If still missing both, we must error out.
      // Do NOT fall back to manual PI creation as it decouples payment from the subscription
      // and leads to "incomplete" subscriptions with "succeeded" orphaned payments.
      if (!clientSecret || !paymentIntent) {
        console.error('Standard Subscription PI flow failed. Missing client_secret and payment_intent.');
        return NextResponse.json(
          { error: "Failed to initialize subscription payment. Please try again." },
          { status: 500 }
        );
      }

      // Store order in database using the PaymentIntent
      await createStripeOrder({
        orderId,
        paymentIntentId: paymentIntent.id,
        plan: planConfig.name,
        email,
        fullName,
        country,
        displayPrice: planConfig.amount,
      });

    } else {
      // Lifetime Plan (One-time payment)
      let displayPrice: number = planConfig.amount;

      // Apply upgrade credit if applicable
      if (isUpgrade && creditAmount) {
        displayPrice = Math.max(0.5, displayPrice - Number(creditAmount)); // Ensure at least $0.50 for Stripe
      }

      const paymentIntent = await createPaymentIntent(displayPrice, {
        orderId,
        plan: planConfig.name,
        email,
        fullName,
        country,
        isUpgrade: isUpgrade ? "true" : "false",
        upgradeLicenseKey: upgradeLicenseKey || "",
      });

      clientSecret = paymentIntent.client_secret;

      // Store order in database for lifetime plans
      await createStripeOrder({
        orderId,
        paymentIntentId: paymentIntent.id,
        plan: planConfig.name,
        email,
        fullName,
        country,
        displayPrice,
      });
    }

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Failed to generate payment intent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret,
      orderId,
      amount: planConfig.amount,
      subscriptionId,
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
