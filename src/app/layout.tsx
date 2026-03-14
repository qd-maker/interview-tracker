import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "面试备考追踪器",
  description: "Roadmap 式的 AI 应用开发实习面试备考追踪器",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
