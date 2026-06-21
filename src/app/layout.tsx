import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Company | 가상 사무실",
  description: "오더 한 줄로 AI 팀의 회의와 최종 실행안을 받아보세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
