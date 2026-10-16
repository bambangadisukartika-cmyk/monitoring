import React from 'react';

interface ReadOnlyBannerProps {
  onOpenShare: () => void;
}

export const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({ onOpenShare }) => {
  return (
    <div className="bg-indigo-900 text-indigo-100 px-4 py-2.5 text-xs sm:text-sm font-medium border-b border-indigo-800 no-print">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
            🔒 Read-Only
          </span>
          <span>Tampilan terbatas (Hanya Lihat). Anda tidak dapat mengubah data pada link ini.</span>
        </div>
        <button
          onClick={onOpenShare}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          🔗 Bagikan / Print PDF
        </button>
      </div>
    </div>
  );
};
