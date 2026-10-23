import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  Shield, 
  MessageCircle, 
  Share2, 
  ExternalLink,
  Trash2,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MatchStatus } from '../types';

interface MatchDetailModalProps {
  matchId: string;
  onClose: () => void;
  onOpenChatWithTeam?: (teamId: string, teamName: string) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  matchId,
  onClose,
  onOpenChatWithTeam
}) => {
  const { matches, joinMatch, leaveMatch, updateMatchStatus, deleteMatch, myTeam } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [isJoining, setIsJoining] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const match = matches.find((m) => m.id === matchId);

  if (!match) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-[#121722] p-6 rounded-2xl border border-gray-800 text-center max-w-sm w-full">
          <p className="text-gray-300 mb-4">Pertandingan tidak ditemukan atau telah dihapus.</p>
          <button onClick={onClose} className="px-4 py-2 bg-white text-black font-bold rounded-xl text-xs">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const isUserTeamJoined = match.teams.some((t) => t.teamId === myTeam?.id);
  const isCreator = match.createdBy === currentUser?.uid;
  const canJoin = !isUserTeamJoined && match.teams.length < 2 && match.status === 'terbuka';

  const handleJoin = async () => {
    setIsJoining(true);
    setActionMessage(null);
    try {
      await joinMatch(match.id, {
        teamId: myTeam?.id || `team-${Date.now()}`,
        teamName: myTeam?.name || currentUser?.teamName || 'Skuad Tamu',
        captainName: currentUser?.name || 'Kapten',
        captainPhone: currentUser?.phone || '+6281234567890'
      });
      setActionMessage('Berhasil bergabung ke pertandingan! Lawan telah diberi tahu.');
    } catch (err: any) {
      setActionMessage(err.message || 'Gagal bergabung.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan keikutsertaan tim dalam sparring ini?')) return;
    try {
      await leaveMatch(match.id, myTeam?.id || '');
      setActionMessage('Keikutsertaan berhasil dibatalkan.');
    } catch (err: any) {
      setActionMessage(err.message || 'Gagal membatalkan.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus pertandingan ini dari database secara permanen?')) return;
    try {
      await deleteMatch(match.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pertandingan.');
    }
  };

  const handleStatusChange = async (newStatus: MatchStatus) => {
    try {
      await updateMatchStatus(match.id, newStatus);
      setShowAdminMenu(false);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status.');
    }
  };

  // WhatsApp sparring chat integration
  const contactPhone = match.creatorPhone || match.teams[0]?.captainPhone || '6281234567890';
  const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(
    `Halo Kapten, saya dari tim ${myTeam?.name || 'SparringHub'} tertarik untuk sparring di "${match.title}" pada ${match.date} di ${match.location}. Apakah jadwal masih aman?`
  );
  const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${waText}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0f17] overflow-y-auto animate-fade-in flex flex-col justify-between">
      {/* Top Bar matching screenshot */}
      <div className="sticky top-0 z-30 bg-[#0c0f17]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-white tracking-tight">Detail Pertandingan</h2>

        <div className="relative">
          <button
            onClick={() => setShowAdminMenu(!showAdminMenu)}
            className="p-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
            aria-label="Menu Opsi"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* More / Admin Controls Menu */}
          {showAdminMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#161d2b] border border-gray-700 rounded-2xl p-2 shadow-2xl z-40 text-xs space-y-1">
              <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-700/60">
                {isAdmin ? 'Opsi Admin (Akses Penuh)' : 'Opsi Pertandingan'}
              </div>

              {isAdmin && (
                <>
                  <div className="px-2 py-1 text-[11px] font-semibold text-amber-400">
                    Ubah Status Pertandingan:
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {(['terbuka', 'penuh', 'selesai', 'dibatalkan'] as MatchStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-2 py-1 rounded text-[11px] capitalize text-left transition-colors ${
                          match.status === st ? 'bg-amber-500 text-black font-bold' : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {(isAdmin || isCreator) && (
                <button
                  onClick={handleDelete}
                  className="w-full mt-2 px-2.5 py-1.5 rounded-lg text-left text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Pertandingan</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 pb-24">
        {/* Arena Hero Image matching screenshot */}
        <div className="relative w-full h-56 sm:h-64 bg-gray-900">
          <img
            src={match.imageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80'}
            alt={match.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f17] via-transparent to-black/30" />

          {/* Type Badge on Top Left */}
          <div className="absolute top-4 left-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/70 text-white backdrop-blur-md border border-white/20">
              {match.type === 'futsal' ? 'Futsal' : match.type === 'mini_soccer' ? 'Mini Soccer' : 'Antar Kampung'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-4 -mt-4 relative z-10 space-y-4">
          {actionMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Title & Status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {match.title}
              </h1>
              <p className="text-xs text-gray-400 mt-1">Dibuat oleh: <span className="text-gray-200 font-semibold">{match.creatorName}</span></p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase shrink-0 border ${
              match.status === 'terbuka'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : match.status === 'penuh'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}>
              {match.status}
            </span>
          </div>

          {/* Details Info List matching screenshot */}
          <div className="bg-[#121722] border border-gray-800 rounded-2xl p-4 space-y-3 text-xs">
            {/* Date & Time */}
            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-100">{match.date}</span>
            </div>

            {/* Location & "Lihat Lokasi" */}
            <div className="flex items-center justify-between gap-2 text-gray-300">
              <div className="flex items-center gap-3 truncate">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{match.location}</span>
              </div>
              <button
                onClick={() => setShowLocationModal(true)}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-semibold text-gray-200 border border-gray-700 shrink-0 transition-colors"
              >
                Lihat Lokasi
              </button>
            </div>

            {/* Format (5 vs 5) */}
            <div className="flex items-center gap-3 text-gray-300">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{match.format}</span>
            </div>

            {/* Current Teams (2/2 Tim) */}
            <div className="flex items-center gap-3 text-gray-300">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{match.currentTeams}/{match.targetTeams} Tim</span>
            </div>

            {/* Level */}
            <div className="flex items-center gap-3 text-gray-300">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Level: <strong className="text-white">{match.level}</strong></span>
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-gray-800 text-gray-300 leading-relaxed">
              <p>{match.description}</p>
            </div>
          </div>

          {/* Tim yang Bergabung Section matching screenshot */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-bold text-white tracking-wide">Tim yang Bergabung</h3>
              <span className="text-xs text-gray-400 font-semibold">{match.currentTeams}/2</span>
            </div>

            <div className="space-y-2">
              {match.teams.map((team, idx) => (
                <div
                  key={team.teamId || idx}
                  className="bg-[#121722] border border-gray-800 rounded-2xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-lg font-bold">
                      {idx === 0 ? '🛡️' : '⚡'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{team.teamName}</h4>
                      <p className="text-[11px] text-gray-400">Kapten: <span className="text-gray-300 font-medium">{team.captainName}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold border border-gray-700">
                      Tim {team.slot || idx + 1}
                    </span>
                    {onOpenChatWithTeam && (
                      <button
                        onClick={() => onOpenChatWithTeam(team.teamId, team.teamName)}
                        className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
                        title="Kirim pesan langsung ke tim"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {match.teams.length < 2 && (
                <div className="border border-dashed border-gray-800 rounded-2xl p-4 text-center text-xs text-gray-500">
                  Slot Tim 2 masih kosong. Tunggu penantang atau gabung sekarang.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar matching screenshot: "Hubungi via WhatsApp" */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f17]/95 backdrop-blur-md border-t border-gray-800 p-3 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        <div className="flex items-center gap-2">
          {canJoin && (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-gray-100 text-black font-extrabold text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isJoining ? 'Mendaftarkan...' : 'Gabung Pertandingan'}</span>
            </button>
          )}

          {isUserTeamJoined && (
            <button
              onClick={handleLeave}
              className="flex-1 py-3 px-4 rounded-2xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 font-bold text-xs transition-colors"
            >
              Batalkan Keikutsertaan
            </button>
          )}

          {/* WhatsApp Direct Action Button matching screenshot */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-2xl bg-gray-850 hover:bg-gray-800 text-white font-bold text-xs sm:text-sm border border-gray-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span>Hubungi via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Venue Location Details Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="bg-[#121722] border border-gray-800 rounded-2xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-bold text-white text-sm">Informasi Lokasi</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-400">{match.location}</h4>
              <p className="text-xs text-gray-300 mt-1">{match.locationDetail || 'Lokasi pertandingan sparring resmi.'}</p>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <a
                href={match.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(match.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-black font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
