import { StatusCard } from './StatusCard'
import type { CollectorResult } from '../types'

// 通用面板:把 result.data 的扁平标量字段展示为 key-value
export function DataPanel({ result }: { result: CollectorResult }) {
  const d = (result.data as Record<string, unknown>) || {}
  const rows: { k: string; v: string }[] = []
  for (const [k, v] of Object.entries(d)) {
    if (v == null) continue
    if (typeof v === 'object') continue // 跳过嵌套对象/数组
    let s = String(v)
    if (s.length > 200) s = s.slice(0, 200) + '…'
    rows.push({ k, v: s })
  }
  return (
    <StatusCard result={result}>
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between gap-2">
          <span className="text-slate-400">{r.k}</span>
          <span className="text-right truncate">{r.v}</span>
        </div>
      ))}
    </StatusCard>
  )
}
