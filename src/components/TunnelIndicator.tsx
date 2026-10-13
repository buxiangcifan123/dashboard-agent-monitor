import type { TunnelStatus } from '../types'

const MAP: Record<string, { c: string; t: string }> = {
  connected: { c: 'bg-emerald-500', t: '隧道已连' },
  connecting: { c: 'bg-amber-500 animate-pulse', t: '连接中' },
  error: { c: 'bg-red-500', t: '隧道断开' },
  disconnected: { c: 'bg-slate-500', t: '未连接' },
}

export function TunnelIndicator({
  status,
  onReconnect,
}: {
  status: TunnelStatus | null
  onReconnect: () => void
}) {
  const s = status ? MAP[status.state] : MAP.disconnected
  return (
    <button onClick={onReconnect} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white" title="点击重连">
      <span className={`h-2.5 w-2.5 rounded-full ${s.c}`} />
      <span>{s.t}</span>
      {status?.message && status.state === 'error' && (
        <span className="text-xs text-red-400/70 truncate max-w-[280px]">{status.message}</span>
      )}
    </button>
  )
}
