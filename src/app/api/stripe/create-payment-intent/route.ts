import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, isStripeEnabled } from '@/lib/stripe-server';
import { createStripeOrder } from '@/lib/orders-supabase';

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

    // Store order in database
    await createStripeOrder({
      orderId,
      paymentIntentId: paymentIntent.id,
      plan: planName,
      email,
      fullName,
      country,
      displayPrice,
    });

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

