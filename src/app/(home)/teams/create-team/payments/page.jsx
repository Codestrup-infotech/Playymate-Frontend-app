"use client"

import { ArrowLeft, DollarSign, TrendingUp, Users, CreditCard, Download, Filter } from "lucide-react"
import Link from "next/link"

export default function PaymentsPage() {
  const transactions = [
    { player: 'John Smith', amount: 50, date: '2 days ago', status: 'Paid' },
    { player: 'Mike Johnson', amount: 50, date: '5 days ago', status: 'Paid' },
    { player: 'David Wilson', amount: 50, date: '1 week ago', status: 'Paid' },
    { player: 'Chris Brown', amount: 50, date: '1 week ago', status: 'Pending' },
  ]

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams/create-team/manage" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Payments</h1>
        <button className="ml-auto">
          <Download size={20} className="text-zinc-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-green-500" size={20} />
            <p className="text-sm text-zinc-400">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold">$450</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-pink-500" size={20} />
            <p className="text-sm text-zinc-400">This Month</p>
          </div>
          <p className="text-3xl font-bold">$150</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm">
          <Filter size={16} />
          All
        </button>
        <button className="px-4 py-2 rounded-xl border border-zinc-800 text-sm text-zinc-400">
          Paid
        </button>
        <button className="px-4 py-2 rounded-xl border border-zinc-800 text-sm text-zinc-400">
          Pending
        </button>
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Recent Transactions</h3>
        
        {transactions.map((tx, index) => (
          <div key={index} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CreditCard size={20} className="text-green-500" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-medium">{tx.player}</p>
              <p className="text-sm text-zinc-400">{tx.date}</p>
            </div>

            {/* Amount & Status */}
            <div className="text-right">
              <p className="font-semibold text-green-500">+${tx.amount}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'Paid' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                {tx.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
