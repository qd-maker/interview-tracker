import { type InterviewQuestion } from "@/lib/interview-types"

type IsoDaysAgo = (daysAgo: number, hour?: number, minute?: number) => string

function makeQuestion(
  question: Omit<InterviewQuestion, "notes" | "lastReviewedAt"> & {
    notes?: string
    lastReviewedAt?: string | null
  }
): InterviewQuestion {
  return {
    notes: "",
    lastReviewedAt: null,
    ...question,
  }
}

export function createQuorumQuestions(isoDaysAgo: IsoDaysAgo): InterviewQuestion[] {
  return [
    makeQuestion({
      id: "quorum-one-line",
      category: "quorum",
      question: "用一句话介绍一下 Quorum。",
      standardAnswer:
        "Quorum 是一个强调实时流式交互的 AI 应用，我主要围绕 SSE、历史记录持久化和性能优化，把它从一个能聊的 demo 往更像产品原型的方向推进。",
      shortAnswer:
        "Quorum 是一个偏实时交互的 AI 应用，我重点做了 SSE、持久化和性能优化。",
      bulletPoints: ["实时 AI 应用", "SSE", "历史记录", "性能优化"],
      mustRememberMetrics: ["一句话点出交互型 AI 产品"],
      commonFollowUps: ["它和普通聊天页有什么区别？", "你负责的关键部分是什么？"],
      pitfalls: ["只说是个聊天应用", "没有突出实时交互"],
      status: "solid",
      confidence: 4,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(1),
    }),
    makeQuestion({
      id: "quorum-why-build",
      category: "quorum",
      question: "为什么会做 Quorum 这个项目？",
      standardAnswer:
        "我做 Quorum 的出发点，是想把自己从单纯做问答类 AI 应用，往更偏交互产品的方向推一步。很多人做 LLM 项目会把重点放在模型输出本身，但我想补的是用户真正感知到的那层体验，比如消息是怎么流出来的、会话怎么恢复、切换页面后状态还在不在、延迟能不能接受。所以这个项目本质上是在练 AI 应用里的实时交互和工程体验。",
      shortAnswer:
        "因为我想补足 AI 产品里实时交互和工程体验这一块，不只是关注模型回答本身，而是关注用户真正能感知到的使用过程。",
      bulletPoints: ["从问答类项目延伸到交互类产品", "练实时流式体验", "练会话恢复和工程细节"],
      mustRememberMetrics: ["实时交互", "用户感知体验"],
      commonFollowUps: ["你觉得交互类 AI 产品最难的是什么？", "这个项目里最有产品感的一点是什么？"],
      pitfalls: ["只说想学 SSE", "动机太技术化"],
      status: "solid",
      confidence: 4,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(2),
    }),
    makeQuestion({
      id: "quorum-responsibility",
      category: "quorum",
      question: "你在 Quorum 里主要负责什么？",
      standardAnswer:
        "我主要负责服务端流式返回链路、历史记录和一部分性能优化。更具体一点，SSE 这块我处理了消息流的组织和前端消费方式；持久化这块我关注会话和消息怎么保存、怎么恢复；性能优化这块我主要看首字节时间、重复请求和页面切换时的状态损耗。我的目标不是把某个点做得很炫，而是把整条用户使用链路做顺。",
      shortAnswer:
        "我主要负责三块：SSE 流式链路、历史记录持久化，以及围绕首字节时间和重复请求做的性能优化。",
      bulletPoints: ["SSE", "会话与消息持久化", "性能优化", "把整条链路做顺"],
      mustRememberMetrics: ["首字节时间", "消息恢复成功率"],
      commonFollowUps: ["SSE 消息格式怎么定义的？", "持久化是怎么做的？"],
      pitfalls: ["职责说太散", "没有突出主线"],
      status: "solid",
      confidence: 4,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(3),
    }),
    makeQuestion({
      id: "quorum-why-sse",
      category: "quorum",
      question: "为什么用 SSE，而不是 WebSocket？",
      standardAnswer:
        "因为这个场景的主需求是服务端持续把生成中的内容推给前端，本质上是单向流式输出，SSE 在实现复杂度、兼容性和调试成本上都更合适。相比 WebSocket，SSE 对这种服务端到客户端的文本流场景更轻，而且和 HTTP 语义更接近，接入和排查都简单一些。只有在双向实时交互非常强、或者需要更复杂连接控制时，我才会更倾向 WebSocket。对 Quorum 这类先把流式输出和体验做好为主的产品，SSE 是更合适的权衡。",
      shortAnswer:
        "因为 Quorum 的核心是服务端单向流式输出，SSE 刚好更轻、更贴近 HTTP、调试也更简单。WebSocket 当然更强，但这个场景没必要先上那么重。",
      bulletPoints: ["主需求是单向流式输出", "SSE 更轻、实现简单", "和 HTTP 语义接近", "WebSocket 留给更强双向场景"],
      mustRememberMetrics: ["首字节时间", "连接稳定性", "实现复杂度"],
      commonFollowUps: ["SSE 的局限是什么？", "如果要做多人协作你还会选 SSE 吗？"],
      pitfalls: ["回答成 WebSocket 不好", "没说明是权衡而不是绝对优劣"],
      status: "can-say",
      confidence: 3,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(5),
    }),
    makeQuestion({
      id: "quorum-hard-part",
      category: "quorum",
      question: "Quorum 最难的地方是什么？",
      standardAnswer:
        "我觉得最难的是把体验上的顺滑感做出来，因为它不是一个单点功能问题。比如一条消息从请求发起、服务端开始返回、前端逐字展示、历史记录写入，再到用户刷新页面后能恢复，这中间任何一环卡住，用户都会觉得产品不顺。这个项目让我比较深刻的一点是，实时 AI 应用的难点往往是端到端链路，而不是某一行代码本身。",
      shortAnswer:
        "最难的是端到端链路的顺滑感。实时 AI 产品里，用户感受到的是整条链路，不是某个单独技术点。",
      bulletPoints: ["难点是端到端体验", "SSE、前端渲染、持久化都互相影响", "任何一环卡住都很明显"],
      mustRememberMetrics: ["端到端链路", "顺滑感"],
      commonFollowUps: ["哪一环最容易出问题？", "你怎么发现问题出在哪？"],
      pitfalls: ["只回答性能", "忽略持久化和恢复"],
      status: "solid",
      confidence: 4,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(2),
    }),
    makeQuestion({
      id: "quorum-performance",
      category: "quorum",
      question: "你做了哪些性能优化？",
      standardAnswer:
        "我主要关注三类优化。第一类是首字节时间，尽量让用户尽快看到第一段返回，而不是长时间空等。第二类是减少不必要的请求和重复渲染，比如切换会话或刷新时避免把已经拿过的数据重复拉一遍。第三类是状态恢复，让用户回来时能快速接上上下文，而不是重新等待一整轮生成。我的理解是，AI 应用里的性能优化不只是 benchmark，更重要的是用户主观等待时间有没有被压下来。",
      shortAnswer:
        "我主要优化了首字节时间、重复请求和状态恢复。核心目标不是跑分，而是让用户更早看到内容、切回来时更快接上上下文。",
      bulletPoints: ["压首字节时间", "减少重复请求和重复渲染", "做状态恢复", "关注主观等待时间"],
      mustRememberMetrics: ["SSE 首字节时间 P95", "重复请求数", "会话恢复耗时"],
      commonFollowUps: ["你怎么测首字节时间？", "有没有做过缓存？"],
      pitfalls: ["只说做了 loading", "没有具体优化目标"],
      status: "seen",
      confidence: 2,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(7),
    }),
    makeQuestion({
      id: "quorum-persistence",
      category: "quorum",
      question: "为什么要做历史记录和持久化？",
      standardAnswer:
        "因为对用户来说，会话连续性很重要。如果每次刷新页面或者切换路由，前面的消息都丢了，那整个产品会非常像 demo。做历史记录和持久化，一方面是让用户能回看上下文，另一方面也是让后续多轮对话、继续追问和问题排查都更有基础。尤其是实时生成场景，如果没有持久化，用户感受到的是一次性的；有了持久化，产品才开始像一个能长期使用的工具。",
      shortAnswer:
        "因为没有历史记录和持久化，产品就停留在 demo。做了之后，用户才能回看上下文、继续追问，产品体验才更完整。",
      bulletPoints: ["没有持久化就像 demo", "支持回看上下文", "支持继续追问", "也方便排查和后续能力扩展"],
      mustRememberMetrics: ["会话恢复成功率", "恢复耗时"],
      commonFollowUps: ["你保存了哪些数据？", "如果消息还在流式生成中怎么办？"],
      pitfalls: ["只说为了好看", "没落到用户价值"],
      status: "solid",
      confidence: 4,
      highPriority: true,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(1),
    }),
    makeQuestion({
      id: "quorum-metrics",
      category: "quorum",
      question: "Quorum 这个项目你关注哪些指标？",
      standardAnswer:
        "我会把它拆成体验指标和系统指标。体验指标里比较关键的是首字节时间、完整回复时间、会话恢复耗时，因为这些最直接影响用户体感。系统指标里我会看请求成功率、SSE 连接稳定性、重复请求情况，以及持久化是否成功。和普通页面性能不太一样，AI 应用里用户对‘是否马上开始有反馈’特别敏感，所以我会格外关注首字节时间的 P95。",
      shortAnswer:
        "关键看两层：体验上看首字节时间、完整回复时间、恢复耗时；系统上看请求成功率和 SSE 稳定性。里面最关键的是 P95 首字节时间。",
      bulletPoints: ["体验指标：TTFB、完整回复、恢复耗时", "系统指标：成功率、连接稳定性、重复请求", "重点盯 P95 首字节时间"],
      mustRememberMetrics: ["P95 首字节时间 < 1.5s", "恢复耗时", "SSE 成功率"],
      commonFollowUps: ["你怎么采这些指标？", "哪个指标最先暴露问题？"],
      pitfalls: ["没有分体验和系统", "只说响应快"],
      status: "seen",
      confidence: 2,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(6),
    }),
    makeQuestion({
      id: "quorum-limitations",
      category: "quorum",
      question: "这个项目现在还有哪些不足？",
      standardAnswer:
        "现在最大的不足是它还更偏单人使用场景，协作能力和更复杂的状态管理还没展开。另外，实时链路虽然打通了，但在异常恢复和观测上还有提升空间，比如连接中断后的自动恢复策略还可以更细。再往后如果继续做，我会优先补更稳定的错误处理和更完整的埋点，把体验优化从感觉层面进一步变成可量化的闭环。",
      shortAnswer:
        "现在还更像一个单人使用的 AI 原型，协作能力和异常恢复细节还不够。下一步我会补错误处理和埋点，让优化更可量化。",
      bulletPoints: ["偏单人使用", "异常恢复还可以更细", "埋点与观测不足", "下一步做稳定性闭环"],
      mustRememberMetrics: ["错误恢复", "埋点", "稳定性"],
      commonFollowUps: ["如果做多人协作你先改哪层？", "怎么做更好的异常恢复？"],
      pitfalls: ["说没什么不足", "不足不够具体"],
      status: "can-say",
      confidence: 3,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(4),
    }),
    makeQuestion({
      id: "quorum-debug",
      category: "quorum",
      question: "最难排查的一次问题是什么？",
      standardAnswer:
        "有一次前端看起来像是 SSE 卡住了，因为用户能发出请求，但页面很久都没看到流式内容。最开始我以为是前端渲染问题，后来一路排查请求发起时间、服务端开始写流的时间、浏览器实际收到 chunk 的时间，才发现问题出在某些情况下服务端虽然建立了连接，但首个有效 chunk 推得太晚。这个问题让我意识到，流式应用里不能只看总耗时，首字节时间和每段消息的节奏都很关键。",
      shortAnswer:
        "最难的一次是流式返回看起来像卡住，最后发现不是前端没渲染，而是服务端首个有效 chunk 发得太晚。这让我更重视首字节时间。",
      bulletPoints: ["现象：像是流式卡住", "误判：以为是前端渲染", "根因：首个有效 chunk 太晚", "收获：要拆首字节和总耗时"],
      mustRememberMetrics: ["首字节时间", "chunk 节奏"],
      commonFollowUps: ["你怎么记录这些时间点？", "后来做了什么优化？"],
      pitfalls: ["只有现象没根因", "说不出排查路径"],
      status: "can-say",
      confidence: 3,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(5),
    }),
  ]
}
