import { StatusCard } from './StatusCard'
import type { CollectorResult } from '../types'

interface ContainerInfo { name: string; state: string; status: string; image?: string }

export function EcsContainersPanel({ result }: { result: CollectorResult }) {
  const containers = ((result.data as any)?.containers || []) as ContainerInfo[]
  return (
    <StatusCard result={result}>
      {containers.length === 0 && <div className="text-slate-500">无容器数据</div>}
      {containers.map((c, i) => {
        const short = String(c.name || '').replace('agent-platform-', '').replace(/-1$/, '')
        const running = c.state === 'running' || String(c.status).startsWith('Up')
        return (
          <div key={i} className="flex justify-between gap-2">
            <span className="truncate">{short}</span>
            <span className={running ? 'text-emerald-400' : 'text-red-400'}>{c.status || c.state}</span>
          </div>
        )
      })}
    </StatusCard>
  )
}
