'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getMyTeams, getTeamChatInfo, getTeamChatMembers, getTeamChatMessages, sendTeamChatMessage } from '@/lib/api/teamApi';

export default function TeamChat({ teamId: initialTeamId, teamName: initialTeamName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamId, setTeamId] = useState(initialTeamId || null);
  const [teamName, setTeamName] = useState(initialTeamName || null);
  const [teams, setTeams] = useState([]);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!teamId) {
      fetchUserTeams();
    }
  }, []);

  useEffect(() => {
    if (isOpen && teamId) {
      fetchChatData();
    }
  }, [isOpen, teamId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleClickOutside = useCallback((e) => {
    const chatBox = document.getElementById('team-chat-box');
    const chatButton = document.getElementById('team-chat-button');
    if (chatBox && !chatBox.contains(e.target) && !chatButton?.contains(e.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  const fetchUserTeams = async () => {
    try {
      const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
      if (userId) {
        setCurrentUserId(userId);
      }
      
      const response = await getMyTeams();
      const allTeams = [...(response.owned || []), ...(response.joined || [])];
      setTeams(allTeams);
      
      if (allTeams.length > 0 && !teamId) {
        setTeamId(allTeams[0]._id || allTeams[0].id);
      }
    } catch (error) {
      console.error('Error fetching user teams:', error);
    }
  };

  const fetchChatData = async () => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      const [infoRes, membersRes, messagesRes] = await Promise.all([
        getTeamChatInfo(teamId),
        getTeamChatMembers(teamId),
        getTeamChatMessages(teamId, { limit: 50 })
      ]);

      if (infoRes.status === 'success') {
        setChatInfo(infoRes.data);
        setMembers(infoRes.data.members || []);
      }

      if (membersRes.status === 'success') {
        setMembers(membersRes.data.members || []);
      }

      if (messagesRes.status === 'success') {
        setMessages(messagesRes.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !teamId) return;

    try {
      const response = await sendTeamChatMessage(teamId, {
        content: newMessage,
        message_type: 'text'
      });

      if (response.status === 'success') {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUnreadCount = () => {
    return members.reduce((total, member) => total + (member.unread_count || 0), 0);
  };

  const isCurrentUserMessage = (message) => {
    return message.sender_id?._id === currentUserId || message.sender_id?.user_id === currentUserId;
  };

  const selectTeam = (selectedTeamId) => {
    setTeamId(selectedTeamId);
    setShowTeamSelector(false);
    if (isOpen) {
      fetchChatData();
    }
  };

  const getSelectedTeamName = () => {
    if (teamName) return teamName;
    const team = teams.find(t => (t._id || t.id) === teamId);
    return team?.name || 'Team Chat';
  };

  return (
    <div className="fixed bottom-6 right-10 z-50">
      {!isOpen && (
        <button
          id="team-chat-button"
          onClick={() => setIsOpen(true)}
          className="h-10 w-32 bg-white/90  hover:bg-gradient-to-tr hover:from-[#EF3AFF] hover:to-[#FF8319] text-blue-500 hover:text-white rounded-full shadow-lg  flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium">Chat</span>
          {getUnreadCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getUnreadCount()}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div id="team-chat-box" className="animate-slideUp w-80 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-[#EF3AFF] to-[#FF8319] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-semibold">{getSelectedTeamName()}</h3>
                <p className="text-blue-200 text-xs">{members.length} members</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {teams.length > 1 && (
                <button
                  onClick={() => setShowTeamSelector(!showTeamSelector)}
                  className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-black hover:bg-white p-2 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {showTeamSelector && (
            <div className="bg-gray-50 border-b border-gray-200 p-2 max-h-32 overflow-y-auto">
              {teams.map((team) => (
                <button
                  key={team._id || team.id}
                  onClick={() => selectTeam(team._id || team.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    (team._id || team.id) === teamId
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !teamId ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No teams found</p>
                <p className="text-xs mt-1">Join a team to start chatting!</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex gap-3 ${isCurrentUserMessage(message) ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {message.sender_id?.profile_image_url ? (
                      <img
                        src={message.sender_id.profile_image_url}
                        alt={message.sender_id.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600  text-xs font-medium">
                        {getInitials(message.sender_id?.full_name)}
                      </span>
                    )}
                  </div>
                  <div className={`flex flex-col ${isCurrentUserMessage(message) ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {message.sender_id?.full_name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <div
                      className={`max-w-[200px] px-3 py-2 rounded-lg text-sm ${
                        isCurrentUserMessage(message)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}