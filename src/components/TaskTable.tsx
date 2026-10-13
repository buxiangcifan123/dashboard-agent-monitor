import { StatusCard } from './StatusCard'
import type { CollectorResult } from '../types'

interface TaskRun { name: string; time: string; ok: boolean; raw: string }

export function TaskTable({ result }: { result: CollectorResult }) {
  const d = result.data as any
  const recent: TaskRun[] = d?.recent || []
  const weekly: string = d?.weeklyLastRun || ''
  return (
    <StatusCard result={result}>
      {recent.length === 0 && <div className="text-slate-500">无执行记录</div>}
      {recent.map((r, i) => (
        <div key={i} className="flex justify-between gap-2">
          <span className="truncate">{r.name}</span>
          <span className={r.ok ? 'text-emerald-400' : 'text-red-400'}>
            {r.ok ? '✅' : '❌'} {r.time}
          </span>
        </div>
      ))}
      {weekly && <div className="mt-2 text-slate-400">周报上次运行: {weekly}</div>}
    </StatusCard>
  )
}
