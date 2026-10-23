import React, { useState } from 'react';
import { 
  Shield, 
  Plus, 
  MoreVertical, 
  Edit3, 
  UserPlus, 
  Calendar, 
  MapPin, 
  Users, 
  Award,
  X,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Team, TeamMember } from '../types';

interface MyTeamScreenProps {
  onViewMatches: () => void;
}

export const MyTeamScreen: React.FC<MyTeamScreenProps> = ({ onViewMatches }) => {
  const { myTeam, updateTeam, addTeamMember, matches } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Edit team form state
  const [teamName, setTeamName] = useState(myTeam?.name || 'ARASHI FC');
  const [city, setCity] = useState(myTeam?.city || 'Bekasi');
  const [bio, setBio] = useState(myTeam?.bio || '');

  // Add member form state
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('Pemain');
  const [memberPos, setMemberPos] = useState('Flank');
  const [memberNum, setMemberNum] = useState<number>(7);

  const teamMatches = matches.filter((m) =>
    m.teams.some((t) => t.teamName.toLowerCase().includes((myTeam?.name || 'arashi').toLowerCase()))
  );

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam) return;
    await updateTeam({
      ...myTeam,
      name: teamName,
      city: city,
      bio: bio
    });
    setIsEditingTeam(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam || !memberName.trim()) return;
    await addTeamMember(myTeam.id, {
      name: memberName.trim(),
      role: memberRole,
      position: memberPos,
      number: Number(memberNum) || undefined
    });
    setMemberName('');
    setIsAddingMember(false);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Header matching screenshot */}
      <div className="px-4 pt-1 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Tim Saya</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingMember(true)}
            className="p-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Tambah Anggota"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsEditingTeam(true)}
            className="p-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Pengaturan Tim"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Team Card matching screenshot */}
      <div className="px-4">
        <div className="bg-[#121722] border border-gray-800 rounded-3xl p-5 relative overflow-hidden shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Crest Logo Shield matching screenshot */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-gray-700 to-gray-900 border-2 border-gray-600 flex items-center justify-center text-3xl shadow-lg">
                <Shield className="w-9 h-9 text-gray-200 stroke-[1.5]" />
                <span className="absolute text-xs font-black tracking-tighter text-white">AFC</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white tracking-wide">{myTeam?.name || 'ARASHI FC'}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                  <span>{myTeam?.members?.length || 5} Anggota</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    {myTeam?.city || 'Bekasi'}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-gray-800 text-gray-200 border border-gray-700">
                    Kapten
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditingTeam(true)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons matching screenshot: Edit Tim, Undang Anggota, Lihat Pertandingan */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-800/80">
            <button
              onClick={() => setIsEditingTeam(true)}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-gray-850 hover:bg-gray-800 text-gray-200 border border-gray-700/60 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-gray-300 mb-1" />
              <span className="text-[11px] font-semibold">Edit Tim</span>
            </button>

            <button
              onClick={() => setIsAddingMember(true)}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-gray-850 hover:bg-gray-800 text-gray-200 border border-gray-700/60 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-gray-300 mb-1" />
              <span className="text-[11px] font-semibold">Undang Anggota</span>
            </button>

            <button
              onClick={onViewMatches}
              className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-gray-850 hover:bg-gray-800 text-gray-200 border border-gray-700/60 transition-colors"
            >
              <Calendar className="w-4 h-4 text-gray-300 mb-1" />
              <span className="text-[11px] font-semibold">Lihat Pertandingan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="px-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Statistik Tim</h4>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-[#121722] border border-gray-800 p-3 rounded-2xl">
            <span className="text-lg font-black text-white">{myTeam?.stats?.played || 14}</span>
            <span className="block text-[10px] text-gray-400 uppercase mt-0.5">Main</span>
          </div>
          <div className="bg-[#121722] border border-gray-800 p-3 rounded-2xl">
            <span className="text-lg font-black text-emerald-400">{myTeam?.stats?.won || 9}</span>
            <span className="block text-[10px] text-gray-400 uppercase mt-0.5">Menang</span>
          </div>
          <div className="bg-[#121722] border border-gray-800 p-3 rounded-2xl">
            <span className="text-lg font-black text-amber-400">{myTeam?.stats?.drawn || 3}</span>
            <span className="block text-[10px] text-gray-400 uppercase mt-0.5">Seri</span>
          </div>
          <div className="bg-[#121722] border border-gray-800 p-3 rounded-2xl">
            <span className="text-lg font-black text-red-400">{myTeam?.stats?.lost || 2}</span>
            <span className="block text-[10px] text-gray-400 uppercase mt-0.5">Kalah</span>
          </div>
        </div>
      </div>

      {/* Roster / Members List */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Daftar Skuad ({myTeam?.members?.length || 0})
          </h4>
          <button
            onClick={() => setIsAddingMember(true)}
            className="text-xs text-emerald-400 font-semibold hover:underline"
          >
            + Tambah Pemain
          </button>
        </div>

        <div className="space-y-2">
          {myTeam?.members?.map((member, i) => (
            <div
              key={member.id || i}
              className="bg-[#121722] border border-gray-800 rounded-2xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-800 text-gray-300 font-black flex items-center justify-center text-xs border border-gray-700">
                  {member.number ? `#${member.number}` : i + 1}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{member.name}</h5>
                  <p className="text-[10px] text-gray-400">{member.position} • {member.role}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                member.role === 'Kapten' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Team Modal */}
      {isEditingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#141b27] border border-gray-800 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-bold text-white text-sm">Edit Data Tim</h3>
              <button onClick={() => setIsEditingTeam(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTeam} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Nama Tim</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Kota / Domisili</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Deskripsi Singkat</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingTeam(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-black font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#141b27] border border-gray-800 rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-bold text-white text-sm">Tambah Anggota Skuad</h3>
              <button onClick={() => setIsAddingMember(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Nama Pemain</label>
                <input
                  type="text"
                  placeholder="Contoh: Dika Pratama"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Posisi</label>
                  <select
                    value={memberPos}
                    onChange={(e) => setMemberPos(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="Pivot / Striker">Pivot / Striker</option>
                    <option value="Flank / Midfielder">Flank / Midfielder</option>
                    <option value="Anchor / Defender">Anchor / Defender</option>
                    <option value="Kiper">Kiper</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Nomor Punggung</label>
                  <input
                    type="number"
                    value={memberNum}
                    onChange={(e) => setMemberNum(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-black font-bold"
                >
                  Tambahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
