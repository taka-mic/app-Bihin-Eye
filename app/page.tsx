'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getItems, getEvents, saveEvents } from '@/lib/storage';
import { Item, Event, ItemCategory, Assignment } from '@/lib/types';
import { getEventSpan, detectDoubleBookings, getTransportStatus } from '@/lib/utils';

const CELL_W = 36;
const ROW_H = 36;
const LABEL_W = 192;
const CATEGORIES: ItemCategory[] = ['設営系', '展示系', 'その他', '消耗品'];

const STATUS_COLORS: Record<string, string> = {
  '出荷準備': 'bg-yellow-400',
  '輸送中（往路）': 'bg-blue-400',
  '会場': 'bg-green-500',
  '輸送中（復路）': 'bg-orange-400',
};

function generateDates(center: Date, before: number, after: number): string[] {
  const dates: string[] = [];
  for (let i = -before; i <= after; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const EMPTY_EVENT: Omit<Event, 'id'> = {
  name: '',
  location: '',
  startDate: '',
  endDate: '',
  assignments: [],
};

export default function TimelinePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingIsNew, setEditingIsNew] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dates = useMemo(() => generateDates(new Date(), 60, 60), []);
  const todayIndex = useMemo(() => dates.indexOf(today), [dates, today]);

  useEffect(() => {
    setItems(getItems());
    setEvents(getEvents());
  }, []);

  const conflicts = useMemo(() => detectDoubleBookings(events, items), [events, items]);

  const scrollToToday = () => {
    if (scrollRef.current) {
      const offset = todayIndex * CELL_W - scrollRef.current.clientWidth / 2 + CELL_W / 2;
      scrollRef.current.scrollLeft = Math.max(0, offset);
    }
  };

  useEffect(() => {
    setTimeout(scrollToToday, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayIndex]);

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const openNewEvent = () => {
    setEditingEvent({ id: '', ...EMPTY_EVENT, startDate: today, endDate: today });
    setEditingIsNew(true);
  };

  const saveEvent = () => {
    if (!editingEvent) return;
    let updated: Event[];
    if (editingIsNew) {
      updated = [...events, { ...editingEvent, id: Date.now().toString() }];
    } else {
      updated = events.map(e => (e.id === editingEvent.id ? editingEvent : e));
    }
    setEvents(updated);
    saveEvents(updated);
    setEditingEvent(null);
  };

  const deleteEvent = (id: string) => {
    if (!confirm('このイベントを削除しますか？')) return;
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
    setEditingEvent(null);
  };

  const addAssignment = () => {
    if (!editingEvent || items.length === 0) return;
    setEditingEvent({
      ...editingEvent,
      assignments: [...editingEvent.assignments, { itemId: items[0].id, quantity: 1 }],
    });
  };

  const updateAssignment = (idx: number, field: keyof Assignment, value: string | number) => {
    if (!editingEvent) return;
    const a = [...editingEvent.assignments];
    a[idx] = { ...a[idx], [field]: value };
    setEditingEvent({ ...editingEvent, assignments: a });
  };

  const removeAssignment = (idx: number) => {
    if (!editingEvent) return;
    setEditingEvent({
      ...editingEvent,
      assignments: editingEvent.assignments.filter((_, i) => i !== idx),
    });
  };

  const getBarsForItem = (item: Item) => {
    const itemConflicts = conflicts.get(item.id);
    return events
      .filter(e => e.assignments.some(a => a.itemId === item.id))
      .map(event => {
        const assignment = event.assignments.find(a => a.itemId === item.id)!;
        const span = getEventSpan(event);
        const startIdx = dates.indexOf(span.start);
        const endIdx = dates.indexOf(span.end);
        if (startIdx < 0 || endIdx < 0) return null;

        type Segment = { startIdx: number; width: number; status: string; conflict: boolean };
        const segments: Segment[] = [];
        for (let i = startIdx; i <= endIdx; i++) {
          const dateStr = dates[i];
          const status = getTransportStatus(event, dateStr);
          if (!status) continue;
          const dayConflict = itemConflicts?.has(dateStr) ?? false;
          const last = segments[segments.length - 1];
          if (last && last.status === status && last.conflict === dayConflict) {
            last.width += CELL_W;
          } else {
            segments.push({ startIdx: i, width: CELL_W, status, conflict: dayConflict });
          }
        }
        return { event, assignment, segments };
      })
      .filter(Boolean);
  };

  const monthHeaders = useMemo(() => {
    const headers: { label: string; count: number }[] = [];
    let current = '';
    for (const d of dates) {
      const m = d.slice(0, 7);
      if (m !== current) {
        headers.push({ label: m, count: 1 });
        current = m;
      } else {
        headers[headers.length - 1].count++;
      }
    }
    return headers;
  }, [dates]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-800">備品タイムライン</h1>
        <button
          onClick={scrollToToday}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
        >
          今日
        </button>
        <button
          onClick={openNewEvent}
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          + イベント追加
        </button>
        {conflicts.size > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
            ⚠ ダブルブッキング {conflicts.size}件
          </span>
        )}
      </div>

      {/* Event edit modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">
              {editingIsNew ? 'イベント追加' : 'イベント編集'}
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">イベント名</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingEvent.name}
                  onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">開催場所</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingEvent.location}
                  onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingEvent.startDate}
                  onChange={e => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editingEvent.endDate}
                  onChange={e => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
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
              {editingEvent.assignments.map((a, idx) => (
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
              {editingEvent.assignments.length === 0 && (
                <p className="text-xs text-gray-400">備品が未設定です</p>
              )}
            </div>

            <div className="flex gap-2 justify-between">
              <div>
                {!editingIsNew && (
                  <button
                    onClick={() => deleteEvent(editingEvent.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={saveEvent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Fixed label column */}
        <div className="flex-shrink-0 bg-white border-r z-10" style={{ width: LABEL_W }}>
          <div style={{ height: 52 }} className="border-b bg-gray-50" />
          {CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center gap-1 px-2 py-1 bg-gray-100 border-b text-xs font-bold text-gray-600 hover:bg-gray-200"
                  style={{ height: ROW_H }}
                >
                  <span>{collapsed[cat] ? '▶' : '▼'}</span>
                  {cat}
                </button>
                {!collapsed[cat] &&
                  catItems.map(item => {
                    const hasConflict = conflicts.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center px-2 border-b text-xs truncate ${
                          hasConflict ? 'text-red-600 bg-red-50' : 'text-gray-700'
                        }`}
                        style={{ height: ROW_H }}
                        title={item.name}
                      >
                        {hasConflict && <span className="mr-1 flex-shrink-0">⚠</span>}
                        <span className="truncate">{item.name}</span>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>

        {/* Scrollable timeline */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto">
          <div style={{ width: dates.length * CELL_W, position: 'relative' }}>
            {/* Month header */}
            <div className="flex sticky top-0 z-10 bg-white border-b" style={{ height: 28 }}>
              {monthHeaders.map((mh, i) => (
                <div
                  key={i}
                  className="border-r text-xs font-bold text-gray-600 flex items-center justify-center bg-gray-50 flex-shrink-0"
                  style={{ width: mh.count * CELL_W }}
                >
                  {mh.label}
                </div>
              ))}
            </div>

            {/* Day header */}
            <div className="flex sticky top-7 z-10 bg-white border-b" style={{ height: 24 }}>
              {dates.map((d) => {
                const day = new Date(d).getDay();
                const isToday = d === today;
                return (
                  <div
                    key={d}
                    className={`border-r text-xs flex items-center justify-center flex-shrink-0 ${
                      isToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : day === 0
                        ? 'bg-red-50 text-red-400'
                        : day === 6
                        ? 'bg-blue-50 text-blue-400'
                        : 'text-gray-400'
                    }`}
                    style={{ width: CELL_W }}
                  >
                    {new Date(d).getDate()}
                  </div>
                );
              })}
            </div>

            {/* Category + item rows */}
            {CATEGORIES.map(cat => {
              const catItems = items.filter(i => i.category === cat);
              if (catItems.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="flex bg-gray-100 border-b" style={{ height: ROW_H }}>
                    {dates.map(d => (
                      <div
                        key={d}
                        className={`border-r flex-shrink-0 ${d === today ? 'bg-indigo-100' : ''}`}
                        style={{ width: CELL_W, height: ROW_H }}
                      />
                    ))}
                  </div>

                  {!collapsed[cat] &&
                    catItems.map(item => {
                      const bars = getBarsForItem(item);
                      return (
                        <div
                          key={item.id}
                          className="relative flex border-b"
                          style={{ height: ROW_H }}
                        >
                          {dates.map(d => (
                            <div
                              key={d}
                              className={`border-r flex-shrink-0 ${d === today ? 'bg-indigo-50' : ''}`}
                              style={{ width: CELL_W, height: ROW_H }}
                            />
                          ))}
                          {bars.map((bar, bi) => {
                            if (!bar) return null;
                            return bar.segments.map((seg, si) => (
                              <div
                                key={`${bi}-${si}`}
                                className={`absolute top-1 rounded text-white text-xs flex items-center px-1 overflow-hidden cursor-pointer hover:brightness-90 ${
                                  seg.conflict ? 'bg-red-500' : (STATUS_COLORS[seg.status] ?? 'bg-gray-400')
                                }`}
                                style={{
                                  left: seg.startIdx * CELL_W + 1,
                                  width: seg.width - 2,
                                  height: ROW_H - 8,
                                  zIndex: 2,
                                }}
                                title={`${bar.event.name} (${bar.assignment.quantity}個) - ${seg.status}${seg.conflict ? ' ⚠ダブルブッキング' : ''} ／クリックで編集`}
                                onClick={() => { setEditingEvent(bar.event); setEditingIsNew(false); }}
                              >
                                {si === 0 && (
                                  <span className="truncate whitespace-nowrap text-xs leading-tight">
                                    {bar.event.name} {bar.assignment.quantity}個
                                  </span>
                                )}
                              </div>
                            ));
                          })}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-4 py-2 bg-white border-t text-xs text-gray-600 flex-shrink-0">
        {Object.entries(STATUS_COLORS).map(([label, cls]) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`inline-block w-3 h-3 rounded ${cls}`} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-red-500" />
          ダブルブッキング
        </span>
      </div>
    </div>
  );
}
