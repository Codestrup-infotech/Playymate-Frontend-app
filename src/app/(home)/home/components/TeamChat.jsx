'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getMyTeams, 
  getTeamChatInfo, 
  getTeamChatMembers, 
  getTeamChatMessages, 
  sendTeamChatMessage,
  reactToMessage,
  deleteTeamChatMessage,
  editTeamChatMessage,
  markMessagesAsRead,
  createThreadReply,
  getThreadReplies,
  searchTeamChatMessages
} from '@/lib/api/teamApi';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👀'];

export default function TeamChat({ teamId: initialTeamId, teamName: initialTeamName, userId: initialUserId }) {
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
  const [currentUserId, setCurrentUserId] = useState(initialUserId || null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [showThreadView, setShowThreadView] = useState(null);
  const [threadReplies, setThreadReplies] = useState([]);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [mentionCursorPosition, setMentionCursorPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      setCurrentUserId(userId);
    }
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      const chatBox = document.getElementById('team-chat-box');
      const chatButton = document.getElementById('team-chat-button');
      if (chatBox && !chatBox.contains(e.target) && !chatButton?.contains(e.target)) {
        setIsOpen(false);
        setShowReactionPicker(null);
        setShowMentionPopup(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const fetchUserTeams = async () => {
    try {
      const userId = getCurrentUserId();
      console.log('Setting currentUserId from fetchUserTeams:', userId);
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

      await markMessagesAsRead(teamId, {});
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
      let messageContent = newMessage.trim();
      const data = {
        content: messageContent,
        message_type: 'text'
      };

      if (replyingTo) {
        data.reply_to = replyingTo._id;
      }

      if (editingMessage) {
        const response = await editTeamChatMessage(teamId, editingMessage._id, { content: messageContent });
        if (response.status === 'success') {
          setMessages(prev => prev.map(m => 
            m._id === editingMessage._id ? response.data : m
          ));
        }
        setNewMessage('');
        setEditingMessage(null);
        setReplyingTo(null);
        return;
      }

      const response = await sendTeamChatMessage(teamId, data);

      if (response.status === 'success') {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setEditingMessage(null);
    messageInputRef.current?.focus();
  };

  const handleEdit = (message) => {
    if (!canEditMessage(message)) return;
    setEditingMessage(message);
    setNewMessage(message.content);
    setReplyingTo(null);
    messageInputRef.current?.focus();
  };

  const handleDelete = async (messageId) => {
    try {
      const response = await deleteTeamChatMessage(teamId, messageId);
      if (response.status === 'success') {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
    setHoveredMessage(null);
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const response = await reactToMessage(teamId, messageId, { emoji });
      if (response.status === 'success') {
        setMessages(prev => prev.map(m => 
          m._id === messageId ? response.data : m
        ));
      }
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
    setShowReactionPicker(null);
  };

  const canEditMessage = (message) => {
    const createdAt = new Date(message.created_at);
    const now = new Date();
    const diffMinutes = (now - createdAt) / (1000 * 60);
   

    const senderId = message.sender_id?._id?.toString();
const currentUid = getCurrentUserId()?.toString();


    const isOwner = senderId === currentUid;
    return isOwner && diffMinutes <= 15;
  };

  const fetchThreadReplies = async (messageId) => {
    try {
      const response = await getThreadReplies(teamId, messageId);
      if (response.status === 'success') {
        setThreadReplies(response.data.replies || []);
      }
    } catch (error) {
      console.error('Error fetching thread replies:', error);
    }
  };

  const handleViewThread = async (message) => {
    setShowThreadView(message);
    await fetchThreadReplies(message._id);
  };

  const handleSendThreadReply = async () => {
    if (!newMessage.trim() || !showThreadView) return;

    try {
      const response = await createThreadReply(teamId, showThreadView._id, {
        content: newMessage.trim(),
        message_type: 'text'
      });

      if (response.status === 'success') {
        setThreadReplies(prev => [...prev, response.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending thread reply:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await searchTeamChatMessages(teamId, { q: searchQuery });
      if (response.status === 'success') {
        setSearchResults(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showThreadView) {
        handleSendThreadReply();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setMentionCursorPosition(cursorPos);
      setFilteredMembers(
        members.filter(m => 
          m.user_id?.full_name?.toLowerCase().includes(mentionMatch[1].toLowerCase()) ||
          m.user_id?.username?.toLowerCase().includes(mentionMatch[1].toLowerCase())
        )
      );
      setShowMentionPopup(true);
    } else {
      setShowMentionPopup(false);
    }
  };

  const selectMention = (member) => {
    const textBeforeCursor = newMessage.slice(0, mentionCursorPosition);
    const textAfterCursor = newMessage.slice(mentionCursorPosition);
    const newTextBefore = textBeforeCursor.replace(/@(\w*)$/, `@${member.user_id?.username || member.user_id?.full_name} `);
    setNewMessage(newTextBefore + textAfterCursor);
    setShowMentionPopup(false);
    messageInputRef.current?.focus();
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

  const getCurrentUserId = () => {
  if (currentUserId) {
    return currentUserId;
  }
  
  let uid = localStorage.getItem('user_id');
  
  if (!uid) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    uid = user?.user_id || user?._id;
  }
  
  if (!uid) {
    const sessUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    uid = sessUser?.user_id || sessUser?._id;
  }

  if (!uid) {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        uid = payload.sub;
      } catch (e) {
        console.log('Error decoding token:', e);
      }
    }
  }

  return uid?.toString();
};

 const isCurrentUserMessage = (message) => {
  const senderId = message.sender_id?._id?.toString();
  const currentUid = getCurrentUserId()?.toString();

  return senderId === currentUid;
};

  const selectTeam = (selectedTeamId) => {
    setTeamId(selectedTeamId);
    setShowTeamSelector(false);
    setShowThreadView(null);
    setReplyingTo(null);
    setEditingMessage(null);
    if (isOpen) {
      fetchChatData();
    }
  };

  const getSelectedTeamName = () => {
    if (teamName) return teamName;
    const team = teams.find(t => (t._id || t.id) === teamId);
    return team?.name || 'Team Chat';
  };

  const highlightMentions = (content) => {
    return content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>');
  };

  const renderMessageContent = (message) => {
    const hasReplies = message.reply_count > 0;
    
    return (
      <div className="flex flex-col">
        <div dangerouslySetInnerHTML={{ __html: highlightMentions(message.content) }} />
        {message.is_edited && (
          <span className="text-xs text-gray-400 mt-1">(edited)</span>
        )}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((r, idx) => (
              <span key={idx} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        )}
        {hasReplies && (
          <button 
            onClick={() => handleViewThread(message)}
            className="text-xs text-blue-600 mt-1 hover:underline"
          >
            {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>
    );
  };

  const renderThreadView = () => {
    if (!showThreadView) return null;

    return (
      <div className="absolute inset-0 bg-white flex flex-col z-10">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#EF3AFF] to-[#FF8319]">
          <button onClick={() => setShowThreadView(null)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-white font-semibold">Thread</h3>
          <div className="w-5" />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {showThreadView.sender_id?.profile_image_url ? (
                <img src={showThreadView.sender_id.profile_image_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-blue-600 text-xs">{getInitials(showThreadView.sender_id?.full_name)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{showThreadView.sender_id?.full_name}</span>
                <span className="text-xs text-gray-400">{formatTime(showThreadView.created_at)}</span>
              </div>
              <div className="text-sm mt-1">{showThreadView.content}</div>
            </div>
          </div>
          {threadReplies.map((reply) => (
            <div key={reply._id} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                {reply.sender_id?.profile_image_url ? (
                  <img src={reply.sender_id.profile_image_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-blue-600 text-xs">{getInitials(reply.sender_id?.full_name)}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{reply.sender_id?.full_name}</span>
                  <span className="text-xs text-gray-400">{formatTime(reply.created_at)}</span>
                </div>
                <div className="text-sm mt-1">{reply.content}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Reply to thread..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              onClick={handleSendThreadReply}
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-10 z-50">
      {!isOpen && (
        <button
          id="team-chat-button"
          onClick={() => setIsOpen(true)}
          className="h-10 w-32 bg-white/90 hover:bg-gradient-to-tr hover:from-[#EF3AFF] hover:to-[#FF8319] text-blue-500 hover:text-white rounded-full shadow-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-semibold">{getSelectedTeamName()}</h3>
                <p className="text-blue-200 text-xs">{members.length} members</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {teams.length > 1 && (
                <button
                  onClick={() => setShowTeamSelector(!showTeamSelector)}
                  className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-black hover:bg-white p-2 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="p-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search messages..."
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="text-blue-600 p-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

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

          {showSearch && searchResults.length > 0 && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-64">
              <div className="text-xs text-gray-500 mb-2">Search Results ({searchResults.length})</div>
              {searchResults.map((message) => (
                <div key={message._id} className="flex gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xs">{getInitials(message.sender_id?.full_name)}</span>
                  </div>
                  <div>
                    <div className="text-xs font-medium">{message.sender_id?.full_name}</div>
                    <div className="text-sm text-gray-600">{message.content}</div>
                    <div className="text-xs text-gray-400">{formatTime(message.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showSearch && (
            <>
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
                messages.map((message) => {
  const senderIdStr = message.sender_id?._id?.toString();
  const currentUidStr = getCurrentUserId()?.toString();
  const isOwn = senderIdStr === currentUidStr;
  console.log("CURRENT USER:", currentUidStr, "MESSAGE SENDER:", senderIdStr, "IS OWN:", isOwn);

  return (
    <div
      key={message._id}
      className={`flex gap-3 group ${isCurrentUserMessage(message) ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setHoveredMessage(message._id)}
      onMouseLeave={() => {
        setHoveredMessage(null);
        setShowReactionPicker(null);
      }}
    >
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        {message.sender_id?.profile_image_url ? (
          <img
            src={message.sender_id.profile_image_url}
            alt={message.sender_id.full_name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-blue-600 text-xs font-medium">
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

        {message.reply_to && (
          <div className="text-xs text-gray-500 border-l-2 border-blue-300 pl-2 mb-1">
            Replying to {message.reply_to.sender_id?.full_name}
          </div>
        )}

        <div
          className={`max-w-[200px] px-3 py-2 rounded-lg text-sm relative ${
            isCurrentUserMessage(message)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {renderMessageContent(message)}

          {hoveredMessage === message._id && (
            <div
              className={`absolute top-0 ${
                isCurrentUserMessage(message) ? 'left-0' : 'right-0'
              } translate-y-[-100%] flex bg-white rounded-lg shadow-md p-1 gap-1 z-10`}
            >
              {isCurrentUserMessage(message) ? (
                <>
                  {canEditMessage(message) && (
                    <button
                      onClick={() => handleEdit(message)}
                      className="text-xs px-2 py-1 hover:bg-gray-100 rounded text-gray-600"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(message._id)}
                    className="text-xs px-2 py-1 hover:bg-red-100 rounded text-red-600"
                  >
                    Del
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleReply(message)}
                    className="text-xs px-2 py-1 hover:bg-gray-100 rounded text-gray-600"
                  >
                    Reply
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowReactionPicker(message._id)}
                      className="text-xs px-2 py-1 hover:bg-gray-100 rounded text-gray-600"
                    >
                      😃
                    </button>

                    {showReactionPicker === message._id && (
                      <div className="absolute top-full left-0 bg-white rounded-lg shadow-lg p-2 flex gap-1 z-20">
                        {EMOJI_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(message._id, emoji)}
                            className="text-lg hover:bg-gray-100 p-1 rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
})
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200">
                {replyingTo && (
                  <div className="flex items-center justify-between mb-2 bg-blue-50 rounded-lg px-3 py-2">
                    <div className="text-xs">
                      <span className="text-gray-500">Replying to </span>
                      <span className="text-blue-600 font-medium">{replyingTo.sender_id?.full_name}</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {editingMessage && (
                  <div className="flex items-center justify-between mb-2 bg-blue-50 rounded-lg px-3 py-2">
                    <div className="text-xs text-blue-600">
                      Editing message
                    </div>
                    <button onClick={() => setEditingMessage(null)} className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="relative flex items-center gap-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={replyingTo ? "Write a reply..." : "Type a message... (@mention)"}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
                  />
                  {showMentionPopup && filteredMembers.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-1 w-full max-h-32 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                      {filteredMembers.slice(0, 5).map((member) => (
                        <button
                          key={member.user_id?._id || member.user_id?.user_id}
                          onClick={() => selectMention(member)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xs">
                              {getInitials(member.user_id?.full_name)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-700">
                            {member.user_id?.full_name}
                          </span>
                          <span className="text-xs text-gray-400">
                            @{member.user_id?.username}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}

          {renderThreadView()}
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