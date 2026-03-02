'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₹1,577',
    features: ['Softcover', '20 pages', 'Standard print'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹3,237',
    isPopular: true,
    features: ['Hardcover', '40 pages', 'Gold Foil stamp'],
  },
  {
    id: 'deluxe',
    name: 'Deluxe',
    price: '₹5,727',
    features: ['Leather cover', '60 pages', 'Embossed name'],
  },
];

export default function PrintAndOrderPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [view, setView] = useState('order');
  const [currentStep, setCurrentStep] = useState(0);

  const handleOrder = () => {
    setView('confirmed');
    // Simulate order progress
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          return 3;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const steps = ['Order Confirmed', 'Printing', 'Shipped', 'Delivered'];

  if (view === 'confirmed') {
    return (
      <div className="min-h-screen bg-[#0d0d1a] pb-24">
        {/* Success Icon */}
        <div className="flex flex-col items-center pt-12 px-4">
          <div className="text-7xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-white text-center">Order Placed!</h2>
          <p className="text-gray-400 text-center mt-2">
            Your Premium passport will arrive in 5-7 days.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="px-8 mt-8">
          <div className="flex flex-col gap-0">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      index <= currentStep
                        ? 'bg-green-500'
                        : 'border-2 border-gray-600'
                    }`}
                  ></div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        index < currentStep ? 'bg-green-500' : 'bg-gray-700'
                      }`}
                    ></div>
                  )}
                </div>
                
                {/* Step content */}
                <div className="pb-6">
                  <p className={`${index <= currentStep ? 'text-white' : 'text-gray-500'}`}>
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="fixed bottom-6 left-4 right-4">
          <button
            onClick={() => router.push('/passport')}
            className="w-full py-4 rounded-2xl border border-pink-500 text-pink-400 font-semibold"
          >
            Back to Passport
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-6 pb-4">
        <Link href="/passport">
          <button className="text-white text-xl">←</button>
        </Link>
        <h1 className="text-xl font-bold text-white">Print & Order</h1>
      </div>

      {/* Digital Export Section */}
      <div className="px-4 mb-6">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Digital Export</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Download PDF */}
          <button className="bg-[#13132b] rounded-2xl p-4 border border-gray-700 flex flex-col items-center hover:bg-[#1a1a35] transition-colors">
            <span className="text-2xl mb-2">⬇️</span>
            <span className="text-white font-bold text-sm">Download PDF</span>
            <span className="text-gray-400 text-xs">Export your passport</span>
          </button>
          
          {/* Share Link */}
          <button className="bg-[#13132b] rounded-2xl p-4 border border-gray-700 flex flex-col items-center hover:bg-[#1a1a35] transition-colors">
            <span className="text-2xl mb-2">🔗</span>
            <span className="text-white font-bold text-sm">Share Link</span>
            <span className="text-gray-400 text-xs">Export your passport</span>
          </button>
        </div>
      </div>

      {/* Physical Passport Section */}
      <div className="px-4">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Physical Passport</p>
        
        {/* Plans */}
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`bg-[#13132b] rounded-2xl p-4 border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-pink-500 bg-[#1e1035]'
                  : 'border-gray-700 hover:border-pink-500/40'
              } ${plan.isPopular ? 'shadow-lg shadow-pink-500/20' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Radio Button */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id
                        ? 'border-pink-500'
                        : 'border-gray-600'
                    }`}
                  >
                    {selectedPlan === plan.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                    )}
                  </div>
                  <span className="text-white font-bold">{plan.name}</span>
                  {plan.isPopular && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-400">
                      ⭐ Most Popular
                    </span>
                  )}
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {plan.price}
                </span>
              </div>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2 ml-7">
                {plan.features.map((feature, idx) => (
                  <span key={idx} className="text-gray-400 text-sm">
                    • {feature}
                  </span>
                ))}
                {plan.isPopular && (
                  <span className="text-green-400 text-xs block mt-1">🎁 Gift Box included</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <button
          onClick={handleOrder}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg shadow-lg shadow-pink-500/25"
        >
          Order {plans.find(p => p.id === selectedPlan)?.name} — {plans.find(p => p.id === selectedPlan)?.price}
        </button>
      </div>
    </div>
  );
}
