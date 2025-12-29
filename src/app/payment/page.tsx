"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeCardForm } from "@/components/StripeCardForm";

// Initialize Stripe (only if key is available)
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function PaymentForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "starter";
  const isPro = plan === "pro";
  const isLifetime = plan === "lifetime";
  const price = isLifetime ? 999 : isPro ? 49 : 2.9;
  const planName = isLifetime ? "Lifetime" : isPro ? "Pro" : "Starter";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    hardwareFingerprint: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);

  const [creatingOrder, setCreatingOrder] = useState(false);
  
  // Stripe-specific state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeOrderId, setStripeOrderId] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);

  // Reset Stripe state when switching away from card payment
  useEffect(() => {
    if (selectedPayment !== "card") {
      setClientSecret(null);
      setStripeOrderId(null);
      setShowStripeForm(false);
      setLoadingStripe(false);
    }
  }, [selectedPayment]);

  // Auto-create PaymentIntent when card payment is selected
  useEffect(() => {
    if (selectedPayment === "card" && !clientSecret && formData.email && formData.fullName && formData.country) {
      createStripePaymentIntent();
    }
  }, [selectedPayment, formData.email, formData.fullName, formData.country]);

  const createStripePaymentIntent = async () => {
    if (loadingStripe || clientSecret) return;
    
    setLoadingStripe(true);
    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          email: formData.email,
          fullName: formData.fullName,
          country: formData.country,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 503) {
          alert("Payment system is currently unavailable. Please try cryptocurrency payment or contact support.");
        } else {
          alert(data.error || "Failed to initialize payment. Please try again.");
        }
        return;
      }

      if (data.clientSecret && data.orderId) {
        setClientSecret(data.clientSecret);
        setStripeOrderId(data.orderId);
        setShowStripeForm(true);
      } else {
        alert("Failed to initialize payment. Please try again.");
      }
    } catch (error) {
      console.error("Error creating PaymentIntent:", error);
      alert("Error initializing payment. Please try cryptocurrency payment or contact support.");
    } finally {
      setLoadingStripe(false);
    }
  };

  // Helper function to get crypto icon
  const getCryptoIcon = (coin: string) => {
    const icons: Record<string, string> = {
      BTC: "₿",
      ETH: "Ξ",
      BNB: "BNB",
      USDT: "₮",
      USDC: "₮",
    };
    return icons[coin] || "●";
  };

  // Helper function to get network badge color
  const getNetworkBadgeColor = (network: string) => {
    const colors: Record<string, string> = {
      TRC20: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      ERC20: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      BTC: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      BSC: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    return colors[network] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  };

  const cryptoOptions = [
    { value: "USDT-TRC20", label: "USDT (TRC20)", coin: "USDT", network: "TRC20", description: "Tron Network - Fast & Low Fees" },
    { value: "USDT-ERC20", label: "USDT (ERC20)", coin: "USDT", network: "ERC20", description: "Ethereum Network - ERC20 Token" },
    { value: "USDC-ERC20", label: "USDC (ERC20)", coin: "USDC", network: "ERC20", description: "Ethereum Network - ERC20 Token" },
    { value: "BTC", label: "Bitcoin (BTC)", coin: "BTC", network: "BTC", description: "Bitcoin Network" },
    { value: "BNB", label: "BNB (BSC)", coin: "BNB", network: "BSC", description: "Binance Smart Chain" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For card payments, do nothing - Stripe form handles submission
    if (selectedPayment === "card") {
      console.log("Card payment - Stripe form will handle submission");
      return;
    }
    
    // This only handles crypto payments
    if (selectedPayment === "crypto") {
      if (!agreedToTerms || !selectedCrypto) return;

      setCreatingOrder(true);

      try {
        // Create crypto order
        const response = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan,
            email: formData.email,
            fullName: formData.fullName,
            country: formData.country,
            coinNetwork: selectedCrypto,
          }),
        });

        const data = await response.json();

        if (data.orderId) {
          // Redirect to crypto payment page
          window.location.href = `/payment-crypto?orderId=${data.orderId}&coin=${data.coin}&network=${data.network}`;
        } else {
          alert("Failed to create order. Please try again.");
          setCreatingOrder(false);
        }
      } catch (error) {
        alert("Error creating order. Please try again.");
        setCreatingOrder(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-6">
          <Link href="/products" className="text-sm text-zinc-400 hover:text-zinc-300">
            ← Back to Products
          </Link>
        </div>

        <h1 className="reveal mb-2 text-2xl font-semibold tracking-tight text-white">
          Complete Your Purchase
        </h1>
        <p className="reveal mb-8 text-sm text-zinc-400">Telegram Trading Bot - {planName} Plan</p>

        <div className="space-y-6">
          {/* Customer Information */}
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-zinc-500">License key will be sent to this email</p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">
                  Country <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Important Warning */}
          <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 19h14.14a2 2 0 001.79-2.9L13.79 4.9a2 2 0 00-3.58 0L3.14 16.1A2 2 0 004.93 19z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-amber-300">Important Warning</h2>
            </div>
            <div className="space-y-3 text-sm text-amber-100/90">
              <p>
                <span className="font-semibold text-amber-200">Demo First:</span> Test with a demo account to understand SL/TP
                settings for your signal provider.
              </p>
              <p>
                <span className="font-semibold text-amber-200">Not Financial Advice:</span> signaltradingbots is a software
                company, not financial advisers.
              </p>
              <p>
                <span className="font-semibold text-amber-200">High Risk:</span> 95%+ of traders lose money. Practice with demo first!
              </p>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Select Payment Method</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSelectedPayment("card")}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  selectedPayment === "card"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500/20">
                      <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Credit / Debit Card</p>
                      <p className="text-sm text-zinc-400">Visa, Mastercard, Amex, etc.</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">Available</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayment("crypto")}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  selectedPayment === "crypto"
                    ? "border-green-500 bg-green-500/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-green-500/20">
                      <span className="text-xl font-bold text-green-400">₿</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Cryptocurrency</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-zinc-400">USDT, Bitcoin, BNB & more</p>
                        <div className="flex gap-1">
                          <span className="rounded border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-400">TRC20</span>
                          <span className="rounded border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">ERC20</span>
                          <span className="rounded border border-yellow-500/30 bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400">BSC</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="rounded-md bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">Available</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayment("binance")}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  selectedPayment === "binance"
                    ? "border-yellow-500 bg-yellow-500/10"
                    : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                      <span className="text-lg font-bold text-yellow-400">BNB</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Binance Pay</p>
                      <p className="text-sm text-zinc-400">Quick crypto payment via Binance</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400">Coming Soon</span>
                </div>
              </button>
            </div>
          </section>

          {/* Crypto Selection - Show when crypto payment is selected */}
          {selectedPayment === "crypto" && (
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Select Cryptocurrency</h2>
              <div className="space-y-3">
                {cryptoOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedCrypto(option.value)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      selectedCrypto === option.value
                        ? "border-green-500 bg-green-500/10"
                        : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-700/50 text-2xl">
                          {getCryptoIcon(option.coin)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{option.label}</p>
                            <span className={`rounded border px-2 py-0.5 text-xs font-medium ${getNetworkBadgeColor(option.network)}`}>
                              {option.network}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400">{option.description}</p>
                        </div>
                      </div>
                      {selectedCrypto === option.value && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {!selectedCrypto && (
                <p className="mt-3 text-sm text-amber-400">Please select a cryptocurrency to continue</p>
              )}
            </section>
          )}

          {/* Payment Methods Disclaimer */}
          <section className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
            <p className="text-xs text-zinc-500">
              Payment method names and network identifiers are used for identification purposes only. 
              We are not affiliated with, endorsed by, or partnered with any payment provider or blockchain network.
            </p>
          </section>

          {/* Terms & Conditions - Show when card payment is selected */}
          {selectedPayment === "card" && (
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Terms & Conditions</h2>
              <div className="max-h-48 space-y-2 overflow-y-auto pr-2 text-sm text-zinc-400">
                <ul className="list-disc space-y-1 pl-5">
                  <li>All purchases are final and non-refundable once the license key has been delivered.</li>
                  <li>Your license key will be sent to the provided email address within 24 hours of payment confirmation.</li>
                  <li>Each license is valid for one trading account activation only.</li>
                  <li>Cryptocurrency payments may take up to 1 hour for blockchain confirmation.</li>
                  <li>You agree to use the software in accordance with our Terms of Service.</li>
                </ul>
              </div>
              <div className="mt-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-zinc-300">
                  I agree to the terms and conditions, and understand that cryptocurrency payments are non-refundable{" "}
                  <span className="text-red-400">*</span>
                </label>
              </div>
            </section>
          )}

          {/* Stripe Payment Form - Show when card payment is selected */}
          {selectedPayment === "card" && (
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Card Payment</h2>
              
              {loadingStripe && !clientSecret && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-10 w-10 animate-spin text-blue-500"
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
                    <p className="mt-3 text-sm text-zinc-400">Initializing secure payment...</p>
                  </div>
                </div>
              )}

              {showStripeForm && clientSecret && stripeOrderId && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#3b82f6",
                        colorBackground: "#18181b",
                        colorText: "#ffffff",
                        colorDanger: "#ef4444",
                        fontFamily: "system-ui, sans-serif",
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <StripeCardForm
                    orderId={stripeOrderId}
                    amount={price}
                    plan={planName}
                    agreedToTerms={agreedToTerms}
                    onSuccess={() => {
                      console.log("Payment successful");
                    }}
                    onError={(error) => {
                      console.error("Payment error:", error);
                    }}
                  />
                </Elements>
              )}
            </section>
          )}

          {/* Terms & Conditions - Show when crypto payment is selected */}
          {selectedPayment === "crypto" && (
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Terms & Conditions</h2>
              <div className="max-h-48 space-y-2 overflow-y-auto pr-2 text-sm text-zinc-400">
                <ul className="list-disc space-y-1 pl-5">
                  <li>All purchases are final and non-refundable once the license key has been delivered.</li>
                  <li>Your license key will be sent to the provided email address within 24 hours of payment confirmation.</li>
                  <li>Each license is valid for one trading account activation only.</li>
                  <li>Cryptocurrency payments may take up to 1 hour for blockchain confirmation.</li>
                  <li>You agree to use the software in accordance with our Terms of Service.</li>
                </ul>
              </div>
              <div className="mt-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-zinc-300">
                  I agree to the terms and conditions, and understand that cryptocurrency payments are non-refundable{" "}
                  <span className="text-red-400">*</span>
                </label>
              </div>
            </section>
          )}

          {/* Payment Summary */}
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white">${price} USD</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Processing Fee</span>
                <span className="text-white">$0 USD</span>
              </div>
              <div className="border-t border-zinc-700 pt-2">
                <div className="flex justify-between text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>${price} USD</span>
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons - Only show for crypto payments */}
          {selectedPayment === "crypto" && (
            <form onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <Link
                  href="/products"
                  className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-6 py-3 text-center font-medium text-white hover:bg-zinc-700"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={
                    !agreedToTerms || 
                    !selectedCrypto ||
                    creatingOrder
                  }
                  className="flex-1 rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingOrder ? "Creating Order..." : "Proceed to Payment"}
                </button>
              </div>
            </form>
          )}

          {/* Cancel button for card payments */}
          {selectedPayment === "card" && (
            <div className="flex justify-center">
              <Link
                href="/products"
                className="rounded-md border border-zinc-700 bg-zinc-800 px-8 py-3 text-center font-medium text-white hover:bg-zinc-700"
              >
                ← Back to Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 py-12 text-center text-white">Loading...</div>}>
      <PaymentForm />
    </Suspense>
  );
}

