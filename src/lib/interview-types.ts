export type QuestionCategory =
  | "self-intro"
  | "insurance-rag"
  | "quorum"
  | "open-ended"

export type QuestionStatus =
  | "not-started"
  | "seen"
  | "can-say"
  | "solid"
  | "fluent"

export type PracticeMode = "random" | "today" | "weak" | "module"

export type PracticeAssessment = "missed" | "okay" | "smooth"

export type AnswerViewMode = "standard" | "short" | "bullets"

export interface InterviewQuestion {
  id: string
  category: QuestionCategory
  question: string
  standardAnswer: string
  shortAnswer: string
  bulletPoints: string[]
  mustRememberMetrics: string[]
  commonFollowUps: string[]
  pitfalls: string[]
  status: QuestionStatus
  confidence: number
  highPriority: boolean
  inTodayPractice: boolean
  lastReviewedAt: string | null
  notes: string
}

export interface PracticeRecord {
  id: string
  sessionId: string
  questionId: string
  assessment: PracticeAssessment
  previousStatus: QuestionStatus
  nextStatus: QuestionStatus
  confidenceAfter: number
  reviewedAt: string
}

export interface PracticeSession {
  id: string
  mode: PracticeMode
  category?: QuestionCategory
  questionIds: string[]
  currentIndex: number
  answerVisible: boolean
  startedAt: string
}

export interface InterviewAppState {
  version: number
  questions: InterviewQuestion[]
  practiceRecords: PracticeRecord[]
  practiceSession: PracticeSession | null
  lastOpenedView: "/" | "/library" | "/practice"
}

export interface ModuleDefinition {
  id: QuestionCategory
  label: string
  shortLabel: string
  description: string
  accent: string
}
