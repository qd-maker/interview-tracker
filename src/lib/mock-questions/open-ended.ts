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

export function createOpenEndedQuestions(isoDaysAgo: IsoDaysAgo): InterviewQuestion[] {
  return [
    makeQuestion({
      id: "open-growth-direction",
      category: "open-ended",
      question: "未来你想往哪个方向发展？",
      standardAnswer:
        "我比较明确还是想往 AI 应用开发和偏后端的方向走。短期内，我希望把 LLM 应用的工程落地能力补得更扎实，比如检索、可观测性、服务性能、稳定性这些基础能力。中期如果有机会，我也想进一步理解产品和业务场景，因为我越来越觉得 AI 应用的价值不只是模型接得多，而是能不能真的解决一个场景里的问题。所以我希望自己最终是一个既懂一点模型边界，又能把产品做稳的人。",
      shortAnswer:
        "我想继续往 AI 应用开发、偏后端这个方向走，先把工程能力做扎实，再逐步补产品和业务理解。",
      bulletPoints: ["AI 应用开发 + 偏后端", "短期补工程基本功", "中期补产品和业务理解", "目标是做能把应用做稳的人"],
      mustRememberMetrics: ["短期 / 中期分层回答"],
      commonFollowUps: ["你会考虑转纯后端吗？", "你最想补的一个能力是什么？"],
      pitfalls: ["目标太虚", "说什么都想做"],
      status: "solid",
      confidence: 4,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(2),
    }),
    makeQuestion({
      id: "open-ai-opinion",
      category: "open-ended",
      question: "你怎么看 AI 行业 / AI 发展的趋势？",
      standardAnswer:
        "我的看法会更偏应用层一点。我觉得模型能力还会继续进步，但对大多数公司来说，真正拉开差距的会越来越是场景理解、数据闭环、工程质量和产品体验。因为模型能力会逐渐变得更可获得，但怎么把它做成稳定、可信、可持续使用的产品，门槛并不会自动消失。所以我会比较关注那些能把模型能力和具体工作流结合起来的团队，而不是只看模型参数谁更大。",
      shortAnswer:
        "我觉得未来竞争点会越来越落在应用落地上，模型能力当然重要，但真正拉开差距的是场景理解、工程质量和数据闭环。",
      bulletPoints: ["模型还会继续进步", "差异化会更多落在应用层", "场景、数据闭环、工程质量更重要"],
      mustRememberMetrics: ["别空谈 AGI", "落回应用层判断"],
      commonFollowUps: ["你最看好的 AI 应用方向是什么？", "你觉得泡沫大吗？"],
      pitfalls: ["太宏观", "像背行业报告"],
      status: "can-say",
      confidence: 3,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(4),
    }),
    makeQuestion({
      id: "open-why-company",
      category: "open-ended",
      question: "为什么想来我们公司？",
      standardAnswer:
        "我会比较看重两点。第一，这家公司做的方向和我现在想深挖的 AI 应用落地比较一致，我希望在更真实的业务环境里理解需求、指标和迭代节奏，而不是一直停留在个人项目阶段。第二，我很看重团队是否真的在做产品，而不是只做技术展示。对我来说，实习最有价值的就是把自己现在做的这些项目经验，放到更成熟的协作和业务环境里去验证。如果贵司刚好在做这类工作，我会很想参与进去。",
      shortAnswer:
        "因为公司的方向和我想做的 AI 应用落地比较一致，而且我也希望把自己现在的项目经验放到更真实的业务和团队协作里去验证。",
      bulletPoints: ["方向匹配", "想进真实业务环境", "看重做产品而不是纯展示"],
      mustRememberMetrics: ["回答前先替换成具体公司信息"],
      commonFollowUps: ["你了解我们哪些产品？", "如果岗位内容和预期不完全一样呢？"],
      pitfalls: ["模板化", "只说贵司平台大"],
      status: "seen",
      confidence: 2,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(7),
    }),
    makeQuestion({
      id: "open-strengths",
      category: "open-ended",
      question: "你的优点是什么？",
      standardAnswer:
        "如果只说一个，我觉得是我会主动把问题往下追一层。比如项目里很多问题，表面上看功能已经能用了，但我会继续追问它稳不稳、能不能评估、有没有更好的体验。这种习惯让我更容易把项目从作业感往产品感推进。另外一个优点是我补位速度还可以，遇到不熟的技术点时，我不会卡在‘还没完全学会’，而是会先搭最小闭环再逐步补细节。",
      shortAnswer:
        "我的优点一个是会主动把问题追到底，不满足于能跑；另一个是补位速度快，遇到新东西会先搭闭环再补细节。",
      bulletPoints: ["会追问题到稳定性和体验层", "不满足于能跑", "补位速度快"],
      mustRememberMetrics: ["优点要有例子支撑"],
      commonFollowUps: ["这个优点有给你带来过什么结果？", "有时候会不会追太深？"],
      pitfalls: ["说执行力强这种空话", "没有项目例子"],
      status: "solid",
      confidence: 4,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(1),
    }),
    makeQuestion({
      id: "open-weaknesses",
      category: "open-ended",
      question: "你的缺点是什么？",
      standardAnswer:
        "我现在一个比较真实的短板是，大项目协作经验还不够多。因为目前主要还是个人项目或者小范围协作，所以在多人协作规范、任务拆分和长期维护上，经验还在补。好的一面是，我已经意识到这个短板，所以做项目时会有意识地把结构、记录和复盘做得更清楚，减少以后协作切换的成本。我会把它看成现阶段需要通过实习尽快补齐的一块。",
      shortAnswer:
        "我的短板是大规模协作经验还不够多，但我已经在通过更规范地组织项目和记录复盘来提前补这件事，也希望在实习里尽快把它补上。",
      bulletPoints: ["短板真实且和阶段相关", "多人协作经验不足", "已在主动补位", "希望通过实习强化"],
      mustRememberMetrics: ["别说致命缺点", "别装没有缺点"],
      commonFollowUps: ["你具体怎么补这个短板？", "还有别的短板吗？"],
      pitfalls: ["把优点包装成缺点", "缺点太致命"],
      status: "can-say",
      confidence: 3,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(5),
    }),
    makeQuestion({
      id: "open-expected-work",
      category: "open-ended",
      question: "你期望的实习内容是什么？",
      standardAnswer:
        "我比较希望做的是能直接参与真实 AI 应用开发的工作，最好既能接触模型能力接入，也能接触后端链路、数据结构和性能优化这些工程问题。我不排斥做比较基础的工作，反而觉得从这些地方更容易建立对业务和系统的理解。对我来说，最重要的是能真正参与迭代，而不是只做边缘的小 demo。",
      shortAnswer:
        "我希望做真实 AI 应用开发相关的事情，既能接触模型接入，也能接触后端工程和性能优化。基础工作我不排斥，关键是能参与真实迭代。",
      bulletPoints: ["真实 AI 应用开发", "模型接入 + 后端工程", "不排斥基础工作", "希望参与真实迭代"],
      mustRememberMetrics: ["表达开放，但有方向"],
      commonFollowUps: ["如果先从基础平台工作做起可以吗？", "你更偏哪一类任务？"],
      pitfalls: ["要求太理想化", "显得挑活"],
      status: "solid",
      confidence: 4,
      highPriority: false,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(3),
    }),
    makeQuestion({
      id: "open-salary",
      category: "open-ended",
      question: "你的期望薪资是多少？",
      standardAnswer:
        "我会优先参考贵司对实习生的统一标准。如果岗位有明确薪资区间，我可以在那个范围内配合沟通。对我来说，这份实习更重要的是能不能接触到高质量的项目和成长环境，所以我会保持比较务实和开放的态度。",
      shortAnswer:
        "我会优先参考公司的实习生标准，如果有明确区间我可以在范围内配合沟通。现阶段我更看重项目质量和成长空间。",
      bulletPoints: ["先参考公司标准", "表达开放", "不过分纠结"],
      mustRememberMetrics: ["不要先报死一个很刚性的数"],
      commonFollowUps: ["如果让你现在报一个范围呢？", "你为什么更看重成长？"],
      pitfalls: ["完全不回答", "报得太高或太死"],
      status: "seen",
      confidence: 2,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(6),
    }),
    makeQuestion({
      id: "open-availability",
      category: "open-ended",
      question: "你能实习多久，什么时候到岗？",
      standardAnswer:
        "这类问题我会尽量给出明确且稳定的安排。比如目前我的计划是可以尽快到岗，并且希望至少连续实习一个相对完整的周期，这样我能真正参与到一个迭代闭环里。具体时间我会结合课程安排和公司要求来协调，但原则上我会优先保证实习的连续性和投入度。",
      shortAnswer:
        "我会尽量尽快到岗，并优先保证连续实习时间。具体可以按课程安排和岗位要求再细化，但我希望至少能参与一个完整迭代周期。",
      bulletPoints: ["给出明确态度", "强调连续性", "具体时间可协调"],
      mustRememberMetrics: ["提前准备自己真实可到岗时间"],
      commonFollowUps: ["每周能来几天？", "如果转正机会好，你会怎么安排学业？"],
      pitfalls: ["模糊不清", "承诺过头"],
      status: "can-say",
      confidence: 3,
      highPriority: true,
      inTodayPractice: false,
      lastReviewedAt: isoDaysAgo(4),
    }),
    makeQuestion({
      id: "open-ask-interviewer",
      category: "open-ended",
      question: "你还有什么想问我们的吗？",
      standardAnswer:
        "我一般会准备两类问题。第一类是岗位和团队真实工作流，比如实习生进来后更常参与哪类 AI 应用开发工作、和正式同学的协作方式是什么。第二类是评价标准，比如团队会更看重结果交付、工程质量，还是对业务理解的速度。这样问的目的不是显得自己准备充分，而是想判断自己进来之后应该如何更快进入状态。",
      shortAnswer:
        "我会重点问两类：团队实际在做什么、实习生通常怎么参与；以及团队更看重哪些产出和成长指标。这样我能更快对齐预期。",
      bulletPoints: ["问真实工作流", "问实习生参与方式", "问评价标准"],
      mustRememberMetrics: ["至少准备 2 个具体问题"],
      commonFollowUps: ["你为什么想问这个？", "如果面试官时间很少你最想问哪个？"],
      pitfalls: ["问官网就能查到的事", "问得太泛"],
      status: "solid",
      confidence: 4,
      highPriority: true,
      inTodayPractice: true,
      lastReviewedAt: isoDaysAgo(2),
    }),
  ]
}
