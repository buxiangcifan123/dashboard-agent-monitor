// ECS 经 SSH 隧道映射到本地后的地址/端口
export const ECS_HOST = '127.0.0.1'
export const ECS_PORTS = { admin: 9090, api: 8080, chroma: 8000 }

// admin-daemon 的 Bearer token(见 ecs_tasks/admin-daemon.py,默认 admin-key-change-me)。
// 用环境变量 AGENT_MONITOR_ADMIN_TOKEN 覆盖,或改这里。
export const ADMIN_TOKEN = process.env.AGENT_MONITOR_ADMIN_TOKEN || 'admin-key-change-me'

// 隧道是否就绪 —— 由 tunnel.ts 在连接状态变化时 set,各 ECS 采集器据此决定采集还是返回 unknown
let tunnelReady = false
export function setTunnelReady(v: boolean) { tunnelReady = v }
export function isTunnelReady() { return tunnelReady }

export function adminHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${ADMIN_TOKEN}` }
}
