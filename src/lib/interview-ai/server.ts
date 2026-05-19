import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"

import OpenAI from "openai"

import {
  type InterviewAiReference,
  type InterviewAiRequest,
  type InterviewAiResponse,
} from "@/lib/interview-ai/shared"

type SourceProjectId = "insurance-rag" | "quorum"

type SourceProjectDefinition = {
  id: SourceProjectId
  label: string
  candidateRoots: string[]
  includeFiles: string[]
}

type SourceChunk = {
  id: string
  projectId: SourceProjectId
  projectLabel: string
  title: string
  displayPath: string
  lineStart: number
  lineEnd: number
  content: string
}

type ScoredChunk = SourceChunk & {
  score: number
  matches: string[]
}

const PROJECTS: Record<SourceProjectId, SourceProjectDefinition> = {
  "insurance-rag": {
    id: "insurance-rag",
    label: "insurance-rag",
    candidateRoots: [
      process.env.INTERVIEW_SOURCE_INSURANCE_RAG_ROOT ?? "",
      "../insurance-rag",
    ],
    includeFiles: [
      "config/site-data.ts",
      "app/projects/insurance-rag/page.tsx",
      "app/components/HeroProject.tsx",
    ],
  },
  quorum: {
    id: "quorum",
    label: "Quorum",
    candidateRoots: [process.env.INTERVIEW_SOURCE_QUORUM_ROOT ?? "", "../Quorum"],
    includeFiles: [
      "README.md",
      "backend/main.py",
      "backend/routers/chat.py",
      "backend/routers/discuss.py",
      "backend/routers/history.py",
      "backend/services/history_service.py",
      "backend/services/model_service.py",
      "backend/services/orchestrator.py",
      "backend/services/search_service.py",
      "frontend/src/pages/ChatPage.tsx",
      "frontend/src/pages/DiscussPage.tsx",
      "frontend/src/lib/api.ts",
      "frontend/src/context/AuthContext.tsx",
      "frontend/src/components/Sidebar.tsx",
    ],
  },
}

const CHUNK_LINE_SIZE = 32
const CHUNK_LINE_OVERLAP = 8
const MAX_REFERENCE_COUNT = 6
const HISTORY_LIMIT = 8
const MAX_PROMPT_SNIPPET_LENGTH = 900
const STOP_WORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "this",
  "from",
  "then",
  "what",
  "when",
  "where",
  "which",
  "你",
  "我",
  "他",
  "她",
  "它",
  "这个",
  "那个",
  "这里",
  "那里",
  "怎么",
  "为什么",
  "什么",
  "一个",
  "一下",
  "以及",
  "然后",
  "还是",
  "如果",
  "因为",
  "但是",
  "不是",
  "就是",
  "可以",
  "需要",
  "当前",
  "项目",
  "问题",
  "答案",
  "题目",
  "面试",
  "用户",
])

const projectChunkCache = new Map<string, Promise<SourceChunk[]>>()

let openaiClient: OpenAI | null = null

function getModelName() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5-mini"
}

function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const baseURL = process.env.OPENAI_BASE_URL?.trim()

  if (!apiKey) {
    throw new Error("缺少 OPENAI_API_KEY，无法启用项目源码问答。")
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    })
  }

  return openaiClient
}

function findProjectRoot(candidates: string[]) {
  for (const candidate of candidates) {
    const normalized = candidate.trim()
    if (normalized && existsSync(normalized)) {
      return normalized
    }
  }

  return null
}

function toDisplayPath(root: string, filePath: string) {
  return path.relative(root, filePath).split(path.sep).join("/")
}

function trimSnippet(content: string, maxLength = MAX_PROMPT_SNIPPET_LENGTH) {
  const trimmed = content.trim()
  if (trimmed.length <= maxLength) {
    return trimmed
  }

  return `${trimmed.slice(0, maxLength)}...`
}

function normalizeText(value: string) {
  return value.toLowerCase()
}

