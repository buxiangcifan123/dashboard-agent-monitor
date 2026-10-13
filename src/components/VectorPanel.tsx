import { StatusCard } from './StatusCard'
import type { CollectorResult } from '../types'

// 通用集合条数面板:兼容 [{name,count}] 与 {name:count}
export function VectorPanel({ result }: { result: CollectorResult }) {
  const data = result.data as any
  let entries: { name: string; count: number }[] = []
  const c = data?.counts ?? data?.collections
  if (Array.isArray(c)) {
    entries = c.map((x: any) => ({ name: x.name, count: x.count }))
  } else if (c && typeof c === 'object') {
    entries = Object.entries(c).map(([name, count]) => ({ name, count: count as number }))
  }
  return (
    <StatusCard result={result}>
      {entries.length === 0 && <div className="text-slate-500">无数据</div>}
      {entries.map((e, i) => (
        <div key={i} className="flex justify-between gap-2">
          <span className="text-slate-300 truncate">{e.name}</span>
          <span className={e.count < 0 ? 'text-red-400' : 'text-slate-100'}>{e.count < 0 ? 'N/A' : e.count}</span>
        </div>
      ))}
    </StatusCard>
  )
}
