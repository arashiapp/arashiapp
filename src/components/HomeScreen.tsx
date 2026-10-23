import React, { useState } from 'react';
import { 
  Search, 
  LayoutGrid, 
  CircleDot, 
  Trophy, 
  Users, 
  MapPin, 
  CalendarPlus, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Match, MatchType } from '../types';

interface HomeScreenProps {
  onSelectMatch: (matchId: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenVenues: () => void;
  onOpenTournaments: () => void;
  onOpenTeams: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMatch,
  onNavigateTab,
  onOpenVenues,
  onOpenTournaments,
  onOpenTeams
}) => {
  const { matches } = useApp();
  const { currentUser, isAdmin } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Categories matching screenshot
  const categories = [
    { id: 'all', label: 'Semua', icon: LayoutGrid },
    { id: 'futsal', label: 'Futsal', icon: CircleDot },
    { id: 'mini_soccer', label: 'Mini Soccer', icon: Trophy },
    { id: 'antar_kampung', label: 'Antar Kampung', icon: Users },
  ];

  const filteredMatches = matches.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.type === selectedCategory;
    const matchesSearch = 
      searchQuery.trim() === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.teams.some((t) => t.teamName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Greeting Section */}
      <div className="px-4 pt-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Halo, {currentUser?.name?.split(' ')[0] || 'Pemain'}!
        </h2>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
          Temukan lawan sparring, bentuk tim, dan bertanding kapan saja.
        </p>
      </div>

      {/* Search Bar matching screenshot */}
      <div className="px-4">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Cari tim, lokasi, atau pertandingan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-3 bg-[#131924] border border-gray-800 rounded-2xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors shadow-inner"
          />
          <div className="absolute right-3 p-1.5 rounded-xl bg-gray-800/80 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Category Pills matching screenshot */}
      <div className="px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2.5 min-w-max pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center min-w-[76px] py-2.5 px-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-gray-800 border-gray-600 text-white shadow-md'
                    : 'bg-[#121722] border-gray-800/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                <div className={`p-2 rounded-xl mb-1.5 ${isSelected ? 'bg-white/10 text-white' : 'bg-gray-800/60 text-gray-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide whitespace-nowrap">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Banner / Slogan matching screenshot */}
      <div className="px-4">
        <div 
          onClick={() => onNavigateTab('cari')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 border border-gray-800 cursor-pointer group shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
          
          <img
            src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80"
            alt="Sparring Persaudaraan"
            className="w-full h-36 sm:h-44 object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-60"
          />

          <div className="absolute inset-0 z-20 p-4 sm:p-5 flex flex-col justify-end">
            <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">
              SPARRING
            </span>
            <div className="flex items-end justify-between gap-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight uppercase max-w-[70%]">
                BUKAN SEKEDAR PERTANDINGAN TAPI PERSAUDARAAN
              </h3>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid matching screenshot: Buat Pertandingan, Cari Tim, Lapangan Terdekat, Turnamen */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            onClick={() => onNavigateTab('buat')}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#121722] hover:bg-gray-800/80 border border-gray-800/80 transition-all group active:scale-95"
          >
            <div className="p-2.5 rounded-xl bg-gray-800 text-gray-300 group-hover:text-white group-hover:bg-gray-700 transition-colors mb-1.5">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 leading-tight">Buat Pertandingan</span>
          </button>

          <button
            onClick={onOpenTeams}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#121722] hover:bg-gray-800/80 border border-gray-800/80 transition-all group active:scale-95"
          >
            <div className="p-2.5 rounded-xl bg-gray-800 text-gray-300 group-hover:text-white group-hover:bg-gray-700 transition-colors mb-1.5">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 leading-tight">Cari Tim</span>
          </button>

          <button
            onClick={onOpenVenues}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#121722] hover:bg-gray-800/80 border border-gray-800/80 transition-all group active:scale-95"
          >
            <div className="p-2.5 rounded-xl bg-gray-800 text-gray-300 group-hover:text-white group-hover:bg-gray-700 transition-colors mb-1.5">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 leading-tight">Lapangan Terdekat</span>
          </button>

          <button
            onClick={onOpenTournaments}
            className="flex flex-col items-center p-3 rounded-2xl bg-[#121722] hover:bg-gray-800/80 border border-gray-800/80 transition-all group active:scale-95"
          >
            <div className="p-2.5 rounded-xl bg-gray-800 text-gray-300 group-hover:text-white group-hover:bg-gray-700 transition-colors mb-1.5">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 leading-tight">Turnamen</span>
          </button>
        </div>
      </div>

      {/* Pertandingan Terdekat Header */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white tracking-wide">Pertandingan Terdekat</h3>
          <button
            onClick={() => onNavigateTab('cari')}
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Lihat Semua
          </button>
        </div>

        {/* Matches list */}
        <div className="space-y-3">
          {filteredMatches.slice(0, 4).map((match) => (
            <div
              key={match.id}
              onClick={() => onSelectMatch(match.id)}
              className="bg-[#121722] hover:bg-gray-800/70 border border-gray-800 rounded-2xl p-3 flex gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
            >
              {/* Thumbnail with Type Badge */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-800">
                <img
                  src={match.imageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=300&q=80'}
                  alt={match.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1.5 left-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-sm border border-white/20">
                    {match.type === 'futsal' ? 'Futsal' : match.type === 'mini_soccer' ? 'Mini Soccer' : 'Antar Kampung'}
                  </span>
                </div>
              </div>

              {/* Match Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] text-gray-400 mb-0.5">
                    <span className="font-medium text-gray-300 truncate">{match.date}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 uppercase">
                      {match.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {match.title}
                  </h4>

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
          ))}
        </div>
      </div>
    </div>
  );
};