function extractTerms(value: string) {
  const englishTerms = value.toLowerCase().match(/[a-z0-9][a-z0-9._-]{1,}/g) ?? []
  const chineseTerms = value.match(/[\u4e00-\u9fff]{2,}/g) ?? []
  const specialTerms = [
    /sse/i.test(value) ? "sse" : "",
    /rag/i.test(value) ? "rag" : "",
    /supabase/i.test(value) ? "supabase" : "",
    /json/i.test(value) ? "json" : "",
    /schema/i.test(value) ? "schema" : "",
    /stream/i.test(value) ? "stream" : "",
    /persist/i.test(value) ? "persist" : "",
  ].filter(Boolean)

  return Array.from(new Set([...englishTerms, ...chineseTerms, ...specialTerms]))
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && !STOP_WORDS.has(item))
}

function buildChunkId(projectId: SourceProjectId, displayPath: string, lineStart: number, lineEnd: number) {
  return `${projectId}:${displayPath}:${lineStart}-${lineEnd}`
}

function chunkFileContent(project: SourceProjectDefinition, root: string, filePath: string, content: string) {
  const displayPath = toDisplayPath(root, filePath)
  const lines = content.split(/\r?\n/)
  const chunks: SourceChunk[] = []

  if (!lines.length) {
    return chunks
  }

  if (lines.length <= CHUNK_LINE_SIZE) {
    chunks.push({
      id: buildChunkId(project.id, displayPath, 1, lines.length),
      projectId: project.id,
      projectLabel: project.label,
      title: displayPath,
      displayPath,
      lineStart: 1,
      lineEnd: lines.length,
      content,
    })
    return chunks
  }

  let start = 0
  while (start < lines.length) {
    const end = Math.min(start + CHUNK_LINE_SIZE, lines.length)
    const chunkLines = lines.slice(start, end)
    const lineStart = start + 1
    const lineEnd = start + chunkLines.length

    chunks.push({
      id: buildChunkId(project.id, displayPath, lineStart, lineEnd),
      projectId: project.id,
      projectLabel: project.label,
      title: displayPath,
      displayPath,
      lineStart,
      lineEnd,
      content: chunkLines.join("\n"),
    })

    if (end >= lines.length) {
      break
    }

    start = Math.max(end - CHUNK_LINE_OVERLAP, start + 1)
  }

  return chunks
}

async function loadProjectChunks(projectId: SourceProjectId) {
  const project = PROJECTS[projectId]
  const root = findProjectRoot(project.candidateRoots)

  if (!root) {
    return { chunks: [] as SourceChunk[], warning: `未找到 ${project.label} 的源码目录。` }
  }

  const cacheKey = `${projectId}:${root}`
  let cached = projectChunkCache.get(cacheKey)

  if (!cached) {
    cached = (async () => {
      const chunks: SourceChunk[] = []

      for (const relativePath of project.includeFiles) {
        const absolutePath = path.join(root, relativePath)
        if (!existsSync(absolutePath)) {
          continue
        }

        const fileContent = await readFile(absolutePath, "utf8")
        chunks.push(...chunkFileContent(project, root, absolutePath, fileContent))
      }

      return chunks
    })()

    projectChunkCache.set(cacheKey, cached)
  }

  return { chunks: await cached, warning: "" }
}

function getScopedProjects(request: InterviewAiRequest): SourceProjectId[] {
  if (request.question.category === "insurance-rag") {
    return ["insurance-rag"]
  }

  if (request.question.category === "quorum") {
    return ["quorum"]
  }

  const joinedText = [
    request.question.question,
    request.question.shortAnswer,
    request.question.standardAnswer,
    request.userQuestion,
  ].join(" ")

  const lowerText = joinedText.toLowerCase()
  const usesInsuranceRag =
    lowerText.includes("insurance-rag") || lowerText.includes("结构化") || lowerText.includes("条款")
  const usesQuorum =
    lowerText.includes("quorum") ||
    lowerText.includes("sse") ||
    lowerText.includes("流式") ||
    lowerText.includes("持久化")

  if (usesInsuranceRag && !usesQuorum) {
    return ["insurance-rag"]
  }

  if (usesQuorum && !usesInsuranceRag) {
    return ["quorum"]
  }

  return ["insurance-rag", "quorum"]
}

