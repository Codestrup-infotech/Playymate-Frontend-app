/**
 * KYC Check Component
 * 
 * This component can be used to check and display KYC verification status.
 * Import and use this in pages where KYC verification is required.
 */

import { useState, useEffect } from "react"
import { checkEligibility } from "@/lib/api/teamApi"

export const useKycCheck = () => {
  const [kycStatus, setKycStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const eligibility = await checkEligibility()
        setKycStatus(eligibility.kyc_status || "not_verified")
      } catch (error) {
        console.error("Error checking KYC status:", error)
        setKycStatus("error")
      } finally {
        setLoading(false)
      }
    }

    fetchKycStatus()
  }, [])

  return { kycStatus, loading }
}

export const isKycVerified = (kycStatus) => {
  return kycStatus === "verified"
}

export default function KycCheck() {
  const { kycStatus, loading } = useKycCheck()

  if (loading) {
    return null
  }

  if (!isKycVerified(kycStatus)) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-2">KYC Verification Required</h2>
          <p className="text-gray-500 mb-4">
            Please complete your KYC verification to access this feature.
          </p>
          <button
            onClick={() => window.location.href = "/home/settings/kyc"}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full font-medium"
          >
            Complete KYC
          </button>
        </div>
      </div>
    )
  }

  return null
}