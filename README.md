# Interview Tracker

面试题库 + AI 项目源码问答工具，基于 Next.js 构建。

## 本地启动

1. 克隆仓库

```bash
git clone https://github.com/qd-maker/interview-tracker.git
cd interview-tracker
```

2. 准备环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://yunwu.ai/v1
OPENAI_MODEL=gpt-5-mini

# 如果 insurance-rag / Quorum 与本仓库同级目录，可直接沿用默认值
INTERVIEW_SOURCE_INSURANCE_RAG_ROOT=../insurance-rag
INTERVIEW_SOURCE_QUORUM_ROOT=../Quorum
```

说明：
- `OPENAI_API_KEY` 必填，否则“项目源码问答”不可用。
- `OPENAI_BASE_URL` 默认为当前使用的 OpenAI 兼容中转站。
- 如果你的 `insurance-rag` / `Quorum` 不在同级目录，改成你本机实际路径。

3. 安装依赖并启动

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 关联仓库建议目录结构

为了让源码问答开箱即用，建议把 3 个仓库放在同一个父目录下：

```text
workspace/
├── interview-tracker/
├── insurance-rag/
└── Quorum/
```

这样 `.env.example` 里的默认路径就能直接工作。
