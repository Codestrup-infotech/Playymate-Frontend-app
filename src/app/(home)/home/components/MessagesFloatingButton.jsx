"use client";
import { MessageCircle } from "lucide-react";

/**
 * Fixed floating Messages pill button — bottom-right of the screen.
 * Mimics the Instagram web Messages button.
 */
export default function MessagesFloatingButton({ count = "9+" }) {
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                className="bg-white dark:bg-[#1a1a2e] rounded-full shadow-xl px-5 py-3 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200 border border-gray-100 dark:border-gray-700 group"
                aria-label="Messages"
            >
                {/* Icon */}
                <MessageCircle
                    size={20}
                    className="text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors"
                />

                {/* Label */}
                <span className="font-semibold text-sm text-gray-900 dark:text-white whitespace-nowrap">
                    Messages
                </span>

                {/* Badge */}
                {count && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center leading-tight">
                        {count}
                    </span>
                )}
            </button>
        </div>
    );
}
