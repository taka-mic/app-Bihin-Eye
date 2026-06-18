'use client';
import { useEffect, useState } from 'react';
import { getItems, saveItems, getEvents, saveEvents } from '@/lib/storage';
import { Item, ItemCategory } from '@/lib/types';

const CATEGORIES: ItemCategory[] = ['設営系', '展示系', 'その他', '消耗品'];
const EMPTY_ITEM: Omit<Item, 'id'> = { name: '', category: '設営系', totalStock: 1, notes: '' };

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filter, setFilter] = useState<ItemCategory | '全て'>('全て');

  useEffect(() => {
    setItems(getItems());
  }, []);

  const save = () => {
    if (!editing) return;
    let updated: Item[];
    if (isNew) {
      updated = [...items, { ...editing, id: Date.now().toString() }];
    } else {
      updated = items.map(i => (i.id === editing.id ? editing : i));
    }
    setItems(updated);
    saveItems(updated);
    setEditing(null);
  };

  const del = (id: string) => {
    if (!confirm('この備品を削除しますか？紐付いているイベントの割当からも削除されます。')) return;
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveItems(updated);
    const events = getEvents();
    saveEvents(events.map(e => ({
      ...e,
      assignments: e.assignments.filter(a => a.itemId !== id),
    })));
  };

  const filtered = filter === '全て' ? items : items.filter(i => i.category === filter);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">備品マスタ管理</h1>
        <button
          onClick={() => { setEditing({ id: '', ...EMPTY_ITEM }); setIsNew(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
        >
          + 備品追加
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['全て', ...CATEGORIES] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{isNew ? '備品追加' : '備品編集'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備品名</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editing.category}
                  onChange={e => setEditing({ ...editing, category: e.target.value as ItemCategory })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">総在庫数</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editing.totalStock}
                  onChange={e => setEditing({ ...editing, totalStock: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={2}
                  value={editing.notes}
                  onChange={e => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
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

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-2 text-gray-600">備品名</th>
              <th className="text-left px-4 py-2 text-gray-600">カテゴリ</th>
              <th className="text-right px-4 py-2 text-gray-600">在庫</th>
              <th className="text-left px-4 py-2 text-gray-600 hidden sm:table-cell">備考</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">備品がありません</td>
              </tr>
            )}
            {filtered.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{item.name}</td>
                <td className="px-4 py-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{item.totalStock}</td>
                <td className="px-4 py-2 text-gray-500 text-xs hidden sm:table-cell">{item.notes}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => { setEditing(item); setIsNew(false); }}
                      className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => del(item.id)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
