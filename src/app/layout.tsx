import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Học viên MPA",
  description: "Hệ thống quản lý học viên và đăng ký khóa học MPA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <QueryProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
} 