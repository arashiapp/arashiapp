import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Trophy, 
  BarChart2, 
  FileText, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  ArrowLeft,
  ExternalLink,
  Phone,
  Star,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string | null;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  initialSection = null
}) => {
  const { venues, tournaments, teams } = useApp();
  const [activeSubView, setActiveSubView] = useState<string | null>(initialSection);

  if (!isOpen) return null;

  const menuItems = [
    { id: 'lapangan', title: 'Lapangan Terdekat', icon: MapPin },
    { id: 'turnamen', title: 'Turnamen', icon: Trophy },
    { id: 'ranking', title: 'Ranking Tim', icon: BarChart2 },
    { id: 'berita', title: 'Berita & Info', icon: FileText },
    { id: 'bantuan', title: 'Bantuan', icon: HelpCircle },
    { id: 'tentang', title: 'Tentang Arashi SparringHub', icon: Info },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#111622] border border-gray-800 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            {activeSubView ? (
              <button
                onClick={() => setActiveSubView(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}
            <h3 className="font-bold text-base text-white">
              {activeSubView === 'lapangan' ? 'Lapangan Terdekat' :
               activeSubView === 'turnamen' ? 'Turnamen & Kejuaraan' :
               activeSubView === 'ranking' ? 'Ranking Tim' :
               activeSubView === 'berita' ? 'Berita & Info Komunitas' :
               activeSubView === 'bantuan' ? 'Pusat Bantuan & FAQ' :
               activeSubView === 'tentang' ? 'Tentang Arashi SparringHub' : 'Menu Lainnya'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Default List matching screenshot */}
          {!activeSubView && (
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveSubView(item.id)}
                    className="bg-[#141b27] hover:bg-gray-800/90 border border-gray-800 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gray-800 text-gray-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-white">{item.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Subview: Lapangan Terdekat */}
          {activeSubView === 'lapangan' && (
            <div className="space-y-3">
              {venues.map((venue) => (
                <div key={venue.id} className="bg-[#141b27] border border-gray-800 rounded-2xl overflow-hidden">
                  <img src={venue.imageUrl} alt={venue.name} className="w-full h-32 object-cover" />
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{venue.name}</h4>
                        <p className="text-xs text-gray-400">{venue.address}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-0.5 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{venue.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pt-1 border-t border-gray-800">
                      <span>{venue.priceRange}</span>
                      <a
                        href={`https://wa.me/${venue.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>Booking</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subview: Turnamen */}
          {activeSubView === 'turnamen' && (
            <div className="space-y-3">
              {tournaments.map((t) => (
                <div key={t.id} className="bg-[#141b27] border border-gray-800 rounded-2xl overflow-hidden">
                  <img src={t.bannerUrl} alt={t.title} className="w-full h-28 object-cover" />
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white">{t.title}</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-amber-400 font-bold">{t.prize}</p>
                    <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-800">
                      <span>📅 {t.date}</span>
                      <span>{t.teamsRegistered}/{t.maxTeams} Tim Terdaftar</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subview: Ranking Tim */}
          {activeSubView === 'ranking' && (
            <div className="space-y-2">
              {teams.map((team, idx) => (
                <div key={team.id} className="bg-[#141b27] border border-gray-800 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-black text-sm ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-gray-300' : 'text-gray-500'}`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white">{team.name}</h5>
                      <p className="text-[10px] text-gray-400">{team.city} • {team.membersCount} Anggota</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-black text-emerald-400">{team.stats?.won || 0}W</span>
                    <span className="text-gray-500"> - </span>
                    <span className="font-semibold text-gray-400">{team.stats?.drawn || 0}D</span>
                    <span className="text-gray-500"> - </span>
                    <span className="font-semibold text-red-400">{team.stats?.lost || 0}L</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subview: Berita & Info */}
          {activeSubView === 'berita' && (
            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <div className="bg-[#141b27] border border-gray-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold">TIPS SPARRING</span>
                <h4 className="text-sm font-bold text-white">Etika Sparring dan Fair Play di Lapangan</h4>
                <p className="text-gray-400">Pastikan konfirmasi sewa lapangan dilakukan bersama dan biaya dibagi adil. Jaga sportivitas!</p>
              </div>
              <div className="bg-[#141b27] border border-gray-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-blue-400 font-bold">INFO KOMUNITAS</span>
                <h4 className="text-sm font-bold text-white">Peraturan Standar Mini Soccer 7 vs 7</h4>
                <p className="text-gray-400">Aturan offside dan lemparan ke dalam pada mini soccer lapangan sintetis terbaru.</p>
              </div>
            </div>
          )}

          {/* Subview: Bantuan */}
          {activeSubView === 'bantuan' && (
            <div className="space-y-3 text-xs text-gray-300">
              <div className="bg-[#141b27] border border-gray-800 rounded-2xl p-3.5 space-y-1">
                <h5 className="font-bold text-white">Bagaimana cara menantang tim sparring?</h5>
                <p className="text-gray-400">Buka menu Pertandingan, pilih jadwal yang sesuai, lalu tekan "Gabung Pertandingan" atau gunakan tombol WhatsApp untuk langsung menghubungi kapten lawan.</p>
              </div>
              <div className="bg-[#141b27] border border-gray-800 rounded-2xl p-3.5 space-y-1">
                <h5 className="font-bold text-white">Apa perbedaan Akses Admin dan Anggota?</h5>
                <p className="text-gray-400">Admin memiliki wewenang penuh untuk mengubah status, menghapus jadwal, memoderasi pesan, dan menyiarkan notifikasi broadcast real-time.</p>
              </div>
            </div>
          )}

          {/* Subview: Tentang */}
          {activeSubView === 'tentang' && (
            <div className="text-center py-4 space-y-3 text-xs text-gray-300">
              <div className="w-12 h-12 rounded-2xl bg-white text-black font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
                A
              </div>
              <h4 className="text-base font-extrabold text-white">Arashi SparringHub</h4>
              <p className="text-gray-400 max-w-xs mx-auto">
                Platform komunitas futsal, mini soccer, dan sepak bola antar kampung pertama di Bekasi & Cikarang dengan sinkronisasi database instan lintas perangkat.
              </p>
              <div className="pt-2 text-[11px] text-emerald-400 font-medium">
                ⚡ Powered by Firebase Firestore Real-Time Database
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
