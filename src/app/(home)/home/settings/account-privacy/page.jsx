"use client";

import { useState } from "react";

export default function AccountPrivacyPage() {
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <div className="w-full max-w-2xl">
      
      {/* Header */}
      <h1 className="text-xl font-semibold mb-6">
        Account privacy
      </h1>

      {/* Toggle Container */}
      <div className="flex items-center justify-between border border-gray-300 rounded-2xl px-5 py-4 mb-6">
        <span className="text-sm font-medium">
          Private account
        </span>

        {/* Toggle Switch */}
        <button
          onClick={() => setIsPrivate(!isPrivate)}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
            isPrivate ? "bg-black" : "bg-gray-300"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
              isPrivate ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Description */}
      <div className="text-sm text-gray-500 space-y-4 leading-relaxed">
        <p>
          When your account is public, your profile and posts can be seen by
          anyone, on or off Playymate, even if they don't have an account.
        </p>

        <p>
          When your account is private, only the followers you approve can see
          what you share, including your photos or videos on hashtag and
          location pages, and your followers and following lists. Certain info
          on your profile, like your profile picture and username, is visible
          to everyone on and off Playymate.
          <span className="text-blue-500 cursor-pointer ml-1">
            Learn more
          </span>
        </p>
      </div>
    </div>
  );
}