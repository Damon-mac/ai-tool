# AI Lab 项目

## 项目概述

AI Lab 是一个面向中文场景的 AI 工具应用，包含两个核心模块：

- **文案推荐**：输入主题、平台（小红书/抖音/朋友圈）、内容类型（视频/图文/产品广告），一次生成 10 条不同风格的爆款开头，支持复制、收藏、历史查询
- **股票诊断**：输入股票代码或名称搜索 A 股，抓取公开行情快照并生成 AI 辅助分析、价格预测与仓位建议，支持跟踪列表、手动删除、2-3 只股票对比
- **模型配置**：运行时动态切换 AI 模型（provider/baseUrl/apiKey/model），支持连接测试

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Vite + Pinia + Vue Router + Element Plus |
| 后端 | NestJS + TypeScript + Prisma + PostgreSQL |
| 共享包 | `packages/shared` — 共享类型与常量 |
| 部署 | Docker + Docker Compose |
| AI 接入 | 支持 Anthropic 和 OpenAI 兼容协议，通过 `provider` 字段区分 |
| 股票数据 | `yahoo-finance2` 获取公开行情 |

## 项目结构（monorepo，npm workspaces）

```
ai-lab/
├── apps/
│   ├── api/              # NestJS API（@ai-lab/api）
│   │   ├── src/
│   │   │   ├── ai/              # AI 服务（统一请求/解析/降级逻辑）
│   │   │   ├── auth/            # 认证模块（注册/登录/JWT）
│   │   │   ├── copywriting/     # 文案推荐模块
│   │   │   ├── stocks/          # 股票诊断模块
│   │   │   ├── model-config/    # 模型配置模块（运行时切换）
│   │   │   ├── prisma/          # Prisma 服务
│   │   │   ├── common/          # 装饰器、Guard
│   │   │   ├── types/           # 第三方类型声明
│   │   │   ├── app.module.ts    # 根模块
│   │   │   └── main.ts          # 入口（端口 3000，前缀 /api）
│   │   ├── prisma/schema.prisma # 数据库 schema
│   │   └── Dockerfile
│   └── web/              # Vue 3 Web（@ai-lab/web）
│       ├── src/
│       │   ├── views/           # 页面：Auth/Home/Copywriting/Stocks/ModelConfig
│       │   ├── components/      # 公共组件（AppTopbar）
│       │   ├── stores/          # Pinia store（auth）
│       │   ├── lib/             # API 封装
│       │   ├── router.ts        # 路由（含前置鉴权守卫）
│       │   └── styles.css       # 全局样式
│       └── Dockerfile
├── packages/
│   └── shared/           # @ai-lab/shared — 共享类型定义
├── infra/nginx.conf      # Nginx 配置
├── docker-compose.yml    # Docker Compose（api:3005, web:8080）
├── DEPLOY.md             # 部署文档
└── .env.template         # 环境变量模板
```

## 数据库模型（Prisma）

- **User** — 用户（email + passwordHash），关联文案历史/收藏、跟踪股票、对比历史
- **CopywritingHistory** — 文案生成历史（topic/platform/contentType/results JSON）
- **CopywritingFavorite** — 文案收藏（关联 history，唯一约束 userId+historyId+itemIndex）
- **TrackedStock** — 跟踪股票（code/name/market/secId），唯一约束 userId+code
- **StockSnapshot** — 股票行情快照（价格/成交量/市值/PE/PB/主力资金流等）
- **StockAnalysis** — AI 分析结果（summary/trend/valuation/预测区间/建议/风险等级）
- **StockCompareHistory** — 股票对比历史

## API 路由

所有路由以 `/api` 为前缀，Swagger 文档在 `/api/docs`。

| 模块 | 路由前缀 | 说明 |
|------|----------|------|
| Auth | `/api/auth` | 注册、登录、获取当前用户 |
| Copywriting | `/api/copywriting` | 生成文案、历史、收藏 |
| Stocks | `/api/stocks` | 搜索股票、分析、跟踪、对比、快照 |
| Model Config | `/api/model-config` | 获取/更新模型配置、测试连接 |

## 环境变量

关键变量（见 `.env.template`）：

- `DATABASE_URL` — PostgreSQL 连接串
- `JWT_SECRET` — JWT 签名密钥
- `MODEL_BASE_URL` — AI 模型 API 地址（默认 `https://api.xiaomimimo.com/anthropic`）
- `MODEL_API_KEY` — AI 模型 API Key
- `MODEL_NAME` — 模型名（默认 `mimo-v2-pro`）
- `MODEL_PROVIDER` — 提供商（`anthropic` 或 `openai` 兼容，默认 `anthropic`）
- `MODEL_MAX_TOKENS` / `MODEL_TIMEOUT_MS` — 请求参数
- `VITE_API_BASE_URL` — 前端 API 地址

## 常用命令

```bash
# 本地开发
npm install                        # 安装依赖
npm run prisma:generate            # 生成 Prisma Client
cp .env.template .env.local        # 准备环境变量
npm run prisma:migrate             # 执行数据库迁移
npm run dev                        # 同时启动前后端

# 单独启动
npm run dev:web                    # 前端 http://localhost:5173
npm run dev:api                    # 后端 http://localhost:3000/api

# Docker
docker compose up --build          # 构建并启动（web:8080, api:3005）
API_ENV_FILE=./.env.production docker compose up --build -d  # 生产部署

# 构建
npm run build                      # 按 shared → api → web 顺序构建
```

## Git 提交与推送规则

- 全程默认使用中文沟通与总结。
- 提交信息使用 Conventional Commits 风格，例如 `feat:`、`fix:`、`refactor:`、`docs:`、`chore:`。
- 提交信息应简洁、准确，基于实际 diff，而不是只看文件名。
- 在执行任何 `git add`、`git commit`、`git push` 之前，先用中文总结本次改动。
- 在执行 `git add` 与 `git commit` 时，直接采用推荐的提交信息执行，无需单独确认。
- `git push` 前必须再次单独确认，不能把前面的提交确认视为推送确认。
- 如果当前分支是 `main` 或 `master`，推送前必须额外提醒风险并再次确认。
- 严禁执行 `git push --force`。
- 严禁提交或推送敏感文件，包括但不限于：`.env`、`.env.*`、`*.pem`、`*.key`、`*.p12`、`*.crt`、本地数据库文件、令牌、私钥、证书。
- 如果改动包含多个互不相关的主题，应先建议拆分成多个提交。
- 优先只推送当前分支。
- 如果当前分支尚未配置 upstream，先解释将要执行的推送命令，再等待确认。
- 在 monorepo 中总结改动时，优先按 workspace 或 package 归类说明，特别是 `api`、`web`、`shared`。
