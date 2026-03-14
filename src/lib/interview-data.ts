import { createInsuranceRagQuestions } from "@/lib/mock-questions/insurance-rag"
import { createOpenEndedQuestions } from "@/lib/mock-questions/open-ended"
import { createQuorumQuestions } from "@/lib/mock-questions/quorum"
import { createSelfIntroQuestions } from "@/lib/mock-questions/self-intro"
import {
  type InterviewAppState,
  type InterviewQuestion,
  type ModuleDefinition,
  type PracticeRecord,
} from "@/lib/interview-types"

export const STORAGE_KEY = "interview-war-room.v2"

export const MODULES: ModuleDefinition[] = [
  {
    id: "self-intro",
    label: "自我介绍",
    shortLabel: "开场",
    description: "先把你是谁、为什么投这个方向说顺，拿下面试的第一分钟。",
    accent: "from-sky-400/25 via-cyan-400/12 to-transparent",
  },
  {
    id: "insurance-rag",
    label: "项目一 · insurance-rag",
    shortLabel: "RAG",
    description: "围绕结构化输出、字段级引用、混合检索，把核心设计讲清楚。",
    accent: "from-emerald-400/25 via-teal-400/12 to-transparent",
  },
  {
    id: "quorum",
    label: "项目二 · Quorum",
    shortLabel: "Quorum",
    description: "重点讲清实时交互、SSE、性能优化和持久化设计。",
    accent: "from-amber-400/22 via-orange-400/10 to-transparent",
  },
  {
    id: "open-ended",
    label: "开放题 / 收尾题",
    shortLabel: "收尾",
    description: "把动机、判断、期待和收尾提问准备成稳一点的口语表达。",
    accent: "from-violet-400/22 via-fuchsia-400/10 to-transparent",
  },
]

export function isoDaysAgo(daysAgo: number, hour = 21, minute = 30) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export function createSeedQuestions(): InterviewQuestion[] {
  return [
    ...createSelfIntroQuestions(isoDaysAgo),
    ...createInsuranceRagQuestions(isoDaysAgo),
    ...createQuorumQuestions(isoDaysAgo),
    ...createOpenEndedQuestions(isoDaysAgo),
  ].map((question) => ({
    ...question,
    status: "not-started",
    confidence: 1,
    highPriority: false,
    inTodayPractice: false,
    lastReviewedAt: null,
    notes: "",
  }))
}

export function createSeedPracticeRecords(): PracticeRecord[] {
  return []
}

export function createInitialAppState(): InterviewAppState {
  return {
    version: 2,
    questions: createSeedQuestions(),
    practiceRecords: createSeedPracticeRecords(),
    practiceSession: null,
    lastOpenedView: "/",
  }
}
