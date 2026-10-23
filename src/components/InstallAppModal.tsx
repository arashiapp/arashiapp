import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  Share2, 
  Layers, 
  ShieldCheck, 
  Copy, 
  Check 
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#121722] border border-gray-800 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Pasang Aplikasi di HP Android</h3>
              <p className="text-[11px] text-gray-400">Instalasi langsung tanpa unduh file manual</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-gray-300">
          {/* Quick Direct Install Trigger */}
          {isInstallable && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-2 text-center">
              <span className="text-emerald-400 font-extrabold text-sm block">
                ✨ Siap Dipasang Langsung!
              </span>
              <p className="text-gray-300 text-xs">
                Perangkat Anda mendukung instalasi 1-klik ke layar utama HP seperti aplikasi APK native.
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                <Download className="w-4 h-4" />
                <span>Instal Aplikasi Sekarang</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-2xl flex items-center gap-2.5 text-blue-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-blue-400" />
              <span>Aplikasi sudah terpasang di perangkat Anda (Mode Standalone).</span>
            </div>
          )}

          {/* Metode 1: Cara Pasang Cepat di Android */}
          <div className="bg-[#161d2a] border border-gray-800 rounded-2xl p-4 space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
              <Smartphone className="w-4 h-4" />
              Metode 1: Pasang di HP Android (Sangat Cepat & Resmi)
            </h4>
            <p className="text-gray-300 leading-relaxed">
              Aplikasi ini adalah <strong>Progressive Web App (PWA)</strong> standar Google yang dapat langsung dipasang ke HP Android Anda:
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 text-gray-300">
              <li>Buka link aplikasi ini di browser <strong>Google Chrome</strong> pada HP Android Anda.</li>
              <li>Klik ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas browser Chrome.</li>
              <li>Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.</li>
              <li>Ikon <strong>ARASHI SPARRINGHUB</strong> akan otomatis muncul di menu aplikasi HP Anda dan bisa dibuka full-screen layaknya APK biasa.</li>
            </ol>
          </div>

          {/* Copy URL Box */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 space-y-2">
            <span className="text-[11px] font-semibold text-gray-400">Link Aplikasi untuk dibuka di HP:</span>
            <div className="flex items-center gap-2 bg-[#0c0f17] p-2 rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-300 font-mono truncate flex-1">{currentUrl}</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-1 text-[11px] font-semibold shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Metode 2: Konversi ke File .APK Murni */}
          <div className="bg-[#161d2a] border border-gray-800 rounded-2xl p-4 space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
              <Layers className="w-4 h-4" />
              Metode 2: Jika Butuh File Mentah (.APK) Offline
            </h4>
            <p className="text-gray-300 leading-relaxed">
              Jika Anda memerlukan file fisik berekstensi <code>.apk</code> untuk dibagikan secara offline via WhatsApp atau dipublish ke Google Play:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-gray-300">
              <li>Salin link aplikasi di atas.</li>
              <li>Buka website gratis <strong>PWABuilder (resmi dari Microsoft)</strong> di <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-bold">pwabuilder.com</a>.</li>
              <li>Tempel link aplikasi & klik <strong>"Build Android APK"</strong>.</li>
              <li>PWABuilder akan membuatkan paket file <code>.apk</code> siap unduh dan instal dalam 1 menit.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-900/60 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
