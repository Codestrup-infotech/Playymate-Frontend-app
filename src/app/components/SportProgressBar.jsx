"use client";

import { useRef, useEffect } from "react";

/* =========================
   WATER BALL PROGRESS
========================= */

function WaterBall({ progress = 0 }) {
  const SIZE = 70;
  const R = SIZE / 2;

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;

    ctx.scale(dpr, dpr);

    const pct = Math.min(Math.max(progress, 0), 100);

    function draw() {
      tickRef.current += 0.02;
      const tk = tickRef.current;

      ctx.clearRect(0, 0, SIZE, SIZE);

      ctx.save();
      ctx.beginPath();
      ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.clip();

      const fillY = SIZE - (pct / 100) * SIZE;

      ctx.beginPath();
      ctx.moveTo(0, SIZE);
      ctx.lineTo(0, fillY + 6);

      for (let x = 0; x <= SIZE; x++) {
        const y =
          fillY +
          6 +
          Math.sin(x * 0.04 + tk) * 6 +
          Math.sin(x * 0.07 + tk * 1.2) * 3;

        ctx.lineTo(x, y);
      }

      ctx.lineTo(SIZE, SIZE);
      ctx.closePath();

      const g = ctx.createLinearGradient(0, fillY, 0, SIZE);
      g.addColorStop(0, "rgba(6,182,212,0.8)");
      g.addColorStop(1, "rgba(7,60,110,0.95)");

      ctx.fillStyle = g;
      ctx.fill();

      ctx.restore();

      ctx.beginPath();
      ctx.arc(R, R, R - 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(147,220,255,0.7)";
      ctx.lineWidth = 3;
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [progress]);

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <canvas
        ref={canvasRef}
        className="rounded-full block"
        style={{ width: SIZE, height: SIZE }}
      />

      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
        {progress}%
      </div>
    </div>
  );
}

/* =========================
   TOP PROGRESS BAR
========================= */

function TopProgress({ progress = 0, coins = 0 }) {
  return (
    <div className="w-full px-6 pt-4">

      <div className="relative w-full h-2 bg-[#E8EAEC] rounded-full overflow-hidden">

        <div
          className="h-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />

        <div
          className="absolute -top-3 transition-all duration-500"
          style={{ left: `calc(${progress}% - 12px)` }}
        >
          <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs shadow-lg">
            🪙
          </div>
        </div>
      </div>

      <div className="text-pink-400 text-sm mt-2 font-normal">
        +{coins} Coins earned!
      </div>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */

export default function SportProgressBar({ percentage = 0, pendingCoins = 0 }) {
  return (
    <div className="flex flex-col items-center w-full space-y-3">

      {/* top progress */}
      <TopProgress progress={percentage} coins={pendingCoins} />

      {/* water ball */}
      <WaterBall progress={percentage} />

    </div>
  );
}