import React, { useState } from 'react';
import { Send, ArrowLeft, MoreVertical, MessageSquare, CheckCheck, Users, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MessageItem } from '../types';

interface MessagesScreenProps {
  initialChannelId?: string;
  initialChannelName?: string;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  initialChannelId,
  initialChannelName
}) => {
  const { messages, sendMessage } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [activeChannelId, setActiveChannelId] = useState<string | null>(initialChannelId || null);
  const [activeChannelName, setActiveChannelName] = useState<string>(initialChannelName || '');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Channels matching screenshot
  const channels = [
    {
      id: 'team-sukatani',
      name: 'Sukatani Squad',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Siap sparring besok?',
      time: '19:24',
      unread: true,
      category: 'Antar Kampung'
    },
    {
      id: 'team-cibitung',
      name: 'Cibitung United',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Bisa hari Sabtu?',
      time: '16:10',
      unread: false,
      category: 'Mini Soccer'
    },
    {
      id: 'team-minisoccer-bekasi',
      name: 'Mini Soccer Bekasi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Lokasi aman ya?',
      time: '12:30',
      unread: false,
      category: 'Mini Soccer'
    },
    {
      id: 'team-karang-taruna',
      name: 'Karang Taruna FC',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Papan skor dan wasit sudah siap.',
      time: '10:12',
      unread: false,
      category: 'Futsal'
    }
  ];

  const handleOpenChannel = (channelId: string, channelName: string) => {
    setActiveChannelId(channelId);
    setActiveChannelName(channelName);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChannelId) return;

    setIsSending(true);
    const textToSend = inputText.trim();
    setInputText('');
    try {
      await sendMessage(activeChannelId, activeChannelName, textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // Channel conversation view
  if (activeChannelId) {
    const channelMessages = messages.filter((m) => m.channelId === activeChannelId);

    return (
      <div className="flex flex-col h-[calc(100vh-130px)] bg-[#0c0f17] animate-fade-in">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-[#121722] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveChannelId(null)}
              className="p-1 rounded-lg text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-sm text-white">{activeChannelName}</h3>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sinkron Real-time Antar Perangkat
              </span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white p-1">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Sparring quick prompt */}
          <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-2xl text-center text-xs text-gray-400">
            💬 Saluran koordinasi jadwal dan sparring resmi dengan {activeChannelName}.
          </div>

          {channelMessages.map((msg) => {
            const isMe = msg.senderId === currentUser?.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400">
                  <span className="font-bold text-gray-300">{msg.senderName}</span>
                  {msg.senderRole === 'admin' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px]">
                      ADMIN
                    </span>
                  )}
                  <span>• {msg.createdAt}</span>
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-white text-black font-medium rounded-br-none shadow-md'
                      : 'bg-[#182030] text-gray-100 rounded-bl-none border border-gray-700/60'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-[#121722] border-t border-gray-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ketik pesan sparring..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // Channel List View matching screenshot
  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <div className="px-4 pt-1 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Pesan</h2>
        <span className="text-xs text-gray-400">4 Percakapan</span>
      </div>

      <div className="px-4 space-y-2">
        {channels.map((ch) => {
          // Check if there are live messages for this channel
          const liveList = messages.filter((m) => m.channelId === ch.id);
          const latestMsg = liveList.length > 0 ? liveList[liveList.length - 1].text : ch.lastMessage;
          const latestTime = liveList.length > 0 ? liveList[liveList.length - 1].createdAt : ch.time;

          return (
            <div
              key={ch.id}
              onClick={() => handleOpenChannel(ch.id, ch.name)}
              className="bg-[#121722] hover:bg-gray-800/80 border border-gray-800 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={ch.avatar}
                    alt={ch.name}
                    className="w-11 h-11 rounded-full object-cover border border-gray-700"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#121722]" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{ch.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{latestMsg}</p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-[11px] text-gray-500 font-medium">{latestTime}</span>
                {ch.unread && liveList.length === 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
