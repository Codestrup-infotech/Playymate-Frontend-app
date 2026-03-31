"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Smartphone, CreditCard, Wallet, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

const API_BASE     = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SN6ZSPuY8lfpxY";

const BG_PAGE     = "#FFFFFF";
const BG_SURFACE  = "#F9FAFB";
const BG_ELEVATED = "#F3F4F6";
const BG_BORDER   = "#E5E7EB";
const BG_MUTED    = "#F3F4F6";
const TEXT_1      = "#111827";
const TEXT_2      = "#6B7280";
const TEXT_3      = "#9CA3AF";

const ACCENT_PRO     = "#EC4899";
const ACCENT_VIP     = "#8B5CF6";
const ACCENT_STARTER = "#3B82F6";
const ACCENT_FREE    = "#6B7280";

const GOLD        = "#D97706";
const GOLD_BG     = "#FFFBEB";
const GOLD_BDR    = "#FDE68A";
const GOLD_ACTIVE_BG  = "#FEF3C7";
const GOLD_ACTIVE_BDR = "#D97706";
const GREEN       = "#059669";
const GREEN_BG    = "#ECFDF5";
const GREEN_BDR   = "#A7F3D0";
const RED         = "#DC2626";
const RED_BG      = "#FEF2F2";
const RED_BDR     = "#FECACA";

