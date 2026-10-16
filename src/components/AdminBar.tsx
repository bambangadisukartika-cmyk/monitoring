import React from 'react';
import { UploadCloud, History, PlusCircle, Share2, KeyRound, Eye, RefreshCw } from 'lucide-react';

interface AdminBarProps {
  onOpenUpload: () => void;
  onOpenHistory: () => void;
  onOpenAddItem: (type: 'delivery' | 'stock') => void;
  onOpenShare: () => void;
  onCopyEditLink: () => void;
  onTogglePreview: () => void;
  isPreviewingReadOnly: boolean;
  onResetToDefault: () => void;
}

export const AdminBar: React.FC<AdminBarProps> = ({
  onOpenUpload,
  onOpenHistory,
  onOpenAddItem,
  onOpenShare,
  onCopyEditLink,
  onTogglePreview,
  isPreviewingReadOnly,
  onResetToDefault
}) => {
  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2.5 text-xs sm:text-sm font-medium no-print sticky top-0 z-40 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider">
            🔓 Mode Edit Aktif
          </span>
          <span className="text-slate-300 text-xs hidden sm:inline">
            Akses Penuh Tanpa Login. Perubahan otomatis tersimpan.
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Main Action: Upload/Paste */}
          <button
            onClick={onOpenUpload}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload / Paste Foto & Teks</span>
          </button>

          {/* Quick Manual Add */}
          <div className="relative group">
            <button
              onClick={() => onOpenAddItem('delivery')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Pesanan</span>
            </button>
          </div>

          <button
            onClick={() => onOpenAddItem('stock')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Stok</span>
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Riwayat</span>
          </button>

          {/* Share links */}
          <button
            onClick={onOpenShare}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Link Publik</span>
          </button>

          <button
            onClick={onCopyEditLink}
            className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Salin tautan rahasia untuk kembali mengedit nanti"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Salin Link Edit</span>
          </button>

          {/* Toggle ReadOnly Preview */}
          <button
            onClick={onTogglePreview}
            className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer border ${
              isPreviewingReadOnly 
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' 
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title="Lihat persis bagaimana publik melihat halaman ini"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewingReadOnly ? 'Keluar Preview' : 'Preview Publik'}</span>
          </button>

          <button
            onClick={onResetToDefault}
            className="text-slate-400 hover:text-red-400 p-1.5 rounded transition-all cursor-pointer"
            title="Reset ke Contoh Awal"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
