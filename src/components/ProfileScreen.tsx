
import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronRight,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface ProfileScreenProps {
  onNavigateTab: (tab: any) => void;
  onOpenMyTeam: () => void;
  onOpenSettings: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateTab,
  onOpenMyTeam,
  onOpenSettings,
}) => {
  const { currentUser, isAdmin, updateProfile } = useAuth();
  const { matches } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editTeam, setEditTeam] = useState(currentUser?.teamName || '');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const myMatchesCount = matches.filter(
    (m) =>
      m.createdBy === currentUser?.uid ||
      m.teams.some((t) => t.teamName === currentUser?.teamName)
  ).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    try {
      await updateProfile({
        name: editName,
        phone: editPhone,
        teamName: editTeam,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Gagal menyimpan profil:', error);
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Profil gagal disimpan. Silakan coba lagi.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <div className="px-4 pt-1 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Profil</h2>
        <span className="text-xs text-gray-400">
          ID: {currentUser?.uid?.substring(0, 8)}
        </span>
      </div>

      <div className="px-4">
        <div className="bg-[#121722] border border-gray-800 rounded-3xl p-5 flex flex-col items-center text-center shadow-xl">
          <div className="relative mb-3">
            <img
              src={
                currentUser?.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
              }
              alt={currentUser?.name || 'User'}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 shadow-lg"
            />
            <div
              className={`absolute bottom-0 right-0 p-1.5 rounded-full border-2 border-[#121722] ${
                isAdmin
                  ? 'bg-amber-500 text-black'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {isAdmin ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
            </div>
          </div>

          <h3 className="text-base font-extrabold text-white">
            {currentUser?.name || 'Pemain Arashi'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {currentUser?.phone || 'Nomor WhatsApp belum diisi'}
          </p>

          <div className="mt-2.5">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>AKSES ADMIN</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AKSES ANGGOTA</span>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              setEditName(currentUser?.name || '');
              setEditPhone(currentUser?.phone || '');
              setEditTeam(currentUser?.teamName || '');
              setSaveError('');
              setIsEditing(true);
            }}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-750 text-white font-semibold text-xs border border-gray-700 transition-colors"
          >
            Edit Profil
          </button>
        </div>
      </div>

      <div className="px-4">
        <div
          className={`p-4 rounded-2xl border ${
            isAdmin
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
              : 'bg-blue-950/20 border-blue-500/30 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-extrabold uppercase tracking-wide">
              Informasi Hak Akses
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {isAdmin ? (
              <>
                <strong>Peran Admin:</strong> Akun ini ditetapkan sebagai
                admin. Menu dan tindakan pengelolaan admin hanya boleh
                digunakan oleh akun yang memiliki izin.
              </>
            ) : (
              <>
                <strong>Peran Anggota:</strong> Kamu dapat menggunakan fitur
                sparring, mengikuti pertandingan, mengelola tim sesuai izin,
                dan berkirim pesan. Peran admin tidak dapat diaktifkan dari
                halaman profil.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="px-4 space-y-2">
        <button
          type="button"
          onClick={onOpenMyTeam}
          className="w-full text-left bg-[#121722] hover:bg-gray-800/80 border border-gray-800 rounded-2xl p-3.5 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-800 text-gray-300">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-white">Tim Saya</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('cari')}
          className="w-full text-left bg-[#121722] hover:bg-gray-800/80 border border-gray-800 rounded-2xl p-3.5 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-800 text-gray-300">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-white">
              Pertandingan Saya
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-bold">
              {myMatchesCount}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('pesan')}
          className="w-full text-left bg-[#121722] hover:bg-gray-800/80 border border-gray-800 rounded-2xl p-3.5 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-800 text-gray-300">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-white">Pesan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full text-left bg-[#121722] hover:bg-gray-800/80 border border-gray-800 rounded-2xl p-3.5 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gray-800 text-gray-300">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-white">
              Pengaturan
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#141b27] border border-gray-800 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-bold text-white text-sm">Edit Profil Saya</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Tutup edit profil"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Nama Tim
                </label>
                <input
                  type="text"
                  value={editTeam}
                  onChange={(e) => setEditTeam(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>

              {saveError && (
                <p className="text-red-400" role="alert">
                  {saveError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300"
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-black font-bold disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
