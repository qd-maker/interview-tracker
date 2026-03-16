"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  ArrowRight,
  BookOpen,
  CircleDashed,
  Clock3,
  MessageCircleQuestion,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react"

import { useInterview } from "@/components/interview/interview-provider"
import { InterviewShell } from "@/components/interview/shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ASSESSMENT_LABELS,
  STATUS_LABELS,
  formatDateLabel,
  getModuleStats,
  getRecentPractice,
} from "@/lib/interview-helpers"

const STARTER_PATH = [
  {
    step: "Step 1",
    title: "先练自我介绍",
    description: "先把 30 秒和 1 分钟自我介绍练顺，面试开场先稳住。",
    category: "self-intro" as const,
  },
  {
    step: "Step 2",
    title: "再练项目一",
    description: "先讲清 insurance-rag 的一句话介绍、你负责什么、为什么这么设计。",
    category: "insurance-rag" as const,
  },
  {
    step: "Step 3",
    title: "补项目二和开放题",
    description: "最后把 Quorum 和收尾题补齐，形成完整一轮面试路径。",
    category: "quorum" as const,
  },
]

export function DashboardPage() {
  const router = useRouter()
  const { state, startPractice, setLastOpenedView } = useInterview()

  useEffect(() => {
    setLastOpenedView("/")
  }, [setLastOpenedView])

  const recentPractice = getRecentPractice(state.practiceRecords, 5)
  const moduleStats = getModuleStats(state.questions)
  const touchedQuestions = state.questions.filter(
    (question) =>
      question.lastReviewedAt ||
      question.status !== "not-started" ||
      question.confidence !== 1 ||
      question.highPriority ||
      question.inTodayPractice
  ).length
  const hasRealProgress = touchedQuestions > 0 || state.practiceRecords.length > 0
  const activeSessionLeft = Math.max(
    0,
    (state.practiceSession?.questionIds.length ?? 0) - (state.practiceSession?.currentIndex ?? 0)
  )

  function startModule(category: (typeof STARTER_PATH)[number]["category"]) {
    startPractice("module", category)
    router.push("/practice")
  }

  const summary = (
    <div className="rounded-[24px] border border-sky-300/12 bg-[#0c1826] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sky-400/12 text-sky-100">当前是空白进度</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
              只有你真实练过之后才会出现统计
            </Badge>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-300">
            这版不再预设任何“熟练度”或“准备度”。默认所有题都是未开始，所有统计都从你的真实练习行为里长出来。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => startModule("self-intro")}>
            <PlayCircle className="size-4" />
            从自我介绍开始
          </Button>
          <Button asChild variant="outline" className="border-white/12 bg-white/5 text-white">
            <Link href="/library">先看题库</Link>
          </Button>
        </div>
      </div>
    </div>
  )

  const leftRail = (
    <>
      <Card className="border-white/8 bg-white/6 shadow-none">
        <CardHeader>
          <CardTitle>推荐准备顺序</CardTitle>
          <CardDescription>不要全都同时练，按真实面试顺序推进更轻松。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {STARTER_PATH.map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => startModule(item.category)}
              className="w-full rounded-[22px] border border-white/8 bg-black/10 p-4 text-left transition hover:border-white/14 hover:bg-black/14"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.step}</p>
              <p className="mt-2 text-base font-medium text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-white/6 shadow-none">
        <CardHeader>
          <CardTitle>怎么用这个系统</CardTitle>
          <CardDescription>尽量只记住这三步，不需要先理解整站。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
          <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
            1. 先选一个模块开始练，不要先看完整题库。
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
            2. 练习时先自己答，再展开参考答案。
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/10 p-3">
            3. 用自评更新真实状态，后面的统计才会有意义。
          </div>
        </CardContent>
      </Card>
    </>
  )

  const rightRail = (
    <>
      <Card className="border-white/8 bg-white/6 shadow-none">
        <CardHeader>
          <CardTitle>当前真实状态</CardTitle>
          <CardDescription>这里不再显示预设数据，只显示你自己的进度。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">已动手练过</p>
            <p className="mt-2 text-3xl font-semibold text-white">{touchedQuestions}</p>
            <p className="mt-1 text-sm text-slate-300">题</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">进行中的练习</p>
            <p className="mt-2 text-3xl font-semibold text-white">{activeSessionLeft}</p>
            <p className="mt-1 text-sm text-slate-300">题未完成</p>
          </div>
          <Button
            variant="outline"
            className="w-full border-white/12 bg-white/5 text-white"
            disabled={!state.practiceSession || activeSessionLeft === 0}
            onClick={() => router.push("/practice")}
          >
            <Clock3 className="size-4" />
            继续上次练习
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-white/6 shadow-none">
        <CardHeader>
          <CardTitle>如果你想先整理内容</CardTitle>
          <CardDescription>题库页更适合做这几件事。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-6 text-slate-300">
          <div className="rounded-2xl border border-white/8 bg-black/10 p-3">把题标成高优先级</div>
          <div className="rounded-2xl border border-white/8 bg-black/10 p-3">写更像你自己说法的备注</div>
          <div className="rounded-2xl border border-white/8 bg-black/10 p-3">把题加入今日练习</div>
          <Button asChild variant="outline" className="mt-2 w-full border-white/12 bg-white/5 text-white">
            <Link href="/library">
              <BookOpen className="size-4" />
              去题库管理
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  )

  return (
    <InterviewShell
      title="从哪里开始准备，一眼就能知道"
      description="首页现在只做一件事：帮你判断下一步先练什么。等你真的练过之后，再逐步展示进度和记录。"
      leftRail={leftRail}
      rightRail={rightRail}
      summary={summary}
      actions={
        <>
          <Button onClick={() => startModule("self-intro")}>
            <Target className="size-4" />
            先练自我介绍
          </Button>
          <Button
            variant="outline"
            className="border-white/12 bg-white/5 text-white"
            onClick={() => {
              startPractice("random")
              router.push("/practice")
            }}
          >
            随机来一轮
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!hasRealProgress ? (
          <>
            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader>
                <CardTitle>第一次使用，建议这样开始</CardTitle>
                <CardDescription>不需要先看全局，不需要先整理完，先完成第一轮真实输出。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => startModule("self-intro")}
                  className="rounded-[26px] border border-sky-300/16 bg-sky-400/8 p-5 text-left transition hover:border-sky-300/28 hover:bg-sky-400/12"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-100/70">最推荐</p>
                  <p className="mt-2 text-lg font-medium text-white">先练自我介绍</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    先把 30 秒版、1 分钟版、为什么投这个方向练顺，最快建立开口状态。
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => startModule("insurance-rag")}
                  className="rounded-[26px] border border-emerald-300/16 bg-emerald-400/8 p-5 text-left transition hover:border-emerald-300/28 hover:bg-emerald-400/12"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">第二步</p>
                  <p className="mt-2 text-lg font-medium text-white">再练项目一</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    如果面试更偏 AI 应用，这一块通常是最容易被深挖的主战场。
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/library")}
                  className="rounded-[26px] border border-white/10 bg-black/12 p-5 text-left transition hover:border-white/16 hover:bg-black/18"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">如果你想先整理</p>
                  <p className="mt-2 text-lg font-medium text-white">去题库管理</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    适合先标重点、写备注、挑出今天要练的题，再回来进入练习模式。
                  </p>
                </button>
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader>
                <CardTitle>现在为什么几乎全是 0</CardTitle>
                <CardDescription>因为这些数据应该来自你的练习，而不是我替你预设。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
                  <CircleDashed className="size-5 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-white">默认不预设熟练度</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    所有题初始都是“未开始”，避免给你一种假的准备感。
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
                  <Sparkles className="size-5 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-white">练过才会有统计</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    最近记录、模块进度、练习趋势都会从你的真实自评里生成。
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
                  <ArrowRight className="size-5 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-white">先开始，不要先完美整理</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    你只要完成第一轮 5 到 8 题，系统就会自然变得更有参考价值。
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader>
                <CardTitle>手机上看题卡住了怎么办</CardTitle>
                <CardDescription>这版已经不是纯题库了，每道题都能直接追问 AI。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="rounded-[24px] border border-white/8 bg-black/10 p-4 text-sm leading-7 text-slate-300">
                  进入题库页后，每张题卡下方都有“问这题”。AI 会结合题目答案、你的备注和两个项目的真实源码来解释，不再只是泛泛回答。
                </div>
                <Button asChild>
                  <Link href="/library">
                    <MessageCircleQuestion className="size-4" />
                    去题库问 AI
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader>
                <CardTitle>你现在到哪一步了</CardTitle>
                <CardDescription>这里只保留真正能指导下一步动作的信息。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-3">
                  {moduleStats.map((module) => (
                    <div key={module.id} className="rounded-[22px] border border-white/8 bg-black/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{module.label}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            已熟 {module.mastered}/{module.total} · 高优先未完成 {module.highPriorityOpen}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                          {module.readiness}
                        </Badge>
                      </div>
                      <Progress value={module.readiness} className="mt-3 h-2 bg-white/8" />
                    </div>
                  ))}
                </div>
                <div className="rounded-[22px] border border-white/8 bg-black/10 p-4">
                  <p className="text-sm font-medium text-white">下一步建议</p>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
                    {activeSessionLeft > 0 ? (
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                        先继续上次练习，还剩 {activeSessionLeft} 题没做完。
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                        先开一轮新的模块练习，把今天最重要的一块练透。
                      </div>
                    )}
                    <Button className="w-full" onClick={() => startModule("self-intro")}>
                      再练一轮自我介绍
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-white/12 bg-white/5 text-white"
                      onClick={() => {
                        startPractice("random")
                        router.push("/practice")
                      }}
                    >
                      随机抽题检验一下
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader>
                <CardTitle>最近练习记录</CardTitle>
                <CardDescription>看最近几次真实练习，不再展示预设记录。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentPractice.length ? (
                  recentPractice.map((record) => {
                    const question = state.questions.find((item) => item.id === record.questionId)
                    return (
                      <div
                        key={record.id}
                        className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-black/10 p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">{question?.question ?? "未知问题"}</p>
                          <p className="mt-1 text-xs text-slate-400">{formatDateLabel(record.reviewedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                            {STATUS_LABELS[record.nextStatus]}
                          </Badge>
                          <Badge className="bg-emerald-400/12 text-emerald-100">
                            {ASSESSMENT_LABELS[record.assessment]}
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-white/8 bg-black/10 p-4 text-sm text-slate-300">
                    你还没有形成最近练习记录，先开始一轮输出就会出现。
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/8 bg-white/6 shadow-none">
              <CardHeader>
                <CardTitle>追问题也已经接上 AI</CardTitle>
                <CardDescription>不是在首页聊天，而是在具体题目旁边直接问。</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="rounded-[24px] border border-white/8 bg-black/10 p-4 text-sm leading-7 text-slate-300">
                  去题库页选题后，每道题卡下面都有“问这题”；练习页当前题也能直接追问。AI 会结合题目答案和项目源码来回答。
                </div>
                <Button asChild>
                  <Link href="/library">
                    <MessageCircleQuestion className="size-4" />
                    直接去试
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </InterviewShell>
  )
}
