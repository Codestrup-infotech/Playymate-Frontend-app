"use client";

import { getCategoryTheme, CATEGORY_GIFS } from "@/lib/categoryApi";
import Image from "next/image";

/**
 * CategoryCard - A reusable card component for displaying category items
 * @param {Object} props
 * @param {Object} props.item - The category item data
 * @param {string} props.category - The category slug
 * @param {boolean} props.isSelected - Whether the item is selected
 * @param {Function} props.onSelect - Callback when item is selected
 * @param {Function} props.onClick - Callback when item is clicked
 */
export default function CategoryCard({
  item,
  category,
  isSelected = false,
  onSelect,
  onClick,
}) {
  const theme = getCategoryTheme(category);
  const gifSrc = CATEGORY_GIFS[category] || CATEGORY_GIFS.sports;

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  const handleSelectToggle = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(item);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer
        transition-all duration-300 ease-in-out
        bg-gradient-to-br ${theme.gradient}
        ${isSelected ? "ring-4 ring-white/30 scale-105" : "hover:scale-105 hover:shadow-xl hover:shadow-white/10"}
        ${isSelected ? theme.selectedBg : ""}
      `}
    >
      {/* Background GIF/Image */}
      <div className="absolute inset-0 opacity-30">
        <Image
          src={gifSrc}
          alt={item.name || item.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-end min-h-[140px]">
        {/* Checkbox/Radio indicator */}
        {onSelect && (
          <div className="absolute top-3 right-3">
            <button
              onClick={handleSelectToggle}
              className={`
                w-7 h-7 rounded-full border-2 flex items-center justify-center
                transition-all duration-200
                ${isSelected
                  ? "bg-white border-white"
                  : "border-white/60 hover:border-white"
                }
              `}
            >
              {isSelected && (
                <svg
                  className={`w-4 h-4 ${theme.iconColor.replace("text-", "fill-")}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Category Label */}
        <span className="text-xs font-medium uppercase tracking-wider text-white/70 mb-1">
          {category}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-white leading-tight">
          {item.name || item.title || item.item_name}
        </h3>

        {/* Description (if available) */}
        {item.description && (
          <p className="text-sm text-white/80 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Selection count (if maxSelection is set) */}
        {item.max_selection && onSelect && (
          <p className="text-xs text-white/60 mt-2">
            Select up to {item.max_selection}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * CategoryCardSkeleton - Loading skeleton for CategoryCard
 */
export function CategoryCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-800 animate-pulse h-[140px]">
      <div className="absolute inset-0 bg-gray-700/50" />
      <div className="relative z-10 p-5 h-full flex flex-col justify-end">
        <div className="h-3 w-20 bg-gray-600 rounded mb-2" />
        <div className="h-5 w-32 bg-gray-500 rounded" />
      </div>
    </div>
  );
}
