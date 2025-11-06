"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, Suspense } from "react";

function PaymentForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "starter";
  const isPro = plan === "pro";
  const price = isPro ? 49 : 29;
  const planName = isPro ? "Pro" : "Starter";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    hardwareFingerprint: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || !selectedPayment || selectedPayment !== "crypto") return;
    // Redirect to Google Form - user will fill in all details there
    window.location.href = "https://docs.google.com/forms/d/e/1FAIpQLSclVvR_Rwz-kdAUdbBRsIr2FxVn2n2RkCY0UP-oLjaLlCAIuA/viewform?usp=header";
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

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Hardware Fingerprint */}
          <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Hardware Fingerprint Required</h2>
            </div>
            <p className="mb-3 text-sm text-zinc-300">
              Your license will be bound to your computer to prevent unauthorized sharing. Please download and run the app to get your hardware fingerprint.
            </p>
            <a href="#" className="mb-4 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
              How to get your hardware fingerprint?
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
            <div>
              <label className="mb-1 block text-sm text-zinc-300">
                Hardware Fingerprint <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.hardwareFingerprint}
                onChange={(e) => setFormData({ ...formData, hardwareFingerprint: e.target.value })}
                placeholder="e.g., A1B2C3D4E5F6G7H8"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-zinc-500">16-character hexadecimal code shown when you run the app</p>
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
                      <p className="text-sm text-zinc-400">Visa, Mastercard, etc.</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400">Coming Soon</span>
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
                      <p className="text-sm text-zinc-400">USDT, Bitcoin, Ethereum & more</p>
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
                      <span className="text-xl font-bold text-yellow-400">B</span>
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

          {/* Terms & Conditions */}
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href="/products"
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-6 py-3 text-center font-medium text-white hover:bg-zinc-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!agreedToTerms || !selectedPayment || selectedPayment !== "crypto"}
              className="flex-1 rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Proceed to Payment
            </button>
          </div>
        </form>
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

