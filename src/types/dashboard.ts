export interface DeliveryItem {
  id: string;
  name: string;
  orderNumber: string;
  courier: string;
  isKayu: boolean;
  isTerlambat: boolean;
  notes?: string;
}

export interface DeliveryGroup {
  id: string;
  title: string;
  items: DeliveryItem[];
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  notes: string;
  highlightType?: 'danger' | 'warning' | 'normal';
}

export interface DashboardData {
  title: string;
  subtitle: string;
  lastUpdated: string;
  warehouseStatus: string;
  deliverySectionTitle: string;
  deliveryGroups: DeliveryGroup[];
  stockSectionTitle: string;
  stockItems: StockItem[];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  source: 'ocr' | 'text' | 'manual' | 'restore' | 'initial';
  summary: string;
  data: DashboardData;
}
