"use client";

import { MessageCircle } from "lucide-react";

export default function MessagesFloatingButton({ count = 8 }) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className="flex items-center gap-4 px-5 py-4 rounded-full bg-white dark:bg-[#1a1a2e] shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Messages"
      >
        {/* ICON WITH BADGE */}
        <div className="relative">
          <MessageCircle className="w-5 h-5 text-gray-900 dark:text-white" />

          {/* Notification Badge */}
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-[1px] rounded-full min-w-[18px] text-center leading-tight">
              {count}
            </span>
          )}
        </div>

        {/* TEXT */}
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          Messages
        </span>

        {/* AVATAR GROUP */}
        <div className="flex items-center -space-x-2">
          <img
            src="https://i.pravatar.cc/30?img=1"
            className="w-6 h-6 rounded-full border-2 border-white"
          />
          <img
            src="https://i.pravatar.cc/30?img=2"
            className="w-6 h-6 rounded-full border-2 border-white"
          />
          <img
            src="https://i.pravatar.cc/30?img=3"
            className="w-6 h-6 rounded-full border-2 border-white"
          />

          {/* More indicator */}
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border-2 border-white">
            ...
          </div>
        </div>
      </button>
    </div>
  );
}