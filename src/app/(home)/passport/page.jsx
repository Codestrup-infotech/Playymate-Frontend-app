"use client";

import { useTheme } from "@/lib/ThemeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PassportPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const pageBg = isDark ? "bg-[#0d0d1a] text-white" : "bg-gray-50 text-gray-900";
  const cardBg = isDark ? "bg-[#13132b] border-purple-500/30" : "bg-white border-purple-200";
  const gridBg = isDark ? "bg-[#13132b] border-purple-500/20 hover:border-pink-500/40" : "bg-white border-purple-100 hover:border-pink-300";
  const trackBg = isDark ? "bg-[#1a1a35]" : "bg-gray-100";
  const mutedText = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen pb-36 transition-colors duration-300 ${pageBg}`}>
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Playymate Passport
        </h1>
        <p className={`text-sm mt-1 ${mutedText}`}>Track your journey, collect your moments</p>
      </div>

      {/* User Card */}
      <div className="mx-4">
        <div className={`rounded-2xl p-5 border shadow-lg ${cardBg}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">Alex Morgan</h2>
              <p className={`text-sm ${mutedText}`}>Passport ID: PLY-2024-789456</p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Issue Date: Feb 10, 2026</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 rounded-full">
              <span className="text-white text-xs font-medium">Premium</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/passport/digital")}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${isDark ? "bg-[#1a1a35] hover:bg-[#252545] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
          >
            Tap to View Passport →
          </button>
        </div>
      </div>

      {/* Dream Progress */}
      <div className="mx-4 mt-6">
        <h3 className="font-semibold mb-3">Dream Progress</h3>
        <div className={`rounded-2xl p-4 border ${cardBg}`}>
          {[
            { label: "Done", color: "bg-green-500", textColor: "text-green-500", count: 2 },
            { label: "Planned", color: "bg-orange-500", textColor: "text-orange-500", count: 2 },
            { label: "Dream", color: "bg-purple-500", textColor: "text-purple-500", count: 2 },
          ].map((item) => (
            <div key={item.label} className="mb-3 last:mb-0">
              <div className="flex justify-between text-sm mb-1">
                <span className={item.textColor}>{item.label}</span>
                <span className={mutedText}>{item.count}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${trackBg}`}>
                <div className={`h-full ${item.color} rounded-full`} style={{ width: "33%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Grid Cards */}
      <div className="mx-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/passport/bucket", emoji: "🎯", title: "Bucket List", sub: "6 items" },
            { href: "/passport/stamps", emoji: "🏆", title: "Stamps", sub: "6 collected" },
            { href: "/passport/suggestions", emoji: "💡", title: "Suggestions", sub: "AI powered" },
            { href: "/passport/print-and-order", emoji: "📘", title: "Print & Order", sub: "Physical passport" },
          ].map((card) => (
            <Link key={card.href} href={card.href}>
              <div className={`rounded-2xl p-4 border transition-colors cursor-pointer ${gridBg}`}>
                <div className="text-3xl mb-2">{card.emoji}</div>
                <h4 className="font-medium">{card.title}</h4>
                <p className={`text-sm ${mutedText}`}>{card.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-6 left-4 right-4">
        <Link href="/passport/bucket">
          <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-pink-500/25">
            + Add to Bucket List
          </button>
        </Link>
      </div>
    </div>
  );
}
