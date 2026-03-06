"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Calendar, User, ShoppingCart, Users, Trophy, HelpCircle, 
  Compass, Flame, Zap, Menu, X, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, MessageCircle, Send, Eye, ArrowLeft, Settings,
  ThumbsUp, Share2, Flag
} from "lucide-react";

// Dummy chat data
const initialChatMessages = [
  { id: 1, user: "SoccerFan99", avatar: "S", message: "What a goal! 🔥", time: "2:34" },
  { id: 2, user: "GoalKing", avatar: "G", message: "This match is insane today", time: "2:33" },
  { id: 3, user: "RedDevils", avatar: "R", message: "Defense needs to tighten up", time: "2:32" },
  { id: 4, user: "FootyLover", avatar: "F", message: "Who else is watching from India?", time: "2:31" },
  { id: 5, user: "Champion", avatar: "C", message: "Let's gooo! ⚽", time: "2:30" },
  { id: 6, user: "MatchDay", avatar: "M", message: "Great pass there", time: "2:29" },
  { id: 7, user: "Striker10", avatar: "S", message: "This ref is blind 😅", time: "2:28" },
  { id: 8, user: "TeamBlue", avatar: "T", message: "We need a substitution", time: "2:27" },
  { id: 9, user: "Ultras", avatar: "U", message: "FORZA! 🔴🔵", time: "2:26" },
  { id: 10, user: "CasualViewer", avatar: "C", message: "First time watching, this is exciting!", time: "2:25" },
];

// Dummy match data
const matchData = {
  title: "Premier League",
  subtitle: "Manchester United vs Liverpool",
  league: "Premier League • Matchday 27",
  homeTeam: { name: "Manchester United", score: 2, logo: "🔴" },
  awayTeam: { name: "Liverpool", score: 1, logo: "🔵" },
  status: "LIVE",
  viewerCount: 24567,
  competition: "England - Premier League",
};