// ─── FIXED: using access_token ────────────────────────────────────────────────
function getToken() {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token") ||
    null
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id  = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const METHOD_API_MAP = {
  UPI: "UPI", CARD: "CARD", RAZORPAY: "RAZORPAY", WALLET: "WALLET",
};

const PAYMENT_METHODS = [
  { id: "UPI",      title: "UPI",      subtitle: "Google Pay, PhonePe, Paytm", icon: Smartphone },
  { id: "CARD",     title: "Card",     subtitle: "Credit or Debit Card",        icon: CreditCard  },
  { id: "RAZORPAY", title: "Razorpay", subtitle: "Cards, NetBanking & UPI",     icon: Zap         },
  { id: "WALLET",   title: "Wallet",   subtitle: null,                          icon: Wallet      },
];

function SectionLabel({ title, accentColor }) {
  return (
    <p style={{
      fontSize: "13px", fontWeight: 600, color: accentColor,
      letterSpacing: "0.6px", textTransform: "uppercase",
      marginBottom: "12px", marginTop: "24px",
    }}>
      {title}
    </p>
  );
}

function PaymentMethodRow({ method, selected, onSelect, walletBalance, accentColor }) {
  const isSelected = selected === method.id;
  const Icon = method.icon;
  const subtitle = method.id === "WALLET"
    ? `Balance: ₹ ${walletBalance ?? "–"}`
    : method.subtitle;

  return (
    <div
      onClick={() => onSelect(method.id)}
      style={{
        background: isSelected ? `${accentColor}10` : BG_SURFACE,
        border: `1px solid ${isSelected ? `${accentColor}60` : BG_BORDER}`,
        borderRadius: "12px", padding: "14px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", marginBottom: "8px", transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: isSelected ? `${accentColor}18` : BG_ELEVATED,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${isSelected ? `${accentColor}40` : BG_BORDER}`,
        }}>
          <Icon size={18} color={isSelected ? accentColor : TEXT_2} />
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 500, color: TEXT_1 }}>{method.title}</p>
          <p style={{ fontSize: "12px", color: TEXT_3, marginTop: "2px" }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%",
          border: `2px solid ${isSelected ? accentColor : BG_BORDER}`,
          background: isSelected ? accentColor : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {isSelected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />}
        </div>
        <span style={{ fontSize: "9px", color: TEXT_3, fontWeight: 700, letterSpacing: "0.05em" }}>
          COMING SOON
        </span>
      </div>
    </div>
  );
}

function ErrorBanner({ error, errorCode }) {
  const messages = {
    PAYMENT_FAILED:      "Payment failed. Please try a different method or try again.",
    UNAUTHORIZED:        "Session expired. Please log in again.",
    PLAN_NOT_FOUND:      "This plan is no longer available.",
    SUBSCRIPTION_EXISTS: "You already have an active subscription.",
  };
  const display = messages[errorCode] || error || "Something went wrong. Please try again.";
  return (
    <div style={{
      marginTop: "14px", background: RED_BG, border: `1px solid ${RED_BDR}`,
      borderRadius: "12px", padding: "14px 16px",
      display: "flex", alignItems: "flex-start", gap: "10px",
      animation: "fadeIn 0.3s ease both",
    }}>
      <AlertCircle size={16} color={RED} style={{ flexShrink: 0, marginTop: "1px" }} />
      <p style={{ fontSize: "13px", color: RED, margin: 0, lineHeight: 1.5 }}>{display}</p>
    </div>
  );
}

function CoinToggleRow({ useCoins, onToggle, coinDiscount, userCoinBalance }) {
  const hasCoins = userCoinBalance > 0;

  return (
    <div
      onClick={() => hasCoins && onToggle()}
      style={{
        background: useCoins ? GOLD_ACTIVE_BG : BG_SURFACE,
        border: `1px solid ${useCoins ? GOLD_ACTIVE_BDR : BG_BORDER}`,
        borderRadius: "12px", padding: "14px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: hasCoins ? "pointer" : "not-allowed",
        transition: "all 0.2s",
        opacity: hasCoins ? 1 : 0.5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: useCoins ? "#FEF9C3" : BG_ELEVATED,
          border: `1px solid ${useCoins ? GOLD_BDR : BG_BORDER}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px",
        }}>
          🪙
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 500, color: TEXT_1 }}>Gold Coins</p>
          <p style={{ fontSize: "12px", color: TEXT_3, marginTop: "2px" }}>
            {hasCoins
              ? `Balance: ${userCoinBalance} coins · Max 10% off`
              : "No coins available"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
        <div style={{
          width: "44px", height: "24px", borderRadius: "12px",
          background: useCoins ? GOLD : BG_MUTED,
          position: "relative", transition: "background 0.2s",
          border: `1px solid ${useCoins ? GOLD : BG_BORDER}`,
          flexShrink: 0,
        }}>
          <div style={{
            position: "absolute", top: "2px",
            left: useCoins ? "20px" : "2px",
            width: "18px", height: "18px",
            borderRadius: "50%", background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }} />
        </div>
        {useCoins && (
          <span style={{ fontSize: "11px", fontWeight: 700, color: GOLD, animation: "fadeIn 0.2s ease both" }}>
            −₹{coinDiscount.toFixed(0)}
          </span>
        )}
      </div>
    </div>
  );
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const planId  = searchParams.get("plan");
  const planKey = searchParams.get("key");

  const [plan,           setPlan]           = useState(null);
  const [walletBalance,  setWalletBalance]  = useState(null);
  const [userCoinBalance,setUserCoinBalance]= useState(0);
  const [loading,        setLoading]        = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [promoCode,      setPromoCode]      = useState("");
  const [useCoins,       setUseCoins]       = useState(false);
  const [agreed,         setAgreed]         = useState(false);
  const [paying,         setPaying]         = useState(false);
  const [error,          setError]          = useState(null);
  const [errorCode,      setErrorCode]      = useState(null);
  const [payStatus,      setPayStatus]      = useState(null);

  useEffect(() => { fetchData(); }, [planId]);

  const fetchData = async () => {
    try {
      const res  = await fetch(`${API_BASE}/subscriptions/plans?duration=ALL`);
      const data = await res.json();
      const found = (data?.data?.plans || []).find(p => p._id === planId);
      if (!found) throw new Error("Plan not found");
      setPlan(found);

      try {
        const token = getToken();
        if (token) {
          const wRes  = await fetch(`${API_BASE}/wallet/balance`, { headers: { Authorization: `Bearer ${token}` } });
          const wData = await wRes.json();
          setWalletBalance(wData?.data?.balance ?? null);

          const cRes  = await fetch(`${API_BASE}/coins/balance`, { headers: { Authorization: `Bearer ${token}` } });
          const cData = await cRes.json();
          setUserCoinBalance(cData?.data?.gold_coins?.balance ?? 0);
        }
      } catch (_) {}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAnnual  = plan?.duration?.value === 365;
  const price     = plan?.price?.amount ?? 0;
  const coins     = plan?.gold_coins?.amount ?? 0;
  const isVIP     = plan?.key?.startsWith("vip");
  const isPro     = plan?.key?.startsWith("pro");
  const isStarter = plan?.key?.startsWith("starter");

  const accentColor = isVIP ? ACCENT_VIP : isPro ? ACCENT_PRO : isStarter ? ACCENT_STARTER : ACCENT_FREE;

  const coinDiscount    = Math.floor(price * 0.10);
  const coinsRequired   = coinDiscount;
  const canUseCoin      = userCoinBalance >= coinsRequired && coinsRequired > 0;
  const appliedDiscount = useCoins && canUseCoin ? coinDiscount : 0;
  const total           = price - appliedDiscount;

  const handlePayment = async () => {
    if (!agreed) {
      setError("Please agree to the Terms & Conditions first.");
      setErrorCode(null);
      return;
    }
    const token = getToken();
    if (!token) {
      setError("Missing authorization token. Please log in again.");
      setErrorCode("UNAUTHORIZED");
      return;
    }

    setPaying(true);
    setError(null);
    setErrorCode(null);
    setPayStatus(null);

    try {
      // FIXED: correct body matching endpoint 39 in API docs
      const purchaseRes = await fetch(`${API_BASE}/subscriptions/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plan_id:        planId,
          payment_method: "TEST",
          auto_renew:     true,
          use_coins:      useCoins && canUseCoin,
          coins_to_use:   useCoins && canUseCoin ? coinsRequired : 0,
        }),
      });

      const purchaseData = await purchaseRes.json();

      if (purchaseData?.status === "error") {
        setPayStatus("failed");
        setError(purchaseData?.message || "Payment failed.");
        setErrorCode(purchaseData?.error_code || null);
        setPaying(false);
        return;
      }

      if (purchaseData?.status === "success") {
        setPayStatus("success");
        const creditedCoins = purchaseData?.data?.coins_credited ?? coins;
        setTimeout(() => {
          router.push(`/home/subscription/activation-screen?plan=${planId}&key=${planKey}&coins=${creditedCoins}`);
        }, 600);
        return;
      }

      if (purchaseData?.data?.razorpay_order_id) {
        const loaded = await loadRazorpayScript();
        if (!loaded) throw new Error("Failed to load Razorpay. Please try again.");
        new window.Razorpay({
          key:         RAZORPAY_KEY,
          amount:      total * 100,
          currency:    "INR",
          name:        "Playymate",
          description: `${plan.name} – ${isAnnual ? "Yearly" : "Monthly"}`,
          order_id:    purchaseData.data.razorpay_order_id,
          handler: () => {
            setPayStatus("success");
            setTimeout(() => {
              router.push(`/home/subscription/activation-screen?plan=${planId}&key=${planKey}&coins=${coins}`);
            }, 600);
          },
          theme: { color: accentColor },
          modal: { ondismiss: () => { setPaying(false); setPayStatus(null); } },
        }).open();
        return;
      }

      throw new Error(purchaseData?.message || "Unexpected response. Please try again.");
    } catch (err) {
      setPayStatus("failed");
      setError(err.message);
      setErrorCode(null);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG_PAGE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "32px", height: "32px", border: `3px solid ${BG_BORDER}`, borderTop: `3px solid ${ACCENT_PRO}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: TEXT_2, fontSize: "13px" }}>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ minHeight: "100vh", background: BG_PAGE, color: TEXT_1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>{error || "Plan not found"}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG_PAGE, color: TEXT_1, paddingBottom: "120px" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "16px 20px", borderBottom: `1px solid ${BG_BORDER}`,
        background: BG_PAGE, position: "sticky", top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: TEXT_2, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}
        >
          <ArrowLeft size={18} /> Checkout
        </button>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 0" }}>

        <div style={{
          background: `linear-gradient(135deg, ${accentColor}22, #F9FAFB)`,
          border: `1px solid ${accentColor}40`,
          borderRadius: "20px", padding: "24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
            }}>
              {isVIP ? "👑" : "⭐"}
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: TEXT_1 }}>{plan.name} Plan</p>
              <p style={{ fontSize: "12px", color: TEXT_2, marginTop: "3px" }}>Billed {isAnnual ? "yearly" : "monthly"}</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "26px", fontWeight: 800, color: accentColor }}>₹{price}</span>
            <span style={{ fontSize: "12px", color: TEXT_2 }}>/{isAnnual ? "yr" : "mo"}</span>
          </div>
        </div>

        <div style={{ background: GOLD_BG, border: `1px solid ${GOLD_BDR}`, borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>🧪</span>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: GOLD, margin: 0 }}>Test Mode Active</p>
            <p style={{ fontSize: "11px", color: "#92400E", margin: "2px 0 0" }}>Payments are simulated. No real money charged.</p>
          </div>
        </div>

        <SectionLabel title="Payment Method" accentColor={accentColor} />
        {PAYMENT_METHODS.map(m => (
          <PaymentMethodRow
            key={m.id} method={m}
            selected={selectedMethod}
            onSelect={id => { setSelectedMethod(id); setError(null); setErrorCode(null); setPayStatus(null); }}
            walletBalance={walletBalance}
            accentColor={accentColor}
          />
        ))}

        <SectionLabel title="Gold Coins" accentColor={accentColor} />

        <p style={{ fontSize: "12px", color: TEXT_3, marginBottom: "10px", lineHeight: 1.5 }}>
          Gold Coins can cover up to <span style={{ color: GOLD, fontWeight: 700 }}>10%</span> of your plan price.
          {userCoinBalance > 0 && (
            <span style={{ color: TEXT_2 }}> You have <span style={{ color: GOLD, fontWeight: 700 }}>{userCoinBalance} coins</span>.</span>
          )}
        </p>

        <CoinToggleRow
          useCoins={useCoins}
          onToggle={() => { setUseCoins(prev => !prev); setError(null); setErrorCode(null); }}
          coinDiscount={coinDiscount}
          userCoinBalance={userCoinBalance}
        />

        {useCoins && canUseCoin && (
          <div style={{
            marginTop: "10px", background: GOLD_ACTIVE_BG, border: `1px solid ${GOLD_BDR}`,
            borderRadius: "10px", padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            animation: "fadeIn 0.25s ease both",
          }}>
            <span style={{ fontSize: "12px", color: TEXT_2 }}>🪙 {coinsRequired} coins will be deducted</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: GOLD }}>−₹{coinDiscount.toFixed(0)} off</span>
          </div>
        )}

        <SectionLabel title="Promo Code" accentColor={accentColor} />
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text" placeholder="Enter Code" value={promoCode}
            onChange={e => setPromoCode(e.target.value)}
            style={{
              flex: 1, background: BG_SURFACE, border: `1px solid ${BG_BORDER}`,
              borderRadius: "12px", padding: "13px 16px", color: TEXT_1,
              fontSize: "14px", outline: "none",
            }}
            onFocus={e => e.target.style.borderColor = accentColor}
            onBlur={e  => e.target.style.borderColor = BG_BORDER}
          />
          <button
            style={{
              padding: "13px 20px", borderRadius: "12px",
              border: `1px solid ${BG_BORDER}`, background: BG_ELEVATED,
              color: TEXT_2, fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = TEXT_1; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BG_BORDER;   e.currentTarget.style.color = TEXT_2; }}
          >
            Apply
          </button>
        </div>

        <SectionLabel title="Order Summary" accentColor={accentColor} />
        <div style={{ background: BG_SURFACE, border: `1px solid ${accentColor}30`, borderRadius: "20px", padding: "20px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: TEXT_1 }}>{plan.name} Plan</span>
            <span style={{
              fontSize: "11px", fontWeight: 700, color: accentColor,
              background: `${accentColor}18`, border: `1px solid ${accentColor}40`,
              borderRadius: "20px", padding: "3px 10px",
            }}>
              {isAnnual ? "Yearly" : "Monthly"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: TEXT_2, marginBottom: "10px" }}>
            <span>Plan Price</span>
            <span style={{ color: TEXT_1 }}>₹ {price.toFixed(2)}</span>
          </div>

          {useCoins && canUseCoin && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "10px", animation: "fadeIn 0.25s ease both" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px", color: GOLD }}>
                🪙 Gold Coins (10%)
              </span>
              <span style={{ color: GOLD, fontWeight: 700 }}>−₹ {coinDiscount.toFixed(2)}</span>
            </div>
          )}

          <div style={{ borderTop: `1px solid ${BG_BORDER}`, marginBottom: "14px" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: TEXT_1 }}>Total Payable</span>
            <div style={{ textAlign: "right" }}>
              {useCoins && canUseCoin && (
                <div style={{ fontSize: "12px", color: TEXT_3, textDecoration: "line-through", marginBottom: "2px" }}>
                  ₹ {price.toFixed(2)}
                </div>
              )}
              <span style={{ fontSize: "24px", fontWeight: 800, color: accentColor }}>
                ₹ {total.toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{
            marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${BG_BORDER}`,
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: GOLD_BG, border: `1px solid ${GOLD_BDR}`,
            borderRadius: "20px", padding: "6px 14px",
            fontSize: "13px", color: GOLD, fontWeight: 600,
          }}>
            🪙 +{coins} coins you'll earn
          </div>
        </div>

        <div style={{
          marginTop: "12px", padding: "12px 16px",
          background: BG_SURFACE, borderRadius: "12px", border: `1px solid ${BG_BORDER}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "12px", color: TEXT_2 }}>Paying via</span>
          <span style={{ fontSize: "13px", fontWeight: 600, color: TEXT_1 }}>
            {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.title}
            {useCoins && canUseCoin && <span style={{ color: GOLD, marginLeft: "6px" }}>+ 🪙 Coins</span>}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "20px" }}>
          <input type="checkbox" id="terms" checked={agreed}
            onChange={e => { setAgreed(e.target.checked); if (error?.includes("Terms")) { setError(null); setErrorCode(null); } }}
            style={{ marginTop: "2px", accentColor: accentColor, cursor: "pointer" }}
          />
          <label htmlFor="terms" style={{ fontSize: "12px", color: TEXT_2, lineHeight: 1.6, cursor: "pointer" }}>
            I agree to the Terms &amp; Conditions and authorize recurring payments
          </label>
        </div>

        {error && <ErrorBanner error={error} errorCode={errorCode} />}

        {payStatus === "success" && (
          <div style={{
            marginTop: "14px", background: GREEN_BG, border: `1px solid ${GREEN_BDR}`,
            borderRadius: "12px", padding: "14px 16px",
            display: "flex", alignItems: "center", gap: "10px",
            animation: "fadeIn 0.3s ease both",
          }}>
            <CheckCircle2 size={16} color={GREEN} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: "13px", color: GREEN, margin: 0 }}>Payment successful! Redirecting…</p>
          </div>
        )}

        {errorCode === "PAYMENT_FAILED" && (
          <div style={{
            marginTop: "10px", padding: "12px 16px",
            background: BG_SURFACE, borderRadius: "12px", border: `1px solid ${BG_BORDER}`,
            animation: "fadeIn 0.3s ease both",
          }}>
            <p style={{ fontSize: "12px", color: TEXT_2, margin: 0, lineHeight: 1.6 }}>
              💡 <strong style={{ color: TEXT_1 }}>Try another method</strong> — select a different payment option above and try again.
            </p>
          </div>
        )}

      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "16px 20px",
        background: "linear-gradient(to top,#FFFFFF 70%,transparent)",
        display: "flex", justifyContent: "center", zIndex: 20,
      }}>
        <button
          onClick={handlePayment}
          disabled={paying || payStatus === "success"}
          style={{
            width: "100%", maxWidth: "440px", marginLeft: "160px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "15px", borderRadius: "14px", border: "none",
            cursor: paying || payStatus === "success" ? "not-allowed" : "pointer",
            fontSize: "15px", fontWeight: 700,
            background: paying || payStatus === "success"
              ? BG_MUTED
              : `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
            color: paying || payStatus === "success" ? TEXT_3 : "#fff",
            opacity: paying ? 0.7 : 1, transition: "opacity 0.2s",
          }}
          onMouseEnter={e => { if (!paying && payStatus !== "success") e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >
          {paying ? (
            <>
              <div style={{ width: "16px", height: "16px", border: `2px solid ${TEXT_3}`, borderTop: `2px solid ${TEXT_2}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              Processing…
            </>
          ) : payStatus === "success" ? (
            <><CheckCircle2 size={18} /> Payment Successful!</>
          ) : (
            `Pay ₹${total.toFixed(0)}${useCoins && canUseCoin ? " (Coins Applied 🪙)" : ""}`
          )}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: BG_PAGE }} />}>
      <CheckoutPageContent />
    </Suspense>
  );
}