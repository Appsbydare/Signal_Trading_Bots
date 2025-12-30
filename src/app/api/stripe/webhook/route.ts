import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe-server';
import { generateLicenseKey } from '@/lib/license-keys';
import { sendStripeLicenseEmail } from '@/lib/email-stripe';
import { getStripeOrderByPaymentIntent, updateStripeOrderByPaymentIntent } from '@/lib/orders-supabase';
import { createLicense } from '@/lib/license-db';
import { getCustomerByEmail, createCustomer } from '@/lib/auth-users';
import { createMagicLinkToken } from '@/lib/auth-tokens';
import { createDownloadToken, getExeFileName } from '@/lib/download-tokens';
import { isR2Enabled } from '@/lib/r2-client';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);

        // Get order from database using PaymentIntent ID
        const order = await getStripeOrderByPaymentIntent(paymentIntent.id);

        if (!order) {
          console.error('Order not found for PaymentIntent:', paymentIntent.id);
          // Still return 200 to acknowledge receipt
          return NextResponse.json({ received: true });
        }

        // Generate license key
        const licenseKey = generateLicenseKey();

        // Calculate expiry date based on plan
        const now = new Date();
        const expiresAt = new Date(now);
        if (order.plan.toLowerCase() === "starter") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (order.plan.toLowerCase() === "pro") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else if (order.plan.toLowerCase() === "lifetime") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 100); // 100 years for lifetime
        } else {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Default to yearly
        }

        // Create license in database
        try {
          await createLicense({
            licenseKey,
            email: order.email,
            plan: order.plan,
            expiresAt,
            paymentId: paymentIntent.id,
            amount: order.display_price,
            currency: "USD",
          });
        } catch (dbError) {
          console.error("Failed to create license in database:", dbError);
          // Continue to send email even if license creation fails - can be retried
        }

        // Update order status in database
        await updateStripeOrderByPaymentIntent(paymentIntent.id, 'paid', licenseKey);

        // --- NEW: Magic Link Logic ---
        // 1. Check if customer exists or create new one
        let customer = await getCustomerByEmail(order.email);
        if (!customer) {
          try {
            // Create new customer with random password (placeholder)
            // In a real magic-link flow, password might be optional, but our DB requires it.
            const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            customer = await createCustomer({
              email: order.email,
              password: randomPassword,
              name: order.full_name,
            });
            console.log("Auto-created customer for email:", order.email);
          } catch (err: any) {
            console.error("Failed to auto-create customer:", err);

            // Check if it's a duplicate constraint error
            if (err.code === '23505') {
              console.log("Customer already exists (race condition), fetching existing customer...");
              customer = await getCustomerByEmail(order.email);
            }

            if (!customer) {
              console.error("Customer still not found after creation failure. Will proceed without customer record.");
              // The magic link will still work as it's email-based
              // Customer record can be created later when they first log in manually
            }
          }
        }

        // 2. Generate Magic Link
        let magicLinkUrl = "https://www.signaltradingbots.com/login"; // Fallback
        try {
          // Detect host from request if possible, or use env var
          const host = request.headers.get("host") || "www.signaltradingbots.com";
          const protocol = host.includes("localhost") ? "http" : "https";

          const token = await createMagicLinkToken(order.email);
          magicLinkUrl = `${protocol}://${host}/api/auth/magic-login?token=${token}`;
        } catch (err) {
          console.error("Failed to generate magic link:", err);
        }

        // 3. Generate Download Link (R2 Signed URL)
        let downloadUrl = "";
        try {
          if (isR2Enabled()) {
            const ipAddress = request.headers.get("x-forwarded-for") ||
              request.headers.get("x-real-ip") ||
              "webhook";
            const userAgent = request.headers.get("user-agent") || "stripe-webhook";

            const downloadToken = await createDownloadToken({
              licenseKey,
              email: order.email,
              fileName: getExeFileName(),
              ipAddress,
              userAgent,
            });

            // Generate proxy URL instead of direct R2 URL
            const host = request.headers.get("host") || "www.signaltradingbots.com";
            const protocol = host.includes("localhost") ? "http" : "https";
            downloadUrl = `${protocol}://${host}/api/download/${downloadToken.token}`;

            console.log(`✅ Generated download link for order ${order.order_id}`);
          } else {
            console.warn("⚠️ R2 not configured, skipping download link generation");
          }
        } catch (err) {
          console.error("Failed to generate download link:", err);
          // Don't fail the webhook - download can be regenerated later
        }

        // Send license email
        try {
          await sendStripeLicenseEmail({
            to: order.email,
            fullName: order.full_name,
            licenseKey,
            plan: order.plan,
            orderId: order.order_id,
            amount: order.display_price,
            magicLinkUrl,
            downloadUrl, // Add download URL
          });
          console.log('License email sent successfully to:', order.email);
        } catch (emailError) {
          console.error('Failed to send license email:', emailError);
          // Don't fail the webhook - we can retry email later
        }

        console.log('Order processed successfully:', order.order_id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', paymentIntent.id);

        // Get order and update status
        const order = await getStripeOrderByPaymentIntent(paymentIntent.id);
        if (order) {
          await updateStripeOrderByPaymentIntent(paymentIntent.id, 'failed');
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';

