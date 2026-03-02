"use client";

import { useRouter } from "next/navigation";
import { staycations } from "./data/staycations";
import StaycationCard from "./components/StaycationCard";

export default function StaycationsPage() {
  const router = useRouter();

  return (
    <div className="bg-black min-h-screen p-6 space-y-6 text-white">
      <h1 className="text-3xl font-bold">
        <span className="text-pink-500">Staycations</span>
      </h1>

      {staycations.map((item) => (
        <StaycationCard
          key={item.id}
          data={item}
          onClick={() =>
            router.push(`/booking/staycations/${item.id}`)
          }
        />
      ))}
    </div>
  );
}