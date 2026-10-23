import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  MapPin, 
  Users, 
  Plus, 
  Check, 
  X, 
  CircleDot, 
  Trophy, 
  Shield, 
  Sparkles,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Match, MatchType, MatchStatus } from '../types';

interface MatchesScreenProps {
  onSelectMatch: (matchId: string) => void;
  onOpenCreate: () => void;
}

export type AvailabilityFilter = 'all' | 'terbuka' | 'penuh' | 'selesai';

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  onSelectMatch,
  onOpenCreate
}) => {
  const { matches } = useApp();

  // Filters state
  const [selectedSport, setSelectedSport] = useState<string>('all'); // 'all' | 'futsal' | 'mini_soccer' | 'antar_kampung'
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityFilter>('all');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  // Sport type options with labels & icons
  const sportTypes = [
    { 
      id: 'all', 
      label: 'Semua', 
      subtitle: 'Semua cabang',
      icon: Trophy 
    },
    { 
      id: 'futsal', 
      label: 'Futsal', 
      subtitle: '5 vs 5 Indoor',
      icon: CircleDot 
    },
    { 
      id: 'mini_soccer', 
      label: 'Mini Soccer', 
      subtitle: '7 vs 7 Sintetis',
      icon: Trophy 
    },
    { 
      id: 'antar_kampung', 
      label: 'Sepak Bola Lapangan', 
      subtitle: '11 vs 11 Antar Kampung',
      icon: Users 
    },
  ];

  // Availability status options
  const availabilityOptions: { id: AvailabilityFilter; label: string; description: string; badgeClass: string }[] = [
    { 
      id: 'all', 
      label: 'Semua Status', 
      description: 'Tampilkan semua status ketersediaan',
      badgeClass: 'bg-gray-800 text-gray-300'
    },
    { 
      id: 'terbuka', 
      label: 'Terbuka (Butuh Lawan)', 
      description: 'Slot tim masih tersedia untuk ditantang',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
    },
    { 
      id: 'penuh', 
      label: 'Penuh (Siap Tanding)', 
      description: 'Slot 2 tim telah terisi penuh',
      badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
    },
    { 
      id: 'selesai', 
      label: 'Selesai', 
      description: 'Pertandingan yang telah berlangsung',
      badgeClass: 'bg-gray-700/50 text-gray-400 border border-gray-600'
    },
  ];

  // Active filters count
  const activeFiltersCount = (selectedSport !== 'all' ? 1 : 0) + (availabilityStatus !== 'all' ? 1 : 0);

  // Filter logic
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      // 1. Sport type filter
      const sportMatch = selectedSport === 'all' || match.type === selectedSport;

      // 2. Availability status filter
      let statusMatch = true;
      if (availabilityStatus === 'terbuka') {
        statusMatch = match.status === 'terbuka' && match.currentTeams < match.targetTeams;
      } else if (availabilityStatus === 'penuh') {
        statusMatch = match.status === 'penuh' || match.currentTeams >= match.targetTeams;
      } else if (availabilityStatus === 'selesai') {
        statusMatch = match.status === 'selesai';
      }

      return sportMatch && statusMatch;
    });
  }, [matches, selectedSport, availabilityStatus]);

  const resetFilters = () => {
    setSelectedSport('all');
    setAvailabilityStatus('all');
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Top Header with Filter Trigger */}
      <div className="px-4 pt-1 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Pertandingan</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {filteredMatches.length} jadwal ditemukan
            {activeFiltersCount > 0 && ` (${activeFiltersCount} filter aktif)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs px-2.5 py-1 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-300 flex items-center gap-1 border border-gray-700 transition-colors"
              title="Reset semua filter"
            >
              <RotateCcw className="w-3 h-3 text-emerald-400" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setShowFilterModal(true)}
            className={`relative p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
              activeFiltersCount > 0
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-950/40'
                : 'bg-[#121722] border-gray-800 text-gray-400 hover:text-white'
            }`}
            aria-label="Filter Pertandingan"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-emerald-500 text-black text-[10px] font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Primary Sport Type Quick Tabs */}
      <div className="px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {sportTypes.map((cat) => {
            const isSelected = selectedSport === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSport(cat.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#121722] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Quick Availability Filter Chips */}
      <div className="px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-semibold text-gray-400 mr-1">Status:</span>
          {availabilityOptions.map((opt) => {
            const isSelected = availabilityStatus === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAvailabilityStatus(opt.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-black font-bold shadow-sm'
                    : 'bg-gray-850/80 text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                {opt.id === 'terbuka' && '🟢 '}
                {opt.id === 'penuh' && '🟡 '}
                {opt.id === 'selesai' && '⚪ '}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matches List */}
      <div className="px-4 space-y-3 pt-1">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-14 bg-[#121722]/60 rounded-3xl border border-gray-800/80 p-6 space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Tidak Ada Pertandingan</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Tidak ada jadwal yang cocok dengan kombinasi filter olahraga & status yang dipilih.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors"
              >
                Reset Semua Filter
              </button>
              <button
                onClick={onOpenCreate}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Baru</span>
              </button>
            </div>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div
              key={match.id}
              onClick={() => onSelectMatch(match.id)}
              className="bg-[#121722] hover:bg-gray-800/80 border border-gray-800 rounded-2xl p-3 flex gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
            >
              {/* Thumbnail with overlay badge */}
              <div className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-800">
                <img
                  src={match.imageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=300&q=80'}
                  alt={match.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1.5 left-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-sm border border-white/20">
                    {match.type === 'futsal' ? 'Futsal' : match.type === 'mini_soccer' ? 'Mini Soccer' : 'Sepak Bola'}
                  </span>
                </div>
              </div>

              {/* Match Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] text-gray-400 mb-0.5">
                    <span className="font-medium text-gray-300 truncate">{match.date}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                      match.status === 'terbuka' && match.currentTeams < match.targetTeams
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : match.status === 'penuh' || match.currentTeams >= match.targetTeams
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-gray-700/50 text-gray-400 border-gray-700'
                    }`}>
                      {match.currentTeams < match.targetTeams ? 'Terbuka' : match.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {match.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                    <span className="truncate">{match.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-800/80 text-[11px] text-gray-400">
                  <span className="font-medium text-gray-300">{match.format}</span>
                  <div className="flex items-center gap-1 font-semibold text-gray-200">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>{match.currentTeams}/{match.targetTeams} Tim</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comprehensive Filter Modal Drawer */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div 
            className="w-full max-w-md bg-[#131924] border-t sm:border border-gray-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Filter Pertandingan</h3>
                  <p className="text-xs text-gray-400">Sesuaikan jenis olahraga & status ketersediaan</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Filter 1: Sport Type (Jenis Olahraga) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    1. Jenis Olahraga (Sport Type)
                  </label>
                  {selectedSport !== 'all' && (
                    <button
                      onClick={() => setSelectedSport('all')}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Reset Olahraga
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {sportTypes.map((st) => {
                    const isSelected = selectedSport === st.id;
                    const Icon = st.icon;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedSport(st.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                            : 'bg-[#182030] border-gray-800/90 text-gray-300 hover:border-gray-700 hover:bg-[#1a2336]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">{st.label}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{st.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 2: Availability Status (Status Ketersediaan) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    2. Status Ketersediaan (Availability)
                  </label>
                  {availabilityStatus !== 'all' && (
                    <button
                      onClick={() => setAvailabilityStatus('all')}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Reset Status
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {availabilityOptions.map((opt) => {
                    const isSelected = availabilityStatus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAvailabilityStatus(opt.id)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                            : 'bg-[#182030] border-gray-800/90 text-gray-300 hover:border-gray-700 hover:bg-[#1a2336]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{opt.label}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{opt.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-gray-600 bg-gray-800'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 bg-gray-900/60 border-t border-gray-800 flex items-center gap-2.5">
              <button
                type="button"
                onClick={resetFilters}
                className="py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors"
              >
                Reset Semua
              </button>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 px-5 rounded-xl bg-white hover:bg-gray-200 text-black font-extrabold text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Lihat {filteredMatches.length} Pertandingan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
