# 部署说明

## 部署目标

- 应用服务器：`<app-server-ip>`
- 部署方式：Docker Compose
- 运行服务：`api`、`web`
- 数据库：通过环境变量连接远程 PostgreSQL

## 1. 登录服务器

```bash
ssh root@<app-server-ip>
```

## 2. 安装基础依赖

确认服务器已安装：

```bash
git --version
docker --version
docker compose version
```

如果缺少，请先安装 Git、Docker、Docker Compose。

## 3. 拉取代码

```bash
mkdir -p /opt
cd /opt
git clone <your-repo-url> ai-tool
cd ai-tool
```

如果已经拉过代码：

```bash
cd /opt/ai-tool
git pull
```

## 4. 准备生产环境变量

从模板复制：

```bash
cp .env.production.template .env.production
```

编辑 `.env.production`，填入真实值：

```bash
DB_HOST=<production-db-host>
DB_PORT=5432
DB_USERNAME=<production-db-username>
DB_PASSWORD=<production-db-password>
DB_NAME=ai_tool
DATABASE_URL=postgresql://<production-db-username>:<production-db-password>@<production-db-host>:5432/ai_tool?schema=public
JWT_SECRET=<long-random-secret>
MODEL_BASE_URL=https://api.xiaomimimo.com/anthropic
MODEL_API_KEY=<production-model-api-key>
MODEL_NAME=mimo-v2-pro
MODEL_PROVIDER=anthropic
MODEL_MAX_TOKENS=2200
MODEL_TIMEOUT_MS=20000
VITE_API_BASE_URL=/api
API_ENV_FILE=./.env.production
```

## 5. 启动服务

```bash
API_ENV_FILE=./.env.production docker compose up --build -d
```

## 6. 检查状态

```bash
docker compose ps
docker compose logs -f api
docker compose logs -f web
```

## 7. 对外访问

部署成功后访问：

```text
http://<app-server-ip>
```

前端通过 `/api` 访问后端，不需要单独暴露前端内的 API 地址。

## 8. 后续更新

```bash
cd /opt/ai-tool
git pull
API_ENV_FILE=./.env.production docker compose up --build -d
```

## 9. 常见排查

### 数据库连接失败

检查：

- 数据库主机、端口、账号密码是否正确
- 应用服务器是否能访问数据库服务器
- `ai_tool` 数据库是否存在

### 80 端口被占用

检查：

```bash
ss -lntp | grep :80
```

### 查看后端实时日志

```bash
docker compose logs -f api
```
