"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import CategoryCard, { CategoryCardSkeleton } from "./CategoryCard";
import { fetchCategoryItems, getCategoryTheme } from "@/lib/categoryApi";

/**
 * CategoryGrid - A reusable grid component for displaying category items
 * @param {Object} props
 * @param {string} props.category - The category slug
 * @param {string} props.title - Optional custom title (defaults to category title)
 * @param {boolean} props.multiple - Allow multiple selections
 * @param {number} props.maxSelection - Maximum number of items that can be selected
 * @param {Function} props.onSelectionChange - Callback when selection changes
 * @param {string} props.returnTo - URL to return to after selection (optional)
 * @param {boolean} props.autoSubmit - Auto-submit on selection change
 * @param {Object} props.initialSelection - Initial selected items
 */
export default function CategoryGrid({
  category,
  title,
  multiple = false,
  maxSelection,
  onSelectionChange,
  returnTo,
  autoSubmit = false,
  initialSelection = [],
}) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(initialSelection);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const theme = getCategoryTheme(category);
  const displayTitle = title || theme.title;

  // Get token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch items
  useEffect(() => {
    if (!token) return;

    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await fetchCategoryItems(category, token);
        setItems(data.items || []);
        if (data.max_selection) {
          // Store max selection in state if provided
        }
      } catch (err) {
        console.error("Error fetching category items:", err);
        setError("Failed to load items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category, token]);

  // Handle selection
  const handleSelect = useCallback((item) => {
    setSelectedItems((prev) => {
      const isAlreadySelected = prev.some((i) => i.id === item.id);

      if (multiple) {
        // Multi-select mode
        if (isAlreadySelected) {
          const updated = prev.filter((i) => i.id !== item.id);
          if (onSelectionChange) onSelectionChange(updated);
          return updated;
        } else {
          // Check max selection limit
          if (maxSelection && prev.length >= maxSelection) {
            return prev; // Don't add more
          }
          const updated = [...prev, item];
          if (onSelectionChange) onSelectionChange(updated);
          return updated;
        }
      } else {
        // Single select mode
        const updated = [item];
        if (onSelectionChange) onSelectionChange(updated);
        return updated;
      }
    });
  }, [multiple, maxSelection, onSelectionChange]);

  // Handle click (navigation)
  const handleClick = useCallback((item) => {
    if (returnTo) {
      // Store selection in session storage for return
      sessionStorage.setItem(`selected_${category}`, JSON.stringify(item));
      router.push(returnTo);
    }
  }, [category, returnTo, router]);

  // Submit selection
  const handleSubmit = useCallback(() => {
    if (selectedItems.length === 0) return;

    // Store selection and navigate
    sessionStorage.setItem(`selected_${category}`, JSON.stringify(selectedItems));
    
    if (returnTo) {
      router.push(returnTo);
    }
  }, [selectedItems, category, returnTo, router]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">{displayTitle}</h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{displayTitle}</h2>
          {maxSelection && (
            <p className="text-white/60 text-sm mt-1">
              Choose up to {maxSelection} {maxSelection === 1 ? "option" : "options"}
            </p>
          )}
        </div>
        
        {/* Selection count */}
        {multiple && selectedItems.length > 0 && (
          <span className="text-sm text-white/60">
            {selectedItems.length} selected
          </span>
        )}
      </div>

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <CategoryCard
              key={item.id}
              item={item}
              category={category}
              isSelected={selectedItems.some((i) => i.id === item.id)}
              onSelect={handleSelect}
              onClick={handleClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/60">
          No items available
        </div>
      )}

      {/* Submit button (if in multi-select mode with selection) */}
      {multiple && selectedItems.length > 0 && !autoSubmit && (
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            className={`w-full py-3 rounded-xl bg-gradient-to-r ${theme.gradient} font-semibold text-white hover:opacity-90 transition-opacity`}
          >
            Continue ({selectedItems.length} selected)
          </button>
        </div>
      )}

      {/* Auto-submit indicator */}
      {autoSubmit && selectedItems.length > 0 && (
        <div className="text-center text-sm text-white/60">
          Selection saved
        </div>
      )}
    </div>
  );
}

/**
 * CategoriesList - Displays all categories as cards
 * @param {Object} props
 * @param {Array} props.categories - List of category objects
 * @param {Function} props.onCategoryClick - Callback when a category is clicked
 */
export function CategoriesList({ categories, onCategoryClick }) {
  const theme = getCategoryTheme("sports"); // Default theme for main list

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        No categories available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          item={{
            name: category.name || category.title,
            description: category.description,
          }}
          category={category.slug}
          onClick={() => onCategoryClick?.(category)}
        />
      ))}
    </div>
  );
}
