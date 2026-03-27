"use client"

import { ArrowLeft, CreditCard, Smartphone, Wallet } from "lucide-react"
import Link from "next/link"

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/join-team/onboarding" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Payment</h1>
      </div>

      {/* STEP BAR */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"></div>
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"></div>
          <div className="h-1 flex-1 rounded-full bg-zinc-800"></div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Onboarding</span>
          <span className="text-pink-500 font-medium">Payment</span>
          <span className="text-zinc-500">Success</span>
        </div>
      </div>

      {/* PAYMENT SUMMARY */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold mb-4">Payment Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Team Name</span>
            <span>Thunder Strikers</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Joining Fee</span>
            <span>$50.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Processing Fee</span>
            <span>$1.50</span>
          </div>
          <div className="border-t border-zinc-800 pt-3 mt-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-pink-500">$51.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT METHODS */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold">Select Payment Method</h3>
        
        <label className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-pink-500 transition">
          <input type="radio" name="payment" className="w-5 h-5 text-pink-500 focus:ring-pink-500" defaultChecked />
          <CreditCard size={24} className="text-zinc-400" />
          <div>
            <p className="font-medium">Credit/Debit Card</p>
            <p className="text-xs text-zinc-500">Visa, Mastercard, Amex</p>
          </div>
        </label>

        <label className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-pink-500 transition">
          <input type="radio" name="payment" className="w-5 h-5 text-pink-500 focus:ring-pink-500" />
          <Smartphone size={24} className="text-zinc-400" />
          <div>
            <p className="font-medium">UPI</p>
            <p className="text-xs text-zinc-500">Google Pay, PhonePe, Paytm</p>
          </div>
        </label>

        <label className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-pink-500 transition">
          <input type="radio" name="payment" className="w-5 h-5 text-pink-500 focus:ring-pink-500" />
          <Wallet size={24} className="text-zinc-400" />
          <div>
            <p className="font-medium">Wallet</p>
            <p className="text-xs text-zinc-500">Pay from your wallet balance</p>
          </div>
        </label>
      </div>

      {/* PAY BUTTON */}
      <div className="fixed bottom-4 inset-x-4 flex justify-center">
        <Link
          href="/teams/join-team/success"
          className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-sm font-medium text-white flex items-center justify-center shadow-md"
        >
          Pay $51.50
        </Link>
      </div>
    </div>
  )
}
