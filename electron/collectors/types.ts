// 采集器层共享类型(主进程侧;结构与渲染端 src/types 保持一致)
export type Status = 'up' | 'down' | 'warn' | 'unknown'

export interface CollectorResult {
  id: string
  label: string
  status: Status
  data?: unknown
  error?: string
  checkedAt: number
}

export interface Alert {
  level: 'error' | 'warn'
  source: string
  message: string
}

export interface MonitorSnapshot {
  local: CollectorResult[]
  ecs: CollectorResult[]
  alerts: Alert[]
  collectedAt: number
}

export interface Collector {
  id: string
  label: string
  collect: () => Promise<CollectorResult>
}
