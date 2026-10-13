import type { Alert } from '../types'

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null
  return (
    <div className="space-y-2 mb-4">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            a.level === 'error'
              ? 'bg-red-500/15 text-red-300 border border-red-500/30'
              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
          }`}
        >
          <span>⚠</span>
          <span className="font-medium shrink-0">[{a.source}]</span>
          <span className="flex-1">{a.message}</span>
        </div>
      ))}
    </div>
  )
}
