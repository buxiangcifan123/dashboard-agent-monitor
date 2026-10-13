import { result, fetchJson } from './utils'
import { ECS_HOST, ECS_PORTS, adminHeaders, isTunnelReady } from './ecs-config'
import type { CollectorResult } from './types'

// GET :9090/containers → docker ps,取 agent-platform 三个容器的状态+运行时长
export async function collectEcsContainers(): Promise<CollectorResult> {
  const id = 'ecsContainers', label = 'ECS 三容器'
  if (!isTunnelReady()) return result(id, label, 'unknown', { reason: 'tunnel down' })
  try {
    const raw = await fetchJson(`http://${ECS_HOST}:${ECS_PORTS.admin}/containers`, { headers: adminHeaders() }, 8000)
    // 兼容三种返回:数组 / NDJSON 字符串 / {containers:[...]}
    let containers: any[] = []
    if (Array.isArray(raw)) containers = raw
    else if (typeof raw === 'string') {
      containers = raw.split('\n').filter(Boolean).map((l) => {
        try { return JSON.parse(l) } catch { return null }
      }).filter(Boolean) as any[]
    } else if (raw && Array.isArray(raw.containers)) containers = raw.containers

    const ours = containers.filter((c) => String(c.Names || c.Name || '').includes('agent-platform'))
    const mapped = ours.map((c) => ({
      name: c.Names || c.Name,
      state: c.State,
      status: c.Status,
      image: c.Image,
    }))
    const allRunning = mapped.length >= 3 && mapped.every((c) => c.state === 'running' || String(c.status).startsWith('Up'))
    const status = mapped.length === 0 ? 'down' : (allRunning ? 'up' : 'warn')
    return result(id, label, status, { containers: mapped, count: mapped.length })
  } catch (e: any) {
    return result(id, label, 'down', {}, e.message)
  }
}
