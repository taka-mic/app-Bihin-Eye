export type ItemCategory = '設営系' | '展示系' | 'その他' | '消耗品';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  totalStock: number;
  notes: string;
}

export interface Assignment {
  itemId: string;
  quantity: number;
}

export interface Event {
  id: string;
  name: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  assignments: Assignment[];
}

export interface MailSettings {
  defaultTo: string;
  defaultRecipientName: string;
}

export type TransportStatus = '出荷準備' | '輸送中（往路）' | '会場' | '輸送中（復路）' | 'オフィス';
