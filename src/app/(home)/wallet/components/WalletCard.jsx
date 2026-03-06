"use client";

export default function WalletCard({
  title,
  amount,
  gradient,
  buttonText,
  onClick,
}) {
  return (
    <div className={`${gradient} p-6 rounded-2xl mb-6 text-white`}>
      <p className="text-sm opacity-80">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{amount}</h2>

      {buttonText && (
        <button
          onClick={onClick}
          className="mt-4 bg-black/40 px-4 py-2 rounded-lg text-sm"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}