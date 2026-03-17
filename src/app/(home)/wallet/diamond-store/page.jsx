"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token") ||
    null
  );
};

// Label names mapped by index order from API
const PACK_LABELS = ["Mini", "Starter", "Value", "Pro", "Mega", "Ultra"];

export default function DiamondStore() {
  const router = useRouter();

  const [packs, setPacks]     = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch packages + balance in parallel ── */
  useEffect(() => {
    const token = getToken();
    (async () => {
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [pkgRes, balRes] = await Promise.all([
          fetch(`${API_BASE}/diamonds/packages`, { headers }),
          token
            ? fetch(`${API_BASE}/diamonds/balance`, { headers })
            : Promise.resolve(null),
        ]);

        const pkgData = await pkgRes.json();
        if (pkgData?.status === "success")
          setPacks(pkgData.data?.packages || []);

        if (balRes) {
          const balData = await balRes.json();
          if (balData?.status === "success")
            setBalance(balData.data?.balance ?? 0);
        }
      } catch (err) {
        console.error("Diamond store fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Helpers ── */
  const bonusAmt = (pkg) =>
    pkg.bonus_percent > 0
      ? Math.round(
          (Number(pkg.diamonds) * pkg.bonus_percent) / (100 + pkg.bonus_percent)
        )
      : 0;

  const minVpd =
    packs.length > 0
      ? Math.min(...packs.map((p) => p.value_per_diamond))
      : Infinity;

  const badge = (pkg, idx) => {
    if (pkg.value_per_diamond === minVpd) return "Best Value";
    if (pkg.bonus_percent >= 10)          return "Popular";
    return null;
  };

  /* ── Navigate to detail page ── */
  const goToDetail = (pkg) =>
    router.push(
      `/wallet/diamond-store/${pkg.id}?price=${pkg.price}&diamonds=${pkg.diamonds}&bonus=${pkg.bonus_percent}`
    );

  /* ────────────────────────── UI ────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F5F6FA] font-sans pb-14">

      {/* ── Header ── */}
      <div className=" px-5 pb-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Diamond store</h1>
      </div>

      {/* ── Hero ── */}
      <div className="px-5 pt-8 pb-6 text-center">
        <div className="relative inline-flex items-center justify-center mb-3">
          <span className="text-5xl drop-shadow">💎</span>
          <span className="absolute -top-2 -right-4 text-lg">✨</span>
          <span className="absolute bottom-0 -left-4 text-xs opacity-60">✦</span>
        </div>

        <h2
          className="text-2xl font-black tracking-tight"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Power Up With Diamonds
        </h2>

        <p className="text-gray-400 text-sm mt-1">
          Unlock Boosts, Themes &amp; Premium Features
        </p>

        {/* Live balance pill */}
        {balance !== null && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white border border-blue-100 shadow-sm px-5 py-2 rounded-full">
            <span className="text-lg">💎</span>
            <span className="text-blue-600 text-sm font-bold">
              {balance.toLocaleString()} diamonds
            </span>
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="px-4">
        {loading ? (
          /* Skeleton */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {Array(4).fill(0).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-gray-200 animate-pulse"
                style={{ height: "210px" }}
              />
            ))}
          </div>

        ) : packs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">💎</p>
            <p className="text-sm">No packages available</p>
          </div>

        ) : (
          <div
            style={{
              display: "grid",
              /* Two perfectly equal columns — neither stretches */
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              alignItems: "start",
            }}
          >
            {packs.map((pack, idx) => {
              const isLastOdd =
                idx === packs.length - 1 && packs.length % 2 !== 0;
              const bdg   = badge(pack, idx);
              const bonus = bonusAmt(pack);
              const label = PACK_LABELS[idx % PACK_LABELS.length];

              return (
                <div
                  key={pack.id}
                  /* Last odd card spans full row */
                  style={isLastOdd ? { gridColumn: "1 / -1" } : {}}
                  /* pt-4 reserves space for the floating badge */
                  className="relative pt-4"
                >
                  {/* ── Floating badge ── */}
                  {bdg && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                      <span
                        className="px-3 py-0.5 rounded-full text-xs font-bold text-white shadow whitespace-nowrap"
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6, #06b6d4)",
                        }}
                      >
                        {bdg}
                      </span>
                    </div>
                  )}

                  {/* ── Card ── */}
                  <div
                    onClick={() => goToDetail(pack)}
                    className="relative w-full rounded-3xl p-4 cursor-pointer
                               active:scale-[0.97] transition-transform shadow-md
                               flex flex-col"
                    style={{
                      /* Dark navy — matches PNG cards, contrasts well on light bg */
                      background:
                        "linear-gradient(155deg, #1c2333 0%, #1e2d4a 100%)",
                      /* Fixed height keeps every card in a row the same size */
                      height: isLastOdd ? "auto" : "210px",
                      minHeight: "210px",
                    }}
                  >
                    {/* Diamond icon */}
                    <span className="text-3xl mb-2 block">💎</span>

                    {/* Pack name */}
                    <p className="text-white/80 text-sm font-semibold mb-1">
                      {label}
                    </p>

                    {/* Diamond count — gradient text */}
                    <p
                      className="font-black leading-none mb-1"
                      style={{
                        fontSize: isLastOdd ? "2.25rem" : "1.75rem",
                        background:
                          "linear-gradient(135deg, #3b82f6, #06b6d4)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {Number(pack.diamonds).toLocaleString()}
                    </p>

                    {/* "Diamonds" label  +  FREE bonus badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-400">Diamonds</span>
                      {bonus > 0 && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white leading-tight"
                          style={{
                            background:
                              "linear-gradient(135deg, #16a34a, #22c55e)",
                          }}
                        >
                          +{bonus} FREE
                        </span>
                      )}
                    </div>

                    {/* Push price button to bottom */}
                    <div className="flex-1" />

                    {/* Price button */}
                    <div
                      className="w-full py-2.5 rounded-2xl text-center
                                 font-bold text-white text-sm mt-1"
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6, #06b6d4)",
                      }}
                    >
                      ₹{pack.price}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


    </div>
  );
}