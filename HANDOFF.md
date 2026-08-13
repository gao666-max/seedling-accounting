# HANDOFF.md — 育苗场记账助手

> AI 接管指引：接手后先读本文件，再读 `ARCHITECTURE.md`，最后读 `README.md` 和 `AI_DESIGN.md`。

## 一句话

大二学生为家里育苗场做的 AI 记账工具。粘贴微信聊天记录 → DeepSeek 解析 → 飞书模板一键录入。效率 2-3分钟/条 → 10秒/条。

## 结构

| 文件 | 职责 |
|------|------|
| `index.html` | 前端（记账模式 + 订单模式） |
| `worker.js` | Cloudflare Worker，转发 DeepSeek 请求，持有 API Key |
| `AI_DESIGN.md` | 完整 Prompt 工程和架构决策文档 |

## 部署

见 `DEPLOY.md`。核心：`wrangler secret put DEEPSEEK_API_KEY` 注入 key，`wrangler deploy` 部署。

## 关键约定

- DeepSeek API Key 绝不能写进代码，走 wrangler secret
- 两种模式（记账/订单）字段不同，不要合并成一个 Prompt
- 历史记录用 localStorage，无后端数据库

## 用户信息

- 用户叫佳慧（高佳慧），软件工程大三，天津
- 这是她最早独立做的完整项目，用了 TRAE SOLO + DeepSeek
- 沟通：直接、口语化、单行命令
