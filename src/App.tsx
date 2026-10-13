import { useEffect } from 'react'
import { useMonitorStore } from './store/useMonitorStore'
import { AlertBanner } from './components/AlertBanner'
import { TunnelIndicator } from './components/TunnelIndicator'
import { StatusCard } from './components/StatusCard'
import { DataPanel } from './components/DataPanel'
import { N8nPanel } from './components/N8nPanel'
import { VectorPanel } from './components/VectorPanel'
import { EcsContainersPanel } from './components/EcsContainersPanel'
import { TaskTable } from './components/TaskTable'
import type { CollectorResult } from './types'

const POLL_SEC = 60
const EMPTY = (id: string, label: string): CollectorResult => ({ id, label, status: 'unknown', checkedAt: 0 })
const find = (rs: CollectorResult[], id: string) => rs.find((r) => r.id === id)

export default function App() {
  const snapshot = useMonitorStore((s) => s.snapshot)
  const loading = useMonitorStore((s) => s.loading)
  const lastUpdated = useMonitorStore((s) => s.lastUpdated)
  const tunnelStatus = useMonitorStore((s) => s.tunnelStatus)
  const refresh = useMonitorStore((s) => s.refresh)
  const setTunnel = useMonitorStore((s) => s.setTunnel)

  useEffect(() => {
    refresh()
    const unsub = window.dashAPI.onTunnelChange((s) => setTunnel(s))
    const t = setInterval(() => refresh(), POLL_SEC * 1000)
    return () => { unsub(); clearInterval(t) }
  }, [refresh, setTunnel])

  const local = snapshot?.local || []
  const ecs = snapshot?.ecs || []
  const alerts = snapshot?.alerts || []

  return (
    <div className="min-h-screen p-5 max-w-[1600px] mx-auto">
      {/* 顶栏 */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-100">Agent Monitor</h1>
        <div className="flex items-center gap-4">
          <TunnelIndicator status={tunnelStatus} onReconnect={() => window.dashAPI.reconnect()} />
          <span className="text-xs text-slate-500">
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--:--'}
          </span>
          <button
            onClick={() => refresh()}
            className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sm text-slate-100"
          >
            {loading ? '采集中…' : '刷新'}
          </button>
        </div>
      </header>

      <AlertBanner alerts={alerts} />

      {/* 本地基础设施区 */}
      <Section title="本地基础设施">
        <N8nPanel result={find(local, 'n8n') || EMPTY('n8n', 'n8n (5678)')} />
        <DataPanel result={find(local, 'bridge') || EMPTY('bridge', 'Bridge (8765)')} />
        <DataPanel result={find(local, 'watchdog') || EMPTY('watchdog', 'AutoGuard Watchdog')} />
        <DataPanel result={find(local, 'ollama') || EMPTY('ollama', 'Ollama (11434)')} />
        <VectorPanel result={find(local, 'vectorLocal') || EMPTY('vectorLocal', '本地向量库 (FAISS)')} />
      </Section>

      {/* ECS 平台区 */}
      <Section title="ECS 平台">
        <DataPanel result={find(ecs, 'ecsHealth') || EMPTY('ecsHealth', 'ECS 健康')} />
        <EcsContainersPanel result={find(ecs, 'ecsContainers') || EMPTY('ecsContainers', 'ECS 三容器')} />
        <DataPanel result={find(ecs, 'ecsSystem') || EMPTY('ecsSystem', 'ECS 宿主资源')} />
        <TaskTable result={find(ecs, 'ecsTasks') || EMPTY('ecsTasks', 'ECS 定时任务')} />
        <VectorPanel result={find(ecs, 'ecsStats') || EMPTY('ecsStats', 'ECS 向量库条数')} />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>
    </section>
  )
}
