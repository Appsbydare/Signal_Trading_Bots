import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, isStripeEnabled } from '@/lib/stripe-server';

// In production, use a database. For now, we'll use in-memory storage
// This should be replaced with a real database or shared with orders/create
import { stripeOrders } from "@/lib/orders-db";
// In production, use a database. For now, we'll use in-memory storage available in lib/orders-db

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
    const { plan, email, fullName, country } = body;

    // Validate required fields
    if (!plan || !email || !fullName || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine price based on plan
    const displayPrice = plan === 'lifetime' ? 999 : plan === 'pro' ? 49 : 29;
    const planName = plan === 'lifetime' ? 'Lifetime' : plan === 'pro' ? 'Pro' : 'Starter';

    // Generate unique order ID
    const orderId = `ORD-STRIPE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create Stripe PaymentIntent
    const paymentIntent = await createPaymentIntent(displayPrice, {
      orderId,
      plan: planName,
      email,
      fullName,
      country,
    });

    // Store order information
    const order = {
      orderId,
      plan: planName,
      email,
      fullName,
      country,
      displayPrice,
      paymentIntentId: paymentIntent.id,
      status: 'pending_payment',
      paymentMethod: 'card',
      createdAt: new Date().toISOString(),
      licenseKey: null,
    };

    stripeOrders.set(orderId, order);
    stripeOrders.set(paymentIntent.id, order); // Also store by PaymentIntent ID for webhook lookup

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
      amount: displayPrice,
    });
  } catch (error) {
    console.error('PaymentIntent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

// Export orders map for webhook access
// Export orders map removed (using shared db)

