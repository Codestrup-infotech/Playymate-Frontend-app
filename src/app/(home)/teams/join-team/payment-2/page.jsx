'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Info, Wallet, Coins, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTeamProfile, previewMembership } from '@/lib/api/teamApi';

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
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2",
        isSelected
          ? "bg-white border-transparent shadow-xl shadow-purple-100"
          : "bg-gray-50 border-gray-100 hover:border-gray-200",
        highlight && isSelected && "ring-2 ring-purple-400 ring-offset-2"
      )}
    >
      {/* Gradient Border for Highlighted/Selected */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl p-[2px] -z-10 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 opacity-20 animate-pulse" />
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

export default function PaymentScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState('gold');
  const [teamData, setTeamData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get teamId and option from URL
  const teamId = searchParams?.get?.('teamId') || null;
  const selectedOption = searchParams?.get?.('option');

  // Calculate values from membership data
  const membershipFee = membershipData?.fee_amount || membershipData?.options?.find(o => o.type === selectedOption)?.price || 0;
  const useGoldCoins = selectedMethod === 'gold';
  const goldDiscount = useGoldCoins ? Math.round(membershipFee * 0.1) : 0;
  const totalPayable = membershipFee - goldDiscount;

  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) {
        setError('No team specified');
        setLoading(false);
        return;
      }

      try {
        const [team, membership] = await Promise.all([
          getTeamProfile(teamId),
          previewMembership(teamId)
        ]);
        setTeamData(team?.data || team);
        setMembershipData(membership?.data || membership);
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

  const handlePayment = () => {
    router.push('/teams/join-team/success');
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
    <div className="min-h-screen bg-white text-gray-900 font-sans ">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Payment</h1>
      </header>


{/* Your Wallet Card */}
<div className="bg-gray-50/50 rounded-[24px] p-4 space-y-3 border border-gray-100 max-w-xs mx-auto">
  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
    Your Wallet
  </p>
  
  <div className="flex items-center justify-center gap-12">
    {/* Gold Coins - Centered */}
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 mb-3">
        <Coins className="w-6 h-6 text-orange-500 fill-orange-500" />
      </div>
      <div className="text-2xl font-bold text-gray-900 text-center">120</div>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
        Gold Coins
      </div>
    </div>

    {/* Vertical Divider */}
    <div className="w-[1px] h-16 bg-gray-100" />

    {/* Diamonds - Centered */}
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 mb-3">
        <Gem className="w-6 h-6 text-blue-500 fill-blue-500" />
      </div>
      <div className="text-2xl font-bold text-gray-900 text-center">300</div>
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
        Diamonds
      </div>
    </div>
  </div>
</div>

      

      <main className="px-6 space-y-8 max-w-md mx-auto">
 
        {/* Section Title */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Choose Payment Method</h2>

          <div className="space-y-3">
              <PaymentOption
                id="gold"
                title="Pay with Gold Coins"
                subtitle="Get 10% discount"
                coinAmount={String(membershipData?.gold_coin_price || Math.round(membershipFee * 10) || 399)}
                coinType="gold"
                originalPrice={`₹${membershipFee}`}
                icon={<Coins className="w-6 h-6" />}
                iconBg="bg-gradient-to-br from-orange-400 to-red-500"
                isSelected={selectedMethod === 'gold'}
                onSelect={() => setSelectedMethod('gold')}
                highlight
              />

            <PaymentOption
                id="diamonds"
                title="Pay with Diamonds"
                subtitle="Full payment with diamonds"
                coinAmount={String(membershipData?.diamond_price || Math.round(membershipFee / 2) || 250)}
                coinType="diamond"
                icon={<Gem className="w-6 h-6" />}
                iconBg="bg-gradient-to-br from-purple-400 to-indigo-600"
                isSelected={selectedMethod === 'diamonds'}
                onSelect={() => setSelectedMethod('diamonds')}
              />
          </div>
        </div>



        {/* Summary */}
<div className="bg-gray-50/50 rounded-[32px] p-6 space-y-4 border border-gray-100">
  <h2 className="text-base font-bold text-gray-900">Summary</h2>
  
  <div className="space-y-3">
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 font-medium">Membership Fee</span>
      <span className="font-bold text-gray-900">₹{membershipFee}</span>
    </div>
    
    {useGoldCoins && (
      <div className="flex justify-between text-sm">
        <span className="text-orange-600 font-medium">Gold Discount (10%)</span>
        <span className="font-bold text-orange-600">-₹{goldDiscount}</span>
      </div>
    )}
    
    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
      <span className="text-base font-bold text-gray-900">Total Payable</span>
      <span className="text-xl font-black text-gray-900">₹{totalPayable}</span>
    </div>
  </div>
</div>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 border border-gray-100">
          <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-gray-500 font-medium">
            Gold coins give you a discount on the join fee. Diamond coins can cover the entire payment. Earn coins by participating in events and inviting friends!
          </p>
        </div>
      </main>

      {/* Footer Button */}
      <div className=" bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePayment}
            className="w-full py-5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white font-bold text-lg shadow-xl shadow-purple-200 flex items-center justify-center gap-2"
          >
            Confirm & Join 
          </motion.button>
        </div>
      </div>
    </div>
  );
}
