import { result, fetchJson } from './utils'
import { ECS_HOST, ECS_PORTS, isTunnelReady } from './ecs-config'
import type { CollectorResult } from './types'

// GET :8080/stats → ECS 侧 5 个 ChromaDB 集合的条数(需先在 main_v4.py 加该端点)
export async function collectEcsStats(): Promise<CollectorResult> {
  const id = 'ecsStats', label = 'ECS 向量库条数'
  if (!isTunnelReady()) return result(id, label, 'unknown', { reason: 'tunnel down' })
  try {
    const j = await fetchJson(`http://${ECS_HOST}:${ECS_PORTS.api}/stats`, {}, 8000)
    return result(id, label, 'up', j)
  } catch (e: any) {
    return result(id, label, 'warn', {}, 'stats 端点未就绪: ' + e.message)
  }
}
