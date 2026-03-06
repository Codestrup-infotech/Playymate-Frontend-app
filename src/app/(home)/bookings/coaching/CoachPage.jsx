"use client";

import { useRouter } from "next/navigation";
import CoachCard from "./components/CoachCard";
import { coaches } from "./data/coaches";

export default function CoachPage() {
  const router = useRouter();

  return (
    <div className="bg-black min-h-screen p-6 space-y-6 text-white">
      <h1 className="text-3xl font-bold">
         <span className="text-pink-500">Coaching</span>
      </h1>

      {coaches.map((coach) => (
        <CoachCard
          key={coach.id}
          coach={coach}
          onSelect={(coach) =>
            router.push(`/bookings/coaching/${coach.id}`)
          }
        />
      ))}
    </div>
  );
}