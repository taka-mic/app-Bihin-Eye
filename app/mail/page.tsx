'use client';
import { useEffect, useState } from 'react';
import { getEvents, getItems, getMailSettings, saveMailSettings } from '@/lib/storage';
import { Event, Item } from '@/lib/types';
import { generateMailBody } from '@/lib/utils';

export default function MailPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [to, setTo] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ev = getEvents();
    const it = getItems();
    const ms = getMailSettings();
    setEvents(ev);
    setItems(it);
    setTo(ms.defaultTo);
    setRecipientName(ms.defaultRecipientName);
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    const event = events.find(e => e.id === selectedEventId);
    if (!event) return;
    const { subject: s, body: b } = generateMailBody(event, items, recipientName || '担当者');
    setSubject(s);
    setBody(b);
  }, [selectedEventId, events, items, recipientName]);

  const saveDefaults = () => {
    saveMailSettings({ defaultTo: to, defaultRecipientName: recipientName });
    alert('デフォルト設定を保存しました');
  };

  const copyToClipboard = async () => {
    const full = `宛先: ${to}\n件名: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openMailApp = () => {
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">メール作成</h1>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-3">デフォルト設定</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">宛先メールアドレス</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="example@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">担当者名</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="山田 太郎"
            />
          </div>
        </div>
        <button
          onClick={saveDefaults}
          className="mt-2 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          デフォルトとして保存
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-3">イベント選択</h2>
        <select
          className="w-full border rounded px-3 py-2 text-sm"
          value={selectedEventId}
          onChange={e => setSelectedEventId(e.target.value)}
        >
          <option value="">イベントを選択してください</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>
              {e.name}（{e.startDate}〜{e.endDate}）
            </option>
          ))}
        </select>
      </div>

      {selectedEventId && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">メール内容</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">宛先</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 text-sm"
                value={to}
                onChange={e => setTo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">件名</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">本文</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm font-mono"
                rows={20}
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded text-sm font-medium ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {copied ? 'コピー完了！' : 'メールをコピー'}
            </button>
            <button
              onClick={openMailApp}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              メールアプリで開く
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
