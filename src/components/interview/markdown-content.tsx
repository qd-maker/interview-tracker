"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownContentProps = {
  children: string
  className?: string
}

export function MarkdownContent({ children, className }: MarkdownContentProps) {
  return (
    <div className={`prose-ai ${className ?? ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
