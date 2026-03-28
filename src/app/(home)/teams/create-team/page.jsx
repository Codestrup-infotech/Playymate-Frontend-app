"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CreateTeamPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-5 py-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/teams" className="text-gray-900">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-semibold">Create Team</h1>
      </div>

      {/* STEP BAR */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400"></div>
          <div className="h-1 flex-1 rounded-full bg-gray-300"></div>
          <div className="h-1 flex-1 rounded-full bg-gray-300"></div>
          <div className="h-1 flex-1 rounded-full bg-gray-300"></div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-pink-500 font-medium">Basic info</span>
          <span className="text-gray-400">Rules & Roles</span>
          <span className="text-gray-400">Joining Fee</span>
          <span className="text-gray-400">Preview</span>
        </div>
      </div>

      {/* FORM */}
      <div className="space-y-6">

        {/* TEAM NAME */}
        <div>
          <label className="text-xs tracking-widest text-gray-500 uppercase">Team Name</label>
          <input
            type="text"
            placeholder="Enter team name"
            className="w-full mt-2 bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 shadow-sm"
          />
        </div>

        {/* SPORT TYPE */}
        <div>
          <label className="text-xs tracking-widest text-gray-500 uppercase">Sport Type</label>
          <select className="w-full mt-2 bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-900 focus:outline-none focus:border-pink-500 shadow-sm">
            <option>Football</option>
            <option>Basketball</option>
            <option>Cricket</option>
            <option>Tennis</option>
            <option>Badminton</option>
            <option>Volleyball</option>
          </select>
        </div>

        {/* LOCATION */}
        <div>
          <label className="text-xs tracking-widest text-gray-500 uppercase">Location</label>
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="City or area"
              className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 shadow-sm"
            />
          </div>
        </div>

        {/* PRIVATE TEAM */}
        <div className="bg-white border border-gray-300 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Private Team</h3>
            <p className="text-sm text-gray-500">Only invited members can join</p>
          </div>

          {/* Toggle UI */}
          <div className="w-14 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 flex items-center p-1">
            <div className="w-6 h-6 bg-white rounded-full ml-auto shadow"></div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-xs tracking-widest text-gray-500 uppercase">Description</label>
          <textarea
            placeholder="Tell players about your team..."
            rows={4}
            className="w-full mt-2 bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none shadow-sm"
          />
        </div>
      </div>

      {/* CONTINUE BUTTON */}
     <div className="fixed bottom-4 inset-x-4 flex justify-center">
        <Link
          href="/teams/create-team/rules-roles"
            className="px-8 py-2.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-sm font-medium text-white flex items-center justify-center shadow-md"
           >
           Continue
         </Link>
     </div>
    </div>
  )
}