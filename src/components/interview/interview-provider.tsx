"use client"

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { STORAGE_KEY, createInitialAppState } from "@/lib/interview-data"
import {
  createPracticeSession,
  getCurrentPracticeQuestion,
  getNextQuestionState,
  normalizeImportedState,
} from "@/lib/interview-helpers"
import {
  type InterviewAppState,
  type InterviewQuestion,
  type PracticeAssessment,
  type PracticeMode,
  type QuestionCategory,
} from "@/lib/interview-types"

type InterviewContextValue = {
  state: InterviewAppState
  hydrated: boolean
  updateQuestion: (id: string, patch: Partial<InterviewQuestion>) => void
  startPractice: (mode: PracticeMode, category?: QuestionCategory) => void
  revealAnswer: (visible?: boolean) => void
  recordPractice: (assessment: PracticeAssessment) => void
  skipToNext: () => void
  clearPracticeSession: () => void
  replaceState: (raw: unknown) => void
  resetState: () => void
  exportState: () => string
  setLastOpenedView: (view: "/" | "/library" | "/practice") => void
}

const InterviewContext = createContext<InterviewContextValue | null>(null)

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InterviewAppState>(() => createInitialAppState())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setState(normalizeImportedState(JSON.parse(raw)))
      }
    } catch {
      setState(createInitialAppState())
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [hydrated, state])

  function updateQuestion(id: string, patch: Partial<InterviewQuestion>) {
    setState((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question
      ),
    }))
  }

  function startPractice(mode: PracticeMode, category?: QuestionCategory) {
    setState((current) => {
      const practiceSession = createPracticeSession(current.questions, mode, category)

      if (!practiceSession) {
        return current
      }

      return {
        ...current,
        practiceSession,
        lastOpenedView: "/practice",
      }
    })
  }

  function revealAnswer(visible = true) {
    setState((current) => ({
      ...current,
      practiceSession: current.practiceSession
        ? { ...current.practiceSession, answerVisible: visible }
        : current.practiceSession,
    }))
  }

  function recordPractice(assessment: PracticeAssessment) {
    setState((current) => {
      const activeQuestion = getCurrentPracticeQuestion(
        current.practiceSession,
        current.questions
      )

      if (!current.practiceSession || !activeQuestion) {
        return current
      }

      const now = new Date().toISOString()
      const nextState = getNextQuestionState(
        activeQuestion.status,
        activeQuestion.confidence,
        assessment
      )

      const questions = current.questions.map((question) => {
        if (question.id !== activeQuestion.id) {
          return question
        }

        return {
          ...question,
          status: nextState.status,
          confidence: nextState.confidence,
          lastReviewedAt: now,
          highPriority: assessment === "missed" ? true : question.highPriority,
          inTodayPractice:
            assessment === "smooth" && nextState.status === "fluent"
              ? false
              : true,
        }
      })

      const nextIndex = current.practiceSession.currentIndex + 1

      return {
        ...current,
        questions,
        practiceRecords: [
          {
            id: `record-${Date.now()}`,
            sessionId: current.practiceSession.id,
            questionId: activeQuestion.id,
            assessment,
            previousStatus: activeQuestion.status,
            nextStatus: nextState.status,
            confidenceAfter: nextState.confidence,
            reviewedAt: now,
          },
          ...current.practiceRecords,
        ],
        practiceSession: {
          ...current.practiceSession,
          currentIndex: nextIndex,
          answerVisible: false,
        },
      }
    })
  }

  function skipToNext() {
    setState((current) => {
      if (!current.practiceSession) {
        return current
      }

      const nextIndex = Math.min(
        current.practiceSession.currentIndex + 1,
        current.practiceSession.questionIds.length
      )

      return {
        ...current,
        practiceSession: {
          ...current.practiceSession,
          currentIndex: nextIndex,
          answerVisible: false,
        },
      }
    })
  }

  function clearPracticeSession() {
    setState((current) => ({
      ...current,
      practiceSession: null,
    }))
  }

  function replaceState(raw: unknown) {
    startTransition(() => {
      setState(normalizeImportedState(raw))
    })
  }

  function resetState() {
    setState(createInitialAppState())
  }

  function exportState() {
    return JSON.stringify(state, null, 2)
  }

  function setLastOpenedView(view: "/" | "/library" | "/practice") {
    setState((current) =>
      current.lastOpenedView === view ? current : { ...current, lastOpenedView: view }
    )
  }

  return (
    <InterviewContext.Provider
      value={{
        state,
        hydrated,
        updateQuestion,
        startPractice,
        revealAnswer,
        recordPractice,
        skipToNext,
        clearPracticeSession,
        replaceState,
        resetState,
        exportState,
        setLastOpenedView,
      }}
    >
      {children}
    </InterviewContext.Provider>
  )
}

export function useInterview() {
  const context = useContext(InterviewContext)

  if (!context) {
    throw new Error("useInterview must be used inside InterviewProvider")
  }

  return context
}
