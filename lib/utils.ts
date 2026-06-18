import { Event, Item, TransportStatus } from './types';

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export function getTransportStatus(event: Event, dateStr: string): TransportStatus | null {
  const prepStart = addDays(event.startDate, -2);
  const transportStart = addDays(event.startDate, -1);
  const returnEnd = addDays(event.endDate, 2);

  if (dateStr < prepStart) return null;
  if (dateStr < transportStart) return '出荷準備';
  if (dateStr < event.startDate) return '輸送中（往路）';
  if (dateStr <= event.endDate) return '会場';
  if (dateStr <= returnEnd) return '輸送中（復路）';
  return null;
}

export function getEventSpan(event: Event): { start: string; end: string } {
  return {
    start: addDays(event.startDate, -2),
    end: addDays(event.endDate, 2),
  };
}

export interface ConflictInfo {
  eventIds: string[];
  totalQuantity: number;
}

export function detectDoubleBookings(
  events: Event[],
  items: Item[]
): Map<string, Map<string, ConflictInfo>> {
  const usage = new Map<string, Map<string, ConflictInfo>>();

  for (const event of events) {
    const span = getEventSpan(event);
    const start = new Date(span.start);
    const end = new Date(span.end);

    for (const assignment of event.assignments) {
      if (!usage.has(assignment.itemId)) {
        usage.set(assignment.itemId, new Map());
      }
      const itemUsage = usage.get(assignment.itemId)!;

      const cur = new Date(start);
      while (cur <= end) {
        const dateStr = cur.toISOString().slice(0, 10);
        if (!itemUsage.has(dateStr)) {
          itemUsage.set(dateStr, { eventIds: [], totalQuantity: 0 });
        }
        const day = itemUsage.get(dateStr)!;
        day.eventIds.push(event.id);
        day.totalQuantity += assignment.quantity;
        cur.setDate(cur.getDate() + 1);
      }
    }
  }

  const conflicts = new Map<string, Map<string, ConflictInfo>>();
  for (const [itemId, dateMap] of usage) {
    const item = items.find(i => i.id === itemId);
    if (!item) continue;
    for (const [dateStr, info] of dateMap) {
      if (info.eventIds.length > 1 || info.totalQuantity > item.totalStock) {
        if (!conflicts.has(itemId)) conflicts.set(itemId, new Map());
        conflicts.get(itemId)!.set(dateStr, info);
      }
    }
  }
  return conflicts;
}

export function getTodayStatus(event: Event): string {
  const today = new Date().toISOString().slice(0, 10);
  const prepStart = addDays(event.startDate, -2);
  const transportStart = addDays(event.startDate, -1);
  const returnEnd = addDays(event.endDate, 2);

  if (today < prepStart) return 'オフィス';
  if (today < transportStart) return '出荷準備';
  if (today < event.startDate) return '輸送中（往路）';
  if (today <= event.endDate) return '会場';
  if (today <= returnEnd) return '輸送中（復路）';
  return 'オフィス';
}

export function generateMailBody(
  event: Event,
  items: Item[],
  recipientName: string
): { subject: string; body: string } {
  const prepDate = formatDate(addDays(event.startDate, -2));
  const startDate = formatDate(event.startDate);
  const endDate = formatDate(event.endDate);

  const categories = ['設営系', '展示系', 'その他', '消耗品'] as const;
  let itemLines = '';
  for (const cat of categories) {
    const catAssignments = event.assignments.filter(a => {
      const item = items.find(i => i.id === a.itemId);
      return item?.category === cat;
    });
    for (const a of catAssignments) {
      const item = items.find(i => i.id === a.itemId);
      if (!item) continue;
      itemLines += `${cat}\t${item.name}\t${a.quantity}個\n`;
    }
  }

  const subject = `【備品準備依頼】${event.name}（${startDate}〜${endDate}）`;
  const body = `${recipientName} 様

お疲れ様です。
下記イベントの備品準備をお願いいたします。

■ イベント情報
イベント名：${event.name}
開催場所　：${event.location}
開催期間　：${startDate}〜${endDate}
出荷準備日：${prepDate}

■ 必要備品一覧
カテゴリ　　備品名　　　　　数量
-----------------------------------------------
${itemLines}
ご不明点があればご連絡ください。
よろしくお願いいたします。`;

  return { subject, body };
}
