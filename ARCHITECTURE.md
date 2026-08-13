# 架构图 · 育苗场记账助手

## 整体架构

```mermaid
flowchart LR
    subgraph CLIENT[index.html 浏览器]
        U[粘贴微信聊天记录]
        R[解析结果显示]
    end
    subgraph EDGE[Cloudflare Workers]
        W[worker.js<br/>转发请求到 DeepSeek]
    end
    subgraph AI[DeepSeek API]
        D[deepseek-chat<br/>自然语言解析]
    end
    U --> W
    W --> D
    D --> W
    W --> R
```

## 数据流

```mermaid
sequenceDiagram
    participant B as 浏览器
    participant W as Cloudflare Worker
    participant D as DeepSeek API
    B->>W: 粘贴的聊天记录文本
    W->>D: Prompt 工程封装后的请求
    D->>W: 结构化 JSON（日期/客户/金额/品种/未结标记）
    W->>B: 解析结果
    B->>B: 生成飞书模板 + 一键复制
```

## 关键架构决策

| 决策 | 原因 |
|------|------|
| API Key 放 Worker 而非前端 | 前端直连会暴露 Key；Cloudflare Worker 服务端持有，浏览器只调 Worker |
| 本地 localStorage 记忆 | 误关页面可恢复，无后端数据库 |
| 两种模式分离 | 记账（收支）和订单（品种/数量/出苗时间）字段不同，分开 Prompt 更准 |
| 日期批量设置 | 家人经常忘写日期，一键补全 |
