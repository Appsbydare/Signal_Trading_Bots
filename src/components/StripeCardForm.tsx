"use client";

import { useState, FormEvent } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface StripeCardFormProps {
  orderId: string;
  amount: number;
  plan: string;
  agreedToTerms: boolean;
  onSuccess: () => void;
  onError: (error: string) => void;
  isUpgrade?: boolean;
}

export function StripeCardForm({
  orderId,
  amount,
  plan,
  agreedToTerms,
  onSuccess,
  onError,
  isUpgrade,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    console.log("Payment form submitted");
    console.log("Stripe loaded:", !!stripe);
    console.log("Elements loaded:", !!elements);
    console.log("Agreed to terms:", agreedToTerms);

    if (!stripe || !elements) {
      console.error("Stripe not initialized!");
      setErrorMessage("Payment system not ready. Please refresh the page.");
      return;
    }

    if (!agreedToTerms) {
      console.error("Terms not agreed!");
      setErrorMessage("Please agree to terms and conditions first.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    console.log("Starting payment confirmation...");

    const successUrl = `${window.location.origin}/payment-success?orderId=${orderId}${isUpgrade ? '&isUpgrade=true' : ''}`;

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: successUrl,
        },
        redirect: "if_required",
      });

      if (error) {
        // Show error to customer
        console.error("Payment error:", error);
        setErrorMessage(error.message || "An error occurred during payment");
        onError(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent) {
        if (paymentIntent.status === "succeeded") {
          // Payment succeeded
          console.log("Payment succeeded:", paymentIntent.id);
          onSuccess();
          // Use window.location.replace to prevent back button issues
          window.location.replace(`/payment-success?orderId=${orderId}${isUpgrade ? '&isUpgrade=true' : ''}`);
        } else if (paymentIntent.status === "processing") {
          // Payment is processing
          console.log("Payment processing:", paymentIntent.id);
          setErrorMessage("Payment is processing. Please wait...");
          // Redirect anyway - webhook will handle completion
          setTimeout(() => {
            window.location.replace(`/payment-success?orderId=${orderId}${isUpgrade ? '&isUpgrade=true' : ''}`);
          }, 2000);
        } else if (paymentIntent.status === "requires_payment_method") {
          // Payment failed - need new payment method
          setErrorMessage("Payment failed. Please try a different payment method.");
          setIsProcessing(false);
        } else {
          // Unknown status
          console.log("Payment status:", paymentIntent.status);
          setErrorMessage(`Payment status: ${paymentIntent.status}`);
          setIsProcessing(false);
        }
      } else {
        setErrorMessage("Payment response incomplete - please contact support");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("An unexpected error occurred");
      onError("Payment processing failed");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Payment Details
        </h3>
        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: {
              billingDetails: {
                email: "",
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Payment Error</p>
              <p className="mt-1 text-sm text-red-200">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Order Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Plan</span>
            <span className="text-white">{plan}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Amount</span>
            <span className="text-white">${amount} USD</span>
          </div>
          <div className="border-t border-zinc-700 pt-2">
            <div className="flex justify-between text-lg font-semibold text-white">
              <span>Total</span>
              <span>${amount} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Agreement Warning */}
      {!agreedToTerms && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.79-2.9L13.79 4.9a2 2 0 00-3.58 0L3.14 16.1A2 2 0 004.93 19z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-300">Terms Required</p>
              <p className="mt-1 text-sm text-amber-200">
                Please scroll up and agree to the terms and conditions before completing payment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || !agreedToTerms}
        className="w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing Payment...
          </span>
        ) : !agreedToTerms ? (
          "Agree to Terms Below to Pay"
        ) : (
          `Pay $${amount} USD`
        )}
      </button>

      {/* Security Notice */}
      <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <svg
            className="h-4 w-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>
            Secured by Stripe. Your payment information is encrypted and secure.
          </span>
        </div>
      </div>
    </form>
  );
}

