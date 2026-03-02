"use client"

import { ArrowLeft, Search, Link as LinkIcon, QrCode, Copy, Check, UserPlus, Home } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function InvitePage() {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams" className="text-white text-xl">
          ←
        </Link>
        <h1 className="text-xl font-semibold">Invite Players</h1>
      </div>

      {/* Search Players */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="text" 
            placeholder="Search players by name or email"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Invite Link */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold mb-4">Invite Link</h3>
        
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value="playymate.app/join/abc123"
            readOnly
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-300"
          />
          <button 
            onClick={copyLink}
            className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
        
        <p className="text-xs text-zinc-500 mt-3">
          Share this link to let players join your team
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold mb-4">QR Code</h3>
        
        <div className="flex justify-center py-4">
          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
            <QrCode size={120} className="text-black" />
          </div>
        </div>
        
        <p className="text-xs text-zinc-500 text-center">
          Players QR code to join can scan this
        </p>
      </div>

      {/* Invite Code */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold mb-4">Invite Code</h3>
        
        <div className="text-center">
          <p className="text-4xl font-bold tracking-widest text-pink-500 mb-2">ABC123</p>
          <p className="text-xs text-zinc-500">
            Players can enter this code to join
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-4 right-4 space-y-3">
        <button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          <UserPlus size={20} />
          Invite from Contacts
        </button>
        <Link href="/teams/create-team/manage" className="w-full bg-zinc-800 py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
          <Home size={20} />
          Go to Team Management
        </Link>
      </div>
    </div>
  )
}
