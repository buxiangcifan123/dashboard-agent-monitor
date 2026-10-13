import { spawn, type ChildProcess } from 'child_process'
import path from 'path'
import os from 'os'
import { setTunnelReady } from './collectors/ecs-config'

export type TunnelState = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface TunnelStatus {
  state: TunnelState
  message?: string
  since: number
}

// ECS SSH 隧道配置(把 admin:9090 / api:8080 / chromadb:8000 映射到本地)
const SSH_HOST = process.env.AGENT_MONITOR_SSH_HOST || '127.0.0.1'
const SSH_PORT = Number(process.env.AGENT_MONITOR_SSH_PORT || 22)
const SSH_USER = process.env.AGENT_MONITOR_SSH_USER || 'root'
const KEY_PATH = path.join(os.homedir(), '.ssh', 'id_ed25519')
const FORWARDS = ['9090:127.0.0.1:9090', '8080:127.0.0.1:8080', '8000:127.0.0.1:8000']

let proc: ChildProcess | null = null
let state: TunnelState = 'disconnected'
let stateSince = Date.now()
let msg: string | undefined
let retryTimer: NodeJS.Timeout | null = null
let connectedTimer: NodeJS.Timeout | null = null
let backoff = 1000
let stopped = false
const listeners: Array<(s: TunnelStatus) => void> = []

function emit() {
  const st: TunnelStatus = { state, message: msg, since: stateSince }
  for (const l of listeners) l(st)
}

function setState(s: TunnelState, message?: string) {
  state = s
  msg = message
  stateSince = Date.now()
  setTunnelReady(s === 'connected')
  emit()
}

export function getTunnelStatus(): TunnelStatus {
  return { state, message: msg, since: stateSince }
}

export function onTunnelChange(cb: (s: TunnelStatus) => void): () => void {
  listeners.push(cb)
  // 立即推一次当前状态给新订阅者
  cb(getTunnelStatus())
  return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1) }
}

function spawnTunnel() {
  if (stopped) return
  setState('connecting')
  const args = [
    '-N',
    ...FORWARDS.flatMap((f) => ['-L', f]),
    '-p', String(SSH_PORT),
    '-i', KEY_PATH,
    '-o', 'ConnectTimeout=10',
    '-o', 'ServerAliveInterval=30',
    '-o', 'ServerAliveCountMax=3',
    '-o', 'StrictHostKeyChecking=accept-new',
    `${SSH_USER}@${SSH_HOST}`,
  ]
  try {
    proc = spawn('ssh', args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
  } catch (e: any) {
    setState('error', `spawn 失败: ${e.message}`)
    scheduleRetry()
    return
  }

  // ssh -N 起来后稳定 1.5s 不退出即认为隧道就绪
  connectedTimer = setTimeout(() => {
    if (proc && !proc.killed && state === 'connecting') {
      setState('connected', '隧道已连通')
      backoff = 1000
    }
  }, 1500)

  proc.on('error', (e) => {
    if (connectedTimer) clearTimeout(connectedTimer)
    setState('error', `ssh 未找到或启动失败: ${e.message}。确认系统装有 OpenSSH(ssh 在 PATH)`)
    scheduleRetry()
  })
  proc.on('exit', (code) => {
    if (connectedTimer) clearTimeout(connectedTimer)
    if (stopped) { setState('disconnected'); return }
    setState('error', `ssh 退出(code=${code})`)
    scheduleRetry()
  })
}

function scheduleRetry() {
  if (stopped) return
  if (retryTimer) clearTimeout(retryTimer)
  backoff = Math.min(backoff * 2, 30000)
  retryTimer = setTimeout(() => spawnTunnel(), backoff)
}

export function startTunnel() {
  stopped = false
  backoff = 1000
  spawnTunnel()
}

export function reconnectTunnel() {
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
  if (connectedTimer) { clearTimeout(connectedTimer); connectedTimer = null }
  if (proc && !proc.killed) { try { proc.kill() } catch { /* ignore */ } }
  backoff = 1000
  spawnTunnel()
}

export function stopTunnel() {
  stopped = true
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
  if (connectedTimer) { clearTimeout(connectedTimer); connectedTimer = null }
  if (proc && !proc.killed) { try { proc.kill() } catch { /* ignore */ } }
  setState('disconnected')
}
