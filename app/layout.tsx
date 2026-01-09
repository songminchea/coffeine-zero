import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caffeine Zero",
  description: "스마트한 카페인 관리",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning으로 브라우저 확장 프로그램 에러 방지
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 구글 번역기 개입 방지 */}
        <meta name="google" content="notranslate" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}