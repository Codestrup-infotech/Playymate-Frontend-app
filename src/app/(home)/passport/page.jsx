'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PassportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0d0d1a] pb-36">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Playymate Passport
        </h1>
        <p className="text-gray-400 text-sm mt-1">Track your journey, collect your moments</p>
      </div>

      {/* User Card */}
      <div className="mx-4">
        <div className="bg-[#13132b] rounded-2xl p-5 border border-purple-500/30 shadow-lg shadow-purple-500/10">
          {/* Profile Section */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg">Alex Morgan</h2>
              <p className="text-gray-400 text-sm">Passport ID: PLY-2024-789456</p>
              <p className="text-gray-500 text-xs">Issue Date: Feb 10, 2026</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 rounded-full">
              <span className="text-white text-xs font-medium">Premium</span>
            </div>
          </div>

          {/* View Passport Button */}
          <button 
            onClick={() => router.push('/passport/digital')}
            className="w-full bg-[#1a1a35] hover:bg-[#252545] text-white py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Tap to View Passport →
          </button>
        </div>
      </div>

      {/* Dream Progress Section */}
      <div className="mx-4 mt-6">
        <h3 className="text-white font-semibold mb-3">Dream Progress</h3>
        <div className="bg-[#13132b] rounded-2xl p-4 border border-purple-500/20">
          {/* Done */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-400">Done</span>
              <span className="text-gray-400">2</span>
            </div>
            <div className="h-2 bg-[#1a1a35] rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>
          {/* Planned */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-orange-400">Planned</span>
              <span className="text-gray-400">2</span>
            </div>
            <div className="h-2 bg-[#1a1a35] rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>
          {/* Dream */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-purple-400">Dream</span>
              <span className="text-gray-400">2</span>
            </div>
            <div className="h-2 bg-[#1a1a35] rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Grid Cards */}
      <div className="mx-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          {/* Bucket List */}
          <Link href="/passport/bucket">
            <div className="bg-[#13132b] rounded-2xl p-4 border border-purple-500/20 hover:border-pink-500/40 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="text-white font-medium">Bucket List</h4>
              <p className="text-gray-400 text-sm">6 items</p>
            </div>
          </Link>

          {/* Stamps */}
          <Link href="/passport/stamps">
            <div className="bg-[#13132b] rounded-2xl p-4 border border-purple-500/20 hover:border-pink-500/40 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="text-white font-medium">Stamps</h4>
              <p className="text-gray-400 text-sm">6 collected</p>
            </div>
          </Link>

          {/* Suggestions */}
          <Link href="/passport/suggestions">
            <div className="bg-[#13132b] rounded-2xl p-4 border border-purple-500/20 hover:border-pink-500/40 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">💡</div>
              <h4 className="text-white font-medium">Suggestions</h4>
              <p className="text-gray-400 text-sm">AI powered</p>
            </div>
          </Link>

          {/* Print & Order */}
          <Link href="/passport/print-and-order">
            <div className="bg-[#13132b] rounded-2xl p-4 border border-purple-500/20 hover:border-pink-500/40 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">📘</div>
              <h4 className="text-white font-medium">Print & Order</h4>
              <p className="text-gray-400 text-sm">Physical passport</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom CTA Button */}
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
