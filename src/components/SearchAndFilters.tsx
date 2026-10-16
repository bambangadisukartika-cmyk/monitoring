import React from 'react';
import { Search } from 'lucide-react';

export type FilterType = 'all' | 'terlambat' | 'kayu';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between no-print animate-fade-in-up anim-delay-2">
      <div className="relative w-full md:w-80">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama barang / no. pesanan..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <button
          onClick={() => onFilterChange('all')}
          className={`filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua Data
        </button>

        <button
          onClick={() => onFilterChange('terlambat')}
          className={`filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-95 flex items-center gap-1.5 ${
            activeFilter === 'terlambat'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <span className="anim-terlambat">⚠️</span>
          <span>Terlambat Only</span>
        </button>

        <button
          onClick={() => onFilterChange('kayu')}
          className={`filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer active:scale-95 flex items-center gap-1.5 ${
            activeFilter === 'kayu'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
          }`}
        >
          <span className="anim-kayu">🪵</span>
          <span>Kayu Only</span>
        </button>
      </div>
    </div>
  );
};
