"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  // Redirect to Edit Profile by default or show a welcome message
  useEffect(() => {
    // Optionally redirect to a default settings page
    // router.push("/home/profile/edit");
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings, privacy, and preferences.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
          <h3 className="font-medium">Edit Profile</h3>
          <p className="text-sm text-gray-500">
            Update your profile information, profile picture, and bio.
          </p>
        </div>

        <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
          <h3 className="font-medium">Account Privacy</h3>
          <p className="text-sm text-gray-500">
            Control who can see your profile and content.
          </p>
        </div>

        <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
          <h3 className="font-medium">Close Friends</h3>
          <p className="text-sm text-gray-500">
            Manage your close friends list for restricted sharing.
          </p>
        </div>

        <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
          <h3 className="font-medium">Help</h3>
          <p className="text-sm text-gray-500">
            Get help with your account and learn about Playymate features.
          </p>
        </div>
      </div>
    </div>
  );
}
