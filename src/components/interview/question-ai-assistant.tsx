"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, LoaderCircle, MessageCircleQuestion, Send, Sparkles } from "lucide-react"

import { MarkdownContent } from "@/components/interview/markdown-content"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  type InterviewAiReference,
  type InterviewAiResponse,
  type InterviewAiTurn,
} from "@/lib/interview-ai/shared"
import { type InterviewQuestion } from "@/lib/interview-types"
import { cn } from "@/lib/utils"

type AssistantMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  references?: InterviewAiReference[]
  warnings?: string[]
  model?: string
}

type QuestionAiAssistantProps = {
  question: InterviewQuestion
  triggerLabel?: string
  className?: string
}

function toQuestionContext(question: InterviewQuestion) {
  return {
    id: question.id,
    category: question.category,
    question: question.question,
    standardAnswer: question.standardAnswer,
    shortAnswer: question.shortAnswer,
    bulletPoints: question.bulletPoints,
    mustRememberMetrics: question.mustRememberMetrics,
    commonFollowUps: question.commonFollowUps,
    pitfalls: question.pitfalls,
    notes: question.notes,
  }
}

function toTurnHistory(messages: AssistantMessage[]): InterviewAiTurn[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

function formatReferenceLabel(reference: InterviewAiReference) {
  return `${reference.projectLabel} · ${reference.displayPath}:${reference.lineStart}-${reference.lineEnd}`
}

export function QuestionAiAssistant({
  question,
  triggerLabel = "问 AI",
  className,
}: QuestionAiAssistantProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const scrollEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mediaQuery.matches)

    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    setDraft("")
    setError("")
    setMessages([])
  }, [question.id])

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const quickPrompts = [
    "这题我真正应该先讲什么？",
    ...question.commonFollowUps.slice(0, 2),
  ]

  async function sendQuestion(rawInput: string) {
    const userQuestion = rawInput.trim()

    if (!userQuestion || loading) {
      return
    }

    const nextUserMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userQuestion,
    }

    const nextHistory = [...messages, nextUserMessage]

    setLoading(true)
    setError("")
    setDraft("")
    setMessages(nextHistory)

    try {
      const response = await fetch("/api/interview-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: toQuestionContext(question),
          userQuestion,
          history: toTurnHistory(messages),
        }),
      })

      const payload = (await response.json()) as InterviewAiResponse | { error: string }

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "AI 助手暂时不可用。")
      }

      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: payload.answer,
        references: payload.references,
        warnings: payload.warnings,
        model: payload.model,
      }

      setMessages((current) => [...current, assistantMessage])
    } catch (requestError) {
      setMessages(messages)
      setError(
        requestError instanceof Error ? requestError.message : "发送失败，请稍后再试。"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className={className ?? "border-white/12 bg-white/5 text-white"}
        onClick={() => setOpen(true)}
      >
        <MessageCircleQuestion className="size-4" />
        {triggerLabel}
      </Button>

      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "w-full border-white/10 bg-[#07111d] p-0 text-white",
          isMobile ? "h-[100dvh]" : "h-[96vh] sm:max-w-5xl"
        )}
      >
        <SheetHeader className="border-b border-white/8 bg-black/10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sky-400/12 text-sky-100">
              题目上下文 + 项目源码 RAG
            </Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
              {question.category}
            </Badge>
          </div>
          <SheetTitle className="mt-2 text-white">{question.question}</SheetTitle>
        </SheetHeader>

        {/* ── 三段式布局：消息区(flex-1) + 错误提示 + 输入区(shrink-0) ── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* ━━ 消息区：占满剩余空间，可滚动 ━━ */}
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 p-4">
              {/* 无消息时：介绍卡 + 快捷提示 + 空状态 */}
              {!messages.length ? (
                <>
                  <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-sky-400/12 p-2 text-sky-100">
                        <Sparkles className="size-4" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">这次不会只是把题和答案丢给模型</p>
                        <p className="text-sm leading-6 text-slate-300">
                          它会优先看这道题，再按模块去命中真实项目源码，最后把解释整理成你面试时能说出口的话。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={loading}
                        onClick={() => void sendQuestion(prompt)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-white/18 hover:text-white disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center">
                    <p className="text-base text-white">从一个具体卡点开始问会更有效</p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      例如：这题我为什么一定要讲字段级引用？源码里哪部分能支撑我这么说？
                    </p>
                  </div>
                </>
              ) : (
                /* 有消息时：对话流 */
                messages.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-[22px] rounded-br-sm border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm leading-7 text-sky-50">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="space-y-3">
                      <div className="flex gap-3">
                        <div className="shrink-0 rounded-full bg-white/8 p-2 text-slate-100">
                          <Bot className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="rounded-[24px] border border-white/8 bg-black/20 px-4 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-white">项目感知 AI 助手</p>
                              {message.model ? (
                                <Badge
                                  variant="outline"
                                  className="border-white/10 bg-white/5 text-slate-300"
                                >
                                  {message.model}
                                </Badge>
                              ) : null}
                            </div>
                            <div className="mt-3">
                              <MarkdownContent>{message.content}</MarkdownContent>
                            </div>
                          </div>

                          {message.references?.length ? (
                            <div className="space-y-3">
                              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                本轮命中的源码依据
                              </p>
                              {message.references.map((reference) => (
                                <div
                                  key={reference.id}
                                  className="rounded-[20px] border border-white/8 bg-black/10 px-4 py-4"
                                >
                                  <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-emerald-400/12 text-emerald-100">
                                      {reference.projectLabel}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="border-white/10 bg-white/5 text-slate-300"
                                    >
                                      {formatReferenceLabel(reference)}
                                    </Badge>
                                  </div>
                                  <p className="mt-3 text-xs leading-6 text-slate-400">
                                    {reference.relevance}
                                  </p>
                                  <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/8 bg-[#0a1522] px-3 py-3 text-xs leading-6 text-slate-300">
                                    {reference.snippet}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {message.warnings?.length ? (
                            <div className="rounded-[20px] border border-amber-300/15 bg-amber-300/8 px-4 py-3 text-sm leading-6 text-amber-100">
                              {message.warnings.join(" ")}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                )
              )}

              {loading ? (
                <div className="flex gap-3">
                  <div className="shrink-0 rounded-full bg-white/8 p-2 text-slate-100">
                    <LoaderCircle className="size-4 animate-spin" />
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-300">
                    正在结合题目和源码整理回答...
                  </div>
                </div>
              ) : null}

              {/* 滚动锚点 */}
              <div ref={scrollEndRef} />
            </div>
          </ScrollArea>

          {/* ━━ 错误提示 ━━ */}
          {error ? (
            <div className="shrink-0 px-4 pt-2">
              <div className="rounded-[20px] border border-rose-300/15 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
                {error}
              </div>
            </div>
          ) : null}

          {/* ━━ 输入区：固定在底部，不随内容滚动 ━━ */}
          <div className="shrink-0 border-t border-white/8 bg-[#07111d] p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && draft.trim()) {
                    event.preventDefault()
                    void sendQuestion(draft)
                  }
                }}
                placeholder="直接描述你的卡点，例如：这里为什么不是 WebSocket？"
                rows={2}
                className="min-h-0 flex-1 resize-none border-white/10 bg-[#08111c] text-white placeholder:text-slate-500"
              />
              <Button
                size="icon"
                onClick={() => void sendQuestion(draft)}
                disabled={loading || !draft.trim()}
                className="shrink-0"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

