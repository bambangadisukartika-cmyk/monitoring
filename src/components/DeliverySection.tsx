import React from 'react';
import { DeliveryGroup, DeliveryItem } from '../types/dashboard';
import { FilterType } from './SearchAndFilters';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface DeliverySectionProps {
  sectionTitle: string;
  groups: DeliveryGroup[];
  searchQuery: string;
  activeFilter: FilterType;
  isEditMode: boolean;
  onEditItem?: (item: DeliveryItem, groupId: string) => void;
  onDeleteItem?: (itemId: string, groupId: string) => void;
  onAddItemToGroup?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({
  sectionTitle,
  groups,
  searchQuery,
  activeFilter,
  isEditMode,
  onEditItem,
  onDeleteItem,
  onAddItemToGroup,
  onDeleteGroup
}) => {
  const [copiedOrderId, setCopiedOrderId] = React.useState<string | null>(null);

  const handleCopyOrder = (orderNum: string, id: string) => {
    if (!orderNum || orderNum === '-') return;
    navigator.clipboard.writeText(orderNum);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 1500);
  };

  // Helper to get courier badge style
  const getCourierBadge = (courier: string) => {
    const c = courier.toUpperCase();
    if (c.includes('J&T') || c.includes('JNT')) {
      return 'bg-blue-50 text-blue-700 border-blue-100';
    }
    if (c.includes('JNE')) {
      return 'bg-orange-50 text-orange-700 border-orange-100';
    }
    if (c.includes('SPX')) {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    if (c.includes('SICEPAT')) {
      return 'bg-red-50 text-red-700 border-red-100';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Filter items based on search and filter
  const filterItem = (item: DeliveryItem): boolean => {
    // Status filter
    if (activeFilter === 'terlambat' && !item.isTerlambat) return false;
    if (activeFilter === 'kayu' && !item.isKayu) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const searchString = `${item.name} ${item.orderNumber} ${item.courier} ${item.isKayu ? 'kayu' : ''} ${item.isTerlambat ? 'terlambat' : ''} ${item.notes || ''}`.toLowerCase();
    return searchString.includes(q);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up anim-delay-3">
      {/* Section Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-lg font-bold text-lg leading-none">
            ⏳
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-wide uppercase">{sectionTitle}</h2>
            <p className="text-slate-400 text-xs">Daftar pesanan yang belum dikirimkan ke ekspedisi</p>
          </div>
        </div>
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
          Pending Delivery
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-8">
        {groups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(filterItem);
          if (visibleItems.length === 0 && searchQuery.trim() !== '') {
            return null; // hide group if no items match search
          }

          return (
            <div
              key={group.id}
              className={`data-group space-y-3 ${groupIdx > 0 ? 'pt-4 border-t border-slate-100' : ''}`}
            >
              {/* Group Title */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                  <h3 className="font-bold text-indigo-900 text-sm sm:text-base uppercase tracking-wide">
                    {group.title}
                  </h3>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium border border-indigo-100">
                    {group.items.length} Pesanan
                  </span>
                </div>

                {isEditMode && (
                  <div className="flex items-center gap-2 no-print">
                    <button
                      onClick={() => onAddItemToGroup?.(group.id)}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1 font-semibold transition-all cursor-pointer"
                      title="Tambah item pesanan ke grup ini"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Item</span>
                    </button>
                    <button
                      onClick={() => onDeleteGroup?.(group.id)}
                      className="text-xs text-slate-400 hover:text-red-600 p-1 rounded transition-all cursor-pointer"
                      title="Hapus grup ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs">
                    <tr>
                      <th className="py-3 px-4 w-1/3">Nama Barang</th>
                      <th className="py-3 px-4 w-1/3">Nomor Pesanan</th>
                      <th className="py-3 px-4">Ekspedisi</th>
                      <th className="py-3 px-4">Status / Catatan</th>
                      {isEditMode && <th className="py-3 px-4 text-right no-print">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleItems.length === 0 ? (
                      <tr>
                        <td colSpan={isEditMode ? 5 : 4} className="py-4 text-center text-slate-400 text-xs italic">
                          Tidak ada pesanan yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      visibleItems.map((item) => (
                        <tr key={item.id} className="item-row hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-600">
                            <button
                              type="button"
                              onClick={() => handleCopyOrder(item.orderNumber, item.id)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 transition-all cursor-pointer group active:scale-95"
                              title="Klik untuk salin nomor pesanan"
                            >
                              <span className="select-all font-semibold">{item.orderNumber}</span>
                              {copiedOrderId === item.id ? (
                                <span className="text-[10px] text-emerald-600 font-bold">✓ Tersalin!</span>
                              ) : (
                                <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">📋</span>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${getCourierBadge(
                                item.courier
                              )}`}
                            >
                              {item.courier}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.isKayu && (
                                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-md font-semibold border border-amber-200 anim-kayu shadow-2xs">
                                  🪵 kayu
                                </span>
                              )}
                              {item.isTerlambat && (
                                <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-md font-bold border border-red-200 anim-terlambat shadow-2xs">
                                  ⚠️ TERLAMBAT
                                </span>
                              )}
                              {item.notes && (
                                <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded border border-slate-200">
                                  {item.notes}
                                </span>
                              )}
                              {!item.isKayu && !item.isTerlambat && !item.notes && (
                                <span className="text-slate-400 font-mono text-xs">-</span>
                              )}
                            </div>
                          </td>
                          {isEditMode && (
                            <td className="py-3 px-4 text-right no-print">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onEditItem?.(item, group.id)}
                                  className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all cursor-pointer"
                                  title="Edit pesanan"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteItem?.(item.id, group.id)}
                                  className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                                  title="Hapus pesanan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {visibleItems.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs italic">
                    Tidak ada pesanan yang sesuai filter.
                  </div>
                ) : (
                  visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className="item-row bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 relative"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-900 text-base">{item.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold uppercase border shrink-0 ${getCourierBadge(
                            item.courier
                          )}`}
                        >
                          {item.courier}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400 block uppercase font-medium">Nomor Pesanan</span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrder(item.orderNumber, item.id)}
                          className="font-mono text-xs text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 block mt-0.5 w-full text-left active:scale-[0.99] transition-transform flex items-center justify-between cursor-pointer hover:bg-indigo-50/60"
                        >
                          <span className="font-semibold">{item.orderNumber}</span>
                          {copiedOrderId === item.id ? (
                            <span className="text-[10px] text-emerald-600 font-bold">✓ Tersalin!</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Salin 📋</span>
                          )}
                        </button>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-slate-200">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.isKayu && (
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-semibold border border-amber-200 anim-kayu">
                              🪵 kayu
                            </span>
                          )}
                          {item.isTerlambat && (
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold border border-red-200 anim-terlambat">
                              ⚠️ TERLAMBAT
                            </span>
                          )}
                          {item.notes && (
                            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded">
                              {item.notes}
                            </span>
                          )}
                          {!item.isKayu && !item.isTerlambat && !item.notes && (
                            <span className="text-slate-400 font-mono text-xs">-</span>
                          )}
                        </div>

                        {isEditMode && (
                          <div className="flex items-center gap-2 no-print ml-auto">
                            <button
                              onClick={() => onEditItem?.(item, group.id)}
                              className="text-xs text-indigo-600 font-semibold p-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteItem?.(item.id, group.id)}
                              className="text-xs text-red-600 font-semibold p-1"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {groups.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm italic">
            Belum ada data pesanan belum kirim.
          </div>
        )}
      </div>
    </section>
  );
};
