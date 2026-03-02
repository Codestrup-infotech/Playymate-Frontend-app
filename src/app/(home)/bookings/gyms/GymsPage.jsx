"use client";

import { useRouter } from "next/navigation";
import { gyms } from "./data/gyms";
import GymCard from "./components/GymCard";

export default function GymsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {gyms.map((gym) => (
        <GymCard
          key={gym.id}
          gym={gym}
          onClick={() =>
            router.push(`/booking/gyms/${gym.id}`)
          }
        />
      ))}
    </div>
  );
}