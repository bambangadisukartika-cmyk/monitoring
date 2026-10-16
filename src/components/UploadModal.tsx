import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Clipboard, FileText, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { recognizeImageLocally, OcrProgress } from '../utils/ocr';
import { parseWhatsAppNote } from '../utils/parser';
import { DashboardData } from '../types/dashboard';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveData: (newData: DashboardData, source: 'ocr' | 'text', summary: string) => void;
  existingData: DashboardData;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSaveData,
  existingData
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [rawText, setRawText] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<DashboardData | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default sample text matching user's exact note format
  const sampleNoteText = `BELUM KIRIM : 
SHOPE MT 12/10
Expo 770 hitam kayu, 2610107PDQBYWE, j&t TERLAMBAT
Ks 10000, 261012EESPK9JF, j&t TERLAMBAT

SHOPE MT 13/10
Tf 1000sn kayu, 261012EN9JDAMF, j&t

SHOPE MT 14/10
Rtw 120l 5ch kayu, 261013HHTMPPBT, j&t
102g kayu, 261014JSY25EDE, j&t
Ysn st6 & gm dz 400, 261014JUQP24F0, j&t
Cf 310, 261014JYMXDMHD, jne
Cf 460 kayu, 261014K9K0YS7W, jne

SHOPE TANGSEL 14/10
12ssgce kayu, 261014JQS4SR3Y, jne

STOK TANGERANG TITIP DI MBG
Gm dh3p 1 perlu di perbaiki
Wk 120 2
Wk 150 1
Xs 110 1
Loyang 3cm gomesin 91
Loyang 3cm chefprimax 16 (utamakan habiskan ini)
De 08a 1
Ruby 200 2
Ruby 240 1
Gsp 650 1
Ab 108 3 13/10 mbg belum bayar 1 unit`;

  // Parse text whenever rawText changes
  useEffect(() => {
    if (rawText.trim()) {
      try {
        const parsed = parseWhatsAppNote(rawText, existingData);
        setParsedPreview(parsed);
      } catch (err) {
        console.error('Parsing error:', err);
      }
    } else {
      setParsedPreview(null);
    }
  }, [rawText, existingData]);

  // Global paste handler when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      // Check if active element is already a textarea or input
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
        return; // let native paste happen
      }

      if (e.clipboardData) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              handleImageFile(blob);
              setActiveTab('image');
              e.preventDefault();
              return;
            }
          }
        }

        // If text was pasted
        const pastedText = e.clipboardData.getData('text');
        if (pastedText && pastedText.trim().length > 10) {
          setRawText(pastedText);
          setActiveTab('text');
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleImageFile = async (file: File | Blob) => {
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setOcrError(null);
    setIsProcessingOcr(true);
    setOcrProgress({ status: 'Memulai OCR lokal di browser...', progress: 0 });

    try {
      const extracted = await recognizeImageLocally(file, (progress) => {
        setOcrProgress(progress);
      });

      setRawText(extracted);
      setIsProcessingOcr(false);
      setOcrProgress(null);
    } catch (err: any) {
      console.error('OCR Error:', err);
      setIsProcessingOcr(false);
      setOcrError('Gagal membaca gambar secara lokal. Silakan coba gambar dengan kontras lebih tinggi atau paste teks langsung.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageFile(file);
        setActiveTab('image');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleImageFile(file);
    }
  };

  const handleSave = () => {
    if (!parsedPreview) return;
    const totalOrders = parsedPreview.deliveryGroups.reduce((acc, g) => acc + g.items.length, 0);
    const summary = `Update (Menimpa Data Lama) ${activeTab === 'image' ? 'via Foto OCR' : 'via Teks'}: ${totalOrders} pesanan & ${parsedPreview.stockItems.length} item stok`;
    onSaveData(parsedPreview, activeTab === 'image' ? 'ocr' : 'text', summary);
    onClose();
  };

  if (!isOpen) return null;

  const totalOrders = parsedPreview?.deliveryGroups.reduce((acc, g) => acc + g.items.length, 0) || 0;
  const totalTerlambat = parsedPreview?.deliveryGroups.reduce(
    (acc, g) => acc + g.items.filter((i) => i.isTerlambat).length,
    0
  ) || 0;
  const totalKayu = parsedPreview?.deliveryGroups.reduce(
    (acc, g) => acc + g.items.filter((i) => i.isKayu).length,
    0
  ) || 0;
  const totalStockUnits = parsedPreview?.stockItems.reduce((acc, s) => acc + s.quantity, 0) || 0;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto no-print">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Update Data Pesanan & Stok</h2>
              <p className="text-xs text-slate-300">
                100% Tanpa Token AI • Diproses langsung di browser Anda secara instan
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-3 px-4 font-semibold text-xs sm:text-sm border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'image'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>Upload / Paste Foto (Ctrl+V)</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`pb-3 px-4 font-semibold text-xs sm:text-sm border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'text'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ketik / Paste Teks Langsung</span>
          </button>
        </div>

        {/* Overwrite Notification */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center gap-2">
          <span className="bg-amber-200 text-amber-950 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0">
            ⚡ Mode Timpa Otomatis
          </span>
          <span>Data baru yang diunggah/dipaste akan <strong>otomatis langsung menimpa data sebelumnya</strong>. Versi lama tetap tersimpan di Riwayat.</span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'image' ? (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Klik untuk pilih foto, drag file ke sini, atau tekan{' '}
                      <kbd className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-xs font-bold">
                        Ctrl+V
                      </kbd>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Mendukung screenshot format JPG, PNG, WebP (seperti tangkapan layar WhatsApp)
                    </p>
                  </div>
                </div>
              </div>

              {/* OCR Progress / Loading State */}
              {isProcessingOcr && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      Membaca teks dari gambar tanpa AI (Tesseract.js WASM)...
                    </span>
                    <span>{ocrProgress?.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress?.progress || 10}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* OCR Error */}
              {ocrError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ocrError}</span>
                </div>
              )}

              {/* Preview image & extracted text */}
              {imagePreview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                    <p className="text-xs font-bold text-slate-700 uppercase">Gambar yang Diunggah:</p>
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="max-h-60 rounded-lg object-contain mx-auto border border-slate-200"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 flex flex-col">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700 uppercase">
                        Hasil Baca Teks (Bisa Diedit):
                      </p>
                      <button
                        onClick={() => handleImageFile(fileInputRef.current?.files?.[0] || new Blob())}
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Baca Ulang</span>
                      </button>
                    </div>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      rows={8}
                      className="w-full p-2.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 resize-y"
                      placeholder="Teks yang diekstrak akan muncul di sini..."
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Text Mode */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Paste atau Ketik Teks Catatan Pengiriman:
                </label>
                <button
                  type="button"
                  onClick={() => setRawText(sampleNoteText)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
                >
                  Gunakan Contoh Format Catatan
                </button>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={10}
                className="w-full p-3 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder={`Paste pesan WhatsApp di sini, contoh:\nBELUM KIRIM :\nSHOPE MT 12/10\nExpo 770 hitam kayu, 2610107PDQBYWE, j&t TERLAMBAT\n...\nSTOK TANGERANG TITIP DI PT. MBP\nGm dh3p 1 perlu di perbaiki\n...`}
              />
            </div>
          )}

          {/* Real-time Parsed Summary Preview */}
          {parsedPreview && (
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau Hasil Pembacaan Sistem:</span>
                </h4>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Siap Diterapkan
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">Pesanan Terdeteksi</p>
                  <p className="text-lg font-bold text-slate-800">{totalOrders} Item</p>
                  <p className="text-[10px] text-slate-500">{parsedPreview.deliveryGroups.length} Grup</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">Terlambat</p>
                  <p className="text-lg font-bold text-red-600">{totalTerlambat} Item</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">Packing Kayu</p>
                  <p className="text-lg font-bold text-amber-600">{totalKayu} Item</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-400 font-medium">Total Stok</p>
                  <p className="text-lg font-bold text-emerald-600">{totalStockUnits} Unit</p>
                  <p className="text-[10px] text-slate-500">{parsedPreview.stockItems.length} Jenis Barang</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            disabled={!parsedPreview || isProcessingOcr}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md cursor-pointer ${
              !parsedPreview || isProcessingOcr
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>⚡ Terapkan & Timpa Data Sebelumnya (Overwrite)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
