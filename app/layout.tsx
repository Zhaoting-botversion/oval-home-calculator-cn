import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
export const metadata: Metadata = {
  metadataBase: new URL('https://oval-home-calculator-cn.patricia3789906.chatgpt.site'),
  title: '英国买房测算工具｜Oval 参考版',
  description: '即时测算英国住宅房价、印花税、贷款月供、付款计划与租金回报。',
  openGraph: {
    title: '英国买房测算工具｜Oval 参考版',
    description: '房价、税费、贷款与租金，一页完成测算。',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '英国买房测算工具｜Oval 参考版',
    description: '房价、税费、贷款与租金，一页完成测算。',
    images: ['/og.png'],
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>; }
