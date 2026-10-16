import { DashboardData, DeliveryGroup, DeliveryItem, StockItem } from '../types/dashboard';

/**
 * Normalizes courier names to standardized uppercase / casing.
 */
export function normalizeCourier(raw: string): string {
  const clean = raw.trim().toLowerCase();
  if (clean.includes('j&t') || clean.includes('jnt')) return 'J&T';
  if (clean.includes('jne')) return 'JNE';
  if (clean.includes('sicepat')) return 'SiCepat';
  if (clean.includes('spx') || clean.includes('shopee express')) return 'SPX';
  if (clean.includes('anteraja')) return 'AnterAja';
  if (clean.includes('ninja')) return 'Ninja';
  if (clean.includes('wahana')) return 'Wahana';
  if (clean.includes('cargo') || clean.includes('kargo')) return 'Cargo';
  if (clean.includes('gosend') || clean.includes('go-send')) return 'GoSend';
  if (clean.includes('grab')) return 'Grab';
  if (clean.includes('pos')) return 'POS';
  return raw.trim().toUpperCase() || 'J&T';
}

/**
 * Deterministic parser for delivery and stock list notes (e.g. from WhatsApp).
 * Requires ZERO AI tokens - runs 100% locally.
 */
export function parseWhatsAppNote(rawText: string, existingData?: DashboardData): DashboardData {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  let currentSection: 'NONE' | 'BELUM_KIRIM' | 'STOK' = 'NONE';
  let deliverySectionTitle = existingData?.deliverySectionTitle || 'BELUM KIRIM';
  let stockSectionTitle = existingData?.stockSectionTitle || 'STOK TANGERANG TITIP DI PT. MBP';
  
  const deliveryGroups: DeliveryGroup[] = [];
  let currentGroup: DeliveryGroup | null = null;
  const stockItems: StockItem[] = [];

  // Patterns for noise lines to ignore
  const isNoise = (line: string): boolean => {
    const l = line.toLowerCase();
    if (/^diedit\s+\d{1,2}[.:]\d{2}/i.test(l)) return true;
    if (/^diteruskan/i.test(l)) return true;
    if (/^\d{1,2}[.:]\d{2}\s*(am|pm)?$/i.test(l)) return true;
    if (l === 'read-only' || l === 'pending delivery') return true;
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isNoise(line)) continue;

    // Detect section transitions
    if (/^BELUM\s+KIRIM\b/i.test(line)) {
      currentSection = 'BELUM_KIRIM';
      const cleanHeader = line.replace(/[:\-]+$/, '').trim();
      if (cleanHeader) deliverySectionTitle = cleanHeader.toUpperCase();
      continue;
    }

    if (/^STOK\b|^TITIP\b|^INVENTARIS\b/i.test(line)) {
      currentSection = 'STOK';
      const cleanHeader = line.replace(/[:\-]+$/, '').trim();
      if (cleanHeader) {
        // Standardize header e.g. "STOK TANGERANG TITIP DI PT. MBG"
        let title = cleanHeader.toUpperCase();
        if (title.includes('MBP')) {
          title = title.replace('MBP', 'MBG');
        }
        if (!title.includes('PT. MBG') && title.includes('MBG')) {
          title = title.replace('MBG', 'PT. MBG');
        }
        stockSectionTitle = title;
      }
      continue;
    }

    // Default to BELUM_KIRIM if no explicit header found yet and group headers appear
    if (currentSection === 'NONE') {
      if (/^(SHOPE|SHOPEE|TOKOPEDIA|TIKTOK|LAZADA|OFFLINE|GUDANG)\b/i.test(line)) {
        currentSection = 'BELUM_KIRIM';
      }
    }

    if (currentSection === 'BELUM_KIRIM') {
      // Check if this line is a sub-group header
      // e.g. "SHOPE MT 12/10", "SHOPEE MT 14/10", "SHOPE TANGSEL 14/10"
      const isGroupHeader = 
        /^(SHOPE|SHOPEE|TOKOPEDIA|TIKTOK|LAZADA|OFFLINE|GUDANG|ORDER|BATCH)\b/i.test(line) ||
        (/\b\d{1,2}\/\d{1,2}\b/.test(line) && !line.includes(',') && !/[0-9]{5,}[A-Z0-9]/.test(line));

      if (isGroupHeader) {
        let title = line.toUpperCase().trim();
        // Standardize SHOPE to SHOPEE for consistent clean branding
        title = title.replace(/\bSHOPE\b/g, 'SHOPEE');

        const groupId = `group-${Date.now()}-${deliveryGroups.length}-${Math.random().toString(36).substring(2, 6)}`;
        currentGroup = {
          id: groupId,
          title,
          items: []
        };
        deliveryGroups.push(currentGroup);
        continue;
      }

      // If we don't have an active group yet, create a default one
      if (!currentGroup) {
        const groupId = `group-${Date.now()}-${deliveryGroups.length}`;
        currentGroup = {
          id: groupId,
          title: 'PESANAN REGULER',
          items: []
        };
        deliveryGroups.push(currentGroup);
      }

      // Parse delivery item
      // Examples:
      // "Expo 770 hitam kayu, 2610107PDQBYWE, j&t TERLAMBAT"
      // "Ks 10000, 261012EESPK9JF, j&t TERLAMBAT"
      // "Rtw 120l 5ch kayu, 261013HHTMPPBT, j&t"
      // "Cf 310, 261014JYMXDMHD, jne"
      const isKayu = /\bkayu\b/i.test(line);
      const isTerlambat = /\b(terlambat|telat|late|warning)\b/i.test(line);

      // Extract Order Number: usually 10-18 alphanumeric characters like 2610107PDQBYWE or 261012EN9JDAMF
      // Shopee order IDs typically start with numbers like 2610... followed by letters/digits
      const orderMatch = line.match(/\b([0-9]{4,}[A-Z0-9]{6,}|[A-Z0-9]{12,18})\b/i);
      const orderNumber = orderMatch ? orderMatch[1].toUpperCase() : '';

      // Extract courier
      let courier = 'J&T';
      const courierMatch = line.match(/\b(j&t|jnt|jne|sicepat|spx|shopee\s*express|anteraja|ninja|cargo|pos|grab|gosend)\b/i);
      if (courierMatch) {
        courier = normalizeCourier(courierMatch[1]);
      }

      // Extract Item Name
      // We remove the order number, courier, keywords 'kayu', 'terlambat', and punctuation
      let namePart = line;
      if (orderNumber) {
        namePart = namePart.replace(new RegExp(`\\b${orderNumber}\\b`, 'gi'), '');
      }
      if (courierMatch) {
        namePart = namePart.replace(new RegExp(`\\b${courierMatch[0]}\\b`, 'gi'), '');
      }
      // Remove flags
      namePart = namePart
        .replace(/\bkayu\b/gi, '')
        .replace(/\bterlambat\b/gi, '')
        .replace(/[,;:]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // If commas were used originally: e.g. "Expo 770 hitam kayu, 2610107PDQBYWE, j&t"
      const commaSplit = line.split(',');
      if (commaSplit.length >= 2) {
        const candidateName = commaSplit[0]
          .replace(/\bkayu\b/gi, '')
          .replace(/\bterlambat\b/gi, '')
          .trim();
        if (candidateName.length > 1) {
          namePart = candidateName;
        }
      }

      // Capitalize first letter of item name nicely
      const cleanName = namePart.length > 0 
        ? namePart.charAt(0).toUpperCase() + namePart.slice(1)
        : `Item #${currentGroup.items.length + 1}`;

      currentGroup.items.push({
        id: `deliv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        orderNumber: orderNumber || '-',
        courier,
        isKayu,
        isTerlambat,
        notes: ''
      });
    } else if (currentSection === 'STOK') {
      // Parse Stock item
      // Examples:
      // "Gm dh3p 1 perlu di perbaiki"
      // "Wk 120 2"
      // "Loyang 3cm chefprimax 16 (utamakan habiskan ini)"
      // "Ab 108 3 13/10 mbg belum bayar 1 unit"
      
      let highlightType: 'danger' | 'warning' | 'normal' = 'normal';
      let notes = '-';

      // Check for notes keywords
      if (/perlu\s+di\s*perbaiki|rusak|kendala/i.test(line)) {
        highlightType = 'danger';
        notes = '🛠️ Perlu di perbaiki';
      } else if (/utamakan\s+habiskan|urgent|prioritas/i.test(line)) {
        highlightType = 'warning';
        notes = '🔥 Utamakan habiskan ini';
      } else if (/belum\s+bayar/i.test(line)) {
        highlightType = 'danger';
        // Extract note like "13/10 mbg belum bayar 1 unit"
        const noteMatch = line.match(/(\d{1,2}\/\d{1,2}.*belum\s+bayar.*|\bbelum\s+bayar.*)/i);
        notes = noteMatch ? `💳 ${noteMatch[1].trim()}` : '💳 Belum bayar';
      } else {
        // Check for parenthesized notes e.g. (catatan khusus)
        const parenMatch = line.match(/\((.*?)\)/);
        if (parenMatch) {
          notes = parenMatch[1].trim();
        }
      }

      // Now determine quantity and item name
      // Remove any trailing notes or parenthesized info
      let coreLine = line
        .replace(/\(.*?\)/g, '')
        .replace(/perlu\s+di\s*perbaiki.*/i, '')
        .replace(/utamakan\s+habiskan.*/i, '')
        .replace(/\b\d{1,2}\/\d{1,2}\s+mbg\s+belum\s+bayar.*/i, '')
        .replace(/\bbelum\s+bayar.*/i, '')
        .trim();

      // The quantity is typically the last number in coreLine
      // Example: "Gm dh3p 1" -> last number is 1, item is "Gm dh3p"
      // "Wk 120 2" -> last number is 2, item is "Wk 120"
      // "Loyang 3cm chefprimax 16" -> last number is 16, item is "Loyang 3cm chefprimax"
      // "Ab 108 3" -> last number is 3, item is "Ab 108"
      const numberMatch = coreLine.match(/(.*?)(?:\s+|^)(\d+)\s*$/);
      let quantity = 1;
      let itemName = coreLine;

      if (numberMatch && numberMatch[1].trim().length > 0) {
        itemName = numberMatch[1].trim();
        quantity = parseInt(numberMatch[2], 10) || 1;
      } else {
        // Fallback: check if line ends with digits or unit
        const fallbackMatch = coreLine.match(/(.*?)\s+(\d+)\s*(unit|pcs|set)?$/i);
        if (fallbackMatch && fallbackMatch[1].trim().length > 0) {
          itemName = fallbackMatch[1].trim();
          quantity = parseInt(fallbackMatch[2], 10) || 1;
        }
      }

      const formattedName = itemName.length > 0
        ? itemName.charAt(0).toUpperCase() + itemName.slice(1)
        : `Item Stok #${stockItems.length + 1}`;

      stockItems.push({
        id: `stock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: formattedName,
        quantity,
        notes,
        highlightType
      });
    }
  }

  // Check which sections were actively present in the note
  const hasDeliverySection = /BELUM\s+KIRIM|SHOPE|SHOPEE|TOKOPEDIA|TIKTOK|PESANAN/i.test(rawText);
  const hasStockSection = /STOK|TITIP|INVENTARIS/i.test(rawText);

  // If a section was provided, it cleanly OVERWRITES the previous data (niban data lama)
  const finalDeliveryGroups = hasDeliverySection 
    ? deliveryGroups 
    : (deliveryGroups.length > 0 ? deliveryGroups : (existingData?.deliveryGroups || []));

  const finalStockItems = hasStockSection 
    ? stockItems 
    : (stockItems.length > 0 ? stockItems : (existingData?.stockItems || []));

  return {
    title: existingData?.title || 'Sistem Pemantauan Pesanan Belum Kirim & Titipan Stok PT. MBG',
    subtitle: existingData?.subtitle || 'Dashboard Monitoring Pengiriman & Stok © 2026 PT. MBG',
    lastUpdated: new Date().toISOString(),
    warehouseStatus: existingData?.warehouseStatus || 'Status Gudang Active',
    deliverySectionTitle,
    deliveryGroups: finalDeliveryGroups,
    stockSectionTitle,
    stockItems: finalStockItems
  };
}
