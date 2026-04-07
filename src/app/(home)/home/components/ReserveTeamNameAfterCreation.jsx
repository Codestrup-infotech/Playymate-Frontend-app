"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Loader2, Coins, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/lib/ThemeContext"
import { 
  checkNameAvailability, 
  getNameReservationPricing, 
  getNameReservationCoinBalance, 
  initiateNameReservation,
  confirmNameReservation,
  getNameReservationStatus
} from "@/lib/api/teamApi"

export default function ReserveTeamNameAfterCreation({ 
  isOpen, 
  onClose, 
  teamId, 
  teamName, 
  onSuccess,
  isAlreadyReserved = false
}) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [step, setStep] = useState("check") 
  const [availability, setAvailability] = useState(null)
  const [pricing, setPricing] = useState(null)
  const [balances, setBalances] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [useGoldCoins, setUseGoldCoins] = useState(false)
  const [reservationResult, setReservationResult] = useState(null)
  const [initiatedData, setInitiatedData] = useState(null)

  const bgColor = isDark ? "bg-[#1a1a2e]" : "bg-white"
  const textColor = isDark ? "text-white" : "text-gray-900"
  const subTextColor = isDark ? "text-zinc-400" : "text-gray-500"
  const borderColor = isDark ? "border-[#2a2a45]" : "border-gray-200"
  const inputBg = isDark ? "bg-[#0f0f1a]" : "bg-gray-50"

  const checkAvailability = async () => {
    if (!teamName || !teamName.trim()) return
    
    try {
      setLoading(true)
      const result = await checkNameAvailability(teamName)
      setAvailability(result.data || result)
    } catch (err) {
      console.error("Error checking availability:", err)
      setError("Failed to check name availability")
    } finally {
      setLoading(false)
    }
  }

  const fetchPricing = async () => {
    try {
      const result = await getNameReservationPricing()
      setPricing(result.data || result)
    } catch (err) {
      console.error("Error fetching pricing:", err)
    }
  }

  const fetchBalances = async () => {
    try {
      const result = await getNameReservationCoinBalance()
      setBalances(result.data || result)
    } catch (err) {
      console.error("Error fetching balances:", err)
    }
  }

  const checkCurrentReservation = async () => {
    if (!teamId) return
    try {
      const result = await getNameReservationStatus(teamId)
      const data = result.data || result
      if (data?.name_reservation?.is_reserved) {
        setAvailability({
          is_reserved: true,
          is_reservable: false,
          name: teamName
        })
        return true
      }
    } catch (err) {
      console.log("Could not check reservation status:", err)
    }
    return false
  }

  useEffect(() => {
    if (isOpen) {
      setStep("check")
      setAvailability(null)
      setError(null)
      setReservationResult(null)
      setUseGoldCoins(false)
      setInitiatedData(null)
      
      if (isAlreadyReserved) {
        setAvailability({
          is_reserved: true,
          is_reservable: false,
          name: teamName
        })
      }
    }
  }, [isOpen, teamId, isAlreadyReserved])

  useEffect(() => {
    if (isOpen && teamName && !isAlreadyReserved) {
      checkAvailability()
      fetchPricing()
      fetchBalances()
    }
  }, [isOpen, teamName, isAlreadyReserved])

  const handleInitiate = async () => {
    if (!teamName || !teamName.trim() || !teamId) {
      setError("Invalid team information")
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const idempotencyKey = `name_res_${teamId}_${Date.now()}`
      
      const result = await initiateNameReservation({
        teamId: teamId,
        use_gold_coins: useGoldCoins,
        idempotency_key: idempotencyKey
      })
      
      const data = result.data || result
      setInitiatedData(data)
      setStep("confirm")
    } catch (err) {
      console.error("Error initiating reservation:", err)
      setError(err.message || "Failed to initiate reservation")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!initiatedData?.idempotency_key || !teamId) {
      setError("Invalid reservation data")
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      setStep("processing")
      
      const result = await confirmNameReservation(teamId, {
        idempotency_key: initiatedData.idempotency_key
      })
      
      const data = result.data || result
      setReservationResult(data)
      setStep("success")
      
      if (onSuccess) {
        onSuccess(data)
      }
    } catch (err) {
      console.error("Error confirming reservation:", err)
      setError(err.message || "Failed to confirm reservation")
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (onClose) onClose()
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0)
  }

  const priceAmount = pricing?.price_coins || 1000
  const maxGoldPercentage = pricing?.max_gold_coin_percentage || 10
  const goldCoinsToUse = useGoldCoins ? Math.floor(priceAmount * (maxGoldPercentage / 100)) : 0
  const diamondCoinsToUse = priceAmount - goldCoinsToUse

  const goldBalance = balances?.gold_coins?.balance || balances?.gold_coins || 0
  const diamondBalance = balances?.diamond_coins?.balance || balances?.diamonds || balances?.diamond_coins || 0
  const canAfford = (useGoldCoins ? goldBalance >= goldCoinsToUse : true) && diamondBalance >= diamondCoinsToUse

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleSkip}
      >
        <motion.div
          className={`${bgColor} rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${textColor}`}>Reserve Team Name</h2>
                <p className={`text-xs ${subTextColor}`}>Protect your team identity</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className={`p-2 rounded-full ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}
            >
              <X className={subTextColor} size={20} />
            </button>
          </div>

          {/* Step: Check Availability */}
          {step === "check" && (
            <>
              {/* Team Name Display */}
              <div className={`${inputBg} rounded-2xl p-4 mb-4`}>
                <p className={`text-xs ${subTextColor} mb-1`}>Team Name</p>
                <p className={`text-xl font-bold ${textColor}`}>{teamName}</p>
              </div>

              {/* Availability Status */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
              ) : availability ? (
                <div className="mb-6">
                  {availability.is_reserved ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-0.5" size={20} />
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">Name Already Reserved!</p>
                        <p className={`text-sm ${subTextColor}`}>
                          Your team name is protected
                        </p>
                      </div>
                    </div>
                  ) : availability.is_reservable === false ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
                      <AlertCircle className="text-red-500 mt-0.5" size={20} />
                      <div>
                        <p className="font-medium text-red-600 dark:text-red-400">Name Already Reserved</p>
                        <p className={`text-sm ${subTextColor}`}>
                          This name is reserved by "{availability.reserved_by_team}"
                        </p>
                      </div>
                    </div>
                  ) : availability.is_reservable ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-0.5" size={20} />
                      <div>
                        <p className="font-medium text-green-600 dark:text-green-400">Name Available!</p>
                        <p className={`text-sm ${subTextColor}`}>
                          Reserve now to prevent others from using it
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Pricing & Payment Section */}
              {availability?.is_reservable && pricing && (
                <div className="space-y-4 mb-6">
                  <div className={`${inputBg} rounded-2xl p-4`}>
                    <p className={`text-xs ${subTextColor} mb-3`}>Reservation Price</p>
                    <div className="flex items-center gap-2">
                      <Coins className="text-yellow-500" size={24} />
                      <span className={`text-2xl font-bold ${textColor}`}>
                        {formatNumber(priceAmount)} coins
                      </span>
                    </div>
                    <p className={`text-xs ${subTextColor} mt-2`}>
                      One-time payment - Never expires
                    </p>
                  </div>

                  {/* Coin Balance */}
                  {balances && (
                    <div className={`${inputBg} rounded-2xl p-4`}>
                      <p className={`text-xs ${subTextColor} mb-3`}>Your Coin Balance</p>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <span className={`text-sm ${textColor}`}>
                            Gold: {formatNumber(goldBalance)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span className={`text-sm ${textColor}`}>
                            Diamonds: {formatNumber(diamondBalance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Toggle */}
                  <div className={`${inputBg} rounded-2xl p-4`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className={`text-sm ${textColor}`}>Use Gold Coins (up to {maxGoldPercentage}%)</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={useGoldCoins}
                          onChange={(e) => setUseGoldCoins(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${useGoldCoins ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${useGoldCoins ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                    </label>

                    {/* Payment Breakdown */}
                    <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                      <p className={`text-xs ${subTextColor} mb-2`}>Payment Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${subTextColor}`}>Gold Coins</span>
                          <span className={`text-sm font-medium ${textColor}`}>
                            {useGoldCoins ? formatNumber(goldCoinsToUse) : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${subTextColor}`}>Diamond Coins</span>
                          <span className={`text-sm font-medium ${textColor}`}>
                            {formatNumber(diamondCoinsToUse)}
                          </span>
                        </div>
                        <div className={`flex justify-between pt-2 border-t ${borderColor}`}>
                          <span className={`text-sm font-medium ${textColor}`}>Total</span>
                          <span className={`text-sm font-bold ${textColor}`}>
                            {formatNumber(priceAmount)} coins
                          </span>
                        </div>
                      </div>
                    </div>

                    {!canAfford && (
                      <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Insufficient coins. Please purchase more coins to continue.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className={`flex-1 px-4 py-3 rounded-full border ${borderColor} ${textColor} text-sm font-medium`}
                >
                  Skip for Now
                </button>
                {availability?.is_reservable && canAfford ? (
                  <button
                    onClick={handleInitiate}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-white text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Coins size={16} />
                        Reserve Now
                      </>
                    )}
                  </button>
                ) : availability?.is_reserved ? (
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-white text-sm font-medium"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-white text-sm font-medium"
                  >
                    Continue
                  </button>
                )}
              </div>
            </>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && initiatedData && (
            <div className="mb-6">
              <div className={`${inputBg} rounded-2xl p-4 mb-4`}>
                <p className={`text-xs ${subTextColor} mb-2`}>Ready to Reserve</p>
                <p className={`text-lg font-bold ${textColor}`}>{teamName}</p>
              </div>

              <div className={`${inputBg} rounded-2xl p-4 mb-4`}>
                <p className={`text-xs ${subTextColor} mb-3`}>Payment Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${subTextColor}`}>Total Price</span>
                    <span className={`text-sm font-medium ${textColor}`}>
                      {formatNumber(initiatedData.price_breakdown?.total_coins || priceAmount)} coins
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${subTextColor}`}>Gold Coins</span>
                    <span className={`text-sm font-medium ${textColor}`}>
                      {formatNumber(initiatedData.price_breakdown?.gold_coins || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${subTextColor}`}>Diamond Coins</span>
                    <span className={`text-sm font-medium ${textColor}`}>
                      {formatNumber(initiatedData.price_breakdown?.diamond_coins || priceAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {initiatedData.new_balances && (
                <div className={`${inputBg} rounded-2xl p-4 mb-4`}>
                  <p className={`text-xs ${subTextColor} mb-3`}>New Balance After Payment</p>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className={`text-sm ${textColor}`}>
                        Gold: {formatNumber(initiatedData.new_balances.gold_coins)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className={`text-sm ${textColor}`}>
                        Diamonds: {formatNumber(initiatedData.new_balances.diamond_coins)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("check")}
                  className={`flex-1 px-4 py-3 rounded-full border ${borderColor} ${textColor} text-sm font-medium`}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Coins size={16} />
                      Confirm & Pay
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Processing */}
          {step === "processing" && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className={`text-lg font-medium ${textColor}`}>Processing your reservation...</p>
              <p className={`text-sm ${subTextColor} mt-2`}>Please wait while we complete the payment</p>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="py-6 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-2`}>Name Reserved!</h3>
              <p className={`text-sm ${subTextColor} mb-6`}>
                Your team name "{teamName}" is now protected and exclusively yours.
              </p>
              
              {reservationResult && (
                <div className={`${inputBg} rounded-2xl p-4 mb-6 text-left`}>
                  <p className={`text-xs ${subTextColor} mb-2`}>Reservation Details</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${subTextColor}`}>Reservation ID</span>
                      <span className={`text-sm ${textColor} font-mono`}>
                        {reservationResult.reservation_id?.slice(0, 12)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${subTextColor}`}>Status</span>
                      <span className="text-sm font-medium text-green-500">{reservationResult.status || "ACTIVE"}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSkip}
                className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-white text-sm font-medium"
              >
                Done
              </button>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className={`text-lg font-bold ${textColor} mb-2`}>Reservation Failed</h3>
              <p className={`text-sm ${subTextColor} mb-6`}>{error}</p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className={`flex-1 px-4 py-3 rounded-full border ${borderColor} ${textColor} text-sm font-medium`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setStep("check")
                    checkAvailability()
                    fetchBalances()
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-white text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}