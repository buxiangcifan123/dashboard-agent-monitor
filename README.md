# Agent Monitor Dashboard

> 基于 Electron + React + TypeScript 的 AI 体系监控看板

一眼看清整套 AI 基础设施的健康度：本地展示 n8n / bridge / watchdog / Ollama / 本地向量库的状态，并通过 SSH 隧道监控远端 ECS 平台上运行的服务。

## 功能概览

- **本地基础设施监控**
  - n8n（自动化引擎）
  - Bridge（HTTP 桥接器）
  - AutoGuard Watchdog（保活守护）
  - Ollama（本地大模型服务）
  - 本地向量库（FAISS + SQLite，读取各集合条数）
- **ECS 平台监控（经 SSH 隧道）**
  - ECS 健康检查
  - ECS 三容器状态
  - ECS 宿主资源
  - ECS 定时任务
  - ECS 向量库条数
- **隧道指示器** — 展示 SSH 隧道连接状态，支持一键重连。
- **轮询刷新** — 默认每 60 秒采集一次，可手动刷新。

## 技术栈

Electron + React 18 + TypeScript + Zustand + Tailwind CSS + Vite，本地向量库读取使用 `better-sqlite3`，SSH 隧道基于系统 `ssh` 命令（`child_process`）。

## 安装与开发

```bash
npm install
npm run dev      # 启动 Vite 开发服务器 + Electron
npm run build    # 构建产物（dist/ + dist-electron/）
```

> `npm run dev` / `build` 脚本中已通过 `cross-env NODE_OPTIONS=` 清空环境变量，避免与外部环境冲突。

Windows 下可用 `dashboard-start.vbs` 以隐藏窗口方式启动已构建的生产版本（需先 `npm run build`）。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `AGENT_MONITOR_SSH_HOST` | ECS 主机地址（SSH 隧道目标） | `127.0.0.1` |
| `AGENT_MONITOR_SSH_PORT` | ECS SSH 端口 | `22` |
| `AGENT_MONITOR_SSH_USER` | ECS SSH 用户 | `root` |
| `AGENT_MONITOR_ADMIN_TOKEN` | admin-daemon Bearer Token（文档化占位符） | `admin-key-change-me` |
| `FAISS_INDEX_DB` | 本地向量库 SQLite 文件路径 | `~/.ai-faiss-index/vector_store.db` |

> SSH 私钥默认从 `~/.ssh/id_ed25519` 读取。

## 许可

本项目基于 MIT 许可证开源，详见 [LICENSE](LICENSE)。

Copyright (c) 2026 buxiangcifan123
