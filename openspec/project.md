# Project Context

## Purpose

本项目是一个 AI 聊天机器人应用。其主要目标是为用户提供一个与 AI 模型交互的对话界面，利用现代 Web 技术提供无缝且响应迅速的用户体验。

## Tech Stack

- **框架:** Next.js (App Router)
- **语言:** TypeScript
- **UI:** React, Tailwind CSS, Radix UI, shadcn/ui
- **AI:** Vercel AI SDK, OpenAI
- **数据库:** PostgreSQL with Drizzle ORM
- **测试:** Playwright (端到端测试)
- **部署:** Vercel

## Project Conventions

### Code Style

项目使用 Biome (`@biomejs/biome`) 和 `ultracite` 配置来强制执行一致的代码风格。具体的规则在 `biome.jsonc` 文件中进行了定制以适应项目需求，例如允许在调试时使用 `console`。可以通过运行 `pnpm format` 来格式化代码。

### Architecture Patterns

该应用程序使用 Next.js App Router 构建，清晰地分离了服务器组件和客户端组件。它适当地利用了服务器端渲染 (SSR) 和静态站点生成 (SSG)。数据获取和变更通过 Server Actions 和 API Routes 处理。数据库结构由 Drizzle ORM 管理，迁移由 `drizzle-kit` 处理。

### Testing Strategy

项目使用 Playwright 进行端到端 (E2E) 测试。测试用例定义在 `tests/` 目录下，可以通过运行 `pnpm test` 脚本来执行。这确保了从用户的角度来看，关键的用户流程和组件交互能按预期工作。

### Git Workflow

[请在此描述您的分支策略和提交规范，例如：GitFlow、功能分支、约定式提交等。]

## Domain Context

本项目的核心领域是对话式 AI。关键概念包括：

- **消息 (Messages):** 用户的提示和 AI 的回复。
- **对话 (Conversations):** 构成对话的一系列消息。
- **工件 (Artifacts):** 由 AI 生成的更丰富的内容，例如代码块、图像或数据表。
- **流式传输 (Streaming):** AI 的响应以 token-by-token 的方式流式传输，以提供实时体验。

## Important Constraints

[请在此列出任何技术、业务或法规方面的限制。例如：“必须部署在 Vercel 基础设施上。”]

## External Dependencies

项目默认依赖于几个外部服务，主要来自 Vercel：

- **Vercel AI Gateway:** 用于管理和路由到 AI 模型的请求。
- **Vercel Blob:** 用于存储和提供文件上传及其他二进制数据。
- **Vercel Postgres:** 作为主数据库，用于存储用户信息和聊天记录等应用数据。
- **Vercel Redis:** 用于缓存和会话管理。

实际部署时可以使用各种 llm api 和各种同类对应数据库。
