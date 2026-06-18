'use client';
import { useEffect, useState } from 'react';
import { getEvents, saveEvents, getItems } from '@/lib/storage';
import { Event, Item, Assignment } from '@/lib/types';
import { formatDate, addDays, getTodayStatus } from '@/lib/utils';

const EMPTY_EVENT: Omit<Event, 'id'> = {
  name: '',
  location: '',
  startDate: '',
  endDate: '',
  assignments: [],
};

const STATUS_COLORS: Record<string, string> = {
  'オフィス': 'bg-gray-100 text-gray-600',
  '出荷準備': 'bg-yellow-100 text-yellow-700',
  '輸送中（往路）': 'bg-blue-100 text-blue-700',
  '会場': 'bg-green-100 text-green-700',
  '輸送中（復路）': 'bg-orange-100 text-orange-700',
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Event | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setEvents(getEvents());
    setItems(getItems());
  }, []);

  const save = () => {
    if (!editing) return;
    let updated: Event[];
    if (isNew) {
      updated = [...events, { ...editing, id: Date.now().toString() }];
    } else {
      updated = events.map(e => (e.id === editing.id ? editing : e));
    }
    setEvents(updated);
    saveEvents(updated);
    setEditing(null);
  };

  const del = (id: string) => {
    if (!confirm('このイベントを削除しますか？')) return;
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
  };

  const addAssignment = () => {
    if (!editing || items.length === 0) return;
    setEditing({
      ...editing,
      assignments: [...editing.assignments, { itemId: items[0].id, quantity: 1 }],
    });
  };

  const updateAssignment = (idx: number, field: keyof Assignment, value: string | number) => {
    if (!editing) return;
    const a = [...editing.assignments];
    a[idx] = { ...a[idx], [field]: value };
    setEditing({ ...editing, assignments: a });
  };

  const removeAssignment = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, assignments: editing.assignments.filter((_, i) => i !== idx) });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">イベント管理</h1>
        <button
          onClick={() => { setEditing({ id: '', ...EMPTY_EVENT }); setIsNew(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
        >
          + イベント追加
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">{isNew ? 'イベント追加' : 'イベント編集'}</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">イベント名</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">開催場所</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editing.location}
                  onChange={e => setEditing({ ...editing, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editing.startDate}
                  onChange={e => setEditing({ ...editing, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editing.endDate}
                  onChange={e => setEditing({ ...editing, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-700">使用備品</h3>
                <button
                  onClick={addAssignment}
                  className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                >
                  + 追加
                </button>
              </div>
              {editing.assignments.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <select
                    className="flex-1 border rounded px-2 py-1.5 text-sm"
                    value={a.itemId}
                    onChange={e => updateAssignment(idx, 'itemId', e.target.value)}
                  >
                    {items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.category} / {item.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    className="w-20 border rounded px-2 py-1.5 text-sm"
                    value={a.quantity}
                    onChange={e => updateAssignment(idx, 'quantity', parseInt(e.target.value) || 1)}
                  />
                  <span className="text-sm text-gray-500">個</span>
                  <button
                    onClick={() => removeAssignment(idx)}
                    className="text-red-400 hover:text-red-600 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              {editing.assignments.length === 0 && (
                <p className="text-xs text-gray-400">備品が未設定です</p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={save}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.length === 0 && (
          <p className="text-gray-400 text-center py-8">イベントがありません</p>
        )}
        {events.map(event => {
          const status = getTodayStatus(event);
          const statusCls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600';
          return (
            <div key={event.id} className="bg-white rounded-lg shadow-sm border">
              <div className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-gray-800">{event.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusCls}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {event.location} | {formatDate(event.startDate)} 〜 {formatDate(event.endDate)}
                  </p>
                  <p className="text-xs text-gray-400">
                    備品 {event.assignments.length}種 | 出荷準備：{formatDate(addDays(event.startDate, -2))}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                    className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {expandedId === event.id ? '閉じる' : '詳細'}
                  </button>
                  <button
                    onClick={() => { setEditing(event); setIsNew(false); }}
                    className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => del(event.id)}
                    className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    削除
                  </button>
                </div>
              </div>
              {expandedId === event.id && (
                <div className="border-t px-4 pb-4 pt-3">
                  <p className="text-xs font-bold text-gray-600 mb-2">使用備品一覧</p>
                  <div className="space-y-1">
                    {event.assignments.map((a, i) => {
                      const item = items.find(it => it.id === a.itemId);
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                            {item?.category}
                          </span>
                          <span>{item?.name ?? '不明'}</span>
                          <span className="text-gray-500">{a.quantity}個</span>
                        </div>
                      );
                    })}
                    {event.assignments.length === 0 && (
                      <p className="text-xs text-gray-400">備品なし</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
