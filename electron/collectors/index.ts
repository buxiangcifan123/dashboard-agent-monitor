import type { CollectorResult, MonitorSnapshot, Alert } from './types'
import { collectN8n } from './n8n'
import { collectBridge } from './bridge'
import { collectWatchdog } from './watchdog'
import { collectOllama } from './ollama'
import { collectVectorLocal } from './vectorLocal'
import { collectEcsHealth } from './ecsHealth'
import { collectEcsContainers } from './ecsContainers'
import { collectEcsSystem } from './ecsSystem'
import { collectEcsTasks } from './ecsTasks'
import { collectEcsStats } from './ecsStats'

const localCollectors: Array<{ id: string; collect: () => Promise<CollectorResult> }> = [
  { id: 'n8n', collect: collectN8n },
  { id: 'bridge', collect: collectBridge },
  { id: 'watchdog', collect: collectWatchdog },
  { id: 'ollama', collect: collectOllama },
  { id: 'vectorLocal', collect: collectVectorLocal },
]

const ecsCollectors: Array<{ id: string; collect: () => Promise<CollectorResult> }> = [
  { id: 'ecsHealth', collect: collectEcsHealth },
  { id: 'ecsContainers', collect: collectEcsContainers },
  { id: 'ecsSystem', collect: collectEcsSystem },
  { id: 'ecsTasks', collect: collectEcsTasks },
  { id: 'ecsStats', collect: collectEcsStats },
]

// 并行跑所有采集器,聚合为一份快照 + 生成告警
export async function collectAll(): Promise<MonitorSnapshot> {
  const [local, ecs] = await Promise.all([
    Promise.all(localCollectors.map((c) => c.collect())),
    Promise.all(ecsCollectors.map((c) => c.collect())),
  ])
  const alerts = buildAlerts(local, ecs)
  return { local, ecs, alerts, collectedAt: Date.now() }
}

function buildAlerts(local: CollectorResult[], ecs: CollectorResult[]): Alert[] {
  const alerts: Alert[] = []
  // n8n 连续执行失败
  const n8n = local.find((r) => r.id === 'n8n')
  const ew = (n8n?.data as any)?.errorWorkflows as Array<{ name: string; count: number; latest: string }> | undefined
  if (ew && ew.length) {
    for (const w of ew) {
      alerts.push({ level: 'error', source: 'n8n', message: `${w.name} 连续 ${w.count} 次执行失败(最近 ${w.latest})` })
    }
  }
  // 任何 down 的组件
  for (const r of [...local, ...ecs]) {
    if (r.status === 'down') {
      alerts.push({ level: 'error', source: r.label, message: `${r.label} 不可用${r.error ? ': ' + r.error : ''}` })
    }
  }
  return alerts
}
