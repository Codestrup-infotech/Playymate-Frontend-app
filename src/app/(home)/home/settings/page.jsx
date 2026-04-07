"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const settingsItems = [
    {
      title: "Edit Profile",
      description: "Update your profile information, profile picture, and bio.",
      href: "/home/profile/edit",
    },
    {
      title: "Account Privacy",
      description: "Control who can see your profile and content.",
      href: "/home/settings/account-privacy",
    },
    {
      title: "Close Friends",
      description: "Manage your close friends list for restricted sharing.",
      href: "/home/settings/close-friends",
    },
    {
      title: "Muted Users",
      description: "Manage users you've muted.",
      href: "/home/settings/muted-user-list",
    },
    {
      title: "Blocked Users",
      description: "Manage users you've blocked.",
      href: "/home/settings/blocked-user",
    },
    {
      title: "Help",
      description: "Get help with your account and learn about Playymate features.",
      href: "/home/settings/help",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings, privacy, and preferences.
        </p>
      </div>

      <div className="grid gap-4">
        {settingsItems.map((item, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
            onClick={() => router.push(item.href)}
          >
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm text-gray-500">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
