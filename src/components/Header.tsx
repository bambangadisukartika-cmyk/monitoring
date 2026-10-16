import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  warehouseStatus?: string;
  lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Sistem Pemantauan Pesanan Belum Kirim & Titipan Stok PT. MBG",
  subtitle = "Dashboard Monitoring Pengiriman & Stok © 2026 PT. MBG",
  warehouseStatus = "Status Gudang Active",
  lastUpdated
}) => {
  return (
    <header className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white shadow-lg animate-fade-in-up">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="inline-block transform hover:rotate-6 transition-transform duration-200">📦</span>
              <span>{title}</span>
            </h1>
            <p className="text-indigo-100 text-sm mt-1 flex items-center flex-wrap gap-1">
              <span>{subtitle}</span>
              {lastUpdated && (
                <span className="text-indigo-200/90 text-xs ml-1 bg-indigo-800/40 px-2 py-0.5 rounded-md border border-indigo-400/20">
                  • Update: {new Date(lastUpdated).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-800/60 backdrop-blur-md px-4 py-2 rounded-xl border border-indigo-400/30 text-xs font-semibold self-start md:self-auto shadow-inner hover:border-emerald-400/50 transition-colors">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 live-pulse-dot"></span>
            <span className="tracking-wide">{warehouseStatus}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
