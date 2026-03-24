"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export default function CloseFriendsPage() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);

  // 🔹 Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users"); // 🔁 change to your API
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  // 🔹 Toggle select
  const toggleUser = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      
      {/* Header */}
      <h1 className="text-xl font-semibold mb-2">
        Close friends
      </h1>

      <p className="text-sm text-gray-500 mb-4">
        We don't send notifications when you edit your close friends list.
        <span className="text-blue-500 ml-1 cursor-pointer">
          How it works.
        </span>
      </p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search"
        className="w-full bg-gray-100 rounded-lg px-4 py-2 mb-4 outline-none"
      />

      {/* User List */}
      <div className="space-y-4">
        {users.map((user) => {
          const isSelected = selected.includes(user.id);

          return (
            <div
              key={user.id}
              onClick={() => toggleUser(user.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              {/* Left */}
              <div className="flex items-center gap-3">
                <img
                  src={user.profilePic || "/default.png"}
                  alt="user"
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <p className="text-sm font-medium">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.fullName}
                  </p>
                </div>
              </div>

              {/* Right (Toggle Circle) */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  isSelected
                    ? "bg-orange-500 border-orange-500"
                    : "border-gray-400"
                }`}
              >
                {isSelected && (
                  <Check size={14} className="text-white" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}