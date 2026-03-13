"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Crown, Zap, X } from "lucide-react";

export default function UpgradePage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePlanSelect = (planId) => {
    // Navigate to pro-plan page with the selected plan ID as query parameter
    router.push(`/home/upgrade/pro-plan?plan=${planId}`);
  };

  const plans = [
    {
      id: "free",
      name: "FREE",
      price: 0,
      features: ["2 Teams", "3 Events/mo", "Basic Profile", "50 coins/mo"],
      coins: 50,
      buttonText: "Choose Free",
      popular: false,
    },
    {
      id: "starter",
      name: "Starter",
      price: 99,
      features: ["5 Teams", "10 Events/mo", "Passport Lite", "200 coins/mo"],
      coins: 200,
      buttonText: "Choose Starter",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro Player",
      price: 299,
      features: ["Unlimited Teams", "Unlimited Events", "AI Suggestions", "No Ads", "800 coins/mo"],
      coins: 800,
      buttonText: "Go Pro",
      popular: true,
    },
    {
      id: "vip",
      name: "VIP",
      price: 299,
      features: ["Everything in Pro", "VIP Passport", "AI Suggestions", "Priority Support", "2000 coins/mo"],
      coins: 2000,
      buttonText: "Unlock Premium",
      popular: false,
      isVip: true,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans animate-fade-in">
      {/* Top Header Section */}
      <div className="pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Skip Button */}
          <div className="flex justify-end max-w-4xl mx-auto mb-6">
            <button className="text-gray-400 hover:text-white transition-colors text-sm">
              Skip
            </button>
          </div>

          {/* App Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/30 to-orange-500/30 mb-6">
            <Sparkles className="w-10 h-10 text-purple-500" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-white">Upgrade your</span>
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Playymate Experience
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-blue-400 text-lg font-medium mt-4">
            Enjoy 30 days of free access
          </p>
        </div>
      </div>

      {/* Monthly / Yearly Toggle */}
      <div className="flex justify-center mb-10 px-4">
        <div className="bg-[#1a1a1a] rounded-full p-1.5 flex items-center">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              !isAnnual
                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              isAnnual
                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`
                relative
                bg-[#0a0a0a]
                rounded-2xl
                p-6
                border
                transition-all duration-300
                cursor-pointer
                hover:-translate-y-1
                ${plan.popular 
                  ? "border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.3)]" 
                  : plan.isVip
                  ? "border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                  : "border-gray-800 hover:border-gray-700"
                }
                ${selectedPlan === plan.id ? "ring-2 ring-purple-500" : ""}
              `}
            >
              {/* Radio Selection */}
              <div className="absolute top-4 right-4">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedPlan === plan.id 
                    ? "border-pink-500 bg-pink-500" 
                    : "border-gray-600"
                  }
                `}>
                  {selectedPlan === plan.id && <Check size={12} className="text-white" />}
                </div>
              </div>

              {/* Badges */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}
              {plan.isVip && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Crown size={12} />
                    VIP
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-bold mb-4">{plan.name}</h3>

              {/* Price */}
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-gray-500 text-sm mb-1">/month</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Coin Price */}
              <div className="flex items-center justify-end gap-1 mb-4 text-yellow-400">
                <Zap size={14} />
                <span className="text-sm font-medium">{plan.coins} coins</span>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanSelect(plan.id)}
                className={`
                  w-full py-3 rounded-xl font-semibold transition-all duration-300
                  ${plan.popular 
                    ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]" 
                    : plan.isVip
                    ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:opacity-90 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                    : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                  }
                `}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
