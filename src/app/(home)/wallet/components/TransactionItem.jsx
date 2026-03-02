"use client";

export default function TransactionItem({ title, amount }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl mb-3 flex justify-between items-center">
      <span>{title}</span>
      <span className={amount > 0 ? "text-green-400" : "text-red-400"}>
        {amount > 0 ? "+" : ""}
        {amount}
      </span>
    </div>
  );
}