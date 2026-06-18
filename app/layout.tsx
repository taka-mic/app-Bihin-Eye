import type { Metadata } from 'next';
import './globals.css';
import NavBar from './NavBar';

export const metadata: Metadata = {
  title: '展示会備品タイムライン管理',
  description: '展示会備品のタイムライン管理・ダブルブッキング検出アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <NavBar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
