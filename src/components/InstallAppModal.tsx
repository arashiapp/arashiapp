
import React, { useState } from 'react';
import { ArrowRight, Shield, UserRoundPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingScreenProps {
  onEnterApp: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onEnterApp,
}) => {
  const { loginWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError(false);

    if (mode === 'signup' && !name.trim()) {
      setError(true);
      setMessage('Masukkan nama kamu.');
      return;
    }

    if (password.length < 6) {
      setError(true);
      setMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(name, email, password);
        setMessage(
          'Pendaftaran berhasil. Jika diminta verifikasi email, buka email kamu lalu verifikasi sebelum login.'
        );
        setMode('login');
        setPassword('');
      } else {
        await loginWithEmail(email, password);
        onEnterApp();
      }
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error
          ? err.message
          : 'Proses gagal. Periksa koneksi dan data akun kamu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-white flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#1e293b_0%,#07090e_75%)] pointer-events-none opacity-80" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

      <div className="relative z-10 px-6 pt-5 flex items-center justify-between text-xs text-gray-400">
        <span className="font-semibold tracking-wider text-gray-300">
          ARASHI
        </span>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <span className="text-[11px] text-gray-400">
            SPARRINGHUB
          </span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="flex flex-col items-center mb-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-white to-gray-300 text-black shadow-xl mb-3 border border-white/40">
            <span className="text-3xl font-black italic">A</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest">
            ARASHI
          </h1>
          <p className="text-xs font-semibold tracking-[0.28em] text-gray-400 uppercase mt-1">
            SPARRINGHUB
          </p>
        </div>

        <div className="relative w-36 h-36 sm:w-44 sm:h-44 my-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl" />
          <img
            src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80"
            alt="Bola sepak ARASHI"
            className="relative w-full h-full object-cover rounded-full shadow-2xl border border-gray-700 grayscale contrast-125"
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mt-3">
          More Than a Game
        </h2>
        <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-gray-400 uppercase mt-2">
          FUTSAL • MINI SOCCER • ANTAR KAMPUNG
        </p>

        <div className="w-full max-w-sm mt-8 text-left">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage('');
                setError(false);
              }}
              className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white text-black'
                  : 'bg-gray-900 text-gray-300 border border-gray-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setMessage('');
                setError(false);
              }}
              className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'bg-white text-black'
                  : 'bg-gray-900 text-gray-300 border border-gray-700'
              }`}
            >
              <UserRoundPlus className="w-4 h-4" />
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nama lengkap"
                required
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />
            )}

            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Alamat email"
              required
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            />

            <input
              type="password"
              autoComplete={
                mode === 'signup' ? 'new-password' : 'current-password'
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Kata sandi (minimal 6 karakter)"
              minLength={6}
              required
              className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            />

            {message && (
              <p
                role="status"
                className={`text-xs rounded-lg p-3 ${
                  error
                    ? 'bg-red-950 text-red-300'
                    : 'bg-emerald-950 text-emerald-300'
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl bg-white text-black font-extrabold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? 'Mohon tunggu...'
                : mode === 'login'
                  ? 'Masuk ke SparringHub'
                  : 'Buat Akun'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-gray-500 mt-5">
            <Shield className="w-3.5 h-3.5" />
            <p className="text-[10px] text-center">
              Akun dilindungi oleh autentikasi Supabase
            </p>
          </div>
        </div>
      </div>

      <p className="relative z-10 text-[11px] text-center text-gray-500 px-6 pb-5">
        Bersama Komunitas, Lebih Banyak Pertandingan
      </p>
    </div>
  );
};
