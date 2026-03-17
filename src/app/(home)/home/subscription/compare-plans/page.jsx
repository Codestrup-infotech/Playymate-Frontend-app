// "use client";

// import React, { useState } from "react";

// const USER_ACTIVE_PLAN = "Pro";

// const plans = ["Free", "Starter", "Pro", "Premium"];
// const prices = ["₹0/mo", "₹99/mo", "₹299/mo", "₹499/mo"];

// const features = [
//   { name: "Teams", values: ["2", "5", "∞", "∞"] },
//   { name: "Events/mo", values: ["3", "10", "∞", "∞"] },
//   { name: "Participants", values: ["20", "50", "200", "∞"] },
//   { name: "Gold Coins/mo", values: ["50", "200", "800", "2000"] },
//   { name: "Passport PDF", values: ["✖", "✔", "✔", "✔"] },
//   { name: "Physical Passport", values: ["✖", "✖", "✔", "✔"] },
//   { name: "AI Suggestions", values: ["✖", "Basic", "Advanced", "Priority"] },
//   { name: "Boost Posts", values: ["✖", "✖", "✔", "✔"] },
//   { name: "Ad-Free", values: ["✖", "✖", "✔", "✔"] },
//   { name: "Priority Support", values: ["✖", "✖", "✖", "✔"] },
//   { name: "VIP Passport", values: ["✖", "✖", "✖", "✔"] },
// ];

// const planMeta = {
//   Free: {
//     color: "text-gray-600",
//     border: "border-gray-200",
//     glow: "",
//     gradient: "from-gray-400 to-gray-300",
//   },
//   Starter: {
//     color: "text-blue-600",
//     border: "border-blue-400",
//     glow: "shadow-blue-200",
//     gradient: "from-blue-500 to-blue-400",
//   },
//   Pro: {
//     color: "text-orange-600",
//     border: "border-orange-400",
//     glow: "shadow-orange-200",
//     gradient: "from-pink-500 to-orange-400",
//   },
//   Premium: {
//     color: "text-pink-600",
//     border: "border-pink-400",
//     glow: "shadow-pink-200",
//     gradient: "from-pink-500 to-purple-500",
//   },
// };

// export default function ComparePlansPage() {
//   const [billingCycle, setBillingCycle] = useState("monthly");
//   const activeIdx = plans.indexOf(USER_ACTIVE_PLAN);

//   return (
//     <div className="min-h-screen bg-white text-gray-800 px-4 py-10 flex justify-center">
//       <div className="w-full max-w-5xl space-y-8">

//         {/* Header */}
//         <div>
//           <button
//             onClick={() => window.history.back()}
//             className="text-gray-500 hover:text-gray-900 text-sm mb-4 flex items-center gap-1 transition-colors"
//           >
//             ← Back
//           </button>

//           <h1 className="text-2xl font-bold text-center text-gray-900">Compare Plans</h1>

//           <p className="text-gray-500 text-sm mt-1 text-center">
//             Find the perfect plan for your game 🎯
//           </p>
//         </div>

//         {/* Billing Toggle */}
//         <div className="flex justify-center">
//           <div className="flex bg-gray-100 border border-gray-200 rounded-full p-1 gap-1">
//             {["monthly", "yearly"].map((cycle) => (
//               <button
//                 key={cycle}
//                 onClick={() => setBillingCycle(cycle)}
//                 className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
//                   billingCycle === cycle
//                     ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
//                     : "text-gray-500 hover:text-gray-900"
//                 }`}
//               >
//                 {cycle}

//                 {cycle === "yearly" && (
//                   <span className="ml-1.5 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
//                     Save 20%
//                   </span>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <div style={{ minWidth: 520 }}>

//             {/* Column Headers */}
//             <div
//               className="grid mb-0"
//               style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}
//             >
//               <div />

//               {plans.map((plan, i) => {
//                 const isActive = plan === USER_ACTIVE_PLAN;
//                 const meta = planMeta[plan];

//                 return (
//                   <div key={plan} className="flex flex-col items-center px-1">

