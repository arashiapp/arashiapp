import React from 'react';
import { Shield, Users, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingScreenProps {
  onEnterApp: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnterApp }) => {
  const { loginWithGoogle, loginAsGuestMember, loginAsAdmin } = useAuth();

  const handleLoginMember = () => {
    loginAsGuestMember();
    onEnterApp();
  };

  const handleLoginAdmin = () => {
    loginAsAdmin();
    onEnterApp();
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      onEnterApp();
    } catch {
      handleLoginMember();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-white flex flex-col justify-between overflow-hidden">
      {/* Background stadium atmosphere lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1e293b_0%,#07090e_75%)] pointer-events-none opacity-80" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

      {/* Top Bar with Status indicator */}
      <div className="relative z-10 px-6 pt-4 flex items-center justify-between text-xs text-gray-400">
        <span className="font-semibold tracking-wider text-gray-300">9:41</span>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">Server Real-Time Terhubung</span>
        </div>
      </div>

      {/* Center Branding & Soccer Ball Graphic */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-white to-gray-300 text-black shadow-2xl shadow-white/20 mb-3 border border-white/40">
            <span className="text-3xl font-black italic tracking-tighter">A</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-white">ARASHI</h1>
          <p className="text-xs sm:text-sm font-semibold tracking-[0.28em] text-gray-400 uppercase mt-0.5">
            SPARRINGHUB
          </p>
        </div>

        {/* Dramatic Soccer Ball Graphic matching screenshot */}
        <div className="relative w-52 h-52 sm:w-60 sm:h-60 my-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-white/10 to-transparent blur-2xl animate-pulse" />
          <img
            src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80"
            alt="Arashi Soccer Ball"
            className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-full shadow-[0_0_50px_rgba(255,255,255,0.15)] border border-gray-700/80 grayscale contrast-125"
          />
        </div>

        {/* Tagline */}
        <div className="mt-2 space-y-1.5 max-w-xs">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">More Than a Game</h2>
          <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-gray-400 uppercase">
            FUTSAL • MINI SOCCER • ANTAR KAMPUNG
          </p>
        </div>
      </div>

      {/* Action Buttons matching screenshot */}
      <div className="relative z-10 px-6 pb-6 w-full max-w-sm mx-auto space-y-3">
        {/* Main "Masuk" Button (White with dark text) */}
        <button
          onClick={handleLoginMember}
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-gray-100 text-black font-extrabold text-sm transition-all shadow-lg shadow-white/10 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Masuk</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* "Daftar Akun" Button (Dark with border) */}
        <button
          onClick={handleGoogle}
          className="w-full py-3.5 px-6 rounded-2xl bg-gray-900/90 hover:bg-gray-850 text-white font-bold text-sm border border-gray-700/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Masuk dengan Google</span>
        </button>

        {/* Quick Admin Test Entry Button */}
        <button
          onClick={handleLoginAdmin}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Masuk Langsung sebagai Admin (Akses Penuh)</span>
        </button>

        <p className="text-[11px] text-center text-gray-500 pt-2">
          Bersama Komunitas, Lebih Banyak Pertandingan
        </p>
      </div>
    </div>
  );
};
