"use client";
import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { FaCoins, FaGem } from "react-icons/fa";

export default function PaymentPage({
  wallet = {},
  pricing = {},
  onConfirm = () => {},
}) {
  const [useCoins, setUseCoins] = useState(false);
  const [selectedOption, setSelectedOption] = useState("diamonds");

  const discount = useCoins ? pricing.discountAmount || 0 : 0;
  const total = (pricing.fee || 0) - discount;

  const handleConfirm = () => {
    onConfirm({
      useCoins,
      paymentMethod: selectedOption,
      total,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f] flex justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-lg p-5">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-800">
            <FiArrowLeft className="text-gray-700 dark:text-white" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            Payment
          </h1>
        </div>

        {/* Wallet */}
        <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl p-4 flex justify-between items-center mb-5">
          <div>
            <p className="text-xs text-gray-400">YOUR WALLET</p>
            <div className="flex items-center gap-2 mt-2">
              <FaCoins className="text-yellow-400" />
              <span className="font-bold text-lg">
                {wallet.coins}
              </span>
              <span className="text-xs text-gray-400">GOLD COINS</span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-gray-700" />

          <div>
            <div className="flex items-center gap-2">
              <FaGem className="text-blue-400" />
              <span className="font-bold text-lg">
                {wallet.diamonds}
              </span>
            </div>
            <span className="text-xs text-gray-400">DIAMONDS</span>
          </div>
        </div>

        {/* Payment Options */}
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Payment Options
        </h2>

        {/* Use Coins */}
        <div className="bg-gray-100 dark:bg-[#262626] rounded-xl p-3 flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <FaCoins className="text-yellow-400" />
            <span className="text-sm text-gray-800 dark:text-white">
              Use Gold Coins
            </span>
            <span className="text-xs text-gray-500">
              {pricing.discountPercent}% Discount
            </span>
          </div>

          <button
            onClick={() => setUseCoins(!useCoins)}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
              useCoins ? "bg-yellow-400" : "bg-gray-400"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                useCoins ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* Use Diamonds */}
        <div
          onClick={() => setSelectedOption("diamonds")}
          className={`rounded-xl p-3 flex justify-between items-center cursor-pointer border ${
            selectedOption === "diamonds"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <FaGem className="text-blue-400" />
            <span className="text-sm text-gray-800 dark:text-white">
              Use Diamonds
            </span>
          </div>

          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              selectedOption === "diamonds"
                ? "border-blue-500"
                : "border-gray-400"
            }`}
          >
            {selectedOption === "diamonds" && (
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-100 dark:bg-[#262626] rounded-xl p-4 mt-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-300">
              Membership Fee
            </span>
            <span className="text-gray-800 dark:text-white">
              ₹{pricing.fee}
            </span>
          </div>

          {useCoins && (
            <div className="flex justify-between text-sm mb-2 text-green-500">
              <span>Gold Discount ({pricing.discountPercent}%)</span>
              <span>-₹{discount}</span>
            </div>
          )}

          <hr className="my-2 border-gray-300 dark:border-gray-700" />

          <div className="flex justify-between font-semibold">
            <span className="text-gray-800 dark:text-white">
              Total Payable
            </span>
            <span className="text-gray-900 dark:text-white">
              ₹{total}
            </span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedOption}
          className="w-full mt-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50"
        >
          Confirm & Join
        </button>
      </div>
    </div>
  );
}