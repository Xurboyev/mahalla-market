import type { ReactNode } from 'react';

export const metadata = {
  title: 'MahallaMarket — mahallangiz bozori',
  description: "Mahalla bo'yicha e'lonlar: sotish, sotib olish, tekin berish.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#fafafa', color: '#222' }}>
        {children}
      </body>
    </html>
  );
}
