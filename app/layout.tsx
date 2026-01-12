import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caffeine Zero",
  description: "스마트한 카페인 잔량 관리",
  icons: {
    // 절대 경로(C:\...)가 아닌 상대 경로로 작성해야 합니다.
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}