// Left Navigation Component
function LiveSidebar({ isOpen }) {
  const pathname = usePathname();
  
  const menu = [
    { name: "Home", icon: <Home size={20} />, path: "/home" },
    { name: "Live Matches", icon: <Play size={20} />, path: "/home/livestream" },
    { name: "Highlights", icon: <Zap size={20} />, path: "/home/explore" },
    { name: "Chat Rooms", icon: <MessageCircle size={20} />, path: "/community" },
    { name: "Profile", icon: <User size={20} />, path: "/home/profile/${user.id}" },
  ];

  return (
    <div className={`hidden xl:flex flex-col h-full bg-[#121226] border-r border-gray-800 transition-all duration-300 ${isOpen ? 'w-56' : 'w-0'}`}>
      {/* Logo */}
      <div className="h-16 border-b border-gray-800 flex items-center px-4">
        <img src="/playymate-logo.png" alt="Playymate" className="h-8 w-auto object-contain" />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {menu.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                pathname === item.path
                  ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
        
        {/* Additional Links */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Discover
          </h3>
          <div className="space-y-1">
            <Link href="/home/listings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <Compass size={20} />
              <span className="text-sm">Explore</span>
            </Link>
            <Link href="/leaderboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <Trophy size={20} />
              <span className="text-sm">Leaderboard</span>
            </Link>
            <Link href="/shopping" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <ShoppingCart size={20} />
              <span className="text-sm">Shopping</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

// Video Player Component
function VideoPlayer({ viewerCount }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
      {/* Video Placeholder - Simulated Video */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        {/* Stadium Background Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.2) 0%, transparent 40%),
                             radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 40%)`
          }}></div>
        </div>
        
        {/* Play/Pause Center Button */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all group"
        >
          {isPlaying ? (
            <Pause size={32} className="text-white group-hover:scale-110 transition-transform" />
          ) : (
            <Play size={32} className="text-white ml-1 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Animated Crowd Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Top Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        {/* Back Button */}
        <Link href="/home" className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </Link>

        {/* Live Badge + Viewers */}
        <div className="flex items-center gap-3">
          {/* Live Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-white text-sm font-bold">LIVE</span>
          </div>

          {/* Viewer Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
            <Eye size={16} className="text-white" />
            <span className="text-white text-sm font-medium">{viewerCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Settings */}
        <button className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
          <Settings size={20} className="text-white" />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isFullscreen ? <Minimize size={20} className="text-white" /> : <Maximize size={20} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full"></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>24:35</span>
            <span>90:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Match Info Component
function MatchInfo({ match }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1234);

  return (
    <div className="mt-6">
      {/* Match Title */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{match.subtitle}</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">{match.league}</span>
        </div>
      </div>

      {/* Score Board */}
      <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-4xl mb-3">
              {match.homeTeam.logo}
            </div>
            <h3 className="text-white font-semibold text-center">{match.homeTeam.name}</h3>
            <span className="text-gray-500 text-sm">Home</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center px-8">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold text-white">{match.homeTeam.score}</span>
              <span className="text-3xl text-gray-500">-</span>
              <span className="text-5xl font-bold text-white">{match.awayTeam.score}</span>
            </div>
            <span className="text-red-500 font-medium mt-2">67&apos;</span>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-4xl mb-3">
              {match.awayTeam.logo}
            </div>
            <h3 className="text-white font-semibold text-center">{match.awayTeam.name}</h3>
            <span className="text-gray-500 text-sm">Away</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button 
          onClick={() => { setIsLiked(!isLiked); setLikeCount(isLiked ? likeCount - 1 : likeCount + 1); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
            isLiked ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <ThumbsUp size={20} className={isLiked ? "fill-current" : ""} />
          <span>{likeCount.toLocaleString()}</span>
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all">
          <Share2 size={20} />
          <span>Share</span>
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all">
          <Flag size={20} />
          <span>Report</span>
        </button>
      </div>

      {/* Match Stats */}
      <div className="mt-6 bg-[#1a1a2e] rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Match Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatBar label="Possession" home="62%" away="38%" homePercent={62} />
          <StatBar label="Shots" home="14" away="8" homePercent={64} />
          <StatBar label="Shots on Target" home="6" away="3" homePercent={67} />
          <StatBar label="Corners" home="7" away="4" homePercent={64} />
          <StatBar label="Fouls" home="9" away="12" homePercent={43} />
          <StatBar label="Yellow Cards" home="1" away="2" homePercent={33} />
        </div>
      </div>
    </div>
  );
}

// Stat Bar Component
function StatBar({ label, home, away, homePercent }) {
  return (
    <div className="col-span-1">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{home}</span>
        <span className="text-gray-500 text-xs">{label}</span>
        <span className="text-gray-400">{away}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
        <div className="h-full bg-purple-500" style={{ width: `${homePercent}%` }}></div>
        <div className="h-full bg-orange-500" style={{ width: `${100 - homePercent}%` }}></div>
      </div>
    </div>
  );
}

// Chat Message Component
function ChatMessage({ message }) {
  const avatarColors = [
    "bg-purple-500",
    "bg-orange-500", 
    "bg-blue-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-cyan-500",
  ];
  
  const colorIndex = message.user.charCodeAt(0) % avatarColors.length;

  return (
    <div className="flex gap-3 p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
      <div className={`w-9 h-9 ${avatarColors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
        {message.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm">{message.user}</span>
          <span className="text-gray-500 text-xs">{message.time}</span>
        </div>
        <p className="text-gray-300 text-sm mt-0.5 break-words">{message.message}</p>
      </div>
    </div>
  );
}

// Chat Input Component
function ChatInput({ onSend }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-800">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Send a message..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}

// Live Chat Component
function LiveChat({ messages, onSendMessage }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-[#121226] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageCircle size={20} className="text-purple-500" />
          Live Chat
        </h3>
        <span className="text-xs text-gray-500">{messages.length} messages</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput onSend={onSendMessage} />
    </div>
  );
}

// Main Page Component
export default function LiveStreamPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [viewerCount, setViewerCount] = useState(matchData.viewerCount);

  // Simulate viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10) - 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (text) => {
    const newMessage = {
      id: chatMessages.length + 1,
      user: "You",
      avatar: "Y",
      message: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <LiveSidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Video Player */}
            <VideoPlayer viewerCount={viewerCount} />

            {/* Match Info */}
            <MatchInfo match={matchData} />
          </div>
        </main>

        {/* Right Sidebar - Live Chat */}
        <aside className="w-80 xl:w-96 hidden lg:block p-4 border-l border-gray-800">
          <LiveChat messages={chatMessages} onSendMessage={handleSendMessage} />
        </aside>
      </div>
    </div>
  );
}
