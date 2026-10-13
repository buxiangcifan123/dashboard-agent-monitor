import { result, fetchJson } from './utils'
import { ECS_HOST, ECS_PORTS, adminHeaders, isTunnelReady } from './ecs-config'
import type { CollectorResult } from './types'

// ECS 三组件存活:admin-daemon(9090) / api(8080) / chromadb(8000)
export async function collectEcsHealth(): Promise<CollectorResult> {
  const id = 'ecsHealth', label = 'ECS 健康'
  if (!isTunnelReady()) return result(id, label, 'unknown', { reason: 'tunnel down' })

  const [admin, api, chroma] = await Promise.allSettled([
    fetchJson(`http://${ECS_HOST}:${ECS_PORTS.admin}/health`, { headers: adminHeaders() }, 5000),
    fetchJson(`http://${ECS_HOST}:${ECS_PORTS.api}/health`, {}, 5000),
    fetchJson(`http://${ECS_HOST}:${ECS_PORTS.chroma}/api/v1/heartbeat`, {}, 5000),
  ])
  const ok = (p: PromiseSettledResult<any>) => p.status === 'fulfilled'
  const adminUp = ok(admin)
  const apiUp = ok(api)
  const chromaUp = ok(chroma)
  const upCount = [adminUp, apiUp, chromaUp].filter(Boolean).length
  const status = upCount === 3 ? 'up' : (upCount === 0 ? 'down' : 'warn')
  return result(id, label, status, {
    adminDaemon: adminUp,
    api: apiUp,
    chromadb: chromaUp,
    apiProvider: apiUp ? (api as PromiseFulfilledResult<any>).value?.llm_provider : undefined,
  })
}
