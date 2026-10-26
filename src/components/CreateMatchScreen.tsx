import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CircleDot, 
  Trophy, 
  Users, 
  Calendar, 
  MapPin, 
  FileText,
  CheckCircle,
  Loader2,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MatchType } from '../types';

interface CreateMatchScreenProps {
  onBack: () => void;
  onSuccess: (matchId: string) => void;
}

export const CreateMatchScreen: React.FC<CreateMatchScreenProps> = ({ onBack, onSuccess }) => {
  const { createMatch, myTeam, venues } = useApp();
  const { currentUser } = useAuth();

  const [selectedType, setSelectedType] = useState<MatchType>('futsal');
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [description, setDescription] = useState('');
  const [teamCount, setTeamCount] = useState<number>(1);
  const [level, setLevel] = useState('Bebas');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Type definitions matching screenshot
  const matchTypes = [
    {
      id: 'futsal' as MatchType,
      title: 'Futsal',
      format: '5 vs 5',
      icon: CircleDot,
      defaultImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'mini_soccer' as MatchType,
      title: 'Mini Soccer',
      format: '7 vs 7',
      icon: Trophy,
      defaultImage: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'antar_kampung' as MatchType,
      title: 'Antar Kampung',
      format: '11 vs 11',
      icon: Users,
      defaultImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const currentTypeConfig = matchTypes.find((t) => t.id === selectedType)!;

  const getLocalDateTime = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const openGoogleMaps = () => {
    const query = coordinates
      ? `${coordinates.lat},${coordinates.lng}`
      : location.trim();
    if (!query) {
      setLocationMessage('Pilih atau tulis lokasi lapangan terlebih dahulu.');
      return;
    }
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Browser ini tidak mendukung GPS. Silakan cari lokasi melalui Google Maps.');
      return;
    }
    setIsLocating(true);
    setLocationMessage('Meminta izin lokasi perangkat…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoordinates({ lat, lng });
        setLocation(`Lokasi GPS (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
        setLocationMessage('Koordinat GPS berhasil diambil. Tekan “Buka Google Maps” untuk melihat titiknya.');
        setIsLocating(false);
      },
      (err) => {
        setLocationMessage(err.code === err.PERMISSION_DENIED
          ? 'Izin lokasi ditolak. Aktifkan izin lokasi untuk browser, atau cari lapangan lewat Google Maps.'
          : 'Lokasi belum berhasil diambil. Pastikan GPS aktif dan coba lagi.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Harap masukkan judul pertandingan');
      return;
    }
    if (!dateTime.trim()) {
      setError('Harap masukkan tanggal & waktu');
      return;
    }
    if (!location.trim()) {
      setError('Harap masukkan lokasi / lapangan');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const initialTeams = [
        {
          teamId: myTeam?.id || 'team-arashi',
          teamName: myTeam?.name || currentUser?.teamName || 'ARASHI FC',
          captainName: currentUser?.name || 'Kapten',
          captainPhone: currentUser?.phone || '+6281234567890',
          slot: 1,
          joinedAt: 'Baru saja'
        }
      ];

      const matchId = await createMatch({
        title: title.trim(),
        type: selectedType,
        format: currentTypeConfig.format,
        date: dateTime.trim(),
        location: location.trim(),
        level: level,
        description: description.trim() || 'Pertandingan sparring persahabatan.',
        imageUrl: currentTypeConfig.defaultImage,
        status: 'terbuka',
        teams: initialTeams,
        createdBy: currentUser?.uid || 'guest',
        creatorName: `${currentUser?.name || 'Pemain'} (${myTeam?.name || 'ARASHI FC'})`,
        creatorPhone: currentUser?.phone || '+6281234567890'
      });

      onSuccess(matchId);
    } catch (err: any) {
      setError(err?.message || 'Gagal membuat pertandingan. Periksa koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Top Bar with Back Arrow */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-800">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white tracking-tight">Buat Pertandingan</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Jenis Pertandingan Section */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">
            Jenis Pertandingan
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {matchTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-gray-800 border-white text-white shadow-lg shadow-white/5'
                      : 'bg-[#121722] border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl mb-2 ${isSelected ? 'bg-white text-black' : 'bg-gray-800/80 text-gray-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight">{type.title}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">{type.format}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Judul Pertandingan Section */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Judul Pertandingan
          </label>
          <input
            type="text"
            placeholder="Contoh: Cari Lawan Sparring Futsal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-[#131924] border border-gray-800 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            required
          />
        </div>

        {/* Tanggal & Waktu Section */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Tanggal & Waktu
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              min={getLocalDateTime()}
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#131924] border border-gray-800 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors [color-scheme:dark]"
              required
            />
            <Calendar className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          </div>
        </div>

        {/* Lokasi / Lapangan Section */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Lokasi / Lapangan
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Pilih lokasi atau tulis manual"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setCoordinates(null); setLocationMessage(null); }}
              className="w-full pl-11 pr-4 py-3 bg-[#131924] border border-gray-800 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
              required
            />
            <MapPin className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={openGoogleMaps}
              className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 px-3 py-2.5 text-xs font-semibold text-blue-200"
            >
              <ExternalLink className="h-4 w-4" />
              Buka Google Maps
            </button>
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={isLocating}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-200 disabled:opacity-50"
            >
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {isLocating ? 'Mencari GPS…' : 'Gunakan Lokasi Saya'}
            </button>
          </div>
          {locationMessage && (
            <p className="mt-2 text-[11px] text-gray-300" role="status">{locationMessage}</p>
          )}
          {coordinates && (
            <p className="mt-1 break-all text-[10px] text-emerald-300">
              Koordinat: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </p>
          )}

          {/* Quick venue chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {venues.slice(0, 3).map((v) => (
              <button
                type="button"
                key={v.id}
                onClick={() => { setLocation(v.name); setCoordinates(null); setLocationMessage(`${v.name} dipilih. Tekan “Buka Google Maps” untuk melihat lokasinya.`); }}
                className="text-[10px] px-2 py-1 bg-gray-800/60 hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-700/60 transition-colors"
              >
                + {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* Deskripsi (opsional) Section */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Deskripsi (opsional)
          </label>
          <textarea
            placeholder="Tulis detail pertandingan, level tim, dll..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-[#131924] border border-gray-800 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors resize-none"
          />
        </div>

        {/* Jumlah Tim Toggle matching screenshot */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Jumlah Tim
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[#121722] p-1.5 rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => setTeamCount(1)}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                teamCount === 1
                  ? 'bg-gray-700/80 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              1 Tim
            </button>
            <button
              type="button"
              onClick={() => setTeamCount(2)}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                teamCount === 2
                  ? 'bg-gray-700/80 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              2 Tim
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {teamCount === 1 ? '1 slot terbuka untuk lawan sparring menantang tim Anda.' : 'Kedua slot tim telah ditentukan lebih awal.'}
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-gray-100 text-black font-extrabold text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <span>Buat Pertandingan</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
