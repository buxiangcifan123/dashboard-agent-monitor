import type { ReactNode } from 'react'
import type { CollectorResult, Status } from '../types'

const STYLE: Record<Status, { dot: string; border: string; label: string; text: string }> = {
  up: { dot: 'bg-emerald-500', border: 'border-emerald-500/40', label: '正常', text: 'text-emerald-400' },
  down: { dot: 'bg-red-500', border: 'border-red-500/40', label: '故障', text: 'text-red-400' },
  warn: { dot: 'bg-amber-500', border: 'border-amber-500/40', label: '异常', text: 'text-amber-400' },
  unknown: { dot: 'bg-slate-500', border: 'border-slate-600/40', label: '未知', text: 'text-slate-500' },
}

export function StatusCard({ result, children }: { result: CollectorResult; children?: ReactNode }) {
  const s = STYLE[result.status] || STYLE.unknown
  return (
    <div className={`rounded-xl border ${s.border} bg-slate-800/40 p-4`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">{result.label}</span>
        <span className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
          <span className={`text-xs ${s.text}`}>{s.label}</span>
        </span>
      </div>
      {result.error && <div className="mt-2 text-xs text-red-400/80 break-all">{result.error}</div>}
      {children && <div className="mt-3 space-y-1 text-xs text-slate-300">{children}</div>}
    </div>
  )
}
