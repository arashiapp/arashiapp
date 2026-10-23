import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Send, Radio, Shield, Sparkles, X, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMatch?: (matchId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectMatch
}) => {
  const { 
    notifications, 
    markAllNotificationsAsRead, 
    markNotificationAsRead, 
    clearAllNotifications,
    sendNotification 
  } = useApp();
  const { isAdmin, currentUser } = useAuth();

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setIsSending(true);
    try {
      await sendNotification(
        `📢 ${broadcastTitle.trim()}`,
        broadcastMessage.trim(),
        'announcement'
      );
      setBroadcastTitle('');
      setBroadcastMessage('');
      setShowBroadcastForm(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#111622] border-t sm:border border-gray-800 sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Notifikasi Real-Time</h3>
              <p className="text-xs text-gray-400">Sinkronisasi langsung semua aktivitas perangkat</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Admin Broadcast Toggle */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/60 border-b border-gray-800/80 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="flex items-center gap-1 text-gray-300 hover:text-emerald-400 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => clearAllNotifications()}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua</span>
              </button>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowBroadcastForm(!showBroadcastForm)}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{showBroadcastForm ? 'Tutup Form' : 'Broadcast Admin'}</span>
            </button>
          )}
        </div>

        {/* Admin Broadcast Box */}
        {isAdmin && showBroadcastForm && (
          <form onSubmit={handleBroadcast} className="p-4 bg-amber-950/20 border-b border-amber-500/30">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs">
              <Shield className="w-4 h-4" />
              <span>Kirim Pengumuman Broadcast ke Semua Perangkat</span>
            </div>
            <input
              type="text"
              placeholder="Judul Pengumuman (contoh: Turnamen Futsal Segera Dimulai)"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 mb-2"
              required
            />
            <textarea
              placeholder="Pesan pengumuman real-time untuk semua anggota..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={2}
              className="w-full text-xs px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 mb-2 resize-none"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Mengirim...' : 'Kirim Sekarang'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/60 p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Belum ada notifikasi aktivitas.
            </div>
          ) : (
            notifications.map((item) => {
              const isRead = item.readBy?.includes(currentUser?.uid || '');
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    markNotificationAsRead(item.id);
                    if (item.relatedMatchId && onSelectMatch) {
                      onSelectMatch(item.relatedMatchId);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isRead 
                      ? 'bg-transparent hover:bg-gray-850/60 opacity-80' 
                      : 'bg-gray-800/50 hover:bg-gray-800 border-l-4 border-emerald-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.type === 'match_created' ? 'bg-blue-500/20 text-blue-300' :
                          item.type === 'match_joined' ? 'bg-emerald-500/20 text-emerald-300' :
                          item.type === 'announcement' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {item.type === 'match_created' ? 'Pertandingan Baru' :
                           item.type === 'match_joined' ? 'Lawan Ditemukan' :
                           item.type === 'announcement' ? 'Pengumuman' : 'Pembaruan'}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {item.createdAt}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-100 mt-1">{item.title}</h4>
                      <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{item.message}</p>
                    </div>

                    {item.relatedMatchId && (
                      <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 self-center" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 text-center text-[11px] text-gray-400 bg-gray-900/40">
          Notifikasi disiarkan ke semua browser dan perangkat secara instan melalui Firestore.
        </div>
      </div>
    </div>
  );
};
