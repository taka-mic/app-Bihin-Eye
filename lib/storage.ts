'use client';
import { Item, Event, MailSettings } from './types';

const ITEMS_KEY = 'bihin_items';
const EVENTS_KEY = 'bihin_events';
const MAIL_KEY = 'bihin_mail_settings';

const DEFAULT_ITEMS: Item[] = [
  { id: 'i1', name: 'ロールアップバナー①', category: '設営系', totalStock: 1, notes: '' },
  { id: 'i2', name: 'タペストリー②', category: '設営系', totalStock: 1, notes: '' },
  { id: 'i3', name: 'タペストリー③', category: '設営系', totalStock: 1, notes: '' },
  { id: 'i4', name: 'タペストリー④', category: '設営系', totalStock: 1, notes: '' },
  { id: 'i5', name: 'タペストリー⑤', category: '設営系', totalStock: 1, notes: '' },
  { id: 'i6', name: 'テーブルクロス①', category: '設営系', totalStock: 1, notes: '' },
  { id: 'i7', name: 'テーブルクロス②', category: '設営系', totalStock: 1, notes: '' },
  { id: 'i8', name: 'パネル④', category: '設営系', totalStock: 1, notes: '' },
  { id: 'i9', name: 'パネル⑤', category: '設営系', totalStock: 1, notes: '' },
  { id: 'i10', name: '展示会専用iPad①', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i11', name: '展示会専用iPad②', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i12', name: '展示会専用iPad③', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i13', name: '展示会専用iPad④', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i14', name: 'モニター', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i15', name: 'トルソー①', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i16', name: 'トルソー②', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i17', name: 'トルソー③', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i18', name: 'カタログスタンド①', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i19', name: 'カタログスタンド②', category: '展示系', totalStock: 1, notes: '' },
  { id: 'i20', name: 'DFreeベスト①', category: 'その他', totalStock: 1, notes: '' },
  { id: 'i21', name: 'DFreeベスト②', category: 'その他', totalStock: 1, notes: '' },
  { id: 'i22', name: 'DFreeベスト③', category: 'その他', totalStock: 1, notes: '' },
  { id: 'i23', name: 'DFreeベスト④', category: 'その他', totalStock: 1, notes: '' },
  { id: 'i24', name: 'DFreeベスト⑤', category: 'その他', totalStock: 1, notes: '' },
  { id: 'i25', name: 'スピーカーマイク', category: 'その他', totalStock: 1, notes: '' },
  { id: 'i26', name: '不織布バッグ', category: '消耗品', totalStock: 100, notes: '' },
  { id: 'i27', name: 'ノベルティー（ボールペン）', category: '消耗品', totalStock: 200, notes: '' },
];

function getSampleEvents(): Event[] {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };
  return [
    {
      id: 'e1',
      name: '春季展示会2026',
      location: '東京ビッグサイト',
      startDate: fmt(addDays(today, 10)),
      endDate: fmt(addDays(today, 12)),
      assignments: [
        { itemId: 'i1', quantity: 1 },
        { itemId: 'i2', quantity: 1 },
        { itemId: 'i6', quantity: 2 },
        { itemId: 'i10', quantity: 2 },
        { itemId: 'i14', quantity: 1 },
        { itemId: 'i20', quantity: 3 },
        { itemId: 'i26', quantity: 50 },
      ],
    },
    {
      id: 'e2',
      name: 'メドテック2026',
      location: 'パシフィコ横浜',
      startDate: fmt(addDays(today, 20)),
      endDate: fmt(addDays(today, 22)),
      assignments: [
        { itemId: 'i1', quantity: 1 },
        { itemId: 'i3', quantity: 1 },
        { itemId: 'i7', quantity: 1 },
        { itemId: 'i11', quantity: 2 },
        { itemId: 'i15', quantity: 1 },
        { itemId: 'i21', quantity: 2 },
        { itemId: 'i27', quantity: 100 },
      ],
    },
  ];
}

function isClient() {
  return typeof window !== 'undefined';
}

export function getItems(): Item[] {
  if (!isClient()) return DEFAULT_ITEMS;
  const raw = localStorage.getItem(ITEMS_KEY);
  if (!raw) {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(DEFAULT_ITEMS));
    return DEFAULT_ITEMS;
  }
  return JSON.parse(raw);
}

export function saveItems(items: Item[]): void {
  if (!isClient()) return;
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function getEvents(): Event[] {
  if (!isClient()) return [];
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) {
    const samples = getSampleEvents();
    localStorage.setItem(EVENTS_KEY, JSON.stringify(samples));
    return samples;
  }
  return JSON.parse(raw);
}

export function saveEvents(events: Event[]): void {
  if (!isClient()) return;
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function getMailSettings(): MailSettings {
  if (!isClient()) return { defaultTo: '', defaultRecipientName: '' };
  const raw = localStorage.getItem(MAIL_KEY);
  if (!raw) return { defaultTo: '', defaultRecipientName: '' };
  return JSON.parse(raw);
}

export function saveMailSettings(settings: MailSettings): void {
  if (!isClient()) return;
  localStorage.setItem(MAIL_KEY, JSON.stringify(settings));
}