//                     {isActive ? (
//                       <div className="mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow tracking-wide">
//                         ✦ Active
//                       </div>
//                     ) : (
//                       <div className="mb-2 h-[22px]" />
//                     )}

//                     <div
//                       className={`w-full rounded-xl border-2 ${meta.border} ${
//                         isActive
//                           ? `shadow-md ${meta.glow} bg-gray-50`
//                           : "bg-white"
//                       } py-3 px-2 text-center`}
//                     >
//                       <p className={`text-sm font-bold ${meta.color}`}>
//                         {plan}
//                       </p>

//                       <p className="text-xs text-gray-500 mt-0.5">
//                         {prices[i]}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Feature Rows */}
//             <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
//               {features.map((feature, rowIdx) => (
//                 <div
//                   key={rowIdx}
//                   className={`grid items-center ${
//                     rowIdx !== 0 ? "border-t border-gray-200" : ""
//                   }`}
//                   style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}
//                 >

//                   <div className="py-3.5 pl-4 text-sm text-gray-700">
//                     {feature.name}
//                   </div>

//                   {feature.values.map((val, colIdx) => {
//                     const isActive = plans[colIdx] === USER_ACTIVE_PLAN;
//                     const isTick = val === "✔";
//                     const isCross = val === "✖";
//                     const isPaid = colIdx >= 2;

//                     return (
//                       <div
//                         key={colIdx}
//                         className={`py-3.5 text-center text-sm ${
//                           isActive ? "bg-orange-50" : ""
//                         }`}
//                       >
//                         {isTick ? (
//                           <span className="text-green-500 font-bold">✔</span>
//                         ) : isCross ? (
//                           <span className="text-gray-400">✖</span>
//                         ) : (
//                           <span
//                             className={`font-semibold ${
//                               isActive
//                                 ? "text-orange-600"
//                                 : isPaid
//                                 ? "bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
//                                 : "text-gray-500"
//                             }`}
//                           >
//                             {val}
//                           </span>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               ))}
//             </div>

//             {/* CTA Buttons */}
//             <div
//               className="grid mt-4 gap-2"
//               style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}
//             >
//               <div />

//               {plans.map((plan, i) => {
//                 const isActive = plan === USER_ACTIVE_PLAN;
//                 const isUpgrade = i > activeIdx;

//                 return (
//                   <button
//                     key={plan}
//                     disabled={isActive}
//                     className={`py-2 rounded-xl text-xs font-bold transition-all ${
//                       isActive
//                         ? "bg-orange-100 text-orange-600 border border-orange-300 cursor-default"
//                         : isUpgrade
//                         ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90"
//                         : "bg-gray-100 text-gray-500 hover:bg-gray-200"
//                     }`}
//                   >
//                     {isActive
//                       ? "Current"
//                       : isUpgrade
//                       ? "Upgrade"
//                       : "Downgrade"}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <p className="text-center text-xs text-gray-400 pb-4">
//           All plans include 30-day free trial · Cancel anytime · Prices in INR
//         </p>

//       </div>
//     </div>
//   );
// }





"use client";

import React, { useState } from "react";

const USER_ACTIVE_PLAN = "Pro";

const plans = ["Free", "Starter", "Pro", "Premium"];
const prices = ["₹0/mo", "₹99/mo", "₹299/mo", "₹499/mo"];

const features = [
  { name: "Teams", values: ["2", "5", "∞", "∞"] },
  { name: "Events/mo", values: ["3", "10", "∞", "∞"] },
  { name: "Participants", values: ["20", "50", "200", "∞"] },
  { name: "Gold Coins/mo", values: ["50", "200", "800", "2000"] },
  { name: "Passport PDF", values: ["✖", "✔", "✔", "✔"] },
  { name: "Physical Passport", values: ["✖", "✖", "✔", "✔"] },
  { name: "AI Suggestions", values: ["✖", "Basic", "Advanced", "Priority"] },
  { name: "Boost Posts", values: ["✖", "✖", "✔", "✔"] },
  { name: "Ad-Free", values: ["✖", "✖", "✔", "✔"] },
  { name: "Priority Support", values: ["✖", "✖", "✖", "✔"] },
  { name: "VIP Passport", values: ["✖", "✖", "✖", "✔"] },
];

