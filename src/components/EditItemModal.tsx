import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { DeliveryGroup, DeliveryItem, StockItem } from '../types/dashboard';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add-delivery' | 'edit-delivery' | 'add-stock' | 'edit-stock';
  targetDeliveryItem?: DeliveryItem | null;
  targetStockItem?: StockItem | null;
  targetGroupId?: string | null;
  groups: DeliveryGroup[];
  onSaveDelivery: (item: DeliveryItem, groupId: string) => void;
  onSaveStock: (item: StockItem) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  mode,
  targetDeliveryItem,
  targetStockItem,
  targetGroupId,
  groups,
  onSaveDelivery,
  onSaveStock
}) => {
  // Delivery form fields
  const [deliveryName, setDeliveryName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [courier, setCourier] = useState('J&T');
  const [isKayu, setIsKayu] = useState(false);
  const [isTerlambat, setIsTerlambat] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newGroupTitle, setNewGroupTitle] = useState('');

  // Stock form fields
  const [stockName, setStockName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [stockNotes, setStockNotes] = useState('');
  const [highlightType, setHighlightType] = useState<'normal' | 'warning' | 'danger'>('normal');

  useEffect(() => {
    if (mode === 'edit-delivery' && targetDeliveryItem) {
      setDeliveryName(targetDeliveryItem.name);
      setOrderNumber(targetDeliveryItem.orderNumber);
      setCourier(targetDeliveryItem.courier);
      setIsKayu(targetDeliveryItem.isKayu);
      setIsTerlambat(targetDeliveryItem.isTerlambat);
      setDeliveryNotes(targetDeliveryItem.notes || '');
      setSelectedGroupId(targetGroupId || (groups[0]?.id || ''));
    } else if (mode === 'add-delivery') {
      setDeliveryName('');
      setOrderNumber('');
      setCourier('J&T');
      setIsKayu(false);
      setIsTerlambat(false);
      setDeliveryNotes('');
      setSelectedGroupId(targetGroupId || (groups[0]?.id || ''));
    } else if (mode === 'edit-stock' && targetStockItem) {
      setStockName(targetStockItem.name);
      setQuantity(targetStockItem.quantity);
      setStockNotes(targetStockItem.notes);
      setHighlightType(targetStockItem.highlightType || 'normal');
    } else if (mode === 'add-stock') {
      setStockName('');
      setQuantity(1);
      setStockNotes('-');
      setHighlightType('normal');
    }
  }, [mode, targetDeliveryItem, targetStockItem, targetGroupId, groups]);

  if (!isOpen) return null;

  const isDelivery = mode === 'add-delivery' || mode === 'edit-delivery';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDelivery) {
      if (!deliveryName.trim()) return;
      const finalGroupId = selectedGroupId === 'NEW' && newGroupTitle.trim()
        ? `group-${Date.now()}`
        : selectedGroupId;

      const item: DeliveryItem = {
        id: targetDeliveryItem?.id || `item-${Date.now()}`,
        name: deliveryName.trim(),
        orderNumber: orderNumber.trim() || '-',
        courier: courier.trim() || 'J&T',
        isKayu,
        isTerlambat,
        notes: deliveryNotes.trim()
      };

      onSaveDelivery(item, finalGroupId);
    } else {
      if (!stockName.trim()) return;

      const item: StockItem = {
        id: targetStockItem?.id || `stock-${Date.now()}`,
        name: stockName.trim(),
        quantity: Math.max(1, quantity),
        notes: stockNotes.trim() || '-',
        highlightType
      };

      onSaveStock(item);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
        >
          ✕
        </button>

        <h3 className="font-bold text-slate-900 text-lg">
          {mode === 'add-delivery' && 'Tambah Pesanan Belum Kirim'}
          {mode === 'edit-delivery' && 'Edit Pesanan Belum Kirim'}
          {mode === 'add-stock' && 'Tambah Titipan Stok Barang'}
          {mode === 'edit-stock' && 'Edit Titipan Stok Barang'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {isDelivery ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Grup Pesanan:</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                  <option value="NEW">+ Buat Grup Baru</option>
                </select>
              </div>

              {selectedGroupId === 'NEW' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Grup Baru:</label>
                  <input
                    type="text"
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    placeholder="Contoh: SHOPEE MT 15/10"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Barang:</label>
                <input
                  type="text"
                  value={deliveryName}
                  onChange={(e) => setDeliveryName(e.target.value)}
                  placeholder="Contoh: Expo 770 hitam"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nomor Pesanan:</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Contoh: 2610107PDQBYWE"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ekspedisi:</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="J&T">J&T</option>
                  <option value="JNE">JNE</option>
                  <option value="SPX">SPX</option>
                  <option value="SiCepat">SiCepat</option>
                  <option value="AnterAja">AnterAja</option>
                  <option value="Cargo">Cargo</option>
                  <option value="GoSend">GoSend</option>
                  <option value="Grab">Grab</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isKayu}
                    onChange={(e) => setIsKayu(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>🪵 Packing Kayu</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-red-600">
                  <input
                    type="checkbox"
                    checked={isTerlambat}
                    onChange={(e) => setIsTerlambat(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span>⚠️ TERLAMBAT</span>
                </label>
              </div>
            </>
          ) : (
            /* Stock Form */
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Barang:</label>
                <input
                  type="text"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  placeholder="Contoh: Gm dh3p"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Jumlah (Unit):</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan / Status Khusus:</label>
                <input
                  type="text"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder="Contoh: 🛠️ Perlu di perbaiki, 🔥 Utamakan habiskan ini, atau -"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Highlight Warna Baris:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setHighlightType('normal')}
                    className={`p-2 rounded-lg text-xs font-semibold border text-center cursor-pointer ${
                      highlightType === 'normal'
                        ? 'border-slate-800 bg-slate-100 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Biasa (Putih)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighlightType('warning')}
                    className={`p-2 rounded-lg text-xs font-semibold border text-center cursor-pointer ${
                      highlightType === 'warning'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Kuning (Perhatian)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHighlightType('danger')}
                    className={`p-2 rounded-lg text-xs font-semibold border text-center cursor-pointer ${
                      highlightType === 'danger'
                        ? 'border-red-500 bg-red-50 text-red-800 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Merah (Penting/Rusak)
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
