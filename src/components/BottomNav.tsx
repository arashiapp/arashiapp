import React from 'react';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type NavTab = 'beranda' | 'cari' | 'buat' | 'pesan' | 'profil';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { messages } = useApp();

  const navItems = [
    { id: 'beranda' as NavTab, label: 'Beranda', icon: Home },
    { id: 'cari' as NavTab, label: 'Cari', icon: Search },
    { id: 'buat' as NavTab, label: 'Buat', icon: PlusCircle, highlight: true },
    { id: 'pesan' as NavTab, label: 'Pesan', icon: MessageSquare, badge: messages.length > 0 ? messages.length : undefined },
    { id: 'profil' as NavTab, label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f17]/95 backdrop-blur-lg border-t border-gray-800 px-2 py-1.5 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge && item.id === 'pesan' && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-white font-bold' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-white mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
