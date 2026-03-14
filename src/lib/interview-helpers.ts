import { MODULES, createInitialAppState, createSeedQuestions } from "@/lib/interview-data"
import {
  type InterviewAppState,
  type InterviewQuestion,
  type PracticeAssessment,
  type PracticeMode,
  type PracticeRecord,
  type PracticeSession,
  type QuestionCategory,
  type QuestionStatus,
} from "@/lib/interview-types"

export const STATUS_LABELS: Record<QuestionStatus, string> = {
  "not-started": "未开始",
  seen: "看过但不会说",
  "can-say": "基本能说",
  solid: "比较熟",
  fluent: "可脱口而出",
}

export const STATUS_ORDER: QuestionStatus[] = [
  "not-started",
  "seen",
  "can-say",
  "solid",
  "fluent",
]

export const ASSESSMENT_LABELS: Record<PracticeAssessment, string> = {
  missed: "没答出来",
  okay: "答得一般",
  smooth: "答得顺",
}

export const ASSESSMENT_HINTS: Record<PracticeAssessment, string> = {
  missed: "降一级并加入近期弱项观察",
  okay: "保底推进到可输出状态",
  smooth: "向更熟练推进并提升自信度",
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function shuffle<T>(items: T[]) {
  const copied = [...items]
  for (let index = copied.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]]
  }
  return copied
}

export function getStatusIndex(status: QuestionStatus) {
  return STATUS_ORDER.indexOf(status)
}

export function getReadinessScore(question: InterviewQuestion) {
  const statusScore = (getStatusIndex(question.status) / (STATUS_ORDER.length - 1)) * 80
  const confidenceScore = (clamp(question.confidence, 1, 5) / 5) * 20
  return Math.round(statusScore + confidenceScore)
}

export function getCategoryQuestions(
  questions: InterviewQuestion[],
  category: QuestionCategory
) {
  return questions.filter((question) => question.category === category)
}

export function getModuleStats(questions: InterviewQuestion[]) {
  return MODULES.map((module) => {
    const moduleQuestions = getCategoryQuestions(questions, module.id)
    const total = moduleQuestions.length || 1
    const readiness =
      moduleQuestions.reduce((sum, question) => sum + getReadinessScore(question), 0) / total
    const mastered = moduleQuestions.filter((question) =>
      ["solid", "fluent"].includes(question.status)
    ).length
    const highPriorityOpen = moduleQuestions.filter(
      (question) =>
        question.highPriority && !["solid", "fluent"].includes(question.status)
    ).length

    return {
      ...module,
      total: moduleQuestions.length,
      readiness: Math.round(readiness || 0),
      mastered,
      highPriorityOpen,
    }
  })
}

export function getTotalReadiness(questions: InterviewQuestion[]) {
  if (!questions.length) {
    return 0
  }

  return Math.round(
    questions.reduce((sum, question) => sum + getReadinessScore(question), 0) /
      questions.length
  )
}

export function getWeakQuestions(questions: InterviewQuestion[], limit = 6) {
  return [...questions]
    .sort((left, right) => {
      const leftScore =
        getReadinessScore(left) - (left.highPriority ? 8 : 0) - (left.inTodayPractice ? 5 : 0)
      const rightScore =
        getReadinessScore(right) - (right.highPriority ? 8 : 0) - (right.inTodayPractice ? 5 : 0)
      return leftScore - rightScore
    })
    .slice(0, limit)
}

export function getRecentPractice(records: PracticeRecord[], limit = 6) {
  return [...records]
    .sort(
      (left, right) =>
        new Date(right.reviewedAt).getTime() - new Date(left.reviewedAt).getTime()
    )
    .slice(0, limit)
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(date)
}

export function formatRelativeDay(value: string | null) {
  if (!value) {
    return "还没练过"
  }

  const target = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const compare = new Date(target)
  compare.setHours(0, 0, 0, 0)

  const diff = Math.round((today.getTime() - compare.getTime()) / 86400000)

  if (diff <= 0) {
    return "今天"
  }

  if (diff === 1) {
    return "昨天"
  }

  if (diff < 7) {
    return `${diff} 天前`
  }

  return formatDayLabel(target)
}

export function getSevenDayPractice(records: PracticeRecord[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const nextDate = new Date(date)
    nextDate.setDate(date.getDate() + 1)

    const count = records.filter((record) => {
      const time = new Date(record.reviewedAt).getTime()
      return time >= date.getTime() && time < nextDate.getTime()
    }).length

    return {
      label: formatDayLabel(date),
      count,
    }
  })
}

export function getStatusDistribution(questions: InterviewQuestion[]) {
  return STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    value: questions.filter((question) => question.status === status).length,
  }))
}

