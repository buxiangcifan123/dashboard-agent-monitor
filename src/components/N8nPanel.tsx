import { StatusCard } from './StatusCard'
import type { CollectorResult } from '../types'

interface N8nData {
  tcpUp?: boolean
  workflows?: { id: string; name: string; active: number }[]
  recentExecutions?: { id: string; status: string; startedAt: string }[]
  errorWorkflows?: { name: string; count: number; latest: string }[]
  dbError?: string
}

export function N8nPanel({ result }: { result: CollectorResult }) {
  const d = (result.data as N8nData) || {}
  const wfs = d.workflows || []
  const errs = d.errorWorkflows || []
  const recent = d.recentExecutions || []
  return (
    <StatusCard result={result}>
      <div className="space-y-1">
        {wfs.map((w, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span className="truncate">{w.name}</span>
            <span className={w.active ? 'text-emerald-400' : 'text-slate-500'}>{w.active ? 'active' : 'off'}</span>
          </div>
        ))}
      </div>
      {errs.length > 0 && (
        <div className="mt-2 rounded bg-red-500/10 p-2">
          <div className="text-red-400 font-medium mb-1">连续错误:</div>
          {errs.map((e, i) => (
            <div key={i} className="text-red-300/80">
              {e.name} · {e.count} 次 · {e.latest}
            </div>
          ))}
        </div>
      )}
      {recent.length > 0 && (
        <div className="mt-2">
          <div className="text-slate-400 mb-1">最近执行:</div>
          {recent.slice(0, 5).map((r, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className={r.status === 'error' ? 'text-red-400' : 'text-emerald-400'}>{r.status}</span>
              <span className="text-slate-500 truncate">{r.startedAt}</span>
            </div>
          ))}
        </div>
      )}
    </StatusCard>
  )
}
