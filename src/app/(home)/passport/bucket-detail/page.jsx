'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function BucketDetailPage() {
  const [currentStatus, setCurrentStatus] = useState('Planned');

  const statusColors = {
    Dream: "bg-purple-500/20 text-purple-400",
    Planned: "bg-orange-500/20 text-orange-400",
    Done: "bg-green-500/20 text-green-400",
  };

  const steps = [
    { id: 1, label: 'Dream', status: 'Dream' },
    { id: 2, label: 'Planned', status: 'Planned' },
    { id: 3, label: 'Done', status: 'Done' },
  ];

  const getStepStatus = (stepStatus) => {
    const statusOrder = ['Dream', 'Planned', 'Done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] pb-24">
      {/* Header with Back */}
      <div className="flex items-center gap-4 px-4 pt-6 pb-4">
        <Link href="/passport/bucket">
          <button className="text-white text-xl">←</button>
        </Link>
        <h1 className="text-xl font-bold text-white">Bucket Detail</h1>
      </div>

      {/* Item Details */}
      <div className="px-4">
        <div className="bg-[#13132b] rounded-2xl p-5 border border-purple-500/20">
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">Run a Marathon in Tokyo</h2>

          {/* Tags */}
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
              Sport
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
              Public
            </span>
          </div>

          {/* Location & Date */}
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <span>📍 Tokyo, Japan</span>
            <span className="text-gray-600">•</span>
            <span>🎯 Target: 2026-10-8</span>
          </div>

          {/* Description */}
          <p className="text-gray-300 mb-6">
            Participate in the Tokyo Marathon, one of the world&apos;s major marathons.
            Experience the energy of Tokyo streets and achieve this incredible fitness goal.
          </p>

          {/* Current Status */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-2">Current Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm ${statusColors[currentStatus]}`}>
              {currentStatus}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setCurrentStatus('Done')}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                currentStatus === 'Done'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              Mark as Done
            </button>
            <button
              onClick={() => setCurrentStatus('Planned')}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                currentStatus === 'Planned'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
              }`}
            >
              Mark as Planned
            </button>
          </div>

          {/* Status Timeline */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-4">Status Timeline</h3>
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gray-700"></div>

              {/* Steps */}
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const stepStatus = getStepStatus(step.status);
                  return (
                    <div key={step.id} className="flex items-center gap-4 relative">
                      {/* Step Dot */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          stepStatus === 'completed'
                            ? 'bg-green-500'
                            : stepStatus === 'current'
                            ? 'bg-orange-500'
                            : 'bg-gray-700'
                        }`}
                      >
                        {stepStatus === 'completed' ? (
                          <span className="text-white text-sm">✓</span>
                        ) : (
                          <span className="text-white text-xs">{step.id}</span>
                        )}
                      </div>

                      {/* Step Label */}
                      <span
                        className={`${
                          stepStatus === 'pending' ? 'text-gray-500' : 'text-white'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-6 left-4 right-4">
        <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-pink-500/25">
          Edit Details
        </button>
      </div>
    </div>
  );
}
