import React from 'react';

interface SummaryCardsProps {
  totalOrders: number;
  totalTerlambat: number;
  totalKayu: number;
  totalStockUnits: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalOrders,
  totalTerlambat,
  totalKayu,
  totalStockUnits
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm card-hover-fx animate-fade-in-up anim-delay-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Total Pesanan</span>
          <span className="text-slate-300">📦</span>
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-1">
          {totalOrders} <span className="text-xs font-normal text-slate-500">Item</span>
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500 card-hover-fx animate-fade-in-up anim-delay-2 group">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Terlambat</span>
          <span className="anim-terlambat text-sm">⚠️</span>
        </p>
        <p className="text-2xl font-bold text-red-600 mt-1 flex items-baseline gap-1">
          <span className="group-hover:scale-105 transition-transform duration-200 inline-block">{totalTerlambat}</span>
          <span className="text-xs font-normal text-slate-500">Item</span>
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500 card-hover-fx animate-fade-in-up anim-delay-3 group">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Packing Kayu</span>
          <span className="anim-kayu text-sm">🪵</span>
        </p>
        <p className="text-2xl font-bold text-amber-600 mt-1 flex items-baseline gap-1">
          <span className="group-hover:scale-105 transition-transform duration-200 inline-block">{totalKayu}</span>
          <span className="text-xs font-normal text-slate-500">Item</span>
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500 card-hover-fx animate-fade-in-up anim-delay-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Total Unit Stok</span>
          <span className="text-emerald-500">🏢</span>
        </p>
        <p className="text-2xl font-bold text-emerald-600 mt-1">
          {totalStockUnits} <span className="text-xs font-normal text-slate-500">Unit</span>
        </p>
      </div>
    </div>
  );
};
