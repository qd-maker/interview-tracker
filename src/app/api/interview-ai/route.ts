import { NextResponse } from "next/server"

import { answerInterviewQuestion } from "@/lib/interview-ai/server"
import { type InterviewAiRequest } from "@/lib/interview-ai/shared"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isRequestShape(value: unknown): value is InterviewAiRequest {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<InterviewAiRequest>

  return (
    !!candidate.question &&
    typeof candidate.question === "object" &&
    typeof candidate.question.question === "string" &&
    typeof candidate.question.standardAnswer === "string" &&
    typeof candidate.question.shortAnswer === "string" &&
    Array.isArray(candidate.question.bulletPoints) &&
    Array.isArray(candidate.question.mustRememberMetrics) &&
    Array.isArray(candidate.question.commonFollowUps) &&
    Array.isArray(candidate.question.pitfalls) &&
    typeof candidate.question.notes === "string" &&
    typeof candidate.userQuestion === "string" &&
    Array.isArray(candidate.history)
  )
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown

    if (!isRequestShape(body)) {
      return NextResponse.json(
        { error: "请求格式不正确，缺少题目上下文或追问内容。" },
        { status: 400 }
      )
    }

    if (!body.userQuestion.trim()) {
      return NextResponse.json({ error: "请输入你当前的疑问。" }, { status: 400 })
    }

    const result = await answerInterviewQuestion(body)
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 助手暂时不可用，请稍后再试。"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