const planMeta = {
  Free: {
    color: "text-gray-600",
    border: "border-gray-200",
    glow: "",
    gradient: "from-gray-400 to-gray-300",
  },
  Starter: {
    color: "text-blue-600",
    border: "border-blue-400",
    glow: "shadow-blue-200",
    gradient: "from-blue-500 to-blue-400",
  },
  Pro: {
    color: "text-orange-600",
    border: "border-orange-400",
    glow: "shadow-orange-200",
    gradient: "from-pink-500 to-orange-400",
  },
  Premium: {
    color: "text-pink-600",
    border: "border-pink-400",
    glow: "shadow-pink-200",
    gradient: "from-pink-500 to-purple-500",
  },
};

export default function ComparePlansPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const activeIdx = plans.indexOf(USER_ACTIVE_PLAN);

  return (
    <div className="min-h-screen bg-white text-gray-800 px-4 py-10 flex justify-center">
      <div className="w-full max-w-5xl space-y-8">

        {/* Header */}
        <div>
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-gray-900 text-sm mb-4 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold text-center text-gray-900">Compare Plans</h1>

          <p className="text-gray-500 text-sm mt-1 text-center">
            Find the perfect plan for your game 🎯
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 border border-gray-200 rounded-full p-1 gap-1">
            {["monthly", "yearly"].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                  billingCycle === cycle
                    ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {cycle}

                {cycle === "yearly" && (
                  <span className="ml-1.5 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
                    Save 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: 520 }}>

            {/* Column Headers */}
            <div
              className="grid mb-0"
              style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}
            >
              <div />

              {plans.map((plan, i) => {
                const isActive = plan === USER_ACTIVE_PLAN;
                const meta = planMeta[plan];

                return (
                  <div key={plan} className="flex flex-col items-center px-1">

                    {isActive ? (
                      <div className="mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow tracking-wide">
                        ✦ Active
                      </div>
                    ) : (
                      <div className="mb-2 h-[22px]" />
                    )}

                    <div
                      className={`w-full rounded-xl border-2 ${meta.border} ${
                        isActive
                          ? `shadow-md ${meta.glow} bg-gray-50`
                          : "bg-white"
                      } py-3 px-2 text-center`}
                    >
                      <p className={`text-sm font-bold ${meta.color}`}>
                        {plan}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {prices[i]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Rows */}
            <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
              {features.map((feature, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`grid items-center ${
                    rowIdx !== 0 ? "border-t border-gray-200" : ""
                  }`}
                  style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}
                >

                  <div className="py-3.5 pl-4 text-sm text-gray-700">
                    {feature.name}
                  </div>

                  {feature.values.map((val, colIdx) => {
                    const isActive = plans[colIdx] === USER_ACTIVE_PLAN;
                    const isTick = val === "✔";
                    const isCross = val === "✖";
                    const isPaid = colIdx >= 2;

                    return (
                      <div
                        key={colIdx}
                        className={`py-3.5 text-center text-sm ${
                          isActive ? "bg-orange-50" : ""
                        }`}
                      >
                        {isTick ? (
                          <span className="text-green-500 font-bold">✔</span>
                        ) : isCross ? (
                          <span className="text-gray-400">✖</span>
                        ) : (
                          <span
                            className={`font-semibold ${
                              isActive
                                ? "text-orange-600"
                                : isPaid
                                ? "bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent"
                                : "text-gray-500"
                            }`}
                          >
                            {val}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              className="grid mt-4 gap-2"
              style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr" }}
            >
              <div />

              {plans.map((plan, i) => {
                const isActive = plan === USER_ACTIVE_PLAN;
                const isUpgrade = i > activeIdx;

                return (
                  <button
                    key={plan}
                    disabled={isActive}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-orange-100 text-orange-600 border border-orange-300 cursor-default"
                        : isUpgrade
                        ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {isActive
                      ? "Current"
                      : isUpgrade
                      ? "Upgrade"
                      : "Downgrade"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          All plans include 30-day free trial · Cancel anytime · Prices in INR
        </p>

      </div>
    </div>
  );
}