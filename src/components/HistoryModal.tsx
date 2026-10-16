import React from 'react';
import { X, History, RotateCcw, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { HistoryEntry } from '../types/dashboard';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onRestore: (historyId: string) => void;
  onDeleteHistoryItem: (historyId: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onDeleteHistoryItem,
  onClearAllHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto no-print">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Riwayat Pembaruan Data</h2>
              <p className="text-xs text-slate-300">
                Setiap pembaruan otomatis dicatat. Anda bisa memulihkan atau menghapus versi sebelumnya.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm">Belum ada riwayat pembaruan yang tersimpan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => {
                const totalOrders = item.data.deliveryGroups.reduce(
                  (acc, g) => acc + g.items.length,
                  0
                );
                const totalStock = item.data.stockItems.reduce((acc, s) => acc + s.quantity, 0);

                const sourceLabel =
                  item.source === 'ocr'
                    ? 'Foto OCR'
                    : item.source === 'text'
                    ? 'Teks Langsung'
                    : item.source === 'restore'
                    ? 'Pemulihan'
                    : item.source === 'initial'
                    ? 'Data Bawaan'
                    : 'Manual';

                const sourceColor =
                  item.source === 'ocr'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : item.source === 'text'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : item.source === 'restore'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                return (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${sourceColor}`}>
                          {sourceLabel}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.timestamp).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded">
                            Saat Ini
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-slate-900">{item.summary}</p>
                      <p className="text-xs text-slate-500">
                        {totalOrders} Pesanan ({item.data.deliveryGroups.length} grup) • {totalStock} Unit Stok
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onRestore(item.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="Pulihkan data ke versi ini"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Pulihkan</span>
                      </button>

                      <button
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                        title="Hapus riwayat ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {history.length > 0 && (
            <button
              onClick={onClearAllHistory}
              className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Semua Riwayat</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
