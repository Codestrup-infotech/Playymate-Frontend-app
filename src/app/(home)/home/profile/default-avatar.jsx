// Default Avatar Component
// Shows a default user icon when no profile image is uploaded

export default function DefaultAvatar({ className = "w-16 h-16 md:w-20 md:h-20" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      {/* Background */}
      <circle cx="12" cy="12" r="12" className="fill-gray-200" />

      {/* Head */}
      <circle cx="12" cy="9" r="4" className="fill-gray-400" />

      {/* Body */}
      <path
        d="M6 19c0-3.314 2.686-6 6-6s6 2.686 6 6"
        className="fill-gray-400"
      />
    </svg>
  );
}
