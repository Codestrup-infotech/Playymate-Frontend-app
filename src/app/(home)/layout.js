"use client";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import { useState } from "react";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a] text-white">

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 mt-[50px] transition-all duration-300 ${sidebarOpen ? 'ml-[220px]' : 'ml-[70px]'}`}>

        {/* Fixed Topbar */}
        <Topbar isSidebarOpen={sidebarOpen} />

        {/* Scrollable Content */}
        <main className="flex-1 pt-24 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
