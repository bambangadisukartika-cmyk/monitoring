import { useState, useEffect } from 'react';
import { initialDashboardData } from './data/initialData';
import { DashboardData, HistoryEntry, DeliveryItem, StockItem } from './types/dashboard';
import { ReadOnlyBanner } from './components/ReadOnlyBanner';
import { AdminBar } from './components/AdminBar';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { SearchAndFilters, FilterType } from './components/SearchAndFilters';
import { DeliverySection } from './components/DeliverySection';
import { StockSection } from './components/StockSection';
import { UploadModal } from './components/UploadModal';
import { HistoryModal } from './components/HistoryModal';
import { ShareModal } from './components/ShareModal';
import { EditItemModal } from './components/EditItemModal';

const STORAGE_KEY_DATA = 'mbp_dashboard_data_v1';
const STORAGE_KEY_HISTORY = 'mbp_dashboard_history_v1';
const DEFAULT_ADMIN_KEY = 'mbp-admin-2026';

export default function App() {
  // State
  const [data, setData] = useState<DashboardData>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_DATA);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
    return initialDashboardData;
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'hist-init',
        timestamp: new Date().toISOString(),
        source: 'initial',
        summary: 'Data Awal Gudang PT. MBP',
        data: initialDashboardData
      }
    ];
  });

  const [adminKey, setAdminKey] = useState<string>(DEFAULT_ADMIN_KEY);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isPreviewingReadOnly, setIsPreviewingReadOnly] = useState<boolean>(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState<boolean>(false);
  const [editItemMode, setEditItemMode] = useState<
    'add-delivery' | 'edit-delivery' | 'add-stock' | 'edit-stock'
  >('add-delivery');
  const [targetDeliveryItem, setTargetDeliveryItem] = useState<DeliveryItem | null>(null);
  const [targetStockItem, setTargetStockItem] = useState<StockItem | null>(null);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Check URL query parameters: ONLY allow edit mode if ?key=mbp-admin-2026 is explicitly in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyInUrl = urlParams.get('key') || urlParams.get('admin');

    if (keyInUrl && (keyInUrl === DEFAULT_ADMIN_KEY || keyInUrl === 'mbp-admin-2026')) {
      setIsEditMode(true);
      setAdminKey(keyInUrl);
    } else {
      // Public link without ?key=... is ALWAYS 100% strictly read-only
      setIsEditMode(false);
      localStorage.removeItem('mbp_auth_key');
    }
  }, []);

  // Fetch latest data from server
  useEffect(() => {
    fetch('/api/data')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((resData) => {
        if (resData.currentData) {
          setData(resData.currentData);
          localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(resData.currentData));
        }
        if (resData.history && Array.isArray(resData.history)) {
          setHistory(resData.history);
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(resData.history));
        }
        if (resData.adminKey) {
          setAdminKey(resData.adminKey);
        }
      })
      .catch((err) => {
        // Fallback to localStorage if server isn't ready
        console.log('Serving from local cache:', err);
      });
  }, []);

  // Sync data to server & localStorage
  const persistData = (newData: DashboardData, source: 'ocr' | 'text' | 'manual', summary: string) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(newData));

    const newHistoryEntry: HistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      source,
      summary,
      data: newData
    };

    const updatedHistory = [newHistoryEntry, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));

    // Async push to server
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: newData,
        source,
        summary,
        adminKey
      })
    }).catch((err) => {
      console.warn('Could not sync to server API, saved locally:', err);
    });

    showToast('✓ Data berhasil disimpan dan diperbarui!');
  };

  // History operations
  const handleRestore = (historyId: string) => {
    const entry = history.find((h) => h.id === historyId);
    if (!entry) return;

    setData(entry.data);
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(entry.data));

    const restoreEntry: HistoryEntry = {
      id: `hist-restore-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'restore',
      summary: `Pulihkan snapshot: ${entry.summary}`,
      data: entry.data
    };
    const updatedHistory = [restoreEntry, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updatedHistory));

    fetch('/api/history/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ historyId, adminKey })
    }).catch(() => {});

    setIsHistoryOpen(false);
    showToast('✓ Versi sebelumnya berhasil dipulihkan!');
  };

  const handleDeleteHistoryItem = (historyId: string) => {
    const filtered = history.filter((h) => h.id !== historyId);
    setHistory(filtered);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));

    fetch(`/api/history/${historyId}?adminKey=${adminKey}`, { method: 'DELETE' }).catch(() => {});
    showToast('Riwayat berhasil dihapus.');
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Yakin ingin menghapus semua catatan riwayat?')) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      fetch(`/api/history?adminKey=${adminKey}`, { method: 'DELETE' }).catch(() => {});
      showToast('Semua riwayat telah dibersihkan.');
    }
  };

  // Reset to initial
  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan dashboard ke format dan data awal?')) {
      persistData(initialDashboardData, 'manual', 'Reset ke data bawaan');
    }
  };

  // URL generation: Convert internal ais-dev- URLs to public ais-pre- so anyone can access it!
  const getShareableBase = () => {
    let base = window.location.origin;
    if (base.includes('ais-dev-')) {
      base = base.replace('ais-dev-', 'ais-pre-');
    }
    return base;
  };

  const shareableBase = getShareableBase();
  const publicUrl = `${shareableBase}/`;
  const editUrl = `${shareableBase}/?key=${adminKey}`;

  // Copy Edit Link
  const handleCopyEditLink = () => {
    navigator.clipboard.writeText(editUrl);
    showToast('🔑 Link khusus edit berhasil disalin! Simpan di bookmark Anda.');
  };



  // Delivery item operations
  const handleSaveDeliveryItem = (item: DeliveryItem, groupId: string) => {
    const updatedGroups = [...data.deliveryGroups];
    let targetGrp = updatedGroups.find((g) => g.id === groupId);

    if (!targetGrp) {
      // If groupId is new
      targetGrp = {
        id: groupId,
        title: 'PESANAN BARU',
        items: []
      };
      updatedGroups.push(targetGrp);
    }

    const existingIdx = targetGrp.items.findIndex((i) => i.id === item.id);
    if (existingIdx >= 0) {
      targetGrp.items[existingIdx] = item;
    } else {
      targetGrp.items.push(item);
    }

    persistData(
      { ...data, deliveryGroups: updatedGroups },
      'manual',
      `Edit pesanan: ${item.name}`
    );
  };

  const handleDeleteDeliveryItem = (itemId: string, groupId: string) => {
    const updatedGroups = data.deliveryGroups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        items: g.items.filter((i) => i.id !== itemId)
      };
    });

    persistData(
      { ...data, deliveryGroups: updatedGroups },
      'manual',
      'Hapus 1 pesanan'
    );
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Hapus seluruh grup pesanan ini?')) {
      const updatedGroups = data.deliveryGroups.filter((g) => g.id !== groupId);
      persistData(
        { ...data, deliveryGroups: updatedGroups },
        'manual',
        'Hapus grup pesanan'
      );
    }
  };

  // Stock operations
  const handleSaveStockItem = (item: StockItem) => {
    const updatedStock = [...data.stockItems];
    const existingIdx = updatedStock.findIndex((s) => s.id === item.id);
    if (existingIdx >= 0) {
      updatedStock[existingIdx] = item;
    } else {
      updatedStock.push(item);
    }

    persistData(
      { ...data, stockItems: updatedStock },
      'manual',
      `Edit stok: ${item.name} (${item.quantity})`
    );
  };

  const handleDeleteStockItem = (itemId: string) => {
    const updatedStock = data.stockItems.filter((s) => s.id !== itemId);
    persistData(
      { ...data, stockItems: updatedStock },
      'manual',
      'Hapus item stok'
    );
  };

  // Summary counts
  const totalOrders = data.deliveryGroups.reduce((acc, g) => acc + g.items.length, 0);
  const totalTerlambat = data.deliveryGroups.reduce(
    (acc, g) => acc + g.items.filter((i) => i.isTerlambat).length,
    0
  );
  const totalKayu = data.deliveryGroups.reduce(
    (acc, g) => acc + g.items.filter((i) => i.isKayu).length,
    0
  );
  const totalStockUnits = data.stockItems.reduce((acc, s) => acc + s.quantity, 0);

  // Read-only state is when user has no edit permissions OR is previewing as public viewer
  const effectiveIsReadOnly = !isEditMode || isPreviewingReadOnly;

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen pb-12 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      <div>
        {/* Top Bar: Either ReadOnly Banner or Admin Bar */}
        {effectiveIsReadOnly ? (
          <ReadOnlyBanner
            onOpenShare={() => setIsShareOpen(true)}
          />
        ) : (
          <AdminBar
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenAddItem={(type) => {
              setEditItemMode(type === 'delivery' ? 'add-delivery' : 'add-stock');
              setTargetDeliveryItem(null);
              setTargetStockItem(null);
              setTargetGroupId(null);
              setIsEditItemOpen(true);
            }}
            onOpenShare={() => setIsShareOpen(true)}
            onCopyEditLink={handleCopyEditLink}
            onTogglePreview={() => setIsPreviewingReadOnly(!isPreviewingReadOnly)}
            isPreviewingReadOnly={isPreviewingReadOnly}
            onResetToDefault={handleResetToDefault}
          />
        )}

        {/* If in Preview Read-Only mode, show quick float notice */}
        {isEditMode && isPreviewingReadOnly && (
          <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 no-print shadow-sm">
            <span>👁️ Anda sedang melihat Pratinjau Tampilan Read-Only (Publik).</span>
            <button
              onClick={() => setIsPreviewingReadOnly(false)}
              className="bg-slate-950 text-white px-2 py-0.5 rounded text-[11px] hover:bg-slate-800 cursor-pointer"
            >
              Kembali ke Mode Edit
            </button>
          </div>
        )}

        {/* Header Section */}
        <Header
          title={data.title}
          subtitle={data.subtitle}
          warehouseStatus={data.warehouseStatus}
          lastUpdated={data.lastUpdated}
        />

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 space-y-8 animate-fade-in-up">
          {/* Summary Cards */}
          <SummaryCards
            totalOrders={totalOrders}
            totalTerlambat={totalTerlambat}
            totalKayu={totalKayu}
            totalStockUnits={totalStockUnits}
          />

          {/* Search & Filter Controls */}
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Section 1: Belum Kirim */}
          <DeliverySection
            sectionTitle={data.deliverySectionTitle}
            groups={data.deliveryGroups}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            isEditMode={!effectiveIsReadOnly}
            onEditItem={(item, groupId) => {
              setEditItemMode('edit-delivery');
              setTargetDeliveryItem(item);
              setTargetGroupId(groupId);
              setIsEditItemOpen(true);
            }}
            onDeleteItem={handleDeleteDeliveryItem}
            onAddItemToGroup={(groupId) => {
              setEditItemMode('add-delivery');
              setTargetDeliveryItem(null);
              setTargetGroupId(groupId);
              setIsEditItemOpen(true);
            }}
            onDeleteGroup={handleDeleteGroup}
          />

          {/* Section 2: Stok Tangerang Titip di PT. MBP */}
          <StockSection
            sectionTitle={data.stockSectionTitle}
            items={data.stockItems}
            searchQuery={searchQuery}
            isEditMode={!effectiveIsReadOnly}
            onEditItem={(item) => {
              setEditItemMode('edit-stock');
              setTargetStockItem(item);
              setIsEditItemOpen(true);
            }}
            onDeleteItem={handleDeleteStockItem}
            onAddItem={() => {
              setEditItemMode('add-stock');
              setTargetStockItem(null);
              setIsEditItemOpen(true);
            }}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-12 text-center text-slate-500 text-xs no-print">
        <p>Dashboard Monitoring Pengiriman & Stok © 2026 PT. MBG</p>
      </footer>

      {/* Upload & Zero-Token OCR Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        existingData={data}
        onSaveData={(newData, source, summary) => {
          persistData(newData, source, summary);
        }}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestore}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearAllHistory={handleClearAllHistory}
      />

      {/* Share / Export Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        publicUrl={publicUrl}
        editUrl={editUrl}
        isEditMode={isEditMode}
      />

      {/* Add / Edit Item Modal */}
      <EditItemModal
        isOpen={isEditItemOpen}
        onClose={() => setIsEditItemOpen(false)}
        mode={editItemMode}
        targetDeliveryItem={targetDeliveryItem}
        targetStockItem={targetStockItem}
        targetGroupId={targetGroupId}
        groups={data.deliveryGroups}
        onSaveDelivery={handleSaveDeliveryItem}
        onSaveStock={handleSaveStockItem}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold z-50 animate-in slide-in-from-bottom duration-200 border border-slate-700 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
