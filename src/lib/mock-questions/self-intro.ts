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

export function createSelfIntroQuestions(isoDaysAgo: IsoDaysAgo): InterviewQuestion[] {
  return [
    makeQuestion({
      id: "intro-30s",
      category: "self-intro",
      question: "请你先做一个 30 秒的自我介绍。",
      standardAnswer:
        "我现在是大二，主要在做 AI 应用开发和偏后端的全栈项目。最近两段比较有代表性的经历，一个是做保险问答的 RAG 系统，我重点负责结构化输出、检索链路和字段级引用；另一个是做 Quorum 这种带实时流式交互的 AI 协作产品，我主要做服务端 SSE、历史记录和性能优化。现在想找的是能让我继续把 LLM 应用落地、把工程能力补齐的实习。",
      shortAnswer:
        "我是大二学生，最近主要在做两个方向：一个是保险场景的 RAG 应用，一个是带实时流式交互的 AI 产品。我的工作更偏后端和应用落地，所以想找一份 AI 应用开发 / 全栈偏后端方向的实习，继续把 LLM 工程能力做深。",
      bulletPoints: [
        "大二，目标方向明确",
        "AI 应用开发 + 偏后端全栈",
        "insurance-rag：结构化输出、检索、引用",
        "Quorum：SSE、持久化、性能优化",
        "求职目标：能继续做真实业务场景里的 LLM 应用",
      ],
      mustRememberMetrics: ["2 个项目能顺着讲", "30 秒内讲完", "结尾落到求职方向"],
      commonFollowUps: [
        "你在项目里最核心的贡献是什么？",
        "为什么会对 AI 应用方向感兴趣？",
      ],
      pitfalls: ["讲成流水账", "只说技术栈，不说自己负责什么", "结尾没落到岗位匹配"],
      status: "solid",
      confidence: 4,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(1),
      notes: "控制在 3 句话内，第一句身份，第二句项目，第三句岗位诉求。",
    }),
    makeQuestion({
      id: "intro-1m",
      category: "self-intro",
      question: "做一个 1 分钟版的自我介绍。",
      standardAnswer:
        "我是一名正在准备 AI 应用开发方向实习的大二学生，平时比较关注 LLM 应用怎么落到真实业务场景。最近做了两个项目。第一个是 insurance-rag，面向保险知识问答，我做的重点不是简单把模型接起来，而是把回答做成结构化输出，并且支持字段级引用和混合检索，让答案更可核验。第二个是 Quorum，是一个更偏交互式的 AI 应用，我主要负责服务端流式输出、历史记录持久化，还有一些性能优化，比如减少首字节等待和页面切换时的重复请求。通过这两个项目，我对 LLM 应用的一个体会是，只会 prompt 远远不够，真正难的是工程化、可观测性和用户体验。我希望实习里继续做这类需要模型能力和工程能力一起配合的工作。",
      shortAnswer:
        "我是大二，最近主要在做两个真实一点的 AI 项目。insurance-rag 让我更理解 RAG 的可核验输出和检索设计，Quorum 让我更理解流式交互、持久化和性能优化。我想找的实习，是能继续把模型能力和工程落地结合起来的岗位。",
      bulletPoints: [
        "身份 + 求职方向",
        "项目一：RAG 的可核验输出",
        "项目二：流式 AI 应用工程",
        "体会：难点在工程化，不只在 prompt",
        "收尾：希望继续做真实 AI 产品",
      ],
      mustRememberMetrics: ["1 分钟控制在 5 段内", "两个项目都要提到", "最后一句点岗位"],
      commonFollowUps: ["两个项目里你最满意的是哪一块？", "你觉得自己更偏后端还是更偏产品？"],
      pitfalls: ["展开太细", "说太多背景，项目内容反而弱", "没体现成长曲线"],
      status: "can-say",
      confidence: 3,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(3),
    }),
    makeQuestion({
      id: "intro-why-direction",
      category: "self-intro",
      question: "为什么投 AI 应用开发 / LLM 应用这个方向？",
      standardAnswer:
        "我投这个方向不是因为它热，而是因为我做过之后觉得它很适合我。纯算法研究我目前积累还不够，但我比较擅长把一个需求拆成系统设计、接口、状态管理、性能和体验这些具体问题。LLM 应用开发刚好要求既理解模型能力边界，又能把它做成稳定、可用、可复盘的产品。像在 insurance-rag 里，我更在意回答是不是能被追溯；在 Quorum 里，我更在意用户是不是能顺畅感受到流式交互的价值。所以我希望继续在这个方向上，把后端工程、产品理解和 AI 能力结合起来。",
      shortAnswer:
        "因为这个方向既需要理解模型，又需要把它做成真正可用的系统，这和我现在的能力结构比较匹配。我做项目时也更有反馈感，不是只停留在 demo，而是会去解决可核验、性能和体验问题。",
      bulletPoints: [
        "不是追热点，是做过后确认适合",
        "自己更擅长系统落地和工程问题",
        "LLM 应用需要模型理解 + 工程实现",
        "举 insurance-rag / Quorum 例子",
        "未来想继续做深",
      ],
      mustRememberMetrics: ["一定提 2 个项目体会", "别空谈行业趋势"],
      commonFollowUps: ["你觉得这个方向最大的工程难点是什么？", "为什么不是纯前端或纯算法？"],
      pitfalls: ["回答太宏大", "只说行业机会，不说个人匹配", "没有项目支撑"],
      status: "solid",
      confidence: 4,
      highPriority: true,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(2),
    }),
    makeQuestion({
      id: "intro-why-fit-role",
      category: "self-intro",
      question: "为什么你适合这个岗位？",
      standardAnswer:
        "我觉得我的匹配点主要有三层。第一，我不是只停留在课程项目，已经自己做过两个比较完整的 AI 应用，知道从需求、方案到联调和优化的完整链路。第二，我的能力结构比较适合偏应用落地的岗位，一方面能写前后端，另一方面会关注数据结构、延迟、可观测性和用户体验。第三，我目前还在学校阶段，学习曲线比较陡，遇到不熟的东西会快速补，比如在做 SSE、持久化和检索方案时，很多都是边查边试边复盘出来的。我可能不是一上来最有经验的，但我能比较快进入状态，而且愿意把问题啃透。",
      shortAnswer:
        "我适合这个岗位，主要是因为我已经在做类似的 AI 应用落地工作，而且能力结构偏工程实现，不只是会调用模型 API。再加上我现在学习速度比较快，能比较快补齐岗位需要的细节。",
      bulletPoints: [
        "做过完整 AI 应用",
        "前后端 + 后端工程 + AI 应用",
        "关注延迟、可观测性、体验",
        "学习速度快，愿意补位",
        "实话实说：经验还在积累，但进入状态快",
      ],
      mustRememberMetrics: ["回答结构 3 点", "要有一个具体例子"],
      commonFollowUps: ["如果让你补最短板的一块，你觉得是什么？", "你最想在实习里强化什么能力？"],
      pitfalls: ["只说热情", "把自己说得太满", "没有自知和边界"],
      status: "seen",
      confidence: 2,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(6),
    }),
    makeQuestion({
      id: "intro-differentiator",
      category: "self-intro",
      question: "和同届同学相比，你觉得自己的区分度是什么？",
      standardAnswer:
        "我觉得我的区分度不在于会的技术名词更多，而在于我会主动把项目往真实可用的方向推。比如做 RAG 时，我不会只停留在问答能跑通，而是会继续问回答能不能结构化、能不能字段级引用、能不能更方便评估；做 Quorum 时，我也不会只满足于流式输出出来了，而是会继续关注首字节时间、历史记录、上下文恢复这些体验问题。所以我更像是愿意把一个 AI demo 往产品原型推进的人，这可能是我和只做课程作业型项目的差别。",
      shortAnswer:
        "我的区分度是会把项目往可用性和工程化上继续推进，不是停在 demo 跑通。RAG 我会追问可核验和评估，实时应用我会追问延迟和历史记录，这让项目更像真实产品。",
      bulletPoints: [
        "不卷名词，卷项目完成度",
        "RAG：从能答到可核验",
        "Quorum：从能流到低延迟、可恢复",
        "愿意做 demo 之后的脏活累活",
      ],
      mustRememberMetrics: ["demo -> 产品原型", "至少举 2 个推进细节"],
      commonFollowUps: ["那你的短板是什么？", "你觉得现在还差哪种项目经验？"],
      pitfalls: ["踩别人", "讲得太空", "没有项目细节"],
      status: "can-say",
      confidence: 3,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(4),
    }),
    makeQuestion({
      id: "intro-learning-loop",
      category: "self-intro",
      question: "如果给你一个没做过的需求，你一般怎么快速补位？",
      standardAnswer:
        "我一般会先把问题拆小，再优先确认风险最高的那一段。比如之前做 SSE 和历史记录时，我不是一上来就写完整功能，而是先做最小链路，确认连接方式、消息格式和断线恢复的大方向可行，再往上补持久化、错误处理和界面状态。过程中我会保留几类资料：官方文档、最小可运行 demo 和自己的排查记录。这样后面遇到问题时，不会每次都从零开始。对我来说，补位不是把东西看懂，而是尽快建立一个能反复验证的最小闭环。",
      shortAnswer:
        "我会先拆问题、先验证高风险链路，再保留最小 demo 和排查记录。这样补位速度会比一开始就做大而全更快，也更稳。",
      bulletPoints: ["先拆问题", "优先验证高风险环节", "保留最小 demo", "做排查记录，形成复用闭环"],
      mustRememberMetrics: ["最小闭环", "高风险优先"],
      commonFollowUps: ["能举个最近补位的例子吗？", "你怎么判断什么是高风险？"],
      pitfalls: ["回答成学习方法泛谈", "没有结合项目场景"],
      status: "seen",
      confidence: 2,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(7),
    }),
  ]
}
