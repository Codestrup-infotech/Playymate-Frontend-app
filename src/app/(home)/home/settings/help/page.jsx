"use client";

import { ChevronRight } from "lucide-react";

export default function HelpPage() {
  const helpItems = [
    {
      title: "Support Center",
      desc: "",
    },
    {
      title: "Account Overview",
      desc: "",
    },
    {
      title: "Privacy & Safety",
      desc: "",
    },
    {
      title: "Your Requests",
      desc: "",
    },
    {
      title: "Share Feedback",
      desc: "Let us know about your experience with our support",
    },
  ];

  return (
    <div className="w-full max-w-2xl">
      
      {/* Header  main */}
      <h1 className="text-xl font-semibold mb-6">
        Help
      </h1>

      {/* List */}
      <div className="space-y-4">
        {helpItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between cursor-pointer group"
          >
            {/* Left */}
            <div>
              <p className="text-sm font-medium group-hover:underline">
                {item.title}
              </p>

              {item.desc && (
                <p className="text-xs text-gray-500 mt-1">
                  {item.desc}
                </p>
              )}
            </div>

            {/* Right Arrow */}
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-black"
            />
          </div>
        ))}
      </div>
    </div>
  );
}