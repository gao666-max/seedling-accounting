# 部署脚本 · 育苗场记账助手

项目是 Cloudflare Workers + 纯前端，需要 wrangler CLI 部署。

## 前置

```bash
npm install -g wrangler
```

## 部署到 Cloudflare Workers

```bash
# 登录（浏览器授权）
wrangler login

# 设置 DeepSeek API Key 为 Worker 环境变量
wrangler secret put DEEPSEEK_API_KEY

# 部署
wrangler deploy
```

## 本地预览（可选）

Worker 逻辑简单，直接打开 index.html 即可（需手动在 worker.js 里填 key 或本地改前端直连）。

## 说明

- `worker.js` 里的 `DEEPSEEK_API_KEY` 通过 `wrangler secret` 注入，不写在代码里
- `index.html` 纯静态，可托管在 Cloudflare Pages 或任意静态托管
- 前端调 Worker 的 URL 需要在 `index.html` 里改成你的 Workers 域名
