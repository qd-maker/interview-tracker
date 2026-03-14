"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, BookOpen, BrainCircuit, PanelsTopLeft, PlayCircle } from "lucide-react"
import { type ReactNode } from "react"

import { useInterview } from "@/components/interview/interview-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getTotalReadiness } from "@/lib/interview-helpers"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    href: "/",
    label: "作战面板",
    icon: PanelsTopLeft,
  },
  {
    href: "/library",
    label: "题库管理",
    icon: BookOpen,
  },
  {
    href: "/practice",
    label: "模拟练习",
    icon: PlayCircle,
  },
]

export function InterviewShell({
  title,
  description,
  leftRail,
  rightRail,
  children,
  actions,
  summary,
  contentGridClassName,
}: {
  title: string
  description: string
  leftRail?: ReactNode
  rightRail?: ReactNode
  children: ReactNode
  actions?: ReactNode
  summary?: ReactNode | null
  contentGridClassName?: string
}) {
  const pathname = usePathname()
  const { state } = useInterview()
  const totalReadiness = getTotalReadiness(state.questions)
  const todayCount = state.questions.filter((question) => question.inTodayPractice).length
  const activeSessionCount = Math.max(
    0,
    (state.practiceSession?.questionIds.length ?? 0) - (state.practiceSession?.currentIndex ?? 0)
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.08),_transparent_24%),linear-gradient(180deg,_#06111b_0%,_#091521_42%,_#050b12_100%)] text-foreground">
      <div className="mx-auto max-w-[1600px] px-4 py-4 md:px-6 lg:px-8">
        <header className="mb-4 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 lg:flex-row lg:items-start lg:justify-between lg:px-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-sky-400/20 bg-sky-400/10 text-sky-100">
                  Interview War Room
                </Badge>
                <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-300">
                  面向 AI 应用开发实习
                </Badge>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 md:text-[15px]">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          </div>
          {summary === null ? null : summary ? (
            <div className="px-5 py-4 lg:px-6">{summary}</div>
          ) : (
            <div className="grid gap-3 px-5 py-4 md:grid-cols-3 lg:px-6">
              <Card className="border border-white/8 bg-[#0d1724]/80 shadow-none">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">总准备度</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{totalReadiness}</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-400/12 text-sky-200">
                    <BarChart3 className="size-5" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-white/8 bg-[#0d1724]/80 shadow-none">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">今日待练</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{todayCount}</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-200">
                    <BrainCircuit className="size-5" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-white/8 bg-[#0d1724]/80 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">进行中</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{activeSessionCount}</p>
                    </div>
                    <Button asChild variant="outline" className="border-white/12 bg-white/5 text-white">
                      <Link href="/practice">去练习</Link>
                    </Button>
                  </div>
                  <Progress value={Math.min(totalReadiness, 100)} className="mt-4 h-2 bg-white/10" />
                </CardContent>
              </Card>
            </div>
          )}
        </header>

        <nav className="mb-4 flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
                  active
                    ? "border-sky-300/30 bg-sky-300/14 text-white shadow-[0_0_0_1px_rgba(125,211,252,0.08)_inset]"
                    : "border-white/10 bg-white/4 text-slate-300 hover:border-white/16 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div
          className={cn(
            "grid gap-4",
            leftRail && rightRail
              ? "xl:grid-cols-[280px_minmax(0,1fr)_320px]"
              : leftRail
                ? "xl:grid-cols-[280px_minmax(0,1fr)]"
                : rightRail
                  ? "xl:grid-cols-[minmax(0,1fr)_320px]"
                  : "grid-cols-1",
            contentGridClassName
          )}
        >
          {leftRail ? (
            <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">{leftRail}</aside>
          ) : null}
          <main className="min-w-0">{children}</main>
          {rightRail ? (
            <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">{rightRail}</aside>
          ) : null}
        </div>
      </div>
    </div>
  )
}
