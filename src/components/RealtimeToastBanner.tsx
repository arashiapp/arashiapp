import React, { useEffect } from 'react';
import { Bell, X, ArrowRight, Radio } from 'lucide-react';
import { NotificationItem } from '../types';

interface RealtimeToastBannerProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  onViewMatch?: (matchId: string) => void;
}

export const RealtimeToastBanner: React.FC<RealtimeToastBannerProps> = ({
  notification,
  onDismiss,
  onViewMatch
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-14 left-4 right-4 z-50 max-w-md mx-auto animate-bounce-in">
      <div className="bg-[#141a24] border border-emerald-500/50 shadow-2xl shadow-emerald-950/50 rounded-2xl p-3.5 text-white flex items-start gap-3 backdrop-blur-md">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
              Pembaruan Real-Time
            </span>
            <span className="text-[11px] text-gray-400">• Baru saja</span>
          </div>
          <h4 className="text-sm font-bold text-gray-100 truncate mt-0.5">{notification.title}</h4>
          <p className="text-xs text-gray-300 line-clamp-2 mt-0.5">{notification.message}</p>

          {notification.relatedMatchId && onViewMatch && (
            <button
              onClick={() => {
                onViewMatch(notification.relatedMatchId!);
                onDismiss();
              }}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <span>Lihat Detail Pertandingan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
