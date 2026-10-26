
import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Shield,
  UserRoundPlus,
  LogIn,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface LandingScreenProps {
  onEnterApp: () => void;
}

type ScreenMode = 'login' | 'signup' | 'reset' | 'recovery';

export const LandingScreen: React.FC<LandingScreenProps> = ({ onEnterApp }) => {
  const { loginWithEmail, signUpWithEmail, resetPassword, updatePassword } = useAuth();

  const [mode, setMode] = useState<ScreenMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
        setMessage('Buat kata sandi baru untuk akunmu.');
        setError(false);
        setPassword('');
        setConfirmPassword('');
      } else if (
        event === 'SIGNED_OUT' &&
        mode === 'recovery'
      ) {
        setMode('login');
        setMessage('Sesi pemulihan berakhir. Silakan minta tautan reset baru.');
        setError(true);
      }
    });

    // Menangani tautan pemulihan yang sudah membuka sesi saat halaman dimuat.
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;

      if (sessionError) {
        setError(true);
        setMessage('Tidak dapat memeriksa sesi. Buka kembali tautan pemulihan terbaru.');
        return;
      }

      const url = new URL(window.location.href);
      const hasRecoveryCode = url.searchParams.has('code');
      const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
      const hasRecoveryToken =
        hash.get('type') === 'recovery' ||
        hash.has('access_token');

      if (hasRecoveryCode || hasRecoveryToken) {
        if (data.session) {
          setMode('recovery');
          setMessage('Buat kata sandi baru untuk akunmu.');
          setError(false);
        } else {
          setError(true);
          setMessage('Sesi pemulihan belum tersedia. Coba buka tautan terbaru dari email.');
        }
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const changeMode = (nextMode: ScreenMode) => {
    setMode(nextMode);
    setMessage('');
    setError(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError(false);

    if (mode === 'signup' && !name.trim()) {
      setError(true);
      setMessage('Masukkan nama lengkap.');
      return;
    }

    if (mode === 'recovery') {
      if (password.length < 6) {
        setError(true);
        setMessage('Kata sandi minimal 6 karakter.');
        return;
      }

      if (password !== confirmPassword) {
        setError(true);
        setMessage('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    } else if (mode !== 'reset' && password.length < 6) {
      setError(true);
      setMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setMessage(
          'Jika email terdaftar, tautan pemulihan akan dikirim. Periksa kotak masuk dan folder spam.'
        );
      } else if (mode === 'recovery') {
        await updatePassword(password);
        await supabase.auth.signOut();
        setPassword('');
        setConfirmPassword('');
        setMode('login');
        setMessage('Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru.');
      } else if (mode === 'signup') {
        await signUpWithEmail(name, email, password);
        setPassword('');
        setMode('login');
        setMessage(
          'Pendaftaran berhasil. Jika diminta verifikasi email, verifikasi dahulu sebelum login.'
        );
      } else {
        await loginWithEmail(email, password);
        onEnterApp();
      }
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error
          ? err.message
          : 'Proses gagal. Silakan coba lagi.'
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
        <span className="font-semibold tracking-wider text-gray-300">ARASHI</span>
        <span className="text-[11px] text-gray-400">SPARRINGHUB</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="flex flex-col items-center mb-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-white to-gray-300 text-black shadow-xl mb-3 border border-white/40">
            <span className="text-3xl font-black italic">A</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest">ARASHI</h1>
          <p className="text-xs font-semibold tracking-[0.28em] text-gray-400 uppercase mt-1">
            SPARRINGHUB
          </p>
        </div>

        {mode !== 'recovery' && (
          <>
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 my-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80"
                alt="Bola sepak ARASHI"
                className="relative w-full h-full object-cover rounded-full shadow-2xl border border-gray-700 grayscale contrast-125"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-3">More Than a Game</h2>
            <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-gray-400 uppercase mt-2">
              FUTSAL • MINI SOCCER • ANTAR KAMPUNG
            </p>
          </>
        )}

        <div className="w-full max-w-sm mt-8 text-left">
          {(mode === 'login' || mode === 'signup') && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => changeMode('login')}
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
                onClick={() => changeMode('signup')}
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
          )}

          <div className="mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              {mode === 'recovery'
                ? 'Buat Kata Sandi Baru'
                : mode === 'reset'
                  ? 'Lupa Kata Sandi'
                  : mode === 'signup'
                    ? 'Buat Akun'
                    : 'Masuk Akun'}
            </h3>
            {(mode === 'reset' || mode === 'recovery') && (
              <p className="text-xs text-gray-400 mt-2">
                {mode === 'recovery'
                  ? 'Masukkan kata sandi baru minimal 6 karakter.'
                  : 'Masukkan email akunmu. Kami akan mengirimkan tautan pemulihan.'}
              </p>
            )}
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

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Alamat email"
                required
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'recovery') && (
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === 'recovery' ? 'Kata sandi baru' : 'Kata sandi (minimal 6 karakter)'}
                minLength={6}
                required
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />
            )}

            {mode === 'recovery' && (
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ulangi kata sandi baru"
                minLength={6}
                required
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => changeMode('reset')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
            )}

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
                : mode === 'recovery'
                  ? 'Simpan Kata Sandi Baru'
                  : mode === 'reset'
                    ? 'Kirim Tautan Reset'
                    : mode === 'login'
                      ? 'Masuk ke SparringHub'
                      : 'Buat Akun'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {(mode === 'reset' || mode === 'recovery') && (
            <button
              type="button"
              onClick={() => changeMode('login')}
              className="w-full mt-3 py-2 text-sm text-gray-300 hover:text-white flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </button>
          )}

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
