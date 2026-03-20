import { useState, useEffect, useRef } from "react";

// ─── Emoji Data ────────────────────────────────────────────────────────────────

const EMOJI_CATEGORIES = [
  {
    icon: "😊",
    label: "Smileys",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃",
      "😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚",
      "😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭",
      "🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄",
      "😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕",
      "🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳",
      "😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲",
      "😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱",
      "😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠",
    ],
  },
  {
    icon: "👍",
    label: "Gestures",
    emojis: [
      "👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞",
      "🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍",
      "👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝",
      "🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂",
      "🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁️","👅",
    ],
  },
  {
    icon: "❤️",
    label: "Hearts",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
      "❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝",
      "💟","♥️","💋","😻","💑","👫","👬","👭","💏","🥂",
    ],
  },
  {
    icon: "🎉",
    label: "Celebration",
    emojis: [
      "🎉","🎊","🎈","🎂","🎁","🎀","🎗️","🎟️","🎫","🏆",
      "🥇","🥈","🥉","🏅","🎖️","🌟","⭐","💫","✨","🌠",
      "🎆","🎇","🧨","🎍","🎎","🎑","🎃","🎄","🎋","🎏",
      "🎐","🎠","🎡","🎢","🎪","🤹","🎭","🎨","🖼️","🎬",
    ],
  },
  {
    icon: "🐶",
    label: "Animals",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
      "🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🦆",
      "🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋",
      "🐌","🐞","🐜","🦟","🦗","🕷️","🦂","🐢","🐍","🦎",
      "🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟",
    ],
  },
  {
    icon: "🍕",
    label: "Food",
    emojis: [
      "🍕","🍔","🍟","🌭","🍿","🧂","🥓","🥚","🍳","🧇",
      "🥞","🧈","🍞","🥐","🥖","🥨","🥯","🧀","🥗","🥙",
      "🌮","🌯","🫔","🥫","🍱","🍘","🍙","🍚","🍛","🍜",
      "🍝","🍠","🍢","🍣","🍤","🍥","🥮","🍡","🧁","🍰",
      "🎂","🍮","🍭","🍬","🍫","🍩","🍪","🌰","🥜","🍯",
      "☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷",
    ],
  },
  {
    icon: "⚽",
    label: "Sports",
    emojis: [
      "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱",
      "🏓","🏸","🏒","🥍","🏑","🏏","🪃","🥅","⛳","🪁",
      "🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛷","⛸️","🥌",
      "🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️","🤺","🏊",
      "🚴","🏇","🤾","🏌️","🧘","🧗","🤺","🏄","🚣","🧜",
    ],
  },
  {
    icon: "🚗",
    label: "Travel",
    emojis: [
      "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐",
      "🛻","🚚","🚛","🚜","🏍️","🛵","🚲","🛴","🛺","🚁",
      "✈️","🚀","🛸","⛵","🚢","🛳️","🚂","🚃","🏠","🏡",
      "🌍","🌎","🌏","🗺️","🧭","⛰️","🏔️","🗻","🏕️","🏖️",
      "🏜️","🏝️","🏞️","🌋","🗽","🗼","🏯","🏰","🕌","🛕",
    ],
  },
  {
    icon: "💡",
    label: "Symbols",
    emojis: [
      "💯","🔥","✅","❌","❓","❗","💬","💭","🗯️","💤",
      "💢","💥","💫","💦","💨","🕳️","💣","🔔","🔕","🎵",
      "🎶","🔇","🔈","🔉","🔊","📢","📣","⏰","⌚","📱",
      "💻","⌨️","🖥️","🖨️","🖱️","🕹️","💾","📷","📸","📹",
      "🎥","📞","☎️","📟","📺","📻","🧭","⏱️","⏳","📡",
      "🔋","🔌","💡","🔦","🕯️","🪔","🧲","🔮","🪄","🎯",
    ],
  },
];

// ─── ComposeEmojiPicker ────────────────────────────────────────────────────────

export default function ComposeEmojiPicker({ onPick, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch]                 = useState("");
  const pickerRef                           = useRef(null);
  const searchRef                           = useRef(null);

  // Auto-focus search on open
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Filtered emojis when searching
  const searchResults = search.trim()
    ? EMOJI_CATEGORIES.flatMap((cat) =>
        cat.emojis.filter((e) => e.includes(search))
      )
    : null;

  const displayEmojis = searchResults ?? EMOJI_CATEGORIES[activeCategory].emojis;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-14 left-0 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-40 overflow-hidden select-none"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
    >
      {/* ── Search bar ── */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emoji..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Category tabs (hidden when searching) ── */}
      {!search && (
        <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50 px-1 gap-0.5 scrollbar-hide">
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              title={cat.label}
              className={`flex-shrink-0 text-base px-2 py-1.5 rounded-t-lg transition-colors ${
                activeCategory === i
                  ? "bg-white border-b-2 border-pink-500"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* ── Section label ── */}
      <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50">
        {search
          ? `Results for "${search}" — ${displayEmojis.length} found`
          : EMOJI_CATEGORIES[activeCategory].label
        }
      </div>

      {/* ── Emoji grid ── */}
      <div className="grid grid-cols-8 gap-0 p-2 h-52 overflow-y-auto">
        {displayEmojis.length > 0 ? (
          displayEmojis.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => onPick(emoji)}
              className="text-xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-pink-50 active:scale-90 transition-all"
              title={emoji}
            >
              {emoji}
            </button>
          ))
        ) : (
          <div className="col-span-8 flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <span className="text-3xl">🔍</span>
            <p className="text-xs">No emoji found</p>
          </div>
        )}
      </div>

      {/* ── Footer — recently used hint ── */}
      <div className="px-3 py-2 border-t border-gray-100 text-[10px] text-gray-400 text-center">
        Click an emoji to insert it at cursor position
      </div>
    </div>
  );
}