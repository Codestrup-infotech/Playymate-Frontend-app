"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Smartphone, CreditCard, Wallet, Zap } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const RAZORPAY_KEY_ID =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SN6ZSPuY8lfpxY";

function getToken() {
  if (typeof window === "undefined") return null;
  // Primary: sessionStorage (set by authService.storeTokens)
  // Fallback: localStorage with multiple key variants
  return (
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("playymate_access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const PAYMENT_METHODS = [
  { id: "UPI",      title: "UPI",      subtitle: "Google Pay, PhonePe, Paytm", icon: <Smartphone size={20} color="#FF3E87" /> },
  { id: "CARD",     title: "Card",     subtitle: "Credit or Debit Card",        icon: <CreditCard  size={20} color="#FF3E87" /> },
  { id: "RAZORPAY", title: "Razorpay", subtitle: "Cards, NetBanking",           icon: <Zap         size={20} color="#FF3E87" /> },
  { id: "WALLET",   title: "Wallet",   subtitle: null,                          icon: <Wallet      size={20} color="#FF3E87" /> },
];

function SectionLabel({ title }) {
  return (
    <p style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "12px", marginTop: "28px" }}>
      {title}
    </p>
  );
}

function PaymentMethodRow({ method, selected, onSelect, walletBalance }) {
  const isSelected = selected === method.id;
  const subtitle = method.id === "WALLET" ? `Balance: ₹ ${walletBalance ?? "–"}` : method.subtitle;

  return (
    <div
      onClick={() => onSelect(method.id)}
      style={{
        background: isSelected ? "linear-gradient(135deg,#FF3E8718,#FF6B3510)" : "#111111",
        border: `1.5px solid ${isSelected ? "#FF3E87" : "#1E1E1E"}`,
        borderRadius: "14px", padding: "16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", marginBottom: "10px", transition: "all 0.2s",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {method.icon}
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#F9FAFB" }}>{method.title}</p>
          <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${isSelected ? "#FF3E87" : "#374151"}`, background: isSelected ? "#FF3E87" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isSelected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff" }} />}
        </div>
        <span style={{ fontSize: "9px", color: "#4B5563", fontWeight: 600, letterSpacing: "0.3px" }}>COMING SOON</span>
      </div>
    </div>
  );
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planId  = searchParams.get("plan");
  const planKey = searchParams.get("key");

  const [plan,          setPlan]          = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [selectedMethod,setSelectedMethod]= useState("UPI");
  const [promoCode,     setPromoCode]     = useState("");
  const [discount,      setDiscount]      = useState(0);
  const [agreed,        setAgreed]        = useState(false);
  const [paying,        setPaying]        = useState(false);
  const [error,         setError]         = useState(null);

  useEffect(() => { fetchData(); }, [planId]);

  const fetchData = async () => {
    try {
      const res  = await fetch(`${API_BASE}/subscriptions/plans?duration=ALL`);
      const data = await res.json();
      const found = (data?.data?.plans || []).find((p) => p._id === planId);
      if (!found) throw new Error("Plan not found");
      setPlan(found);

      // wallet balance — silent fail
      try {
        const token = getToken();
        if (token) {
          const wRes  = await fetch(`${API_BASE}/wallet/balance`, { headers: { Authorization: `Bearer ${token}` } });
          const wData = await wRes.json();
          setWalletBalance(wData?.data?.balance ?? null);
        }
      } catch (_) {}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAnnual = plan?.duration?.value === 365;
  const price    = plan?.price?.amount ?? 0;
  const coins    = plan?.gold_coins?.amount ?? 0;
  const total    = price - discount;
  const isVIP    = plan?.key?.startsWith("vip");

  // ── payment ────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!agreed) { setError("Please agree to the Terms & Conditions first."); return; }

    const token = getToken();
    if (!token) { setError("Missing authorization token. Please log in again."); return; }

    setPaying(true);
    setError(null);

    try {
      const purchaseRes = await fetch(`${API_BASE}/subscriptions/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          payment_method: "TEST",   // ← swap to selectedMethod when Razorpay is live on backend
          auto_renew: true,
        }),
      });

      const purchaseData = await purchaseRes.json();

      // ── TEST mode / direct success ───────────────────────────────────────
      if (purchaseData?.status === "success") {
        const creditedCoins = purchaseData?.data?.coins_credited ?? coins;
        router.push(
          `/home/subscription/activation-screen?plan=${planId}&key=${planKey}&coins=${creditedCoins}`
        );
        return;
      }

      // ── Razorpay order returned (live mode) ──────────────────────────────
      if (purchaseData?.data?.razorpay_order_id) {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error("Failed to load Razorpay. Please try again.");

        const options = {
          key: RAZORPAY_KEY_ID,
          amount: total * 100,
          currency: "INR",
          name: "Playymate",
          description: `${plan.name} – ${isAnnual ? "Yearly" : "Monthly"}`,
          order_id: purchaseData.data.razorpay_order_id,
          handler: () => {
            router.push(`/home/subscription/activation-screen?plan=${planId}&key=${planKey}&coins=${coins}`);
          },
          theme: { color: "#FF3E87" },
          modal: { ondismiss: () => setPaying(false) },
        };
        new window.Razorpay(options).open();
        return;
      }

      throw new Error(purchaseData?.message || "Payment failed. Please try again.");
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  // ── loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #222", borderTop: "3px solid #FF3E87", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#6B7280", fontSize: "13px" }}>Loading checkout...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "sans-serif" }}>
        <p>{error || "Plan not found"}</p>
      </div>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", paddingBottom: "120px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #1A1A1A" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
          <ArrowLeft size={18} /> Checkout
        </button>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 20px 0" }}>

        {/* Plan card */}
        <div style={{ background: "#111111", border: "1px solid #1E1E1E", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: isVIP ? "linear-gradient(135deg,#9333EA,#6B21A8)" : "linear-gradient(135deg,#3B82F6,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              {isVIP ? "👑" : "⭐"}
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#F9FAFB" }}>{plan.name} Plan</p>
              <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>Billed {isAnnual ? "yearly" : "monthly"}</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "22px", fontWeight: 800, color: "#FF3E87" }}>₹{price}</span>
            <span style={{ fontSize: "12px", color: "#6B7280" }}>/{isAnnual ? "yr" : "mo"}</span>
          </div>
        </div>

        {/* Coins pill */}
        <div style={{ background: "#1C1A00", border: "1px solid #3D3A00", borderRadius: "100px", padding: "10px 20px", textAlign: "center", color: "#FBBF24", fontSize: "14px", fontWeight: 600 }}>
          🪙 {coins} gold coins included
        </div>

        {/* TEST MODE banner */}
        <div style={{ marginTop: "16px", background: "#1A1200", border: "1px solid #854D0E", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🧪</span>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#FCD34D", margin: 0 }}>Test Mode Active</p>
            <p style={{ fontSize: "11px", color: "#92400E", margin: 0, marginTop: "2px" }}>Payments are simulated. No real money is charged.</p>
          </div>
        </div>

        {/* Payment methods */}
        <SectionLabel title="Payment Methods" />
        {PAYMENT_METHODS.map((m) => (
          <PaymentMethodRow key={m.id} method={m} selected={selectedMethod} onSelect={setSelectedMethod} walletBalance={walletBalance} />
        ))}

        {/* Promo code */}
        <SectionLabel title="Promo Code" />
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text" placeholder="Enter Code" value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            style={{ flex: 1, background: "#111111", border: "1px solid #1E1E1E", borderRadius: "12px", padding: "12px 16px", color: "#fff", fontSize: "14px", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#FF3E87")}
            onBlur={(e)  => (e.target.style.borderColor = "#1E1E1E")}
          />
          <button style={{ padding: "12px 20px", borderRadius: "12px", border: "none", background: "#1E1E1E", color: "#9CA3AF", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
            Apply
          </button>
        </div>

        {/* Order summary */}
        <SectionLabel title="Order Summary" />
        <div style={{ background: "#111111", border: "1px solid #1E1E1E", borderRadius: "16px", padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#F9FAFB" }}>{plan.name} Plan</span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#22C55E", border: "1px solid #22C55E", borderRadius: "20px", padding: "3px 10px" }}>
              {isAnnual ? "Yearly" : "Monthly"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6B7280", marginBottom: "10px" }}>
            <span>Subtotal</span><span>₹ {price.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#22C55E", marginBottom: "14px" }}>
            <span>Discount</span><span>+₹ {discount.toFixed(2)}</span>
          </div>
          <div style={{ borderTop: "1px solid #1E1E1E", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#F9FAFB" }}>Total</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#FF3E87" }}>₹ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Terms */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginTop: "20px" }}>
          <input type="checkbox" id="terms" checked={agreed}
            onChange={(e) => { setAgreed(e.target.checked); if (error?.includes("Terms")) setError(null); }}
            style={{ marginTop: "2px", accentColor: "#FF3E87", cursor: "pointer" }}
          />
          <label htmlFor="terms" style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6, cursor: "pointer" }}>
            I agree to the Terms &amp; Conditions and authorize recurring payments
          </label>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: "14px", background: "#1A0A0A", border: "1px solid #7F1D1D", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#FCA5A5" }}>
            {error}
          </div>
        )}
      </div>

      {/* Fixed CTA */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 20px", background: "linear-gradient(to top,#0D0D0D 70%,transparent)" }}>
        <button
          onClick={handlePayment} disabled={paying}
          style={{
            width: "100%", maxWidth: "480px", display: "block", margin: "0 auto",
            padding: "16px", borderRadius: "14px", border: "none",
            cursor: paying ? "not-allowed" : "pointer",
            fontSize: "15px", fontWeight: 700, letterSpacing: "0.3px",
            background: paying ? "#1E1E1E" : "linear-gradient(135deg,#FF3E87,#FF6B35)",
            color: paying ? "#6B7280" : "#fff",
            opacity: paying ? 0.7 : 1, transition: "opacity 0.2s",
          }}
        >
          {paying ? "Processing..." : "Proceed to Payment (Test)"}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0D0D0D" }} />}>
      <CheckoutPageContent />
    </Suspense>
  );
}