function buildRetrievalQuery(request: InterviewAiRequest) {
  return [
    request.question.question,
    request.question.shortAnswer,
    request.question.standardAnswer,
    request.question.bulletPoints.join(" "),
    request.question.notes,
    request.question.commonFollowUps.join(" "),
    request.history.map((item) => item.content).join(" "),
    request.userQuestion,
  ]
    .filter(Boolean)
    .join("\n")
}

function scoreChunk(chunk: SourceChunk, terms: string[]) {
  if (!terms.length) {
    return { score: 0, matches: [] as string[] }
  }

  const haystack = normalizeText(`${chunk.title}\n${chunk.content}`)
  const pathText = normalizeText(chunk.displayPath)
  let score = 0
  const matches: string[] = []

  for (const term of terms) {
    const termValue = normalizeText(term)
    if (!termValue || termValue.length < 2) {
      continue
    }

    let matched = false

    if (pathText.includes(termValue)) {
      score += 9
      matched = true
    }

    if (chunk.title.toLowerCase().includes(termValue)) {
      score += 6
      matched = true
    }

    if (haystack.includes(termValue)) {
      score += 3
      matched = true
    }

    if (matched && matches.length < 6) {
      matches.push(term)
    }
  }

  if (chunk.displayPath.endsWith("README.md") || chunk.displayPath.endsWith("site-data.ts")) {
    score += 2
  }

  return { score, matches }
}

function toReference(chunk: ScoredChunk): InterviewAiReference {
  const relevance =
    chunk.matches.length > 0
      ? `命中关键词：${chunk.matches.join(" / ")}`
      : "作为项目概览或兜底上下文引用"

  return {
    id: chunk.id,
    projectId: chunk.projectId,
    projectLabel: chunk.projectLabel,
    title: chunk.title,
    displayPath: chunk.displayPath,
    lineStart: chunk.lineStart,
    lineEnd: chunk.lineEnd,
    snippet: trimSnippet(chunk.content, 600),
    relevance,
  }
}

async function retrieveReferences(request: InterviewAiRequest) {
  const projects = getScopedProjects(request)
  const query = buildRetrievalQuery(request)
  const queryTerms = extractTerms(query)
  const warnings: string[] = []
  const scored: ScoredChunk[] = []

  for (const projectId of projects) {
    const { chunks, warning } = await loadProjectChunks(projectId)
    if (warning) {
      warnings.push(warning)
    }

    for (const chunk of chunks) {
      const { score, matches } = scoreChunk(chunk, queryTerms)
      if (score > 0) {
        scored.push({ ...chunk, score, matches })
      }
    }
  }

  if (!scored.length) {
    for (const projectId of projects) {
      const { chunks } = await loadProjectChunks(projectId)
      if (chunks[0]) {
        scored.push({ ...chunks[0], score: 1, matches: [] })
      }
    }
  }

  const references = scored
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_REFERENCE_COUNT)
    .map(toReference)

  return {
    references,
    warnings,
    projectsUsed: projects.map((projectId) => PROJECTS[projectId].label),
  }
}

