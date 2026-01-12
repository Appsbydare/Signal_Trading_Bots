"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, Suspense, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeCardForm } from "@/components/StripeCardForm";
import { EmailVerification } from "@/components/EmailVerification";
import { CountrySelect } from "@/components/CountrySelect";

// Initialize Stripe (only if key is available)
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function PaymentForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "starter";
  const isYearly = plan.endsWith("_yearly");
  const basePlan = isYearly ? plan.replace("_yearly", "") : plan;

  const isPro = basePlan === "pro";
  const isLifetime = plan === "lifetime";

  // Check if this is an upgrade from monthly to yearly
  const isUpgrade = searchParams.get("upgrade") === "true";
  const creditAmount = parseFloat(searchParams.get("credit") || "0");

  let basePrice = 29;
  if (isLifetime) basePrice = 999;
  else if (isPro) basePrice = isYearly ? 529 : 49;
  else basePrice = isYearly ? 313 : 29; // Starter

  // Apply credit if upgrading
  // price is calculated dynamically in render or derived state now
  // const price = isUpgrade && creditAmount > 0 ? Math.max(0, basePrice - creditAmount) : basePrice;

  const planName = isLifetime
    ? "Lifetime"
    : `${isPro ? "Pro" : "Starter"}${isYearly ? " (Yearly)" : ""}`;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    hardwareFingerprint: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [purchaseForDifferentEmail, setPurchaseForDifferentEmail] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [selectedLicenseToUpgrade, setSelectedLicenseToUpgrade] = useState<string>("");
  const [isLicenseLocked, setIsLicenseLocked] = useState(searchParams.get("lock") === "true");
  const initialCredit = parseFloat(searchParams.get("credit") || "0");
  const [dynamicCredit, setDynamicCredit] = useState(initialCredit);

  // Effect to handle URL parameters on initial load
  useEffect(() => {
    // Check for pre-selected license key (Locked mode)
    const licenseKeyParam = searchParams.get("license_key");
    if (licenseKeyParam) {
      setSelectedLicenseToUpgrade(licenseKeyParam);
      setIsLicenseLocked(true);
    }
  }, [searchParams]);

  // Check if user is logged in and pre-fill their data
  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.customer) {
          setIsLoggedIn(true);
          setLoggedInUserEmail(data.customer.email);

          // Auto-fill form with customer data from customers table
          const autoFilledName = data.customer.name || "";
          const autoFilledCountry = data.customer.country || "";

          setLicenses(data.customer.licenses || []);

          // Pre-select first eligible license if upgrading
          // Only if NOT provided in URL (searchParams)
          const urlKey = searchParams.get("license_key");
          if (isUpgrade && data.customer.licenses?.length > 0 && !selectedLicenseToUpgrade && !urlKey) {
            // Only select active, non-lifetime licenses (allow subscriptions)
            const eligible = data.customer.licenses.find((l: any) =>
              l.status === 'active' &&
              l.plan.toLowerCase() !== 'lifetime'
            );
            if (eligible) {
              setSelectedLicenseToUpgrade(eligible.license_key);
            }
          }

          setFormData(prev => ({
            ...prev,
            email: data.customer.email,
            fullName: autoFilledName,
            country: autoFilledCountry,
          }));
          setEmailVerified(true); // Skip email verification for logged-in users

          console.log("Auto-filled customer data:", {
            name: autoFilledName,
            country: autoFilledCountry,
            licenseCount: data.customer.licenses?.length || 0
          });
        }
        setLoadingUser(false);
      })
      .catch(() => {
        setLoadingUser(false);
      });
  }, []);

  const getDaysRemaining = (expiresAt: string) => {
    if (!expiresAt) return 0;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / msPerDay));
  };

  // Recalculate credit when selected license changes
  useEffect(() => {
    if (!isUpgrade || !selectedLicenseToUpgrade || licenses.length === 0) return;

    const license = licenses.find((l: any) => l.license_key === selectedLicenseToUpgrade);
    if (license && license.expires_at) {
      // Check if license is active monthly
      const isMonthly = !license.plan.toLowerCase().includes('yearly') && license.plan.toLowerCase() !== 'lifetime';

      if (isMonthly) {
        const daysRemaining = getDaysRemaining(license.expires_at);

        const monthlyPrice = license.plan.toLowerCase().includes('pro') ? 49 : 29;
        const dailyRate = monthlyPrice / 30;

        const credit = Math.min(Math.ceil(dailyRate * daysRemaining), monthlyPrice);

        setDynamicCredit(credit);
      }
    }
  }, [selectedLicenseToUpgrade, licenses, isUpgrade]);

  const finalPrice = isUpgrade ? Math.max(0, basePrice - dynamicCredit) : basePrice;

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
    console.log("Payment Intent Check:", {
      selectedPayment,
      hasClientSecret: !!clientSecret,
      email: formData.email,
      fullName: formData.fullName,
      country: formData.country,
      isLoggedIn,
    });

    if (selectedPayment === "card" && !clientSecret && formData.email && formData.fullName && formData.country && isLifetime) {
      console.log("Creating PaymentIntent for Lifetime plan...");
      createStripePaymentIntent();
    }
  }, [selectedPayment, formData.email, formData.fullName, formData.country, clientSecret, isLoggedIn, isLifetime]);

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
          isUpgrade,
          creditAmount: dynamicCredit,
          upgradeLicenseKey: selectedLicenseToUpgrade,
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

  const handleSubscriptionCheckout = async () => {
    if (!formData.email || !formData.fullName || !formData.country || !agreedToTerms) return;

    setLoadingStripe(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
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

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout. Please try again.");
        setLoadingStripe(false);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Error initializing checkout. Please try again.");
      setLoadingStripe(false);
    }
  };

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
            finalPrice: finalPrice, // Pass the discounted price
            isUpgrade,
            creditAmount: dynamicCredit,
            upgradeLicenseKey: selectedLicenseToUpgrade,
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

  // NEW Filter: Allow active licenses (including subscriptions), only exclude lifetime
  const eligibleUpgradeLicenses = licenses.filter((l: any) =>
    l.status === 'active' &&
    l.plan.toLowerCase() !== 'lifetime'
  );

  const selectedLicenseObj = licenses.find((l: any) => l.license_key === selectedLicenseToUpgrade);
  const isSubscriptionDetailsUpgrade = isUpgrade && isLoggedIn && (selectedLicenseObj?.subscription_id || selectedLicenseObj?.payment_type === 'subscription');

  const showPortalRedirect = isUpgrade && isLoggedIn && licenses.length > 0 && eligibleUpgradeLicenses.length === 0;

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

        {loadingUser ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5e17eb] border-r-transparent"></div>
            <p className="mt-4 text-sm text-zinc-400">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upgrade Banner */}
            {isUpgrade && (
              <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-emerald-300">
                      {isSubscriptionDetailsUpgrade ? "Update Subscription Plan" : "Upgrading to Yearly Plan"}
                    </h2>

                    {/* License Selection for Upgrade (Always Eligible) */}
                    {isLoggedIn && licenses.length > 0 && (
                      <div className="mt-3 mb-3">
                        <label className="block text-xs font-semibold text-emerald-200 mb-1">
                          Select License to Upgrade:
                        </label>

                        {isLicenseLocked ? (
                          <div className="relative rounded-md bg-emerald-900/40 border border-emerald-500/30 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const lockedLicense = licenses.find((l: any) => l.license_key === selectedLicenseToUpgrade);
                                const days = lockedLicense ? getDaysRemaining(lockedLicense.expires_at) : 0;
                                return (
                                  <div className="text-sm text-emerald-100">
                                    <span className="font-semibold text-emerald-300">{lockedLicense?.plan}</span>
                                    <span className="mx-2 text-emerald-500/50">|</span>
                                    <span>{days} days left</span>
                                    <span className="ml-2 text-xs text-emerald-400/60">({lockedLicense?.license_key.substring(0, 12)}...)</span>
                                  </div>
                                );
                              })()}
                            </div>
                            <button
                              onClick={() => setIsLicenseLocked(false)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              value={selectedLicenseToUpgrade}
                              onChange={(e) => setSelectedLicenseToUpgrade(e.target.value)}
                              className="w-full appearance-none rounded-md bg-emerald-900/60 border border-emerald-500/30 text-emerald-100 text-sm pl-4 pr-10 py-3 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 shadow-inner"
                            >
                              {eligibleUpgradeLicenses.map((l: any) => {
                                const days = getDaysRemaining(l.expires_at);
                                return (
                                  <option key={l.id} value={l.license_key} className="bg-zinc-900 text-zinc-200 py-2">
                                    {l.plan} — {days} days left (ends {l.license_key.substring(0, 8)}...)
                                  </option>
                                );
                              })}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-emerald-300">
                              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <p className="mt-1 text-xs text-emerald-200/60">
                          This license will be extended and upgraded.
                        </p>
                      </div>
                    )}

                    {isSubscriptionDetailsUpgrade ? (
                      <>
                        <p className="mt-1 text-sm text-emerald-200/90">
                          You're upgrading from a monthly plan.
                        </p>
                        <div className="mt-3 rounded-md bg-emerald-500/20 p-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-200">Yearly Plan Price:</span>
                            <span className="font-semibold text-emerald-100">${basePrice}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-emerald-200">Prorated Credit:</span>
                            <span className="font-semibold text-emerald-100 italic">Calculated by Stripe</span>
                          </div>
                          <div className="border-t border-emerald-500/30 mt-2 pt-2 flex justify-between text-base">
                            <span className="font-semibold text-emerald-100">Total Due Today:</span>
                            <span className="font-bold text-emerald-50 italic text-sm">See Final Price in Portal</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-emerald-200/90">
                          You're upgrading from a monthly plan. We've applied a <strong>${dynamicCredit} credit</strong> for your remaining subscription days.
                        </p>
                        <div className="mt-3 rounded-md bg-emerald-500/20 p-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-200">Yearly Plan Price:</span>
                            <span className="font-semibold text-emerald-100">${basePrice}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-emerald-200">Prorated Credit:</span>
                            <span className="font-semibold text-emerald-100">-${dynamicCredit}</span>
                          </div>
                          <div className="border-t border-emerald-500/30 mt-2 pt-2 flex justify-between text-base">
                            <span className="font-semibold text-emerald-100">Total Due Today:</span>
                            <span className="font-bold text-emerald-50">${finalPrice}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Show logged-in user info */}
            {isLoggedIn && (
              <section className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-300 text-sm">Purchasing as Logged-In User</h3>
                    <p className="mt-1 text-xs text-blue-200/80">
                      Account Email: <span className="font-semibold">{loggedInUserEmail}</span>
                    </p>
                    {!purchaseForDifferentEmail && (
                      <p className="mt-1 text-xs text-blue-200/80">
                        Your new license will be added to your account automatically.
                      </p>
                    )}

                    {/* Toggle for purchasing for different email - Hidden during upgrades */}
                    {!isUpgrade && (
                      <div className="mt-3 pt-3 border-t border-blue-500/20">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={purchaseForDifferentEmail}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setPurchaseForDifferentEmail(checked);
                              if (checked) {
                                // Clear all fields for recipient's information
                                setFormData(prev => ({
                                  ...prev,
                                  email: "",
                                  fullName: "",
                                  country: "",
                                }));
                                setEmailVerified(false);
                                setShowVerification(false);
                              } else {
                                // Restore logged-in user's information
                                fetch("/api/auth/customer/me")
                                  .then(res => res.ok ? res.json() : null)
                                  .then(data => {
                                    if (data?.customer) {
                                      const autoFilledName = data.customer.name || "";
                                      const autoFilledCountry = data.customer.country || "";
                                      setFormData(prev => ({
                                        ...prev,
                                        email: data.customer.email,
                                        fullName: autoFilledName,
                                        country: autoFilledCountry,
                                      }));
                                    }
                                  });
                                setEmailVerified(true);
                                setShowVerification(false);
                              }
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-blue-500/50 bg-blue-500/20 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-xs text-blue-200/90">
                            Purchase for a different email address (gift or separate account)
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Customer Information */}
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Customer Information</h2>
                {isLoggedIn && !purchaseForDifferentEmail && (formData.fullName || formData.country) && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Auto-filled from your account
                  </span>
                )}
              </div>
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
                    disabled={isLoggedIn && !purchaseForDifferentEmail}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {isLoggedIn && !purchaseForDifferentEmail && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Using your saved information. <Link href="/portal/settings" className="text-blue-400 hover:text-blue-300 underline">Update in settings</Link>
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setEmailVerified(false);
                      setShowVerification(false);
                    }}
                    onBlur={() => {
                      if (formData.email && formData.email.includes("@") && !emailVerified) {
                        setShowVerification(true);
                      }
                    }}
                    placeholder="john@example.com"
                    disabled={emailVerified || (isLoggedIn && !purchaseForDifferentEmail)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {emailVerified && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Email verified
                      {(!isLoggedIn || purchaseForDifferentEmail) && (
                        <button
                          onClick={() => {
                            setEmailVerified(false);
                            setShowVerification(false);
                          }}
                          className="text-xs text-zinc-400 hover:text-zinc-300 underline"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  )}
                  {!emailVerified && (!isLoggedIn || purchaseForDifferentEmail) && (
                    <p className="mt-1 text-xs text-zinc-500">License key will be sent to this email</p>
                  )}
                  {isLoggedIn && !purchaseForDifferentEmail && (
                    <p className="mt-1 text-xs text-zinc-500">Using your account email</p>
                  )}
                </div>

                {/* Email Verification Section - For non-logged-in users or logged-in users purchasing for different email */}
                {showVerification && !emailVerified && formData.email && (!isLoggedIn || purchaseForDifferentEmail) && (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                    <EmailVerification
                      email={formData.email}
                      onVerified={() => {
                        setEmailVerified(true);
                        setShowVerification(false);
                      }}
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <CountrySelect
                    value={formData.country}
                    onChange={(value) => setFormData({ ...formData, country: value })}
                    disabled={isLoggedIn && !purchaseForDifferentEmail}
                    required
                  />
                  {isLoggedIn && !purchaseForDifferentEmail && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Using your saved information. <Link href="/portal/settings" className="text-blue-400 hover:text-blue-300 underline">Update in settings</Link>
                    </p>
                  )}
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

            {/* User Manual Section */}
            <section className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-blue-300">Need Help Getting Started?</h2>
              </div>
              <div className="space-y-3 text-sm text-blue-100/90">
                <p>
                  After your purchase, check out our comprehensive{" "}
                  <Link href="/usermanual" className="font-semibold text-blue-200 underline hover:text-blue-100">
                    User Manual
                  </Link>{" "}
                  for step-by-step guides on:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Quick start setup and configuration</li>
                  <li>MT5 and Telegram integration</li>
                  <li>Strategy settings and customization</li>
                  <li>Troubleshooting common issues</li>
                </ul>
                <p className="pt-2">
                  The user manual link will also be included in your purchase confirmation email.
                </p>
              </div>
            </section>

            {/* Subscription Upgrade Action Section */}
            {isSubscriptionDetailsUpgrade && (
              <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Complete Upgrade</h2>
                <p className="mb-6 text-sm text-zinc-400">
                  You will be redirected to the Stripe Customer Portal to safely review and confirm your plan change.
                </p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/stripe/portal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          stripeCustomerId: selectedLicenseObj.stripe_customer_id,
                          flow: 'update_subscription',
                          subscriptionId: selectedLicenseObj.subscription_id,
                        }),
                      });
                      const data = await response.json();
                      if (data.url) window.location.href = data.url;
                      else alert('Could not open portal.');
                    } catch (e) {
                      alert('Error opening portal.');
                    }
                  }}
                  className="w-full rounded-lg bg-[#5e17eb] p-4 text-center font-semibold text-white transition-all hover:bg-[#4a11c0] shadow-lg shadow-purple-500/20"
                >
                  Proceed to Stripe Portal
                </button>
              </section>
            )}

            {/* Payment Methods */}
            {!isSubscriptionDetailsUpgrade && (
              <section className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 ${!emailVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Select Payment Method</h2>
                  {!emailVerified && (
                    <span className="flex items-center gap-2 text-sm text-amber-400">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Verify email first
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => emailVerified && setSelectedPayment("card")}
                    disabled={!emailVerified}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${selectedPayment === "card"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                      } disabled:cursor-not-allowed`}
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
                    onClick={() => emailVerified && setSelectedPayment("crypto")}
                    disabled={!emailVerified}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${selectedPayment === "crypto"
                      ? "border-green-500 bg-green-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                      } disabled:cursor-not-allowed`}
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
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${selectedPayment === "binance"
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
            )}

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
                      className={`w-full rounded-lg border p-4 text-left transition-colors ${selectedCrypto === option.value
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

                {/* Show message if required fields are missing */}
                {!formData.fullName || !formData.country ? (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-amber-300">Complete Customer Information</p>
                        <p className="mt-1 text-sm text-amber-200/80">
                          Please fill in all required fields in the Customer Information section above to continue.
                        </p>
                        <ul className="mt-2 text-sm text-amber-200/80 list-disc list-inside">
                          {!formData.fullName && <li>Full Name is required</li>}
                          {!formData.country && <li>Country is required</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : !isLifetime ? (
                  // Subscription Flow: Redirect to Stripe Checkout
                  <div className="text-center py-6">
                    <p className="mb-6 text-sm text-zinc-400">
                      You will be redirected to Stripe's secure checkout page to complete your subscription.
                    </p>
                    <button
                      onClick={handleSubscriptionCheckout}
                      disabled={loadingStripe || !agreedToTerms}
                      className="inline-flex w-full items-center justify-center rounded-md bg-[#5e17eb] px-6 py-3 font-medium text-white hover:bg-[#4a12b8] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {loadingStripe ? (
                        <>
                          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Redirecting...
                        </>
                      ) : (
                        "Proceed to Secure Checkout"
                      )}
                    </button>
                    {!agreedToTerms && (
                      <p className="mt-2 text-xs text-red-400">
                        Please agree to the terms and conditions above.
                      </p>
                    )}
                  </div>
                ) : loadingStripe && !clientSecret ? (
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
                ) : showStripeForm && clientSecret && stripeOrderId ? (
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
                      amount={finalPrice}
                      plan={planName}
                      agreedToTerms={agreedToTerms}
                      onSuccess={() => {
                        console.log("Payment successful");
                      }}
                      onError={(error) => {
                        console.error("Payment error:", error);
                      }}
                      isUpgrade={isUpgrade}
                    />
                  </Elements>
                ) : null}
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
            {!isSubscriptionDetailsUpgrade && (
              <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="text-white">${finalPrice} USD</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Processing Fee</span>
                    <span className="text-white">$0 USD</span>
                  </div>
                  <div className="border-t border-zinc-700 pt-2">
                    <div className="flex justify-between text-lg font-semibold text-white">
                      <span>Total</span>
                      <span>${finalPrice} USD</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

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
        )}
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

