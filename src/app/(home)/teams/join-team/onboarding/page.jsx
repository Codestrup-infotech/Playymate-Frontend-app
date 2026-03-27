"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function JoinPaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* COVER */}
      <div className="relative h-52 w-full bg-[url('/stadium.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40"></div>

        {/* HEADER */}
        <div className="absolute top-4 left-4 z-10">
          <Link href="/teams/join-team" className="text-white">
            <ArrowLeft size={22} />
          </Link>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="-mt-16 px-4">
        <div className="bg-white rounded-[28px] shadow-xl border border-gray-200 p-6">

          {/* PROFILE */}
          <div className="flex flex-col items-center text-center">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md -mt-12"
            />
            <h2 className="text-2xl font-bold mt-3">Lorem ipsum</h2>
          </div>

          {/* INFO CARD */}
          <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-200 divide-y">
            <div className="flex justify-between px-4 py-4">
              <span className="text-gray-500">Sport</span>
              <span className="font-medium">Cricket</span>
            </div>
            <div className="flex justify-between px-4 py-4">
              <span className="text-gray-500">Join Fee</span>
              <span className="font-medium">₹499</span>
            </div>
            <div className="flex justify-between px-4 py-4">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium">Monthly</span>
            </div>
          </div>

          {/* WHAT YOU GET */}
          <div className="mt-6">
            <h3 className="text-gray-500 font-medium mb-3">What You Get</h3>

            <div className="bg-gray-50 rounded-2xl border border-gray-200 divide-y">
              {[
                "Team Chat Access",
                "Exclusive Events",
                "Member Discounts",
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-4">
                  <span className="font-medium">{item}</span>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="fixed bottom-4 inset-x-4 flex justify-center">
        <Link
          href="/teams/join-team/payment"
          className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-sm font-medium text-white flex items-center justify-center shadow-md"
        >
          Continue - ₹499
        </Link>
      </div>
    </div>
  )
}