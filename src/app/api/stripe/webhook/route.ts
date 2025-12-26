import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe-server';
import { generateLicenseKey } from '@/lib/license-keys';
import { sendStripeLicenseEmail } from '@/lib/email-stripe';
import Stripe from 'stripe';

// Import the orders map from create-payment-intent
// In production, this should be a shared database
import { stripeOrders } from '../create-payment-intent/route';

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

        // Get order from storage using PaymentIntent ID
        const order = stripeOrders.get(paymentIntent.id);
        
        if (!order) {
          console.error('Order not found for PaymentIntent:', paymentIntent.id);
          // Still return 200 to acknowledge receipt
          return NextResponse.json({ received: true });
        }

        // Generate license key
        const licenseKey = generateLicenseKey();

        // Update order status
        order.status = 'paid';
        order.licenseKey = licenseKey;
        order.paidAt = new Date().toISOString();
        stripeOrders.set(order.orderId, order);

        // Send license email
        try {
          await sendStripeLicenseEmail({
            to: order.email,
            fullName: order.fullName,
            licenseKey,
            plan: order.plan,
            orderId: order.orderId,
            amount: order.displayPrice,
          });
          console.log('License email sent successfully to:', order.email);
        } catch (emailError) {
          console.error('Failed to send license email:', emailError);
          // Don't fail the webhook - we can retry email later
        }

        console.log('Order processed successfully:', order.orderId);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', paymentIntent.id);

        // Get order and update status
        const order = stripeOrders.get(paymentIntent.id);
        if (order) {
          order.status = 'failed';
          order.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
          stripeOrders.set(order.orderId, order);
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

