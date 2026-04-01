'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Users, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Confetti particle component
const ConfettiParticle = ({ delay, x, color, size, rotate }) => (
  <motion.div
    className="absolute top-0 rounded-sm pointer-events-none"
    style={{
      left: `${x}%`,
      width: size,
      height: size * 0.5,
      background: color,
      borderRadius: 2,
    }}
    initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
    animate={{
      y: ['0%', '110vh'],
      opacity: [1, 1, 0],
      rotate: [0, rotate * 3],
      x: [0, (Math.random() - 0.5) * 120],
    }}
    transition={{
      duration: 2.8 + Math.random() * 1.5,
      delay: delay,
      ease: 'easeIn',
      repeat: Infinity,
      repeatDelay: Math.random() * 3 + 1,
    }}
  />
);

const CONFETTI_COLORS = [
  '#f472b6', '#a855f7', '#fb923c', '#facc15',
  '#34d399', '#60a5fa', '#f87171', '#c084fc',
];

const confettiPieces = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  delay: i * 0.12,
  x: Math.random() * 100,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: Math.random() * 10 + 6,
  rotate: (Math.random() - 0.5) * 720,
}));

// Stagger animation variants
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.13, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const popVariants = {
  hidden: { opacity: 0, scale: 0.4, rotate: -15 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 260, damping: 18, delay: 0.05 },
  },
};

export default function SuccessContent() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleInviteFriends = () => {
    // handle invite
  };

  const handleViewTeams = () => {
    router.push('/teams');
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col font-sans">

      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-24 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #f472b6, #a855f7)' }}
        />
        <div
          className="absolute -top-16 right-0 w-56 h-56 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #fb923c, #facc15)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-40 opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #a855f7, #f472b6)' }}
        />
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className=" inset-0 pointer-events-none z-50 overflow-hidden">
            {confettiPieces.map((p) => (
              <ConfettiParticle key={p.id} {...p} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pt-20 pb-36 max-w-md mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Party Popper */}
        <motion.div variants={popVariants} className="mb-6 select-none">
          <div className="relative">
            {/* Glow ring behind emoji */}
            <motion.div
              className="absolute inset-0 rounded-full blur-2xl opacity-40"
              style={{ background: 'linear-gradient(135deg, #f472b6, #a855f7, #fb923c)' }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="relative text-8xl drop-shadow-xl">🎉</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div variants={itemVariants} className="text-center mb-2">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            You&apos;re{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #f472b6, #a855f7, #fb923c)' }}
            >
              In!
            </span>
          </h1>
        </motion.div>

        <motion.p variants={itemVariants} className="text-gray-500 text-base font-medium mb-10 text-center">
          You&apos;ve successfully joined the team
        </motion.p>

        {/* Info Card */}
        <motion.div
          variants={itemVariants}
          className="w-full rounded-3xl bg-gray-50 border border-gray-100 p-4 space-y-3 shadow-sm"
        >
          {/* Team row */}
          <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-offset-2 shrink-0"
              style={{ ringColor: '#a855f7' }}>
              {/* Placeholder avatar */}
              <div
                className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #f472b6, #a855f7)' }}
              >
                LI
              </div>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Lorem Ipsum</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                Cricket
                <span className="mx-1 text-gray-300">·</span>
                <Users className="w-3.5 h-3.5 text-gray-400" />
                25 members
              </p>
            </div>
          </div>

          {/* Coins row */}
          <motion.div
            className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #fb923c, #f472b6)' }}
            >
              <motion.div
                animate={{ rotate: [0, -12, 12, -8, 0], scale: [1, 1.15, 1] }}
                transition={{ delay: 1, duration: 0.6, ease: 'easeInOut' }}
              >
                <Coins className="w-7 h-7 text-white" />
              </motion.div>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">
                +50 Gold Coins Earned!
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Welcome bonus for joining</p>
            </div>

            {/* Shimmer badge */}
            <div className="ml-auto shrink-0">
              <motion.div
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(90deg, #fb923c, #f472b6)' }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                +50
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer Buttons */}
      <div className=" bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
        <div className="max-w-md mx-auto flex gap-3">

          {/* Invite Friends — outlined with gradient border */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleInviteFriends}
            className="relative flex-1 py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 overflow-hidden bg-white"
            style={{ border: '2px solid transparent', backgroundClip: 'padding-box' }}
          >
            {/* gradient border trick */}
            <span
              className="absolute inset-0 rounded-full -z-10"
              style={{
                background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #f472b6, #a855f7, #fb923c) border-box',
                border: '2px solid transparent',
              }}
            />
            <Share2 className="w-4 h-4 text-gray-800" />
            <span className="text-gray-900">Invite Friends</span>
          </motion.button>

          {/* View Teams — gradient fill */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleViewTeams}
            className="relative flex-1 py-4 rounded-full font-bold text-base text-white flex items-center justify-center gap-2 shadow-lg overflow-hidden"
            style={{ background: 'linear-gradient(90deg, #f472b6, #a855f7, #fb923c)' }}
          >
            {/* Shine sweep */}
            <motion.span
              className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full"
              animate={{ translateX: ['−100%', '200%'] }}
              transition={{ duration: 1.4, delay: 1.2, repeat: Infinity, repeatDelay: 3 }}
            />
            <Users className="w-4 h-4" />
            View Teams
          </motion.button>
        </div>
      </div>
    </div>
  );
}
