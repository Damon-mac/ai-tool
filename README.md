# AI Lab

AI Lab 是一个面向中文场景的 AI 工具应用，第一版包含两个核心模块：

- 文案推荐：输入主题、平台、内容类型，一次生成 10 条不同风格的爆款开头
- 股票诊断：输入股票代码或名称，抓取公开行情快照并生成 AI 辅助分析、价格预测与仓位建议

## 技术栈

- 前端：Vue 3 + TypeScript + Vite + Pinia + Vue Router
- 后端：NestJS + TypeScript + Prisma + PostgreSQL
- 共享包：`packages/shared`
- 部署：Docker + Docker Compose

## 项目结构

```bash
ai-lab/
├── apps/
│   ├── api/        # NestJS API
│   └── web/        # Vue 3 Web
├── packages/
│   └── shared/     # 共享类型
├── infra/          # Nginx 配置
├── docker-compose.yml
└── .env.template
```

## 功能概览

### 文案推荐

- 主题输入
- 平台选择：小红书 / 抖音 / 朋友圈
- 内容类型：视频 / 图文 / 产品广告
- 返回 10 条不同风格结果
- 支持复制、收藏、历史查询

### 股票诊断

- 支持股票代码或名称搜索
- 第一版优先兼容 A 股代码查询
- 基于公开行情快照做 AI 诊断
- 输出未来一周 / 一月 / 一年区间预测
- 支持跟踪列表保留、手动删除、2-3 只股票对比

## 环境变量

复制 `.env.template` 为 `.env.local`，或复制 `.env.production.template` 为 `.env.production` 后填写：

```bash
DB_HOST=47.98.196.52
DB_PORT=5432
DB_USERNAME=root
DB_PASSWORD=replace-with-db-password
DB_NAME=ai_tool
DATABASE_URL=postgresql://root:replace-with-db-password@47.98.196.52:5432/ai_tool?schema=public
JWT_SECRET=replace-with-a-long-random-secret
MODEL_BASE_URL=https://api.xiaomimimo.com/anthropic
MODEL_API_KEY=replace-with-model-api-key
MODEL_NAME=mimo-v2-pro
MODEL_PROVIDER=anthropic
MODEL_MAX_TOKENS=2200
MODEL_TIMEOUT_MS=20000
VITE_API_BASE_URL=http://localhost:3000/api
API_ENV_FILE=./.env.local
```

说明：

- `MODEL_BASE_URL`、`MODEL_API_KEY`、`MODEL_NAME` 用于接大模型接口
- 本地开发默认连接测试环境数据库；线上部署可改用 `.env.production`
- 若未配置模型，系统会使用内置 fallback 结果，方便先启动 UI 和 API 流程
- `.env.local` 不会提交到 Git

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 生成 Prisma Client

```bash
npm run prisma:generate
```

### 3. 启动数据库

```bash
docker compose up -d db
```

### 4. 执行迁移

```bash
npm run prisma:migrate
```

### 5. 启动前后端

```bash
npm run dev
```

默认地址：

- Web: `http://localhost:5173`
- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## Docker 一键启动

```bash
docker compose up --build
```

默认服务：

- Web: `http://localhost`
- API: `http://localhost:3000/api`
- PostgreSQL: `localhost:5432`

## 数据与风控说明

- 股票模块当前是 MVP 版本，优先使用公开行情数据与 AI 推断
- 股票分析结果仅作辅助参考，不构成投资建议
- 如需更稳定的数据质量，后续建议接入正规金融数据 API

## 下一步建议

- 接入更稳定的金融数据源
- 增加 refresh token 与更完整会话管理
- 增加股票详情图表、诊断版本记录、消息提醒
- 为文案推荐增加多语言、多长度与品牌语气模板
