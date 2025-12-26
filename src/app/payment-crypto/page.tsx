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
  const [cryptoPrice, setCryptoPrice] = useState<number | null>(null);
  const [cryptoAmount, setCryptoAmount] = useState<number | null>(null);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Handle Back Button / Exit Intent
  useEffect(() => {
    // Only intercept if payment is pending
    if (!mounted || status === "paid" || status === "failed" || status === "expired") return;

    // Push a dummy state to history so "Back" triggers popstate instead of leaving
    window.history.pushState({ page: "payment_active" }, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // Prevent immediate exit
      event.preventDefault();
      // Show confirmation modal
      setShowExitModal(true);
      // Re-push state to keep the trap active until they explicitly choose to leave
      window.history.pushState({ page: "payment_active" }, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [mounted, status]);

  // Handle Internal Navigation (Link Clicks)
  useEffect(() => {
    if (!mounted || status === "paid" || status === "failed" || status === "expired") return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor) {
        const href = anchor.getAttribute("href");

        // Allow mailto, tel, or hash links
        if (href && (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#"))) {
          return;
        }

        // Prevent navigation and show modal
        e.preventDefault();
        e.stopPropagation();
        setShowExitModal(true);
      }
    };


    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [mounted, status]);

  const handleExitConfirm = () => {
    router.push("/products");
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!orderId || !mounted) return;

    // Fetch order details
    fetch(`/api/orders/${orderId}/status`)
      .then((res) => {
        if (!res.ok) {
          // If 404, order might not exist yet or server restarted
          if (res.status === 404) {
            console.warn("Order not found, will retry...");
            return null;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
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

          // Fetch crypto price and calculate amount
          if (data.embeddedPrice && data.coin) {
            fetch(`/api/crypto/prices?coin=${data.coin}`)
              .then((priceRes) => priceRes.json())
              .then((priceData) => {
                if (priceData.price) {
                  setCryptoPrice(priceData.price);
                  // Convert USD embedded price to crypto amount
                  const amount = data.embeddedPrice / priceData.price;
                  setCryptoAmount(amount);
                }
              })
              .catch((error) => {
                console.error("Failed to fetch crypto price:", error);
              });
          }
        } else if (data === null) {
          // Order not found, retry after a short delay
          setTimeout(() => {
            fetch(`/api/orders/${orderId}/status`)
              .then((res) => res.json())
              .then((retryData) => {
                if (retryData && !retryData.error) {
                  setOrder(retryData);
                  setStatus(retryData.status);
                }
              })
              .catch(() => {
                // Silently fail retry
              });
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch order:", error);
      });

    // Poll status every 5 seconds
    const statusInterval = setInterval(() => {
      fetch(`/api/orders/${orderId}/status`)
        .then((res) => {
          if (!res.ok) {
            // Don't log 404 errors during polling, just skip
            if (res.status === 404) {
              return null;
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
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
          // Only log non-404 errors
          if (error.message && !error.message.includes("404")) {
            console.error("Status poll error:", error);
          }
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

  // Try to open wallet with multiple schemes (wallet detection)
  const tryOpenWallet = (network: string, address: string, amount: number): void => {
    const walletSchemes: Record<string, string[]> = {
      BTC: [
        `bitcoin:${address}?amount=${amount}`, // Standard BIP21 - works with most wallets
      ],
      TRC20: [
        `tronlink://transfer?address=${address}&amount=${amount}`, // TronLink
      ],
      ERC20: [
        `ethereum:${address}?value=${amount}`, // Standard Ethereum URI
      ],
      ETH: [
        `ethereum:${address}?value=${amount}`, // Standard Ethereum URI
      ],
      BSC: [
        `trust://transfer?address=${address}&amount=${amount}`, // Trust Wallet
      ],
    };

    const schemes = walletSchemes[network] || [];

    // Try the first (most common) scheme
    if (schemes.length > 0) {
      try {
        // Use window.location for better compatibility
        window.location.href = schemes[0];
      } catch (error) {
        console.error("Failed to open wallet:", error);
      }
    }
  };

  const handleCopyAddress = () => {
    if (order?.walletAddress) {
      navigator.clipboard.writeText(order.walletAddress);
      alert("Wallet address copied to clipboard!");
    }
  };

  const handleCopyAmount = () => {
    if (displayAmount !== null && displayAmount !== undefined) {
      const decimals = coin === "BTC" ? 8 : coin === "ETH" || coin === "BNB" ? 6 : 6;
      navigator.clipboard.writeText(displayAmount.toFixed(decimals));
      alert(`Amount (${displayAmount.toFixed(decimals)} ${coin}) copied to clipboard!`);
    }
  };

  const handleCopyPaymentDetails = () => {
    if (order?.walletAddress && displayAmount !== null && displayAmount !== undefined) {
      const decimals = coin === "BTC" ? 8 : coin === "ETH" || coin === "BNB" ? 6 : 6;
      const details = `Address: ${order.walletAddress}\nAmount: ${displayAmount.toFixed(decimals)} ${coin}`;
      navigator.clipboard.writeText(details);
      alert("Payment details copied to clipboard!");
    }
  };

  if (!mounted || !order) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12 text-center text-white">
        Loading order...
      </div>
    );
  }

  // Use crypto amount if available, otherwise fallback to embedded price (for stablecoins)
  const displayAmount = cryptoAmount !== null ? cryptoAmount : order.embeddedPrice;

  // QR code format: Just address (for Binance compatibility)
  // Binance app doesn't support URI schemes with amount parameter
  // Users will enter the amount manually in their wallet
  const qrValue = order.walletAddress || "";

  // Alternative QR with amount (for wallets that support it)
  const qrValueWithAmount = order.walletAddress && displayAmount
    ? `${order.walletAddress}?amount=${displayAmount}`
    : "";

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Order #{order.orderId}</h1>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-zinc-400">{order.plan} Plan</p>
                <span className={`rounded border px-2 py-0.5 text-xs font-medium ${network === "TRC20" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                  network === "ERC20" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                    network === "BSC" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      network === "BTC" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                        "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                  }`}>
                  {network}
                </span>
              </div>
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
            <div className="mb-3 flex items-center justify-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-700/50 text-3xl">
                {coin === "BTC" ? "₿" : coin === "ETH" ? "Ξ" : coin === "BNB" ? "BNB" : coin === "USDT" || coin === "USDC" ? "₮" : "●"}
              </div>
            </div>
            <p className="mb-2 text-sm text-zinc-400">Total to pay</p>
            <p className="text-3xl font-bold text-white">
              {displayAmount !== null && displayAmount !== undefined
                ? displayAmount.toFixed(coin === "BTC" ? 8 : coin === "ETH" || coin === "BNB" ? 6 : 6)
                : "0.000000"} {coin}
            </p>
            {cryptoPrice && cryptoPrice !== 1 && (
              <p className="mt-1 text-xs text-zinc-500">
                ≈ ${order.embeddedPrice?.toFixed(2)} USD
              </p>
            )}
          </div>

          {order.walletAddress && (
            <div className="mb-6">
              <div className="mb-3 flex justify-center">
                <div className="rounded-lg border-2 border-white bg-white p-4">
                  <QRCodeCanvas value={qrValue} size={200} />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <p className="text-xs text-zinc-500">
                  Compatible with:{" "}
                </p>
                <span className="rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">Binance</span>
                <span className="rounded border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-400">TronLink</span>
                <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">MetaMask</span>
                <span className="rounded border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 text-[10px] font-medium text-zinc-400">Other Wallets</span>
              </div>
              <p className="mt-2 text-center text-xs text-zinc-500">
                Enter amount manually:{" "}
                <span className="font-semibold text-white">
                  {displayAmount !== null && displayAmount !== undefined
                    ? displayAmount.toFixed(coin === "BTC" ? 8 : coin === "ETH" || coin === "BNB" ? 6 : 6)
                    : "0.000000"} {coin}
                </span>
              </p>
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

          {order.walletAddress && displayAmount && (
            <div className="flex flex-col gap-3 text-center">
              <button
                onClick={() => {
                  // Try to open wallet with detection
                  tryOpenWallet(order.network, order.walletAddress, displayAmount);

                  // Show manual payment modal after a delay
                  // User can close it if wallet opened successfully
                  setTimeout(() => {
                    setShowManualPaymentModal(true);
                  }, 2000);
                }}
                className="rounded-md bg-black px-6 py-3 font-medium text-white hover:bg-zinc-800"
              >
                {order.network === "TRC20" ? "Pay with TronLink" :
                  order.network === "ERC20" || order.network === "ETH" ? "Pay with MetaMask" :
                    order.network === "BSC" ? "Pay with Trust Wallet" :
                      order.network === "BTC" ? "Pay with Bitcoin Wallet" :
                        "Pay from wallet"}
              </button>
              <button
                onClick={() => setShowManualPaymentModal(true)}
                className="text-sm text-zinc-400 hover:text-zinc-300 underline"
              >
                Show Manual Payment Instructions
              </button>
            </div>
          )}

          {/* Manual Payment Modal */}
          {showManualPaymentModal && order.walletAddress && displayAmount && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <div className="relative w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                <button
                  onClick={() => setShowManualPaymentModal(false)}
                  className="absolute right-4 top-4 text-zinc-400 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h2 className="mb-4 text-xl font-semibold text-white">Manual Payment Instructions</h2>

                <div className="mb-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm text-zinc-400">Wallet Address:</label>
                    <div className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 p-2">
                      <code className="flex-1 break-all text-xs text-white">{order.walletAddress}</code>
                      <button
                        onClick={handleCopyAddress}
                        className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-zinc-400">Amount to Send:</label>
                    <div className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 p-2">
                      <code className="flex-1 text-sm font-semibold text-white">
                        {displayAmount.toFixed(coin === "BTC" ? 8 : coin === "ETH" || coin === "BNB" ? 6 : 6)} {coin}
                      </code>
                      <button
                        onClick={handleCopyAmount}
                        className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-lg border border-zinc-700 bg-white p-4">
                      <QRCodeCanvas
                        value={order.walletAddress}
                        size={200}
                      />
                    </div>
                    <p className="text-xs text-zinc-400">
                      QR contains address only. Enter amount:{" "}
                      <span className="font-semibold text-white">
                        {displayAmount.toFixed(coin === "BTC" ? 8 : coin === "ETH" || coin === "BNB" ? 6 : 6)} {coin}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-sm text-amber-200">
                    <strong>Steps:</strong>
                  </p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-amber-200/90">
                    <li>Open your {coin} wallet app</li>
                    <li>Scan the QR code or copy the address</li>
                    <li>Send exactly <strong>{displayAmount.toFixed(coin === "BTC" ? 8 : 6)} {coin}</strong></li>
                    <li>Wait for blockchain confirmation</li>
                  </ol>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyPaymentDetails}
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                  >
                    Copy All Details
                  </button>
                  <button
                    onClick={() => setShowManualPaymentModal(false)}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXIT INTENT MODAL */}
          {showExitModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
                <h3 className="mb-2 text-lg font-semibold text-white">Cancel Payment?</h3>
                <p className="mb-6 text-sm text-zinc-400">
                  Your order for <span className="text-zinc-200">{order.plan} Plan</span> is currently pending. Are you sure you want to cancel this payment?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleExitConfirm}
                    className="flex-1 rounded-md border border-zinc-700 bg-transparent py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
                  >
                    Leave Page
                  </button>
                  <button
                    onClick={handleExitCancel}
                    className="flex-1 rounded-md bg-[#5e17eb] py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Continue Payment
                  </button>
                </div>
              </div>
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

