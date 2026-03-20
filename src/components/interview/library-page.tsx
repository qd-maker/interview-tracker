"use client"

import { useDeferredValue, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, FileUp, Search, Sparkles, Star, StickyNote } from "lucide-react"

import { MarkdownContent } from "@/components/interview/markdown-content"

import { useInterview } from "@/components/interview/interview-provider"
import { QuestionAiAssistant } from "@/components/interview/question-ai-assistant"
import { InterviewShell } from "@/components/interview/shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MODULES } from "@/lib/interview-data"
import {
  STATUS_LABELS,
  STATUS_ORDER,
  formatRelativeDay,
  getReadinessScore,
} from "@/lib/interview-helpers"
import { type QuestionStatus } from "@/lib/interview-types"
import { cn } from "@/lib/utils"

const ALL_VALUE = "__all__"

export function LibraryPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    state,
    updateQuestion,
    exportState,
    replaceState,
    resetState,
    startPractice,
    setLastOpenedView,
  } = useInterview()

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>(ALL_VALUE)
  const [status, setStatus] = useState<string>(ALL_VALUE)
  const [onlyPriority, setOnlyPriority] = useState(false)
  const [onlyToday, setOnlyToday] = useState(false)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    state.questions[0]?.id ?? null
  )
  const [transferMessage, setTransferMessage] = useState("本地状态会自动保存到 localStorage。")
  const [answerView, setAnswerView] = useState<"standard" | "short" | "bullets">("short")
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    setLastOpenedView("/library")
  }, [setLastOpenedView])

  const filteredQuestions = state.questions.filter((question) => {
    if (category !== ALL_VALUE && question.category !== category) {
      return false
    }

    if (status !== ALL_VALUE && question.status !== status) {
      return false
    }

    if (onlyPriority && !question.highPriority) {
      return false
    }

    if (onlyToday && !question.inTodayPractice) {
      return false
    }

    if (!deferredSearch.trim()) {
      return true
    }

    const keyword = deferredSearch.trim().toLowerCase()
    const haystack = [
      question.question,
      question.standardAnswer,
      question.shortAnswer,
      ...question.bulletPoints,
      ...question.mustRememberMetrics,
    ]
      .join(" ")
      .toLowerCase()

    return haystack.includes(keyword)
  })

  useEffect(() => {
    if (!filteredQuestions.length) {
      setSelectedQuestionId(null)
      return
    }

    if (!selectedQuestionId || !filteredQuestions.some((item) => item.id === selectedQuestionId)) {
      setSelectedQuestionId(filteredQuestions[0].id)
    }
  }, [filteredQuestions, selectedQuestionId])

  const selectedQuestion =
    filteredQuestions.find((question) => question.id === selectedQuestionId) ??
    state.questions.find((question) => question.id === selectedQuestionId) ??
    null

  function handleExport() {
    const blob = new Blob([exportState()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `interview-war-room-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setTransferMessage("已导出当前题库和练习记录。")
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      replaceState(JSON.parse(text))
      setTransferMessage(`已导入 ${file.name}，并按当前版本做了结构校正。`)
    } catch {
      setTransferMessage("导入失败，请检查 JSON 格式是否正确。")
    } finally {
      event.target.value = ""
    }
  }

  function handleStartModulePractice() {
    if (!selectedQuestion) {
      return
    }

    startPractice("module", selectedQuestion.category)
    router.push("/practice")
  }

  const leftRail = (
    <>
      <Card className="border-white/8 bg-white/6 shadow-none">
        <CardHeader>
          <CardTitle>检索与筛选</CardTitle>
          <CardDescription>把题库当成训练面板，而不是静态笔记。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-slate-400">关键词</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜问题、答案、指标"
                className="border-white/10 bg-black/10 pl-9 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-slate-400">模块</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full border-white/10 bg-black/10 text-white">
                <SelectValue placeholder="全部模块" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>全部模块</SelectItem>
                {MODULES.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.24em] text-slate-400">熟练度</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full border-white/10 bg-black/10 text-white">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>全部状态</SelectItem>
                {STATUS_ORDER.map((item) => (
                  <SelectItem key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/10 px-3 py-3 text-sm text-slate-200">
            <Checkbox checked={onlyPriority} onCheckedChange={(value) => setOnlyPriority(Boolean(value))} />
            只看高优先级问题
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/10 px-3 py-3 text-sm text-slate-200">
            <Checkbox checked={onlyToday} onCheckedChange={(value) => setOnlyToday(Boolean(value))} />
            只看今日练习题
          </label>
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-white/6 shadow-none">
        <CardHeader>
          <CardTitle>状态分布</CardTitle>
          <CardDescription>筛选后的结果一共有 {filteredQuestions.length} 题。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {STATUS_ORDER.map((item) => {
            const count = filteredQuestions.filter((question) => question.status === item).length
            return (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-3 py-2">
                <span className="text-sm text-white">{STATUS_LABELS[item]}</span>
                <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                  {count}
                </Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </>
  )

  return (
    <InterviewShell
      title="题库管理"
      description="左边找题，右边只做两件事：看清答案，顺手把状态改掉。"
      leftRail={leftRail}
      contentGridClassName="xl:grid-cols-[320px_minmax(0,1fr)]"
      actions={
        <>
          <Button onClick={handleStartModulePractice} disabled={!selectedQuestion}>
            <Sparkles className="size-4" />
            练当前模块
          </Button>
          <Button asChild variant="outline" className="border-white/12 bg-white/5 text-white">
            <a href="/practice">去练习页</a>
          </Button>
          <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
          <Button variant="outline" className="border-white/12 bg-white/5 text-white" onClick={handleExport}>
            <Download className="size-4" />
            导出
          </Button>
          <Button variant="outline" className="border-white/12 bg-white/5 text-white" onClick={() => inputRef.current?.click()}>
            <FileUp className="size-4" />
            导入
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Card className="border-white/8 bg-white/6 shadow-none">
          <CardHeader>
            <CardTitle>题卡列表</CardTitle>
            <CardDescription>点击题目后，下面会显示三种答法与关键追问。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {filteredQuestions.length ? (
              filteredQuestions.map((question) => {
                const active = question.id === selectedQuestionId
                return (
                  <div
                    key={question.id}
                    className={`rounded-[24px] border p-4 text-left transition-all ${
                      active
                        ? "border-sky-300/30 bg-sky-300/10"
                        : "border-white/8 bg-black/10 hover:border-white/14 hover:bg-black/14"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedQuestionId(question.id)}
                      className="w-full text-left"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-white/8 text-slate-100">
                              {MODULES.find((module) => module.id === question.category)?.shortLabel}
                            </Badge>
                            {question.highPriority ? (
                              <Badge className="bg-rose-400/12 text-rose-100">
                                <Star className="size-3.5" />
                                高优先
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-3 text-base leading-7 text-white">{question.question}</p>
                          <p className="mt-1 line-clamp-1 text-sm leading-6 text-slate-400">
                            {question.shortAnswer}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                            {STATUS_LABELS[question.status]}
                          </Badge>
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                            准备度 {getReadinessScore(question)}
                          </Badge>
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                            {formatRelativeDay(question.lastReviewedAt)}
                          </Badge>
                        </div>
                      </div>
                    </button>

                    <div className="mt-3 flex items-center justify-end border-t border-white/8 pt-3">
                      <QuestionAiAssistant
                        question={question}
                        triggerLabel="问这题"
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-black/10 px-6 py-12 text-center text-slate-300">
                没有匹配到结果。可以清空搜索词，或者取消筛选条件。
              </div>
            )}
          </CardContent>
        </Card>

        {selectedQuestion ? (
          <Card className="border-white/8 bg-white/6 shadow-none">
            <CardHeader>
              <CardTitle>{selectedQuestion.question}</CardTitle>
              <CardDescription>
                先看清答案，再顺手维护真实状态。这里不再分散成多块小卡片。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-black/10 px-4 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">卡住的时候，直接追问 AI</p>
                  <p className="text-sm leading-6 text-slate-400">
                    它会把这道题、你的答案和对应项目源码一起带进上下文里。
                  </p>
                </div>
                <QuestionAiAssistant question={selectedQuestion} />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["short", "面试口语版"],
                  ["standard", "完整回答"],
                  ["bullets", "提纲版"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAnswerView(value as "standard" | "short" | "bullets")}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition",
                      answerView === value
                        ? "border-sky-300/30 bg-sky-300/12 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/16 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="rounded-[24px] border border-white/8 bg-[#09121d] px-5 py-5 lg:px-6">
                {answerView === "bullets" ? (
                  <ul className="max-w-4xl space-y-3 text-base leading-8 text-slate-100">
                    {selectedQuestion.bulletPoints.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="max-w-4xl">
                    <MarkdownContent>
                      {answerView === "standard"
                        ? selectedQuestion.standardAnswer
                        : selectedQuestion.shortAnswer}
                    </MarkdownContent>
                  </div>
                )}
              </div>

              {/* ━━ 个人批注与记忆点 ━━ */}
              <div className="rounded-[24px] border border-amber-300/12 bg-amber-400/5 p-4">
                <div className="flex items-center gap-2">
                  <StickyNote className="size-4 text-amber-300/70" />
                  <p className="text-sm font-medium text-amber-100">个人批注与记忆点</p>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  看完答案后，用自己的话记一句最关键的点，或者容易被追问的地方。
                </p>
                <Textarea
                  value={selectedQuestion.notes}
                  onChange={(event) =>
                    updateQuestion(selectedQuestion.id, { notes: event.target.value })
                  }
                  placeholder="例如：这题重点讲字段级引用 + 召回率从 72% 提到 91%，别忘了提 Chunk overlap 策略。"
                  className="mt-3 min-h-28 border-amber-300/10 bg-black/20 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                    <p className="text-sm font-medium text-white">练习设置</p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.24em] text-slate-400">熟练度</label>
                        <Select
                          value={selectedQuestion.status}
                          onValueChange={(value) =>
                            updateQuestion(selectedQuestion.id, { status: value as QuestionStatus })
                          }
                        >
                          <SelectTrigger className="w-full border-white/10 bg-black/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_ORDER.map((item) => (
                              <SelectItem key={item} value={item}>
                                {STATUS_LABELS[item]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.24em] text-slate-400">自信度</label>
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Button
                              key={value}
                              variant={selectedQuestion.confidence === value ? "default" : "outline"}
                              className={selectedQuestion.confidence === value ? "" : "border-white/10 bg-white/5 text-white"}
                              onClick={() => updateQuestion(selectedQuestion.id, { confidence: value })}
                            >
                              {value}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-sm text-slate-200">
                        <Checkbox
                          checked={selectedQuestion.highPriority}
                          onCheckedChange={(value) =>
                            updateQuestion(selectedQuestion.id, { highPriority: Boolean(value) })
                          }
                        />
                        标记为高优先级
                      </label>

                      <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-sm text-slate-200">
                        <Checkbox
                          checked={selectedQuestion.inTodayPractice}
                          onCheckedChange={(value) =>
                            updateQuestion(selectedQuestion.id, { inTodayPractice: Boolean(value) })
                          }
                        />
                        加入今日练习
                      </label>
                    </div>



                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button onClick={handleStartModulePractice}>
                        <Sparkles className="size-4" />
                        从当前模块开始练
                      </Button>
                      <Button variant="outline" className="border-white/12 bg-white/5 text-white" onClick={resetState}>
                        恢复演示数据
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                    <p className="text-sm font-medium text-white">必须记住的指标 / 关键词</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedQuestion.mustRememberMetrics.map((metric) => (
                        <Badge key={metric} className="bg-sky-400/12 text-sky-100">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                    <p className="text-sm font-medium text-white">常见追问</p>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                      {selectedQuestion.commonFollowUps.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                    <p className="text-sm font-medium text-white">容易踩坑</p>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                      {selectedQuestion.pitfalls.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-black/10 p-4 text-sm text-slate-300">
                    {transferMessage}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </InterviewShell>
  )
}
