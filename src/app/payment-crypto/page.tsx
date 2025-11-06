"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { QRCodeCanvas } from "qrcode.react";

function CryptoPayment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const coin = searchParams.get("coin") || "USDT";
  const network = searchParams.get("network") || "TRC20";

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("waiting_for_payment");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [showTxInput, setShowTxInput] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!orderId || !mounted) return;

    // Fetch order details
    fetch(`/api/orders/${orderId}/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setOrder(data);
          setStatus(data.status);
          
          // Calculate time left from expiresAt
          if (data.expiresAt) {
            const expires = new Date(data.expiresAt).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((expires - now) / 1000));
            setTimeLeft(remaining);
          }
        }
      })
      .catch((error) => {
        console.error("Failed to fetch order:", error);
      });

    // Poll status every 5 seconds
    const statusInterval = setInterval(() => {
      fetch(`/api/orders/${orderId}/status`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setStatus(data.status);
            if (data.status === "paid") {
              clearInterval(statusInterval);
              // Redirect to success page
              router.push(`/payment-success?orderId=${orderId}`);
            }
          }
        })
        .catch((error) => {
          console.error("Status poll error:", error);
        });
    }, 5000);

    // Countdown timer
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Show TX input after 5 minutes if no payment detected
    const txInputTimeout = setTimeout(() => {
      setShowTxInput(true);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(timerInterval);
      clearTimeout(txInputTimeout);
    };
  }, [orderId, router, mounted]);

  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    try {
      const response = await fetch("/api/verify/tx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, txHash }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/payment-success?orderId=${orderId}`);
      } else if (data.redirectTo) {
        router.push(data.redirectTo);
      } else {
        alert("Verification failed. Please contact support.");
      }
    } catch (error) {
      alert("Error verifying transaction. Please contact support.");
    } finally {
      setVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!mounted || !order) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12 text-center text-white">
        Loading order...
      </div>
    );
  }

  const qrValue = order.walletAddress && order.embeddedPrice 
    ? `${order.walletAddress}?amount=${order.embeddedPrice}` 
    : "";

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Order #{order.orderId}</h1>
              <p className="text-sm text-zinc-400">{order.plan} Plan</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">${order.displayPrice} USD</p>
              <p className="text-xs text-zinc-400">Display Price</p>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-300">
              ⚠️ Send {coin} on the {network} blockchain, otherwise your funds will be lost.
            </p>
          </div>

          <div className="mb-6 text-center">
            <p className="mb-2 text-sm text-zinc-400">Total to pay</p>
            <p className="text-3xl font-bold text-white">
              {order.embeddedPrice ? order.embeddedPrice.toFixed(6) : "0.000000"} {coin}
            </p>
          </div>

          {order.walletAddress && order.embeddedPrice && (
            <div className="mb-6 flex justify-center">
              <div className="rounded-lg border-2 border-white bg-white p-4">
                <QRCodeCanvas value={qrValue} size={200} />
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="mb-2 block text-sm text-zinc-300">{network} address:</label>
            <div className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 p-3">
              <code className="flex-1 text-sm text-white">{order.walletAddress || "Loading..."}</code>
              {order.walletAddress && (
                <button
                  onClick={() => navigator.clipboard.writeText(order.walletAddress)}
                  className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700"
                >
                  Copy
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 h-1 w-full rounded-full bg-zinc-700">
              <div
                className="h-1 rounded-full bg-orange-500"
                style={{ width: `${(timeLeft / 900) * 100}%` }}
              />
            </div>
            <p className="text-center text-sm text-zinc-400">
              Invoice expires in <span className="font-semibold text-orange-400">{formatTime(timeLeft)}</span>
            </p>
          </div>

          {showTxInput && status === "waiting_for_payment" && (
            <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="mb-3 text-sm font-semibold text-amber-300">
                Payment not detected automatically
              </p>
              <p className="mb-3 text-sm text-amber-200/80">
                Please enter your transaction hash (TX ID) to verify your payment:
              </p>
              <form onSubmit={handleTxSubmit} className="space-y-3">
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Enter transaction hash (TX ID)"
                  required
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Verify Transaction"}
                </button>
              </form>
            </div>
          )}

          {order.walletAddress && order.embeddedPrice && (
            <div className="text-center">
              <button
                onClick={() => window.open(`tronlink://transfer?address=${order.walletAddress}&amount=${order.embeddedPrice}`, "_blank")}
                className="rounded-md bg-black px-6 py-3 font-medium text-white hover:bg-zinc-800"
              >
                Pay from wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CryptoPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 py-12 text-center text-white">Loading...</div>}>
      <CryptoPayment />
    </Suspense>
  );
}

