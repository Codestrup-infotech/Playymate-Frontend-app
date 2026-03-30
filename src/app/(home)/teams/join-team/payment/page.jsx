"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CreditCard, Smartphone, Wallet } from "lucide-react"
import Link from "next/link"
import { getTeamProfile, initiateMembership } from "@/lib/api/teamApi"

const PAYMENT_METHODS = [
  { id: "card", label: "Credit/Debit Card", sub: "Visa, Mastercard, Amex", icon: CreditCard },
  { id: "upi", label: "UPI", sub: "Google Pay, PhonePe, Paytm", icon: Smartphone },
  { id: "wallet", label: "Wallet", sub: "Pay from your wallet balance", icon: Wallet },
]

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const teamId = searchParams.get("teamId")

  const [teamData, setTeamData] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState("card")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Selected membership duration from session storage
  const [selectedDuration, setSelectedDuration] = useState("YEARLY")

  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) {
        setError("No team specified")
        setLoading(false)
        return
      }

      try {
        const team = await getTeamProfile(teamId)
        setTeamData(team)
      } catch (err) {
        console.error("Error fetching team:", err)
        setError("Failed to load team details")
      }
      setLoading(false)
    }

    fetchData()
  }, [teamId])

  // Calculate payment amount
  const feeAmount = teamData?.membership?.fee_amount || 0
  const processingFee = feeAmount > 0 ? Math.round(feeAmount * 0.03) : 0 // 3% processing fee
  const totalAmount = feeAmount + processingFee

  const handlePayment = async () => {
    setProcessing(true)
    setError(null)

    try {
      // Initiate membership
      const response = await initiateMembership(teamId, {
        membership_type: selectedDuration,
        payment_preferences: {
          use_gold_coins: false,
          use_diamonds: selectedPayment === "wallet",
        },
      })

      // Store the idempotency key for confirmation
      if (typeof window !== "undefined" && response.idempotency_key) {
        sessionStorage.setItem("membershipIdempotencyKey", response.idempotency_key)
        sessionStorage.setItem("pendingMembershipData", JSON.stringify(response))
      }

      // Navigate to success page
      window.location.href = `/teams/join-team/success?teamId=${teamId}&membershipId=${response.membership_id || response.id}`
    } catch (err) {
      console.error("Error initiating membership:", err)
      setError(err.message || "Failed to process payment. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !teamData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/teams" className="text-pink-500 hover:underline">
            Back to Teams
          </Link>
        </div>
      </div>
    )
  }

  // If team doesn't require payment, redirect to success
  if (!teamData?.membership?.is_paid) {
    window.location.href = `/teams/join-team/success?teamId=${teamId}`
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/teams/join-team/onboarding?teamId=${teamId}`} className="text-white text-xl">
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

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-2xl p-4 mb-6">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* PAYMENT SUMMARY */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold mb-4">Payment Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Team Name</span>
            <span>{teamData?.name || "Team"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Membership</span>
            <span>{selectedDuration}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Joining Fee</span>
            <span>₹{feeAmount.toFixed(2)}</span>
          </div>
          {processingFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Processing Fee</span>
              <span>₹{processingFee.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-zinc-800 pt-3 mt-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-pink-500">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT METHODS */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold">Select Payment Method</h3>
        
        {PAYMENT_METHODS.map(({ id, label, sub, icon: Icon }) => (
          <label
            key={id}
            className={`flex items-center gap-4 bg-zinc-900 border rounded-2xl p-4 cursor-pointer hover:border-pink-500 transition ${
              selectedPayment === id ? "border-pink-500" : "border-zinc-800"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value={id}
              checked={selectedPayment === id}
              onChange={() => setSelectedPayment(id)}
              className="w-5 h-5 text-pink-500 focus:ring-pink-500"
            />
            <Icon size={24} className="text-zinc-400" />
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-xs text-zinc-500">{sub}</p>
            </div>
          </label>
        ))}
      </div>

      {/* PAY BUTTON */}
      <div className="fixed bottom-4 inset-x-4 flex justify-center">
        <button
          onClick={handlePayment}
          disabled={processing}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-sm font-medium text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
