import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lexicon Polycraft Stock Verification & Mobile Round System',
  description: 'Official 304 SKU Catalog with Sets & Inner Packaging, Stock Verification & Mobile Floor Round',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="bg-black text-slate-100 min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
