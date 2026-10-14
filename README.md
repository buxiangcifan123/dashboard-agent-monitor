# Agent Monitor Dashboard

> A one-glance health dashboard for your AI infrastructure — built with Electron + React + TypeScript. Shows local services (n8n / bridge / watchdog / Ollama / vector store) and, over an SSH tunnel, a remote ECS platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-18%2B-339933.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-30%2B-47848F.svg)](https://www.electronjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/buxiangcifan123/dashboard-agent-monitor/pulls)
[![GitHub stars](https://img.shields.io/github/stars/buxiangcifan123/dashboard-agent-monitor?style=social)](https://github.com/buxiangcifan123/dashboard-agent-monitor)

## Screenshots

> Drop a screenshot of the running dashboard here — for a visual project this is the single highest-impact thing you can add.
<!--
![dashboard](docs/dashboard.png)
![ecs panel](docs/ecs.png)
-->

## Features

- **Local infrastructure monitoring**
  - n8n (automation engine)
  - Bridge (HTTP bridge)
  - AutoGuard Watchdog (keep-alive)
  - Ollama (local LLM service)
  - Local vector store (FAISS + SQLite — reads per-collection counts)
- **ECS platform monitoring (over SSH tunnel)**
  - ECS health check
  - ECS three-container status
  - ECS host resources
  - ECS scheduled tasks
  - ECS vector store counts
- **Tunnel indicator** — shows SSH tunnel state, one-click reconnect.
- **Polling refresh** — collects every 60s by default, manual refresh supported.

## Tech stack

Electron + React 18 + TypeScript + Zustand + Tailwind CSS + Vite. The local vector store is read via `better-sqlite3`; the SSH tunnel uses the system `ssh` command (`child_process`).

## Quick start

```bash
npm install
npm run dev      # Vite dev server + Electron
npm run build    # build artifacts (dist/ + dist-electron/)
```

The local-only modules need **no external service**. The ECS panel only lights up once you configure the SSH target below.

> The `dev` / `build` scripts run through `cross-env NODE_OPTIONS=` to clear inherited env vars and avoid conflicts.

On Windows, `dashboard-start.vbs` launches the built production app in a hidden window (run `npm run build` first).

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `AGENT_MONITOR_SSH_HOST` | ECS host (SSH tunnel target) | `127.0.0.1` |
| `AGENT_MONITOR_SSH_PORT` | ECS SSH port | `22` |
| `AGENT_MONITOR_SSH_USER` | ECS SSH user | `root` |
| `AGENT_MONITOR_ADMIN_TOKEN` | admin-daemon Bearer token (documented placeholder) | `admin-key-change-me` |
| `FAISS_INDEX_DB` | Local vector store SQLite file path | `~/.ai-faiss-index/vector_store.db` |

> The SSH private key is read from `~/.ssh/id_ed25519` by default.

## License

MIT — see [LICENSE](LICENSE).

Copyright (c) 2026 buxiangcifan123

---

# Agent Monitor Dashboard（中文说明）

> 基于 Electron + React + TypeScript 的 AI 体系监控看板

一眼看清整套 AI 基础设施的健康度：本地展示 n8n / bridge / watchdog / Ollama / 本地向量库的状态，并通过 SSH 隧道监控远端 ECS 平台上运行的服务。

## 功能概览

- **本地基础设施监控** — n8n（自动化引擎）、Bridge（HTTP 桥接器）、AutoGuard Watchdog（保活守护）、Ollama（本地大模型服务）、本地向量库（FAISS + SQLite，读取各集合条数）。
- **ECS 平台监控（经 SSH 隧道）** — ECS 健康检查、三容器状态、宿主资源、定时任务、向量库条数。
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

> 仅本地监控模块无需任何外部服务即可运行；ECS 面板需配置下方 SSH 目标后生效。
> `npm run dev` / `build` 脚本中已通过 `cross-env NODE_OPTIONS=` 清空环境变量，避免与外部环境冲突。

Windows 下可用 `dashboard-start.vbs` 以隐藏窗口方式启动已构建的生产版本（需先 `npm run build`）。

## 环境变量

（字段说明见上方英文部分 Environment variables）

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
