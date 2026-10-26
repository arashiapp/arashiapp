
import React from 'react';
import { Bell, ShieldAlert, UserCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenMoreMenu: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenMoreMenu,
  onOpenInstallModal
}) => {
  const { isAdmin } = useAuth();
  const { unreadNotificationsCount } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-[#0c0f17]/95 backdrop-blur-md border-b border-gray-800/80 px-4 py-3">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800/50 text-xs">
        <div className="flex items-center gap-1.5">
          {isAdmin ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
              <ShieldAlert className="w-3.5 h-3.5" />
              AKSES ADMIN
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/40">
              <UserCheck className="w-3.5 h-3.5" />
              AKSES ANGGOTA
            </span>
          )}
          <span className="text-gray-400 hidden sm:inline">• Sinkron Real-time</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-left"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-300 text-black font-extrabold tracking-tighter shadow-md">
            <span className="text-xl font-black italic">A</span>
          </div>
          <span className="flex flex-col">
            <span className="font-extrabold tracking-wider text-base text-white leading-none">ARASHI</span>
            <span className="text-[9px] font-semibold tracking-widest text-gray-400 uppercase leading-none mt-1">SPARRINGHUB</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-all active:scale-95"
            title="Pasang di HP / Petunjuk File APK"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Pasang HP</span>
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-gray-850 hover:bg-gray-800 border border-gray-700/60 text-gray-200 transition-all hover:scale-105 active:scale-95"
            aria-label="Notifikasi Real-time"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold ring-2 ring-[#0c0f17] animate-pulse">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
