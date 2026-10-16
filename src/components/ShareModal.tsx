import React, { useState } from 'react';
import { X, Check, Copy, Printer, Shield, Key } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
  editUrl: string;
  isEditMode: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  publicUrl,
  editUrl,
  isEditMode
}) => {
  const [copiedType, setCopiedType] = useState<'public' | 'edit' | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'public' | 'edit') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl text-xl">🔗</div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Bagikan Dashboard Monitoring</h3>
            <p className="text-xs text-slate-500">Tautan tetap dan tidak berubah setiap ada pembaruan</p>
          </div>
        </div>

        {/* 1. Public Read-Only Link */}
        <div className="space-y-2 pt-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Link Publik (Hanya Lihat / Read-Only):</span>
            </label>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">
              Aman Dibagikan
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Orang yang membuka link ini hanya bisa melihat data dan filter, tanpa akses edit atau tombol upload.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none select-all shadow-2xs"
            />
            <button
              onClick={() => handleCopy(publicUrl, 'public')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
            >
              {copiedType === 'public' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Special Edit Link (ONLY shown to authenticated editor) */}
        {isEditMode && (
          <div className="space-y-2 bg-amber-50/80 p-4 rounded-xl border border-amber-300">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Link Khusus Edit (All Access Tanpa Login):</span>
              </label>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded">
                Khusus Anda / Pengelola
              </span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Gunakan tautan ini untuk upload foto, edit data, dan melihat riwayat tanpa perlu login. Simpan link ini di bookmark browser Anda!
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={editUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none select-all shadow-2xs"
              />
              <button
                onClick={() => handleCopy(editUrl, 'edit')}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
              >
                {copiedType === 'edit' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link Edit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 3. Print / PDF Option */}
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <p className="text-xs font-semibold text-slate-600">Alternatif Cetak / Dokumentasi:</p>
          <button
            onClick={() => window.print()}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-lg border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Simpan sebagai PDF / Cetak Laporan</span>
          </button>
        </div>

        {copiedType && (
          <p className="text-xs text-emerald-600 font-bold text-center pt-1 animate-in fade-in duration-200">
            ✓ Link berhasil disalin ke clipboard!
          </p>
        )}
      </div>
    </div>
  );
};
