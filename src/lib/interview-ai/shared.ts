import { type QuestionCategory } from "@/lib/interview-types"

export interface InterviewQuestionContext {
  id: string
  category: QuestionCategory
  question: string
  standardAnswer: string
  shortAnswer: string
  bulletPoints: string[]
  mustRememberMetrics: string[]
  commonFollowUps: string[]
  pitfalls: string[]
  notes: string
}

export interface InterviewAiTurn {
  role: "user" | "assistant"
  content: string
}

export interface InterviewAiRequest {
  question: InterviewQuestionContext
  userQuestion: string
  history: InterviewAiTurn[]
  responseStyle?: "concept" | "deep"
}

export interface InterviewAiReference {
  id: string
  projectId: string
  projectLabel: string
  title: string
  displayPath: string
  lineStart: number
  lineEnd: number
  snippet: string
  relevance: string
}

export interface InterviewAiResponse {
  answer: string
  model: string
  references: InterviewAiReference[]
  projectsUsed: string[]
  warnings: string[]
}