export function getMetricFlashcards(questions: InterviewQuestion[], limit = 8) {
  const counter = new Map<string, number>()

  questions.forEach((question) => {
    question.mustRememberMetrics.forEach((metric) => {
      counter.set(metric, (counter.get(metric) || 0) + 1)
    })
  })

  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([metric, count]) => ({
      metric,
      count,
    }))
}

export function getCurrentPracticeQuestion(
  session: PracticeSession | null,
  questions: InterviewQuestion[]
) {
  if (!session) {
    return null
  }

  const currentQuestionId = session.questionIds[session.currentIndex]
  return questions.find((question) => question.id === currentQuestionId) ?? null
}

export function getSessionProgress(session: PracticeSession | null) {
  if (!session || session.questionIds.length === 0) {
    return { completed: 0, total: 0, percentage: 0 }
  }

  const completed = clamp(session.currentIndex, 0, session.questionIds.length)
  return {
    completed,
    total: session.questionIds.length,
    percentage: Math.round((completed / session.questionIds.length) * 100),
  }
}

export function getSessionRecords(records: PracticeRecord[], sessionId?: string) {
  if (!sessionId) {
    return []
  }

  return records.filter((record) => record.sessionId === sessionId)
}

export function getQuestionsForMode(
  questions: InterviewQuestion[],
  mode: PracticeMode,
  category?: QuestionCategory
) {
  if (mode === "today") {
    return questions.filter((question) => question.inTodayPractice)
  }

  if (mode === "weak") {
    return getWeakQuestions(questions, 10)
  }

  if (mode === "module") {
    return questions.filter((question) => question.category === category)
  }

  return questions
}

export function createPracticeSession(
  questions: InterviewQuestion[],
  mode: PracticeMode,
  category?: QuestionCategory
): PracticeSession | null {
  const selected = shuffle(getQuestionsForMode(questions, mode, category)).slice(0, 8)

  if (!selected.length) {
    return null
  }

  return {
    id: `session-${Date.now()}`,
    mode,
    category,
    questionIds: selected.map((question) => question.id),
    currentIndex: 0,
    answerVisible: false,
    startedAt: new Date().toISOString(),
  }
}

export function getNextQuestionState(
  status: QuestionStatus,
  confidence: number,
  assessment: PracticeAssessment
) {
  const statusIndex = getStatusIndex(status)

  if (assessment === "missed") {
    return {
      status: STATUS_ORDER[clamp(statusIndex - 1, 0, STATUS_ORDER.length - 1)],
      confidence: clamp(confidence - 1, 1, 5),
    }
  }

  if (assessment === "okay") {
    return {
      status:
        STATUS_ORDER[
          clamp(Math.max(statusIndex, getStatusIndex("can-say")), 0, STATUS_ORDER.length - 1)
        ],
      confidence: clamp(confidence + 1, 1, 5),
    }
  }

  return {
    status: STATUS_ORDER[clamp(statusIndex + 1, 0, STATUS_ORDER.length - 1)],
    confidence: clamp(confidence + 1, 1, 5),
  }
}

function sanitizeQuestion(
  source: Partial<InterviewQuestion>,
  fallback: InterviewQuestion
): InterviewQuestion {
  return {
    ...fallback,
    ...source,
    status: STATUS_ORDER.includes(source.status as QuestionStatus)
      ? (source.status as QuestionStatus)
      : fallback.status,
    confidence: clamp(Number(source.confidence ?? fallback.confidence), 1, 5),
    bulletPoints: Array.isArray(source.bulletPoints)
      ? source.bulletPoints.filter((item): item is string => typeof item === "string")
      : fallback.bulletPoints,
    mustRememberMetrics: Array.isArray(source.mustRememberMetrics)
      ? source.mustRememberMetrics.filter((item): item is string => typeof item === "string")
      : fallback.mustRememberMetrics,
    commonFollowUps: Array.isArray(source.commonFollowUps)
      ? source.commonFollowUps.filter((item): item is string => typeof item === "string")
      : fallback.commonFollowUps,
    pitfalls: Array.isArray(source.pitfalls)
      ? source.pitfalls.filter((item): item is string => typeof item === "string")
      : fallback.pitfalls,
    highPriority: Boolean(source.highPriority ?? fallback.highPriority),
    inTodayPractice: Boolean(source.inTodayPractice ?? fallback.inTodayPractice),
    notes: typeof source.notes === "string" ? source.notes : fallback.notes,
    lastReviewedAt:
      typeof source.lastReviewedAt === "string" || source.lastReviewedAt === null
        ? source.lastReviewedAt
        : fallback.lastReviewedAt,
  }
}

