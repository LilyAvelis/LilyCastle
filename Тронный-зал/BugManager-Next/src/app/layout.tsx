import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🗿 Жучиный Менеджер",
  description: "Управление жуками в замке LilyCastle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  );
}
