"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, Users, Trophy, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Page() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 text-gray-900 px-5 py-6 pb-28 font-sans"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
        <Link
          href="/teams"
          className="text-gray-900 p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Create Team</h1>
      </motion.div>

      {/* STEP BAR */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {[1, 2, 3, 4].map((step) => (
            <motion.div
              key={step}
              className="h-1.5 flex-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2 + step * 0.1, duration: 0.5 }}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
          <span className="text-gray-400">Basic info</span>
          <span className="text-gray-400">Rules & Roles</span>
          <span className="text-gray-400">Joining Fee</span>
          <span className="text-pink-500">Preview</span>
        </div>
      </motion.div>

      {/* TEAM CARD */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 group-hover:bg-pink-100 transition-colors duration-500" />

        <div className="flex items-center gap-5 relative z-10">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-2xl font-black text-white shadow-lg"
            whileHover={{ rotate: 5 }}
          >
            T
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Name</h2>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-600">
                Football
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600">
                Public
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SUMMARY */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-6"
      >
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Check size={20} className="text-pink-500" />
          Summary
        </h3>

        <div className="space-y-4">
          <SummaryItem icon={<MapPin size={16} />} label="Location" value="Not set" />
          <SummaryItem icon={<Users size={16} />} label="Team Size" value="15 players" />
          <SummaryItem icon={<Trophy size={16} />} label="Skill Level" value="All Levels" />
          <SummaryItem icon={<Calendar size={16} />} label="Age Group" value="18+" />
        </div>
      </motion.div>

      {/* TERMS */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm mb-6 group cursor-pointer"
      >
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className="peer w-6 h-6 rounded-lg border-2 border-gray-200 checked:bg-pink-500 checked:border-pink-500 transition-all appearance-none cursor-pointer"
            id="terms"
          />
          <Check
            className="absolute left-1 text-white opacity-0 pointer-events-none transition-opacity peer-checked:opacity-100"
            size={16}
          />
        </div>
        <label
          htmlFor="terms"
          className="text-sm text-gray-600 leading-relaxed cursor-pointer group-hover:text-gray-900 transition-colors"
        >
          I agree to the{" "}
          <span className="text-pink-500 font-semibold">
            terms and conditions
          </span>{" "}
          of Playymate
        </label>
      </motion.div>

      {/* CREATE BUTTON */}
      <motion.div
        className="fixed bottom-6 inset-x-5 flex justify-center z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
      >
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          }}
          whileTap={{ scale: 0.95 }}
          className="w-full max-w-md py-4 bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl text-lg font-bold text-white flex items-center justify-center shadow-xl transition-all"
        >
          Create Team
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-pink-500 group-hover:bg-pink-50 transition-all">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}