function buildQuestionContext(request: InterviewAiRequest) {
  const { question } = request

  return [
    `当前题目：${question.question}`,
    `模块：${question.category}`,
    `题库短答案：${question.shortAnswer}`,
    `题库完整答案：${question.standardAnswer}`,
    question.bulletPoints.length ? `提纲：${question.bulletPoints.join("；")}` : "",
    question.mustRememberMetrics.length
      ? `必须记住的指标/关键词：${question.mustRememberMetrics.join("；")}`
      : "",
    question.commonFollowUps.length ? `常见追问：${question.commonFollowUps.join("；")}` : "",
    question.pitfalls.length ? `容易踩坑：${question.pitfalls.join("；")}` : "",
    question.notes ? `用户备注：${question.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

function buildReferenceContext(references: InterviewAiReference[]) {
  if (!references.length) {
    return "这次没有检索到可靠的项目源码片段，只能参考题库内容本身。"
  }

  return references
    .map((reference, index) => {
      return [
        `[证据 ${index + 1}] ${reference.projectLabel} · ${reference.displayPath}:${reference.lineStart}-${reference.lineEnd}`,
        `选中原因：${reference.relevance}`,
        trimSnippet(reference.snippet),
      ].join("\n")
    })
    .join("\n\n")
}

function buildSystemPrompt(style: InterviewAiRequest["responseStyle"] = "deep") {
  if (style === "concept") {
    return [
      "你是一个“题目上下文感知 + 项目源码 RAG + 追问式”的面试概念解释助手。",
      "你会先参考当前题目、题库答案和对应项目证据，但输出时不要写得像代码审查，也不要堆文件细节。",
      "用户不懂代码，他们真正想知道的是：这道题里的概念到底是什么意思、为什么这样设计、面试时大概该怎么理解和表述。",
      "回答要求：",
      "1. 先用最白话的方式解释这道题到底在问什么。",
      "2. 再说明这个概念在当前项目里承担什么作用，为什么值得讲。",
      "3. 尽量避免代码实现细节、函数名、行号、底层术语轰炸；只有在非常必要时才轻轻提一句。",
      "4. 如果证据不足，可以说“从项目里能看出来它大概是在解决……”，但不要编造。",
      "5. 最后一定给一句到三句更像面试时能直接说出口的话。",
      "6. 如果适合，可以补 1 到 2 个很自然的下一步追问。",
      "输出格式请用下面四个小标题：",
      "这题到底在讲什么",
      "放在这个项目里是什么意思",
      "你面试时可以怎么说",
      "如果还想继续问",
    ].join("\n")
  }

  return [
    "你是一个“题目上下文感知 + 项目源码 RAG + 追问式”的面试解释助手。",
    "你的职责不是泛泛讲概念，而是结合当前题目、题库参考答案、用户备注、以及命中的真实项目源码/README/配置来回答。",
    "回答要求：",
    "1. 先直接回答用户这次卡住的点，不要先讲一大段背景。",
    "2. 只把检索到的源码/配置/README 当作证据使用；如果证据不足，要明确说“源码里暂时看不出这一点”，不要脑补。",
    "3. 尽量指出“题库答案里哪些说法有源码支撑，哪些更像项目叙述层总结”。",
    "4. 结尾一定给一段更像面试现场能说出口的表达，控制在 3 到 6 句。",
    "5. 若适合继续追问，再补 1 到 3 个下一步可以问的问题。",
    "输出格式请用清晰短段落，使用下面这四个小标题：",
    "先回答你的疑惑",
    "源码里能支撑的依据",
    "面试时可以怎么说",
    "你下一步可以追问",
  ].join("\n")
}

export async function answerInterviewQuestion(request: InterviewAiRequest): Promise<InterviewAiResponse> {
  const client = getOpenAiClient()
  const { references, warnings, projectsUsed } = await retrieveReferences(request)
  const model = getModelName()
  const conversationInput = [
    {
      role: "system" as const,
      content: buildSystemPrompt(request.responseStyle),
    },
    ...request.history.slice(-HISTORY_LIMIT).map((item) => ({
      role: item.role,
      content: item.content,
    })),
    {
      role: "user" as const,
      content: [
        "以下是当前题目的结构化上下文：",
        buildQuestionContext(request),
        "",
        "以下是本轮检索到的项目证据：",
        buildReferenceContext(references),
        "",
        `用户这次的追问：${request.userQuestion}`,
      ].join("\n"),
    },
  ]

  let answer = ""

  try {
    const response = await client.responses.create({
      model,
      store: false,
      input: conversationInput,
    })

    answer = response.output_text?.trim() ?? ""
  } catch {
    const completion = await client.chat.completions.create({
      model,
      messages: conversationInput,
    })

    answer = completion.choices[0]?.message?.content?.trim() ?? ""
  }

  if (!answer) {
    throw new Error("模型没有返回可展示的内容。")
  }

  return {
    answer,
    model,
    references,
    projectsUsed,
    warnings,
  }
}