export function normalizeImportedState(raw: unknown): InterviewAppState {
  const defaultState = createInitialAppState()
  const defaultQuestions = createSeedQuestions()

  if (!raw || typeof raw !== "object") {
    return defaultState
  }

  const source = raw as Partial<InterviewAppState>
  const rawQuestions: unknown[] = Array.isArray(source.questions) ? source.questions : []
  const questionMap = new Map(
    rawQuestions
      .filter((question): question is Partial<InterviewQuestion> & { id: string } => {
        if (!question || typeof question !== "object") {
          return false
        }

        const candidate = question as Record<string, unknown>
        return typeof candidate.id === "string"
      })
      .map((question) => [question.id, question])
  )

  const mergedQuestions = defaultQuestions.map((question) =>
    sanitizeQuestion(questionMap.get(question.id) ?? {}, question)
  )

  const extraQuestions = rawQuestions
    .filter((question): question is Partial<InterviewQuestion> & { id: string } => {
      if (!question || typeof question !== "object") {
        return false
      }

      const candidate = question as Record<string, unknown>
      return (
        typeof candidate.id === "string" &&
        !defaultQuestions.some((defaultQuestion) => defaultQuestion.id === candidate.id) &&
        typeof candidate.question === "string" &&
        typeof candidate.standardAnswer === "string"
      )
    })
    .map((question) =>
      sanitizeQuestion(question, {
        id: question.id,
        category: "open-ended",
        question: question.question ?? "未命名问题",
        standardAnswer: question.standardAnswer ?? "",
        shortAnswer: question.shortAnswer ?? "",
        bulletPoints: [],
        mustRememberMetrics: [],
        commonFollowUps: [],
        pitfalls: [],
        status: "not-started",
        confidence: 1,
        highPriority: false,
        inTodayPractice: false,
        lastReviewedAt: null,
        notes: "",
      })
    )

  const allQuestions = [...mergedQuestions, ...extraQuestions]
  const validQuestionIds = new Set(allQuestions.map((question) => question.id))

  const practiceRecords = Array.isArray(source.practiceRecords)
    ? (source.practiceRecords as unknown[])
        .filter(
          (record): record is PracticeRecord => {
            if (!record || typeof record !== "object") {
              return false
            }

            const candidate = record as Record<string, unknown>
            return (
              typeof candidate.id === "string" &&
              typeof candidate.sessionId === "string" &&
              typeof candidate.questionId === "string" &&
              validQuestionIds.has(candidate.questionId) &&
              typeof candidate.reviewedAt === "string"
            )
          }
        )
        .map((record) => ({
          ...record,
          assessment: ["missed", "okay", "smooth"].includes(record.assessment)
            ? record.assessment
            : "okay",
          previousStatus: STATUS_ORDER.includes(record.previousStatus)
            ? record.previousStatus
            : "seen",
          nextStatus: STATUS_ORDER.includes(record.nextStatus) ? record.nextStatus : "can-say",
          confidenceAfter: clamp(record.confidenceAfter, 1, 5),
        }))
    : defaultState.practiceRecords

  const rawSession =
    source.practiceSession && typeof source.practiceSession === "object"
      ? (source.practiceSession as unknown as Record<string, unknown>)
      : null

  const session: PracticeSession | null =
    rawSession && Array.isArray(rawSession.questionIds)
      ? {
          id:
            typeof rawSession.id === "string"
              ? rawSession.id
              : `session-${Date.now()}`,
          mode:
            rawSession.mode === "random" ||
            rawSession.mode === "today" ||
            rawSession.mode === "weak" ||
            rawSession.mode === "module"
              ? rawSession.mode
              : "random",
          category:
            rawSession.category === "self-intro" ||
            rawSession.category === "insurance-rag" ||
            rawSession.category === "quorum" ||
            rawSession.category === "open-ended"
              ? rawSession.category
              : undefined,
          questionIds: rawSession.questionIds.filter(
            (id): id is string => typeof id === "string" && validQuestionIds.has(id)
          ),
          currentIndex: clamp(
            Number(rawSession.currentIndex ?? 0),
            0,
            rawSession.questionIds.length
          ),
          answerVisible: Boolean(rawSession.answerVisible),
          startedAt:
            typeof rawSession.startedAt === "string"
              ? rawSession.startedAt
              : new Date().toISOString(),
        }
      : null

  return {
    version: defaultState.version,
    questions: allQuestions,
    practiceRecords,
    practiceSession: session && session.questionIds.length ? session : null,
    lastOpenedView:
      source.lastOpenedView === "/library" || source.lastOpenedView === "/practice"
        ? source.lastOpenedView
        : "/",
  }
}
