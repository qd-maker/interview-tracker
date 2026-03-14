"use client"

import { useEffect, useEffectEvent, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Keyboard,
  PlayCircle,
  RotateCw,
  SkipForward,
} from "lucide-react"

import { useInterview } from "@/components/interview/interview-provider"
import { InterviewShell } from "@/components/interview/shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MODULES } from "@/lib/interview-data"
import {
  ASSESSMENT_HINTS,
  ASSESSMENT_LABELS,
  STATUS_LABELS,
  formatDateLabel,
  getCurrentPracticeQuestion,
  getSessionProgress,
  getSessionRecords,
} from "@/lib/interview-helpers"
import { cn } from "@/lib/utils"

export function PracticePage() {
  const router = useRouter()
  const {
    state,
    startPractice,
    revealAnswer,
    recordPractice,
    skipToNext,
    clearPracticeSession,
    setLastOpenedView,
  } = useInterview()
  const [answerView, setAnswerView] = useState<"standard" | "short" | "bullets">("short")

  useEffect(() => {
    setLastOpenedView("/practice")
  }, [setLastOpenedView])

  const currentQuestion = getCurrentPracticeQuestion(state.practiceSession, state.questions)
  const sessionProgress = getSessionProgress(state.practiceSession)
  const sessionRecords = getSessionRecords(state.practiceRecords, state.practiceSession?.id)
  const sessionCompleted =
    Boolean(state.practiceSession) && sessionProgress.completed >= sessionProgress.total

  const handleKeyboard = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) {
      return
    }

    if (event.code === "Space") {
      event.preventDefault()
      if (currentQuestion && !state.practiceSession?.answerVisible) {
        revealAnswer(true)
      }
      return
    }

    if (!currentQuestion || !state.practiceSession?.answerVisible) {
      return
    }

    if (event.key === "1") {
      recordPractice("missed")
    }

    if (event.key === "2") {
      recordPractice("okay")
    }

    if (event.key === "3") {
      recordPractice("smooth")
    }
  })

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard)
    return () => window.removeEventListener("keydown", handleKeyboard)
  }, [])

  const rightRail = (
    <>
      <Card className="border-white/8 bg-white/6 shadow-none">
        <CardHeader>
          <CardTitle>练习进度</CardTitle>
          <CardDescription>先答，再看，再自评。别同时做太多事。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>已完成</span>
              <span>
                {sessionProgress.completed}/{sessionProgress.total}
              </span>
            </div>
            <Progress value={sessionProgress.percentage} className="mt-3 h-2 bg-white/8" />
          </div>
          {state.practiceSession?.questionIds.length ? (
            <div className="space-y-2">
              {state.practiceSession.questionIds.map((questionId, index) => {
                const question = state.questions.find((item) => item.id === questionId)
                const active = index === state.practiceSession?.currentIndex
                const done = index < (state.practiceSession?.currentIndex ?? 0)

                return (
                  <div
                    key={questionId}
                    className={`rounded-2xl border px-3 py-3 text-sm leading-6 ${
                      active
                        ? "border-sky-300/30 bg-sky-300/10 text-white"
                        : done
                          ? "border-emerald-300/16 bg-emerald-400/8 text-slate-200"
                          : "border-white/8 bg-black/10 text-slate-300"
                    }`}
                  >
                    {question?.question}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-black/10 p-4 text-sm text-slate-300">
              还没有进行中的练习，可以从左侧任选一种开始方式。
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-white/6 shadow-none">
        <CardHeader>
          <CardTitle>键盘快捷键</CardTitle>
          <CardDescription>练习时尽量少切鼠标，更像真实临场输出。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-3 py-2">
            <span className="flex items-center gap-2">
              <Keyboard className="size-4 text-slate-400" />
              显示参考答案
            </span>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
              Space
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-3 py-2">
            <span>没答出来 / 一般 / 顺</span>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
              1 / 2 / 3
            </Badge>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/10 p-3 text-xs leading-6 text-slate-400">
            推荐节奏：先看题开口答，再按空格看参考答案，最后用 1/2/3 做自评。
          </div>
        </CardContent>
      </Card>
    </>
  )

  return (
    <InterviewShell
      title="模拟练习"
      description="这一页只服务一件事：把一道题真正说出来。先输出，再看参考，再做自评。"
      rightRail={rightRail}
      contentGridClassName={state.practiceSession && !sessionCompleted ? "xl:grid-cols-[minmax(0,1fr)_300px]" : undefined}
      actions={
        <>
          <Button variant="outline" className="border-white/12 bg-white/5 text-white" onClick={() => router.push("/library")}>
            返回题库
          </Button>
          <Button variant="outline" className="border-white/12 bg-white/5 text-white" onClick={clearPracticeSession}>
            结束当前 session
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!state.practiceSession ? (
          <>
            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader>
                <CardTitle>先选一种开始方式</CardTitle>
                <CardDescription>只保留最常用的三种，不让你先被配置项淹没。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <button
                  type="button"
                  onClick={() => startPractice("random")}
                  className="rounded-[26px] border border-sky-300/16 bg-sky-400/8 p-5 text-left transition hover:border-sky-300/28 hover:bg-sky-400/12"
                >
                  <p className="text-lg font-medium text-white">随机模拟</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    从全题库随机抽 8 题，适合直接模拟一轮。
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => startPractice("today")}
                  className="rounded-[26px] border border-emerald-300/16 bg-emerald-400/8 p-5 text-left transition hover:border-emerald-300/28 hover:bg-emerald-400/12"
                >
                  <p className="text-lg font-medium text-white">今日题单</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    只练今天选中的题，适合 10 到 15 分钟热身。
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => startPractice("weak")}
                  className="rounded-[26px] border border-amber-300/16 bg-amber-400/8 p-5 text-left transition hover:border-amber-300/28 hover:bg-amber-400/12"
                >
                  <p className="text-lg font-medium text-white">薄弱题回炉</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    专门补最容易卡住的题。
                  </p>
                </button>
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader>
                <CardTitle>按模块开始</CardTitle>
                <CardDescription>如果你知道自己今天只想练某一块，可以从这里进。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {MODULES.map((module) => (
                  <Button
                    key={module.id}
                    variant="outline"
                    className="h-auto justify-between border-white/12 bg-white/5 px-4 py-4 text-white"
                    onClick={() => startPractice("module", module.id)}
                  >
                    <span className="text-left">
                      <span className="block font-medium">{module.label}</span>
                      <span className="mt-1 block text-xs text-slate-400">{module.description}</span>
                    </span>
                    <PlayCircle className="size-4 shrink-0" />
                  </Button>
                ))}
              </CardContent>
            </Card>
          </>
        ) : sessionCompleted || !currentQuestion ? (
          <Card className="border-white/8 bg-white/6 shadow-none">
            <CardHeader>
              <CardTitle>这一轮练完了</CardTitle>
              <CardDescription>马上再来一轮，或者回题库补一下这轮暴露出来的薄弱点。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">本轮题数</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{sessionProgress.total}</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">答得顺</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {sessionRecords.filter((item) => item.assessment === "smooth").length}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">没答出来</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {sessionRecords.filter((item) => item.assessment === "missed").length}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => startPractice("random")}>
                  <RotateCw className="size-4" />
                  再来一轮随机模拟
                </Button>
                <Button variant="outline" className="border-white/12 bg-white/5 text-white" onClick={() => router.push("/library")}>
                  回题库复盘
                </Button>
                <Button variant="outline" className="border-white/12 bg-white/5 text-white" onClick={clearPracticeSession}>
                  清空本轮状态
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>当前问题</CardTitle>
                  <CardDescription>
                    第 {sessionProgress.completed + 1} / {sessionProgress.total} 题 · 先自己答，再看参考。
                  </CardDescription>
                </div>
                <Badge className="bg-white/8 text-slate-100">
                  {MODULES.find((module) => module.id === currentQuestion.category)?.label}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[28px] border border-white/8 bg-[#0b1624] p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Question</p>
                  <h2 className="mt-4 max-w-4xl text-2xl leading-10 font-semibold text-white lg:text-[2rem]">
                    {currentQuestion.question}
                  </h2>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                      当前状态：{STATUS_LABELS[currentQuestion.status]}
                    </Badge>
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                      自信度 {currentQuestion.confidence}/5
                    </Badge>
                    {currentQuestion.highPriority ? (
                      <Badge className="bg-rose-400/12 text-rose-100">高优先</Badge>
                    ) : null}
                  </div>
                </div>

                {!state.practiceSession.answerVisible ? (
                  <div className="rounded-[24px] border border-dashed border-white/12 bg-black/10 p-5">
                    <p className="max-w-3xl text-sm leading-7 text-slate-300">
                      先自己开口答一遍，再点“显示参考答案”。这样比直接看内容更能暴露真实熟练度。
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button onClick={() => revealAnswer(true)}>显示参考答案</Button>
                      <Button
                        variant="outline"
                        className="border-white/12 bg-white/5 text-white"
                        onClick={skipToNext}
                      >
                        <SkipForward className="size-4" />
                        先跳过这题
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 rounded-[24px] border border-white/8 bg-black/10 p-4 lg:p-5">
                      <div className="flex flex-wrap gap-2">
                        {[
                          ["short", "面试口语版"],
                          ["standard", "完整回答"],
                          ["bullets", "提纲版"],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setAnswerView(value as "standard" | "short" | "bullets")
                            }
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

                      <div className="rounded-[20px] border border-white/8 bg-[#09121d] px-5 py-5 lg:px-6">
                        {answerView === "bullets" ? (
                          <ul className="max-w-4xl space-y-3 text-base leading-8 text-slate-100">
                            {currentQuestion.bulletPoints.map((point) => (
                              <li key={point}>• {point}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="max-w-4xl text-[15px] leading-8 text-slate-100 lg:text-base">
                            {answerView === "standard"
                              ? currentQuestion.standardAnswer
                              : currentQuestion.shortAnswer}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-3">
                      <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                        <p className="text-sm font-medium text-white">指标记忆</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {currentQuestion.mustRememberMetrics.map((metric) => (
                            <Badge key={metric} className="bg-sky-400/12 text-sky-100">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                        <p className="text-sm font-medium text-white">常见追问</p>
                        <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                          {currentQuestion.commonFollowUps.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-[24px] border border-white/8 bg-black/10 p-4">
                        <p className="text-sm font-medium text-white">容易踩坑</p>
                        <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                          {currentQuestion.pitfalls.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/8 bg-black/10 p-5">
                      <p className="text-sm font-medium text-white">答完自评一下</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        自评会自动更新这道题的熟练度和最近练习记录。
                      </p>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {(["missed", "okay", "smooth"] as const).map((assessment, index) => (
                          <button
                            key={assessment}
                            type="button"
                            onClick={() => recordPractice(assessment)}
                            className="rounded-[22px] border border-white/8 bg-white/5 p-4 text-left transition hover:border-white/16 hover:bg-white/8"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-white">{ASSESSMENT_LABELS[assessment]}</p>
                              <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                                {index + 1}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {ASSESSMENT_HINTS[assessment]}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader>
                <CardTitle>本轮最近记录</CardTitle>
                <CardDescription>刚练完的题会马上出现在这里，方便你立即复盘。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessionRecords.length ? (
                  sessionRecords.slice(0, 4).map((record) => {
                    const question = state.questions.find((item) => item.id === record.questionId)
                    return (
                      <div
                        key={record.id}
                        className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-black/10 p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">{question?.question}</p>
                          <p className="mt-1 text-xs text-slate-400">{formatDateLabel(record.reviewedAt)}</p>
                        </div>
                        <Badge className="bg-emerald-400/12 text-emerald-100">
                          {ASSESSMENT_LABELS[record.assessment]}
                        </Badge>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-white/8 bg-black/10 p-4 text-sm text-slate-300">
                    这一轮还没有记录，先完成第一题吧。
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </InterviewShell>
  )
}
