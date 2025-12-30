"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    // Fetch order details
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`);
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data);
        } else {
          setError("Failed to fetch order details");
        }
      } catch (err) {
        setError("Error loading order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleResendEmail = async () => {
    if (!orderId) return;

    setSendingEmail(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/send-email`, {
        method: "POST",
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      } else {
        const data = await response.json();
        alert(`Failed to send email: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("Error sending email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12">
        <div className="mx-auto max-w-2xl px-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 animate-spin text-blue-500"
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
              <p className="mt-4 text-zinc-400">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
            <div className="flex items-start gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-red-400"
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
              <div>
                <h2 className="text-lg font-semibold text-red-300">Error</h2>
                <p className="mt-1 text-sm text-red-200">
                  {error || "Unable to load order details"}
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300"
                >
                  ← Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="mx-auto max-w-2xl px-6">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <svg
              className="h-10 w-10 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Payment Successful! 🎉
          </h1>
          <p className="text-zinc-300">
            Your order has been confirmed and <span className="font-semibold text-green-400">your license key has been sent to your email.</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* License Key */}
          {orderDetails.licenseKey && (
            <section className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
              <h2 className="mb-3 text-lg font-semibold text-green-300">
                Your License Key
              </h2>
              <div className="rounded-lg bg-zinc-900/50 p-4">
                <p className="break-all font-mono text-xl font-bold text-white">
                  {orderDetails.licenseKey}
                </p>
              </div>
              <p className="mt-3 text-sm text-green-200">
                Save this license key in a safe place. You'll need it to activate the software.
              </p>
            </section>
          )}

          {/* Download Link */}
          {orderDetails.downloadUrl && !orderDetails.downloadExpired && (
            <section className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
              <h2 className="mb-3 text-lg font-semibold text-blue-300">
                📥 Download Your Software
              </h2>
              <p className="mb-4 text-sm text-blue-200">
                Click the button below to download the TelegramSignalBot Installer:
              </p>
              <button
                onClick={() => {
                  if (downloadStarted) {
                    alert('Download has already been initiated. Please check your downloads folder.');
                    return;
                  }
                  setDownloading(true);
                  setDownloadStarted(true);

                  // Create a temporary link and trigger download
                  const link = document.createElement('a');
                  link.href = orderDetails.downloadUrl;
                  link.download = 'TelegramSignalBot Installer.exe';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  // Show downloading state for 3 seconds
                  setTimeout(() => {
                    setDownloading(false);
                  }, 3000);
                }}
                disabled={downloading || downloadStarted}
                className={`block w-full rounded-md px-6 py-3 text-center font-medium text-white transition ${downloading || downloadStarted
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {downloading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Downloading...
                  </span>
                ) : downloadStarted ? (
                  '✓ Download Started'
                ) : (
                  'Download Installer'
                )}
              </button>
              <p className="mt-3 text-xs text-blue-200">
                ⏱️ This download link expires in 1 hour and can only be used once.
              </p>
              {downloadStarted && (
                <p className="mt-2 text-xs text-green-300">
                  ✓ Download initiated! Check your downloads folder. If the download didn't start, please contact support.
                </p>
              )}
            </section>
          )}

          {/* Download Expired - Show Regenerate Button */}
          {orderDetails.downloadExpired && orderDetails.licenseKey && (
            <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
              <h2 className="mb-3 text-lg font-semibold text-amber-300">
                ⚠️ Download Link Expired
              </h2>
              <p className="mb-4 text-sm text-amber-200">
                Your download link has expired. Click below to generate a new one:
              </p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/download/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        licenseKey: orderDetails.licenseKey,
                        email: orderDetails.email,
                      }),
                    });
                    if (response.ok) {
                      const data = await response.json();
                      window.location.href = data.downloadUrl;
                    } else {
                      alert('Failed to generate download link. Please contact support.');
                    }
                  } catch (err) {
                    alert('Error generating download link. Please try again.');
                  }
                }}
                className="w-full rounded-md bg-amber-600 px-6 py-3 text-center font-medium text-white transition hover:bg-amber-700"
              >
                Generate New Download Link
              </button>
            </section>
          )}

          {/* Order Information */}
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Order Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Order ID</span>
                <span className="font-mono text-sm text-white">{orderId}</span>
              </div>
              {orderDetails.plan && (
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Plan</span>
                  <span className="text-white">{orderDetails.plan}</span>
                </div>
              )}
              {orderDetails.displayPrice && (
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Amount Paid</span>
                  <span className="text-white">${orderDetails.displayPrice} USD</span>
                </div>
              )}
              {orderDetails.email && (
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Email</span>
                  <span className="text-white">{orderDetails.email}</span>
                </div>
              )}
              <div className="flex justify-between pt-2">
                <span className="text-zinc-400">Status</span>
                <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                  Paid
                </span>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              🚀 Next Steps
            </h2>
            <ol className="space-y-3 text-sm text-zinc-300">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  1
                </span>
                <span>
                  Download the Trading Bot application from our website
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  2
                </span>
                <span>Install and launch the application on your Windows PC or VPS</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  3
                </span>
                <span>
                  Enter your license key when prompted during activation
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  4
                </span>
                <span>Configure your MT5 and Telegram settings</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  5
                </span>
                <span>Start automating your trades!</span>
              </li>
            </ol>
          </section>

          {/* Important Notice */}
          <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
            <div className="flex items-start gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-amber-400"
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
                <h3 className="font-semibold text-amber-300">Important</h3>
                <ul className="mt-2 space-y-1 text-sm text-amber-100/90">
                  <li>• Check your email (and spam folder) for the license key and receipt</li>
                  <li>• Keep your license key secure and don't share it</li>
                  <li>• Start with a demo account to test your configuration</li>
                  <li>• Contact support if you need any assistance</li>
                </ul>

                {/* Resend Email Button */}
                <div className="mt-4">
                  <button
                    onClick={handleResendEmail}
                    disabled={sendingEmail}
                    className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingEmail ? "Sending..." : emailSent ? "✓ Email Sent!" : "📧 Resend License Email"}
                  </button>
                  {emailSent && (
                    <p className="mt-2 text-xs text-green-300">
                      Email sent successfully! Check your inbox.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/portal"
              className="flex-1 rounded-md bg-blue-600 px-6 py-3 text-center font-medium text-white transition hover:bg-blue-700"
            >
              Go to Customer Portal
            </Link>
            <Link
              href="/resources"
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-6 py-3 text-center font-medium text-white transition hover:bg-zinc-700"
            >
              View Documentation
            </Link>
          </div>

          {/* Support Link */}
          <div className="text-center">
            <p className="text-sm text-zinc-500">
              Need help?{" "}
              <Link href="/contact" className="text-blue-400 hover:text-blue-300">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 py-12">
          <div className="mx-auto max-w-2xl px-6">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
                <p className="mt-4 text-zinc-400">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}



