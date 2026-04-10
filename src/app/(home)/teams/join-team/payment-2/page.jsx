'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Info, Wallet, Coins, Gem, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamProfile, previewMembership, initiateMembership, confirmMembership, getNameReservationCoinBalance } from '@/lib/api/teamApi';

// Inline cn utility — no need for @/lib/utils
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const PaymentOption = ({
  title,
  subtitle,
  price,
  coinAmount,
  coinType,
  originalPrice,
  icon,
  iconBg,
  isSelected,
  onSelect,
  highlight,
  selectedBgColor,
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2  ",
        isSelected
          ? selectedBgColor || "bg-gradient-to-br from-orange-50 to-pink-50 border-orange-300 shadow-lg shadow-orange-100"
          : "bg-gray-50 border-gray-100 hover:border-gray-200",
        highlight && isSelected && "ring-2 ring-orange-400 ring-offset-2"
      )}
    >
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 via-pink-500/5 to-orange-500/5" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", iconBg)}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>

        <div className="text-right">
          {price && <span className="font-bold text-gray-900 text-lg">{price}</span>}
          {coinAmount && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className={cn(
                  "font-bold text-lg",
                  coinType === 'gold' ? "text-orange-500" : "text-cyan-500"
                )}>
                  {coinAmount}
                </span>
                {coinType === 'gold' ? (
                  <Coins className="w-5 h-5 text-orange-400 fill-orange-400" />
                ) : (
                  <Gem className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                )}
              </div>
              {originalPrice && (
                <span className="text-xs text-gray-400 line-through">{originalPrice}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function PaymentScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [teamData, setTeamData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Get teamId, option, and method from URL
  const teamId = searchParams?.get?.('teamId') || null;
  const selectedOption = searchParams?.get?.('option');
  const methodParam = searchParams?.get?.('method');

  // Initialize with URL param or default to 'diamonds'
  const [selectedMethod, setSelectedMethod] = useState(methodParam === 'diamonds' ? 'diamonds' : 'diamonds');
  const [useGoldForDiscount, setUseGoldForDiscount] = useState(false);

  // Calculate values from membership data
  const membershipFee = membershipData?.fee_amount || teamData?.membership?.fee_amount || teamData?.fee_amount || 0;
  const defaultDurationType = membershipData?.default_duration_type || teamData?.membership?.default_duration_type || 'YEARLY';
  const goldCoinDiscountPct = membershipData?.gold_coin_discount_pct || teamData?.membership?.gold_coin_discount_pct || teamData?.gold_coin_discount_pct || 10;
  
  // Calculate amounts with proper rounding
  const goldDiscountAmount = Math.round(membershipFee * (goldCoinDiscountPct / 100));
  const goldCoinsToPay = membershipFee - goldDiscountAmount;
  const totalPayable = selectedMethod === 'gold' ? goldCoinsToPay : membershipFee;
  
  const [walletBalances, setWalletBalances] = useState({ gold_coins: 0, diamond_coins: 0 });
  const userGoldCoins = walletBalances?.gold_coins?.balance || walletBalances?.gold_coins || 0;
  const userDiamonds = walletBalances?.diamond_coins?.balance || walletBalances?.diamond_coins || 0;
  
  const diamondsNeeded = selectedMethod === 'gold' ? goldCoinsToPay : membershipFee;
  const hasInsufficientBalance = userDiamonds < diamondsNeeded;
  
  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) {
        setError('No team specified');
        setLoading(false);
        return;
      }

      try {
        const [team, membership, balances] = await Promise.all([
          getTeamProfile(teamId),
          previewMembership(teamId),
          getNameReservationCoinBalance()
        ]);
        setTeamData(team?.data || team);
        setMembershipData(membership?.data || membership);
        setWalletBalances(balances?.data || balances);
        
        console.log('Wallet balances:', balances);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load payment details');
      }
      setLoading(false);
    };

    fetchData();
  }, [teamId]);

  const handleBack = () => {
    router.back();
  };

  const handlePayment = async () => {
    if (!teamId) {
      setError('No team specified');
      return;
    }

    if (hasInsufficientBalance) {
      router.push('/wallet/diamond-store');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const useGoldForDiscount = selectedMethod === 'gold';
      const useDiamonds = true; // Always use diamonds for payment, gold coins just for discount
      
      console.log('Initiating membership for team:', teamId);
      const initiateResponse = await initiateMembership(teamId, {
        membership_type: defaultDurationType,
        payment_preferences: {
          use_gold_coins: useGoldForDiscount,
          use_diamonds: useDiamonds
        }
      });
      
      console.log('Initiate response:', initiateResponse);
      
      const initiateData = initiateResponse?.data || initiateResponse;
      
      if (initiateData.insufficient_coins) {
        setError(initiateData.message || 'Insufficient coins. Please purchase more coins.');
        setProcessing(false);
        return;
      }

      const idempotencyKey = initiateData.idempotency_key;
      console.log('Confirming membership with key:', idempotencyKey);
      
      const confirmResponse = await confirmMembership(teamId, {
        idempotency_key: idempotencyKey
      });
      
      console.log('Confirm response:', confirmResponse);
      
      router.push(`/teams/join-team/success?teamId=${teamId}&membership_type=${initiateData.membership_type || 'YEARLY'}`);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-500 font-medium animate-pulse">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 border border-red-100">
            <p className="font-semibold">{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-pink-600 font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            <ChevronLeft size={18} /> Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans ">
      {/* Header */}
      <header className="px-6 pt-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Payment</h1>
      </header>

      {/* Your Wallet Card */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-[24px] lg:p-9 p-2 space-y-3 border border-slate-200 max-w-xl  mx-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">
          Your Wallet
        </p>
        
        <div className="flex items-center justify-center gap-12">
          {/* Gold Coins - Centered */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 mb-3">
              <Coins className="w-6 h-6 text-orange-500 fill-orange-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 text-center">
              {userGoldCoins}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Gold Coins
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-[1px] h-16 bg-slate-200" />

          {/* Diamonds - Centered */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 mb-3">
              <Gem className="w-6 h-6 text-blue-500 fill-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 text-center">
              {userDiamonds}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Diamonds
            </div>
          </div>
        </div>
      </div>

<main className="px-6 space-y-8 max-w-xl mx-auto">
  
        {/* Section Title */}
        <div className="space-y-4 mt-10 ">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Payment Method</h2>

          {/* Payment with Diamonds - Default */}
          <div className="space-y-3">
            <div
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                !selectedMethod || selectedMethod === 'diamonds'
                  ? "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-lg shadow-purple-100"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-purple-400 to-indigo-600">
                    <Gem className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Pay with Diamonds</h3>
                    <p className="text-sm text-slate-500">Full payment</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-lg">{membershipFee}</span>
                  <span className="text-xs text-slate-500"> 💎</span>
                </div>
              </div>
            </div>

            {/* Gold Coins Toggle for Discount */}
            <div
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                selectedMethod === 'gold'
                  ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 shadow-lg shadow-orange-100"
                  : "bg-slate-50 border-slate-200"
              }`}
              onClick={() => setSelectedMethod(selectedMethod === 'gold' ? 'diamonds' : 'gold')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-orange-400 to-red-500">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Use Gold Coins</h3>
                    <p className="text-sm text-orange-600">Get {goldCoinDiscountPct}% discount</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedMethod === 'gold'}
                    onChange={() => {}}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6  rounded-full transition-colors ${selectedMethod === 'gold' ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-slate-300'}`}>
                    <div className={`w-6  h-6 bg-white rounded-full shadow transform transition-transform mt-0.5 ${selectedMethod === 'gold' ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-[32px] p-6 space-y-4 border border-slate-200">
          <h2 className="text-base font-bold text-slate-900">Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Joining Fee</span>
              <span className="font-bold text-slate-900">₹{membershipFee}</span>
            </div>
            
            {selectedMethod === 'gold' && (
              <div className="flex justify-between text-sm">
                <span className="text-orange-600 font-medium">Gold Discount ({goldCoinDiscountPct}%)</span>
                <span className="font-bold text-orange-600">-₹{goldDiscountAmount}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
                <span className="text-purple-600 font-medium">Diamonds to Pay</span>
                <span className="font-bold text-purple-600">
                  {selectedMethod === 'gold' ? goldCoinsToPay : membershipFee} 💎
                </span>
              </div>
            
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-base font-bold text-slate-900">Total Payable</span>
              <span className="text-xl font-black text-slate-900">₹{totalPayable}</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 border border-slate-100">
          <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-slate-500 font-medium">
            Use Gold Coins to get {goldCoinDiscountPct}% discount on joining fee. Earn coins by participating in events and inviting friends!
          </p>
        </div>
      </main>

      {/* Footer Button */}
      <div className=" bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={!processing ? { scale: 1.02 } : {}}
            whileTap={!processing ? { scale: 0.98 } : {}}
            onClick={hasInsufficientBalance ? () => router.push('/wallet/diamond-store') : handlePayment}
            disabled={processing}
            className={cn(
              "w-full py-5 rounded-full font-bold text-lg shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed",
              processing 
                ? "bg-slate-400 text-white" 
                : hasInsufficientBalance
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                  : "bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white shadow-purple-200"
            )}
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : hasInsufficientBalance ? (
              <>
                <Gem className="w-5 h-5" />
                Insufficient balance - buy diamond now
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                {selectedMethod === 'gold' 
                  ? `Pay ₹${totalPayable}`
                  : `Pay ₹${membershipFee}`
                }
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function Payment2Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <PaymentScreen />
    </Suspense>
  );
}
