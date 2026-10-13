import { result, fetchText } from './utils'
import { ECS_HOST, ECS_PORTS, adminHeaders, isTunnelReady } from './ecs-config'
import type { CollectorResult } from './types'

// GET :9090/system → free -h / df -h 原始文本(或 JSON 包装)
export async function collectEcsSystem(): Promise<CollectorResult> {
  const id = 'ecsSystem', label = 'ECS 宿主资源'
  if (!isTunnelReady()) return result(id, label, 'unknown', { reason: 'tunnel down' })
  try {
    const txt = await fetchText(`http://${ECS_HOST}:${ECS_PORTS.admin}/system`, { headers: adminHeaders() }, 8000)
    let data: any = txt
    try { data = JSON.parse(txt) } catch { /* 纯文本,原样保留 */ }
    return result(id, label, 'up', { raw: data })
  } catch (e: any) {
    return result(id, label, 'warn', {}, e.message)
  }
}
