import React from 'react';
import { StockItem } from '../types/dashboard';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface StockSectionProps {
  sectionTitle: string;
  items: StockItem[];
  searchQuery: string;
  isEditMode: boolean;
  onEditItem?: (item: StockItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onAddItem?: () => void;
}

export const StockSection: React.FC<StockSectionProps> = ({
  sectionTitle,
  items,
  searchQuery,
  isEditMode,
  onEditItem,
  onDeleteItem,
  onAddItem
}) => {
  // Filter stock items
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const searchString = `${item.name} ${item.quantity} ${item.notes || ''}`.toLowerCase();
    return searchString.includes(q);
  });

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up anim-delay-4">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-white rounded-lg font-bold text-lg leading-none">
            🏢
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-wide uppercase">{sectionTitle}</h2>
            <p className="text-slate-400 text-xs">Inventaris fisik barang yang saat ini tersedia di gudang PT. MBG</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              onClick={onAddItem}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer no-print shadow-sm"
            >
              <Plus className="w-3 h-3" />
              <span>+ Tambah Stok</span>
            </button>
          )}
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
            In Stock
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">Nama Barang</th>
                <th className="py-3.5 px-4 font-bold text-center w-28">Jumlah (Unit)</th>
                <th className="py-3.5 px-4 font-bold">Catatan / Status Khusus</th>
                {isEditMode && <th className="py-3.5 px-4 text-right font-bold w-20 no-print">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={isEditMode ? 4 : 3} className="py-6 text-center text-slate-400 text-xs italic">
                    {searchQuery.trim() ? 'Tidak ada barang stok yang cocok dengan pencarian.' : 'Belum ada data stok barang.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isWarning = item.highlightType === 'warning' || item.notes.toLowerCase().includes('utamakan');
                  const isDanger =
                    item.highlightType === 'danger' ||
                    item.notes.toLowerCase().includes('perbaiki') ||
                    item.notes.toLowerCase().includes('belum bayar');

                  let rowBg = 'hover:bg-slate-50/80 transition-colors';
                  if (isWarning) rowBg = 'hover:bg-amber-50/40 transition-colors bg-amber-50/20';
                  if (isDanger) rowBg = 'hover:bg-red-50/40 transition-colors bg-red-50/20';

                  return (
                    <tr key={item.id} className={`item-row ${rowBg}`}>
                      <td
                        className={`py-3 px-4 ${
                          isWarning || isDanger ? 'font-bold text-slate-900' : 'font-medium text-slate-800'
                        }`}
                      >
                        {item.name}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-lg font-bold inline-block ${
                            isWarning
                              ? 'bg-amber-100 text-amber-900 border border-amber-200 font-extrabold'
                              : isDanger
                              ? 'bg-red-100 text-red-900 border border-red-200 font-extrabold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {isWarning ? (
                          <span className="text-amber-900 font-extrabold bg-amber-100 px-2.5 py-1 rounded-md text-xs border border-amber-300 inline-flex items-center gap-1.5 anim-flame shadow-2xs">
                            {item.notes}
                          </span>
                        ) : isDanger ? (
                          <span className="text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded-md text-xs border border-red-200 inline-flex items-center gap-1.5 anim-terlambat shadow-2xs">
                            {item.notes}
                          </span>
                        ) : item.notes && item.notes !== '-' ? (
                          <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs inline-block">
                            {item.notes}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">-</span>
                        )}
                      </td>

                      {isEditMode && (
                        <td className="py-3 px-4 text-right no-print">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEditItem?.(item)}
                              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all cursor-pointer"
                              title="Edit item stok"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteItem?.(item.id)}
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                              title="Hapus item stok"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
