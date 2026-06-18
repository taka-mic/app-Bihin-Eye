'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'タイムライン' },
  { href: '/events', label: 'イベント' },
  { href: '/items', label: '備品マスタ' },
  { href: '/mail', label: 'メール作成' },
  { href: '/manual', label: 'マニュアル' },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-indigo-700 text-white shadow-md">
      <div className="flex items-center gap-1 px-2 h-14 overflow-x-auto">
        <span className="font-bold text-sm whitespace-nowrap mr-2">備品管理</span>
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
              pathname === l.href
                ? 'bg-white text-indigo-700 font-semibold'
                : 'hover:bg-indigo-600'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
