"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Zap } from "lucide-react";

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [config, setConfig] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const API = "https://localhost:5000/api/v1";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const configRes = await fetch(`${API}/subscriptions/page-config`);
      const configJson = await configRes.json();

      const planRes = await fetch(`${API}/superadmin/subscriptions?status=ACTIVE`);
      const planJson = await planRes.json();

      setConfig(configJson?.data?.config);
      setPlans(planJson?.data?.plans || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO SECTION */}
      <div className="text-center pt-12 pb-10 px-4">

        {config?.hero_image_url && (
          <img
            src={config.hero_image_url}
            className="w-24 h-24 mx-auto mb-6 rounded-xl"
            alt="hero"
          />
        )}

        <h1 className="text-4xl font-bold">
          {config?.hero_heading}
        </h1>

        <p className="text-gray-400 mt-3 max-w-lg mx-auto">
          {config?.hero_subtext}
        </p>

      </div>


      {/* PLANS GRID */}
      <div className="max-w-6xl mx-auto px-4 pb-16">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {plans.map((plan) => (

            <div
              key={plan._id}
              onClick={() => setSelectedPlan(plan._id)}
              className={`relative p-6 rounded-2xl border cursor-pointer transition
              
              ${plan.is_popular
                ? "border-pink-500 shadow-lg"
                : "border-gray-800"}

              ${selectedPlan === plan._id
                ? "ring-2 ring-purple-500"
                : ""}
              
              bg-[#0c0c0c]`}
            >

              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-1 text-xs rounded-full">
                    Popular
                  </span>
                </div>
              )}

              {/* VIP Badge */}
              {plan.badge_text && (
                <div className="absolute top-3 left-3 flex items-center gap-1 text-yellow-400 text-xs">
                  <Crown size={14} />
                  {plan.badge_text}
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-bold mb-3">
                {plan.name}
              </h3>


              {/* Price */}
              <div className="flex items-end gap-2 mb-4">

                <span className="text-4xl font-bold">
                  ₹{plan.price?.amount}
                </span>

                <span className="text-gray-400 text-sm">
                  /{plan.duration?.value === 365 ? "year" : "month"}
                </span>

              </div>


              {/* Features */}
              <ul className="space-y-2 mb-6">

                {plan.features?.slice(0, 6).map((feature, i) => (

                  <li key={i} className="flex items-center gap-2 text-sm">

                    <Check
                      size={14}
                      className="text-green-500"
                    />

                    {feature}

                  </li>

                ))}

              </ul>


              {/* Coins */}
              <div className="flex items-center justify-end gap-1 text-yellow-400 mb-5">

                <Zap size={16} />

                {plan.gold_coins?.amount} coins

              </div>


              {/* Button */}
              <button className={`w-full py-3 rounded-xl font-semibold transition
              
              ${plan.is_popular
                ? "bg-gradient-to-r from-pink-500 to-orange-500"
                : "bg-gray-800 hover:bg-gray-700"}
              
              `}>
                Choose Plan
              </button>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
}