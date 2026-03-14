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

export function createInsuranceRagQuestions(isoDaysAgo: IsoDaysAgo): InterviewQuestion[] {
  return [
    makeQuestion({
      id: "rag-one-line",
      category: "insurance-rag",
      question: "用一句话介绍 insurance-rag。",
      standardAnswer:
        "insurance-rag 是一个面向保险知识问答的 LLM 应用，我把重点放在结构化答案、字段级引用和混合检索上，让回答不仅能生成，还能更稳定、更可核验。",
      shortAnswer:
        "它是一个保险场景的 RAG 系统，但重点不是简单问答，而是可核验的结构化输出。",
      bulletPoints: ["保险知识问答", "RAG", "结构化输出", "字段级引用", "混合检索"],
      mustRememberMetrics: ["一句话讲清 3 个关键词"],
      commonFollowUps: ["这个项目解决的真实问题是什么？", "和普通 RAG demo 的区别是什么？"],
      pitfalls: ["说太长", "只说用了什么模型"],
      status: "solid",
      confidence: 4,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(1),
    }),
    makeQuestion({
      id: "rag-why-build",
      category: "insurance-rag",
      question: "为什么会做这个项目？",
      standardAnswer:
        "我做这个项目主要是想解决两个问题。第一，保险类问答对准确性和可解释性要求比较高，普通聊天式回答很容易让人不放心。第二，我想验证 RAG 在垂直场景里到底难在哪里，尤其是检索质量、答案结构和引用追溯。所以这个项目一开始就不是为了做一个炫 demo，而是想围绕真实业务更关心的可信度和可复核性来设计。",
      shortAnswer:
        "因为保险问答这个场景天然要求可信和可解释，我想借这个项目把 RAG 里真正难的部分，比如检索质量和引用追溯，做得更扎实。",
      bulletPoints: [
        "保险场景对可信度要求高",
        "普通生成式回答不够让人放心",
        "想验证 RAG 在垂直场景里的难点",
        "目标是可复核，不是炫技",
      ],
      mustRememberMetrics: ["可信度", "可解释性", "垂直场景"],
      commonFollowUps: ["为什么选保险，不选更常见的知识库场景？", "你怎么定义可信？"],
      pitfalls: ["回答成个人兴趣", "没落到场景特点"],
      status: "solid",
      confidence: 4,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(2),
    }),
    makeQuestion({
      id: "rag-responsibility",
      category: "insurance-rag",
      question: "你在 insurance-rag 里主要负责什么？",
      standardAnswer:
        "我主要负责三块。第一是回答链路设计，包括 query 处理、检索、重排和生成阶段怎么串起来。第二是答案表达方式，我推动把输出做成结构化格式，并为每个关键字段关联引用片段。第三是效果验证和问题排查，比如看哪些字段容易缺失、哪些问题会检索错、哪些回答虽然通顺但证据不够扎实。简单说，我做的不只是把模型接起来，而是把这套问答链路变得更可控。",
      shortAnswer:
        "我主要负责 RAG 主链路、结构化输出和字段级引用这三块，也会做效果验证和问题排查。",
      bulletPoints: ["RAG 主链路", "结构化答案设计", "字段级引用", "效果验证与排查"],
      mustRememberMetrics: ["说自己负责的 3 块，不泛化团队贡献"],
      commonFollowUps: ["你具体改过哪些 prompt 或 schema？", "你最难的一次排查是什么？"],
      pitfalls: ["把团队贡献都说成自己的", "职责边界不清"],
      status: "solid",
      confidence: 4,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(2),
    }),
    makeQuestion({
      id: "rag-structured-output",
      category: "insurance-rag",
      question: "为什么要做结构化输出，而不是直接生成一段自然语言？",
      standardAnswer:
        "因为保险问答里，很多时候用户真正关心的是几个关键字段，比如是否赔付、适用条件、免责项、等待期等。如果只给一段自然语言，模型很容易把重点埋在文字里，也不方便前端展示、评估和后续引用追溯。做成结构化输出之后，我可以更明确地约束模型回答哪些字段、哪些字段允许为空，也更容易做字段级校验和评估。对业务来说，这比一段看起来通顺的话更有用。",
      shortAnswer:
        "结构化输出的价值在于可控、可展示、可评估。保险问答不是比谁写得像客服，而是要把关键字段稳稳提出来。",
      bulletPoints: ["关键字段要明确提取", "自然语言不利于展示和评估", "方便做字段级校验", "让回答更可控"],
      mustRememberMetrics: ["字段完整率", "字段为空率", "字段级引用覆盖率"],
      commonFollowUps: ["结构化输出有没有牺牲自然度？", "schema 太严格会不会影响生成？"],
      pitfalls: ["只说前端方便展示", "没提评估和约束价值"],
      status: "can-say",
      confidence: 3,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(5),
    }),
    makeQuestion({
      id: "rag-field-citation",
      category: "insurance-rag",
      question: "为什么要做字段级引用？",
      standardAnswer:
        "因为一个回答里不同字段的证据来源可能并不一样。如果只在整段答案后面挂一个统一引用，用户很难知道某个关键判断到底对应哪段原文。字段级引用可以把每个结论和证据片段绑定起来，一方面更方便用户核验，另一方面也更方便我排查问题，比如是模型抽取错了，还是检索本身没拿到对的片段。对保险这种高风险场景来说，这个粒度是值得做的。",
      shortAnswer:
        "字段级引用的核心价值是把结论和证据一一对应，既方便用户核验，也方便工程侧定位错误来源。",
      bulletPoints: ["不同字段可能对应不同证据", "整段统一引用不够细", "方便用户核验", "方便排查检索错还是抽取错"],
      mustRememberMetrics: ["字段级引用覆盖率", "错误定位速度"],
      commonFollowUps: ["字段级引用怎么实现？", "有没有遇到多个字段指向同一证据片段？"],
      pitfalls: ["回答成可解释性套话", "没说明比整段引用好在哪"],
      status: "seen",
      confidence: 2,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(6),
    }),
    makeQuestion({
      id: "rag-hybrid-retrieval",
      category: "insurance-rag",
      question: "为什么做混合检索，而不是只用向量检索？",
      standardAnswer:
        "保险条款里有很多术语、时间条件、金额限制和固定表达，只靠向量检索有时会语义相近但关键条件不准。混合检索把关键词和向量召回结合起来，可以兼顾语义相关性和精确匹配。比如用户问等待期、特定责任除外、报销比例时，关键词召回对精确术语有帮助；而用户换了一种更口语化的说法时，向量召回又能兜底。我的理解是，在这种垂直规则文本里，混合检索通常更稳，而不是更花哨。",
      shortAnswer:
        "因为保险文本既有语义问题，也有精确术语问题。混合检索能让语义召回和关键词精确匹配互相补位，稳定性会更好。",
      bulletPoints: ["术语、金额、时间条件很多", "纯向量召回可能语义对但条件错", "关键词补精确匹配", "向量补口语表达"],
      mustRememberMetrics: ["Recall@K 提升", "误召回减少", "人工评估更稳"],
      commonFollowUps: ["你怎么做召回融合？", "什么时候你觉得向量检索会失效？"],
      pitfalls: ["泛泛谈 hybrid 是业界常见方案", "没结合保险文本特点"],
      status: "can-say",
      confidence: 3,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(4),
    }),
    makeQuestion({
      id: "rag-hard-part",
      category: "insurance-rag",
      question: "这个项目最难的点是什么？",
      standardAnswer:
        "我觉得最难的不是把链路搭起来，而是让结果稳定。尤其是当问题比较模糊、原文表述比较绕，或者多个条款之间有细微差异时，模型很容易生成一个看起来通顺、但字段并不完全可靠的答案。这个问题很麻烦，因为它不像报错那样明显。我的处理思路是把问题拆到字段级，看是召回没拿对、还是模型抽取不稳、还是 schema 约束不够。也正因为这个难点，我后来才更强调字段级引用和评估。",
      shortAnswer:
        "最难的是稳定性，而不是功能跑通。尤其在边界问题上，回答可能看起来像对的，但字段其实不稳。",
      bulletPoints: ["难点在稳定性", "边界问题容易假正确", "拆到字段级排查", "因此更重视引用和评估"],
      mustRememberMetrics: ["不是报错，而是假正确", "字段级拆问题"],
      commonFollowUps: ["你是怎么区分召回问题和生成问题的？", "有没有一类特别难的问题？"],
      pitfalls: ["只说数据脏", "讲得太抽象"],
      status: "solid",
      confidence: 4,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(1),
    }),
    makeQuestion({
      id: "rag-metrics",
      category: "insurance-rag",
      question: "你看哪些指标来评估这个项目？",
      standardAnswer:
        "我会把指标拆成三类。第一类是检索层，比如召回相关性、TopK 命中情况，确认证据有没有被拿到。第二类是答案层，比如字段完整率、字段正确率、引用覆盖率，确认结构化输出本身稳不稳。第三类是体验层，比如响应时间，尤其是用户第一次看到可用答案的等待时间。因为这个项目不是单纯的生成任务，所以我不会只看一句话是否流畅，而是更关注字段有没有答全、证据能不能对上。",
      shortAnswer:
        "我主要看检索、答案、体验三层指标。比较关键的是字段完整率、字段正确率和引用覆盖率，而不是只看回答像不像人话。",
      bulletPoints: [
        "检索层：TopK 命中、召回相关性",
        "答案层：字段完整率、字段正确率、引用覆盖率",
        "体验层：响应时间",
      ],
      mustRememberMetrics: ["字段完整率 90%+", "字段级引用覆盖率", "P95 响应时间"],
      commonFollowUps: ["这些指标怎么采集？", "你有没有做过人工评估表？"],
      pitfalls: ["只说准确率", "指标不分层"],
      status: "seen",
      confidence: 2,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(7),
    }),
    makeQuestion({
      id: "rag-limitations",
      category: "insurance-rag",
      question: "这个项目目前最大的不足是什么？",
      standardAnswer:
        "现在最大的不足是评估和数据闭环还不够自动化。很多边界样例还是靠手工整理和复盘，这会导致迭代速度受限。另外，结构化输出虽然提升了可控性，但也会让 schema 设计成本变高，一旦业务字段变动，就需要重新调整。再往后如果真做成更接近生产的版本，我会优先补两件事：一是更系统的评估集和回归测试，二是更细的可观测性，把问题更快定位到检索还是生成。",
      shortAnswer:
        "不足主要在评估闭环还不够自动化，很多边界样例还是靠人工复盘。另外 schema 的维护成本也不低。",
      bulletPoints: ["评估闭环偏手工", "边界样例积累不足", "schema 维护成本高", "下一步补评估与可观测性"],
      mustRememberMetrics: ["回归集", "自动评估", "可观测性"],
      commonFollowUps: ["如果有更多时间你先补哪块？", "你会怎么设计回归测试？"],
      pitfalls: ["说没有不足", "把不足说成无关紧要的小问题"],
      status: "can-say",
      confidence: 3,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(3),
    }),
    makeQuestion({
      id: "rag-debug",
      category: "insurance-rag",
      question: "最难排查的一次问题是什么？",
      standardAnswer:
        "有一次看起来像是模型抽取错了，因为答案里的某个字段总是偶尔缺失，但后来排查发现根因其实是召回结果排序不稳定。问题麻烦在于它不是每次都复现，表面现象又像生成阶段不稳。后来我是把线上问题样例单独拉出来，对比每次召回到的 chunk、重排顺序和最终引用字段，才发现有一类相近条款会互相干扰。这个经历让我更确信，RAG 的排查不能只盯着模型输出，必须把召回、重排、生成拆开看。",
      shortAnswer:
        "最难的一次是一个偶发字段缺失问题，表面像生成不稳，最后发现是召回排序在边界条款上不稳定。这个问题让我更重视链路拆分排查。",
      bulletPoints: ["现象：字段偶发缺失", "误判：以为是生成问题", "根因：召回排序不稳定", "方法：拆链路逐段对比"],
      mustRememberMetrics: ["偶发问题", "拆链路", "排序不稳定"],
      commonFollowUps: ["你具体记录了哪些排查信息？", "后来怎么缓解这个问题？"],
      pitfalls: ["只说现象，不说定位过程", "没有复盘结论"],
      status: "can-say",
      confidence: 3,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(5),
    }),
  ]
}
